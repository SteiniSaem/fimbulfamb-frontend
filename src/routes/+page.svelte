<script lang='ts'>
	import HomeView from "$views/HomeView.svelte";
    import GameView from "$views/GameView.svelte";
	import GameLobbyView from "$views/GameLobbyView.svelte";
	import { currentView } from "../store";
    import { Modals } from 'svelte-modals'
	import { fade } from "svelte/transition";

</script>

<div class='w-screen h-screen flex flex-col items-center p-4'>

    {#if $currentView == 'home'}
        <HomeView/>
    {:else if $currentView == 'game'}
        <GameView/>
    {:else if $currentView == 'lobby'}
        <GameLobbyView/>
    {/if}


    <Modals>
    <!-- shown when any modal is opened -->
    {#snippet backdrop({ close })}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="backdrop" onclick={() => close()} transition:fade|global={{duration: 100}}></div>
    {/snippet}
    </Modals>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0,0,0,0.50)
  }
</style>