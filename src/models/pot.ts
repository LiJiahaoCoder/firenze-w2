import { Round } from '@/types/game';

export default class Pot {
  private readonly _pot: Record<Round, number[]> = {
    [Round.PreFlop]: [0],
    [Round.Flop]: [0],
    [Round.Turn]: [0],
    [Round.River]: [0],
  };

  public get pot () {
    return this._pot;
  }

  public get currentPotCount () {
    let totalPot: number = 0;

    for (const key in this._pot) {
      if (this._pot.hasOwnProperty(key)) {
        totalPot += this._pot[key as Round].reduce((acc, cur) => (acc + cur), 0);
      }
    }

    return totalPot;
  }

  public increasePot (round: Round, count: number) {
    if (count < 0) {
      throw new Error('投注金额应为自然数');
    }

    this._pot[round].push(count);
  }
}
