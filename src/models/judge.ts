import {
  createASetOfPokers,
  sortCombinations,
  getMaxCombinations,
  getMaxWithSameCombinations,
  getMaxValues,
} from '@/utils/poker';
import Game from '@/models/game';
import Poker from '@/models/poker';
import Player from '@/models/player';
import Operator from '@/models/operator';
import { playerStdout, systemStdout } from '@/utils/console';
import { Round } from '@/types/game';
import { Combination } from '@/types/poker';

const compareSameSuitValueSet = new Set([
  Combination.OnePair,
  Combination.TwoPair,
  Combination.ThreeOfAKind,
  Combination.FullHouse,
  Combination.FourOfAKind,
]);

class Judge {
  private _pokers: Poker[];
  private _game: Game;
  private _operator: Operator;

  constructor (game: Game, operator: Operator) {
    this._pokers = createASetOfPokers();
    this._game = game;
    this._operator = operator;
  }

  private deal(start: number, count: number) {
    return this._pokers.splice(start, count);
  }

  private dealHolePokers() {
    systemStdout('分发底牌...');

    this._game.players.forEach((player) => {
      player.pokers = this.deal(0, 2);
    });

    systemStdout('> 底牌分发完毕');
  }

  private operate(count: number, player?: Player) {
    if (!player) {
      return;
    }

    this._game.updateOperatingPlayer();
    this._game.operatingPlayer!.bid(count);
    this._game.increasePot(count);
    playerStdout(`${player.name}下注：${count}`);
    playerStdout(`当前底池金额：${this._game.currentPotCount}，${player.name}手中还有筹码：${player.bankRoll}`);
    this._game.updateOperatedPlayer();
  }

  private async startCurrentRound(round: Round, pokerCount: number) {
    this._game.setRound(round);
    systemStdout(`-------- ${round} --------`);
    this._game.setCommonPokers(this.deal(0, pokerCount));
    this._game.initializeRoundRoles();

    await this._operator.operate();
  }

  private getWinners () {
    const sortedCombinations = sortCombinations(this._game.unBustedPlayers, this._game.pokers);

    // 比较组合牌类型
    const maxCombinations = getMaxCombinations(sortedCombinations);
    if (maxCombinations.length === 1) {
      return [maxCombinations[0].id];
    }

    // 相同组合类型下比较组合牌的大小
    if (compareSameSuitValueSet.has(maxCombinations[0].combination)) {
      const maxWithSameCombinations = getMaxWithSameCombinations(maxCombinations);

      if (maxWithSameCombinations.length === 1) {
        return [maxWithSameCombinations[0].id];
      }
    }

    // 否则比较最大的牌的牌面
    return getMaxValues(maxCombinations).map(v => v.id);
  }

  public shuffle () {
    systemStdout('洗牌中...');
    this._pokers.sort(() => Math.random() > .5 ? -1 : 1);
    systemStdout('> 洗牌结束');
  }

  public async preFlop () {
    this._game.setRound(Round.PreFlop);
    this._game.initializeWaitingPlayers();

    systemStdout(`-------- ${Round.PreFlop} --------`);
    systemStdout('> 当前底池金额：0');

    this.dealHolePokers();

    const smallBlind = this._game.players[this._game.smallBlindIndex];
    const bigBlind = this._game.players[this._game.bigBlindIndex];
    const bigCount = this._game.initialBigBlindBidBankRoll;

    this.operate(bigCount / 2, smallBlind);
    if (bigBlind) {
      this.operate(bigCount, bigBlind);
    }
    this._game.updateOperatingPlayer();

    await this._operator.operate();
  }

  public async flop () {
    await this.startCurrentRound(Round.Flop, 3);
  }

  public async turn () {
    await this.startCurrentRound(Round.Turn, 1);
  }

  public async river () {
    await this.startCurrentRound(Round.River, 1);
  }

  public settle() {
    return this.getWinners();
  }
}

export default Judge;
