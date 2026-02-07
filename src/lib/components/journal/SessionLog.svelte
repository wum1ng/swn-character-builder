<script lang="ts">
  import type { SessionLogEntry } from '$types/character';

  interface Props {
    entries: SessionLogEntry[];
    onUpdate: (entries: SessionLogEntry[]) => void;
  }

  let { entries, onUpdate }: Props = $props();

  let expandedId = $state<string | null>(null);
  let editingId = $state<string | null>(null);
  let deleteConfirmId = $state<string | null>(null);

  // Edit form state
  let editTitle = $state('');
  let editContent = $state('');
  let editXp = $state('');
  let editCredits = $state('');
  let editLoot = $state('');

  const sorted = $derived([...entries].sort((a, b) => b.sessionNumber - a.sessionNumber));

  function addSession() {
    const nextNumber = entries.length > 0
      ? Math.max(...entries.map(e => e.sessionNumber)) + 1
      : 1;
    const now = new Date().toISOString();
    const entry: SessionLogEntry = {
      id: crypto.randomUUID(),
      sessionNumber: nextNumber,
      date: now.split('T')[0],
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now
    };
    onUpdate([...entries, entry]);
    startEdit(entry);
    expandedId = entry.id;
  }

  function startEdit(entry: SessionLogEntry) {
    editingId = entry.id;
    editTitle = entry.title;
    editContent = entry.content;
    editXp = entry.xpGained !== undefined ? String(entry.xpGained) : '';
    editCredits = entry.creditsGained !== undefined ? String(entry.creditsGained) : '';
    editLoot = entry.lootGained?.join(', ') || '';
  }

  function saveEdit() {
    if (!editingId) return;
    const updated = entries.map(e => {
      if (e.id !== editingId) return e;
      return {
        ...e,
        title: editTitle,
        content: editContent,
        xpGained: editXp ? parseInt(editXp) || 0 : undefined,
        creditsGained: editCredits ? parseInt(editCredits) || 0 : undefined,
        lootGained: editLoot.trim() ? editLoot.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        updatedAt: new Date().toISOString()
      };
    });
    onUpdate(updated);
    editingId = null;
  }

  function cancelEdit() {
    editingId = null;
  }

  function confirmDelete(id: string) {
    onUpdate(entries.filter(e => e.id !== id));
    deleteConfirmId = null;
    if (expandedId === id) expandedId = null;
  }

  function toggleExpand(id: string) {
    if (editingId) return;
    expandedId = expandedId === id ? null : id;
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

<div class="space-y-3">
  <button onclick={addSession} class="btn text-xs px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white w-full sm:w-auto">
    + New Session
  </button>

  {#if sorted.length === 0}
    <p class="text-sm text-slate-600 italic py-4 text-center">No sessions logged yet. Start your first session log!</p>
  {:else}
    {#each sorted as entry (entry.id)}
      {@const isExpanded = expandedId === entry.id}
      {@const isEditing = editingId === entry.id}
      <div class="card p-3">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="flex items-start justify-between cursor-pointer" onclick={() => toggleExpand(entry.id)}>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-display text-cyan-400">#{entry.sessionNumber}</span>
              <span class="text-xs text-slate-500">{formatDate(entry.date)}</span>
            </div>
            <div class="text-sm text-white mt-0.5">
              {entry.title || 'Untitled Session'}
            </div>
            {#if !isExpanded && entry.content}
              <p class="text-xs text-slate-500 mt-1 truncate">{entry.content}</p>
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
              <!-- Edit mode -->
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] text-slate-500 mb-1 uppercase">Title</label>
                  <input type="text" bind:value={editTitle} placeholder="Session title..." class="input text-sm" />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 mb-1 uppercase">Content</label>
                  <textarea bind:value={editContent} rows="5" placeholder="What happened this session..." class="input text-sm w-full"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">XP Gained</label>
                    <input type="number" bind:value={editXp} placeholder="0" min="0" class="input text-sm" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 mb-1 uppercase">Credits Gained</label>
                    <input type="number" bind:value={editCredits} placeholder="0" class="input text-sm" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 mb-1 uppercase">Loot (comma-separated)</label>
                  <input type="text" bind:value={editLoot} placeholder="Laser rifle, Med kit..." class="input text-sm" />
                </div>
                <div class="flex gap-2 justify-end">
                  <button onclick={cancelEdit} class="btn btn-ghost text-xs px-3 py-1.5">Cancel</button>
                  <button onclick={saveEdit} class="btn text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white">Save</button>
                </div>
              </div>
            {:else}
              <!-- View mode -->
              {#if entry.content}
                <p class="text-sm text-slate-300 whitespace-pre-wrap">{entry.content}</p>
              {:else}
                <p class="text-sm text-slate-600 italic">No content yet.</p>
              {/if}

              {#if entry.xpGained || entry.creditsGained || entry.lootGained?.length}
                <div class="flex flex-wrap gap-2 mt-3">
                  {#if entry.xpGained}
                    <span class="text-xs px-2 py-0.5 rounded bg-green-400/10 text-green-400">+{entry.xpGained} XP</span>
                  {/if}
                  {#if entry.creditsGained}
                    <span class="text-xs px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400">+{entry.creditsGained} cr</span>
                  {/if}
                  {#if entry.lootGained?.length}
                    {#each entry.lootGained as loot}
                      <span class="text-xs px-2 py-0.5 rounded bg-purple-400/10 text-purple-300">{loot}</span>
                    {/each}
                  {/if}
                </div>
              {/if}

              <div class="flex gap-2 mt-3">
                <button onclick={() => startEdit(entry)} class="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">Edit</button>
                {#if deleteConfirmId === entry.id}
                  <span class="text-xs text-red-400 flex items-center gap-1">
                    Delete?
                    <button onclick={() => confirmDelete(entry.id)} class="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white">Yes</button>
                    <button onclick={() => deleteConfirmId = null} class="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">No</button>
                  </span>
                {:else}
                  <button onclick={() => deleteConfirmId = entry.id} class="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400">Delete</button>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
