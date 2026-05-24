<script lang='ts'>
	import api from '$api';
    import { PUBLIC_WS_URL } from '$env/static/public';
	import LoadingIndicator from '$compopnents/LoadingIndicator.svelte';
    import {currentView, game, webSocket, myUsername, errMessage, isLoading} from '$store';
    import { setupWebsocketConnection } from '$lib/websocket';
	import { onMount } from 'svelte';


    onMount(() => {
        if(!$game){
            $currentView = 'home'
            return
        }
        $errMessage = ''
        /*for(let i = 0; i < 12; i++) {
            $game.players = [...$game.players, {name: `api${i+1}`, points: 0}]
        }*/
        $webSocket = setupWebsocketConnection()
    })
        


    async function startGame() {
        if($game){
            $isLoading = true
            $errMessage = ''
            await api.put(`startGame/${$game.code}`).then(() => {
                $currentView = 'game'
            }).catch(err => {
                if(err.code == "ECONNABORTED") {
                    $errMessage = "Þjónn var of lengi a svara"
                } else {
                    $errMessage = err.response.data
                }
            })
            $isLoading = false
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

            <LoadingIndicator bind:isLoading={$isLoading}/>

            {#if $game.owner == $myUsername}
                <div class='flex flex-col items-center mt-2 w-full'>
                    <p class='text-amber-500 h-8'>{$errMessage}</p>
                    <button onclick={startGame}>Hefja Leik</button>
                </div>
            {/if}
        </div>
    </div>
{:else}
    <h1>Enginn slíkur leikur</h1>
{/if}