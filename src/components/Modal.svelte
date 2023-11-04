<script>
  export let showModal; // boolean

  export let dialog; // HTMLDialogElement

  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
  <div on:click|stopPropagation>
    <a
      on:click={() => {
        dialog.close();
      }}
      class="absolute right-4 top-4 text-text"
      href="javascript:void(0)">×</a
    >
    <slot />
  </div>
</dialog>

<style>
  dialog {
    width: 375px;
    border: none;
    border-radius: 10px;
    padding: 30px 10px;
    background: var(--background);
    color: var(--text);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  dialog > div {
    padding: 5px;
  }
  .exit {
    text-decoration-line: none;
    position: absolute;
    right: 5px;
    top: 10px;
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: blue;
  }

  @media only screen and (max-width: 600px) {
    dialog {
      width: 100vw;
      margin-top: 80px;
    }
  }
</style>
