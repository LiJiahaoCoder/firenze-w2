import { v4 as uuid } from 'uuid';
import Poker from '@/models/poker';

export default class Player {
  private readonly _id: string = uuid();
  private readonly _name: string;
  private _bankRoll: number = 0;
  private _pokers: Poker[] = [];

  constructor(name: string, bankRoll: number) {
    this._name = name;
    this._bankRoll = bankRoll;
  }

  get id () {
    return this._id;
  }

  get name () {
    return this._name;
  }

  get bankRoll () {
    return this._bankRoll;
  }

  get pokers () {
    return this._pokers;
  }

  set pokers (pokers: Poker[]) {
    this._pokers = pokers;
  }

  static initializePlayers (count: number) {
    const players: Player[] = [];

    for (let i = 0; i < count; i++) {
      players.push(new Player(`玩家${i + 1}`, 50));
    }

    return players;
  }

  private decreaseBankRoll (count: number) {
    if (this.bankRoll - count < 0) {
      throw new Error('投注金额不能大于当前手中筹码数');
    }

    this._bankRoll -= count;
  }

  public increaseBankRoll (count: number) {
    if (count < 0) {
      throw new Error('参数应为自然数');
    }

    this._bankRoll += count;
  }

  public bid (count: number) {
    this.decreaseBankRoll(count);
  }
};
