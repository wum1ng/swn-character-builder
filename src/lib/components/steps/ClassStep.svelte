<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { CLASSES, ADVENTURER_COMBINATIONS, PARTIAL_CLASSES } from '$data/classes';
  import type { ClassName } from '$types/character';
  
  let selectedAdventurerCombo = $state<string | null>(null);
  
  const basicClasses = CLASSES.filter(c => c.id !== 'adventurer');
  const adventurerClass = CLASSES.find(c => c.id === 'adventurer');
  
  function selectClass(classId: ClassName) {
    if (classId === 'adventurer') return; // Use combo selector
    characterStore.setClass(classId as 'expert' | 'warrior' | 'psychic');
    selectedAdventurerCombo = null;
  }
  
  function selectAdventurerCombo(comboId: string) {
    const combo = ADVENTURER_COMBINATIONS.find(c => c.id === comboId);
    if (combo) {
      characterStore.setAdventurerClass(combo.partials[0], combo.partials[1]);
      selectedAdventurerCombo = comboId;
    }
  }
  
  function getClassIcon(classId: string): string {
    switch (classId) {
      case 'expert': return '🔧';
      case 'warrior': return '⚔️';
      case 'psychic': return '🧠';
      case 'adventurer': return '🌟';
      default: return '•';
    }
  }
</script>

<div class="space-y-8">
  <!-- Basic Classes -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">Choose Your Class</h3>
    <div class="grid gap-4 sm:grid-cols-3">
      {#each basicClasses as cls (cls.id)}
        {@const isSelected = characterStore.draft.classId === cls.id && !characterStore.draft.partialClasses}
        
        <button
          onclick={() => selectClass(cls.id)}
          class="card card-hover p-5 text-left {isSelected ? 'border-cyan-500 border-glow-blue' : ''}"
        >
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">{getClassIcon(cls.id)}</span>
            <h4 class="font-display text-lg tracking-wider text-white">{cls.name}</h4>
          </div>
          
          <p class="text-sm text-slate-400 mb-4 line-clamp-3">{cls.description}</p>
          
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-500">Hit Die:</span>
              <span class="text-cyan-400">{cls.hitDie}</span>
            </div>
            {#if cls.bonusFocus}
              <div class="flex items-center gap-2">
                <span class="text-slate-500">Bonus Focus:</span>
                <span class="text-purple-400">{cls.bonusFocus === 'combat' ? 'Combat' : 'Non-combat'}</span>
              </div>
            {/if}
          </div>
          
          {#if isSelected}
            <div class="mt-4 pt-4 border-t border-slate-700">
              <h5 class="text-xs font-display tracking-wider text-cyan-400 mb-2">Class Abilities</h5>
              <ul class="text-xs text-slate-400 space-y-1">
                {#each cls.abilities as ability}
                  <li class="flex gap-2">
                    <span class="text-cyan-500">•</span>
                    <span>{ability}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Adventurer (Multiclass) -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">
      <span class="text-2xl mr-2">{getClassIcon('adventurer')}</span>
      Adventurer (Multiclass)
    </h3>
    <p class="text-sm text-slate-400 mb-4">
      Combine two partial classes for more versatility but less specialization.
    </p>
    
    <div class="grid gap-3 sm:grid-cols-3">
      {#each ADVENTURER_COMBINATIONS as combo (combo.id)}
        {@const isSelected = selectedAdventurerCombo === combo.id}
        {@const partial1 = PARTIAL_CLASSES.find(p => p.id === combo.partials[0])}
        {@const partial2 = PARTIAL_CLASSES.find(p => p.id === combo.partials[1])}
        
        <button
          onclick={() => selectAdventurerCombo(combo.id)}
          class="card card-hover p-4 text-left {isSelected ? 'border-cyan-500 border-glow-blue' : ''}"
        >
          <h4 class="font-display tracking-wider text-white mb-2">{combo.name}</h4>
          
          <div class="space-y-2 text-xs text-slate-400">
            {#if partial1}
              <div class="flex gap-2">
                <span class="text-purple-400">•</span>
                <span>{partial1.name}</span>
              </div>
            {/if}
            {#if partial2}
              <div class="flex gap-2">
                <span class="text-purple-400">•</span>
                <span>{partial2.name}</span>
              </div>
            {/if}
          </div>
          
          {#if isSelected && partial1 && partial2}
            <div class="mt-3 pt-3 border-t border-slate-700 text-xs space-y-3">
              <div>
                <h5 class="text-cyan-400 mb-1">{partial1.name}</h5>
                <ul class="text-slate-400 space-y-1">
                  {#each partial1.abilities as ability}
                    <li>• {ability}</li>
                  {/each}
                </ul>
              </div>
              <div>
                <h5 class="text-cyan-400 mb-1">{partial2.name}</h5>
                <ul class="text-slate-400 space-y-1">
                  {#each partial2.abilities as ability}
                    <li>• {ability}</li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>
