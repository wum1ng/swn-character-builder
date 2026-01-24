<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { BACKGROUNDS, getBackgroundById } from '$data/backgrounds';
  
  let searchQuery = $state('');
  let expandedId = $state<string | null>(null);
  
  const filteredBackgrounds = $derived(
    searchQuery
      ? BACKGROUNDS.filter(b => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : BACKGROUNDS
  );
  
  function selectBackground(id: string) {
    characterStore.setBackground(id);
  }
  
  function toggleExpand(e: MouseEvent, id: string) {
    e.stopPropagation();
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="space-y-6">
  <!-- Search -->
  <div>
    <input
      type="text"
      placeholder="Search backgrounds..."
      bind:value={searchQuery}
      class="input"
    />
  </div>
  
  <!-- Background Grid -->
  <div class="grid gap-3 sm:grid-cols-2">
    {#each filteredBackgrounds as background (background.id)}
      {@const isSelected = characterStore.draft.backgroundId === background.id}
      {@const isExpanded = expandedId === background.id}
      
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        onclick={() => selectBackground(background.id)}
        class="card card-hover p-4 text-left transition-all cursor-pointer
          {isSelected ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-display tracking-wider text-white mb-1">
              {background.name}
            </h4>
            <p class="text-xs text-slate-400 line-clamp-2">
              {background.description}
            </p>
          </div>
          
          {#if isSelected}
            <span class="ml-2 text-cyan-400">✓</span>
          {/if}
        </div>
        
        <!-- Free Skill Badge -->
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            Free: {background.freeSkill}
          </span>
        </div>
        
        <!-- Expandable Details -->
        <button
          onclick={(e) => toggleExpand(e, background.id)}
          class="mt-3 text-xs text-cyan-400 hover:underline"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
        
        {#if isExpanded}
          <div class="mt-3 pt-3 border-t border-slate-700 text-xs space-y-2">
            <div>
              <span class="text-slate-400">Quick Skills: </span>
              <span class="text-slate-300">{background.quickSkills.join(', ')}</span>
            </div>
            <div>
              <span class="text-slate-400">Learning Table: </span>
              <span class="text-slate-300">{background.learningTable.join(', ')}</span>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  {#if filteredBackgrounds.length === 0}
    <p class="text-center text-slate-500 py-8">No backgrounds match your search</p>
  {/if}
  
  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p>
      Your background represents your character's past and gives you a free skill at rank 0.
      Choose the background that best fits your character concept.
    </p>
  </div>
</div>
