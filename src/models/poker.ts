import { Suit, Value } from '@/types/poker';

export default class Poker {
  private readonly _value: Value;
  private readonly _suit: Suit;

  constructor (value: Value, suit: Suit) {
    this._value = value;
    this._suit = suit;
  }

  get value () {
    return this._value;
  }

  get suit () {
    return this._suit;
  }
};
