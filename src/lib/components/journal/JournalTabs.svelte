<script lang="ts">
  import type { CharacterJournal } from '$types/character';
  import SessionLog from './SessionLog.svelte';
  import NPCTracker from './NPCTracker.svelte';
  import QuestTracker from './QuestTracker.svelte';
  import GeneralNotes from './GeneralNotes.svelte';

  type Tab = 'sessions' | 'npcs' | 'quests' | 'notes';

  interface Props {
    journal: CharacterJournal;
    onUpdate: (journal: CharacterJournal) => void;
  }

  let { journal, onUpdate }: Props = $props();

  let activeTab = $state<Tab>('sessions');

  const tabs: { id: Tab; label: string; count?: number }[] = $derived([
    { id: 'sessions', label: 'Session Log', count: journal.sessionLog.length },
    { id: 'npcs', label: 'NPCs', count: journal.npcs.length },
    { id: 'quests', label: 'Quests', count: journal.quests.filter(q => q.status === 'active').length },
    { id: 'notes', label: 'Notes' }
  ]);

  function updateSessionLog(entries: typeof journal.sessionLog) {
    onUpdate({ ...journal, sessionLog: entries });
  }

  function updateNPCs(npcs: typeof journal.npcs) {
    onUpdate({ ...journal, npcs });
  }

  function updateQuests(quests: typeof journal.quests) {
    onUpdate({ ...journal, quests });
  }

  function updateNotes(notes: string) {
    onUpdate({ ...journal, generalNotes: notes });
  }
</script>

<div>
  <!-- Tab bar -->
  <div class="flex border-b border-slate-700/50 mb-4 overflow-x-auto">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        class="px-3 py-2 text-xs font-display tracking-wider whitespace-nowrap transition-colors relative
          {activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}"
      >
        {tab.label}
        {#if tab.count !== undefined && tab.count > 0}
          <span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full {activeTab === tab.id ? 'bg-cyan-400/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}">{tab.count}</span>
        {/if}
        {#if activeTab === tab.id}
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  {#if activeTab === 'sessions'}
    <SessionLog entries={journal.sessionLog} onUpdate={updateSessionLog} />
  {:else if activeTab === 'npcs'}
    <NPCTracker npcs={journal.npcs} onUpdate={updateNPCs} />
  {:else if activeTab === 'quests'}
    <QuestTracker quests={journal.quests} npcs={journal.npcs} onUpdate={updateQuests} />
  {:else if activeTab === 'notes'}
    <GeneralNotes notes={journal.generalNotes} onUpdate={updateNotes} />
  {/if}
</div>
