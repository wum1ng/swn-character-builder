<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { supabase } from '$lib/supabase';

  let error = $state<string | null>(null);

  onMount(async () => {
    if (!supabase) {
      error = 'Cloud sync not configured';
      return;
    }

    // Handle the OAuth/magic link callback
    const { error: authError } = await supabase.auth.getSession();

    if (authError) {
      error = authError.message;
    } else {
      // Redirect to home after successful auth
      goto(`${base}/`);
    }
  });
</script>

<svelte:head>
  <title>Signing In - SWN Character Builder</title>
</svelte:head>

<div class="min-h-[60vh] flex items-center justify-center">
  {#if error}
    <div class="card p-6 text-center">
      <div class="text-red-400 mb-4">{error}</div>
      <a href="{base}/" class="btn btn-primary">Back to Home</a>
    </div>
  {:else}
    <div class="card p-6 text-center">
      <div class="text-slate-400">Signing in...</div>
    </div>
  {/if}
</div>
