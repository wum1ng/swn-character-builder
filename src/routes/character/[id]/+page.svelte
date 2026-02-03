<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { characterStore } from '$stores/character.svelte';
  import { getBackgroundById, BACKGROUNDS } from '$data/backgrounds';
  import { getClassById, PARTIAL_CLASSES, CLASSES } from '$data/classes';
  import { getFocusById, FOCI } from '$data/foci';
  import { getSkillById, SKILLS } from '$data/skills';
  import { getEquipmentById, ALL_EQUIPMENT } from '$data/equipment';
  import { formatModifier, getAttributeModifier } from '$data/attributes';
  import InventoryManager from '$lib/components/InventoryManager.svelte';
  import { calculateAC } from '$data/equipment';
  import type { Character, AttributeKey, ClassName, PartialClass, InventoryItem } from '$types/character';

  type ViewMode = 'view' | 'edit';

  let character = $state<Character | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let copySuccess = $state(false);
  let showDeleteConfirm = $state(false);
  let viewMode = $state<ViewMode>('view');
  let editedCharacter = $state<Character | null>(null);
  let saveError = $state<string | null>(null);
  let expandedFocus = $state<string | null>(null);
  let expandedSkill = $state<string | null>(null);

  const isEditing = $derived(viewMode === 'edit');

  const isPsychic = $derived(
    character?.classId === 'psychic' ||
    character?.partialClasses?.includes('partial-psychic') ||
    false
  );

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

  function exportJSON() {
    if (!character) return;
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '_') || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    if (!character) return;
    const text = formatCharacterText(character);
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
      setTimeout(() => copySuccess = false, 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  }

  function formatCharacterText(char: Character): string {
    const bg = getBackgroundById(char.backgroundId);
    const cls = getClassById(char.classId);
    const lines = [
      `${char.name}`,
      `Level ${char.level} ${cls?.name || char.classId} | ${bg?.name || char.backgroundId} Background`,
      ``,
      `HP: ${char.hitPointsCurrent}/${char.hitPointsMax} | AC: ${char.armorClass} | AB: +${char.attackBonus}`,
      ``,
      `ATTRIBUTES`,
      `STR: ${char.attributes.strength} (${formatModifier(getAttributeModifier(char.attributes.strength))})`,
      `DEX: ${char.attributes.dexterity} (${formatModifier(getAttributeModifier(char.attributes.dexterity))})`,
      `CON: ${char.attributes.constitution} (${formatModifier(getAttributeModifier(char.attributes.constitution))})`,
      `INT: ${char.attributes.intelligence} (${formatModifier(getAttributeModifier(char.attributes.intelligence))})`,
      `WIS: ${char.attributes.wisdom} (${formatModifier(getAttributeModifier(char.attributes.wisdom))})`,
      `CHA: ${char.attributes.charisma} (${formatModifier(getAttributeModifier(char.attributes.charisma))})`,
      ``,
      `SAVING THROWS`,
      `Physical: ${char.savingThrows.physical}+ | Evasion: ${char.savingThrows.evasion}+ | Mental: ${char.savingThrows.mental}+`,
      ``,
      `SKILLS`,
      char.skills.map(s => `${getSkillById(s.skillId)?.name || s.skillId}-${s.rank}`).join(', '),
      ``,
      `FOCI`,
      char.foci.map(f => `${getFocusById(f.focusId)?.name || f.focusId} (Lvl ${f.level})`).join(', '),
      ``,
      `EQUIPMENT`,
      ...(char.inventory && char.inventory.length > 0
        ? [
            `Readied: ${char.inventory.filter(i => i.location === 'readied').map(i => { const e = getEquipmentById(i.itemId); return e ? (i.quantity > 1 ? `${i.quantity}x ${e.name}` : e.name) : i.itemId; }).join(', ') || 'None'}`,
            `Stowed: ${char.inventory.filter(i => i.location === 'stowed').map(i => { const e = getEquipmentById(i.itemId); return e ? (i.quantity > 1 ? `${i.quantity}x ${e.name}` : e.name) : i.itemId; }).join(', ') || 'None'}`,
            `Stored: ${char.inventory.filter(i => i.location === 'stored').map(i => { const e = getEquipmentById(i.itemId); return e ? (i.quantity > 1 ? `${i.quantity}x ${e.name}` : e.name) : i.itemId; }).join(', ') || 'None'}`,
          ]
        : [char.equipment.map(id => getEquipmentById(id)?.name || id).join(', ')]),
      `Credits: ${char.credits}`,
    ];
    if (char.homeworld) lines.push(``, `Homeworld: ${char.homeworld}`);
    if (char.goals) lines.push(`Goals: ${char.goals}`);
    return lines.join('\n');
  }

  function startEdit() {
    if (!character) return;
    editedCharacter = JSON.parse(JSON.stringify(character));
    viewMode = 'edit';
    saveError = null;
  }

  function cancelEdit() {
    viewMode = 'view';
    editedCharacter = null;
    saveError = null;
  }

  async function saveEdit() {
    if (!editedCharacter) return;
    try {
      editedCharacter.updatedAt = new Date().toISOString();
      await characterStore.saveCharacter(editedCharacter);
      character = editedCharacter;
      viewMode = 'view';
      editedCharacter = null;
      saveError = null;
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Failed to save';
    }
  }

  function printCharacter() {
    window.print();
  }

  async function handleInventoryUpdate(newInventory: InventoryItem[], newCredits: number) {
    if (!character) return;
    character.inventory = newInventory;
    character.credits = newCredits;
    // Recalculate AC based on readied armor
    const dexMod = getAttributeModifier(character.attributes.dexterity);
    character.armorClass = calculateAC(newInventory, dexMod);
    character.updatedAt = new Date().toISOString();
    await characterStore.saveCharacter(character);
  }

  async function updateCurrentHP(newHP: number) {
    if (!character) return;
    character.hitPointsCurrent = Math.max(0, Math.min(character.hitPointsMax, newHP));
    character.updatedAt = new Date().toISOString();
    await characterStore.saveCharacter(character);
  }

  async function updateCurrentEffort(newEffort: number) {
    if (!character) return;
    const max = character.effortMax ?? 0;
    character.effortCurrent = Math.max(0, Math.min(max, newEffort));
    character.updatedAt = new Date().toISOString();
    await characterStore.saveCharacter(character);
  }

  async function confirmDelete() {
    if (!character) return;
    await characterStore.deleteCharacter(character.id);
    goto(`${base}/`);
  }

  // Edit helpers
  function updateAttribute(attr: AttributeKey, value: string) {
    if (!editedCharacter) return;
    const num = parseInt(value) || 3;
    editedCharacter.attributes[attr] = Math.max(3, Math.min(18, num));
  }

  function updateSkillRank(skillId: string, rank: number) {
    if (!editedCharacter) return;
    const existing = editedCharacter.skills.find(s => s.skillId === skillId);
    if (rank < 0) {
      editedCharacter.skills = editedCharacter.skills.filter(s => s.skillId !== skillId);
    } else if (existing) {
      existing.rank = rank;
    } else {
      editedCharacter.skills = [...editedCharacter.skills, { skillId, rank }];
    }
  }

  function getSkillRank(skillId: string): number {
    if (!editedCharacter) return -1;
    const skill = editedCharacter.skills.find(s => s.skillId === skillId);
    return skill?.rank ?? -1;
  }

  function updateFocusLevel(focusId: string, level: 0 | 1 | 2) {
    if (!editedCharacter) return;
    if (level === 0) {
      editedCharacter.foci = editedCharacter.foci.filter(f => f.focusId !== focusId);
    } else {
      const existing = editedCharacter.foci.find(f => f.focusId === focusId);
      if (existing) {
        existing.level = level;
      } else {
        editedCharacter.foci = [...editedCharacter.foci, { focusId, level }];
      }
    }
  }

  function getFocusLevel(focusId: string): 0 | 1 | 2 {
    if (!editedCharacter) return 0;
    const focus = editedCharacter.foci.find(f => f.focusId === focusId);
    return focus?.level ?? 0;
  }

  function toggleEquipment(itemId: string) {
    if (!editedCharacter) return;
    if (editedCharacter.equipment.includes(itemId)) {
      editedCharacter.equipment = editedCharacter.equipment.filter(id => id !== itemId);
    } else {
      editedCharacter.equipment = [...editedCharacter.equipment, itemId];
    }
  }

  function hasEquipment(itemId: string): boolean {
    return editedCharacter?.equipment.includes(itemId) ?? false;
  }
