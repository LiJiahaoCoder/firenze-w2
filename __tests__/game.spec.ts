import Game from '@/models/game';
import Poker from '@/models/poker';
import Player from '@/models/player';
import {Operation} from '@/types/game';
import {Suit} from '@/types/poker';

jest.mock('readline');

describe('game tests', () => {
  let game!: Game;
  let spyConsole!: jest.SpyInstance;

  beforeAll(() => {
    spyConsole = jest.spyOn(console, 'info');
    spyConsole.mockImplementation(() => {});
  });

  afterAll(() => {
    spyConsole.mockReset();
  });

  beforeEach(() => {
    game = new Game(Player.initializePlayers(4), 10);
    game.turn = jest.fn(async () => {});
    game.river = jest.fn(async () => {});
    game.start();
  });

  afterEach(() => {
    game.destroy();
  });

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C fold, then pot should have 15, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.fold();

      expect(game.currentPotCount).toBe(15);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  )

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C call, then pot should have 25, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.call();

      expect(game.currentPotCount).toBe(25);
      expect(game.currentOperations).toEqual([Operation.Fold, Operation.Call, Operation.Raise]);
    },
  );

  test(
    'given players A/B/C/D, big blind should bid 10 and pot count is 15, when player C raise, then pot count should be 35, and player D can choose to call/raise/fold',
    () => {
      game.flop = jest.fn(async () => {});
      game.raise();

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

  test(
    'given players A/B/C/D, common pokers are ♥️2/♦️3/♥️4/♠️5/♠️K, and A has 6/7, B has 2/A, C has J/K, D has 10/Q, when settle, then C is the only winner',
    () => {
      game.destroy();
      game = new Game(Player.initializePlayers(4), 10);
      game.preFlop = jest.fn(async () => {});
      game.flop = jest.fn(async () => {});
      game.turn = jest.fn(async () => {});
      game.river = jest.fn(async () => {});

      game.setCommonPokers([
        new Poker('2', Suit.Heart),
        new Poker('3', Suit.Diamond),
        new Poker('4', Suit.Heart),
        new Poker('5', Suit.Spade),
        new Poker('K', Suit.Spade),
      ]);
      game.players.find(p => p.name === '玩家1')!.pokers = [new Poker('7', Suit.Diamond), new Poker('7', Suit.Club)];
      game.players.find(p => p.name === '玩家2')!.pokers = [new Poker('2', Suit.Diamond), new Poker('A', Suit.Club)];
      game.players.find(p => p.name === '玩家3')!.pokers = [new Poker('J', Suit.Diamond), new Poker('K', Suit.Club)];
      game.players.find(p => p.name === '玩家4')!.pokers = [new Poker('10', Suit.Diamond), new Poker('Q', Suit.Club)];
      game.start();

      expect(game.players.find(p => p.id === game.judge.settle()[0])!.name).toBe('玩家3');
    },
  );

  test(
    'given players A/B/C/D, pot has 30 bid count and C has 50 bank roll left, when C is the only winner, then C has 80 bank roll',
    async () => {
      game.destroy();
      game = new Game(Player.initializePlayers(4), 10);
      game.preFlop = jest.fn(async () => {});
      game.flop = jest.fn(async () => {});
      game.turn = jest.fn(async () => {});
      game.river = jest.fn(async () => {});
      const spy = jest.spyOn(game, 'currentPotCount', 'get');
      spy.mockReturnValueOnce(30);

      game.setCommonPokers([
        new Poker('2', Suit.Heart),
        new Poker('3', Suit.Diamond),
        new Poker('4', Suit.Heart),
        new Poker('5', Suit.Spade),
        new Poker('K', Suit.Spade),
      ]);
      game.players.find(p => p.name === '玩家1')!.pokers = [new Poker('7', Suit.Diamond), new Poker('7', Suit.Club)];
      game.players.find(p => p.name === '玩家2')!.pokers = [new Poker('2', Suit.Diamond), new Poker('A', Suit.Club)];
      game.players.find(p => p.name === '玩家3')!.pokers = [new Poker('J', Suit.Diamond), new Poker('K', Suit.Club)];
      game.players.find(p => p.name === '玩家4')!.pokers = [new Poker('10', Suit.Diamond), new Poker('Q', Suit.Club)];
      await game.start();

      expect(game.players.find(p => p.name === '玩家3')!.bankRoll).toBe(80);
      spy.mockReset();
    },
  );

  test(
    'given players A/B/C/D, side pot has 20 bid, main pot has 30 bid, and A all in, A and C both have 50 bid, when A and C is winner, then A should have 70, C should have 80',
    async () => {
      game.destroy();
      game = new Game(Player.initializePlayers(4), 10);
      game.preFlop = jest.fn(async () => {});
      game.flop = jest.fn(async () => {});
      game.turn = jest.fn(async () => {});
      game.river = jest.fn(async () => {});
      const spy = jest.spyOn(game, 'currentPotCount', 'get');
      const spySidePot = jest.spyOn(game, 'sidePot', 'get');
      spy.mockReturnValueOnce(30);
      spySidePot.mockReturnValueOnce({
        [game.players.find(p => p.name === '玩家2')!.id]: 20,
      });
      game.judge.settle = jest.fn().mockReturnValueOnce({
        side: [game.players.find(p => p.name === '玩家2')!.id],
        main: [game.players.find(p => p.name === '玩家3')!.id],
      });

      await game.start();

      expect(game.players.find(p => p.name === '玩家3')!.bankRoll).toBe(80);
      expect(game.players.find(p => p.name === '玩家2')!.bankRoll).toBe(70);
      spy.mockReset();
      spySidePot.mockReset();
    },
  );
});
