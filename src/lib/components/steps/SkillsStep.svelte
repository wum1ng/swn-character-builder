<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { SKILLS, COMBAT_SKILLS, PSYCHIC_SKILLS, NON_COMBAT_SKILLS } from '$data/skills';
  import { getBackgroundById } from '$data/backgrounds';
  
  let activeTab = $state<'all' | 'combat' | 'non-combat'>('all');
  
  const background = $derived(
    characterStore.draft.backgroundId 
      ? getBackgroundById(characterStore.draft.backgroundId) 
      : null
  );
  
  const filteredSkills = $derived(() => {
    const nonPsychicSkills = SKILLS.filter(s => !s.isPsychic);
    switch (activeTab) {
      case 'combat': return nonPsychicSkills.filter(s => COMBAT_SKILLS.includes(s.id));
      case 'non-combat': return nonPsychicSkills.filter(s => !COMBAT_SKILLS.includes(s.id));
      default: return nonPsychicSkills;
    }
  });
  
  function getSkillRank(skillId: string): number {
    const skill = characterStore.draft.skills.find(s => s.skillId === skillId);
    return skill?.rank ?? -1;
  }
  
  function isHobbySkill(skillId: string): boolean {
    return characterStore.draft.hobbySkill === skillId;
  }
  
  function selectHobbySkill(skillId: string) {
    if (!PSYCHIC_SKILLS.includes(skillId)) {
      characterStore.setHobbySkill(skillId);
    }
  }
  
  function getSkillColor(rank: number): string {
    if (rank < 0) return 'text-slate-500';
    if (rank === 0) return 'text-slate-300';
    if (rank === 1) return 'text-cyan-400';
    if (rank === 2) return 'text-green-400';
    if (rank === 3) return 'text-purple-400';
    return 'text-orange-400';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-2">Select Hobby Skill</h3>
    <p class="text-sm text-slate-400">
      Choose one non-psychic skill as your character's hobby or outside interest.
      {#if background}
        Your background ({background.name}) already gave you <span class="text-cyan-400">{background.freeSkill}</span> at rank 0.
      {/if}
    </p>
  </div>
  
  <!-- Current Skills Summary -->
  <div class="card p-4 bg-slate-800/50">
    <h4 class="text-sm font-display tracking-wider text-cyan-400 mb-3">Your Skills</h4>
    <div class="flex flex-wrap gap-2">
      {#each characterStore.draft.skills as skill}
        <span class="px-3 py-1 rounded-full text-sm bg-slate-700 {getSkillColor(skill.rank)}">
          {skill.skillId} ({skill.rank})
        </span>
      {:else}
        <span class="text-slate-500 text-sm">No skills yet</span>
      {/each}
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="flex gap-2 overflow-x-auto pb-2">
    {#each [
      { id: 'all', label: 'All Skills' },
      { id: 'combat', label: 'Combat' },
      { id: 'non-combat', label: 'Non-Combat' }
    ] as tab}
      <button
        onclick={() => activeTab = tab.id as any}
        class="btn {activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} text-sm whitespace-nowrap"
      >
        {tab.label}
      </button>
    {/each}
  </div>
  
  <!-- Skills Grid -->
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each filteredSkills() as skill (skill.id)}
      {@const rank = getSkillRank(skill.id)}
      {@const isHobby = isHobbySkill(skill.id)}
      {@const isCombat = COMBAT_SKILLS.includes(skill.id)}
      
      <button
        onclick={() => selectHobbySkill(skill.id)}
        class="card card-hover p-4 text-left {isHobby ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-display tracking-wider text-white flex items-center gap-2">
              {skill.name}
              {#if isCombat}
                <span class="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300">
                  Combat
                </span>
              {/if}
            </h4>
            <p class="text-xs text-slate-400 mt-1">{skill.description}</p>
          </div>
          
          {#if rank >= 0}
            <span class="px-2 py-1 text-xs font-display rounded {getSkillColor(rank)} bg-slate-700">
              {rank}
            </span>
          {/if}
        </div>
        
        {#if isHobby}
          <span class="text-xs text-cyan-400">✓ Selected as hobby skill</span>
        {/if}
      </button>
    {/each}
  </div>
  
  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p class="mb-2">
      <strong class="text-cyan-400">Skill Ranks:</strong> -1 (untrained), 0 (basic), 1 (competent), 2 (veteran), 3 (expert), 4 (master)
    </p>
    <p>
      When you make a skill check, roll 2d6 + skill rank + attribute modifier. Target is usually 7-10.
    </p>
  </div>
</div>
