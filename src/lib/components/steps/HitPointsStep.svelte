<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { getAttributeModifier, formatModifier } from '$data/attributes';
  
  let isRolling = $state(false);
  let diceResult = $state<number | null>(null);
  let useMaxHP = $state(false);
  
  const conMod = $derived(
    characterStore.draft.attributes.constitution 
      ? getAttributeModifier(characterStore.draft.attributes.constitution)
      : 0
  );
  
  const isWarrior = $derived(
    characterStore.draft.classId === 'warrior' ||
    characterStore.draft.partialClasses?.includes('partial-warrior')
  );
  
  const hasDieHard = $derived(
    characterStore.draft.selectedFoci.some(f => f.focusId === 'die-hard')
  );
  
  const classBonus = $derived(isWarrior ? 2 : 0);
  const focusBonus = $derived(hasDieHard ? 2 : 0);
  
  async function rollHitPoints() {
    isRolling = true;
    useMaxHP = false;

    // Animate the roll
    for (let i = 0; i < 8; i++) {
      diceResult = Math.floor(Math.random() * 6) + 1;
      await new Promise(r => setTimeout(r, 80));
    }

    // Final roll
    const finalRoll = Math.floor(Math.random() * 6) + 1;
    diceResult = finalRoll;
    characterStore.draft.hitPointRoll = finalRoll;

    // Calculate total
    let hp = finalRoll + conMod + classBonus + focusBonus;
    characterStore.draft.hitPoints = Math.max(1, hp);

    isRolling = false;
  }

  function applyMaxHP() {
    useMaxHP = true;
    diceResult = 6;
    characterStore.draft.hitPointRoll = 6;
    let hp = 6 + conMod + classBonus + focusBonus;
    characterStore.draft.hitPoints = Math.max(1, hp);
  }
</script>

<div class="space-y-8">
  <!-- Explanation -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">Roll for Hit Points</h3>
    <p class="text-sm text-slate-400">
      Your hit points represent your health, stamina, and luck. Roll 1d6 and add your 
      Constitution modifier. Warriors and characters with certain foci get bonus HP.
    </p>
  </div>
  
  <!-- Calculation Display -->
  <div class="card p-6 max-w-md mx-auto">
    <div class="text-center mb-6">
      <!-- Dice Display -->
      <div class="relative inline-block">
        <div 
          class="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 
                 flex items-center justify-center text-4xl font-display text-white
                 {isRolling ? 'dice-rolling' : ''}"
        >
          {#if diceResult}
            {diceResult}
          {:else}
            <span class="text-slate-500">?</span>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Breakdown -->
    <div class="space-y-3 text-sm">
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-400">1d6 Roll</span>
        <span class="font-display text-lg {diceResult ? 'text-white' : 'text-slate-500'}">
          {characterStore.draft.hitPointRoll ?? '—'}
        </span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-400">Constitution Modifier</span>
        <span class="font-display text-lg {conMod >= 0 ? 'text-green-400' : 'text-red-400'}">
          {formatModifier(conMod)}
        </span>
      </div>
      
      {#if classBonus > 0}
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
          <span class="text-slate-400">Warrior Class Bonus</span>
          <span class="font-display text-lg text-cyan-400">+{classBonus}</span>
        </div>
      {/if}
      
      {#if focusBonus > 0}
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
          <span class="text-slate-400">Die Hard Focus</span>
          <span class="font-display text-lg text-purple-400">+{focusBonus}</span>
        </div>
      {/if}
      
      <div class="flex justify-between items-center pt-4">
        <span class="font-display text-cyan-400">Total Hit Points</span>
        <span class="font-display text-3xl text-glow-blue text-cyan-400">
          {characterStore.draft.hitPoints ?? '—'}
        </span>
      </div>
    </div>
  </div>
  
  <!-- Roll / Max HP Buttons -->
  <div class="text-center space-y-3">
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button
        onclick={rollHitPoints}
        disabled={isRolling}
        class="btn btn-primary px-8 py-4 text-lg"
      >
        {#if isRolling}
          Rolling...
        {:else if characterStore.draft.hitPoints && !useMaxHP}
          Reroll Hit Points
        {:else}
          Roll Hit Points
        {/if}
      </button>
      <button
        onclick={applyMaxHP}
        disabled={isRolling}
        class="btn btn-secondary px-6 py-4 text-lg {useMaxHP ? 'border-green-500 border-glow-blue' : ''}"
      >
        Max HP (6)
      </button>
    </div>

    {#if characterStore.draft.hitPoints}
      <p class="text-sm text-slate-400">
        {#if useMaxHP}
          Using maximum roll of 6 for level 1.
        {:else}
          You can reroll if you don't like the result, or use Max HP.
        {/if}
      </p>
    {/if}
  </div>

  <!-- Info -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p>
      <strong class="text-cyan-400">Note:</strong> No penalty can reduce your maximum hit points below 1.
      At higher levels, you'll roll additional dice and add your Constitution modifier again.
    </p>
    <p class="mt-2">
      <strong class="text-cyan-400">Max HP:</strong> Some groups allow starting characters to take
      the maximum roll (6) instead of rolling for hit points.
    </p>
  </div>
</div>
