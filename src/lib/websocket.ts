import { PUBLIC_WS_URL } from "$env/static/public";
import { currentView, game, myUsername, webSocketShouldBeClosed, isLoading, errMessage, webSocket } from "$store";
import { get } from "svelte/store";
import api from "$api";
import { refreshGameState } from "$common";



export async function setupWebsocketConnection(): Promise<WebSocket>{
    return new Promise((resolve, reject) => {

        let g = get(game)
        if (!g) return reject(new Error('Leikur ekki til'))

        const ws = new WebSocket(`${PUBLIC_WS_URL}/game/${g.code}/ws`);
        
        webSocketShouldBeClosed.set(false)

        // Event: Connection opened
        ws.onopen = (event) => {
            console.log(`WebSocket connection to Rocket server for game ${g.code} established`);
            resolve(ws)
        };

        ws.onerror = () => {
            reject(new Error("Náðist ekki tenging við vefþjón"))
        }

        // Event: Listen for messages from server
        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
            let parts = event.data.split('\t');
            console.log(parts)
            switch (parts[0]) {
                case "New Player":
                    let name = parts[1].trim()
                    let p = g.players.find(p => p.name == name) // in case the player already exists
                    if(!p) g.players = [...g.players, {name: name, points: 0}];
                    break;

                case "Start Game":
                    g.currentPlayer = parts[1];
                    if(g.currentPlayer == get(myUsername)){
                        getWord()
                    }
                    currentView.set('game');
                    break;
                
                case "New Owner":
                    g.owner = parts[1].trim()
                    break;
                
                case "Next Round":
                    errMessage.set('')
                    g.definitions = []
                    g.currentPlayer = parts[1].trim()
                    g.openForSubmissions = true
                    g.mySubmittedDefinition = ''
                    if(g.currentPlayer == get(myUsername)){
                        getWord()
                    }
                    else if(g.wordIsVisible){
                        g.currentWord.word = parts[2].trim()
                    }
                    break;

                case "Definition":
                    let player = parts[1].trim()
                    let definition = parts[2].trim()
                    g.addNewPlayerDefinition(player, definition)
                    break;

                case "Scores":
                    for(let i = 1; i < parts.length; i += 2){ //i = 1 cuz fyrst element is "Score", rest is [{player}, {score}, {player}, {score}, ...]
                        let playerName = parts[i].trim()
                        let score = parseInt(parts[i+1])
                        let idx = g.players.findIndex(p => p.name.trim() == playerName.trim())
                        if(idx > -1) g.players[idx].points = score
                    }                        
                    break;
                
                case "Quitter":
                    let quitter = parts[1].trim()
                    let idx = g.players.findIndex(p => p.name == quitter)
                    if(idx > -1){
                        g.players.splice(idx, 1)
                        g.players = g.players
                    }
                    idx = g.definitions.findIndex(d => d.player == quitter) // remove players definition if exists
                    if(idx > -1) g.definitions.splice(idx, 1)

                    if(quitter == get(myUsername)){ // If I'm kicked out the game (same request as leaving)
                        webSocketShouldBeClosed.set(true)
                        game.set(null)
                        currentView.set("home")
                        ws.close()
                    }
                    break;
                
                case "Show word":
                    g.wordIsVisible = true
                    let word = parts[1]
                    if(g.currentPlayer != get(myUsername)){
                        g.currentWord.word = word
                    }
                    break;

                case "Hide word":
                    g.wordIsVisible = false
                    if(g.currentPlayer != get(myUsername)){
                        g.currentWord.word = ''
                    }
                    break;

                case "End game":
                    game.set(null)
                    currentView.set('home')
                    return

            }
            game.set(g)
        }

        // Event: Connection closed
        ws.onclose = async () => {
            console.log('Disconnected');
            if(!get(webSocketShouldBeClosed)){ // if disconnects by accident then reconnect
                webSocket.set(await setupWebsocketConnection())
                let g = get(game)
                if(g) {
                    game.set(await refreshGameState(g))
                }
            }
        };
    })
}

async function getWord() {
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



