<script lang='ts'>
	import type { Player } from "$interfaces";

    let { players, myUsername, size='normal', lightBackground=false } : {players: Player[], myUsername: string, size?: string, lightBackground?: boolean} = $props()

    let scoreboard = $derived(players.toSorted((a, b) => b.points - a.points))
</script>

<div class='w-full h-full flex flex-col overflow-auto'>
    {#each scoreboard as player, idx}
        <div class={`flex w-full justify-between px-4 py-1 ${lightBackground ? 'border-slate-400' : 'border-white/40'}`} class:border-b={idx != players.length} class:text-pink-300={player.name == myUsername && !lightBackground} class:text-pink-500={player.name == myUsername && lightBackground}>
            <div class='flex items-baseline'>
                <p class='text-sm' class:text-xs={size=='small'}>{idx + 1}</p>
                <p class='ml-4 mr-8' class:text-sm={size=='small'}>{player.name}</p>
            </div>
            <p class:text-sm={size=='small'}>{player.points}</p>
        </div>
    {/each}
</div>
