<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import {
    EQUIPMENT_PACKAGES,
    ALL_EQUIPMENT,
    getPackageById,
    getEquipmentById,
    STARTING_CREDITS,
    type EquipmentItem,
    type EquipmentPackage
  } from '$data/equipment';

  type TabMode = 'packages' | 'custom';

  let mode = $state<TabMode>('packages');
  let searchQuery = $state('');
  let categoryFilter = $state<'all' | 'weapon' | 'armor' | 'gear'>('all');
  let expandedPackageId = $state<string | null>(null);

  // Custom shopping cart state
  let cart = $state<string[]>([...characterStore.draft.equipment]);
  let customCredits = $state(characterStore.draft.credits || STARTING_CREDITS);

  // If switching to custom mode, initialize cart properly
  $effect(() => {
    if (mode === 'custom' && cart.length === 0 && !characterStore.draft.equipmentPackageId) {
      customCredits = STARTING_CREDITS;
    }
  });

  const filteredEquipment = $derived(
    ALL_EQUIPMENT.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
  );

  const cartTotal = $derived(
    cart.reduce((sum, itemId) => {
      const item = getEquipmentById(itemId);
      return sum + (item?.cost ?? 0);
    }, 0)
  );

  const remainingCredits = $derived(STARTING_CREDITS - cartTotal);

  const cartEncumbrance = $derived(
    cart.reduce((sum, itemId) => {
      const item = getEquipmentById(itemId);
      return sum + (item?.encumbrance ?? 0);
    }, 0)
  );

  // Group cart items for display
  const groupedCart = $derived(() => {
    const groups: Record<string, { item: EquipmentItem; count: number }> = {};
    for (const itemId of cart) {
      const item = getEquipmentById(itemId);
      if (item) {
        if (groups[itemId]) {
          groups[itemId].count++;
        } else {
          groups[itemId] = { item, count: 1 };
        }
      }
    }
    return Object.values(groups).sort((a, b) => a.item.name.localeCompare(b.item.name));
  });

  function selectPackage(packageId: string) {
    const pkg = getPackageById(packageId);
    if (!pkg) return;

    characterStore.draft.equipmentPackageId = packageId;
    characterStore.draft.equipment = [...pkg.items];
    characterStore.draft.credits = pkg.credits;
    cart = [...pkg.items];
    customCredits = pkg.credits;
  }

  function togglePackageExpand(e: MouseEvent, id: string) {
    e.stopPropagation();
    expandedPackageId = expandedPackageId === id ? null : id;
  }

  function addToCart(itemId: string) {
    const item = getEquipmentById(itemId);
    if (!item) return;
    if (item.cost > remainingCredits) return;

    cart = [...cart, itemId];
    updateDraftFromCart();
  }

  function removeFromCart(itemId: string) {
    const index = cart.indexOf(itemId);
    if (index > -1) {
      cart = [...cart.slice(0, index), ...cart.slice(index + 1)];
      updateDraftFromCart();
    }
  }

  function clearCart() {
    cart = [];
    updateDraftFromCart();
  }

  function updateDraftFromCart() {
    characterStore.draft.equipmentPackageId = undefined;
    characterStore.draft.equipment = [...cart];
    characterStore.draft.credits = remainingCredits;
  }

  function switchToCustom() {
    mode = 'custom';
    // Keep current equipment if any
    if (characterStore.draft.equipmentPackageId) {
      const pkg = getPackageById(characterStore.draft.equipmentPackageId);
      if (pkg) {
        cart = [...pkg.items];
        customCredits = pkg.credits;
      }
    }
  }

  function getCategoryLabel(category: string): string {
    switch(category) {
      case 'weapon': return 'Weapons';
      case 'armor': return 'Armor';
      case 'gear': return 'Gear';
      default: return category;
    }
  }

  function formatCredits(amount: number): string {
    return amount.toLocaleString();
  }
</script>

