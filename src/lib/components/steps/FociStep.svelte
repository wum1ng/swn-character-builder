<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { FOCI, COMBAT_FOCI, NON_COMBAT_FOCI, PSYCHIC_FOCI, getFocusById } from '$data/foci';
  import { getSkillById } from '$data/skills';
  import type { Focus } from '$types/character';

  // Track focus bonus skill choices (focusId -> chosen skillId)
  let focusSkillChoices = $state<Record<string, string>>({});
  
  let activeTab = $state<'all' | 'combat' | 'non-combat' | 'psychic'>('all');
  let expandedId = $state<string | null>(null);
  
  // Determine how many foci the character can select
  const maxFoci = $derived(() => {
    let count = 1; // Everyone gets 1
    
    // Warriors and partial warriors get a combat focus
    if (characterStore.draft.classId === 'warrior' || 
        characterStore.draft.partialClasses?.includes('partial-warrior')) {
      count++;
    }
    
    // Experts and partial experts get a non-combat focus
    if (characterStore.draft.classId === 'expert' || 
        characterStore.draft.partialClasses?.includes('partial-expert')) {
      count++;
    }
    
    return count;
  });
  
  const filteredFoci = $derived(() => {
    switch (activeTab) {
      case 'combat': return COMBAT_FOCI;
      case 'non-combat': return NON_COMBAT_FOCI;
      case 'psychic': return PSYCHIC_FOCI;
      default: return FOCI;
    }
  });
  
  function isSelected(focusId: string): boolean {
    return characterStore.draft.selectedFoci.some(f => f.focusId === focusId);
  }
  
  function getSelectedLevel(focusId: string): number {
    const found = characterStore.draft.selectedFoci.find(f => f.focusId === focusId);
    return found?.level || 0;
  }
  
  function toggleFocus(focus: Focus) {
    if (isSelected(focus.id)) {
      delete focusSkillChoices[focus.id];
      characterStore.removeFocus(focus.id);
    } else {
      characterStore.addFocus(focus.id, 1);
    }
  }

  function selectFocusBonusSkill(focusId: string, skillId: string) {
    focusSkillChoices[focusId] = skillId;
    characterStore.addFreeSkill(skillId);
  }
  
  function upgradeFocus(focusId: string) {
    characterStore.addFocus(focusId, 2);
  }
  
  function getFocusTypeColor(type: string): string {
    switch (type) {
      case 'combat': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'non-combat': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'psychic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }
</script>

<div class="space-y-6">
  <!-- Selection Count -->
  <div class="flex items-center justify-between">
    <p class="text-sm text-slate-400">
      Select {maxFoci()} focus{maxFoci() > 1 ? 'es' : ''} for your character
    </p>
    <span class="font-display text-cyan-400">
      {characterStore.draft.selectedFoci.length} / {maxFoci()}
    </span>
  </div>
  
  <!-- Tabs -->
  <div class="flex gap-2 overflow-x-auto pb-2">
    {#each [
      { id: 'all', label: 'All' },
      { id: 'combat', label: 'Combat' },
      { id: 'non-combat', label: 'Non-Combat' },
      { id: 'psychic', label: 'Psychic' }
    ] as tab}
      <button
        onclick={() => activeTab = tab.id as any}
        class="btn {activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} text-sm whitespace-nowrap"
      >
        {tab.label}
      </button>
    {/each}
  </div>
  
  <!-- Foci Grid -->
  <div class="grid gap-3 sm:grid-cols-2">
    {#each filteredFoci() as focus (focus.id)}
      {@const selected = isSelected(focus.id)}
      {@const level = getSelectedLevel(focus.id)}
      {@const isExpanded = expandedId === focus.id}
      
      <div
        class="card p-4 transition-all {selected ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-display tracking-wider text-white">{focus.name}</h4>
              <span class="px-2 py-0.5 text-xs rounded-full border {getFocusTypeColor(focus.type)}">
                {focus.type}
              </span>
            </div>
            <p class="text-xs text-slate-400">{focus.description}</p>
          </div>
          
          <button
            onclick={() => toggleFocus(focus)}
            class="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors
              {selected ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
          >
            {selected ? '✓' : '+'}
          </button>
        </div>
        
        <!-- Expand/Collapse -->
        <button
          onclick={() => expandedId = isExpanded ? null : focus.id}
          class="text-xs text-cyan-400 hover:underline"
        >
          {isExpanded ? 'Hide abilities' : 'Show abilities'}
        </button>
        
        {#if isExpanded}
          <div class="mt-3 pt-3 border-t border-slate-700 space-y-3">
            <!-- Level 1 -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-display text-cyan-400">Level 1</span>
                {#if focus.level1.bonusSkill}
                  <span class="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                    +{focus.level1.bonusSkill}
                  </span>
                {:else if focus.level1.bonusSkillChoices}
                  <span class="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                    +{focus.level1.bonusSkillChoices.map(id => getSkillById(id)?.name || id).join(' or ')}
                  </span>
                {/if}
              </div>
              <p class="text-xs text-slate-400">{focus.level1.description}</p>
            </div>
            
            <!-- Level 2 -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-display text-purple-400">Level 2</span>
              </div>
              <p class="text-xs text-slate-400">{focus.level2.description}</p>
            </div>
            
            <!-- Upgrade Button -->
            {#if selected && level === 1 && characterStore.draft.selectedFoci.length < maxFoci()}
              <button
                onclick={() => upgradeFocus(focus.id)}
                class="btn btn-secondary text-xs w-full"
              >
                Upgrade to Level 2
              </button>
            {/if}
          </div>
        {/if}
        
        <!-- Level Indicator + Bonus Skill Choice -->
        {#if selected}
          <div class="mt-3 flex gap-2">
            <span class="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400">
              Level {level}
            </span>
          </div>
          {@const focusData = getFocusById(focus.id)}
          {#if focusData?.level1.bonusSkillChoices}
            <div class="mt-2">
              {#if focusSkillChoices[focus.id]}
                <span class="text-xs text-green-400">
                  Bonus skill: {getSkillById(focusSkillChoices[focus.id])?.name || focusSkillChoices[focus.id]}
                </span>
              {:else}
                <p class="text-xs text-slate-400 mb-1">Choose bonus skill:</p>
                <select
                  class="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                  onchange={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    if (val) selectFocusBonusSkill(focus.id, val);
                  }}
                >
                  <option value="">-- Select --</option>
                  {#each focusData.level1.bonusSkillChoices as skillId}
                    <option value={skillId}>{getSkillById(skillId)?.name || skillId}</option>
                  {/each}
                </select>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>
