<script lang='ts'>
	import { fade } from "svelte/transition";
    import { currentView, game } from "$store";
	import { onMount } from "svelte";
	import api from "$api";
    import type { ModalProps } from 'svelte-modals'
	import LoadingIndicator from "$compopnents/LoadingIndicator.svelte";
	import { myUsername } from "$store";

    interface MyModalProps extends ModalProps<boolean> {
        quit: boolean
    }


    let {isOpen, close }: MyModalProps = $props() 
    let isLoading = $state(false)
    let errMessage = $state("")

    
</script>

{#if isOpen}
<div role="dialog" class="modal">
    <div class="pointer-events-auto bg-slate-200 rounded-2xl text-slate-700 p-4" transition:fade|global={{duration: 150}}>
        {#if !isLoading}
            <p>Penis</p>
        {:else}
            <LoadingIndicator bind:isLoading/>
        {/if}
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

 

</style>