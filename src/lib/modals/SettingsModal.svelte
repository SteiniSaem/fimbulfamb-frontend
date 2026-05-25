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
    let gameIsJoinable = $state(true)

    onMount(() => {
        if($game) {
            gameIsJoinable = $game.joinable
        }
    })

    function toggleJoinable() {
        if($game) {
            api.put(`setGameJoinability/${$game.code}/${$game.joinable}`).catch(err => {

                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
                $game.joinable = !$game.joinable // set value back to what it was if this fails
            })
        }
    }

    async function kickPlayer(name: string) {
        if($game) {
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
    <div class="pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4" transition:fade|global={{duration: 150}}>
        {#if !isLoading}
            <div class='flex flex-col items-center'>
                <p class='text-xl mb-4'>{$game.code}</p>
                <div class='flex w-full justify-between mb-6'>
                    <p class='mr-12'>Opna fyrir join</p>
                    <ToggleSwitch bind:value={$game.joinable} onChange={toggleJoinable}/>
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
        {:else}
            <LoadingIndicator bind:isLoading/>
        {/if}
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