import { isLoading, myUsername, currentView } from "$store";
import { get } from "svelte/store";
import type { Game } from "$classes/Game";
import api from "$api";

export async function refreshGameState(game: Game) {
    isLoading.set(true)
    await api.get(`gameState/${game.code}/${get(myUsername)}`).then(res => {
        console.log('refresh game state')
        console.log(new Date())
        console.log(res.data)
        game.owner = res.data.owner
        game.players = res.data.players
        game.currentPlayer = res.data.current_player
        game.definitions = res.data.player_definitions
        game.currentWord = res.data.current_word
        game.hasStarted = res.data.has_started
        game.openForSubmissions = res.data.openForSubmissions
        
        if(game.currentPlayer == get(myUsername)) {
            game.definitions.push({player: get(myUsername), definition: game.currentWord.definition})
        }
        
        if(game.hasStarted){
            currentView.set('game')
        }
        else {
            currentView.set('lobby')
        }

    }).catch(err => {
        console.log(err.response.data)
        //$errMessage = `Gat ekki sótt upplýsingar um leik ${game.code}`
        currentView.set('home')
        return null
    });

    isLoading.set(false);
    return game
}


export function compareArrays(a1: string[]|number[], a2: string[]|number[]){
    if(a1.length != a2.length) return false
    for(let i = 0; i < a1.length; i += 1){
        if(a1[i] != a2[i]){
            return false
        }
    }
    return true
}


export async function wait(ms: number){
    new Promise(res => setTimeout(res, ms));
}
