'use strict';

import { MapTile, TMap } from "./types";

// @param teams Optional. If supplied, teams[i] is the team for player i.
class Map implements TMap {
	height: number;
	width: number;
	_armies: number[];
	_map: MapTile[];
	teams: any;

	constructor(width: number, height: number, teams: any) {
		this.width = width;
		this.height = height;
		if (teams)
			this.teams = teams;

		this._map = [];
		this._armies = [];
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				this._map.push(MapTile.EMPTY);
				this._armies.push(0);
			}
		}
	}
	size() {
		return this.width * this.height;
	}
	indexFrom(row: number, col: number) {
		return row * this.width + col;
	}
	// Returns whether index 1 is adjacent to index 2.
	isAdjacent(i1: number, i2: number) {
		const r1 = Math.floor(i1 / this.width);
		const c1 = Math.floor(i1 % this.width);
		const r2 = Math.floor(i2 / this.width);
		const c2 = Math.floor(i2 % this.width);
		return (
			Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
		);
	}
	isValidTile(index: number) {
		return index >= 0 && index < this._map.length;
	}
	tileAt(index: number) {
		return this._map[index];
	}
	armyAt(index: number) {
		return this._armies[index];
	}
	setTile(index: number, val: number) {
		this._map[index] = val;
	}
	setArmy(index: number, val: number) {
		this._armies[index] = val;
	}
	incrementArmyAt(index: number) {
		this._armies[index]++;
	}
	// Attacks from start to end. Always leaves 1 unit left at start.
	attack(start: number, end: number, is50: number, generals: number[]) {
		// Verify that the attack starts from a valid tile.
		if (!this.isValidTile(start)) {
			console.error('Attack has invalid start position ' + start);
			return false;
		}

		// Verify that the attack ends at a valid tile.
		if (!this.isValidTile(end)) {
			console.error('Attack has invalid end position ' + end);
			return false;
		}

		// Verify that the attack goes to an adjacent tile.
		if (!this.isAdjacent(start, end)) {
			console.error('Attack for non-adjacent tiles ' + start + ', ' + end);
			return false;
		}

		// Check if the attack goes to a mountain.
		if (this.tileAt(end) === MapTile.MOUNTAIN) {
			return false;
		}

		const reserve = is50 ? Math.ceil(this._armies[start] / 2) : 1;

		// Attacking an Enemy.
		if (!this.teams || this.teams[this.tileAt(start)] !== this.teams[this.tileAt(end)]) {
			// If the army at the start tile is <= 1, the attack fails.
			if (this._armies[start] <= 1)
				return false;

			if (this.tileAt(end) === this.tileAt(start)) {
				// player -> player
				this._armies[end] += this._armies[start] - reserve;
			} else {
				// player -> enemy
				if (this._armies[end] >= this._armies[start] - reserve) {
					// Non-takeover
					this._armies[end] -= this._armies[start] - reserve;
				} else {
					// Takeover
					this._armies[end] = this._armies[start] - reserve - this._armies[end];
					this.setTile(end, this.tileAt(start));
				}
			}
		}


		// Attacking an Ally.
		else {
			this._armies[end] += this._armies[start] - reserve;
			if (generals.indexOf(end) < 0) {
				// Attacking a non-general allied tile.
				// Steal ownership of the tile.
				this.setTile(end, this.tileAt(start));
			}
		}

		this._armies[start] = reserve;

		return true;
	}
	// Replaces all tiles of value val1 with val2.
	// @param scale Optional. If provided, scales replaced armies down using scale as a multiplier.
	replaceAll(val1: number, val2: number, scale?: number) {
		scale = scale || 1;
		for (let i = 0; i < this._map.length; i++) {
			if (this._map[i] === val1) {
				this._map[i] = val2;
				this._armies[i] = Math.round(this._armies[i] * scale);
			}
		}
	}
	// Returns the Manhattan distance between index1 and index2.
	distance(index1: number, index2: number) {
		const r1 = Math.floor(index1 / this.width);
		const c1 = index1 % this.width;
		const r2 = Math.floor(index2 / this.width);
		const c2 = index2 % this.width;
		return Math.abs(r1 - r2) + Math.abs(c1 - c2);
	}
}

export default Map;