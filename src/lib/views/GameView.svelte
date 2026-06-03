<script lang='ts'>
    import { flip } from 'svelte/animate';
	import api from "$api";
	import { errMessage, game, myUsername, isLoading, webSocket } from "$store";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
    import { modals } from 'svelte-modals'
    import ScoreModal from "$lib/modals/ScoreModal.svelte";
	import Scoreboard from "$compopnents/scoreboard.svelte";
    import padlock from "$assets/padlock.png"
    import openPadlock from "$assets/open-padlock.png"
    import next from "$assets/next.png"
    import LoadingIndicator from '$compopnents/LoadingIndicator.svelte';
    import { compareArrays } from '$common';
	import { setupWebsocketConnection } from '$lib/websocket';

    let myDefinition = $state("")

    onMount(() => {
        if($game){
            $errMessage = ''
            if(!$webSocket || $webSocket.readyState == $webSocket.CLOSED){
                setupWebsocketConnection()
            }
        }
    })

    async function getNewWord() {
        if($game) {
            $isLoading = true
            $errMessage = ''
            api.get(`nextWord/${$game.code}`).then(res => {
                $game.currentWord.word = res.data.word;
                $game.currentWord.definition = res.data.definition;
                $game.definitions = [];
                $game.addNewPlayerDefinition($myUsername, $game.currentWord.definition)

            }).catch(err => {
                if(err.code == "ECONNABORTED") {
                    $errMessage = "Þjónn var of lengi a svara"
                } else {
                    console.log(err.response)
                    $errMessage = err.response.data
                }
            })
            $isLoading = false
        }
    }

    async function submitDefinition(){
        if($game && myDefinition.length > 0) {
            $isLoading = true
            $errMessage = ''
            await api.put(`submitDefinition/${$game.code}`, {
                username: $myUsername,
                definition: myDefinition
            }).then(() => {
                $game.mySubmittedDefinition = myDefinition;
                myDefinition = ''
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

    async function toggleSubmissions() {
        if($game) {
            $isLoading = true
            $errMessage = ''
            if($game.openForSubmissions){
                api.put(`closeForSubmissions/${$game.code}`).then(() => {
                    $game.openForSubmissions = false
                }).catch(err => {
                    if(err.code == "ECONNABORTED") {
                        $errMessage = "Þjónn var of lengi a svara"
                    } else {
                        $errMessage = err.response.data
                    }
                })
            }
            else {
                api.put(`openForSubmissions/${$game.code}`).then(() => {
                    $game.openForSubmissions = true
                }).catch(err => {
                    if(err.code == "ECONNABORTED") {
                        $errMessage = "Þjónn var of lengi a svara"
                    } else {
                        $errMessage = err.response.data
                    }
                })
            }
            $isLoading = false
        }
    }

    async function nextRound() {
        if($game) {
            $isLoading = true
            $errMessage = ''
            $game.definitions = []
            await api.put(`nextRound/${$game.code}`).catch(err => {
                if(err.code == "ECONNABORTED") {
                    $errMessage = "Þjónn var of lengi a svara"
                } else {
                    $errMessage = err.response.data
                }
            })
            $isLoading = false
        }
    }

    async function setScores() {
        if($game){
            let res = await modals.open(ScoreModal, {playersProp: $game.players, gameCode: $game.code})
            if(res){
                $game.players = res
            }
        }
    }

    function shufflePlayerDefinitions() {
        if(!$game) return;
        if($game.definitions.length < 2) return

        let currentIndex = $game.definitions.length;
        let beforeShuffle = $game.definitions.map(pd => pd.player)
        // While there remain elements to shuffle...
        while (currentIndex > 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [$game.definitions[currentIndex], $game.definitions[randomIndex]] = [$game.definitions[randomIndex], $game.definitions[currentIndex]];
            
            if(currentIndex == 0) {
                // if array hasn't changed, start again
                let afterShuffle = $game.definitions.map(pd => pd.player)
                console.log(beforeShuffle)
                console.log(afterShuffle)
                if(compareArrays(beforeShuffle, afterShuffle)){
                    currentIndex = $game.definitions.length
                }
            }
        }
        
    }
</script>

{#if $game}
    <div class='h-full w-full flex flex-col items-center overflow-auto'>


        {#if $game.currentPlayer == $myUsername}
            <h3 class='mb-4'>{$game.currentWord.word}</h3>

            <div class='h-full w-full flex flex-col justify-between items-center overflow-auto'>
                <div class='w-full flex flex-col items-center overflow-auto'>
                <button onclick={getNewWord} class='bg-pink-300 hover:brightness-90 text-sm px-8'>Nýtt Orð</button>

                    <!-- Player definitions -->
                    <div class='h-full w-full flex items-center flex-col overflow-auto my-4'>
                        {#each $game.definitions as pd (pd.player)}
                            <div class='bg-slate-200 rounded-xl w-full py-1 px-2 my-1 text-center text-slate-600' in:slide|global animate:flip={{duration: 400}}>
                                <p class='font-semibold text-sm'>{pd.player}</p>
                                <p>{pd.definition}</p>
                            </div>
                        {/each}
                    </div>
                    <button class='my-1 bg-pink-300 hover:brightness-90 text-sm px-8' onclick={shufflePlayerDefinitions}>Stokka</button>
                </div>

                <div class='w-full flex flex-col items-center'>
                    <LoadingIndicator bind:isLoading={$isLoading} />
                    <p class='text-amber-400 min-h-6 py-2 text-center'>{$errMessage}</p>
                    <div class='flex w-full [&>button]:px-0'>
                        {#if $game.openForSubmissions}
                            <button onclick={toggleSubmissions} class='rounded-r-none w-1/3 flex justify-center'><img src={openPadlock} width="25" height="25" alt="open padlock"></button>
                        {:else}
                            <button onclick={toggleSubmissions} class='rounded-r-none w-1/3 flex justify-center'><img src={padlock} width="25" height="25" alt="padlock"></button>
                        {/if}
                        <button onclick={setScores} class='rounded-none border-x border-slate-400 grow'>Stig</button>
                        <button onclick={nextRound} class='rounded-l-none font-bold w-1/3 flex justify-center'><img src={next} alt="next" width="25"></button>
                    </div>
                </div>
            </div>

        {:else}
            <div class='flex flex-col h-full items-center overflow-auto justify-between w-full'>
                <div class='flex flex-col items-center text-md min-h-34'>
                    <h3 class=''>{$game.currentPlayer} á orðið</h3>
                    {#if $game.wordIsVisible}
                        <p>orðið er {$game.currentWord.word}</p>
                    {/if}
                    {#if $game.mySubmittedDefinition}
                        <p class='border-b border-slate-200/50 pb-1 px-12 text-md'>Mín skýring</p>
                    {/if}
                    <p class='text-center mt-1'>{$game.mySubmittedDefinition}</p>
                </div>
                <div class='flex flex-col w-full overflow-auto'>
                    <Scoreboard players={$game.players} myUsername={$myUsername}/>
                </div>
                <div class='w-full'>
                    <p class='text-amber-400 text-center h-8 mt-2'>{$errMessage}</p>
                    <div class='flex w-full'>
                        <textarea placeholder="Mín skýring" bind:value={myDefinition} class='grow'></textarea>
                        <button onclick={submitDefinition} class='rounded-xl ml-2'>Skila</button>
                    </div> 
                </div>
            </div>
        {/if}
    </div>
{/if}