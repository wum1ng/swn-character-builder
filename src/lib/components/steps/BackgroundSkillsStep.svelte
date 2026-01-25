<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { SKILLS, COMBAT_SKILLS, getSkillById } from '$data/skills';
  import { PHYSICAL_ATTRIBUTES, MENTAL_ATTRIBUTES } from '$data/attributes';
  import type { AttributeKey, GrowthEntry } from '$types/character';

  type SkillMethod = 'quick' | 'roll' | null;

  let selectedMethod = $state<SkillMethod>(null);
  let growthRolls = $state<{roll: number, entry: GrowthEntry, applied: boolean, choice?: string}[]>([]);
  let learningRoll = $state<{roll: number, skill: string, applied: boolean} | null>(null);

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
  }

  function rollOnTables() {
    if (!background) return;
    selectedMethod = 'roll';

    // Roll twice on growth table (d6)
    growthRolls = [1, 2].map(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const entry = background.growthTable.find(e => e.roll === roll)!;
      return { roll, entry, applied: false };
    });

    // Roll once on learning table (d8)
    const lRoll = Math.floor(Math.random() * 8);
    const skill = background.learningTable[lRoll];
    learningRoll = { roll: lRoll + 1, skill, applied: false };

    characterStore.draft.backgroundSkillMethod = 'roll';
  }

  function applyGrowthRoll(index: number, choice?: string) {
    const roll = growthRolls[index];
    if (roll.applied) return;

    const entry = roll.entry;

    if (entry.type === 'attribute') {
      if (choice) {
        const attr = choice as AttributeKey;
        const current = characterStore.draft.attributes[attr] || 10;
        characterStore.draft.attributes[attr] = current + (entry.value as number);
        growthRolls[index] = { ...roll, applied: true, choice };
      }
    } else if (entry.type === 'skill') {
      characterStore.addSkill(entry.value as string, 0);
      growthRolls[index] = { ...roll, applied: true };
    } else if (entry.type === 'any_skill') {
      if (choice) {
        characterStore.addSkill(choice, 0);
        growthRolls[index] = { ...roll, applied: true, choice };
      }
    } else if (entry.type === 'any_combat') {
      if (choice) {
        characterStore.addSkill(choice, 0);
        growthRolls[index] = { ...roll, applied: true, choice };
      }
    }
  }

  function applyLearningRoll(choice?: string) {
    if (!learningRoll || learningRoll.applied) return;

    let skillToAdd = learningRoll.skill;

    if (skillToAdd === 'any-combat' || skillToAdd === 'any-skill') {
      if (!choice) return;
      skillToAdd = choice;
    }

    characterStore.addSkill(skillToAdd, 0);
    learningRoll = { ...learningRoll, applied: true };
  }

  function getAttributeOptions(type: 'physical' | 'mental' | 'any'): AttributeKey[] {
    if (type === 'physical') return [...PHYSICAL_ATTRIBUTES];
    if (type === 'mental') return [...MENTAL_ATTRIBUTES];
    return [...PHYSICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES];
  }

  const allGrowthApplied = $derived(growthRolls.every(r => r.applied));
  const learningApplied = $derived(learningRoll?.applied ?? false);
  const isComplete = $derived(
    selectedMethod === 'quick' ||
    (selectedMethod === 'roll' && allGrowthApplied && learningApplied)
  );

  // Mark the step as valid when complete
  $effect(() => {
    if (isComplete) {
      characterStore.draft.pickedSkills = ['done'];
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
          onclick={rollOnTables}
          class="card card-hover p-6 text-left"
        >
          <h4 class="font-display text-lg text-purple-400 mb-2">Roll on Tables</h4>
          <p class="text-sm text-slate-400 mb-4">
            Roll twice on the Growth table (d6) and once on the Learning table (d8).
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
        <!-- Growth Rolls -->
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-purple-400 mb-4">
            Growth Table Rolls (2× d6)
          </h4>

          {#each growthRolls as roll, i}
            <div class="mb-4 p-3 rounded bg-slate-800/50 {roll.applied ? 'opacity-60' : ''}">
              <div class="flex items-center gap-3 mb-2">
                <span class="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center font-display text-purple-400">
                  {roll.roll}
                </span>
                <span class="text-white">{roll.entry.result}</span>
                {#if roll.applied}
                  <span class="text-green-400 text-sm">✓ Applied{roll.choice ? `: ${roll.choice}` : ''}</span>
                {/if}
              </div>

              {#if !roll.applied}
                {#if roll.entry.type === 'attribute'}
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each getAttributeOptions(roll.entry.attributeType || 'any') as attr}
                      <button
                        onclick={() => applyGrowthRoll(i, attr)}
                        class="btn btn-secondary text-xs py-1 px-3"
                      >
                        +{roll.entry.value} {attr.slice(0, 3).toUpperCase()}
                      </button>
                    {/each}
                  </div>
                {:else if roll.entry.type === 'skill'}
                  <button
                    onclick={() => applyGrowthRoll(i)}
                    class="btn btn-primary text-xs py-1 px-3"
                  >
                    Add {roll.entry.value}
                  </button>
                {:else if roll.entry.type === 'any_skill'}
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each nonPsychicSkills.slice(0, 10) as skill}
                      <button
                        onclick={() => applyGrowthRoll(i, skill.id)}
                        class="btn btn-ghost text-xs py-1 px-2"
                      >
                        {skill.name}
                      </button>
                    {/each}
                    <!-- Show more toggle could be added -->
                  </div>
                {:else if roll.entry.type === 'any_combat'}
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each COMBAT_SKILLS as skillId}
                      <button
                        onclick={() => applyGrowthRoll(i, skillId)}
                        class="btn btn-ghost text-xs py-1 px-2"
                      >
                        {skillId}
                      </button>
                    {/each}
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        </div>

        <!-- Learning Roll -->
        {#if learningRoll}
          <div class="card p-4">
            <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">
              Learning Table Roll (d8)
            </h4>

            <div class="p-3 rounded bg-slate-800/50 {learningRoll.applied ? 'opacity-60' : ''}">
              <div class="flex items-center gap-3 mb-2">
                <span class="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center font-display text-cyan-400">
                  {learningRoll.roll}
                </span>
                <span class="text-white">
                  {learningRoll.skill === 'any-combat' ? 'Any Combat Skill' :
                   learningRoll.skill === 'any-skill' ? 'Any Skill' :
                   learningRoll.skill}
                </span>
                {#if learningRoll.applied}
                  <span class="text-green-400 text-sm">✓ Applied</span>
                {/if}
              </div>

              {#if !learningRoll.applied}
                {#if learningRoll.skill === 'any-combat'}
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each COMBAT_SKILLS as skillId}
                      <button
                        onclick={() => applyLearningRoll(skillId)}
                        class="btn btn-ghost text-xs py-1 px-2"
                      >
                        {skillId}
                      </button>
                    {/each}
                  </div>
                {:else if learningRoll.skill === 'any-skill'}
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each nonPsychicSkills.slice(0, 10) as skill}
                      <button
                        onclick={() => applyLearningRoll(skill.id)}
                        class="btn btn-ghost text-xs py-1 px-2"
                      >
                        {skill.name}
                      </button>
                    {/each}
                  </div>
                {:else}
                  <button
                    onclick={() => applyLearningRoll()}
                    class="btn btn-primary text-xs py-1 px-3"
                  >
                    Add {learningRoll.skill}
                  </button>
                {/if}
              {/if}
            </div>
          </div>
        {/if}

        <button
          onclick={() => {
            selectedMethod = null;
            growthRolls = [];
            learningRoll = null;
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
