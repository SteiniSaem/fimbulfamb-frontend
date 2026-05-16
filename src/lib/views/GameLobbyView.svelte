<script lang='ts'>
	import api from '$api';
    import {currentView, game, myUsername} from '$store';
	import { onMount } from 'svelte';

    let hasGameStartedInterval: number;
    let getPlayersInterval: number;

    onMount(() => {
        if(!$game){
            $currentView = 'home'
            return
        }
        getPlayersInterval = setInterval(getPlayers, 2000)

        if($game && $game.owner != $myUsername) { // if I am not owner
            hasGameStartedInterval = setInterval(hasGameStarted, 2000)
        }
    })

    function startGame() {
        if($game){
            api.put(`startGame/${$game.code}`).then(res => {
                clearIntervals()
                $currentView = 'game'
            }).catch(err => {
                console.log(err)
            })
        }
    }

    function getPlayers() {
        if($game) {
            api.get(`players/${$game.code}`).then(res => {
                $game.players = res.data
            }).catch(err => {
                console.log(err)
            })
        }
    }

    function hasGameStarted(){
        if($game) { // if I am owner
            api.get(`hasGameStarted/${$game.code}`).then(res => {
                if(res.data == true){
                    clearIntervals()
                    $currentView = "game";
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }

    function clearIntervals(){
        clearInterval(hasGameStartedInterval)
        clearInterval(getPlayersInterval)
    }

</script>

{#if $game}
    <div class='flex flex-col h-full'>
        <h1 class='mb-12'>Nýr Leikur</h1>

        <div class='flex flex-col items-center h-full justify-between'>
            <div class='flex flex-col items-center'>

                <p class='text-lg'>Kóði</p>
                <h1 class='mt-2 mb-6'>{$game.code}</h1>

                <p class='font-bold w-50 border-b text-center mb-2'>Leikmenn</p>
                {#each $game.players as player}
                    <p>{player.name}</p>
                {/each}
            </div>

            {#if $game.owner == $myUsername}
                <button onclick={startGame}>Hefja Leik</button>
            {/if}
        </div>
    </div>
{:else}
    <h1>Enginn slíkur leikur</h1>
{/if}