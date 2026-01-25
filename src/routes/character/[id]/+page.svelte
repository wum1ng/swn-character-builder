<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { getClassById, PARTIAL_CLASSES } from '$data/classes';
  import { getFocusById } from '$data/foci';
  import { getSkillById } from '$data/skills';
  import { getEquipmentById } from '$data/equipment';
  import { formatModifier, getAttributeModifier } from '$data/attributes';
  import type { Character, AttributeKey } from '$types/character';

  let character = $state<Character | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const attributes: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  onMount(async () => {
    await characterStore.loadCharacters();
    const id = $page.params.id;
    const found = characterStore.savedCharacters.find(c => c.id === id);
    if (found) {
      character = found;
    } else {
      error = 'Character not found';
    }
    loading = false;
  });

  function getAttrMod(attr: AttributeKey): number {
    if (!character) return 0;
    const score = character.attributes[attr];
    return score ? getAttributeModifier(score) : 0;
  }
</script>

<svelte:head>
  <title>{character?.name || 'Character'} - SWN Character Builder</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  {#if loading}
    <div class="text-center py-12">
      <div class="text-slate-400">Loading...</div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <div class="text-red-400 mb-4">{error}</div>
      <a href="{base}/" class="btn btn-primary">Back to Home</a>
    </div>
  {:else if character}
    {@const background = getBackgroundById(character.backgroundId)}
    {@const charClass = getClassById(character.classId)}
    {@const partialClassNames = character.partialClasses?.map(pc =>
      PARTIAL_CLASSES.find(p => p.id === pc)?.name || pc
    ).join(' / ') || ''}

    <!-- Back Button -->
    <div class="mb-6">
      <a href="{base}/" class="btn btn-ghost text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Characters
      </a>
    </div>

    <div class="space-y-6">
      <!-- Character Header -->
      <div class="card p-6 text-center">
        <h1 class="font-display text-3xl tracking-wider text-white mb-2">
          {character.name || 'Unnamed Character'}
        </h1>
        <p class="text-lg text-slate-400">
          Level {character.level} {charClass?.name || 'Unknown'}
          {#if character.classId === 'adventurer' && partialClassNames}
            <span class="text-sm">({partialClassNames})</span>
          {/if}
        </p>
        {#if background}
          <p class="text-sm text-purple-400 mt-1">{background.name} Background</p>
        {/if}
      </div>

      <!-- Core Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="card p-4 text-center">
          <div class="text-3xl font-display text-red-400">
            {character.hitPointsCurrent}/{character.hitPointsMax}
          </div>
          <div class="text-xs text-slate-400 mt-1">Hit Points</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-display text-cyan-400">
            +{character.attackBonus}
          </div>
          <div class="text-xs text-slate-400 mt-1">Attack Bonus</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-display text-green-400">
            {character.armorClass}
          </div>
          <div class="text-xs text-slate-400 mt-1">Armor Class</div>
        </div>
      </div>

      <!-- Attributes -->
      <div class="card p-4">
        <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Attributes</h4>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {#each attributes as attr}
            {@const score = character.attributes[attr] || 10}
            {@const mod = getAttributeModifier(score)}
            <div class="text-center">
              <div class="text-xs text-slate-500 uppercase mb-1">
                {attr.slice(0, 3)}
              </div>
              <div class="text-2xl font-display text-white">{score}</div>
              <div class="text-sm {mod >= 0 ? 'text-green-400' : 'text-red-400'}">
                {formatModifier(mod)}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Saving Throws -->
      <div class="card p-4">
        <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Saving Throws</h4>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-xs text-slate-500 mb-1">Physical</div>
            <div class="text-xl font-display text-white">{character.savingThrows.physical}+</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 mb-1">Evasion</div>
            <div class="text-xl font-display text-white">{character.savingThrows.evasion}+</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 mb-1">Mental</div>
            <div class="text-xl font-display text-white">{character.savingThrows.mental}+</div>
          </div>
        </div>
      </div>

      <!-- Skills -->
      {#if character.skills.length > 0}
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Skills</h4>
          <div class="flex flex-wrap gap-2">
            {#each character.skills as skill}
              {@const skillData = getSkillById(skill.skillId)}
              <span class="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-200">
                {skillData?.name || skill.skillId}-{skill.rank}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Foci -->
      {#if character.foci.length > 0}
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Foci</h4>
          <div class="space-y-2">
            {#each character.foci as focus}
              {@const focusData = getFocusById(focus.focusId)}
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300">
                  Lvl {focus.level}
                </span>
                <span class="text-white">{focusData?.name || focus.focusId}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Equipment -->
      {#if character.equipment.length > 0 || character.credits > 0}
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Equipment</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            {#each character.equipment as itemId}
              {@const item = getEquipmentById(itemId)}
              {#if item}
                <span class="px-2 py-1 rounded text-xs bg-slate-700 text-slate-200">
                  {item.name}
                </span>
              {/if}
            {/each}
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-slate-500">Credits:</span>
            <span class="text-yellow-400 font-display">{character.credits.toLocaleString()}</span>
          </div>
        </div>
      {/if}

      <!-- Character Info -->
      {#if character.homeworld || character.species || character.employer}
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Details</h4>
          <div class="grid gap-2 text-sm">
            {#if character.homeworld}
              <div><span class="text-slate-500">Homeworld:</span> {character.homeworld}</div>
            {/if}
            {#if character.species}
              <div><span class="text-slate-500">Species:</span> {character.species}</div>
            {/if}
            {#if character.employer}
              <div><span class="text-slate-500">Employer:</span> {character.employer}</div>
            {/if}
          </div>
          {#if character.goals}
            <div class="mt-4">
              <div class="text-xs text-slate-500 mb-1">Goals</div>
              <p class="text-sm text-slate-300">{character.goals}</p>
            </div>
          {/if}
          {#if character.notes}
            <div class="mt-4">
              <div class="text-xs text-slate-500 mb-1">Notes</div>
              <p class="text-sm text-slate-300">{character.notes}</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex justify-center gap-4 pt-4">
        <button
          onclick={() => character && characterStore.deleteCharacter(character.id).then(() => window.location.href = `${base}/`)}
          class="btn btn-ghost text-red-400"
        >
          Delete Character
        </button>
      </div>
    </div>
  {/if}
</div>
