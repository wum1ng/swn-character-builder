<script lang="ts">
  import { authStore } from '$stores/auth.svelte';
  import { syncService } from '$lib/syncService.svelte';

  interface Props {
    onSignInClick: () => void;
  }

  let { onSignInClick }: Props = $props();
</script>

{#if authStore.loading}
  <div class="text-slate-500 text-sm">...</div>
{:else if authStore.isAuthenticated}
  <div class="flex items-center gap-2">
    {#if syncService.status === 'syncing'}
      <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
      <span class="text-xs text-slate-400 hidden sm:inline">Syncing...</span>
    {:else if syncService.status === 'success'}
      <div class="w-2 h-2 rounded-full bg-green-400"></div>
      <span class="text-xs text-slate-400 hidden sm:inline">Synced</span>
    {:else if syncService.status === 'error'}
      <div class="w-2 h-2 rounded-full bg-red-400"></div>
      <span class="text-xs text-red-400 hidden sm:inline">Sync error</span>
    {:else}
      <div class="w-2 h-2 rounded-full bg-slate-400"></div>
    {/if}

    <button
      onclick={() => authStore.signOut()}
      class="text-xs text-slate-500 hover:text-slate-300 transition-colors"
    >
      Sign out
    </button>
  </div>
{:else if authStore.isCloudAvailable}
  <button
    onclick={onSignInClick}
    class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
  >
    Sign in to sync
  </button>
{:else}
  <span class="text-xs text-slate-600">Local only</span>
{/if}
