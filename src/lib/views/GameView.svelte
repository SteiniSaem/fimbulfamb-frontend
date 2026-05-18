<script lang='ts'>
	import api from "$api";
	import { game, myUsername, webSocket } from "$store";
	import { onMount } from "svelte";
    import type { Player, Word } from "$interfaces";
	import { slide } from "svelte/transition";
    import { modals } from 'svelte-modals'
    import ScoreModal from "$lib/modals/ScoreModal.svelte";

    let word: Word = $state({word: "", definition: ""});
    let openForSubmissions = $state(true)
    let myDefinition = $state("")
    let scoreboard: Player[] = $state([])
    let errMessage = $state('')
    let userDefinitions: {user: string, definition: string}[] = $state([])

    game.subscribe(value => {
        if(value) {
            scoreboard = value.players.toSorted((a, b) => a.points - b.points)
        }
    })

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

            $webSocket.onmessage = (msg) => {
                console.log('Message from server:', msg.data);

                if(msg.data.startsWith("Next Round")) {
                    console.log(msg.data.split('\t'))
                    $game.currentPlayer = msg.data.split('\t')[1].trim()
                    if($game.currentPlayer == $myUsername){
                        getWord()
                    }
                    else {
                        word = {word: `${$game.currentPlayer} á leik`, definition: ''}
                    }
                }
                else if(msg.data.startsWith("Definition")) {
                    let data = msg.data.split('\t')
                    let user = data[1]
                    let definition = data[2]
                    userDefinitions = [...userDefinitions, {user, definition}]
                }
                
            };
        }
        
    })


    function getWord() {
        if($game) {
            api.get(`currentWord/${$game.code}`).then(res => {
                console.log(res.data);
                word.word = res.data.word;
                word.definition = res.data.definition;
            })
        }
    }

    function getNewWord() {
        if($game) {
            api.get(`nextWord/${$game.code}`).then(res => {
                console.log(res.data);
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
            await api.put(`nextRound/${$game.code}`)
            //word = {word: '', definition: ''}
        }
    }
</script>

{#if $game}
    <div class='h-full w-full flex flex-col items-center justify-between'>
        <div class='flex flex-col items-center'>
            <h3 class=''>{word.word}</h3>
            <p class='text-center text-lg min-h-8'>{word.definition}</p>
        </div>

        {#if $game.currentPlayer == $myUsername}

            <div class='h-full w-full flex flex-col justify-between items-center overflow-auto'>
                <button onclick={getNewWord} class='w-40'>Nýtt Orð</button>
                <p class='text-amber-400 min-h-6 py-2 text-center'>{errMessage}</p>
                <div class='h-full w-full flex flex-col overflow-auto py-4'>
                    {#each userDefinitions as userDef}
                        <div class='bg-slate-200 rounded-xl w-full py-1 px-2 text-center text-slate-600' transition:slide|global>
                            <p class='font-semibold text-sm'>{userDef.user}</p>
                            <p>{userDef.definition}</p>
                        </div>
                    {/each}
                </div>
                    <div class='flex w-full [&>button]:px-0'>
                        <button onclick={toggleSubmissions} class='rounded-r-none min-w-35 grow'>{`${openForSubmissions ? "Loka fyrir skil" : "Opna fyrir skil"}`}</button>
                        <button onclick={() => modals.open(ScoreModal)} class='rounded-none border-x border-slate-400 grow'>Stig</button>
                        <button onclick={nextRound} class='rounded-l-none grow'>Næsta umferð</button>
                    </div>
            </div>

        {:else}

            <div class='w-full flex flex-col overflow-auto'>
                {#each scoreboard as player, idx}
                    <div class='flex w-full justify-between px-4 py-1 border-white/40' class:border-b={idx != $game.players.length}>
                        <p class=''>{player.name}</p>
                        <p>{player.points}</p>
                    </div>
                {/each}
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