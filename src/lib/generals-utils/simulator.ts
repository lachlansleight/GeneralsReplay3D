// This file reads in example.gioreplay and runs a full game simulation from the replay.

import Game from "./Game";
import { TReplay, TSimulator } from "./types";

class Simulator implements TSimulator {
    replay: TReplay;
    game: Game;
    currentMoveIndex = 0;
    currentAfkIndex = 0;
    gameOver = false;
    maxTurn = 0;

    gameStates: { game: Game; moveIndex: number; afkIndex: number }[] = [];

    constructor(replay: TReplay) {
        this.replay = replay;
        this.game = Game.createFromReplay(replay);
        this.currentMoveIndex = 0;
        this.currentAfkIndex = 0;

        this.gameStates[this.game.turn] = {
            game: new Game(this.game),
            moveIndex: this.currentMoveIndex,
            afkIndex: this.currentAfkIndex,
        };

        this.runFullSimulation();
    }

    nextTurn() {
        if (this.gameOver) return;

        while (
            this.replay.moves.length > this.currentMoveIndex &&
            this.replay.moves[this.currentMoveIndex].turn <= this.game.turn
        ) {
            const move = this.replay.moves[this.currentMoveIndex++];
            this.game.handleAttack(move.index, move.start, move.end, move.is50);
        }

        while (
            this.replay.afks.length > this.currentAfkIndex &&
            this.replay.afks[this.currentAfkIndex].turn <= this.game.turn
        ) {
            const afk = this.replay.afks[this.currentAfkIndex++];
            const index = afk.index;

            // If already dead, mark as dead general and neutralize if needed.
            if (this.game.deaths.indexOf(this.game.sockets[index]) >= 0) {
                this.game.tryNeutralizePlayer(index);
            }
            // Mark as AFK if not already dead.
            else {
                this.game.deaths.push(this.game.sockets[index]);
                this.game.alivePlayers--;
            }
        }

        this.game.update();

        this.gameOver = this.game.isOver();

        this.gameStates[this.game.turn] = {
            game: new Game(this.game),
            moveIndex: this.currentMoveIndex,
            afkIndex: this.currentAfkIndex,
        };
    }

    previousTurn() {
        const newTurn = this.game.turn - 1;
        if (newTurn < 0) return;

        this.game = new Game(this.gameStates[newTurn].game);
        this.currentMoveIndex = this.gameStates[newTurn].moveIndex;
        this.currentAfkIndex = this.gameStates[newTurn].afkIndex;

        this.gameOver = this.game.isOver();
    }

    setTurn(turn: number) {
        turn = Math.max(0, Math.min(turn, this.maxTurn));
        this.game = new Game(this.gameStates[turn].game);
        this.currentMoveIndex = this.gameStates[turn].moveIndex;
        this.currentAfkIndex = this.gameStates[turn].afkIndex;
        this.gameOver = this.game.isOver();
    }

    runFullSimulation() {
        while (!this.game.isOver() && this.game.turn < 2000) {
            this.nextTurn();
            // Do whatever you want with the current game state. Some useful fields are:
            // game.turn: The current turn.
            // game.sockets: The array of players. Player game.sockets[i] has playerIndex i.
            // game.map: A Map object representing the current game state. See Map.js.
            // game.scores: An ordered (decreasing) array of scores. Each score object can be tied to a player by its .i field.
            // game.alivePlayers: The number of players left alive.
            // game.deaths: Dead players in chronological order: game.deaths[0] is the first player to die.
        }
        this.maxTurn = this.game.turn;
        this.setTurn(0);
    }
}

export default Simulator;
