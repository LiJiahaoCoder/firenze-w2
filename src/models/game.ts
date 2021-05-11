import Pot from '@/models/pot';
import Judge from '@/models/judge';
import Poker from '@/models/poker';
import Player from '@/models/player';
import Operator from '@/models/operator';
import { Round } from '@/types/game';
import { rl } from '@/utils/readline';
import { signalStdout, systemStdout } from '@/utils/console';
import { SuitMap } from '@/constants/poker';

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
  private _operatingPlayer!: Player | null;
  private _operatedPlayers: Player[] = [];
  private  _waitingPlayers: Player[] = [];
  private  _bustedPlayer: Player[] = [];
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
    return this._isOver || this._bustedPlayer.length === this.playersNumber - 1;
  }

  public get isFinishCurrentRound () {
    return (this._waitingPlayers.length === 0 && !this.operatingPlayer);
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
    return this._operatingPlayer;
  }

  public get operatedPlayers () {
    return this._operatedPlayers;
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

  private addOperatedPlayer (player: Player) {
    this._operatedPlayers.push(player);
  }

  private addBustedPlayer (player: Player) {
    const bustedPlayerIndex = this.players.findIndex((p) => p.id === player.id);
    this._players.splice(bustedPlayerIndex, 1);
    this._bustedPlayer.push(player);
  }

  public increasePot (count: number) {
    this._pot.increasePot(this.round, count);
  }

  public updatePlayerAndPot (count?: number, isBust = false, cb?: () => void) {
    if (count !== undefined) {
      if (count === this.operatingPlayer!.bankRoll) {
        this.updateSidePot();
      }

      this._operatingPlayer!.bid(count);
      this.increasePot(count);
      systemStdout(`${this.operatingPlayer!.name}下注${count}，当前底池金额：${this.currentPotCount}，${this.operatingPlayer!.name}手中还有筹码：${this.operatingPlayer!.bankRoll}`);
    }

    if (isBust) {
      this.addBustedPlayer(this._operatingPlayer!);
      systemStdout(`${this.operatingPlayer!.name}弃牌，当前底池金额：${this.currentPotCount}`);
    } else {
      this.addOperatedPlayer(this._operatingPlayer!);
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
    this.setOperatedPlayers([]);
    this.updateOperatingPlayer();
  }

  public updateOperatingPlayer () {
    this._operatingPlayer = this._waitingPlayers.length !== 0 ? this._waitingPlayers.shift()! : null;
  }

  public updateOperatedPlayer () {
    this._operatedPlayers.push(this._operatingPlayer!);
  }

  public initializeWaitingPlayers () {
    this._waitingPlayers = this._players.slice().filter(p => p.bankRoll !== 0);
  }

  public setCommonPokers (pokers: Poker[]) {
    this._pokers.push(...pokers);
  }

  public setWaitingPlayers (players: Player[]) {
    this._waitingPlayers.push(...players);
  }

  public setOperatedPlayers (players: Player[]) {
    this._operatedPlayers = [...players];
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
        winner => `${this.players.find(p => p.id === winner)!.name}（赢 ${increaseBankRollCount}）`
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
          increaseBankRollCount += this.sidePot[id];

          if (id === winner) {
            for (let j = 0; j <= i; j++) {
              this.sidePot[ids[j]] = 0;
            }
            break;
          }
        }

        increaseCount[winner] = increaseBankRollCount;
        this.players.find(p => p.id === winner)!.increaseBankRoll(increaseBankRollCount);
      });

      systemStdout(`胜者：${winners.map(
        winner => `${this.players.find(p => p.id === winner)!.name}（赢 ${increaseCount[winner]}）`
      ).join('/')}`);
    }

    systemStdout(`公共牌：${this._pokers.map(p => `${SuitMap[p.suit]}  ${p.value}`).join('/')}`);
    this.players.forEach(p => {
      systemStdout(`${p.name}牌：${p.pokers.map(poker => `${SuitMap[poker.suit]}  ${poker.value}`).join(`/`)}`);
    });
    this._bustedPlayer.forEach(p => {
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
