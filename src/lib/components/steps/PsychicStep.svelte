<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { PSYCHIC_DISCIPLINES, getDisciplineById } from '$data/psychic';
  import { PSYCHIC_SKILLS, getSkillById } from '$data/skills';
  import type { PsychicTechnique } from '$types/character';

  // Determine how many disciplines the psychic can choose
  const maxDisciplines = $derived(
    characterStore.draft.classId === 'psychic' ? 2 : 1
  );

  // Get selected disciplines
  const selectedDisciplines = $derived(characterStore.draft.psychicDisciplines);

  // Check if a discipline is selected
  function isDisciplineSelected(id: string): boolean {
    return selectedDisciplines.includes(id);
  }

  // Toggle discipline selection
  function toggleDiscipline(id: string) {
    if (isDisciplineSelected(id)) {
      // Remove discipline and its techniques
      characterStore.draft.psychicDisciplines = selectedDisciplines.filter(d => d !== id);
      characterStore.draft.psychicTechniques = characterStore.draft.psychicTechniques.filter(
        t => !t.startsWith(id)
      );
      // Remove the psychic skill
      characterStore.draft.skills = characterStore.draft.skills.filter(
        s => s.skillId !== id
      );
    } else if (selectedDisciplines.length < maxDisciplines) {
      // Add discipline
      characterStore.draft.psychicDisciplines = [...selectedDisciplines, id];
      // Add the psychic skill at level 0
      characterStore.addSkill(id, 0);
      // Add core technique automatically
      const discipline = getDisciplineById(id);
      if (discipline) {
        characterStore.draft.psychicTechniques = [
          ...characterStore.draft.psychicTechniques,
          discipline.coreTechnique.id
        ];
      }
    }
  }

  // Check if a technique is selected
  function isTechniqueSelected(techniqueId: string): boolean {
    return characterStore.draft.psychicTechniques.includes(techniqueId);
  }

  // Toggle technique selection
  function toggleTechnique(disciplineId: string, technique: PsychicTechnique) {
    if (technique.isCore) return; // Core techniques are always included

    if (isTechniqueSelected(technique.id)) {
      characterStore.draft.psychicTechniques =
        characterStore.draft.psychicTechniques.filter(t => t !== technique.id);
    } else {
      characterStore.draft.psychicTechniques = [
        ...characterStore.draft.psychicTechniques,
        technique.id
      ];
    }
  }

  // Get available starting technique points
  // Full psychic: 1 technique per discipline
  // Partial psychic: 1 technique in their single discipline
  const techniquePoints = $derived(
    characterStore.draft.classId === 'psychic'
      ? selectedDisciplines.length
      : 1
  );

  // Count non-core techniques selected
  const techniquesSelected = $derived(
    characterStore.draft.psychicTechniques.filter(t => !t.includes('-core')).length
  );

  // Can select more techniques?
  const canSelectMoreTechniques = $derived(techniquesSelected < techniquePoints);

  // Get the skill level for a discipline (determines max technique level)
  function getDisciplineSkillLevel(disciplineId: string): number {
    const skill = characterStore.draft.skills.find(s => s.skillId === disciplineId);
    return skill?.rank ?? 0;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h3 class="font-display text-lg tracking-wider mb-2">Psychic Disciplines</h3>
    <p class="text-sm text-slate-400">
      {#if characterStore.draft.classId === 'psychic'}
        As a full Psychic, choose <span class="text-purple-400">two disciplines</span> and
        <span class="text-cyan-400">one technique</span> from each.
      {:else}
        As a partial Psychic, choose <span class="text-purple-400">one discipline</span> and
        <span class="text-cyan-400">one technique</span>.
      {/if}
    </p>
  </div>

  <!-- Selection Status -->
  <div class="card p-4 bg-slate-800/50">
    <div class="flex flex-wrap gap-4 text-sm">
      <div>
        <span class="text-slate-400">Disciplines:</span>
        <span class="text-purple-400 font-display">{selectedDisciplines.length}/{maxDisciplines}</span>
      </div>
      <div>
        <span class="text-slate-400">Techniques:</span>
        <span class="text-cyan-400 font-display">{techniquesSelected}/{techniquePoints}</span>
      </div>
    </div>
  </div>

  <!-- Discipline Selection -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each PSYCHIC_DISCIPLINES as discipline}
      {@const isSelected = isDisciplineSelected(discipline.id)}
      {@const canSelect = selectedDisciplines.length < maxDisciplines || isSelected}

      <button
        onclick={() => toggleDiscipline(discipline.id)}
        disabled={!canSelect && !isSelected}
        class="card card-hover p-4 text-left transition-all
          {isSelected ? 'border-purple-500 border-glow-purple' : ''}
          {!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}"
      >
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-display tracking-wider text-white">{discipline.name}</h4>
          {#if isSelected}
            <span class="text-purple-400">✓</span>
          {/if}
        </div>
        <p class="text-xs text-slate-400 line-clamp-2">{discipline.description}</p>
      </button>
    {/each}
  </div>

  <!-- Selected Disciplines and Techniques -->
  {#if selectedDisciplines.length > 0}
    <div class="space-y-6">
      {#each selectedDisciplines as disciplineId}
        {@const discipline = getDisciplineById(disciplineId)}
        {#if discipline}
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-4">
              <h4 class="font-display text-lg text-purple-400">{discipline.name}</h4>
              <span class="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                Skill: {discipline.skill}-0
              </span>
            </div>

            <!-- Core Technique (always included) -->
            <div class="mb-4">
              <h5 class="text-sm font-display tracking-wider text-cyan-400 mb-2">Core Technique (Free)</h5>
              <div class="p-3 rounded bg-cyan-500/10 border border-cyan-500/30">
                <div class="flex items-start justify-between mb-1">
                  <span class="font-medium text-white">{discipline.coreTechnique.name}</span>
                  <span class="text-xs text-cyan-400">{discipline.coreTechnique.cost}</span>
                </div>
                <p class="text-xs text-slate-300">{discipline.coreTechnique.description}</p>
              </div>
            </div>

            <!-- Additional Techniques -->
            <div>
              <h5 class="text-sm font-display tracking-wider text-slate-400 mb-2">
                Level 0-1 Techniques (Choose {techniquePoints > 0 && !canSelectMoreTechniques ? 0 : 1})
              </h5>
              <div class="grid gap-2">
                {#each discipline.techniques.filter(t => t.level <= 1) as technique}
                  {@const isSelected = isTechniqueSelected(technique.id)}
                  {@const canSelectThis = canSelectMoreTechniques || isSelected}

                  <button
                    onclick={() => toggleTechnique(disciplineId, technique)}
                    disabled={!canSelectThis}
                    class="p-3 rounded text-left transition-all
                      {isSelected ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-800/50 border border-slate-700'}
                      {!canSelectThis ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/30'}"
                  >
                    <div class="flex items-start justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-white text-sm">{technique.name}</span>
                        <span class="px-1.5 py-0.5 text-xs rounded bg-slate-700 text-slate-300">
                          Lvl {technique.level}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400">{technique.cost}</span>
                        {#if isSelected}
                          <span class="text-cyan-400">✓</span>
                        {/if}
                      </div>
                    </div>
                    <p class="text-xs text-slate-400">{technique.description}</p>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Higher Level Techniques (shown but disabled) -->
            {#if discipline.techniques.filter(t => t.level >= 2).length > 0}
              <div class="mt-4">
                <h5 class="text-sm font-display tracking-wider text-slate-500 mb-2">
                  Higher Level Techniques (Require skill advancement)
                </h5>
                <div class="grid gap-2 opacity-50">
                  {#each discipline.techniques.filter(t => t.level >= 2) as technique}
                    <div class="p-3 rounded bg-slate-800/30 border border-slate-700/50">
                      <div class="flex items-start justify-between mb-1">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-slate-400 text-sm">{technique.name}</span>
                          <span class="px-1.5 py-0.5 text-xs rounded bg-slate-700/50 text-slate-500">
                            Lvl {technique.level}
                          </span>
                        </div>
                        <span class="text-xs text-slate-500">{technique.cost}</span>
                      </div>
                      <p class="text-xs text-slate-500">{technique.description}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p class="mb-2">
      <strong class="text-purple-400">Effort:</strong> Your maximum Effort is 1 + highest psychic skill + best of Wis/Con modifier.
    </p>
    <p class="mb-2">
      <strong class="text-cyan-400">Techniques:</strong> You start with your Core Technique and one additional technique of level 0 or 1.
    </p>
    <p>
      <strong class="text-slate-300">Advancement:</strong> Gain new techniques as you level up and improve your psychic skills.
    </p>
  </div>
</div>

<style>
  .border-glow-purple {
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
  }
</style>
