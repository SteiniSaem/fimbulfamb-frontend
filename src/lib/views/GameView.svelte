<script lang='ts'>
    import { flip } from 'svelte/animate';
	import api from "$api";
	import { game, myUsername, webSocket, amOwner } from "$store";
	import { onMount } from "svelte";
    import type { Word } from "$interfaces";
	import { slide } from "svelte/transition";
    import { modals } from 'svelte-modals'
    import ScoreModal from "$lib/modals/ScoreModal.svelte";
	import Scoreboard from "$compopnents/scoreboard.svelte";
    import padlock from "$assets/padlock.png"
    import openPadlock from "$assets/open-padlock.png"
    import LoadingIndicator from '$compopnents/LoadingIndicator.svelte';
    import { compareArrays } from '$common';

    let word: Word = $state({word: "", definition: ""});
    let openForSubmissions = $state(true)
    let myDefinition = $state("")
    let errMessage = $state('')
    let playerDefinitions: {player: string, definition: string}[] = $state([])
    let isLoading = $state(false)

    onMount(() => {
        if(!$game || !$webSocket) return
        if($game.currentPlayer == $myUsername){ // if its your turn, get the word
            getWord();
        }
        else {
            word = {word: `${$game.currentPlayer} á leik`, definition: ''}
        }

        // Event: Listen for messages from server
        if($webSocket){

            $webSocket.onmessage = (event) => {
                let parts = event.data.split('\t');
                console.log(parts)
                switch (parts[0]) {
                    case "Next Round":
                        
                        playerDefinitions = []
                        $game.currentPlayer = parts[1].trim()
                        if($game.currentPlayer == $myUsername){
                            getWord()
                        }
                        else {
                            word = {word: `${$game.currentPlayer} á leik`, definition: ''}
                        }
                        break;

                    case "Definition":
                        let player = parts[1]
                        let definition = parts[2]
                        addNewUserDefinition(player, definition)
                        break;

                    case "Scores":
                        for(let i = 1; i < parts.length; i += 2){ //i = 1 cuz fyrst element is "Score", rest is [{player}, {score}, {player}, {score}, ...]
                            let playerName = parts[i]
                            let score = parseInt(parts[i+1])
                            let idx = $game.players.findIndex(p => p.name.trim() == playerName.trim())
                            if(idx > -1) $game.players[idx].points = score
                        }                        
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
                        if(parts[1].trim() == $myUsername){
                            $amOwner = true
                        }
                        break;
                    }
                
            };
        }
        
    })


    async function getWord() {
        if($game) {

            isLoading = true
            errMessage = ''

            await api.get(`currentWord/${$game.code}`).then(res => {
                word.word = res.data.word;
                word.definition = res.data.definition;
                playerDefinitions = [{player: $myUsername, definition: word.definition}]//, {player: 'api', definition: "makalaus"}, {player: 'api1', definition: "makalaus"}, {player: 'api2', definition: "makalaus"}, {player: 'api3', definition: "makalaus"}, {player: 'api4', definition: "makalaus"}, {player: 'api5', definition: "makalaus"}, {player: 'api6', definition: "makalaus"}]
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

    async function getNewWord() {
        if($game) {
            isLoading = true
            errMessage = ''
            api.get(`nextWord/${$game.code}`).then(res => {
                word.word = res.data.word;
                word.definition = res.data.definition;
                playerDefinitions = [];
                addNewUserDefinition($myUsername, word.definition)

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

    async function submitDefinition(){
        if($game) {
            isLoading = true
            errMessage = ''
            await api.put(`submitDefinition/${$game.code}`, {
                username: $myUsername,
                definition: myDefinition
            }).then(() => {
                word.definition = myDefinition
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

    async function toggleSubmissions() {
        if($game) {
            isLoading = true
            errMessage = ''
            if(openForSubmissions){
                api.put(`closeForSubmissions/${$game.code}`).then(() => {
                    openForSubmissions = false
                }).catch(err => {
                    if(err.code == "ECONNABORTED") {
                        errMessage = "Þjónn var of lengi a svara"
                    } else {
                        errMessage = err.response.data
                    }
                })
            }
            else {
                api.put(`openForSubmissions/${$game.code}`).then(() => {
                    openForSubmissions = true
                }).catch(err => {
                    if(err.code == "ECONNABORTED") {
                        errMessage = "Þjónn var of lengi a svara"
                    } else {
                        errMessage = err.response.data
                    }
                })
            }
            isLoading = false
        }
    }

    async function nextRound() {
        if($game) {
            isLoading = true
            errMessage = ''
            playerDefinitions = []
            await api.put(`nextRound/${$game.code}`).catch(err => {
                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
            })
            isLoading = false
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

    function addNewUserDefinition(player: string, definition: string) {
        let idx = playerDefinitions.findIndex(ud => ud.player == player)
        if(idx == -1){
            playerDefinitions = [...playerDefinitions, {player, definition}]
        } else {
            playerDefinitions[idx].definition = definition
        }
    }

    function shufflePlayerDefinitions() {
        if(playerDefinitions.length < 2) return

        let currentIndex = playerDefinitions.length;
        let beforeShuffle = playerDefinitions.map(pd => pd.player)
        // While there remain elements to shuffle...
        while (currentIndex > 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [playerDefinitions[currentIndex], playerDefinitions[randomIndex]] = [playerDefinitions[randomIndex], playerDefinitions[currentIndex]];
            
            if(currentIndex == 0) {
                // if array hasn't changed, start again
                let afterShuffle = playerDefinitions.map(pd => pd.player)
                console.log(beforeShuffle)
                console.log(afterShuffle)
                if(compareArrays(beforeShuffle, afterShuffle)){
                    currentIndex = playerDefinitions.length
                }
            }
        }
        
    }
</script>

{#if $game}
    <div class='h-full w-full flex flex-col items-center overflow-auto'>
        <div class='flex flex-col items-center mb-2'>
            <h3 class=''>{word.word}</h3>
            <!--<p class='text-center text-lg min-h-8'>{word.definition}</p>-->
        </div>

        {#if $game.currentPlayer == $myUsername}

            <div class='h-full w-full flex flex-col justify-between items-center overflow-auto'>
                <div class='w-full flex flex-col items-center overflow-auto'>
                <button onclick={getNewWord} class='w-40'>Nýtt Orð</button>

                    <!-- Player definitions -->
                    <div class='h-full w-full flex items-center flex-col overflow-auto my-4'>
                        {#each playerDefinitions as pd (pd.player)}
                            <div class='bg-slate-200 rounded-xl w-full py-1 px-2 my-1 text-center text-slate-600' transition:slide|global animate:flip={{duration: 400}}>
                                <p class='font-semibold text-sm'>{pd.player}</p>
                                <p>{pd.definition}</p>
                            </div>
                        {/each}
                    </div>
                    <button class='my-1 bg-transparent text-slate-200' onclick={shufflePlayerDefinitions}>Stokka</button>
                </div>

                <div class='w-full flex flex-col items-center'>
                    <LoadingIndicator bind:isLoading />
                    <p class='text-amber-400 min-h-6 py-2 text-center'>{errMessage}</p>
                    <div class='flex w-full [&>button]:px-0'>
                        {#if openForSubmissions}
                            <button onclick={toggleSubmissions} class='rounded-r-none w-1/3 flex justify-center'><img src={openPadlock} width="25" height="25" alt="open padlock"></button>
                        {:else}
                            <button onclick={toggleSubmissions} class='rounded-r-none w-1/3 flex justify-center'><img src={padlock} width="25" height="25" alt="padlock"></button>
                        {/if}
                        <button onclick={setScores} class='rounded-none border-x border-slate-400 grow'>Stig</button>
                        <button onclick={nextRound} class='rounded-l-none font-bold w-1/3'>&gt;&gt;</button>
                    </div>
                </div>
            </div>

        {:else}
            <div class='flex flex-col h-full overflow-auto justify-between'>
                <div class='flex flex-col items-center text-md min-h-16 border'>
                    {#if word.definition}
                        <p class='border-b border-slate-200/50 pb-1 px-12 text-md'>Mín skýring</p>
                    {/if}
                    <p class='text-center mt-1'>{word.definition}</p>
                </div>
                <div class='flex flex-col w-full overflow-auto'>
                    <Scoreboard players={$game.players}/>
                </div>
                <div>
                    <p class='text-amber-400 text-center h-8 mt-2'>{errMessage}</p>
                    <div class='flex'>
                        <textarea placeholder="Mín skýring" bind:value={myDefinition} class=''></textarea>
                        <button onclick={submitDefinition} class='rounded-xl ml-2'>Skila</button>
                    </div> 
                </div>
            </div>
        {/if}
    </div>
{/if}