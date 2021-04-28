import chalk from 'chalk';
import Poker from '@/models/poker';
import Player from '@/models/player';
import { Pokers } from '@/constants/poker';
import { Operation, Round } from '@/types/game';
import { rl } from '@/utils/readline';

export default class Game {
  private readonly _initialBigBlindBidBankRoll: number;
  private _pot: Record<Round, number[]> = {
    [Round.PreFlop]: [0],
    [Round.Flop]: [0],
    [Round.Turn]: [0],
    [Round.River]: [0],
  };
  private readonly _playersNumber: number;
  private readonly _buttonIndex: number;
  private readonly _pokers: Poker[] = Pokers;
  private readonly _button: Player;
  private readonly _smallBlind: Player;
  private readonly _bigBlind?: Player;
  private readonly _bustedPlayers: Player[] = [];
  private _players: Player[];
  private _operatingPlayer!: Player | null;
  private _operatedPlayers: Player[] = [];
  private  _waitingPlayers: Player[] = [];
  private _round!: Round;
  private _isOver = false;

  constructor (players: Player[], initialBigBlindBidBankRoll: number) {
    if (players.length < 2) {
      throw new Error('牌局至少有两名玩家');
    }

    this._playersNumber = players.length;
    this._initialBigBlindBidBankRoll = initialBigBlindBidBankRoll;
    this._buttonIndex = Math.floor(Math.random() * players.length);
    this._button = players[this._buttonIndex];
    this._smallBlind = players[this.smallBlindIndex];
    this._bigBlind = this.bigBlindIndex === -1 ? undefined : players[this.bigBlindIndex];
    this._players = this.initializePlayers(players);
    console.info(chalk.yellow(`<- 游戏开始，庄家为：玩家${this._button.name} ->`));
  }

  private get playersNumber () {
    return this._playersNumber;
  }

  private get buttonIndex () {
    return this._buttonIndex;
  }

  private get smallBlindIndex () {
    return this.buttonIndex + 1 + 1 <= this.playersNumber ? this.buttonIndex + 1 : 0;
  }

  private get bigBlindIndex () {
    if (this.playersNumber === 2) {
      return -1;
    }

    return this.smallBlindIndex + 1 + 1 <= this.playersNumber ? this.smallBlindIndex + 1 : 0;
  }

  private get canCheck () {
    return this._pot[this._round].every(p => p === 0);
  }

  private get isFinishCurrentRound () {
    return this._waitingPlayers.length === 0 && !this._operatingPlayer;
  }

  public get currentPotCount () {
    const currentPot: number[][] = [];

    for (const key in this._pot) {
      currentPot.push(this._pot[key as Round]);
      if (key === this._round) {
        break;
      }
    }

    return currentPot.reduce((acc, cur) => {
      return acc + cur.reduce((innerAcc, innerCur) => {
        return innerAcc + innerCur;
      }, 0);
    }, 0);
  }

  public get currentOperations () {
    const operations = [Operation.Fold];
    const callCount = this._pot[this._round][this._pot[this._round].length - 1];

    if (this.canCheck) {
      operations.push(Operation.Check);
    }

    if (this._round !== Round.PreFlop && this.canCheck) {
      operations.push(Operation.Bid);
    }

    if (this._operatingPlayer!.bankRoll > 0 && this._operatingPlayer!.bankRoll < callCount) {
      operations.push(Operation.AllIn);
    } else if (!this.canCheck) {
      operations.push(Operation.Call);

      if (this._operatingPlayer!.bankRoll >= callCount + this._initialBigBlindBidBankRoll) {
        operations.push(Operation.Raise);
      }
    }

    return operations;
  }

  public get operatingPlayer () {
    return this._operatingPlayer;
  }

