import { Suit, Value } from '@/types/poker';
import { ValueMap } from '@/constants/poker';

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

  private static deduplicatePokerValues (pokers: Poker[]) {
    return Array.from(new Set(pokers.map(p => p.value)));
  }

  private static deduplicatePokerSuits (pokers: Poker[]) {
    return Array.from(new Set(pokers.map(p => p.suit)));
  }

  private static getSameValuePokerCount (
    pokers: Poker[],
    count: number,
  ) {
    let _count = 0;
    const deduplicatedPokers = Poker.deduplicatePokerValues(pokers);

    deduplicatedPokers.forEach(value => {
      const sameValuePokerCount = pokers.filter(p => p.value === value).length;

      if (sameValuePokerCount === count) {
        _count++;
      }
    });

    return _count;
  }

  public static isOnePair (pokers: Poker[]) {
    return Poker.getSameValuePokerCount(pokers, 2) === 1;
  }

  public static isTwoPair (pokers: Poker[]) {
    return Poker.getSameValuePokerCount(pokers, 2) === 2;
  }

  public static isThreeOfAKind (pokers: Poker[]) {
    return Poker.getSameValuePokerCount(pokers, 3) === 1;
  }

  public static isStraight (pokers: Poker[]) {
    if (pokers.length !== Poker.deduplicatePokerValues(pokers).length) {
      return false;
    }

    const pokerValues = pokers.map(p => ValueMap[p.value]);

    const sum = pokerValues.reduce((acc, cur) => acc + cur, 0);
    const min = Math.min(...pokerValues);
    const max = Math.max(...pokerValues);

    return (min + max) * 2.5 === sum;
  }

  public static isFlush (pokers: Poker[]) {
    return !Poker.isStraight(pokers) && Poker.deduplicatePokerSuits(pokers).length === 1;
  }

  public static isFullHouse (pokers: Poker[]) {
    return Poker.isOnePair(pokers) && Poker.isThreeOfAKind(pokers);
  }

  public static isFourOfAKind (pokers: Poker[]) {
    return Poker.getSameValuePokerCount(pokers, 4) === 1;
  }

  public static isStraightFlush (pokers: Poker[]) {
    return Poker.isStraight(pokers) && Poker.deduplicatePokerSuits(pokers).length === 1;
  }

  public static isHighCard (pokers: Poker[]) {
    return !(
      Poker.isOnePair(pokers) || Poker.isTwoPair(pokers) ||
      Poker.isThreeOfAKind(pokers) || Poker.isStraight(pokers) ||
      Poker.isFlush(pokers) || Poker.isFullHouse(pokers) ||
      Poker.isFourOfAKind(pokers) || Poker.isStraightFlush(pokers)
    );
  }
}

// export default class Poker {}
