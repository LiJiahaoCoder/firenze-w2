import Pot from '@/models/pot';
import Judge from '@/models/judge';
import Poker from '@/models/poker';
import Player from '@/models/player';
import Operator from '@/models/operator';
import { Round } from '@/types/game';
import { rl } from '@/utils/readline';
import { signalStdout, systemStdout } from '@/utils/console';
import { SuitMap } from '@/constants/poker';
import { Status } from '@/types/player';

export default class Game {
  private readonly _initialBigBlindBidBankRoll: number;
  private readonly _pot;
  private readonly _operator: Operator;
  private readonly _judge: Judge;
  private readonly _pokers: Poker[] = [];
  private readonly _players: Player[];
  private readonly _playersNumber: number;
  private readonly _buttonIndex: number;
  private readonly _button: Player;
  private readonly _smallBlind: Player;
  private readonly _bigBlind?: Player;
  private _round!: Round;
  private _isOver = false;

  constructor (players: Player[], initialBigBlindBidBankRoll: number) {
    if (players.length < 2) {
      throw new Error('牌局至少有两名玩家');
    }

    this._pot = new Pot();
    this._operator = new Operator(this);
    this._judge = new Judge(this, this._operator);
    this._playersNumber = players.length;
    this._initialBigBlindBidBankRoll = initialBigBlindBidBankRoll;
    this._buttonIndex = Math.floor(Math.random() * players.length);
    this._button = players[this._buttonIndex];
    this._smallBlind = players[this.smallBlindIndex];
    this._bigBlind = this.bigBlindIndex === -1 ? undefined : players[this.bigBlindIndex];
    this._players = this.initializePlayers(players);
    this._buttonIndex = this._players.length - 1;
    signalStdout(`<- 游戏开始，庄家为：玩家${this._button.name} ->`);
  }

  private get playersNumber () {
    return this._playersNumber;
  }

  private get buttonIndex () {
    return this._buttonIndex;
  }

  public get smallBlindIndex () {
    return this.getSpecifiedPlayerIndex(this.buttonIndex);
  }

  public get bigBlindIndex () {
    if (this.playersNumber === 2) {
      return -1;
    }

    return this.getSpecifiedPlayerIndex(this.smallBlindIndex);
  }

  public get pokers () {
    return this._pokers;
  }

  public get pot () {
    return this._pot.pot;
  }

  public get sidePot () {
    return this._pot.sidePot;
  }

  public get round () {
    return this._round;
  }

  public get judge () {
    return this._judge;
  }

  public get players () {
    return this._players;
  }

  public get isOver () {
    return this._isOver || this.bustedPlayers.length === this.playersNumber - 1;
  }

  public get isFinishCurrentRound () {
    return this.waitingPlayers.length === 0 && !this.operatingPlayer;
  }

  public get initialBigBlindBidBankRoll () {
    return this._initialBigBlindBidBankRoll;
  }

  public get currentPotCount () {
    return this._pot.currentPotCount;
  }

  public get currentOperations () {
    return this._operator.currentOperations;
  }

  public get operatingPlayer () {
    return this.players.find(p => p.status === Status.Operating) ?? null;
  }

  public get operatedPlayers () {
    return this.players.filter(p => p.status === Status.Operated);
  }

  public get waitingPlayers () {
    return this.players.filter(p => p.status === Status.Waiting);
  }

  public get bustedPlayers () {
    return this.players.filter(p => p.status === Status.Busted);
  }

  public get unBustedPlayers () {
    return this.players.filter(p => p.status !== Status.Busted);
  }

  private getSpecifiedPlayerIndex(index: number) {
    return index + 1 + 1 <= this.playersNumber ? index + 1 : 0;
  }

  private initializePlayers (players: Player[]) {
    const _players: Player[] = [];

    _players.push(this._smallBlind);
    if (this._bigBlind) {
      _players.push(this._bigBlind);
    }

    if (this.buttonIndex > this.bigBlindIndex) {
      _players.push(...players.slice(this.bigBlindIndex + 1, this.buttonIndex));
    } else {
      _players.push(...players.slice(this.bigBlindIndex + 1));
      _players.push(...players.slice(0, this.buttonIndex));
    }

    _players.push(this._button);

    return _players;
  }

  private static addBustedPlayer (player: Player) {
    player.status = Status.Busted;
  }

  public increasePot (count: number) {
    this._pot.increasePot(this.round, count);
  }

