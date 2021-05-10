import Poker from '@/models/poker';
import { Suit, Combination } from '@/types/poker';

describe('poker tests', () => {
  test(
    'given A/A/2/3/5, when call isOnePair and getPokerCombination, then get true and get OnePair',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('2', Suit.Spade),
        new Poker('3', Suit.Spade),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isOnePair(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.OnePair);
    },
  );

  test(
    'given A/A/2/2/5, when call isTwoPair and getPokerCombination, then get true and TwoPair',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('2', Suit.Spade),
        new Poker('2', Suit.Diamond),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isTwoPair(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.TwoPair);
    },
  );

  test(
    'given A/A/A/2/5, when call isThreeOfAKind and getPokerCombination, then get true and ThreeOfAKind',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('A', Suit.Heart),
        new Poker('2', Suit.Diamond),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isThreeOfAKind(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.ThreeOfAKind);
    },
  );

  test(
    'given 2/3/4/5/6, when call isStraight and getPokerCombination, then get true and Straight',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Spade),
        new Poker('4', Suit.Heart),
        new Poker('5', Suit.Diamond),
        new Poker('6', Suit.Spade),
      ];

      expect(Poker.isStraight(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.Straight);
    },
  );

  test(
    'given 2/3/4/5/7 with club suit, when call isFlush and getPokerCombination, then get true and Flush',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('7', Suit.Club),
      ];

      expect(Poker.isFlush(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.Flush);
    },
  );

  test(
    'given 2/2/2/3/3, when call isFullHouse and getPokerCombination, then get true and FullHouse',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('2', Suit.Diamond),
        new Poker('2', Suit.Heart),
        new Poker('3', Suit.Spade),
        new Poker('3', Suit.Club),
      ];

      expect(Poker.isFullHouse(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.FullHouse);
    },
  );

  test(
    'given 2/2/2/2/7, when call isFourOfAKind and getPokerCombination, then get true and FourOfAKind',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('2', Suit.Diamond),
        new Poker('2', Suit.Heart),
        new Poker('2', Suit.Spade),
        new Poker('7', Suit.Club),
      ];

      expect(Poker.isFourOfAKind(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.FourOfAKind);
    },
  );

  test(
    'given 2/3/4/5/6 with club suit, when call isStraightFlush and getPokerCombination, then get true and StraightFlush',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('6', Suit.Club),
      ];

      expect(Poker.isStraightFlush(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.StraightFlush);
    },
  );

  test(
    'given 2/3/4/5/7, when call isHighCard and getPokerCombination, then get true and HighCard',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('7', Suit.Heart),
      ];

      expect(Poker.isHighCard(pokers)).toBeTruthy();
      expect(Poker.getPokerCombination(pokers)).toBe(Combination.HighCard);
    },
  );
});
