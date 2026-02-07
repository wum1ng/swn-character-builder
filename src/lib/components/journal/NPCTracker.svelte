<script lang="ts">
  import type { NPCEntry } from '$types/character';

  interface Props {
    npcs: NPCEntry[];
    onUpdate: (npcs: NPCEntry[]) => void;
  }

  let { npcs, onUpdate }: Props = $props();

  let expandedId = $state<string | null>(null);
  let editingId = $state<string | null>(null);
  let deleteConfirmId = $state<string | null>(null);
  let filterDisposition = $state<'all' | NPCEntry['disposition']>('all');
  let sortBy = $state<'name' | 'recent'>('recent');

  // Edit form state
  let editName = $state('');
  let editFaction = $state('');
  let editLocation = $state('');
  let editDisposition = $state<NPCEntry['disposition']>('unknown');
  let editDescription = $state('');
  let editNotes = $state('');

  const dispositionConfig = {
    friendly: { label: 'Friendly', classes: 'text-green-400 bg-green-400/10' },
    neutral: { label: 'Neutral', classes: 'text-yellow-400 bg-yellow-400/10' },
    hostile: { label: 'Hostile', classes: 'text-red-400 bg-red-400/10' },
    unknown: { label: 'Unknown', classes: 'text-slate-400 bg-slate-400/10' }
  };

  const filtered = $derived.by(() => {
    let result = filterDisposition === 'all' ? [...npcs] : npcs.filter(n => n.disposition === filterDisposition);
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return result;
  });

  function addNPC() {
    const now = new Date().toISOString();
    const npc: NPCEntry = {
      id: crypto.randomUUID(),
      name: '',
      disposition: 'unknown',
      description: '',
      notes: '',
      createdAt: now,
      updatedAt: now
    };
    onUpdate([...npcs, npc]);
    startEdit(npc);
    expandedId = npc.id;
  }

  function quickAddNPC(name: string, disposition: NPCEntry['disposition']) {
    const now = new Date().toISOString();
    const npc: NPCEntry = {
      id: crypto.randomUUID(),
      name,
      disposition,
      description: '',
      notes: '',
      createdAt: now,
      updatedAt: now
    };
    onUpdate([...npcs, npc]);
  }

  function startEdit(npc: NPCEntry) {
    editingId = npc.id;
    editName = npc.name;
    editFaction = npc.faction || '';
    editLocation = npc.location || '';
    editDisposition = npc.disposition;
    editDescription = npc.description;
    editNotes = npc.notes;
  }

  function saveEdit() {
    if (!editingId) return;
    const updated = npcs.map(n => {
      if (n.id !== editingId) return n;
      return {
        ...n,
        name: editName,
        faction: editFaction || undefined,
        location: editLocation || undefined,
        disposition: editDisposition,
        description: editDescription,
        notes: editNotes,
        updatedAt: new Date().toISOString()
      };
    });
    onUpdate(updated);
    editingId = null;
  }

  function cancelEdit() {
    // If the NPC has no name, remove it (was a cancelled add)
    const npc = npcs.find(n => n.id === editingId);
    if (npc && !npc.name) {
      onUpdate(npcs.filter(n => n.id !== editingId));
    }
    editingId = null;
  }

  function confirmDelete(id: string) {
    onUpdate(npcs.filter(n => n.id !== id));
    deleteConfirmId = null;
    if (expandedId === id) expandedId = null;
  }

  function toggleExpand(id: string) {
    if (editingId) return;
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="space-y-3">
  <div class="flex flex-wrap gap-2 items-center">
    <button onclick={addNPC} class="btn text-xs px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white">
      + Add NPC
    </button>
    <select bind:value={filterDisposition} class="input select text-xs w-28 py-1.5 px-2">
      <option value="all">All</option>
      <option value="friendly">Friendly</option>
      <option value="neutral">Neutral</option>
      <option value="hostile">Hostile</option>
      <option value="unknown">Unknown</option>
    </select>
    <select bind:value={sortBy} class="input select text-xs w-28 py-1.5 px-2">
      <option value="recent">Recent</option>
      <option value="name">A-Z</option>
    </select>
  </div>

  {#if filtered.length === 0}
    <p class="text-sm text-slate-600 italic py-4 text-center">
      {npcs.length === 0 ? 'No NPCs tracked yet. Add the first NPC you meet!' : 'No NPCs match the current filter.'}
    </p>
  {:else}
    {#each filtered as npc (npc.id)}
      {@const isExpanded = expandedId === npc.id}
      {@const isEditing = editingId === npc.id}
      {@const dConfig = dispositionConfig[npc.disposition]}
      <div class="card p-3">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="flex items-center gap-2 cursor-pointer" onclick={() => toggleExpand(npc.id)}>
          <span class="w-2 h-2 rounded-full shrink-0 {npc.disposition === 'friendly' ? 'bg-green-400' : npc.disposition === 'neutral' ? 'bg-yellow-400' : npc.disposition === 'hostile' ? 'bg-red-400' : 'bg-slate-400'}"></span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-white font-display tracking-wider">{npc.name || 'Unnamed NPC'}</span>
              {#if npc.faction}
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{npc.faction}</span>
              {/if}
            </div>
            {#if npc.location && !isExpanded}
              <p class="text-[10px] text-slate-500">{npc.location}</p>
            {/if}
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded shrink-0 {dConfig.classes}">{dConfig.label}</span>
        </div>

        {#if isExpanded}
          <div class="mt-3 pt-3 border-t border-slate-700/50">
            {#if isEditing}
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">Name</label>
                    <input type="text" bind:value={editName} placeholder="NPC name..." class="input text-sm" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">Disposition</label>
                    <select bind:value={editDisposition} class="input select text-sm">
                      <option value="friendly">Friendly</option>
                      <option value="neutral">Neutral</option>
                      <option value="hostile">Hostile</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">Faction</label>
                    <input type="text" bind:value={editFaction} placeholder="Organization..." class="input text-sm" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">Location</label>
                    <input type="text" bind:value={editLocation} placeholder="Where met..." class="input text-sm" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 mb-1 uppercase">Description</label>
                  <textarea bind:value={editDescription} rows="2" placeholder="Appearance, role, personality..." class="input text-sm w-full"></textarea>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 mb-1 uppercase">Notes</label>
                  <textarea bind:value={editNotes} rows="2" placeholder="Private notes..." class="input text-sm w-full"></textarea>
                </div>
                <div class="flex gap-2 justify-end">
                  <button onclick={cancelEdit} class="btn btn-ghost text-xs px-3 py-1.5">Cancel</button>
                  <button onclick={saveEdit} class="btn text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white">Save</button>
                </div>
              </div>
            {:else}
              {#if npc.location}
                <p class="text-xs text-slate-500 mb-2">Met at: {npc.location}</p>
              {/if}
              {#if npc.description}
                <p class="text-sm text-slate-300 whitespace-pre-wrap">{npc.description}</p>
              {:else}
                <p class="text-sm text-slate-600 italic">No description yet.</p>
              {/if}
              {#if npc.notes}
                <div class="mt-2 p-2 rounded bg-slate-800/70 border border-slate-700/50">
                  <div class="text-[10px] text-slate-500 uppercase mb-1">Private Notes</div>
                  <p class="text-xs text-slate-400 whitespace-pre-wrap">{npc.notes}</p>
                </div>
              {/if}

              <div class="flex gap-2 mt-3">
                <button onclick={() => startEdit(npc)} class="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Edit</button>
                {#if deleteConfirmId === npc.id}
                  <span class="text-xs text-red-400 flex items-center gap-1">
                    Delete?
                    <button onclick={() => confirmDelete(npc.id)} class="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white">Yes</button>
                    <button onclick={() => deleteConfirmId = null} class="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">No</button>
                  </span>
                {:else}
                  <button onclick={() => deleteConfirmId = npc.id} class="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">Delete</button>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
