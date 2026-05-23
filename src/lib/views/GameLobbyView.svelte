<script lang='ts'>
	import api from '$api';
    import { WS_URL } from '$api';
	import LoadingIndicator from '$compopnents/LoadingIndicator.svelte';
    import {currentView, game, webSocket, myUsername} from '$store';
	import { onMount } from 'svelte';

    let isLoading = $state(false)
    let errMessage = $state('')

    onMount(() => {
        if(!$game){
            $currentView = 'home'
            return
        }
        /*for(let i = 0; i < 12; i++) {
            $game.players = [...$game.players, {name: `api${i+1}`, points: 0}]
        }*/
        $webSocket = new WebSocket(`${WS_URL}/game/${$game.code}/ws`);

        // Event: Connection opened
        $webSocket.onopen = (event) => {
            console.log(`WebSocket connection to Rocket server for game ${$game.code} established`);
        };

        // Event: Listen for messages from server
        $webSocket.onmessage = (event) => {
            console.log('Message from server:', event.data);
            let parts = event.data.split('\t');
            console.log(parts)
            switch (parts[0]) {
                case "New Player":
                    let name = parts[1].trim()
                    $game.players = [...$game.players, {name: name, points: 0}];
                    break;

                case "Start Game":
                    $game.currentPlayer = parts[1];
                    $currentView = 'game';
                    break;
                
                case "Quitter":
                    let quitter = parts[1]
                    let idx = $game.players.findIndex(p => p.name == quitter)
                    if(idx > -1){
                        $game.players.splice(idx, 1)
                        $game.players = $game.players
                    }
                    break;
                
                case "New Owner":
                    $game.owner = parts[1].trim()
                    break;
            }
        }

        // Event: Connection closed
        $webSocket.onclose = () => {
            console.log('Disconnected');
        };
    })


    async function startGame() {
        if($game){
            isLoading = true
            errMessage = ''
            await api.put(`startGame/${$game.code}`).then(() => {
                $currentView = 'game'
            }).catch(err => {
                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
            })
            isLoading = false
        }
    }

</script>

{#if $game}
    <div class='flex flex-col items-center w-full h-full overflow-auto'>
        <h1 class='mb-12'>Nýr Leikur</h1>

        <div class='flex flex-col items-center w-full h-full justify-between overflow-auto'>
            <div class='flex flex-col h-full items-center overflow-auto'>

                <p class='text-lg'>Kóði</p>
                <h1 class='mt-2 mb-6'>{$game.code}</h1>

                <p class='font-bold w-50 border-b text-center mb-2'>Leikmenn</p>
                <div class='flex flex-col items-center w-full h-full overflow-auto'>
                    {#each $game.players as player}
                        <p>{player.name}</p>
                    {/each}
                </div>
            </div>

            <LoadingIndicator bind:isLoading/>

            {#if $game.owner == $myUsername}
                <div class='flex flex-col items-center mt-2 w-full'>
                    <p class='text-amber-500 h-8'>{errMessage}</p>
                    <button onclick={startGame}>Hefja Leik</button>
                </div>
            {/if}
        </div>
    </div>
{:else}
    <h1>Enginn slíkur leikur</h1>
{/if}