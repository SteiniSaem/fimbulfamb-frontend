import type { Player, Definition, Word } from "$interfaces"
import { compareArrays } from "$common"

export class Game {
    code: string
    owner: string
    players: Player[]
    currentPlayer: string
    definitions: Definition[]
    currentWord: Word

    public constructor(code: string, owner: string, players: Player[], currentPlayer: string, definitions: Definition[], currentWord: Word) {
        this.code = code
        this.owner = owner
        this.players = players
        this.currentPlayer = currentPlayer
        this.definitions = definitions
        this.currentWord = currentWord
    }

    public addNewPlayerDefinition(player: string, definition: string) {

        let idx = this.definitions.findIndex(pd => pd.player == player)
        if(idx == -1){
            this.definitions = [...this.definitions, {player, definition}]
        } else {
            this.definitions[idx].definition = definition
        }
    }

    public shufflePlayerDefinitions() {
        if(this.definitions.length < 2) return

        let currentIndex = this.definitions.length;
        let beforeShuffle = this.definitions.map(pd => pd.player)
        // While there remain elements to shuffle...
        while (currentIndex > 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [this.definitions[currentIndex], this.definitions[randomIndex]] = [this.definitions[randomIndex], this.definitions[currentIndex]];
            
            if(currentIndex == 0) {
                // if array hasn't changed, start again
                let afterShuffle = this.definitions.map(pd => pd.player)
                console.log(beforeShuffle)
                console.log(afterShuffle)
                if(compareArrays(beforeShuffle, afterShuffle)){
                    currentIndex = this.definitions.length
                }
            }
        }
        
    }

}