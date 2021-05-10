export enum Suit {
  Diamond = 'Diamond',
  Club = 'Club',
  Heart = 'Heart',
  Spade = 'Spade',
}

export type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export enum Combination {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
}
