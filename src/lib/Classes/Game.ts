import type { Player, Definition, Word } from "$interfaces"

export class Game {
    code: string
    owner: string
    players: Player[]
    currentPlayer: string
    definitions: Definition[]
    currentWord: Word
    joinable: boolean
    wordIsVisible: boolean
    hasStarted: boolean
    openForSubmissions: boolean
    mySubmittedDefinition: string

    public constructor(code: string, owner: string, players: Player[], currentPlayer: string, definitions: Definition[], currentWord: Word, joinable: boolean, wordIsVisible: boolean, hasStarted: boolean, openForSubmissions: boolean, mySubmittedDefinition: string) {
        this.code = code
        this.owner = owner
        this.players = players
        this.currentPlayer = currentPlayer
        this.definitions = definitions
        this.currentWord = currentWord
        this.joinable = joinable
        this.wordIsVisible = wordIsVisible
        this.hasStarted = hasStarted
        this.openForSubmissions = openForSubmissions
        this.mySubmittedDefinition = mySubmittedDefinition
    }

    static fromJSON(data: any): Game {
        return new Game(
            data.code,
            data.owner,
            data.players,
            data.currentPlayer,
            data.definitions,
            data.currentWord,
            data.joinable,
            data.wordIsVisible,
            data.hasStarted,
            data.openForSubmissions,
            data.mySubmittedDefinition
        )
    }

    public addNewPlayerDefinition(player: string, definition: string) {

        let idx = this.definitions.findIndex(pd => pd.player == player)
        if(idx == -1){
            this.definitions = [...this.definitions, {player, definition}]
        } else {
            this.definitions[idx].definition = definition
        }
    }

}