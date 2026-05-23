export interface Word {
    word: string;
    definition: string
}

export interface Player {
    name: string,
    points: number
}

export interface Game {
    code: string,
    owner: string,
    players: Player[],
    currentPlayer: string,
}