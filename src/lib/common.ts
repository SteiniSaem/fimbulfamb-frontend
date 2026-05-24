import {game, myUsername, errMessage, isLoading} from '$store'
import api from '$api'
import { get } from 'svelte/store'

export function compareArrays(a1: string[]|number[], a2: string[]|number[]){
    if(a1.length != a2.length) return false
    for(let i = 0; i < a1.length; i += 1){
        if(a1[i] != a2[i]){
            return false
        }
    }
    return true
}


export async function getWord() {
    let g = get(game)
    if(g) {

        isLoading.set(true)
        errMessage.set('')

        await api.get(`currentWord/${g.code}`).then(res => {
            g.currentWord.word = res.data.word;
            g.currentWord.definition = res.data.definition;
            g.definitions = [{player: get(myUsername), definition: g.currentWord.definition}]//, {player: 'api', definition: "makalaus"}, {player: 'api1', definition: "makalaus"}, {player: 'api2', definition: "makalaus"}, {player: 'api3', definition: "makalaus"}, {player: 'api4', definition: "makalaus"}, {player: 'api5', definition: "makalaus"}, {player: 'api6', definition: "makalaus"}]
        }).catch(err => {
            if(err.code == "ECONNABORTED") {
                errMessage.set("Þjónn var of lengi a svara")
            } else {
                errMessage.set(err.response.data)
            }
        })

        game.set(g)
        isLoading.set(false)
    }

}
