import { Combination, Suit, Value } from '@/types/poker';
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

    const pokerValues = pokers.map(p => ValueMap[p.value]).sort((a, b) => a - b);

    return pokerValues[4] - pokerValues[0] === 4 &&
      pokerValues[3] - pokerValues[1] === 2 &&
      pokerValues[4] + pokerValues[0] === pokerValues[1] * 2 &&
      pokerValues[3] + pokerValues[1] === pokerValues[1] * 2;
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

  public static getPokerCombination (pokers: Poker[]) {
    if (Poker.isHighCard(pokers)) {
      return Combination.HighCard;
    }

    if (Poker.isStraightFlush(pokers)) {
      return Combination.StraightFlush;
    }

    if (Poker.isFullHouse(pokers)) {
      return Combination.FullHouse;
    }

    if (Poker.isFlush(pokers)) {
      return Combination.Flush;
    }

    if (Poker.isStraight(pokers)) {
      return Combination.Straight;
    }

    if (Poker.isOnePair(pokers)) {
      return Combination.OnePair;
    }

    if (Poker.isTwoPair(pokers)) {
      return Combination.TwoPair;
    }

    if (Poker.isThreeOfAKind(pokers)) {
      return Combination.ThreeOfAKind;
    }

    if (Poker.isFourOfAKind(pokers)) {
      return Combination.FourOfAKind;
    }

    return Combination.HighCard;
  }
}
