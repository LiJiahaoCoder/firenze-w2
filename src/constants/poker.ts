import { Suit, Value } from '@/types/poker';

export const ValueMap: Record<Value, number> = {
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6,
  '8': 7,
  '9': 8,
  '10': 9,
  'J': 10,
  'Q': 11,
  'K': 12,
  'A': 13,
};

export const SuitMap: Record<Suit, string> = {
  [Suit.Diamond]: '♦️',
  [Suit.Club]: '♣️',
  [Suit.Heart]: '♥️',
  [Suit.Spade]: '♠️',
};
