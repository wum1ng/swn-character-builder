<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { 
    ATTRIBUTE_NAMES, 
    ATTRIBUTE_DESCRIPTIONS, 
    STANDARD_ARRAY,
    formatModifier,
    getAttributeModifier,
    roll3d6
  } from '$data/attributes';
  import type { AttributeKey } from '$types/character';
  
  type Method = 'random' | 'array' | 'random-reorder' | 'custom';
  
  let selectedMethod = $state<Method>('random');
  let isRolling = $state(false);
  let lastRolls = $state<Record<AttributeKey, number[]>>({} as any);
  let arrayAssignments = $state<Record<AttributeKey, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null
  });
  
  const attributes: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  
  function getAvailableArrayValues(): number[] {
    const assigned = Object.values(arrayAssignments).filter(v => v !== null) as number[];
    return STANDARD_ARRAY.filter(v => {
      const countInArray = STANDARD_ARRAY.filter(x => x === v).length;
      const countAssigned = assigned.filter(x => x === v).length;
      return countAssigned < countInArray;
    });
  }
  
  async function rollAll() {
    isRolling = true;
    
    // Animate
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 100));
      for (const attr of attributes) {
        const { rolls, total } = roll3d6();
        lastRolls[attr] = rolls;
        characterStore.draft.attributes[attr] = total;
      }
    }
    
    characterStore.draft.attributeMethod = 'random';
    characterStore.draft.replacedAttribute = undefined;
    isRolling = false;
  }
  
  function assignArrayValue(attr: AttributeKey, value: number | null) {
    // Remove old assignment
    if (arrayAssignments[attr] !== null) {
      characterStore.draft.attributes[attr] = undefined as any;
    }
    
    arrayAssignments[attr] = value;
    
    if (value !== null) {
      characterStore.draft.attributes[attr] = value;
    }
    
    characterStore.draft.attributeMethod = 'array';
  }
  
  function replaceWith14(attr: AttributeKey) {
    characterStore.draft.attributes[attr] = 14;
    characterStore.draft.replacedAttribute = attr;
  }
</script>

<div class="space-y-8">
  <!-- Method Selection -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">Choose Method</h3>
    <div class="grid grid-cols-2 gap-3">
      <button
        onclick={() => { selectedMethod = 'random'; }}
        class="card card-hover p-4 text-left {selectedMethod === 'random' ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="font-display text-sm tracking-wider mb-1">Random</div>
        <div class="text-xs text-slate-400">Roll 3d6 for each, replace one with 14</div>
      </button>
      
      <button
        onclick={() => { selectedMethod = 'array'; }}
        class="card card-hover p-4 text-left {selectedMethod === 'array' ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="font-display text-sm tracking-wider mb-1">Standard Array</div>
        <div class="text-xs text-slate-400">Assign 14, 12, 11, 10, 9, 7</div>
      </button>
    </div>
  </div>
  
  <!-- Roll Button for Random -->
  {#if selectedMethod === 'random'}
    <div class="text-center">
      <button 
        onclick={rollAll}
        disabled={isRolling}
        class="btn btn-primary px-8 {isRolling ? 'dice-rolling' : ''}"
      >
        {#if isRolling}
          Rolling...
        {:else}
          🎲 Roll All Attributes
        {/if}
      </button>
    </div>
  {/if}
  
  <!-- Attributes Grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each attributes as attr}
      {@const score = characterStore.draft.attributes[attr]}
      {@const mod = score ? getAttributeModifier(score) : 0}
      {@const isReplaced = characterStore.draft.replacedAttribute === attr}
      
      <div class="card p-4 {isReplaced ? 'border-cyan-500' : ''}">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-display tracking-wider {isReplaced ? 'text-cyan-400' : 'text-white'}">
              {ATTRIBUTE_NAMES[attr]}
            </h4>
            <p class="text-xs text-slate-500">{ATTRIBUTE_DESCRIPTIONS[attr]}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 mt-3">
          {#if selectedMethod === 'random'}
            <!-- Show score and modifier -->
            <div class="flex-1">
              {#if score !== undefined}
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-display text-white">{score}</span>
                  <span class="text-lg font-display {mod >= 0 ? 'text-green-400' : 'text-red-400'}">
                    {formatModifier(mod)}
                  </span>
                  {#if lastRolls[attr]?.length}
                    <span class="text-xs text-slate-500">
                      ({lastRolls[attr].join(' + ')})
                    </span>
                  {/if}
                </div>
              {:else}
                <span class="text-slate-600">Roll to generate</span>
              {/if}
            </div>
            
            <!-- Replace with 14 button -->
            {#if score !== undefined && score !== 14 && !characterStore.draft.replacedAttribute}
              <button
                onclick={() => replaceWith14(attr)}
                class="text-xs text-cyan-400 hover:underline"
              >
                Set to 14
              </button>
            {/if}
            
          {:else if selectedMethod === 'array'}
            <!-- Dropdown for array assignment -->
            <select
              value={arrayAssignments[attr] ?? ''}
              onchange={(e) => assignArrayValue(attr, e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
              class="input select flex-1"
            >
              <option value="">Select...</option>
              {#each getAvailableArrayValues() as value}
                <option value={value}>{value}</option>
              {/each}
              {#if arrayAssignments[attr] !== null}
                <option value={arrayAssignments[attr]} selected>{arrayAssignments[attr]}</option>
              {/if}
            </select>
            
            {#if score !== undefined}
              <span class="text-lg font-display {mod >= 0 ? 'text-green-400' : 'text-red-400'}">
                {formatModifier(mod)}
              </span>
            {/if}
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p class="mb-2">
      <strong class="text-cyan-400">Modifiers:</strong> 
      3 = -2, 4-7 = -1, 8-13 = +0, 14-17 = +1, 18 = +2
    </p>
    <p>
      Attributes affect your skill checks, combat abilities, and saving throws.
      {#if selectedMethod === 'random'}
        After rolling, you may replace one score with 14.
      {/if}
    </p>
  </div>
</div>
