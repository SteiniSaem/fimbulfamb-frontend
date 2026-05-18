<script>
	import { fade } from "svelte/transition";

  const {
    // provided by <Modals />
    isOpen,
    close,

    // your props
    title,
    message
  } = $props()



</script>

{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents rounded-2xl border-blue-3" transition:fade|global={{duration: 150}}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div class="actions">
        <button onclick={() => close()}>OK</button>
      </div>
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

  .contents {
    min-width: 240px;
    padding: 16px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
  }

</style>