<script lang="ts">
  import type { Character, InventoryItem, ItemLocation } from '$types/character';
  import { characterStore } from '$stores/character.svelte';
  import { getEquipmentById, ALL_EQUIPMENT, calculateAC, type EquipmentItem } from '$data/equipment';
  import { getAttributeModifier, formatModifier, ATTRIBUTE_NAMES } from '$data/attributes';
  import { getSkillById } from '$data/skills';
  import { getFocusById } from '$data/foci';
  import { getClassById } from '$data/classes';
  import { getBackgroundById } from '$data/backgrounds';
  import type { AttributeKey } from '$types/character';

  interface Props {
    character: Character;
    onExit: () => void;
  }

  let { character, onExit }: Props = $props();

  // Local mutable state from character
  let hp = $state(character.hitPointsCurrent);
  let hpMax = $state(character.hitPointsMax);
  let effortCurrent = $state(character.effortCurrent ?? 0);
  let effortMax = $state(character.effortMax ?? 0);
  let inventory = $state<InventoryItem[]>(JSON.parse(JSON.stringify(character.inventory || [])));
  let credits = $state(character.credits);
  let notes = $state(character.notes || '');
  let hpDelta = $state('');
  let experience = $state(character.experience);

  // XP tracking
  const xpNeeded = $derived(character.level * 3);
  const xpProgress = $derived(Math.min(100, (experience / xpNeeded) * 100));
  const canLevelUp = $derived(character.level < 10 && experience >= xpNeeded);

  // Item add UI
  let showAddItem = $state(false);
  let addSearch = $state('');
  let addCategory = $state<'all' | 'weapon' | 'armor' | 'gear'>('all');

  const isPsychic = $derived(
    character.classId === 'psychic' ||
    character.partialClasses?.includes('partial-psychic')
  );

  const attributes: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  const dexMod = $derived(getAttributeModifier(character.attributes.dexterity));

  // Auto-calculate AC from readied armor
  const computedAC = $derived(calculateAC(inventory, dexMod));

  // Encumbrance
  const strength = $derived(character.attributes.strength || 10);
  const readiedLimit = $derived(Math.floor(strength / 2));
  const stowedLimit = $derived(strength);

  const readiedEnc = $derived(
    inventory.filter(i => i.location === 'readied')
      .reduce((sum, i) => sum + (getEquipmentById(i.itemId)?.encumbrance ?? 0) * i.quantity, 0)
  );
  const stowedEnc = $derived(
    inventory.filter(i => i.location === 'stowed')
      .reduce((sum, i) => sum + (getEquipmentById(i.itemId)?.encumbrance ?? 0) * i.quantity, 0)
  );

  const encStatus = $derived.by(() => {
    const ro = readiedEnc - readiedLimit;
    const so = stowedEnc - stowedLimit;
    if (ro > 4 || so > 8) return 'over';
    if (ro > 2 || so > 4) return 'heavy';
    if (ro > 0 || so > 0) return 'light';
    return 'normal';
  });

  const moveSpeed = $derived.by(() => {
    switch (encStatus) {
      case 'over': return '0m';
      case 'heavy': return '15m';
      case 'light': return '20m';
      default: return '30m';
    }
  });

  // Auto-save
  async function save() {
    character.hitPointsCurrent = hp;
    character.hitPointsMax = hpMax;
    character.effortCurrent = effortCurrent;
    character.effortMax = effortMax;
    character.inventory = JSON.parse(JSON.stringify(inventory));
    character.credits = credits;
    character.notes = notes;
    character.experience = experience;
    character.armorClass = computedAC;
    character.updatedAt = new Date().toISOString();
    await characterStore.saveCharacter(character);
  }

  function adjustXP(delta: number) {
    experience = Math.max(0, experience + delta);
    save();
  }

  function applyHpDelta(mode: 'damage' | 'heal') {
    const val = parseInt(hpDelta) || 0;
    if (val <= 0) return;
    if (mode === 'damage') {
      hp = Math.max(0, hp - val);
    } else {
      hp = Math.min(hpMax, hp + val);
    }
    hpDelta = '';
    save();
  }

  function adjustEffort(delta: number) {
    effortCurrent = Math.max(0, Math.min(effortMax, effortCurrent + delta));
    save();
  }

  // Inventory helpers
  function getItemsByLocation(location: ItemLocation): (InventoryItem & { data: EquipmentItem })[] {
    return inventory
      .filter(i => i.location === location)
      .map(i => ({ ...i, data: getEquipmentById(i.itemId)! }))
      .filter(i => i.data)
      .sort((a, b) => {
        const catOrder = { weapon: 0, armor: 1, gear: 2 };
        return (catOrder[a.data.category] ?? 3) - (catOrder[b.data.category] ?? 3) || a.data.name.localeCompare(b.data.name);
      });
  }

  function moveItem(itemId: string, from: ItemLocation, to: ItemLocation) {
    const idx = inventory.findIndex(i => i.itemId === itemId && i.location === from);
    if (idx === -1) return;
    const source = inventory[idx];
    if (source.quantity > 1) { source.quantity--; } else { inventory.splice(idx, 1); }
    const existing = inventory.find(i => i.itemId === itemId && i.location === to);
    if (existing) { existing.quantity++; } else { inventory.push({ itemId, location: to, quantity: 1 }); }
    inventory = [...inventory];
    save();
  }

  function removeItem(itemId: string, location: ItemLocation) {
    const idx = inventory.findIndex(i => i.itemId === itemId && i.location === location);
    if (idx === -1) return;
    if (inventory[idx].quantity > 1) { inventory[idx].quantity--; } else { inventory.splice(idx, 1); }
    inventory = [...inventory];
    save();
  }

  function addItem(itemId: string) {
    const item = getEquipmentById(itemId);
    const location: ItemLocation = (item?.category === 'weapon' || item?.category === 'armor') ? 'readied' : 'stowed';
    const existing = inventory.find(i => i.itemId === itemId && i.location === location);
    if (existing) { existing.quantity++; } else { inventory.push({ itemId, location, quantity: 1 }); }
    inventory = [...inventory];
    save();
  }

  function updateCredits(val: number) {
    credits = Math.max(0, val);
    save();
  }

  function getCatBadge(cat: string): string {
    return cat === 'weapon' ? 'text-red-400 bg-red-400/10' : cat === 'armor' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10';
  }

  const filteredAddItems = $derived(
    ALL_EQUIPMENT.filter(item => {
      if (addCategory !== 'all' && item.category !== addCategory) return false;
      if (addSearch && !item.name.toLowerCase().includes(addSearch.toLowerCase())) return false;
      return true;
    })
  );

  const charClass = $derived(getClassById(character.classId));
  const background = $derived(getBackgroundById(character.backgroundId));
