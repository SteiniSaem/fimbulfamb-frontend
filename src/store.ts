import { writable } from "svelte/store";

interface Player {
    name: string,
    points: number
}

interface Game {
    code: string,
    owner: string,
    players: Player[],

}

export const currentView = writable<"home"|"game"|"lobby">("home");
export const game = writable<Game|null>(null);
export const myUsername = writable("");