  private deal(start: number, count: number) {
    return this._pokers.splice(start, count);
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

  private initializeWaitingPlayers () {
    this._waitingPlayers = this._players.slice();
  }

  private initializeRoundRoles() {
    this.initializeWaitingPlayers();
    this._operatedPlayers = [];
    this._operatingPlayer = this._waitingPlayers.shift()!;
  }

  private dealHolePokers() {
    console.info(chalk.green('分发底牌...'));

    if (this.buttonIndex === this.playersNumber - 1) {
      this._players.forEach((player) => {
        player.pokers = this.deal(0, 2);
      });
    } else {
      for (let i = 0; i < this.playersNumber; i++) {
        if (i <= this.buttonIndex) {
          this._players[i].pokers = this.deal(
              (this.playersNumber - this.buttonIndex - 1) * 2,
              2
          );
          continue;
        }

        this._players[i].pokers = this.deal(0, 2);
      }
    }

    console.info(chalk.green('> 底牌分发完毕'));
  }

  private increasePot (count: number) {
    if (count < 0) {
      throw new Error('投注金额应为自然数');
    }

    this._pot[this._round].push(count);
  }

  private addOperatedPlayer (player: Player) {
    this._operatedPlayers.push(player);
  }

  private addBustedPlayer (player: Player) {
    const bustedPlayerId = this._players.findIndex((p) => p.id === player.id);
    this._players.splice(bustedPlayerId, 1);
    this._bustedPlayers.push(player);
  }

  private shuffle () {
    console.info(chalk.green('洗牌中...'));
    this._pokers.sort(() => Math.random() > .5 ? -1 : 1);
    console.info(chalk.green('> 洗牌结束'));
  }

  public async preFlop () {
    this._round = Round.PreFlop;
    this.initializeWaitingPlayers();

    console.info(chalk.cyan('-------- 第一轮 --------'));
    console.info(chalk.cyan('> 当前底池金额：0'));

    this.dealHolePokers();

    this._operatingPlayer = this._waitingPlayers.shift()!;
    this._operatingPlayer!.bid(this._initialBigBlindBidBankRoll / 2);
    this.increasePot(this._initialBigBlindBidBankRoll / 2);
    console.info(chalk.cyan(`${this._smallBlind.name}（小盲注）下注：${this._initialBigBlindBidBankRoll / 2}`));
    console.info(chalk.cyan(`当前底池金额：${this.currentPotCount}，${this._smallBlind.name}手中还有筹码：${this._smallBlind.bankRoll}`));
    this._operatedPlayers.push(this._operatingPlayer);

    if (this._bigBlind) {
      this._operatingPlayer = this._waitingPlayers.shift()!;
      this._operatingPlayer!.bid(this._initialBigBlindBidBankRoll);
      this.increasePot(this._initialBigBlindBidBankRoll);
      console.info(chalk.cyan(`${this._bigBlind.name}（大盲注）下注：${this._initialBigBlindBidBankRoll}`));
      console.info(chalk.cyan(`当前底池金额：${this.currentPotCount}，${this._bigBlind.name}手中还有筹码：${this._bigBlind.bankRoll}`));
      this._operatedPlayers.push(this._operatingPlayer);
    }

    this._operatingPlayer = this._waitingPlayers.shift()!;

    await this.operate();
  }

  public async flop () {
    this._round = Round.Flop;
    console.info(chalk.cyan('-------- 第二轮 --------'));
    this._pokers.push(...this.deal(0, 3));
    this.initializeRoundRoles();

    await this.operate();
  }

  public async turn () {
    this._round = Round.Turn;
    console.info(chalk.cyan('-------- 第三轮 --------'));
    this._pokers.push(...this.deal(0, 1));
    this.initializeRoundRoles();

    await this.operate();
  }

  public async river () {
    this._round = Round.River;
    console.info(chalk.cyan('-------- 第四轮 --------'));
    this._pokers.push(...this.deal(0, 1));
    this.initializeRoundRoles();

    await this.operate();
  }

  private async operate() {
    let command = '';
    while (!this.isFinishCurrentRound && !this._isOver) {
      try {
        command = String(await rl.question(chalk.cyan(`${this._operatingPlayer!.name}开始操作（请输入：${this.currentOperations.join('/')}）：`)));
      } catch {}

      const [action, count] = command.split(' ');

      this.operateSwitchCase(action as Operation, count);
    }
  }

  public bid (count: number) {
    if (!this.currentOperations.includes(Operation.Bid)) {
      throw new Error('当前不可下注任意金额');
    }

    if (count === 0) {
      throw new Error('下注金额应是自然数');
    }

    this.updatePlayerAndPot(count);
  }

  public call () {
    if (!this.currentOperations.includes(Operation.Call)) {
      throw new Error('当前不可跟注');
    }

    const callCount = this._pot[this._round][this._pot[this._round].length - 1];
    this.updatePlayerAndPot(callCount);
  }

  public raise () {
    if (!this.currentOperations.includes(Operation.Raise)) {
      throw new Error('当前不可加注');
    }

    const raiseCount = this._pot[this._round][this._pot[this._round].length - 1] + this._initialBigBlindBidBankRoll;
    this.updatePlayerAndPot(raiseCount, false, () => {
      this._waitingPlayers.push(...this._operatedPlayers);
      this._operatingPlayer = this._waitingPlayers.length !== 0 ? this._waitingPlayers.shift()! : null;
      this._operatedPlayers = [];
    });
  }

  public fold () {
    this.updatePlayerAndPot(undefined, true);
  }

  public check () {
    if (!this.canCheck) {
      throw new Error('当前不可过牌');
    }

    this.updatePlayerAndPot();
  }

  public allIn () {
    if (!this.currentOperations.includes(Operation.AllIn)) {
      throw new Error('当前不可全押');
    }

    this.updatePlayerAndPot(this._operatingPlayer!.bankRoll);
  }

  private updatePlayerAndPot (count?: number, isBust = false, cb?: () => void) {
    if (count !== undefined) {
      this._operatingPlayer!.bid(count);
      this.increasePot(count);
    }

    if (isBust) {
      this.addBustedPlayer(this._operatingPlayer!);
    } else {
      this.addOperatedPlayer(this._operatingPlayer!);
    }
    console.info(chalk.cyan(`当前底池金额：${this.currentPotCount}，${this._operatingPlayer!.name}手中还有筹码：${this._operatingPlayer!.bankRoll}`));
    if (cb) {
      cb();
    } else {
      this._operatingPlayer = this._waitingPlayers.length !== 0 ? this._waitingPlayers.shift()! : null;
    }
  }

  private operateSwitchCase (action: Operation, count?: string) {
    switch (action) {
      case Operation.Bid:
        if (!/\d+/.test(String(count))) {
          throw new Error('下注金额应为自然数，金额与\"下注\"之间用空格分隔');
        }
        this.bid(Number(count));
        break;
      case Operation.Call:
        this.call();
        break;
      case Operation.Raise:
        this.raise();
        break;
      case Operation.Check:
        this.check();
        break;
      case Operation.Fold:
        this.fold();
        break;
      case Operation.AllIn:
        this.allIn();
        break;
      default:
        throw new Error('错误操作');
    }
  }

  public async start () {
    this.shuffle();

    await this.preFlop();
    await this.flop();
    await this.turn();
    await this.river();

    console.info(chalk.yellow('<- 游戏结束 ->'))
    rl.close();
  }

  public destroy () {
    this._isOver = true;
  }
};
