import Poker from '@/models/poker';
import { Suit } from '@/types/poker';

describe('poker tests', () => {
  test(
    'given A/A/2/3/5, when call isOnePair, then get true',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('2', Suit.Spade),
        new Poker('3', Suit.Spade),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isOnePair(pokers)).toBeTruthy();
    },
  );

  test(
    'given A/A/2/2/5, when call isTwoPair, then get true',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('2', Suit.Spade),
        new Poker('2', Suit.Diamond),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isTwoPair(pokers)).toBeTruthy();
    },
  );

  test(
    'given A/A/A/2/5, when call isThreeOfAKind, then get true',
    () => {
      const pokers = [
        new Poker('A', Suit.Club),
        new Poker('A', Suit.Spade),
        new Poker('A', Suit.Heart),
        new Poker('2', Suit.Diamond),
        new Poker('5', Suit.Spade),
      ];

      expect(Poker.isThreeOfAKind(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/3/4/5/6, when call isStraight, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Spade),
        new Poker('4', Suit.Heart),
        new Poker('5', Suit.Diamond),
        new Poker('6', Suit.Spade),
      ];

      expect(Poker.isStraight(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/3/4/5/7 with club suit, when call isFlush, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('7', Suit.Club),
      ];

      expect(Poker.isFlush(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/2/2/3/3, when call isFullHouse, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('2', Suit.Diamond),
        new Poker('2', Suit.Heart),
        new Poker('3', Suit.Spade),
        new Poker('3', Suit.Club),
      ];

      expect(Poker.isFullHouse(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/2/2/2/7, when call isFourOfAKind, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('2', Suit.Diamond),
        new Poker('2', Suit.Heart),
        new Poker('2', Suit.Spade),
        new Poker('7', Suit.Club),
      ];

      expect(Poker.isFourOfAKind(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/3/4/5/6 with club suit, when call isStraightFlush, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('6', Suit.Club),
      ];

      expect(Poker.isStraightFlush(pokers)).toBeTruthy();
    },
  );

  test(
    'given 2/3/4/5/7, when call isHighCard, then get true',
    () => {
      const pokers = [
        new Poker('2', Suit.Club),
        new Poker('3', Suit.Club),
        new Poker('4', Suit.Club),
        new Poker('5', Suit.Club),
        new Poker('7', Suit.Heart),
      ];

      expect(Poker.isHighCard(pokers)).toBeTruthy();
    },
  );
});
