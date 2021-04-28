import Game from '@/models/game';
import Player from '@/models/player';
import { Operation } from '@/types/game';

jest.mock('readline');

describe('game tests', () => {
  let game!: Game;
  let spyConsole!: jest.SpyInstance;

  beforeAll(() => {
    spyConsole = jest.spyOn(console, 'info');
    spyConsole.mockImplementation(() => {});
  });

  beforeEach(() => {
    game = new Game(Player.initializePlayers(4), 10);
    game.turn = jest.fn(async () => {});
    game.river = jest.fn(async () => {});
    game.start();
  });

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C fold, then pot should have 15, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.fold();
      game.destroy();

      expect(game.currentPotCount).toBe(15);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  )

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C call, then pot should have 25, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.call();
      game.destroy();

      expect(game.currentPotCount).toBe(25);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  );

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C raise, then pot count should be 35, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.raise();
      game.destroy();

      expect(game.currentPotCount).toBe(35);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  );

  test(
    'given players A/B/C/D, big blind should bid 10, in flop round, and pot count is 35, when player C check, then pot count should be 15, and player D can choose to bid/check/fold',
    () => {
      game.call();
      game.call();
      game.flop();
      game.check();
      game.destroy();

      expect(game.currentPotCount).toBe(35);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Check, Operation.Bid]);
    },
  );

  test(
    'given players A/B/C/D, big blind should bid 10, player C has 8 count, and pot count is 15, when player C all in, then pot count should 23, player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.operatingPlayer!.bid(game.operatingPlayer!.bankRoll - 8);
      game.allIn();
      game.destroy();

      expect(game.currentPotCount).toBe(23);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  );

  afterAll(() => {
    spyConsole.mockReset();
  });
});
