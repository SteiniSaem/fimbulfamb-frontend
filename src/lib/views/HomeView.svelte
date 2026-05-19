<script lang='ts'>
	import api from "$api";
    import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import { currentView, game, myUsername } from "$store"

    let code = $state('')
    let errorMessage = $state('')
    let isLoading = $state(false)

    async function createGame(){
        if($myUsername.length == 0) return
        $myUsername = $myUsername.trim()
        
        isLoading = true;
        await api.put(`createNewGame/${$myUsername}`).then(res => {
            $game = {code: res.data, owner: $myUsername, players: [{name: $myUsername, points: 0}], currentPlayer: ''}
            $currentView = 'lobby'
        }).catch(err => {
            console.log(err)
        })
        isLoading = false;
    }

    async function joinGame(){
        if($myUsername.length == 0) return;
        if(code.length == 0) return;
        $myUsername = $myUsername.trim()

        isLoading = true;
        await api.put(`joinGame/${code}/${$myUsername}`).then(res => {
            $game = {code: res.data.id, owner: res.data.owner, players: res.data.players, currentPlayer: ''}
            $currentView = 'lobby'
        }).catch(err => {
            //console.log(err.response.data)
            errorMessage = err.response.data
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
    <p class='text-rose-600 mt-6'>{errorMessage}</p>
    <LoadingIndicator bind:isLoading/>
</div>