</script>

<svelte:head>
  <title>{character?.name || 'Character'} - SWN Character Builder</title>
</svelte:head>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="card p-6 max-w-md w-full">
      <h3 class="font-display text-xl tracking-wider text-red-400 mb-4">Delete Character?</h3>
      <p class="text-slate-300 mb-6">
        Are you sure you want to delete <strong class="text-white">{character?.name || 'this character'}</strong>?
        This action cannot be undone.
      </p>
      <div class="flex gap-3 justify-end">
        <button onclick={() => showDeleteConfirm = false} class="btn btn-ghost">
          Cancel
        </button>
        <button onclick={confirmDelete} class="btn bg-red-600 hover:bg-red-500 text-white">
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

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
    {#if viewMode === 'view'}
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
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="card p-4 text-center">
          <div class="text-3xl font-display text-red-400 flex items-center justify-center gap-1">
            <input
              type="number"
              min="0"
              max={character.hitPointsMax}
              value={character.hitPointsCurrent}
              onchange={(e) => updateCurrentHP(parseInt((e.target as HTMLInputElement).value) || 0)}
              class="w-12 bg-transparent text-center text-3xl font-display text-red-400 border-b border-red-400/30 focus:border-red-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span class="text-slate-500">/</span>
            <span>{character.hitPointsMax}</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">Hit Points</div>
        </div>
        <div class="card p-4 text-center {isPsychic ? '' : 'opacity-40'}">
          <div class="text-3xl font-display text-amber-400 flex items-center justify-center gap-1">
            {#if isPsychic}
              <input
                type="number"
                min="0"
                max={character.effortMax ?? 0}
                value={character.effortCurrent ?? 0}
                onchange={(e) => updateCurrentEffort(parseInt((e.target as HTMLInputElement).value) || 0)}
                class="w-12 bg-transparent text-center text-3xl font-display text-amber-400 border-b border-amber-400/30 focus:border-amber-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            {:else}
              <span>0</span>
            {/if}
            <span class="text-slate-500">/</span>
            <span>{character.effortMax ?? 0}</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">Effort</div>
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
              {@const isExpSkill = expandedSkill === skill.skillId}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span
                onclick={() => expandedSkill = isExpSkill ? null : skill.skillId}
                class="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-200 cursor-pointer hover:bg-slate-600 transition-colors"
              >
                {skillData?.name || skill.skillId}-{skill.rank}
              </span>
            {/each}
          </div>
          {#if expandedSkill}
            {@const skillInfo = getSkillById(expandedSkill)}
            {#if skillInfo}
              <div class="mt-4 p-3 rounded-lg bg-slate-800/70 border border-slate-700 text-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-display text-white tracking-wider">{skillInfo.name}</span>
                  <span class="text-xs text-slate-500">
                    {Array.isArray(skillInfo.attribute) ? skillInfo.attribute.map(a => a.slice(0,3).toUpperCase()).join('/') : skillInfo.attribute.slice(0,3).toUpperCase()}
                  </span>
                </div>
                <p class="text-slate-400">{skillInfo.description}</p>
              </div>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- Foci -->
      {#if character.foci.length > 0}
        <div class="card p-4">
          <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Foci</h4>
          <div class="space-y-2">
            {#each character.foci as focus}
              {@const focusData = getFocusById(focus.focusId)}
              {@const isExpFocus = expandedFocus === focus.focusId}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                onclick={() => expandedFocus = isExpFocus ? null : focus.focusId}
                class="cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300">
                    Lvl {focus.level}
                  </span>
                  <span class="text-white">{focusData?.name || focus.focusId}</span>
                  <span class="text-xs text-slate-600 ml-auto">{focusData?.type}</span>
                </div>
                {#if isExpFocus && focusData}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div class="mt-3 pl-2 space-y-3 text-sm" onclick={(e) => e.stopPropagation()}>
                    <p class="text-slate-400 italic">{focusData.description}</p>
                    <div class="p-2 rounded bg-slate-800/70 border border-slate-700">
                      <div class="text-purple-300 text-xs font-display tracking-wider mb-1">Level 1</div>
                      <p class="text-slate-300 mb-2">{focusData.level1.description}</p>
                      <ul class="space-y-1">
                        {#each focusData.level1.abilities as ability}
                          <li class="text-slate-400 text-xs flex gap-1.5">
                            <span class="text-purple-400 shrink-0">-</span>
                            {ability}
                          </li>
                        {/each}
                      </ul>
                    </div>
                    {#if focus.level >= 2}
                      <div class="p-2 rounded bg-slate-800/70 border border-purple-500/20">
                        <div class="text-purple-300 text-xs font-display tracking-wider mb-1">Level 2</div>
                        <p class="text-slate-300 mb-2">{focusData.level2.description}</p>
                        <ul class="space-y-1">
                          {#each focusData.level2.abilities as ability}
                            <li class="text-slate-400 text-xs flex gap-1.5">
                              <span class="text-purple-400 shrink-0">-</span>
                              {ability}
                            </li>
                          {/each}
                        </ul>
                      </div>
                    {:else}
                      <div class="p-2 rounded bg-slate-800/30 border border-slate-700/50 opacity-50">
                        <div class="text-slate-500 text-xs font-display tracking-wider mb-1">Level 2 (not taken)</div>
                        <p class="text-slate-500">{focusData.level2.description}</p>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Inventory -->
      <InventoryManager {character} onUpdate={handleInventoryUpdate} />

      <!-- Character Info -->
      {#if character.homeworld || character.species || character.employer || character.goals || character.notes}
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
      <div class="card p-4 print:hidden">
        <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-4">Actions</h4>
        <div class="flex flex-wrap justify-center gap-3">
          <button onclick={startEdit} class="btn btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button onclick={exportJSON} class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
          <button onclick={copyToClipboard} class="btn btn-secondary">
            {#if copySuccess}
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Text
            {/if}
          </button>
          <button onclick={printCharacter} class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onclick={() => showDeleteConfirm = true}
            class="btn btn-ghost text-red-400"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
    {:else if viewMode === 'edit' && editedCharacter}
    <!-- Edit Mode -->
    <div class="mb-6 flex items-center justify-between">
      <button onclick={cancelEdit} class="btn btn-ghost text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel Edit
      </button>
      <button onclick={saveEdit} class="btn btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Save Changes
      </button>
    </div>

    {#if saveError}
      <div class="card p-4 bg-red-500/20 border-red-500/50 mb-6">
        <p class="text-red-400">{saveError}</p>
      </div>
    {/if}

    <div class="space-y-6">
      <!-- Basic Info -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Basic Information</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Name</label>
            <input type="text" bind:value={editedCharacter.name} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Level</label>
            <input type="number" min="1" max="20" bind:value={editedCharacter.level} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Background</label>
            <select bind:value={editedCharacter.backgroundId} class="input select">
              {#each BACKGROUNDS as bg}
                <option value={bg.id}>{bg.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Class</label>
            <select bind:value={editedCharacter.classId} class="input select">
              {#each CLASSES as cls}
                <option value={cls.id}>{cls.name}</option>
              {/each}
            </select>
          </div>
          {#if editedCharacter.classId === 'adventurer'}
            <div class="sm:col-span-2">
              <label class="block text-sm text-slate-400 mb-1">Partial Classes</label>
              <div class="flex flex-wrap gap-2">
                {#each PARTIAL_CLASSES as pc}
                  <label class="flex items-center gap-2 px-3 py-2 rounded bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedCharacter.partialClasses?.includes(pc.id as PartialClass)}
                      onchange={(e) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        const current = editedCharacter!.partialClasses || [];
                        if (checked && current.length < 2) {
                          editedCharacter!.partialClasses = [...current, pc.id as PartialClass] as [PartialClass, PartialClass];
                        } else if (!checked) {
                          editedCharacter!.partialClasses = current.filter(p => p !== pc.id) as [PartialClass, PartialClass];
                        }
                      }}
                      class="rounded"
                    />
                    <span class="text-sm">{pc.name}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Combat Stats -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Combat Stats</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">HP Max</label>
            <input type="number" min="1" bind:value={editedCharacter.hitPointsMax} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">HP Current</label>
            <input type="number" min="0" bind:value={editedCharacter.hitPointsCurrent} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Attack Bonus</label>
            <input type="number" min="0" bind:value={editedCharacter.attackBonus} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Armor Class</label>
            <input type="number" min="0" bind:value={editedCharacter.armorClass} class="input" />
          </div>
        </div>
      </div>

      <!-- Attributes -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Attributes</h3>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {#each attributes as attr}
            <div>
              <label class="block text-xs text-slate-400 mb-1 uppercase">{attr.slice(0, 3)}</label>
              <input
                type="number"
                min="3"
                max="18"
                value={editedCharacter.attributes[attr]}
                oninput={(e) => updateAttribute(attr, (e.target as HTMLInputElement).value)}
                class="input text-center"
              />
              <div class="text-xs text-center mt-1 {getAttributeModifier(editedCharacter.attributes[attr]) >= 0 ? 'text-green-400' : 'text-red-400'}">
                {formatModifier(getAttributeModifier(editedCharacter.attributes[attr]))}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Saving Throws -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Saving Throws</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Physical</label>
            <input type="number" min="1" max="20" bind:value={editedCharacter.savingThrows.physical} class="input text-center" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Evasion</label>
            <input type="number" min="1" max="20" bind:value={editedCharacter.savingThrows.evasion} class="input text-center" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Mental</label>
            <input type="number" min="1" max="20" bind:value={editedCharacter.savingThrows.mental} class="input text-center" />
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Skills</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each SKILLS as skill}
            <div class="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span class="text-sm {skill.isPsychic ? 'text-purple-400' : 'text-slate-300'}">{skill.name}</span>
              <select
                value={String(getSkillRank(skill.id))}
                onchange={(e) => updateSkillRank(skill.id, parseInt((e.target as HTMLSelectElement).value))}
                class="w-16 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
              >
                <option value="-1">-</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          {/each}
        </div>
      </div>

      <!-- Foci -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Foci</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          {#each FOCI as focus}
            <div class="flex items-center justify-between p-3 rounded bg-slate-800/50">
              <div>
                <span class="text-sm text-white">{focus.name}</span>
                <span class="text-xs text-slate-500 ml-2">({focus.type})</span>
              </div>
              <select
                value={String(getFocusLevel(focus.id))}
                onchange={(e) => updateFocusLevel(focus.id, parseInt((e.target as HTMLSelectElement).value) as 0 | 1 | 2)}
                class="w-20 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
              >
                <option value="0">None</option>
                <option value="1">Lvl 1</option>
                <option value="2">Lvl 2</option>
              </select>
            </div>
          {/each}
        </div>
      </div>

      <!-- Inventory (Edit Mode) -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Inventory</h3>
        <InventoryManager
          character={editedCharacter}
          onUpdate={(inv, cr) => {
            if (editedCharacter) {
              editedCharacter.inventory = inv;
              editedCharacter.credits = cr;
            }
          }}
        />
      </div>

      <!-- Details -->
      <div class="card p-6">
        <h3 class="font-display text-lg tracking-wider text-cyan-400 mb-4">Character Details</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Homeworld</label>
            <input type="text" bind:value={editedCharacter.homeworld} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Species</label>
            <input type="text" bind:value={editedCharacter.species} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Employer</label>
            <input type="text" bind:value={editedCharacter.employer} class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Experience</label>
            <input type="number" min="0" bind:value={editedCharacter.experience} class="input" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm text-slate-400 mb-1">Goals</label>
            <textarea bind:value={editedCharacter.goals} rows="2" class="input"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea bind:value={editedCharacter.notes} rows="3" class="input"></textarea>
          </div>
        </div>
      </div>

      <!-- Save/Cancel Buttons (bottom) -->
      <div class="flex gap-3 justify-end">
        <button onclick={cancelEdit} class="btn btn-ghost">
          Cancel
        </button>
        <button onclick={saveEdit} class="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  {/if}
  {/if}
</div>
