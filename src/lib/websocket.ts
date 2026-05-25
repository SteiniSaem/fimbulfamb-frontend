import { PUBLIC_WS_URL } from "$env/static/public";
import { currentView, game, myUsername, openForSubmissions, webSocket, webSocketShouldBeClosed } from "$store";
import { get } from "svelte/store";
import { getWord } from "$common";
let ws: WebSocket;


export function setupWebsocketConnection(){
    let g = get(game)
    if (!g) return null

    ws = new WebSocket(`${PUBLIC_WS_URL}/game/${g.code}/ws`);
    
    webSocketShouldBeClosed.set(false)

        // Event: Connection opened
        ws.onopen = (event) => {
            console.log(`WebSocket connection to Rocket server for game ${g.code} established`);
        };

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
                    currentView.set('game');
                    break;
                
                case "New Owner":
                    g.owner = parts[1].trim()
                    break;
                
                case "Next Round":
                    g.definitions = []
                    g.currentPlayer = parts[1].trim()
                    openForSubmissions.set(true)
                    if(g.currentPlayer == get(myUsername)){
                        getWord()
                    }
                    else {
                        g.currentWord = {word: `${g.currentPlayer} á leik`, definition: ''}
                    }
                    break;

                case "Definition":
                    let player = parts[1]
                    let definition = parts[2]
                    g.addNewPlayerDefinition(player, definition)
                    break;

                case "Scores":
                    for(let i = 1; i < parts.length; i += 2){ //i = 1 cuz fyrst element is "Score", rest is [{player}, {score}, {player}, {score}, ...]
                        let playerName = parts[i]
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

                    if(quitter == get(myUsername)){ // ef ég er rekinn úr leik (send sama requesta og þegar er leavað)
                        webSocketShouldBeClosed.set(true)
                        currentView.set("home")
                        ws.close()
                    }
                    break;
            }
            game.set(g)
        }

        // Event: Connection closed
        ws.onclose = () => {
            console.log('Disconnected');
            if(!get(webSocketShouldBeClosed)){ // if disconnects by accident then reconnect
                setupWebsocketConnection()
            }
        };
    return ws;
}



