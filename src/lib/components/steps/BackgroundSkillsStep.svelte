<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { SKILLS, COMBAT_SKILLS, getSkillById } from '$data/skills';
  import { PHYSICAL_ATTRIBUTES, MENTAL_ATTRIBUTES } from '$data/attributes';
  import type { AttributeKey, GrowthEntry } from '$types/character';

  type SkillMethod = 'quick' | 'roll' | null;
  type TableType = 'growth' | 'learning';

  interface RollResult {
    dieRoll: number;
    tableType: TableType | null;
    result: GrowthEntry | string | null;
    applied: boolean;
    choice?: string;
    splitBonus?: { attr1: AttributeKey; attr2: AttributeKey };
  }

  let selectedMethod = $state<SkillMethod>(null);
  let rolls = $state<RollResult[]>([]);

  const background = $derived(
    characterStore.draft.backgroundId
      ? getBackgroundById(characterStore.draft.backgroundId)
      : null
  );

  const nonPsychicSkills = SKILLS.filter(s => !s.isPsychic);

  function selectQuickSkills() {
    if (!background) return;
    selectedMethod = 'quick';

    // Add quick skills
    for (const skillId of background.quickSkills) {
      if (skillId === 'any-combat') {
        // Will need to pick later
      } else if (skillId === 'any-skill') {
        // Will need to pick later
      } else {
        characterStore.addSkill(skillId, 0);
      }
    }
    characterStore.draft.backgroundSkillMethod = 'pick';
    characterStore.draft.pickedSkills = ['done'];
  }

  function rollDice() {
    if (!background) return;
    selectedMethod = 'roll';

    // Roll 3 dice - player assigns each to growth or learning
    rolls = [1, 2, 3].map(() => {
      const dieRoll = Math.floor(Math.random() * 6) + 1; // d6 for growth, d8 for learning
      return {
        dieRoll,
        tableType: null,
        result: null,
        applied: false
      };
    });

    characterStore.draft.backgroundSkillMethod = 'roll';
  }

  function assignToTable(index: number, tableType: TableType) {
    if (!background) return;
    const roll = rolls[index];
    if (roll.tableType !== null) return; // Already assigned

    if (tableType === 'growth') {
      const entry = background.growthTable.find(e => e.roll === roll.dieRoll);
      rolls[index] = { ...roll, tableType, result: entry || null };
    } else {
      // For learning, use modulo to fit d6 roll into d8 table (re-roll if > 8 entries, or wrap)
      const learningIndex = (roll.dieRoll - 1) % background.learningTable.length;
      const skill = background.learningTable[learningIndex];
      rolls[index] = { ...roll, tableType, result: skill };
    }
  }

  function applyRoll(index: number, choice?: string, splitBonus?: { attr1: AttributeKey; attr2: AttributeKey }) {
    const roll = rolls[index];
    if (roll.applied || !roll.result) return;

    if (roll.tableType === 'growth') {
      const entry = roll.result as GrowthEntry;

      if (entry.type === 'attribute') {
        if (splitBonus) {
          // Apply +1 to two different attributes
          const current1 = characterStore.draft.attributes[splitBonus.attr1] || 10;
          const current2 = characterStore.draft.attributes[splitBonus.attr2] || 10;
          characterStore.draft.attributes[splitBonus.attr1] = current1 + 1;
          characterStore.draft.attributes[splitBonus.attr2] = current2 + 1;
          rolls[index] = { ...roll, applied: true, splitBonus };
        } else if (choice) {
          const attr = choice as AttributeKey;
          const current = characterStore.draft.attributes[attr] || 10;
          characterStore.draft.attributes[attr] = current + (entry.value as number);
          rolls[index] = { ...roll, applied: true, choice };
        }
      } else if (entry.type === 'skill') {
        characterStore.addSkill(entry.value as string, 0);
        rolls[index] = { ...roll, applied: true };
      } else if (entry.type === 'any_skill') {
        if (choice) {
          characterStore.addSkill(choice, 0);
          rolls[index] = { ...roll, applied: true, choice };
        }
      } else if (entry.type === 'any_combat') {
        if (choice) {
          characterStore.addSkill(choice, 0);
          rolls[index] = { ...roll, applied: true, choice };
        }
      }
    } else if (roll.tableType === 'learning') {
      let skillToAdd = roll.result as string;

      if (skillToAdd === 'any-combat' || skillToAdd === 'any-skill') {
        if (!choice) return;
        skillToAdd = choice;
      }

      characterStore.addSkill(skillToAdd, 0);
      rolls[index] = { ...roll, applied: true, choice };
    }
  }

  function getAttributeOptions(type: 'physical' | 'mental' | 'any'): AttributeKey[] {
    if (type === 'physical') return [...PHYSICAL_ATTRIBUTES];
    if (type === 'mental') return [...MENTAL_ATTRIBUTES];
    return [...PHYSICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES];
  }

  // For split bonus selection
  let splitSelections = $state<Record<number, { attr1?: AttributeKey; attr2?: AttributeKey }>>({});

  function selectSplitAttr(rollIndex: number, which: 'attr1' | 'attr2', attr: AttributeKey) {
    if (!splitSelections[rollIndex]) {
      splitSelections[rollIndex] = {};
    }
    splitSelections[rollIndex][which] = attr;
  }

  function applySplitBonus(rollIndex: number) {
    const sel = splitSelections[rollIndex];
    if (sel?.attr1 && sel?.attr2 && sel.attr1 !== sel.attr2) {
      applyRoll(rollIndex, undefined, { attr1: sel.attr1, attr2: sel.attr2 });
    }
  }

  const allRollsAssigned = $derived(rolls.every(r => r.tableType !== null));
  const allRollsApplied = $derived(rolls.every(r => r.applied));
  const isComplete = $derived(
    selectedMethod === 'quick' ||
    (selectedMethod === 'roll' && allRollsApplied)
  );

  // Mark the step as valid when complete
  $effect(() => {
    if (isComplete) {
      characterStore.draft.pickedSkills = ['done'];
    } else {
      characterStore.draft.pickedSkills = [];
    }
  });