<div class="space-y-6">
  <!-- Mode Tabs -->
  <div class="flex gap-2 border-b border-slate-700">
    <button
      onclick={() => mode = 'packages'}
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
        {mode === 'packages'
          ? 'text-cyan-400 border-cyan-400'
          : 'text-slate-400 border-transparent hover:text-slate-300'}"
    >
      Quick Packages
    </button>
    <button
      onclick={switchToCustom}
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
        {mode === 'custom'
          ? 'text-cyan-400 border-cyan-400'
          : 'text-slate-400 border-transparent hover:text-slate-300'}"
    >
      Custom Loadout
    </button>
  </div>

  {#if mode === 'packages'}
    <!-- Package Selection Mode -->
    <div class="grid gap-4 sm:grid-cols-2">
      {#each EQUIPMENT_PACKAGES as pkg (pkg.id)}
        {@const isSelected = characterStore.draft.equipmentPackageId === pkg.id}
        {@const isExpanded = expandedPackageId === pkg.id}

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onclick={() => selectPackage(pkg.id)}
          class="card card-hover p-4 text-left transition-all cursor-pointer
            {isSelected ? 'border-cyan-500 border-glow-blue' : ''}"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-display tracking-wider text-white mb-1">
                {pkg.name}
              </h4>
              <p class="text-xs text-slate-400 line-clamp-2">
                {pkg.description}
              </p>
            </div>

            {#if isSelected}
              <span class="ml-2 text-cyan-400">✓</span>
            {/if}
          </div>

          <!-- Credits Badge -->
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              +{formatCredits(pkg.credits)} credits
            </span>
            <span class="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
              {pkg.items.length} items
            </span>
          </div>

          <!-- Expandable Details -->
          <button
            onclick={(e) => togglePackageExpand(e, pkg.id)}
            class="mt-3 text-xs text-cyan-400 hover:underline"
          >
            {isExpanded ? 'Hide contents' : 'Show contents'}
          </button>

          {#if isExpanded}
            <div class="mt-3 pt-3 border-t border-slate-700 text-xs space-y-1 max-h-48 overflow-y-auto">
              {#each pkg.items as itemId}
                {@const item = getEquipmentById(itemId)}
                {#if item}
                  <div class="flex items-center justify-between text-slate-300">
                    <span>{item.name}</span>
                    <span class="text-slate-500">{formatCredits(item.cost)}cr</span>
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>

  {:else}
    <!-- Custom Loadout Mode -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Equipment Browser -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Budget Bar -->
        <div class="bg-slate-800/50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-400">Budget</span>
            <span class="font-display text-lg {remainingCredits < 0 ? 'text-red-400' : 'text-yellow-300'}">
              {formatCredits(remainingCredits)} / {formatCredits(STARTING_CREDITS)} credits
            </span>
          </div>
          <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full transition-all {remainingCredits < 0 ? 'bg-red-500' : 'bg-yellow-500'}"
              style="width: {Math.min(100, Math.max(0, (cartTotal / STARTING_CREDITS) * 100))}%"
            ></div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search equipment..."
            bind:value={searchQuery}
            class="input flex-1"
          />
          <select
            bind:value={categoryFilter}
            class="input sm:w-40"
          >
            <option value="all">All Categories</option>
            <option value="weapon">Weapons</option>
            <option value="armor">Armor</option>
            <option value="gear">Gear</option>
          </select>
        </div>

        <!-- Equipment List -->
        <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
          {#each filteredEquipment as item (item.id)}
            {@const canAfford = item.cost <= remainingCredits}
            <div
              class="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between gap-3
                {canAfford ? '' : 'opacity-50'}"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-white truncate">{item.name}</span>
                  <span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-700 text-slate-400 uppercase shrink-0">
                    {item.category}
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{formatCredits(item.cost)} cr</span>
                  <span>Enc: {item.encumbrance}</span>
                  {#if item.damage}
                    <span class="text-red-300">Dmg: {item.damage}</span>
                  {/if}
                  {#if item.armorClass}
                    <span class="text-blue-300">AC: {item.armorClass}</span>
                  {/if}
                </div>
                {#if item.description}
                  <p class="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                {/if}
              </div>

              <button
                onclick={() => addToCart(item.id)}
                disabled={!canAfford}
                class="btn btn-sm px-3 py-1.5 text-xs
                  {canAfford
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}"
              >
                Add
              </button>
            </div>
          {/each}

          {#if filteredEquipment.length === 0}
            <p class="text-center text-slate-500 py-8">No equipment matches your search</p>
          {/if}
        </div>
      </div>

      <!-- Shopping Cart -->
      <div class="lg:col-span-1">
        <div class="card p-4 sticky top-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display tracking-wider text-white">Your Gear</h3>
            {#if cart.length > 0}
              <button
                onclick={clearCart}
                class="text-xs text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            {/if}
          </div>

          {#if cart.length === 0}
            <p class="text-sm text-slate-500 text-center py-8">
              No items selected. Add equipment from the list.
            </p>
          {:else}
            <div class="space-y-2 max-h-64 overflow-y-auto mb-4">
              {#each groupedCart() as { item, count } (item.id)}
                <div class="flex items-center justify-between text-sm bg-slate-800/50 rounded px-2 py-1.5">
                  <div class="flex items-center gap-2 min-w-0">
                    {#if count > 1}
                      <span class="text-cyan-400 font-mono text-xs">{count}x</span>
                    {/if}
                    <span class="text-slate-300 truncate">{item.name}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-slate-500 text-xs">{formatCredits(item.cost * count)}</span>
                    <button
                      onclick={() => removeFromCart(item.id)}
                      class="text-red-400 hover:text-red-300 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              {/each}
            </div>

            <div class="border-t border-slate-700 pt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Items:</span>
                <span class="text-white">{cart.length}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Encumbrance:</span>
                <span class="text-white">{cartEncumbrance}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Total Cost:</span>
                <span class="text-yellow-300">{formatCredits(cartTotal)} cr</span>
              </div>
              <div class="flex justify-between font-medium">
                <span class="text-slate-400">Remaining:</span>
                <span class="{remainingCredits < 0 ? 'text-red-400' : 'text-green-400'}">
                  {formatCredits(remainingCredits)} cr
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p>
      {#if mode === 'packages'}
        Choose a pre-made equipment package to quickly outfit your character.
        Each package includes appropriate gear and some starting credits.
      {:else}
        Build your own loadout with {formatCredits(STARTING_CREDITS)} starting credits.
        Remaining credits will be available for use in-game.
      {/if}
    </p>
  </div>
</div>
