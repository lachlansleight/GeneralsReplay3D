export interface TSimulator {
    replay: TReplay;
    game: TGame;
    currentMoveIndex: number;
    currentAfkIndex: number;
}

export interface TReplay {
    afks: any[];
    cities: number[];
    cityArmies: number[];
    generals: number[];
    id: string;
    mapHeight: number;
    mapWidth: number;
    mapTitle: string | null;
    mountains: number[];
    moves: TMove[];
    stars: number[];
    teams: any[] | null;
    usernames: string[];
    version: number;
    neutrals: any[];
    neutralArmies: any[];
    swamps: any[];
    chat: any[];
    playerColors: number[];
    lights: any[];
}

export interface TMove {
    index: number;
    turn: number;
    start: number;
    end: number;
    is50: 1 | 0;
}

export interface TGame {
    alivePlayers: number;
    cities: number[];
    deaths: TSocket[];
    generals: number[];
    inputBuffer: any[];
    leftSockets: any[];
    map: TMap;
    scores: TScore[];
    sockets: TSocket[];
    teams: any[] | null;
    turn: number;
    cityRegen?: boolean;
}

export interface TMap {
    height: number;
    width: number;
    _armies: number[];
    _map: MapTile[];
    teams?: any;
}

export interface TScore {
    total: number;
    tiles: number;
    i?: number;
    dead?: boolean;
}

export interface TSocket {
    id: number;
    username: string;
    stars: number;
    emit?: (type: string, data: any) => void;
}

export enum MapTile {
    EMPTY = -1,
    MOUNTAIN = -2,
    FOG = -3,
    FOG_OBSTACLE = -4,
}
