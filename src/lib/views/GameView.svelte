<script lang='ts'>
	import api from "$api";
	import { game, myUsername, webSocket } from "$store";
	import { onMount } from "svelte";

    interface Word {
        word: string;
        definition: string
    }

    let word: Word = $state({word: "", definition: ""});

    onMount(() => {
        if(!$game || !$webSocket) return
        if($game.currentPlayer == $myUsername){ // if its your turn, get the word
            getWord();
        }

        // Event: Listen for messages from server
        if($webSocket){

            $webSocket.onmessage = (msg) => {
                console.log('Message from server:', msg.data);

                if(msg.data.startsWith("Next Round")) {
                    console.log(msg.data.split('\t'))
                    $game.currentPlayer = msg.data.split('\t')[1].trim()
                    console.log($myUsername)
                    console.log($game.currentPlayer)
                    if($game.currentPlayer == $myUsername){
                        console.log("MY TURN NOW")
                        getWord()
                    }
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

    async function nextRound() {
        if($game) {
            await api.put(`nextRound/${$game.code}`)
            word = {word: '', definition: ''}
        }
    }
</script>

{#if $game}
    <div class='h-full w-full flex flex-col items-center justify-between'>
        <div class='flex flex-col items-center'>
            <h1 class='my-6'>{word.word}</h1>
            <p class='my-2 text-center text-2xl'>{word.definition}</p>
        </div>

        {#if $game.currentPlayer == $myUsername}
            <div class='flex justify-between w-full'>
                <button onclick={getWord} class='text-2xl'>Nýtt Orð</button>
                <button onclick={nextRound}>Næsta umferð</button>
            </div>
        {/if}

    </div>
{/if}