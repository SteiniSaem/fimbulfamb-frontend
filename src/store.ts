import { writable } from "svelte/store";
import { Game } from '$classes/Game'

export function persistentStore<T>(key: string, initialValue: T, reviver?: (data: any) => T) {
    const stored = localStorage.getItem(key);
    let data: T = initialValue;
    if (stored) {
        const parsed = JSON.parse(stored);
        data = reviver ? reviver(parsed) : parsed;
    }

    const store = writable<T>(data);

    store.subscribe(value => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
}


export const currentView = persistentStore<"home"|"game"|"lobby">("currentView", "home");
export const game = persistentStore<Game | null>('game', null, 
    data => data ? Game.fromJSON(data) : null
);
export const myUsername = persistentStore<string>("myUsername", "");
export const webSocket = writable<WebSocket|null>(null);
export const errMessage = writable("");
export const isLoading = writable(false);
export const webSocketShouldBeClosed = writable(true);
export const openForSubmissions = writable(true);