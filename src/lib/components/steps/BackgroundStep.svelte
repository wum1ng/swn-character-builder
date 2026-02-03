<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { BACKGROUNDS, getBackgroundById } from '$data/backgrounds';
  import { COMBAT_SKILLS, SKILLS, getSkillById } from '$data/skills';

  let searchQuery = $state('');
  let expandedId = $state<string | null>(null);

  const filteredBackgrounds = $derived(
    searchQuery
      ? BACKGROUNDS.filter(b =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : BACKGROUNDS
  );

  const selectedBackground = $derived(
    characterStore.draft.backgroundId
      ? getBackgroundById(characterStore.draft.backgroundId)
      : null
  );

  const needsFreeSkillChoice = $derived(
    selectedBackground?.freeSkill === 'any-combat' || selectedBackground?.freeSkill === 'any-skill'
  );

  const nonPsychicSkills = SKILLS.filter(s => !s.isPsychic);

  function selectBackground(id: string) {
    characterStore.setBackground(id);
  }

  function selectFreeSkill(skillId: string) {
    characterStore.draft.freeSkillChoice = skillId;
    characterStore.addFreeSkill(skillId);
  }

  function toggleExpand(e: MouseEvent, id: string) {
    e.stopPropagation();
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="space-y-6">
  <!-- Search -->
  <div>
    <input
      type="text"
      placeholder="Search backgrounds..."
      bind:value={searchQuery}
      class="input"
    />
  </div>
  
  <!-- Background Grid -->
  <div class="grid gap-3 sm:grid-cols-2">
    {#each filteredBackgrounds as background (background.id)}
      {@const isSelected = characterStore.draft.backgroundId === background.id}
      {@const isExpanded = expandedId === background.id}
      
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        onclick={() => selectBackground(background.id)}
        class="card card-hover p-4 text-left transition-all cursor-pointer
          {isSelected ? 'border-cyan-500 border-glow-blue' : ''}"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-display tracking-wider text-white mb-1">
              {background.name}
            </h4>
            <p class="text-xs text-slate-400 line-clamp-2">
              {background.description}
            </p>
          </div>
          
          {#if isSelected}
            <span class="ml-2 text-cyan-400">✓</span>
          {/if}
        </div>
        
        <!-- Free Skill Badge -->
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            {#if background.freeSkill === 'any-combat'}
              Free: Any Combat Skill
            {:else if background.freeSkill === 'any-skill'}
              Free: Any Skill
            {:else}
              Free: {background.freeSkill}
            {/if}
          </span>
        </div>
        
        <!-- Expandable Details -->
        <button
          onclick={(e) => toggleExpand(e, background.id)}
          class="mt-3 text-xs text-cyan-400 hover:underline"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
        
        {#if isExpanded}
          <div class="mt-3 pt-3 border-t border-slate-700 text-xs space-y-2">
            <div>
              <span class="text-slate-400">Quick Skills: </span>
              <span class="text-slate-300">{background.quickSkills.join(', ')}</span>
            </div>
            <div>
              <span class="text-slate-400">Learning Table: </span>
              <span class="text-slate-300">{background.learningTable.join(', ')}</span>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  {#if filteredBackgrounds.length === 0}
    <p class="text-center text-slate-500 py-8">No backgrounds match your search</p>
  {/if}

  <!-- Free skill choice for any-combat/any-skill backgrounds -->
  {#if needsFreeSkillChoice}
    <div class="card p-4 border-green-500/30">
      <h4 class="font-display text-green-400 mb-3">Choose Your Free Skill</h4>
      <p class="text-sm text-slate-300 mb-3">
        {#if selectedBackground?.freeSkill === 'any-combat'}
          Your background grants a free combat skill. Select one:
        {:else}
          Your background grants a free skill. Select one:
        {/if}
      </p>
      <select
        class="input select text-sm max-w-xs"
        value={characterStore.draft.freeSkillChoice ?? ''}
        onchange={(e) => {
          const val = (e.target as HTMLSelectElement).value;
          if (val) {
            // Clear previous choice before applying new one
            if (characterStore.draft.freeSkillChoice) {
              characterStore.draft.skills = characterStore.draft.skills.filter(
                s => s.skillId !== characterStore.draft.freeSkillChoice
              );
            }
            selectFreeSkill(val);
          }
        }}
      >
        <option value="">-- Select a skill --</option>
        {#if selectedBackground?.freeSkill === 'any-combat'}
          {#each COMBAT_SKILLS as skillId}
            <option value={skillId}>{getSkillById(skillId)?.name || skillId}</option>
          {/each}
        {:else}
          {#each nonPsychicSkills as skill}
            <option value={skill.id}>{skill.name}</option>
          {/each}
        {/if}
      </select>
    </div>
  {/if}

  <!-- Help Text -->
  <div class="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-4">
    <p>
      Your background represents your character's past and gives you a free skill at rank 0.
      Choose the background that best fits your character concept.
    </p>
  </div>
</div>
