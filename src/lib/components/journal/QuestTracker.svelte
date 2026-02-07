<script lang="ts">
  import type { QuestEntry, NPCEntry } from '$types/character';

  interface Props {
    quests: QuestEntry[];
    npcs: NPCEntry[];
    onUpdate: (quests: QuestEntry[]) => void;
  }

  let { quests, npcs, onUpdate }: Props = $props();

  let expandedId = $state<string | null>(null);
  let editingId = $state<string | null>(null);
  let deleteConfirmId = $state<string | null>(null);

  // Edit form state
  let editTitle = $state('');
  let editDescription = $state('');
  let editStatus = $state<QuestEntry['status']>('active');
  let editGiverNpcId = $state('');
  let editReward = $state('');
  let editNotes = $state('');

  const statusConfig: Record<QuestEntry['status'], { label: string; classes: string; order: number }> = {
    active: { label: 'Active', classes: 'text-cyan-400 bg-cyan-400/10', order: 0 },
    completed: { label: 'Completed', classes: 'text-green-400 bg-green-400/10', order: 1 },
    failed: { label: 'Failed', classes: 'text-red-400 bg-red-400/10', order: 2 },
    abandoned: { label: 'Abandoned', classes: 'text-slate-400 bg-slate-400/10', order: 3 }
  };

  const grouped = $derived.by(() => {
    const groups: Record<string, QuestEntry[]> = { active: [], completed: [], failed: [], abandoned: [] };
    for (const q of quests) {
      groups[q.status].push(q);
    }
    // Sort within groups by updatedAt descending
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return groups;
  });

  const groupOrder: QuestEntry['status'][] = ['active', 'completed', 'failed', 'abandoned'];

  function addQuest() {
    const now = new Date().toISOString();
    const quest: QuestEntry = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      status: 'active',
      notes: '',
      createdAt: now,
      updatedAt: now
    };
    onUpdate([...quests, quest]);
    startEdit(quest);
    expandedId = quest.id;
  }

  function startEdit(quest: QuestEntry) {
    editingId = quest.id;
    editTitle = quest.title;
    editDescription = quest.description;
    editStatus = quest.status;
    editGiverNpcId = quest.giverNpcId || '';
    editReward = quest.reward || '';
    editNotes = quest.notes;
  }

  function saveEdit() {
    if (!editingId) return;
    const updated = quests.map(q => {
      if (q.id !== editingId) return q;
      return {
        ...q,
        title: editTitle,
        description: editDescription,
        status: editStatus,
        giverNpcId: editGiverNpcId || undefined,
        reward: editReward || undefined,
        notes: editNotes,
        updatedAt: new Date().toISOString()
      };
    });
    onUpdate(updated);
    editingId = null;
  }

  function cancelEdit() {
    const quest = quests.find(q => q.id === editingId);
    if (quest && !quest.title) {
      onUpdate(quests.filter(q => q.id !== editingId));
    }
    editingId = null;
  }

  function setStatus(id: string, status: QuestEntry['status']) {
    const updated = quests.map(q => {
      if (q.id !== id) return q;
      return { ...q, status, updatedAt: new Date().toISOString() };
    });
    onUpdate(updated);
  }

  function confirmDelete(id: string) {
    onUpdate(quests.filter(q => q.id !== id));
    deleteConfirmId = null;
    if (expandedId === id) expandedId = null;
  }

  function toggleExpand(id: string) {
    if (editingId) return;
    expandedId = expandedId === id ? null : id;
  }

  function getNpcName(id: string): string {
    return npcs.find(n => n.id === id)?.name || 'Unknown NPC';
  }
</script>

