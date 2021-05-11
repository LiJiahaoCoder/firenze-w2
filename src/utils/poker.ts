import Poker from '@/models/poker';
import { Suit, Value, Combination } from '@/types/poker';
import { ValueMap } from '@/constants/poker';
import { C } from '@/utils/math';

export const createASetOfPokers = (): Poker[] => {
  return Object.keys(ValueMap).reduce<Poker[]>((acc, cur) => {
    acc.push(
      new Poker(cur as Value, Suit.Club),
      new Poker(cur as Value, Suit.Diamond),
      new Poker(cur as Value, Suit.Heart),
      new Poker(cur as Value, Suit.Spade),
    );

    return acc;
  }, []);
};

export const getMaxCombination = (pokers: Poker[]): {
  combination: Combination,
  maxValue: number,
  values: Poker[],
} => {
  const maxCombination = C(pokers, 5).sort(
    (a, b) => (
      Poker.getPokerCombination(b) - Poker.getPokerCombination(a)
    ),
  )[0];
  const values = maxCombination.sort(
    (a, b) => (
      ValueMap[b.value] - ValueMap[a.value]
    )
  );

  return {
    values,
    combination: Poker.getPokerCombination(maxCombination),
    maxValue: ValueMap[values[0].value],
  };
};
