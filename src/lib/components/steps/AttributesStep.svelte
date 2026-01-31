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

  type Method = 'random' | 'array';

  let selectedMethod = $state<Method>('random');
  let isRolling = $state(false);
  let hasRolled = $state(false);
  let allowReroll = $state(false);
  let rearrangeMode = $state(false);
  let swapSource = $state<AttributeKey | null>(null);
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

  // Check if stats were already rolled from a previous visit to this step
  const existingScores = attributes.every(a => characterStore.draft.attributes[a] !== undefined);
  if (existingScores && characterStore.draft.attributeMethod === 'random') {
    hasRolled = true;
  }

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
    rearrangeMode = false;
    swapSource = null;

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
    hasRolled = true;
    allowReroll = false;
  }

  function assignArrayValue(attr: AttributeKey, value: number | null) {
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

  function handleAttrClick(attr: AttributeKey) {
    if (!rearrangeMode) return;

    if (swapSource === null) {
      swapSource = attr;
    } else if (swapSource === attr) {
      swapSource = null;
    } else {
      // Swap the two attributes
      const temp = characterStore.draft.attributes[swapSource];
      characterStore.draft.attributes[swapSource] = characterStore.draft.attributes[attr];
      characterStore.draft.attributes[attr] = temp;

      // Swap the roll details too
      if (lastRolls[swapSource] && lastRolls[attr]) {
        const tempRolls = lastRolls[swapSource];
        lastRolls[swapSource] = lastRolls[attr];
        lastRolls[attr] = tempRolls;
      }

      // If the replaced attribute was one of the swapped, update it
      if (characterStore.draft.replacedAttribute === swapSource) {
        characterStore.draft.replacedAttribute = attr;
      } else if (characterStore.draft.replacedAttribute === attr) {
        characterStore.draft.replacedAttribute = swapSource;
      }

      swapSource = null;
    }
  }

  function toggleRearrange() {
    rearrangeMode = !rearrangeMode;
    swapSource = null;
  }

  function toggleReroll() {
    allowReroll = !allowReroll;
    if (allowReroll) {
      rearrangeMode = false;
      swapSource = null;
    }
  }

  function switchMethod(method: Method) {
    selectedMethod = method;
    hasRolled = false;
    allowReroll = false;
    rearrangeMode = false;
    swapSource = null;
    characterStore.draft.replacedAttribute = undefined;
    if (method === 'array') {
      arrayAssignments = {
        strength: null, dexterity: null, constitution: null,
        intelligence: null, wisdom: null, charisma: null
      };
      for (const attr of attributes) {
        characterStore.draft.attributes[attr] = undefined as any;
      }
    }
  }
</script>

<div class="space-y-8">
  <!-- Method Selection -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">Choose Method</h3>
    <div class="grid grid-cols-2 gap-3">
      <button
        onclick={() => switchMethod('random')}
        class="card card-hover p-4 text-left {selectedMethod === 'random' ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="font-display text-sm tracking-wider mb-1">Random</div>
        <div class="text-xs text-slate-400">Roll 3d6 for each, replace one with 14</div>
      </button>

      <button
        onclick={() => switchMethod('array')}
        class="card card-hover p-4 text-left {selectedMethod === 'array' ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="font-display text-sm tracking-wider mb-1">Standard Array</div>
        <div class="text-xs text-slate-400">Assign 14, 12, 11, 10, 9, 7</div>
      </button>
    </div>
  </div>

  <!-- Roll Button / Toggles for Random -->
  {#if selectedMethod === 'random'}
    {#if !hasRolled || allowReroll}
      <div class="text-center">
        <button
          onclick={rollAll}
          disabled={isRolling}
          class="btn btn-primary px-8 {isRolling ? 'dice-rolling' : ''}"
        >
          {#if isRolling}
            Rolling...
          {:else if hasRolled}
            Reroll All Attributes
          {:else}
            Roll All Attributes
          {/if}
        </button>
      </div>
    {/if}

    {#if hasRolled && !isRolling}
      <div class="flex flex-wrap justify-center gap-3">
        <button
          onclick={toggleReroll}
          class="px-4 py-2 text-sm rounded-lg border transition-colors {
            allowReroll
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
          }"
        >
          {allowReroll ? 'Reroll Unlocked' : 'Unlock Reroll'}
        </button>
        <button
          onclick={toggleRearrange}
          class="px-4 py-2 text-sm rounded-lg border transition-colors {
            rearrangeMode
              ? 'border-purple-500 bg-purple-500/10 text-purple-300'
              : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
          }"
        >
          {rearrangeMode ? 'Rearranging...' : 'Rearrange Stats'}
        </button>
      </div>

      {#if rearrangeMode}
        <p class="text-center text-sm text-purple-300">
          {#if swapSource}
            Now click another attribute to swap with <strong>{ATTRIBUTE_NAMES[swapSource]}</strong>
          {:else}
            Click an attribute to select it, then click another to swap them
          {/if}
        </p>
      {/if}
    {/if}
  {/if}

  <!-- Attributes Grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each attributes as attr}
      {@const score = characterStore.draft.attributes[attr]}
      {@const mod = score ? getAttributeModifier(score) : 0}
      {@const isReplaced = characterStore.draft.replacedAttribute === attr}
      {@const isSwapSelected = rearrangeMode && swapSource === attr}

      <button
        type="button"
        onclick={() => handleAttrClick(attr)}
        disabled={!rearrangeMode}
        class="card p-4 text-left transition-all {
          isSwapSelected ? 'border-purple-500 ring-1 ring-purple-500/50' :
          isReplaced ? 'border-cyan-500' :
          rearrangeMode ? 'border-slate-600 hover:border-purple-400 cursor-pointer' :
          ''
        }"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-display tracking-wider {
              isSwapSelected ? 'text-purple-400' :
              isReplaced ? 'text-cyan-400' :
              'text-white'
            }">
              {ATTRIBUTE_NAMES[attr]}
            </h4>
            <p class="text-xs text-slate-500">{ATTRIBUTE_DESCRIPTIONS[attr]}</p>
          </div>
          {#if isSwapSelected}
            <span class="px-2 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300">SELECTED</span>
          {/if}
        </div>

        <div class="flex items-center gap-4 mt-3">
          {#if selectedMethod === 'random'}
            <div class="flex-1">
              {#if score !== undefined}
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-display text-white">{score}</span>
                  <span class="text-lg font-display {mod >= 0 ? 'text-green-400' : 'text-red-400'}">
                    {formatModifier(mod)}
                  </span>
                  {#if lastRolls[attr]?.length && !rearrangeMode}
                    <span class="text-xs text-slate-500">
                      ({lastRolls[attr].join(' + ')})
                    </span>
                  {/if}
                </div>
              {:else}
                <span class="text-slate-600">Roll to generate</span>
              {/if}
            </div>

            {#if hasRolled && !rearrangeMode && !allowReroll && score !== undefined && score !== 14 && !characterStore.draft.replacedAttribute}
              <button
                onclick={(e) => { e.stopPropagation(); replaceWith14(attr); }}
                class="text-xs text-cyan-400 hover:underline"
              >
                Set to 14
              </button>
            {/if}

          {:else if selectedMethod === 'array'}
            <select
              value={arrayAssignments[attr] ?? ''}
              onchange={(e) => assignArrayValue(attr, e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
              onclick={(e) => e.stopPropagation()}
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
      </button>
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
      {#if selectedMethod === 'random' && !hasRolled}
        Roll 3d6 for each attribute, then you may replace one with 14.
      {:else if selectedMethod === 'random' && hasRolled}
        Stats are locked. Use <strong class="text-yellow-300">Unlock Reroll</strong> to roll again
        or <strong class="text-purple-300">Rearrange Stats</strong> to swap values between attributes.
        {#if !characterStore.draft.replacedAttribute}
          You may also replace one score with 14.
        {/if}
      {/if}
    </p>
  </div>
</div>
