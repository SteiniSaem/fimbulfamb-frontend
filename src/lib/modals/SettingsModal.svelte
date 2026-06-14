<script lang='ts'>
	import { fade, slide } from "svelte/transition";
	import api from "$api";
    import type { ModalProps } from 'svelte-modals'
	import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
    import ToggleSwitch from "$compopnents/ToggleSwitch.svelte";
    import { game } from "$store";
	import { onMount } from "svelte";
	import { modals } from "svelte-modals";
	import ScoreHistoryModal from "./ScoreHistoryModal.svelte";
    import Sortable from 'sortablejs';
    import type { Player } from '$interfaces'
    import DragAndDrop from '$assets/drag-and-drop.png'
    import SixDots from '$assets/six-dots.png'

    interface PlayerListItem extends Player {
        expanded: boolean
    }

    let {isOpen, close }: ModalProps = $props() 
    let isLoading = $state(false)
    let errMessage = $state("")
    let playerList: PlayerListItem[] = $state([])
    let playerListEl: HTMLElement | null = $state(null)

    onMount(async () => {
        if($game){
            for(let i = 0; i < $game.players.length; i++){
                playerList = [...playerList, {...$game.players[i], expanded: false}]
            }
            if(playerListEl){
                Sortable.create(playerListEl, {
                    group: {
                        name: 'player list',
                        put: true,
                        //pull: false,
                    },
                    animation: 200,
                    handle: '.handle',
                    onEnd(e){
                        playerList = reorderPlayers(playerList, e)
                    }
                });
            }
        }
    })

    async function toggleJoinable() {
        if($game) {
            errMessage = ''
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
            errMessage = ''
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
            errMessage = ''
            isLoading = true;
            await api.put(`leaveGame/${$game.code}/`, {name: name}).then(() => {

                playerList = playerList.filter(p => p.name != name)

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

    async function makeCurrentPlayer(name:string){
        if($game){
            errMessage = ''
            isLoading = true
            await api.put(`setCurrentPlayer/${$game.code}/${name}`).then(() => {
                $game.currentPlayer = name
            }).catch(err => {
                errMessage = err.response.data
            })

            isLoading = false;
        }
    }

    async function saveOrder(){
        console.log($state.snapshot(playerList))
        if($game) {
            errMessage = ''
            isLoading = true
            let playerNames = playerList.map(p => p.name)
            await api.put(`reorderPlayers/${$game.code}`, {players: playerNames}).then(res => {
                $game.players = res.data
            }).catch(err => {
                errMessage = err.response.data
            })

            isLoading = false
        }
        close()
    }


    function reorderPlayers(list: PlayerListItem[], evt: Sortable.SortableEvent) {

        // should have no effect on stores or regular array
        const workArray = $state.snapshot(list);

        // get changes
        const { oldIndex, newIndex } = evt;

        if (oldIndex === undefined || newIndex === undefined) {
            return workArray;
        }
        if (newIndex === oldIndex) {
            return workArray;
        }

        // move elements
        const target = workArray[oldIndex];
        const increment = newIndex < oldIndex ? -1 : 1;

        for (let k = oldIndex; k !== newIndex; k += increment) {
            workArray[k] = workArray[k + increment];
        }
        workArray[newIndex] = target;
        return workArray;
    }
    
</script>

{#if isOpen && $game}
<div role="dialog" class="modal">
    <div class="pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4 relative" transition:fade|global={{duration: 150}}>

        <div class='flex flex-col items-center' class:opacity-30={isLoading}>
            <p class='text-xl mb-4'>{$game.code}</p>
            <div class='flex w-full justify-between mb-4'>
                <p class='mr-12'>Opna fyrir join</p>
                <ToggleSwitch bind:value={$game.joinable} onChange={toggleJoinable} bind:disabled={isLoading}/>
            </div>
            <div class='flex w-full justify-between mb-4'>
                <p class='mr-12'>Birta Orð</p>
                <ToggleSwitch bind:value={$game.wordIsVisible} onChange={toggleWordVisibility} bind:disabled={isLoading}/>
            </div>
            <button class='mb-4 bg-slate-300' onclick={() => modals.open(ScoreHistoryModal)}>Skoða stiga sögu</button>
            <div class='w-full mb-2 border-y border-slate-400' bind:this={playerListEl}>
                {#each playerList as player, i (player.name)}
                    <div class='w-full'>
                        <div class='flex justify-between'>
                            <button class='w-full p-0 text-left rounded-none py-2 bg-transparent' class:text-indigo-500={$game.currentPlayer == player.name} onclick={() => player.expanded = !player.expanded}>{player.name}</button>
                            <button class='handle flex items-center bg-transparent p-0'><img src={SixDots} alt="drag" height="40" width="40"></button>
                        </div>
                        {#if player.expanded}
                            <div class='flex justify-between items-center pb-2' transition:slide={{duration: 200}}>
                                {#if player.name != $game.currentPlayer}
                                    <button class='bg-emerald-400 text-white text-sm px-2 py-1' onclick={() => makeCurrentPlayer(player.name)}>Gefa orðið</button>
                                {/if}
                                {#if player.name != $game.owner}
                                    <button class='bg-rose-500 text-white text-sm px-2 py-1' onclick={() => kickPlayer(player.name)}>Reka úr leik</button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class='flex justify-between w-full'>
                <button class='bg-rose-500 text-white p-2 text-sm' onclick={close}>Hætta við</button>
                <button class='bg-emerald-400 text-white p-2 text-sm' onclick={saveOrder}>Vista röðun</button>
            </div>
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