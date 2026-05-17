import { writable } from "svelte/store";

interface Player {
    name: string,
    points: number
}

interface Game {
    code: string,
    owner: string,
    players: Player[],
    currentPlayer: string,
}

export const currentView = writable<"home"|"game"|"lobby">("home");
export const game = writable<Game|null>(null);
export const myUsername = writable("");
export const webSocket = writable<WebSocket|null>(null);