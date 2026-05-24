<script lang='ts'>
    import api from "$api";
	import { Game } from "$classes/Game";
    import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import { currentView, game, myUsername, errMessage, webSocketShouldBeClosed } from "$store"

    let code = $state('')
    let isLoading = $state(false)

    async function createGame(){
        if($myUsername.length == 0) return
        $myUsername = $myUsername.trim()

        isLoading = true;
        $errMessage = ''
        await api.put(`createNewGame/${$myUsername}`).then(res => {
            $game = new Game(res.data, $myUsername, [{name: $myUsername, points: 0}], $myUsername, [], {word: '', definition: ''});
            $webSocketShouldBeClosed = false
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
        if($myUsername.length == 0) return;
        if(code.length == 0) return;
        $myUsername = $myUsername.trim()

        isLoading = true;
        $errMessage = ''
        await api.put(`joinGame/${code}`, {username: $myUsername}).then(res => {
            $game = new Game(res.data.id, res.data.owner, res.data.players, res.data.current_player, res.data.player_definitions, res.data.current_word)
            $webSocketShouldBeClosed = false
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
</script>

<div class='flex flex-col items-center p-4 h-full'>
    <h1 class='mb-12'>Fimbulfamb</h1>

    <input type="text" placeholder="Nafn" bind:value={$myUsername}>
    <button class='my-6' onclick={createGame}>Stofna nýjan leik</button>

    <div class='flex items-center mt-6'>
        <input class='mr-4 w-30' maxlength="6" type="text" placeholder="Kóði" bind:value={code} oninput={() => code = code.toUpperCase()}>
        <button class='py-0 h-12' onclick={joinGame}>Joina leik</button>
    </div>
    <p class='text-amber-500 mt-6'>{$errMessage}</p>
    <LoadingIndicator bind:isLoading/>
</div>