</script>

<div class="space-y-6">
  {#if !background}
    <p class="text-red-400">Please select a background first.</p>
  {:else}
    <!-- Header -->
    <div>
      <h3 class="font-display text-lg tracking-wider mb-2">Background Skills</h3>
      <p class="text-sm text-slate-400">
        Your <span class="text-purple-400">{background.name}</span> background gives you
        <span class="text-green-400">{background.freeSkill}</span> as a free skill.
        Now choose how to gain additional skills.
      </p>
    </div>

    {#if !selectedMethod}
      <!-- Method Selection -->
      <div class="grid gap-4 sm:grid-cols-2">
        <button
          onclick={selectQuickSkills}
          class="card card-hover p-6 text-left"
        >
          <h4 class="font-display text-lg text-cyan-400 mb-2">Quick Skills</h4>
          <p class="text-sm text-slate-400 mb-4">
            Take all three quick skills from your background at level 0.
          </p>
          <div class="flex flex-wrap gap-2">
            {#each background.quickSkills as skill}
              <span class="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300">
                {skill}
              </span>
            {/each}
          </div>
        </button>

        <button
          onclick={rollDice}
          class="card card-hover p-6 text-left"
        >
          <h4 class="font-display text-lg text-purple-400 mb-2">Roll on Tables</h4>
          <p class="text-sm text-slate-400 mb-4">
            Roll 3 dice and assign each to Growth or Learning table.
            May gain attribute bonuses instead of skills!
          </p>
          <div class="text-xs text-slate-500">
            More varied results, potential for stat boosts
          </div>
        </button>
      </div>

    {:else if selectedMethod === 'quick'}
      <!-- Quick Skills Confirmed -->
      <div class="card p-6 border-green-500/30">
        <h4 class="font-display text-green-400 mb-3">Quick Skills Selected!</h4>
        <div class="flex flex-wrap gap-2">
          {#each background.quickSkills as skill}
            <span class="px-3 py-1 rounded-full bg-green-500/20 text-green-300">
              {skill === 'any-combat' ? 'Any Combat Skill' : skill === 'any-skill' ? 'Any Skill' : skill}
            </span>
          {/each}
        </div>
        <button
          onclick={() => { selectedMethod = null; characterStore.draft.pickedSkills = []; }}
          class="mt-4 text-sm text-slate-400 hover:text-white"
        >
          ← Choose different method
        </button>
      </div>

    {:else if selectedMethod === 'roll'}
      <!-- Rolling Results -->
      <div class="space-y-4">
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-purple-400 mb-4">
            Your 3 Rolls - Assign to Growth or Learning
          </h4>

          {#each rolls as roll, i}
            <div class="mb-4 p-4 rounded bg-slate-800/50 {roll.applied ? 'opacity-60' : ''}">
              <!-- Die Result -->
              <div class="flex items-center gap-4 mb-3">
                <span class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/40 to-cyan-500/40 flex items-center justify-center font-display text-xl text-white">
                  {roll.dieRoll}
                </span>

                {#if roll.tableType === null}
                  <!-- Choose table -->
                  <div class="flex gap-2">
                    <button
                      onclick={() => assignToTable(i, 'growth')}
                      class="btn btn-secondary text-xs py-1 px-3"
                    >
                      → Growth Table
                    </button>
                    <button
                      onclick={() => assignToTable(i, 'learning')}
                      class="btn btn-secondary text-xs py-1 px-3"
                    >
                      → Learning Table
                    </button>
                  </div>
                {:else}
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded {roll.tableType === 'growth' ? 'bg-purple-500/30 text-purple-300' : 'bg-cyan-500/30 text-cyan-300'}">
                      {roll.tableType === 'growth' ? 'Growth' : 'Learning'}
                    </span>
                    {#if roll.applied}
                      <span class="text-green-400 text-sm">✓ Applied</span>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Result and Application -->
              {#if roll.tableType !== null && roll.result && !roll.applied}
                <div class="ml-14">
                  {#if roll.tableType === 'growth'}
                    {@const entry = roll.result as GrowthEntry}
                    <p class="text-white mb-2">{entry.result}</p>

                    {#if entry.type === 'attribute'}
                      <div class="space-y-3">
                        <!-- Option 1: +2 to one stat -->
                        <div>
                          <p class="text-xs text-slate-400 mb-2">+{entry.value} to one attribute:</p>
                          <div class="flex flex-wrap gap-2">
                            {#each getAttributeOptions(entry.attributeType || 'any') as attr}
                              <button
                                onclick={() => applyRoll(i, attr)}
                                class="btn btn-ghost text-xs py-1 px-3"
                              >
                                +{entry.value} {attr.slice(0, 3).toUpperCase()}
                              </button>
                            {/each}
                          </div>
                        </div>

                        <!-- Option 2: +1 to two different stats -->
                        <div>
                          <p class="text-xs text-slate-400 mb-2">Or +1 to two different attributes:</p>
                          <div class="flex flex-wrap items-center gap-2">
                            <select
                              class="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                              onchange={(e) => selectSplitAttr(i, 'attr1', (e.target as HTMLSelectElement).value as AttributeKey)}
                            >
                              <option value="">First...</option>
                              {#each getAttributeOptions(entry.attributeType || 'any') as attr}
                                <option value={attr}>{attr.slice(0, 3).toUpperCase()}</option>
                              {/each}
                            </select>
                            <span class="text-slate-500">+</span>
                            <select
                              class="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                              onchange={(e) => selectSplitAttr(i, 'attr2', (e.target as HTMLSelectElement).value as AttributeKey)}
                            >
                              <option value="">Second...</option>
                              {#each getAttributeOptions(entry.attributeType || 'any') as attr}
                                <option value={attr}>{attr.slice(0, 3).toUpperCase()}</option>
                              {/each}
                            </select>
                            <button
                              onclick={() => applySplitBonus(i)}
                              disabled={!splitSelections[i]?.attr1 || !splitSelections[i]?.attr2 || splitSelections[i]?.attr1 === splitSelections[i]?.attr2}
                              class="btn btn-primary text-xs py-1 px-3 disabled:opacity-50"
                            >
                              Apply +1/+1
                            </button>
                          </div>
                        </div>
                      </div>
                    {:else if entry.type === 'skill'}
                      <button
                        onclick={() => applyRoll(i)}
                        class="btn btn-primary text-xs py-1 px-3"
                      >
                        Add {entry.value}
                      </button>
                    {:else if entry.type === 'any_skill'}
                      <div class="flex flex-wrap gap-2">
                        {#each nonPsychicSkills as skill}
                          <button
                            onclick={() => applyRoll(i, skill.id)}
                            class="btn btn-ghost text-xs py-1 px-2"
                          >
                            {skill.name}
                          </button>
                        {/each}
                      </div>
                    {:else if entry.type === 'any_combat'}
                      <div class="flex flex-wrap gap-2">
                        {#each COMBAT_SKILLS as skillId}
                          <button
                            onclick={() => applyRoll(i, skillId)}
                            class="btn btn-ghost text-xs py-1 px-2"
                          >
                            {skillId}
                          </button>
                        {/each}
                      </div>
                    {/if}
                  {:else}
                    {@const skillResult = roll.result as string}
                    <p class="text-white mb-2">
                      Skill: {skillResult === 'any-combat' ? 'Any Combat Skill' :
                             skillResult === 'any-skill' ? 'Any Skill' :
                             skillResult}
                    </p>

                    {#if skillResult === 'any-combat'}
                      <div class="flex flex-wrap gap-2">
                        {#each COMBAT_SKILLS as skillId}
                          <button
                            onclick={() => applyRoll(i, skillId)}
                            class="btn btn-ghost text-xs py-1 px-2"
                          >
                            {skillId}
                          </button>
                        {/each}
                      </div>
                    {:else if skillResult === 'any-skill'}
                      <div class="flex flex-wrap gap-2">
                        {#each nonPsychicSkills as skill}
                          <button
                            onclick={() => applyRoll(i, skill.id)}
                            class="btn btn-ghost text-xs py-1 px-2"
                          >
                            {skill.name}
                          </button>
                        {/each}
                      </div>
                    {:else}
                      <button
                        onclick={() => applyRoll(i)}
                        class="btn btn-primary text-xs py-1 px-3"
                      >
                        Add {skillResult}
                      </button>
                    {/if}
                  {/if}
                </div>
              {:else if roll.applied && roll.result}
                <div class="ml-14 text-sm text-slate-400">
                  {#if roll.tableType === 'growth'}
                    {@const entry = roll.result as GrowthEntry}
                    {#if roll.splitBonus}
                      Applied: +1 {roll.splitBonus.attr1.slice(0, 3).toUpperCase()}, +1 {roll.splitBonus.attr2.slice(0, 3).toUpperCase()}
                    {:else if roll.choice && entry.type === 'attribute'}
                      Applied: +{entry.value} {roll.choice.slice(0, 3).toUpperCase()}
                    {:else if entry.type === 'skill'}
                      Applied: {entry.value}
                    {:else}
                      Applied: {roll.choice}
                    {/if}
                  {:else}
                    Applied: {roll.choice || roll.result}
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <button
          onclick={() => {
            selectedMethod = null;
            rolls = [];
            splitSelections = {};
            characterStore.draft.pickedSkills = [];
          }}
          class="text-sm text-slate-400 hover:text-white"
        >
          ← Choose different method
        </button>
      </div>
    {/if}

    <!-- Current Skills Summary -->
    <div class="card p-4 bg-slate-800/50">
      <h4 class="text-sm font-display tracking-wider text-cyan-400 mb-3">Current Skills</h4>
      <div class="flex flex-wrap gap-2">
        {#each characterStore.draft.skills as skill}
          <span class="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-200">
            {getSkillById(skill.skillId)?.name || skill.skillId}-{skill.rank}
          </span>
        {:else}
          <span class="text-slate-500 text-sm">No skills yet</span>
        {/each}
      </div>
    </div>
  {/if}
</div>
