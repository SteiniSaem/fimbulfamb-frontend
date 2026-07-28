<script lang='ts'>
    import api from "$api";
	import { Game } from "$classes/Game";
    import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import { currentView, game, myUsername, errMessage, webSocket, webSocketShouldBeClosed } from "$store"
	import { onMount } from "svelte";
    import { setupWebsocketConnection } from '$lib/websocket';

    let code = $state('')
    let isLoading = $state(false)

    onMount(() => {
        if($webSocket && $webSocket.readyState == $webSocket.OPEN) { // if websocket is open for some reason while in the homeView, close it
            $webSocketShouldBeClosed = true
            $webSocket.close()
        }
        $errMessage = ''
    })

    async function createGame(){
        if($myUsername.length == 0 || isLoading) return
        $myUsername = $myUsername.trim()

        isLoading = true;
        $errMessage = ''
        await api.put(`createNewGame/${$myUsername}`).then(async res => {
            $game = new Game(
                res.data, // code
                $myUsername, //owner
                [{name: $myUsername, points: 0}], // players
                $myUsername, // currentPlayer
                [], // definitions
                {word: '', definition: ''}, // currentWord
                true, // joinable
                false, // wordIsVisible
                false, // hasStarted
                true, // openForSubmissions
                "" // mySubmittedDefinition
            );
            $webSocketShouldBeClosed = false
            try {
                $webSocket = await setupWebsocketConnection()
            }
            catch (error) {
                $errMessage = (error as Error).message
            }
            
            $currentView = 'lobby'
        }).catch(err => {
            if(err.code == "ECONNABORTED") {
                $errMessage = "Þjónn var of lengi a svara"
            } else {
                $errMessage = err.response.data
            }
        })
        isLoading = false;
    }

    async function joinGame(){
        if($myUsername.length == 0 || code.length == 0 || isLoading) return;
        $myUsername = $myUsername.trim()

        isLoading = true;
        $errMessage = ''        

        await api.put(`joinGame/${code}`, {username: $myUsername}).then(async res => {
            $game = new Game(
                res.data.id,
                res.data.owner,
                res.data.players,
                res.data.current_player,
                res.data.player_definitions,
                res.data.current_word,
                res.data.joinable,
                res.data.wordIsVisible,
                res.data.has_started,
                res.data.open_for_submissions,
                ""
            );

            $webSocketShouldBeClosed = false 
            try {
                $webSocket = await setupWebsocketConnection()
                $currentView = $game.hasStarted ? 'game' : 'lobby'
            }
            catch (error) {
                console.log(error)
                $errMessage = (error as Error).message
                $game = null;
                isLoading = false;
                return
            }

        }).catch(err => {
            if(err.code == "ECONNABORTED") {
                $errMessage = "Þjónn var of lengi a svara"
            } else {
                $errMessage = err.response.data
            }
        })
        isLoading = false;
    }
</script>

<div class='flex flex-col items-center p-4 h-full'>
    <h1 class='mb-12'>Fimbulfamb</h1>

    <input type="text" placeholder="Nafn" maxlength="14" bind:value={$myUsername}>
    <button class='my-6' onclick={createGame}>Stofna nýjan leik</button>

    <div class='flex items-center mt-6'>
        <input class='mr-4 w-30' maxlength="6" type="text" placeholder="Kóði" bind:value={code} oninput={() => code = code.toUpperCase()}>
        <button class='py-0 h-12' onclick={joinGame}>Joina leik</button>
    </div>
    <p class='text-amber-500 mt-6'>{$errMessage}</p>
    <LoadingIndicator bind:isLoading/>
</div>