  public updatePlayerAndPot (count?: number, isBust = false, cb?: () => void) {
    if (count !== undefined) {
      if (count === this.operatingPlayer!.bankRoll) {
        this.updateSidePot();
      }

      this.operatingPlayer!.bid(count);
      this.increasePot(count);
      systemStdout(`${this.operatingPlayer!.name}下注${count}，当前底池金额：${this.currentPotCount}，${this.operatingPlayer!.name}手中还有筹码：${this.operatingPlayer!.bankRoll}`);
    }

    if (isBust) {
      systemStdout(`${this.operatingPlayer!.name}弃牌，当前底池金额：${this.currentPotCount}`);
      Game.addBustedPlayer(this.operatingPlayer!);
    }

    if (count === undefined && !isBust && !cb) {
      systemStdout(`${this.operatingPlayer!.name}过牌，当前底池金额：${this.currentPotCount}`);
    }

    if (cb) {
      cb();
    } else {
      this.updateOperatingPlayer();
    }
  }

  public updateSidePot () {
    this._pot.setSidePot(this.operatingPlayer!.id, this.operatingPlayer!.bankRoll * this.players.length);
  }

  public setRound (round: Round) {
    this._round = round;
  }

  public initializeRoundRoles() {
    this.initializeWaitingPlayers();
    this.resetOperatedPlayersToWaiting();
    this.updateOperatingPlayer();
  }

  public updateOperatingPlayer () {
    const index = this.players.findIndex(p => p.status === Status.Operating);
    const waitingPlayer = this.players.slice(index).find(p => p.status === Status.Waiting);

    if (index === -1) {
      this.waitingPlayers[0].status = Status.Operating;
      return;
    }

    if (!waitingPlayer) {
      if (this.waitingPlayers.length > 0) {
        this.players[index].status = Status.Operated;
        this.waitingPlayers[0].status = Status.Operating;
        return;
      } else {
        this.players[index].status = Status.Operated;
        return;
      }
    }

    this.players[index].status = Status.Operated;
    waitingPlayer.status = Status.Operating;
  }

  public updateOperatedPlayer () {
    this.operatingPlayer!.status = Status.Operated;
  }

  public initializeWaitingPlayers () {
    this.players.filter(p => p.status !== Status.Busted && p.status !== Status.Finished && p.bankRoll !== 0)
      .forEach(p => p.status = Status.Waiting);
  }

  public setCommonPokers (pokers: Poker[]) {
    this._pokers.push(...pokers);
  }

  public resetOperatedPlayersToWaiting () {
    this.operatedPlayers.forEach(p => p.status = Status.Waiting);
  }

  public async preFlop () {
    await this.judge.preFlop();
  }

  public async flop () {
    await this.judge.flop();
  }

  public async turn () {
    await this.judge.turn();
  }

  public async river () {
    await this.judge.river();
  }

  public call () {
    this._operator.call();
  }

  public raise () {
    this._operator.raise();
  }

  public check () {
    this._operator.check();
  }

  public fold () {
    this._operator.fold();
  }

  public allIn () {
    this._operator.allIn();
  }

  private settle () {
    let winners = this.judge.settle();

    if (winners.every(winner => this.sidePot[winner] === undefined)) {
      const increaseBankRollCount = this.currentPotCount / winners.length;

      winners.forEach(winner => {
        this.players.find(p => p.id === winner)!.increaseBankRoll(increaseBankRollCount);
      });

      systemStdout(`胜者：${winners.map(
        winner => `${this.players.find(p => p.id === winner)!.name}`
      ).join('/')}`);
    } else if (winners.every(winner => this.sidePot[winner] !== undefined)) {
      const ids = Object.keys(this.sidePot);
      const increaseCount: Record<string, number> = {};

      winners = this.players.sort(
        (a, b) => a.bankRoll - b.bankRoll
      ).map(p => p.id)
        .filter(id => winners.includes(id));

      winners.forEach(winner => {
        let increaseBankRollCount = 0;

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (i === 0) {
            increaseBankRollCount = this.sidePot[id];
          } else {
            increaseBankRollCount = this.sidePot[id] - this.sidePot[ids[i - 1]];
          }
        }

        increaseCount[winner] = increaseBankRollCount;
        this.players.find(p => p.id === winner)!.increaseBankRoll(increaseBankRollCount);
      });

      systemStdout(`胜者：${winners.map(
        winner => `${this.players.find(p => p.id === winner)!.name}`
      ).join('/')}`);
    }

    systemStdout(`公共牌：${this._pokers.map(p => `${SuitMap[p.suit]}  ${p.value}`).join('/')}`);
    this.unBustedPlayers.forEach(p => {
      systemStdout(`${p.name}牌：${p.pokers.map(poker => `${SuitMap[poker.suit]}  ${poker.value}`).join(`/`)}`);
    });
    this.bustedPlayers.forEach(p => {
      systemStdout(`${p.name}牌：${p.pokers.map(poker => `${SuitMap[poker.suit]}  ${poker.value}`).join(`/`)}`);
    });
  }

  public async start () {
    this.judge.shuffle();

    await this.preFlop();
    await this.flop();
    await this.turn();
    await this.river();

    this.settle();
    signalStdout('<- 游戏结束 ->');
    rl.close();
  }

  public destroy () {
    this._isOver = true;
  }
};
