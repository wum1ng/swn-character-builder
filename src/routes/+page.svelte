<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { getClassById } from '$data/classes';
  import type { Character } from '$types/character';

  let fileInput: HTMLInputElement;
  let importError = $state<string | null>(null);

  onMount(() => {
    characterStore.loadCharacters();
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function triggerImport() {
    fileInput?.click();
  }

  async function handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as Character;

      // Validate required fields
      if (!data.name || !data.attributes || !data.classId || !data.backgroundId) {
        throw new Error('Invalid character file: missing required fields');
      }

      // Generate new ID to avoid conflicts
      const character: Character = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await characterStore.saveCharacter(character);
      importError = null;
      goto(`${base}/character/${character.id}`);
    } catch (e) {
      importError = e instanceof Error ? e.message : 'Failed to import character';
      setTimeout(() => importError = null, 5000);
    }

    // Reset input
    input.value = '';
  }
</script>

<svelte:head>
  <title>SWN Character Builder - Stars Without Number</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
  <!-- Hero Section -->
  <section class="text-center mb-12 sm:mb-16">
    <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wider mb-4">
      <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
        Stars Without Number
      </span>
    </h1>
    <p class="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
      Create characters for your sci-fi adventures. Fast, reactive, and works anywhere.
    </p>
    
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="{base}/create" class="btn btn-primary text-base px-8 py-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create New Character
      </a>
      <a href="{base}/create?random=true" class="btn btn-secondary text-base px-8 py-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Random Character
      </a>
      <button onclick={triggerImport} class="btn btn-ghost text-base px-8 py-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import JSON
      </button>
      <input
        bind:this={fileInput}
        type="file"
        accept=".json,application/json"
        onchange={handleFileImport}
        class="hidden"
      />
    </div>
    {#if importError}
      <div class="mt-4 text-red-400 text-sm">{importError}</div>
    {/if}
  </section>
  
  <!-- Stats Cards -->
  <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
    <div class="card p-4 sm:p-6 text-center">
      <div class="text-3xl sm:text-4xl font-display font-bold text-cyan-400 mb-1">
        {characterStore.savedCharacters.length}
      </div>
      <div class="text-sm text-slate-400">Saved Characters</div>
    </div>
    <div class="card p-4 sm:p-6 text-center">
      <div class="text-3xl sm:text-4xl font-display font-bold text-purple-400 mb-1">4</div>
      <div class="text-sm text-slate-400">Classes</div>
    </div>
    <div class="card p-4 sm:p-6 text-center">
      <div class="text-3xl sm:text-4xl font-display font-bold text-green-400 mb-1">20</div>
      <div class="text-sm text-slate-400">Backgrounds</div>
    </div>
    <div class="card p-4 sm:p-6 text-center">
      <div class="text-3xl sm:text-4xl font-display font-bold text-orange-400 mb-1">22</div>
      <div class="text-sm text-slate-400">Foci</div>
    </div>
  </section>
  
  <!-- Saved Characters -->
  {#if characterStore.savedCharacters.length > 0}
    <section>
      <h2 class="font-display text-2xl tracking-wider mb-6 flex items-center gap-3">
        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Your Characters
      </h2>
      
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each characterStore.savedCharacters as character (character.id)}
          {@const background = getBackgroundById(character.backgroundId)}
          {@const charClass = getClassById(character.classId)}
          
          <div class="card card-hover p-5">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-display text-lg tracking-wide text-white">
                  {character.name || 'Unnamed Character'}
                </h3>
                <p class="text-sm text-slate-400">
                  Level {character.level} {charClass?.name || 'Unknown'}
                </p>
              </div>
              <span class="text-2xl font-display text-cyan-400">
                {character.hitPointsCurrent}/{character.hitPointsMax}
              </span>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {background?.name || 'Unknown'}
              </span>
              {#each character.foci.slice(0, 2) as focus}
                <span class="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {focus.focusId}
                </span>
              {/each}
            </div>
            
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Created {formatDate(character.createdAt)}</span>
              <div class="flex items-center gap-2">
                <a href="{base}/character/{character.id}" class="text-cyan-400 hover:underline">View</a>
                <button 
                  onclick={() => characterStore.deleteCharacter(character.id)}
                  class="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {:else if !characterStore.isLoading}
    <!-- Empty State -->
    <section class="text-center py-12">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
        <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 class="text-xl font-display tracking-wider text-slate-400 mb-2">No characters yet</h3>
      <p class="text-slate-500 mb-6">Create your first character to begin your adventure</p>
      <a href="{base}/create" class="btn btn-primary">Create Character</a>
    </section>
  {/if}
  
  <!-- Features -->
  <section class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div class="card p-6">
      <div class="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 class="font-display text-lg tracking-wider mb-2">Lightning Fast</h3>
      <p class="text-sm text-slate-400">
        Built with Svelte 5 for instant reactivity. No virtual DOM, no waiting.
      </p>
    </div>
    
    <div class="card p-6">
      <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="font-display text-lg tracking-wider mb-2">Mobile First</h3>
      <p class="text-sm text-slate-400">
        Works perfectly on phones, tablets, and desktops. Touch-friendly controls.
      </p>
    </div>
    
    <div class="card p-6">
      <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      </div>
      <h3 class="font-display text-lg tracking-wider mb-2">Offline Ready</h3>
      <p class="text-sm text-slate-400">
        Characters saved locally. Create anywhere, even without internet.
      </p>
    </div>
  </section>
</div>
