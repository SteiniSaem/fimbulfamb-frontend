<script lang='ts'>
	import api from "$api";
	import { game, myUsername, webSocket } from "$store";
	import { onMount } from "svelte";
    import type { Player, Word } from "$interfaces";
	import { slide } from "svelte/transition";
    import { modals } from 'svelte-modals'
    import ScoreModal from "$lib/modals/ScoreModal.svelte";
	import Scoreboard from "$compopnents/scoreboard.svelte";
    import padlock from "$assets/padlock.png"
    import openPadlock from "$assets/open-padlock.png"

    let word: Word = $state({word: "", definition: ""});
    let openForSubmissions = $state(true)
    let myDefinition = $state("")
    let errMessage = $state('')
    let userDefinitions: {[key:string]: string} = $state({})

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
                        
                        userDefinitions = {}
                        $game.currentPlayer = parts[1].trim()
                        if($game.currentPlayer == $myUsername){
                            getWord()
                        }
                        else {
                            word = {word: `${$game.currentPlayer} á leik`, definition: ''}
                        }
                        break;

                    case "Definition":
                        let user = parts[1]
                        let definition = parts[2]
                        userDefinitions[user] = definition
                        break;

                    case "Scores":
                        for(let i = 1; i < parts.length; i += 2){ //i = 1 cuz fyrst element is "Score", rest is [{player}, {score}, {player}, {score}, ...]
                            let playerName = parts[i]
                            let score = parseInt(parts[i+1])
                            let idx = $game.players.findIndex(p => p.name.trim() == playerName.trim())
                            if(idx > -1) $game.players[idx].points = score
                        }                        
                        break;
                }
                
            };
        }
        
    })


    function getWord() {
        if($game) {
            api.get(`currentWord/${$game.code}`).then(res => {
                word.word = res.data.word;
                word.definition = res.data.definition;
            })
        }
    }

    function getNewWord() {
        if($game) {
            api.get(`nextWord/${$game.code}`).then(res => {
                word.word = res.data.word;
                word.definition = res.data.definition;
            }).catch(err => {
                console.log(err.response.data)
            })
        }
    }

    async function submitDefinition(){
        if($game) {
            errMessage = ''
            await api.put(`submitDefinition/${$game.code}`, {
                username: $myUsername,
                definition: myDefinition
            }).then(() => {
                word.definition = myDefinition
            }).catch(err => {
                errMessage = err.response.data
            })
            
        }
    }

    function toggleSubmissions() {
        if($game) {
            if(openForSubmissions){
                api.put(`closeForSubmissions/${$game.code}`).then(() => {
                    openForSubmissions = false
                }).catch(err => {console.log(err)})
            }
            else {
                api.put(`openForSubmissions/${$game.code}`).then(() => {
                    openForSubmissions = true
                }).catch(err => {console.log(err)})
            }
        }
    }

    async function nextRound() {
        if($game) {
            userDefinitions = {}
            await api.put(`nextRound/${$game.code}`)
            //word = {word: '', definition: ''}
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
</script>

{#if $game}
    <div class='h-full w-full flex flex-col items-center justify-between'>
        <div class='flex flex-col items-center mb-4'>
            <h3 class=''>{word.word}</h3>
            <p class='text-center text-lg min-h-8'>{word.definition}</p>
        </div>

        {#if $game.currentPlayer == $myUsername}

            <div class='h-full w-full flex flex-col justify-between items-center overflow-auto'>
                <button onclick={getNewWord} class='w-40'>Nýtt Orð</button>
                <p class='text-amber-400 min-h-6 py-2 text-center'>{errMessage}</p>

                <!-- Player definitions -->
                <div class='h-full w-full flex flex-col overflow-auto py-4'>
                    {#each Object.entries(userDefinitions) as [user, def]}
                        <div class='bg-slate-200 rounded-xl w-full py-1 px-2 my-1 text-center text-slate-600' transition:slide|global>
                            <p class='font-semibold text-sm'>{user}</p>
                            <p>{def}</p>
                        </div>
                    {/each}
                </div>

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

        {:else}
            <div class='w-full'>
                <Scoreboard players={$game.players}/>
            </div>
            <div>
                <p class='text-amber-400 min-h-6 py-2 text-center'>{errMessage}</p>
                <div class='flex'>
                    <textarea placeholder="Mín skýring" bind:value={myDefinition} class='w-full h-25'></textarea>
                    <button onclick={submitDefinition} class='rounded-xl ml-2'>Skila</button>
                </div> 
            </div>

        {/if}
    </div>
{/if}