<script lang='ts'>
	import { fade } from "svelte/transition";
	import api from "$api";
    import type { ModalProps } from 'svelte-modals'
	import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
    import ToggleSwitch from "$compopnents/ToggleSwitch.svelte";
    import { game } from "$store";
	import { onMount } from "svelte";

    let {isOpen, close }: ModalProps = $props() 
    let isLoading = $state(false)
    let errMessage = $state("")


    async function toggleJoinable() {
        if($game) {
            isLoading = true
            await api.put(`setGameJoinability/${$game.code}/${$game.joinable}`).catch(err => {

                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
                $game.joinable = !$game.joinable // set value back to what it was if this fails
            })
            isLoading = false
        }
    }

    async function toggleWordVisibility() {
        if($game) {
            isLoading = true
            await api.put(`setWordVisibility/${$game.code}/${$game.wordIsVisible}`).catch(err => {

                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
                $game.wordIsVisible = !$game.wordIsVisible // set value back to what it was if this fails
            })
            isLoading = false
        }
    }

    async function kickPlayer(name: string) {
        if($game) {
            if(isLoading) return
            isLoading = true;
            await api.put(`leaveGame/${$game.code}/`, {name: name}).catch(err => {

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

{#if isOpen && $game}
<div role="dialog" class="modal">
    <div class="pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4 relative" transition:fade|global={{duration: 150}}>

        <div class='flex flex-col items-center' class:opacity-30={isLoading}>
            <p class='text-xl mb-4'>{$game.code}</p>
            <div class='flex w-full justify-between mb-6'>
                <p class='mr-12'>Opna fyrir join</p>
                <ToggleSwitch bind:value={$game.joinable} onChange={toggleJoinable} bind:disabled={isLoading}/>
            </div>
            <div class='flex w-full justify-between mb-6'>
                <p class='mr-12'>Birta Orð</p>
                <ToggleSwitch bind:value={$game.wordIsVisible} onChange={toggleWordVisibility} bind:disabled={isLoading}/>
            </div>
            {#each $game.players as player}
                {#if player.name != $game.owner}
                <div class='flex items-center my-2 w-full justify-between'>
                    <p class='mr-12'>{player.name}</p>
                    <button class='bg-rose-600 text-white py-1 text-sm' onclick={() => kickPlayer(player.name)}>Reka úr leik</button>
                </div>
                {/if}
            {/each}
            <p class='text-rose-500'>{errMessage}</p>
        </div>
        <div class='absolute top-1/3 left-1/3'>
            <LoadingIndicator bind:isLoading />
        </div>

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