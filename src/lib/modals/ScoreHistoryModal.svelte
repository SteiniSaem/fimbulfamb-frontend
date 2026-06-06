<script lang='ts'>
	import { game } from '$store';
	import { onMount } from 'svelte';
    import type { ModalProps } from 'svelte-modals'
	import { fade, slide } from 'svelte/transition';
    import type {Player} from '$interfaces'
	import LoadingIndicator from '$compopnents/LoadingIndicator.svelte';
	import api from '$api';

    let {isOpen, close }: ModalProps = $props() 

    interface ScoreByRound {
        open: boolean,
        round: number,
        score: Player[]
    }

    let scoreHistory: ScoreByRound[] = $state([])
    let listEl: HTMLElement|null = $state(null);
    let isLoading = $state(false)
    let errMessage = $state('')


    onMount(async () => {
        if($game) {
            isLoading = true
            await api.get(`scoreHistory/${$game.code}`).then(res => {
                console.log(res.data)
                let history = res.data as {round: number, score: Player[]}[]
                for(let i = 0; i < history.length; i++) {
                    scoreHistory = [...scoreHistory, {open: false, ...history[i]}]
                }
                
            }).catch(err => {
                if(err.code == "ECONNABORTED") {
                    errMessage = "Þjónn var of lengi a svara"
                } else {
                    errMessage = err.response.data
                }
            }) 

            isLoading = false;
        }
    })


    function scrollToBottom() {
        if(listEl) listEl.scroll({ top: listEl.scrollHeight, behavior: 'smooth' });
    }

</script>

{#if isOpen}
<div role="dialog" class="modal">
    <div class="h-6/10 min-w-60 flex flex-col items-center justify-between pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4 relative" transition:fade|global={{duration: 150}}>
        <div class='flex flex-col overflow-auto items-center w-full'>
            <p class='font-semibold'>Staðan eftir umferðum</p>
            {#if !isLoading}
                <div class='overflow-auto w-full my-2' bind:this={listEl}>
                    {#each scoreHistory as item, i}

                        <div class:open={item.open} class='border-b border-slate-300 w-full'>
                            <!--Accordion item header -->
                            <button class='w-full rounded-none text-left px-2 text-slate-500' onclick={() => item.open = !item.open}>Ummferð {i+1}</button>

                            <!--Accordion item body-->
                            {#each item.score as score}
                            {#if item.open}
                                <div class='flex justify-between pl-4 pr-2' transition:slide={{duration: 200}} onintroend={() => {if(i == scoreHistory.length-1) scrollToBottom()}}>
                                    <p class='text-sm'>{score.name}</p>
                                    <p class='text-sm'>{score.points}</p>
                                </div>
                            {/if}
                            {/each}
                        </div>
                    {/each}
                </div>
            {:else}
                <LoadingIndicator bind:isLoading/>
            {/if}
        </div>
        <p class='text-rose-500'>{errMessage}</p>
        <button class='bg-pink-300 py-1' onclick={close}>Loka</button>
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