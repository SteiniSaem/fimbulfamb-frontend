import { writable } from "svelte/store";
import type { Player} from '$interfaces';
import type { Game } from '$classes/Game'


export const currentView = writable<"home"|"game"|"lobby">("home");
export const game = writable<Game|null>(null);
export const myUsername = writable("");
export const webSocket = writable<WebSocket|null>(null);
export const errMessage = writable("");
export const isLoading = writable(false);
export const webSocketShouldBeClosed = writable(true);
export const openForSubmissions = writable(true);