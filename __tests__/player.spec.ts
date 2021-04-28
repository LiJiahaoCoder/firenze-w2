import Player from '@/models/player';

describe('player tests', () => {
  let player!: Player;

  beforeEach(() => {
    player = new Player('玩家', 50);
  });

  test(
    'given 50 initial bank roll, when player bid 10, then rest bank roll is 40',
    () => {
      player.bid(10);

      expect(player.bankRoll).toBe(40);
    },
  )
});
