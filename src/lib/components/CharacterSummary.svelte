<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { getClassById } from '$data/classes';
  import { getFocusById } from '$data/foci';
  import { getSkillById } from '$data/skills';
  import { getAttributeModifier, formatModifier } from '$data/attributes';
  import type { AttributeKey } from '$types/character';

  const attributes: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  const background = $derived(
    characterStore.draft.backgroundId
      ? getBackgroundById(characterStore.draft.backgroundId)
      : null
  );

  const charClass = $derived(
    characterStore.draft.classId
      ? getClassById(characterStore.draft.classId)
      : null
  );

  const hasAttributes = $derived(
    characterStore.draft.attributes.strength !== undefined
  );

  const sortedSkills = $derived(
    [...characterStore.draft.skills].sort((a, b) => {
      const nameA = getSkillById(a.skillId)?.name || a.skillId;
      const nameB = getSkillById(b.skillId)?.name || b.skillId;
      return nameA.localeCompare(nameB);
    })
  );
</script>

<div class="card p-4 bg-slate-800/50 space-y-4">
  <h3 class="font-display text-sm tracking-wider text-cyan-400">Character Summary</h3>

  <!-- Background & Class -->
  {#if background || charClass}
    <div class="text-sm">
      {#if background}
        <div class="flex justify-between">
          <span class="text-slate-500">Background:</span>
          <span class="text-purple-400">{background.name}</span>
        </div>
      {/if}
      {#if charClass}
        <div class="flex justify-between">
          <span class="text-slate-500">Class:</span>
          <span class="text-cyan-400">{charClass.name}</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Attributes -->
  {#if hasAttributes}
    <div>
      <h4 class="text-xs text-slate-500 uppercase mb-2">Attributes</h4>
      <div class="grid grid-cols-3 gap-1 text-xs">
        {#each attributes as attr}
          {@const score = characterStore.draft.attributes[attr]}
          {#if score !== undefined}
            {@const mod = getAttributeModifier(score)}
            <div class="flex justify-between px-2 py-1 rounded bg-slate-700/50">
              <span class="text-slate-400">{attr.slice(0, 3).toUpperCase()}</span>
              <span class="text-white">{score} <span class="{mod >= 0 ? 'text-green-400' : 'text-red-400'}">{formatModifier(mod)}</span></span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Foci -->
  {#if characterStore.draft.selectedFoci.length > 0}
    <div>
      <h4 class="text-xs text-slate-500 uppercase mb-2">Foci</h4>
      <div class="flex flex-wrap gap-1">
        {#each characterStore.draft.selectedFoci as focus}
          {@const focusData = getFocusById(focus.focusId)}
          <span class="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">
            {focusData?.name || focus.focusId} {focus.level}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Skills -->
  {#if sortedSkills.length > 0}
    <div>
      <h4 class="text-xs text-slate-500 uppercase mb-2">Skills</h4>
      <div class="flex flex-wrap gap-1">
        {#each sortedSkills as skill}
          {@const skillData = getSkillById(skill.skillId)}
          <span class="px-2 py-1 text-xs rounded {skillData?.isPsychic ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'}">
            {skillData?.name || skill.skillId}-{skill.rank}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- HP if rolled -->
  {#if characterStore.draft.hitPoints}
    <div class="flex justify-between text-sm">
      <span class="text-slate-500">Hit Points:</span>
      <span class="text-red-400 font-display">{characterStore.draft.hitPoints}</span>
    </div>
  {/if}

  <!-- Credits if set -->
  {#if characterStore.draft.credits > 0}
    <div class="flex justify-between text-sm">
      <span class="text-slate-500">Credits:</span>
      <span class="text-yellow-400 font-display">{characterStore.draft.credits}</span>
    </div>
  {/if}
</div>
