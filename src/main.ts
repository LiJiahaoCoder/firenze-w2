import Game from '@/models/game';
import Player from '@/models/player';

const players = Player.initializePlayers(4);
const game = new Game(players, 10);
void game.start();