</script>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-display text-2xl tracking-wider text-white">{character.name}</h1>
      <p class="text-sm text-slate-400">
        Level {character.level} {charClass?.name || character.classId}
        {#if background}
          <span class="text-slate-600">|</span> {background.name}
        {/if}
      </p>
    </div>
    <button onclick={onExit} class="btn btn-ghost text-sm">
      Exit Play
    </button>
  </div>

  <!-- XP Progress -->
  <div class="card p-3">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-display text-xs tracking-wider text-cyan-400">Experience</h4>
      <span class="text-xs text-slate-400">
        {experience} / {xpNeeded} XP
        {#if character.level >= 10}
          <span class="text-green-400">(Max)</span>
        {/if}
      </span>
    </div>
    <div class="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
      <div
        class="h-full transition-all duration-300 {canLevelUp ? 'bg-green-400' : 'bg-cyan-400'}"
        style="width: {xpProgress}%"
      ></div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          onclick={() => adjustXP(-1)}
          class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-display"
        >-</button>
        <span class="text-sm text-slate-400 w-12 text-center">{experience}</span>
        <button
          onclick={() => adjustXP(1)}
          class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-display"
        >+</button>
      </div>
      {#if canLevelUp}
        <div class="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 font-display animate-pulse">
          Level Up Available!
        </div>
      {/if}
    </div>
  </div>

  <!-- Core Combat Stats -->
  <div class="grid grid-cols-3 gap-3">
    <!-- HP -->
    <div class="card p-3 text-center">
      <div class="text-xs text-slate-500 mb-1">Hit Points</div>
      <div class="text-3xl font-display {hp <= Math.floor(hpMax / 4) ? 'text-red-500 animate-pulse' : hp <= Math.floor(hpMax / 2) ? 'text-yellow-400' : 'text-red-400'}">
        {hp}<span class="text-lg text-slate-600">/{hpMax}</span>
      </div>
    </div>
    <!-- AC -->
    <div class="card p-3 text-center">
      <div class="text-xs text-slate-500 mb-1">Armor Class</div>
      <div class="text-3xl font-display text-cyan-400">{computedAC}</div>
    </div>
    <!-- Attack Bonus -->
    <div class="card p-3 text-center">
      <div class="text-xs text-slate-500 mb-1">Attack Bonus</div>
      <div class="text-3xl font-display text-green-400">+{character.attackBonus}</div>
    </div>
  </div>

  <!-- HP Controls -->
  <div class="card p-3">
    <div class="flex items-center gap-2">
      <input
        type="number"
        min="0"
        placeholder="Amount"
        bind:value={hpDelta}
        onkeydown={(e) => { if (e.key === 'Enter') applyHpDelta('damage'); }}
        class="input text-center flex-1 text-sm"
      />
      <button onclick={() => applyHpDelta('damage')} class="btn text-xs px-3 py-2 bg-red-600 hover:bg-red-500 text-white">
        Damage
      </button>
      <button onclick={() => applyHpDelta('heal')} class="btn text-xs px-3 py-2 bg-green-600 hover:bg-green-500 text-white">
        Heal
      </button>
      <button onclick={() => { hp = hpMax; save(); }} class="btn text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300">
        Full
      </button>
    </div>
  </div>

  <!-- Effort (Psychics only) -->
  {#if isPsychic && effortMax > 0}
    <div class="card p-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-display text-sm tracking-wider text-purple-400">Effort</h4>
        <span class="text-sm font-display text-purple-300">{effortCurrent} / {effortMax}</span>
      </div>
      <div class="flex gap-1 mb-2">
        {#each Array(effortMax) as _, i}
          <div class="flex-1 h-3 rounded-full {i < effortCurrent ? 'bg-purple-500' : 'bg-slate-700'}"></div>
        {/each}
      </div>
      <div class="flex gap-2 justify-center">
        <button
          onclick={() => adjustEffort(-1)}
          disabled={effortCurrent <= 0}
          class="btn text-xs px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30"
        >
          Commit
        </button>
        <button
          onclick={() => adjustEffort(1)}
          disabled={effortCurrent >= effortMax}
          class="btn text-xs px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-30"
        >
          Recover
        </button>
      </div>
    </div>
  {/if}

  <!-- Saving Throws -->
  <div class="card p-3">
    <h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">Saving Throws</h4>
    <div class="grid grid-cols-3 gap-3 text-center text-sm">
      <div>
        <div class="text-slate-500 text-xs">Physical</div>
        <div class="font-display text-white text-lg">{character.savingThrows.physical}+</div>
      </div>
      <div>
        <div class="text-slate-500 text-xs">Evasion</div>
        <div class="font-display text-white text-lg">{character.savingThrows.evasion}+</div>
      </div>
      <div>
        <div class="text-slate-500 text-xs">Mental</div>
        <div class="font-display text-white text-lg">{character.savingThrows.mental}+</div>
      </div>
    </div>
  </div>

  <!-- Attributes -->
  <div class="card p-3">
    <h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">Attributes</h4>
    <div class="grid grid-cols-6 gap-1 text-center">
      {#each attributes as attr}
        {@const score = character.attributes[attr]}
        {@const mod = getAttributeModifier(score)}
        <div>
          <div class="text-[10px] text-slate-500 uppercase">{attr.slice(0, 3)}</div>
          <div class="text-sm font-display text-white">{score}</div>
          <div class="text-xs {mod >= 0 ? 'text-green-400' : 'text-red-400'}">{formatModifier(mod)}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Skills -->
  {#if character.skills.length > 0}
    <div class="card p-3">
      <h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">Skills</h4>
      <div class="flex flex-wrap gap-1.5">
        {#each character.skills.sort((a, b) => (getSkillById(a.skillId)?.name || '').localeCompare(getSkillById(b.skillId)?.name || '')) as skill}
          {@const data = getSkillById(skill.skillId)}
          <span class="px-2 py-0.5 rounded text-xs {data?.isPsychic ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'}">
            {data?.name || skill.skillId}-{skill.rank}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Foci -->
  {#if character.foci.length > 0}
    <div class="card p-3">
      <h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">Foci</h4>
      <div class="space-y-1">
        {#each character.foci as focus}
          {@const data = getFocusById(focus.focusId)}
          <div class="text-sm">
            <span class="text-white">{data?.name || focus.focusId}</span>
            <span class="text-xs text-purple-400 ml-1">Lvl {focus.level}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Encumbrance & Movement -->
  <div class="card p-3">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-display text-xs tracking-wider text-cyan-400">Encumbrance</h4>
      <span class="text-xs px-2 py-0.5 rounded {
        encStatus === 'over' ? 'bg-red-500/20 text-red-300' :
        encStatus === 'heavy' ? 'bg-red-400/20 text-red-300' :
        encStatus === 'light' ? 'bg-yellow-400/20 text-yellow-300' :
        'bg-green-400/20 text-green-300'
      }">
        Move: {moveSpeed}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Readied</span>
          <span class="{readiedEnc > readiedLimit ? 'text-yellow-400' : ''}">{readiedEnc}/{readiedLimit}</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all {readiedEnc > readiedLimit + 4 ? 'bg-red-500' : readiedEnc > readiedLimit ? 'bg-yellow-400' : 'bg-cyan-400'}"
            style="width: {Math.min(100, (readiedEnc / Math.max(1, readiedLimit + 4)) * 100)}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Stowed</span>
          <span class="{stowedEnc > stowedLimit ? 'text-yellow-400' : ''}">{stowedEnc}/{stowedLimit}</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all {stowedEnc > stowedLimit + 8 ? 'bg-red-500' : stowedEnc > stowedLimit ? 'bg-yellow-400' : 'bg-cyan-400'}"
            style="width: {Math.min(100, (stowedEnc / Math.max(1, stowedLimit + 8)) * 100)}%"></div>
        </div>
      </div>
    </div>
    <div class="mt-2 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-500">Credits:</span>
        <input type="number" min="0" value={credits}
          oninput={(e) => updateCredits(parseInt((e.target as HTMLInputElement).value) || 0)}
          class="w-20 px-2 py-0.5 text-xs bg-slate-800 border border-slate-600 rounded text-yellow-400 font-display" />
      </div>
      <button onclick={() => showAddItem = !showAddItem}
        class="text-xs px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white">
        {showAddItem ? 'Close' : '+ Add Item'}
      </button>
    </div>
  </div>

  <!-- Add Item Panel -->
  {#if showAddItem}
    <div class="card p-3">
      <div class="flex gap-2 mb-2">
        <input type="text" placeholder="Search..." bind:value={addSearch} class="input text-xs flex-1" />
        <select bind:value={addCategory} class="input select text-xs w-24">
          <option value="all">All</option>
          <option value="weapon">Weapons</option>
          <option value="armor">Armor</option>
          <option value="gear">Gear</option>
        </select>
      </div>
      <div class="max-h-40 overflow-y-auto space-y-1">
        {#each filteredAddItems as item}
          <button onclick={() => addItem(item.id)}
            class="w-full flex items-center justify-between p-1.5 rounded bg-slate-800/50 hover:bg-slate-700/50 text-left text-xs">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="px-1 py-0.5 rounded text-[9px] uppercase {getCatBadge(item.category)}">{item.category.charAt(0)}</span>
              <span class="text-slate-200 truncate">{item.name}</span>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-slate-500 shrink-0 ml-2">
              <span>Enc {item.encumbrance}</span>
              <span class="text-yellow-400/70">{item.cost}cr</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Readied Items -->
  <div class="card p-3">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-display text-xs tracking-wider text-cyan-400">Readied</h4>
      <span class="text-[10px] text-slate-500">Immediately usable</span>
    </div>
    {#if getItemsByLocation('readied').length === 0}
      <p class="text-xs text-slate-600 italic">No readied items</p>
    {:else}
      <div class="space-y-1">
        {#each getItemsByLocation('readied') as item}
          <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span class="px-1 py-0.5 rounded text-[9px] uppercase {getCatBadge(item.data.category)}">{item.data.category.charAt(0)}</span>
              <span class="text-xs text-slate-200">{item.data.name}</span>
              {#if item.quantity > 1}<span class="text-[10px] text-slate-500">x{item.quantity}</span>{/if}
              {#if item.data.damage}<span class="text-[10px] text-red-400/70">{item.data.damage}</span>{/if}
              {#if item.data.armorClass && item.data.id !== 'shield'}<span class="text-[10px] text-blue-400/70">AC {item.data.armorClass}</span>{/if}
              {#if item.data.id === 'shield'}<span class="text-[10px] text-blue-400/70">+{item.data.armorClass} AC</span>{/if}
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <button onclick={() => moveItem(item.itemId, 'readied', 'stowed')}
                class="px-1.5 py-0.5 text-[9px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Stow</button>
              <button onclick={() => removeItem(item.itemId, 'readied')}
                class="px-1 py-0.5 text-[9px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">X</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stowed Items -->
  <div class="card p-3">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-display text-xs tracking-wider text-yellow-400">Stowed</h4>
      <span class="text-[10px] text-slate-500">Main Action to retrieve</span>
    </div>
    {#if getItemsByLocation('stowed').length === 0}
      <p class="text-xs text-slate-600 italic">No stowed items</p>
    {:else}
      <div class="space-y-1">
        {#each getItemsByLocation('stowed') as item}
          <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="px-1 py-0.5 rounded text-[9px] uppercase {getCatBadge(item.data.category)}">{item.data.category.charAt(0)}</span>
              <span class="text-xs text-slate-200">{item.data.name}</span>
              {#if item.quantity > 1}<span class="text-[10px] text-slate-500">x{item.quantity}</span>{/if}
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <button onclick={() => moveItem(item.itemId, 'stowed', 'readied')}
                class="px-1.5 py-0.5 text-[9px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Ready</button>
              <button onclick={() => removeItem(item.itemId, 'stowed')}
                class="px-1 py-0.5 text-[9px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">X</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stored Items -->
  {#if getItemsByLocation('stored').length > 0}
    <div class="card p-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-display text-xs tracking-wider text-slate-400">Stored</h4>
        <span class="text-[10px] text-slate-500">At ship/base</span>
      </div>
      <div class="space-y-1">
        {#each getItemsByLocation('stored') as item}
          <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="px-1 py-0.5 rounded text-[9px] uppercase {getCatBadge(item.data.category)}">{item.data.category.charAt(0)}</span>
              <span class="text-xs text-slate-200">{item.data.name}</span>
              {#if item.quantity > 1}<span class="text-[10px] text-slate-500">x{item.quantity}</span>{/if}
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <button onclick={() => moveItem(item.itemId, 'stored', 'readied')}
                class="px-1.5 py-0.5 text-[9px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Ready</button>
              <button onclick={() => moveItem(item.itemId, 'stored', 'stowed')}
                class="px-1.5 py-0.5 text-[9px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Stow</button>
              <button onclick={() => removeItem(item.itemId, 'stored')}
                class="px-1 py-0.5 text-[9px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">X</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Session Notes -->
  <div class="card p-3">
    <h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">Notes</h4>
    <textarea
      bind:value={notes}
      onblur={() => save()}
      rows="3"
      placeholder="Session notes..."
      class="input text-sm w-full"
    ></textarea>
  </div>
</div>