<div class="space-y-3">
  <button onclick={addQuest} class="btn text-xs px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white w-full sm:w-auto">
    + Add Quest
  </button>

  {#if quests.length === 0}
    <p class="text-sm text-slate-600 italic py-4 text-center">No quests tracked yet. Add your first quest!</p>
  {:else}
    {#each groupOrder as status}
      {@const group = grouped[status]}
      {#if group.length > 0}
        <div>
          <h5 class="font-display text-[10px] tracking-wider uppercase mb-2 {statusConfig[status].classes.split(' ')[0]}">{statusConfig[status].label} ({group.length})</h5>
          {#each group as quest (quest.id)}
            {@const isExpanded = expandedId === quest.id}
            {@const isEditing = editingId === quest.id}
            <div class="card p-3 mb-2">
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="flex items-start justify-between cursor-pointer" onclick={() => toggleExpand(quest.id)}>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[10px] px-1.5 py-0.5 rounded {statusConfig[quest.status].classes}">{statusConfig[quest.status].label}</span>
                    <span class="text-sm text-white">{quest.title || 'Untitled Quest'}</span>
                  </div>
                  {#if !isExpanded}
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      {#if quest.giverNpcId}
                        <span class="text-[10px] text-slate-500">From: {getNpcName(quest.giverNpcId)}</span>
                      {/if}
                      {#if quest.reward}
                        <span class="text-[10px] text-yellow-400/70">Reward: {quest.reward}</span>
                      {/if}
                    </div>
                  {/if}
                </div>
                <div class="text-slate-600 ml-2 shrink-0">
                  <svg class="w-4 h-4 transition-transform {isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {#if isExpanded}
                <div class="mt-3 pt-3 border-t border-slate-700/50">
                  {#if isEditing}
                    <div class="space-y-3">
                      <div>
                        <label class="block text-[10px] text-slate-500 mb-1 uppercase">Title</label>
                        <input type="text" bind:value={editTitle} placeholder="Quest title..." class="input text-sm" />
                      </div>
                      <div>
                        <label class="block text-[10px] text-slate-500 mb-1 uppercase">Description</label>
                        <textarea bind:value={editDescription} rows="3" placeholder="Quest details..." class="input text-sm w-full"></textarea>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-[10px] text-slate-500 mb-1 uppercase">Status</label>
                          <select bind:value={editStatus} class="input select text-sm">
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="abandoned">Abandoned</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 mb-1 uppercase">Quest Giver</label>
                          <select bind:value={editGiverNpcId} class="input select text-sm">
                            <option value="">None</option>
                            {#each npcs as npc}
                              <option value={npc.id}>{npc.name || 'Unnamed'}</option>
                            {/each}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label class="block text-[10px] text-slate-500 mb-1 uppercase">Reward</label>
                        <input type="text" bind:value={editReward} placeholder="500 credits, access to armory..." class="input text-sm" />
                      </div>
                      <div>
                        <label class="block text-[10px] text-slate-500 mb-1 uppercase">Notes</label>
                        <textarea bind:value={editNotes} rows="2" placeholder="Additional notes..." class="input text-sm w-full"></textarea>
                      </div>
                      <div class="flex gap-2 justify-end">
                        <button onclick={cancelEdit} class="btn btn-ghost text-xs px-3 py-1.5">Cancel</button>
                        <button onclick={saveEdit} class="btn text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white">Save</button>
                      </div>
                    </div>
                  {:else}
                    {#if quest.giverNpcId}
                      <p class="text-xs text-slate-500 mb-2">Quest giver: {getNpcName(quest.giverNpcId)}</p>
                    {/if}
                    {#if quest.description}
                      <p class="text-sm text-slate-300 whitespace-pre-wrap">{quest.description}</p>
                    {:else}
                      <p class="text-sm text-slate-600 italic">No description yet.</p>
                    {/if}
                    {#if quest.reward}
                      <p class="text-xs text-yellow-400/70 mt-2">Reward: {quest.reward}</p>
                    {/if}
                    {#if quest.notes}
                      <div class="mt-2 p-2 rounded bg-slate-800/70 border border-slate-700/50">
                        <div class="text-[10px] text-slate-500 uppercase mb-1">Notes</div>
                        <p class="text-xs text-slate-400 whitespace-pre-wrap">{quest.notes}</p>
                      </div>
                    {/if}

                    <!-- Status toggle buttons -->
                    <div class="flex flex-wrap gap-1 mt-3">
                      {#each (['active', 'completed', 'failed', 'abandoned'] as const) as s}
                        {#if s !== quest.status}
                          <button
                            onclick={() => setStatus(quest.id, s)}
                            class="text-[10px] px-2 py-1 rounded {statusConfig[s].classes} hover:opacity-80"
                          >
                            Mark {statusConfig[s].label}
                          </button>
                        {/if}
                      {/each}
                    </div>

                    <div class="flex gap-2 mt-3">
                      <button onclick={() => startEdit(quest)} class="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Edit</button>
                      {#if deleteConfirmId === quest.id}
                        <span class="text-xs text-red-400 flex items-center gap-1">
                          Delete?
                          <button onclick={() => confirmDelete(quest.id)} class="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white">Yes</button>
                          <button onclick={() => deleteConfirmId = null} class="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">No</button>
                        </span>
                      {:else}
                        <button onclick={() => deleteConfirmId = quest.id} class="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">Delete</button>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}
</div>
