import Poker from '@/models/poker';
import { Suit, Value, Combination } from '@/types/poker';
import { ValueMap } from '@/constants/poker';
import { C } from '@/utils/math';
import Player from '@/models/player';
import { getDuplicatedElement } from '@/utils/index';

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

const getMaxCombination = (pokers: Poker[]): {
  combination: Combination,
  maxValue: number,
  values: Poker[],
} => {
  const maxCombination = C(pokers.sort((a, b) => ValueMap[b.value] - ValueMap[a.value]), 5).sort(
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

export const getMaxCombinations = (sortedCombinations: {
  id: string,
  combination: Combination,
  maxValue: number,
  values: Poker[]
}[]) => {
  return sortedCombinations.filter(c => c.combination === sortedCombinations[0].combination)
};

export const getMaxWithSameCombinations = (maxCombinations: {
  id: string,
  combination: Combination,
  maxValue: number,
  values: Poker[]
}[]) => {
  const duplicatedPokers = maxCombinations.map(c => ({
    values: getDuplicatedElement(c.values.map(p => ValueMap[p.value])).sort((a, b) => b - a),
    id: c.id,
  })).sort((a, b) => b.values[0] - a.values[0]);

  return  duplicatedPokers.filter(p => p.values[0] === duplicatedPokers[0].values[0]);
};

export const getMaxValues = (maxCombinations: {
  id: string,
  combination: Combination,
  maxValue: number,
  values: Poker[]
}[]) => {
  const sortedValues = maxCombinations.sort((a, b) => b.maxValue - a.maxValue);
  return sortedValues.filter(v => v.maxValue === sortedValues[0].maxValue);
};

export const sortCombinations = (players: Player[], pokers: Poker[]) => {
  return players.map(
    p => ({
      ...getMaxCombination([
        ...p.pokers,
        ...pokers
      ]),
      id: p.id,
    })
  ).sort((a, b) => b.combination - a.combination)
};
