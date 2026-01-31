<script lang="ts">
  import type { Character, InventoryItem, ItemLocation } from '$types/character';
  import { getEquipmentById, ALL_EQUIPMENT, type EquipmentItem } from '$data/equipment';
  import { getAttributeModifier } from '$data/attributes';

  interface Props {
    character: Character;
    onUpdate: (inventory: InventoryItem[], credits: number) => void;
  }

  let { character, onUpdate }: Props = $props();

  let inventory = $state<InventoryItem[]>([]);
  let credits = $state(0);
  let showAddItem = $state(false);
  let addSearch = $state('');
  let addCategory = $state<'all' | 'weapon' | 'armor' | 'gear'>('all');

  // Initialize from character
  $effect(() => {
    inventory = JSON.parse(JSON.stringify(character.inventory || []));
    credits = character.credits;
  });

  // Encumbrance calculations
  const strength = $derived(character.attributes.strength || 10);
  const readiedLimit = $derived(Math.floor(strength / 2));
  const stowedLimit = $derived(strength);

  const readiedEnc = $derived(
    inventory
      .filter(i => i.location === 'readied')
      .reduce((sum, i) => {
        const item = getEquipmentById(i.itemId);
        return sum + (item?.encumbrance ?? 0) * i.quantity;
      }, 0)
  );

  const stowedEnc = $derived(
    inventory
      .filter(i => i.location === 'stowed')
      .reduce((sum, i) => {
        const item = getEquipmentById(i.itemId);
        return sum + (item?.encumbrance ?? 0) * i.quantity;
      }, 0)
  );

  const encumbranceStatus = $derived.by(() => {
    const readiedOver = readiedEnc - readiedLimit;
    const stowedOver = stowedEnc - stowedLimit;
    if (readiedOver > 4 || stowedOver > 8) return 'over';
    if (readiedOver > 2 || stowedOver > 4) return 'heavy';
    if (readiedOver > 0 || stowedOver > 0) return 'light';
    return 'normal';
  });

  const movementRate = $derived.by(() => {
    switch (encumbranceStatus) {
      case 'over': return '0m (cannot move)';
      case 'heavy': return '15m (heavily encumbered)';
      case 'light': return '20m (lightly encumbered)';
      default: return '30m (normal)';
    }
  });

  function getItemsByLocation(location: ItemLocation): (InventoryItem & { data: EquipmentItem })[] {
    return inventory
      .filter(i => i.location === location)
      .map(i => ({ ...i, data: getEquipmentById(i.itemId)! }))
      .filter(i => i.data)
      .sort((a, b) => {
        const catOrder = { weapon: 0, armor: 1, gear: 2 };
        const aCat = catOrder[a.data.category] ?? 3;
        const bCat = catOrder[b.data.category] ?? 3;
        if (aCat !== bCat) return aCat - bCat;
        return a.data.name.localeCompare(b.data.name);
      });
  }

  function moveItem(itemId: string, from: ItemLocation, to: ItemLocation) {
    const idx = inventory.findIndex(i => i.itemId === itemId && i.location === from);
    if (idx === -1) return;

    const source = inventory[idx];
    // Move one unit
    if (source.quantity > 1) {
      source.quantity--;
    } else {
      inventory.splice(idx, 1);
    }

    // Add to target location
    const existing = inventory.find(i => i.itemId === itemId && i.location === to);
    if (existing) {
      existing.quantity++;
    } else {
      inventory.push({ itemId, location: to, quantity: 1 });
    }

    inventory = [...inventory];
    onUpdate(inventory, credits);
  }

  function removeItem(itemId: string, location: ItemLocation) {
    const idx = inventory.findIndex(i => i.itemId === itemId && i.location === location);
    if (idx === -1) return;

    const item = inventory[idx];
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      inventory.splice(idx, 1);
    }

    inventory = [...inventory];
    onUpdate(inventory, credits);
  }

  function addItem(itemId: string) {
    // Default: weapons/armor → readied, gear → stowed
    const item = getEquipmentById(itemId);
    const location: ItemLocation = (item?.category === 'weapon' || item?.category === 'armor') ? 'readied' : 'stowed';

    const existing = inventory.find(i => i.itemId === itemId && i.location === location);
    if (existing) {
      existing.quantity++;
    } else {
      inventory.push({ itemId, location, quantity: 1 });
    }

    inventory = [...inventory];
    onUpdate(inventory, credits);
  }

  function updateCredits(value: number) {
    credits = Math.max(0, value);
    onUpdate(inventory, credits);
  }

  const filteredAddItems = $derived(
    ALL_EQUIPMENT.filter(item => {
      if (addCategory !== 'all' && item.category !== addCategory) return false;
      if (addSearch && !item.name.toLowerCase().includes(addSearch.toLowerCase())) return false;
      return true;
    })
  );

  function getCategoryBadge(category: string): string {
    switch (category) {
      case 'weapon': return 'text-red-400 bg-red-400/10';
      case 'armor': return 'text-blue-400 bg-blue-400/10';
      case 'gear': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  }

  function getEncBarColor(current: number, limit: number): string {
    if (current > limit + 4) return 'bg-red-500';
    if (current > limit + 2) return 'bg-red-400';
    if (current > limit) return 'bg-yellow-400';
    return 'bg-cyan-400';
  }
</script>

<div class="space-y-4">
  <!-- Encumbrance Overview -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-display text-sm tracking-wider text-cyan-400">Encumbrance</h4>
      <span class="text-xs px-2 py-0.5 rounded {
        encumbranceStatus === 'over' ? 'bg-red-500/20 text-red-300' :
        encumbranceStatus === 'heavy' ? 'bg-red-400/20 text-red-300' :
        encumbranceStatus === 'light' ? 'bg-yellow-400/20 text-yellow-300' :
        'bg-green-400/20 text-green-300'
      }">
        {movementRate}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- Readied -->
      <div>
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Readied</span>
          <span class="{readiedEnc > readiedLimit ? 'text-yellow-400' : ''}">{readiedEnc} / {readiedLimit}</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all {getEncBarColor(readiedEnc, readiedLimit)}"
            style="width: {Math.min(100, (readiedEnc / Math.max(1, readiedLimit + 4)) * 100)}%"
          ></div>
        </div>
      </div>

      <!-- Stowed -->
      <div>
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Stowed</span>
          <span class="{stowedEnc > stowedLimit ? 'text-yellow-400' : ''}">{stowedEnc} / {stowedLimit}</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all {getEncBarColor(stowedEnc, stowedLimit)}"
            style="width: {Math.min(100, (stowedEnc / Math.max(1, stowedLimit + 8)) * 100)}%"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-slate-500">Credits:</span>
        <input
          type="number"
          min="0"
          value={credits}
          oninput={(e) => updateCredits(parseInt((e.target as HTMLInputElement).value) || 0)}
          class="w-24 px-2 py-1 text-sm bg-slate-800 border border-slate-600 rounded text-yellow-400 font-display"
        />
      </div>
      <button
        onclick={() => showAddItem = !showAddItem}
        class="btn btn-primary text-xs px-3 py-1.5"
      >
        {showAddItem ? 'Close' : '+ Add Item'}
      </button>
    </div>
  </div>

  <!-- Add Item Panel -->
  {#if showAddItem}
    <div class="card p-4">
      <h4 class="font-display text-sm tracking-wider text-cyan-400 mb-3">Add Item</h4>
      <div class="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search..."
          bind:value={addSearch}
          class="input text-sm flex-1"
        />
        <select bind:value={addCategory} class="input select text-sm w-28">
          <option value="all">All</option>
          <option value="weapon">Weapons</option>
          <option value="armor">Armor</option>
          <option value="gear">Gear</option>
        </select>
      </div>
      <div class="max-h-48 overflow-y-auto space-y-1">
        {#each filteredAddItems as item}
          <button
            onclick={() => addItem(item.id)}
            class="w-full flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 text-left text-sm"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-1.5 py-0.5 rounded text-[10px] uppercase {getCategoryBadge(item.category)}">{item.category.charAt(0)}</span>
              <span class="text-slate-200 truncate">{item.name}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500 shrink-0 ml-2">
              <span>Enc {item.encumbrance}</span>
              <span class="text-yellow-400/70">{item.cost}cr</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Readied Items -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-display text-sm tracking-wider text-cyan-400">Readied</h4>
      <span class="text-xs text-slate-500">Immediately usable items</span>
    </div>
    {#if getItemsByLocation('readied').length === 0}
      <p class="text-sm text-slate-600 italic">No readied items</p>
    {:else}
      <div class="space-y-1">
        {#each getItemsByLocation('readied') as item}
          <div class="flex items-center justify-between p-2 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-1.5 py-0.5 rounded text-[10px] uppercase {getCategoryBadge(item.data.category)}">
                {item.data.category.charAt(0)}
              </span>
              <span class="text-sm text-slate-200 truncate">{item.data.name}</span>
              {#if item.quantity > 1}
                <span class="text-xs text-slate-500">x{item.quantity}</span>
              {/if}
              <span class="text-xs text-slate-600">Enc {item.data.encumbrance * item.quantity}</span>
              {#if item.data.damage}
                <span class="text-xs text-red-400/70">{item.data.damage}</span>
              {/if}
              {#if item.data.armorClass}
                <span class="text-xs text-blue-400/70">AC {item.data.armorClass}</span>
              {/if}
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onclick={() => moveItem(item.itemId, 'readied', 'stowed')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Stowed"
              >Stow</button>
              <button
                onclick={() => moveItem(item.itemId, 'readied', 'stored')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Stored"
              >Store</button>
              <button
                onclick={() => removeItem(item.itemId, 'readied')}
                class="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400"
                title="Remove"
              >X</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stowed Items -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-display text-sm tracking-wider text-yellow-400">Stowed</h4>
      <span class="text-xs text-slate-500">Main Action to retrieve in combat</span>
    </div>
    {#if getItemsByLocation('stowed').length === 0}
      <p class="text-sm text-slate-600 italic">No stowed items</p>
    {:else}
      <div class="space-y-1">
        {#each getItemsByLocation('stowed') as item}
          <div class="flex items-center justify-between p-2 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-1.5 py-0.5 rounded text-[10px] uppercase {getCategoryBadge(item.data.category)}">
                {item.data.category.charAt(0)}
              </span>
              <span class="text-sm text-slate-200 truncate">{item.data.name}</span>
              {#if item.quantity > 1}
                <span class="text-xs text-slate-500">x{item.quantity}</span>
              {/if}
              <span class="text-xs text-slate-600">Enc {item.data.encumbrance * item.quantity}</span>
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onclick={() => moveItem(item.itemId, 'stowed', 'readied')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Readied"
              >Ready</button>
              <button
                onclick={() => moveItem(item.itemId, 'stowed', 'stored')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Stored"
              >Store</button>
              <button
                onclick={() => removeItem(item.itemId, 'stowed')}
                class="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400"
                title="Remove"
              >X</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stored Items -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-display text-sm tracking-wider text-slate-400">Stored</h4>
      <span class="text-xs text-slate-500">Left at ship/base, no encumbrance</span>
    </div>
    {#if getItemsByLocation('stored').length === 0}
      <p class="text-sm text-slate-600 italic">No stored items</p>
    {:else}
      <div class="space-y-1">
        {#each getItemsByLocation('stored') as item}
          <div class="flex items-center justify-between p-2 rounded bg-slate-800/50 group">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-1.5 py-0.5 rounded text-[10px] uppercase {getCategoryBadge(item.data.category)}">
                {item.data.category.charAt(0)}
              </span>
              <span class="text-sm text-slate-200 truncate">{item.data.name}</span>
              {#if item.quantity > 1}
                <span class="text-xs text-slate-500">x{item.quantity}</span>
              {/if}
            </div>
            <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onclick={() => moveItem(item.itemId, 'stored', 'readied')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Readied"
              >Ready</button>
              <button
                onclick={() => moveItem(item.itemId, 'stored', 'stowed')}
                class="px-2 py-0.5 text-[10px] rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                title="Move to Stowed"
              >Stow</button>
              <button
                onclick={() => removeItem(item.itemId, 'stored')}
                class="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 hover:bg-red-500/40 text-red-400"
                title="Remove"
              >X</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- SWN Rules Reference -->
  <div class="text-xs text-slate-600 space-y-1 px-1">
    <p><strong class="text-slate-500">Readied limit:</strong> STR / 2 (rounded down) = {readiedLimit}</p>
    <p><strong class="text-slate-500">Stowed limit:</strong> STR = {stowedLimit}</p>
    <p><strong class="text-slate-500">Over limits:</strong> +2 readied or +4 stowed = lightly enc. (20m), +4 readied or +8 stowed = heavily enc. (15m)</p>
    <p><strong class="text-slate-500">Stowed retrieval:</strong> Takes a Main Action in combat</p>
  </div>
</div>
