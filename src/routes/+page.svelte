<script lang='ts'>
	import HomeView from "$lib/views/HomeView.svelte";
    import GameView from "$views/GameView.svelte";
	import GameLobbyView from "$views/GameLobbyView.svelte";
	import { currentView } from "../store";

</script>

<div class='w-screen h-screen flex flex-col items-center p-4'>

    {#if $currentView == 'home'}
        <HomeView/>
    {:else if $currentView == 'game'}
        <GameView/>
    {:else if $currentView == 'lobby'}
        <GameLobbyView/>
    {/if}
</div>