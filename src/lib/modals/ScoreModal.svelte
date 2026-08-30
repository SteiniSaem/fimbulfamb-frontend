<script lang='ts'>
	import { fade } from "svelte/transition";
    import type { ModalProps } from 'svelte-modals'
    //import { game } from "$store";
    import type { Definition, Player } from '$interfaces'
	import { onMount } from "svelte";
	import api from "$api";
	import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";

    type closeValue = Player[]|null

    interface MyModalProps extends ModalProps<closeValue> {
        players: Player[]
        definitionsProp: Definition[]
    }

    interface PlayerPoints {
        playerName: string,
        points: number
    }

    let { isOpen, close, playersProp, definitionsProp,  gameCode} : MyModalProps = $props()

    let players: Player[] = $state([])
    let playerPoints: PlayerPoints[] = $state([]) // stig leikmanna fyrir þetta round
    let definitions: Definition[] = $state([])
    let errMessage = $state("")
    let isLoading = $state(false)

    onMount(() => {
        players = playersProp // playersProp og definitionsProp eru ekki reactive af eh ástæðu þannig þarf að gera $state variable
        definitions = definitionsProp

        for(let p of players){
            playerPoints = [...playerPoints, {playerName: p.name, points: 0}]
        }
    })

    async function save() {
        isLoading = true
        errMessage = ''
        if(playerPoints.map(pp => pp.points).every(val => val == 0)) close(players)
        for(let p of playerPoints){
            let player = players.find(player => player.name == p.playerName)
            if(player){
                player.points += p.points
            }
        }

        await api.put(`updateScores/${gameCode}`, {players: players}).then(() => {
            close(players)
        }).catch(err => {
            if(err.code == "ECONNABORTED") {
                errMessage = "Þjónn var of lengi a svara"
            } else {
                errMessage = err.response.data
            }
        }) 
        isLoading = false    
    }

    function getDefinitionByPlayer(playerName: string) {
        let def = definitions.find(d => d.player == playerName)
        return def ? def.definition : ''
    }

</script>

{#if isOpen}
<div role="dialog" class="modal">
    <div class="contents rounded-2xl text-slate-700 max-h-2/3 overflow-auto" transition:fade|global={{duration: 150}}>
        <!--<p class='font-semibold border-b border-slate-400/60 w-full pb-2'>Stigatafla</p>-->
        <div class='flex flex-col w-full overflow-y-auto'>
            {#if !isLoading}
                {#each playerPoints as pp, i}
                    <div class='flex justify-between items-center w-full my-2'>
                        <div class='flex flex-col min-w-0'>
                            <p>{pp.playerName}</p>
                            <p class='text-sm opacity-50 truncate'>{getDefinitionByPlayer(pp.playerName)}</p>
                        </div>
                        <div class='flex items-center select-none ml-4'>
                            <button class="p-0 h-8 w-8 bg-slate-300 hover:bg-slate-400 text-xl" onclick={() => {playerPoints[i].points -= 1}}>-</button>
                            <p class='w-12 text-center'>{pp.points}</p>
                            <button class='p-0 h-8 w-8 bg-slate-300 hover:bg-slate-400 text-xl' onclick={() => {playerPoints[i].points += 1}}>+</button>
                        </div>
                    </div>
                {/each}
            {:else}
                <div class='w-full h-full flex justify-center items-center'>
                    <LoadingIndicator bind:isLoading/>
                </div>
            {/if}
        </div>
        <p class='h-8 text-rose-500'>{errMessage}</p>
        <div class="flex justify-between w-full border-t border-slate-400/60 pt-2">
            <button class='bg-rose-600 text-white text-sm' onclick={() => close(null)}>Hætta við</button>
            <button class='bg-emerald-500 text-white text-sm' onclick={save}>Gefa stig</button>
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

  .contents {
    width: 300px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
    @apply bg-slate-200;
  }

</style>