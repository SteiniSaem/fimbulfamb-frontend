<script lang='ts'>
	import type { Player } from "$interfaces";

    let { players } : {players: Player[]} = $props()

    let scoreboard = $derived(players.toSorted((a, b) => b.points - a.points))
</script>

<div class='w-full h-full flex flex-col overflow-auto'>
    {#each scoreboard as player, idx}
        <div class='flex w-full justify-between px-4 py-1 border-white/40' class:border-b={idx != players.length}>
            <div class='flex items-baseline'>
                <p class='text-sm'>{idx + 1}</p>
                <p class='ml-4 mr-8'>{player.name}</p>
            </div>
            <p>{player.points}</p>
        </div>
    {/each}
</div>
