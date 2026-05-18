import { writable } from "svelte/store";
import type {Game, Player} from '$interfaces';


export const currentView = writable<"home"|"game"|"lobby">("home");
export const game = writable<Game|null>(null);
export const myUsername = writable("");
export const webSocket = writable<WebSocket|null>(null);