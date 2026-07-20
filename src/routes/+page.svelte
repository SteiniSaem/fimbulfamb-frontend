<script lang='ts'>
	import HomeView from "$views/HomeView.svelte";
    import GameView from "$views/GameView.svelte";
	import GameLobbyView from "$views/GameLobbyView.svelte";
	import { currentView, game, myUsername, webSocket, webSocketShouldBeClosed, errMessage, isLoading } from "../store";
    import { Modals } from 'svelte-modals'
	import { fade } from "svelte/transition";
    import home from "$assets/home.png"
    import settings from "$assets/settings.png"
	import { modals } from "svelte-modals";
	import QuitModal from "$lib/modals/QuitModal.svelte";
    import SettingsModal from "$lib/modals/SettingsModal.svelte";
	import { onDestroy, onMount } from "svelte";
    import { setupWebsocketConnection } from "$lib/websocket";
	import { refreshGameState } from "$common";

    onMount(async () => {
        if($game) $game = await refreshGameState($game);

        document.addEventListener('visibilitychange', handleVisibilityChange);
    })

    onDestroy(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

   async function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // reconnect websocket if needed
            if ($game && (!$webSocket || $webSocket.readyState !== WebSocket.OPEN) && !$webSocketShouldBeClosed) {
                try {
                    $webSocket = await setupWebsocketConnection()
                }
                catch (error) {
                    let msg = (error as Error).message
                    if(msg == 'Leikur ekki til') {
                        $currentView = 'home'
                    }
                    else {
                        $errMessage = msg
                    }

                }
            }
            // fetch current game state
            if($game){    
                $game = await refreshGameState($game);      
            }
        }
    }


    async function quitMaybe() {
        let quit = await modals.open(QuitModal);
        if(quit){
            $webSocketShouldBeClosed = true;
            $webSocket?.close()
            $game = null;
            $currentView = 'home'
        }
    }

</script>

<div id='app' class='h-full flex flex-col items-center px-4 pb-4 pt-2'>
    <div class='flex justify-between w-full h-6'>
        {#if $currentView != 'home'}
            <button class='p-0 bg-transparent' onclick={quitMaybe}><img height={20} width={20} src={home} alt="home"/></button>
            {#if $game && $game.owner == $myUsername}
                <button class='p-0 bg-transparent' onclick={() => modals.open(SettingsModal)}><img height={20} width={20} src={settings} alt="Settings"/></button>
            {/if}
        {/if}
    </div>
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
        <div class="backdrop" onclick={() => close()} transition:fade|global={{duration: 250}}></div>
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

  #app {
    width: min(100%, 30rem)
  }
</style>