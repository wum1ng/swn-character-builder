<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById } from '$data/backgrounds';
  import { getClassById, PARTIAL_CLASSES } from '$data/classes';
  import { getFocusById } from '$data/foci';
  import { getSkillById } from '$data/skills';
  import { getEquipmentById, getPackageById } from '$data/equipment';
  import { ATTRIBUTE_NAMES, formatModifier, getAttributeModifier } from '$data/attributes';
  import type { AttributeKey } from '$types/character';
  
  type Props = {
    oncomplete: () => void;
  };
  
  let { oncomplete }: Props = $props();
  
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
  
  const partialClassNames = $derived(
    characterStore.draft.partialClasses?.map(pc => 
      PARTIAL_CLASSES.find(p => p.id === pc)?.name || pc
    ).join(' / ') || ''
  );
  
  const attributes: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  
  function getAttrMod(attr: AttributeKey): number {
    const score = characterStore.draft.attributes[attr];
    return score ? getAttributeModifier(score) : 0;
  }
</script>

<div class="space-y-6">
  <div class="text-center mb-8">
    <h3 class="font-display text-2xl tracking-wider text-glow-blue text-cyan-400 mb-2">
      Character Complete!
    </h3>
    <p class="text-slate-400">
      Review your character and save when ready
    </p>
  </div>
  
  <!-- Character Header -->
  <div class="card p-6 text-center">
    <h2 class="font-display text-3xl tracking-wider text-white mb-2">
      {characterStore.draft.name || 'Unnamed Character'}
    </h2>
    <p class="text-lg text-slate-400">
      Level 1 {charClass?.name || 'Unknown'}
      {#if characterStore.draft.classId === 'adventurer' && partialClassNames}
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
      <div class="text-3xl font-display text-red-400">{characterStore.draft.hitPoints || 1}</div>
      <div class="text-xs text-slate-400 mt-1">Hit Points</div>
    </div>
    <div class="card p-4 text-center">
      <div class="text-3xl font-display text-cyan-400">
        {characterStore.draft.classId === 'warrior' ? '+1' : '+0'}
      </div>
      <div class="text-xs text-slate-400 mt-1">Attack Bonus</div>
    </div>
    <div class="card p-4 text-center">
      <div class="text-3xl font-display text-green-400">
        {10 + getAttrMod('dexterity')}
      </div>
      <div class="text-xs text-slate-400 mt-1">Armor Class</div>
    </div>
  </div>
  
  <!-- Attributes -->
  <div class="card p-4">
    <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Attributes</h4>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {#each attributes as attr}
        {@const score = characterStore.draft.attributes[attr] || 10}
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
        <div class="text-xl font-display text-white">
          {15 - 1 - Math.max(getAttrMod('strength'), getAttrMod('constitution'))}+
        </div>
      </div>
      <div>
        <div class="text-xs text-slate-500 mb-1">Evasion</div>
        <div class="text-xl font-display text-white">
          {15 - 1 - Math.max(getAttrMod('intelligence'), getAttrMod('dexterity'))}+
        </div>
      </div>
      <div>
        <div class="text-xs text-slate-500 mb-1">Mental</div>
        <div class="text-xl font-display text-white">
          {15 - 1 - Math.max(getAttrMod('wisdom'), getAttrMod('charisma'))}+
        </div>
      </div>
    </div>
  </div>
  
  <!-- Skills -->
  {#if characterStore.draft.skills.length > 0}
    <div class="card p-4">
      <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Skills</h4>
      <div class="flex flex-wrap gap-2">
        {#each characterStore.draft.skills as skill}
          {@const skillData = getSkillById(skill.skillId)}
          <span class="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-200">
            {skillData?.name || skill.skillId}-{skill.rank}
          </span>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Foci -->
  {#if characterStore.draft.selectedFoci.length > 0}
    <div class="card p-4">
      <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Foci</h4>
      <div class="space-y-2">
        {#each characterStore.draft.selectedFoci as focus}
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
  {#if characterStore.draft.equipment.length > 0 || characterStore.draft.credits > 0}
    <div class="card p-4">
      <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Equipment</h4>
      {#if characterStore.draft.equipmentPackageId}
        {@const pkg = getPackageById(characterStore.draft.equipmentPackageId)}
        {#if pkg}
          <div class="text-xs text-purple-400 mb-3">{pkg.name}</div>
        {/if}
      {/if}
      <div class="flex flex-wrap gap-2 mb-4">
        {#each characterStore.draft.equipment as itemId}
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
        <span class="text-yellow-400 font-display">{characterStore.draft.credits.toLocaleString()}</span>
      </div>
    </div>
  {/if}

  <!-- Character Info -->
  {#if characterStore.draft.homeworld || characterStore.draft.species || characterStore.draft.employer}
    <div class="card p-4">
      <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Details</h4>
      <div class="grid gap-2 text-sm">
        {#if characterStore.draft.homeworld}
          <div><span class="text-slate-500">Homeworld:</span> {characterStore.draft.homeworld}</div>
        {/if}
        {#if characterStore.draft.species}
          <div><span class="text-slate-500">Species:</span> {characterStore.draft.species}</div>
        {/if}
        {#if characterStore.draft.employer}
          <div><span class="text-slate-500">Employer:</span> {characterStore.draft.employer}</div>
        {/if}
      </div>
      {#if characterStore.draft.goals}
        <div class="mt-4">
          <div class="text-xs text-slate-500 mb-1">Goals</div>
          <p class="text-sm text-slate-300">{characterStore.draft.goals}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Save Button -->
  <div class="text-center pt-4">
    <button
      onclick={oncomplete}
      class="btn btn-primary px-12 py-4 text-lg"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
      Save Character
    </button>
  </div>
</div>
