<script lang='ts'>
	import api from "$api";
	import { game } from "$store";
	import { onMount } from "svelte";

    interface Word {
        word: string;
        definition: string
    }

    let word: Word = $state({word: "", definition: ""});

    onMount(() => {
        getWord();
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
</script>

<div class='h-full flex flex-col items-center justify-between'>
    <div class='flex flex-col items-center'>
        <h1 class='my-6'>{word.word}</h1>
        <p class='my-2 text-center text-2xl'>{word.definition}</p>
    </div>

    <button onclick={getWord} class='text-2xl'>Nýtt Orð</button>

</div>