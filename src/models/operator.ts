import chalk from 'chalk';
import Game from '@/models/game';
import { Operation, Round } from '@/types/game';
import { rl } from '@/utils/readline';

class Operator {
  private readonly _game: Game;

  constructor (game: Game) {
    this._game = game;
  }

  private get currentCallCount () {
    return this._game.pot[this._game.round][this._game.pot[this._game.round].length - 1];
  }

  public get canCheck () {
    return this._game.pot[this._game.round].every(p => p === 0);
  }

  public get currentOperations () {
    const operations = [Operation.Fold];
    const callCount = this._game.pot[this._game.round][this._game.pot[this._game.round].length - 1];

    if (this.canCheck) {
      operations.push(Operation.Check);
    }

    if (this._game.round !== Round.PreFlop && this.canCheck) {
      operations.push(Operation.Bid);
    }

    if (this._game.operatingPlayer!.bankRoll > 0 && this._game.operatingPlayer!.bankRoll <= callCount) {
      operations.push(Operation.AllIn);
    } else if (!this.canCheck) {
      operations.push(Operation.Call);

      if (this._game.operatingPlayer!.bankRoll >= callCount + this._game.initialBigBlindBidBankRoll) {
        operations.push(Operation.Raise);
      }
    }

    return operations;
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

  public async operate() {
    let command = '';
    while (!this._game.isFinishCurrentRound && !this._game.isOver) {
      try {
        command = String(await rl.question(chalk.cyan(`${this._game.operatingPlayer!.name}开始操作（请输入：${this.currentOperations.join('/')}）：`)));
      } catch {}

      const [action, count] = command.split(' ');

      this.operateSwitchCase(action as Operation, count);
    }
  }

  private bid (count: number) {
    if (!this.currentOperations.includes(Operation.Bid)) {
      throw new Error('当前不可下注任意金额');
    }

    if (count === 0) {
      throw new Error('下注金额应是自然数');
    }

    this._game.updatePlayerAndPot(count);
  }

  public call () {
    if (!this.currentOperations.includes(Operation.Call)) {
      throw new Error('当前不可跟注');
    }

    this._game.updatePlayerAndPot(this.currentCallCount);
  }

  public raise () {
    if (!this.currentOperations.includes(Operation.Raise)) {
      throw new Error('当前不可加注');
    }

    this._game.updatePlayerAndPot(
      this.currentCallCount + this._game.initialBigBlindBidBankRoll,
      false,
      () => {
        this._game.resetOperatedPlayersToWaiting();
        this._game.updateOperatingPlayer();
      }
    );
  }

  public check () {
    if (!this.canCheck) {
      throw new Error('当前不可过牌');
    }

    this._game.updatePlayerAndPot();
  }

  public fold () {
    this._game.updatePlayerAndPot(undefined, true);
  }

  public allIn () {
    if (!this.currentOperations.includes(Operation.AllIn)) {
      throw new Error('当前不可全押');
    }

    this._game.updateSidePot();
    this._game.updatePlayerAndPot(this._game.operatingPlayer!.bankRoll);
  }
}

export default Operator;
