export interface Word {
    word: string;
    definition: string
}

export interface Player {
    name: string;
    points: number;
}

export interface Definition {
    player: string;
    definition: string;
}