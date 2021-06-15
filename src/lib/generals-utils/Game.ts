import Map from "./Map";
import Constants from "./Constants";
import { MapTile, TGame, TScore, TSocket } from "./types";

const DEAD_GENERAL = -1;

// @param teams Optional. Defaults to FFA.
class Game implements TGame {
    alivePlayers: number;
    cities: number[];
    deaths: any[];
    generals: number[];
    swamps: number[];
    inputBuffer: any[];
    leftSockets: any[];
    map: Map;
    scores: TScore[];
    sockets: TSocket[];
    teams: any[] | null;
    turn: number;
    cityRegen?: boolean;

    constructor(game?: TGame, sockets?: TSocket[], teams?: any) {
        if (game) {
            this.alivePlayers = game.alivePlayers;
            this.cities = game.cities ? JSON.parse(JSON.stringify(game.cities)) : game.cities;
            this.deaths = game.deaths ? JSON.parse(JSON.stringify(game.deaths)) : game.deaths;
            this.generals = game.generals
                ? JSON.parse(JSON.stringify(game.generals))
                : game.generals;
            this.swamps = game.swamps ? JSON.parse(JSON.stringify(game.swamps)) : game.swamps;
            this.inputBuffer = game.inputBuffer
                ? JSON.parse(JSON.stringify(game.inputBuffer))
                : game.inputBuffer;
            this.leftSockets = game.leftSockets
                ? JSON.parse(JSON.stringify(game.leftSockets))
                : game.leftSockets;
            this.map = new Map(game.map);
            this.scores = game.scores ? JSON.parse(JSON.stringify(game.scores)) : game.scores;
            this.sockets = game.sockets;
            this.teams = game.teams ? JSON.parse(JSON.stringify(game.teams)) : game.teams;
            this.turn = game.turn;
            this.cityRegen = game.cityRegen;
            return;
        }
        if (!sockets) return;
        this.sockets = sockets;
        this.teams = teams;

        this.turn = 0;
        this.alivePlayers = sockets.length;
        this.leftSockets = [];
        this.inputBuffer = [];
        this.scores = [];
        this.deaths = [];

        for (let i = 0; i < sockets.length; i++) {
            this.inputBuffer.push([]);
            this.scores.push({
                total: 1,
                tiles: 1,
            });
        }
    }
    addMountain(index) {
        this.map.setTile(index, MapTile.MOUNTAIN);
    }
    addCity(index, army) {
        this.cities.push(index);
        this.map.setArmy(index, army);
    }
    addGeneral(index) {
        this.generals.push(index);
        this.map.setTile(index, this.generals.length - 1);
        this.map.setArmy(index, 1);
    }
    addSwamp(index) {
        this.swamps.push(index);
        this.map.setTile(index, MapTile.SWAMP);
    }
    // Returns true when the game is over.
    update() {
        // Handle buffered attacks.
        for (let sock = 0; sock < this.sockets.length; sock++) {
            // Flip priorities every other turn.
            const i = this.turn % 2 === 0 ? sock : this.sockets.length - 1 - sock;

            while (this.inputBuffer[i].length) {
                const attack = this.inputBuffer[i].splice(0, 1)[0];
                if (this.handleAttack(i, attack[0], attack[1], attack[2]) !== false) {
                    // This attack wasn't useless.
                    break;
                }
            }
        }

        this.turn++;

        // Increment armies at generals and cities.
        if (this.turn % Constants.RECRUIT_RATE === 0) {
            for (let i = 0; i < this.generals.length; i++) {
                this.map.incrementArmyAt(this.generals[i]);
            }
            for (let i = 0; i < this.cities.length; i++) {
                // Increment owned cities + unowned cities below the min threshold if city_regen is enabled.
                if (
                    this.map.tileAt(this.cities[i]) >= 0 ||
                    (this.cityRegen && this.map.armyAt(this.cities[i]) < Constants.MIN_CITY_ARMY)
                ) {
                    this.map.incrementArmyAt(this.cities[i]);
                }
            }
            for (let i = 0; i < this.swamps.length; i++) {
                if (this.map.tileAt(this.swamps[i]) >= 0) {
                    this.map.decrementArmyAt(this.swamps[i]);
                }
            }
        }

        // Give farm to all owned tiles for all players.
        if (this.turn % Constants.FARM_RATE === 0) {
            const size = this.map.size();
            for (let i = 0; i < size; i++) {
                if (this.map.tileAt(i) >= 0) {
                    this.map.incrementArmyAt(i);
                }
            }
        }

        this.recalculateScores();
    }
    // Returns true if the game is over.
    isOver() {
        // Game with no teams - ends when one player is left.
        if (!this.teams && this.alivePlayers === 1) {
            return true;
        }

        // Game with teams - ends when everyone left alive is on the same team.
        else if (this.teams) {
            let winningTeam = undefined;
            for (let i = 0; i < this.generals.length; i++) {
                if (this.deaths.indexOf(this.sockets[i]) < 0) {
                    // Player is alive!
                    if (winningTeam === undefined) {
                        winningTeam = this.teams[i];
                    } else if (this.teams[i] !== winningTeam) {
                        return;
                    }
                }
            }
            return true;
        }
    }
    recalculateScores() {
        // Recalculate scores (totals, tiles).
        for (let i = 0; i < this.sockets.length; i++) {
            this.scores[i].i = i;
            this.scores[i].total = 0;
            this.scores[i].tiles = 0;
            this.scores[i].dead = this.deaths.indexOf(this.sockets[i]) >= 0;
        }
        for (let i = 0; i < this.map.size(); i++) {
            const tile = this.map.tileAt(i);
            if (tile >= 0) {
                this.scores[tile].total += this.map.armyAt(i);
                this.scores[tile].tiles++;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const game = this;
        this.scores.sort(function (a, b) {
            if (a.dead && !b.dead) return 1;
            if (b.dead && !a.dead) return -1;
            if (a.dead && b.dead) {
                return (
                    game.deaths.indexOf(game.sockets[b.i]) - game.deaths.indexOf(game.sockets[a.i])
                );
            }
            if (b.total === a.total) return b.tiles - a.tiles;
            return b.total - a.total;
        });
    }
    indexOfSocketID(id: number) {
        let index = -1;
        for (let i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }
    // Returns false if the attack was useless, i.e. had no effect or failed.
    handleAttack(index: number, start: number, end: number, is50: number) {
        // Verify that the attack starts from an owned tile.
        if (this.map.tileAt(start) !== index) {
            return false;
        }

        // Store the value of the end tile pre-attack.
        const endTile = this.map.tileAt(end);

        // Handle the attack.
        const succeeded = this.map.attack(start, end, is50, this.generals);
        if (!succeeded) {
            return false;
        }

        // Check if this attack toppled a general.
        const newEndTile = this.map.tileAt(end);
        const generalIndex = this.generals.indexOf(end);
        if (newEndTile !== endTile && generalIndex >= 0) {
            // General captured! Give the capturer command of the captured's army.
            this.map.replaceAll(endTile, newEndTile, 0.5);

            // Only count as a death if this player has not died before (i.e. rage quitting)
            const deadSocket = this.sockets[endTile];
            if (this.deaths.indexOf(deadSocket) < 0) {
                this.deaths.push(deadSocket);
                this.alivePlayers--;
                deadSocket.emit("game_lost", {
                    killer: newEndTile,
                });
            }

            // Turn the general into a city.
            this.cities.push(end);
            this.generals[generalIndex] = DEAD_GENERAL;
        }
    }
    // Returns the index of an alive teammate of the given player, if any.
    aliveTeammate(index) {
        if (this.teams) {
            for (let i = 0; i < this.sockets.length; i++) {
                if (
                    this.teams[i] === this.teams[index] &&
                    this.deaths.indexOf(this.sockets[i]) < 0
                ) {
                    return i;
                }
            }
        }
    }
    // If the player hasn't been captured yet, either gives their land to a teammate
    // or turns it gray (neutral).
    tryNeutralizePlayer(playerIndex) {
        const deadGeneralIndex = this.generals[playerIndex];
        this.generals[playerIndex] = DEAD_GENERAL;

        // Check if the player has an alive teammate who can take their land.
        const aliveTeammateIndex = this.aliveTeammate(playerIndex);
        const newIndex = Number.isInteger(aliveTeammateIndex) ? aliveTeammateIndex : MapTile.EMPTY;

        // Check if the player hasn't been captured yet.
        if (this.map.tileAt(deadGeneralIndex) === playerIndex) {
            this.map.replaceAll(playerIndex, newIndex);
            this.cities.push(deadGeneralIndex);
        }
    }
    static createFromReplay(gameReplay) {
        const sockets = gameReplay.generals.map(function (g, i) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                emit: () => {},
                username: gameReplay.usernames[i],
                stars: gameReplay.stars ? gameReplay.stars[i] || 0 : "",
            };
        });
        const game = new Game(null, sockets, gameReplay.teams);

        game.cities = [];
        game.generals = [];
        game.swamps = [];

        // Init the game map from the replay.
        game.map = new Map(null, gameReplay.mapWidth, gameReplay.mapHeight, gameReplay.teams);
        for (let i = 0; i < gameReplay.mountains.length; i++) {
            game.addMountain(gameReplay.mountains[i]);
        }
        for (let i = 0; i < gameReplay.cities.length; i++) {
            game.addCity(gameReplay.cities[i], gameReplay.cityArmies[i]);
        }
        for (let i = 0; i < gameReplay.generals.length; i++) {
            game.addGeneral(gameReplay.generals[i]);
        }
        for (let i = 0; i < gameReplay.swamps.length; i++) {
            game.addSwamp(gameReplay.swamps[i]);
        }

        // For replay versions < 6, city regeneration is enabled.
        // City regeneration is when cities "heal" themselves back to 40 after
        // dropping below 40 army.
        if (gameReplay.version < 6) {
            game.cityRegen = true;
        }

        return game;
    }
}

export default Game;
