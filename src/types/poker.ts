import { ValueMap } from '@/constants/poker';

export enum Suit {
  Diamond = 'Diamond',
  Club = 'Club',
  Heart = 'Heart',
  Spade = 'Spade',
}

export type Value = keyof typeof ValueMap;
