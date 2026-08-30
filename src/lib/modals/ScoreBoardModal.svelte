<div></div><script lang='ts'>
	import { fade } from "svelte/transition";
    import { currentView, game, myUsername } from "$store";
	import { onMount } from "svelte";
	import api from "$api";
    import type { ModalProps } from 'svelte-modals'
	import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import ScoreModal from "./ScoreModal.svelte";
	import Scoreboard from "$compopnents/scoreboard.svelte";


    let {isOpen, close } = $props() 


    

</script>

{#if isOpen && $game}
<div role="dialog" class="modal">
    <div class="pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4 flex flex-col items-center" transition:fade|global={{duration: 150}}>
        <Scoreboard players={$game.players} myUsername={$myUsername} lightBackground={true}/>
        <button class='mt-4 bg-rose-600 text-white text-sm' onclick={close}>Loka</button>
    </div>
</div>
{/if}

<style>
@import "../../routes/layout.css";
    
  .modal {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    /* allow click-through to backdrop */
    pointer-events: none;
  }

 

</style>