import Poker from '@/models/poker';
import { Suit, Value } from '@/types/poker';
import { ValueMap } from '@/constants/poker';

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
