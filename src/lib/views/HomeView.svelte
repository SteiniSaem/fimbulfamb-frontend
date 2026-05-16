<script lang='ts'>
	import api from "$api";
    import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import { currentView, game, myUsername } from "$store"

    let username = $state("")
    let code = $state('')
    let errorMessage = $state('')
    let isLoading = $state(false)

    async function createGame(){
        if(username.length == 0) return
        isLoading = true;
        await api.put(`createNewGame/${username}`).then(res => {
            $game = {code: res.data, owner: username, players: [{name: username, points: 0}]}
            $myUsername = username
            $currentView = 'lobby'
        }).catch(err => {
            console.log(err)
        })
        isLoading = false;
    }

    async function joinGame(){
        if(username.length == 0) return;
        if(code.length == 0) return;

        isLoading = true;
        await api.put(`joinGame/${code}/${username}`).then(res => {
            $game = {code: res.data.id, owner: res.data.owner, players: res.data.players}
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

    <input type="text" placeholder="Nafn" bind:value={username}>
    <button class='my-6' onclick={createGame}>Stofna nýjan leik</button>

    <div class='flex items-center mt-6'>
        <input class='mr-4 w-30' maxlength="6" type="text" placeholder="Kóði" bind:value={code} oninput={() => code = code.toUpperCase()}>
        <button class='py-0 h-12' onclick={joinGame}>Joina leik</button>
    </div>
    <p class='text-rose-600 mt-6'>{errorMessage}</p>
    <LoadingIndicator bind:isLoading/>
</div>