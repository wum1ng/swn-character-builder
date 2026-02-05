<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
  import { FOCI, COMBAT_FOCI, NON_COMBAT_FOCI, PSYCHIC_FOCI, ORIGIN_FOCI, ALIEN_FEATURES, ROBOT_TYPES, getFocusById, getAlienFeatureById, getRobotTypeById } from '$data/foci';
  import { getSkillById, SKILLS } from '$data/skills';
  import type { Focus } from '$types/character';

  // Track focus bonus skill choices (focusId -> chosen skillId)
  let focusSkillChoices = $state<Record<string, string>>({});

  let activeTab = $state<'all' | 'combat' | 'non-combat' | 'psychic' | 'origins'>('all');
  let expandedId = $state<string | null>(null);
  let originsUnlocked = $state(false);

  // Determine how many foci the character can select
  const maxFoci = $derived(() => {
    let count = 1; // Everyone gets 1

    // Warriors and partial warriors get a combat focus
    if (characterStore.draft.classId === 'warrior' ||
        characterStore.draft.partialClasses?.includes('partial-warrior')) {
      count++;
    }

    // Experts and partial experts get a non-combat focus
    if (characterStore.draft.classId === 'expert' ||
        characterStore.draft.partialClasses?.includes('partial-expert')) {
      count++;
    }

    return count;
  });

  const filteredFoci = $derived(() => {
    switch (activeTab) {
      case 'combat': return COMBAT_FOCI;
      case 'non-combat': return NON_COMBAT_FOCI;
      case 'psychic': return PSYCHIC_FOCI;
      case 'origins': return ORIGIN_FOCI;
      default: return FOCI;
    }
  });

  const hasOriginFocus = $derived(() => {
    return characterStore.draft.selectedFoci.some(f => {
      const focus = getFocusById(f.focusId);
      return focus?.type === 'origin';
    });
  });

  function isSelected(focusId: string): boolean {
    return characterStore.draft.selectedFoci.some(f => f.focusId === focusId);
  }

  function getSelectedLevel(focusId: string): number {
    const found = characterStore.draft.selectedFoci.find(f => f.focusId === focusId);
    return found?.level || 0;
  }

  function toggleFocus(focus: Focus) {
    if (isSelected(focus.id)) {
      delete focusSkillChoices[focus.id];
      characterStore.removeFocus(focus.id);
      // Clear alien features if deselecting alien origin
      if (focus.id === 'alien-origin') {
        characterStore.draft.alienFeatures = [];
      }
      // Clear robot type if deselecting robot PC
      if (focus.id === 'robot-pc') {
        characterStore.draft.robotType = undefined;
        characterStore.draft.robotAttributeBonus = undefined;
      }
    } else {
      // Origin foci are always level 1 only
      characterStore.addFocus(focus.id, 1);
    }
  }

  function selectFocusBonusSkill(focusId: string, skillId: string) {
    focusSkillChoices[focusId] = skillId;
    characterStore.addFreeSkill(skillId);
  }

  function upgradeFocus(focusId: string) {
    characterStore.addFocus(focusId, 2);
  }

  function isAlienFeatureSelected(featureId: string): boolean {
    return characterStore.draft.alienFeatures.includes(featureId);
  }

  function toggleAlienFeature(featureId: string) {
    const features = characterStore.draft.alienFeatures;
    if (features.includes(featureId)) {
      characterStore.draft.alienFeatures = features.filter(f => f !== featureId);
    } else if (features.length < 2) {
      characterStore.draft.alienFeatures = [...features, featureId];
    }
  }

  function getFocusTypeColor(type: string): string {
    switch (type) {
      case 'combat': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'non-combat': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'psychic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'origin': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }

  // Get non-combat, non-psychic skills for Robot PC bonus skill choice
  const robotBonusSkills = SKILLS.filter(s => !s.isPsychic);

  // Attribute options for Worker Bot bonus
  const ATTRIBUTE_OPTIONS: { id: string; label: string }[] = [
    { id: 'strength', label: 'Strength' },
    { id: 'dexterity', label: 'Dexterity' },
    { id: 'constitution', label: 'Constitution' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'wisdom', label: 'Wisdom' },
    { id: 'charisma', label: 'Charisma' }
  ];

  function selectRobotType(typeId: string) {
    characterStore.draft.robotType = typeId;
    // Clear previous bonus skill choice when changing type
    delete focusSkillChoices['robot-pc'];
    // Clear attribute bonus
    characterStore.draft.robotAttributeBonus = undefined;

    // Vehicle Bot automatically gets Pilot
    if (typeId === 'vehicle-bot') {
      focusSkillChoices['robot-pc'] = 'pilot';
      characterStore.addFreeSkill('pilot');
    }
  }
</script>

<div class="space-y-6">
  <!-- Selection Count -->
  <div class="flex items-center justify-between">
    <p class="text-sm text-slate-400">
      Select {maxFoci()} focus{maxFoci() > 1 ? 'es' : ''} for your character
    </p>
    <span class="font-display text-cyan-400">
      {characterStore.draft.selectedFoci.length} / {maxFoci()}
    </span>
  </div>

  <!-- Tabs -->
  <div class="flex gap-2 overflow-x-auto pb-2">
    {#each [
      { id: 'all', label: 'All' },
      { id: 'combat', label: 'Combat' },
      { id: 'non-combat', label: 'Non-Combat' },
      { id: 'psychic', label: 'Psychic' }
    ] as tab}
      <button
        onclick={() => activeTab = tab.id as any}
        class="btn {activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} text-sm whitespace-nowrap"
      >
        {tab.label}
      </button>
    {/each}
    <!-- Origins Tab (separate, with lock indicator) -->
    <button
      onclick={() => activeTab = 'origins'}
      class="btn {activeTab === 'origins' ? 'btn-primary' : 'btn-ghost'} text-sm whitespace-nowrap flex items-center gap-1.5"
    >
      {#if !originsUnlocked}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
      {/if}
      Origins
    </button>
  </div>

  <!-- Origins Tab Content -->
  {#if activeTab === 'origins'}
    {#if !originsUnlocked}
      <!-- Lock Screen -->
      <div class="card p-6 text-center space-y-4 border-amber-500/30">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="font-display text-lg text-amber-300 tracking-wider">Origin Foci Locked</h3>
          <p class="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Origin foci allow you to play as a Robot or Alien character. These require GM approval as they replace your free focus pick with an origin that grants unique traits beyond the human baseline.
          </p>
        </div>
        <button
          onclick={() => originsUnlocked = true}
          class="btn bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 px-6"
        >
          Unlock with GM Approval
        </button>
      </div>
    {:else}
      <!-- Origin Foci Grid -->
      <div class="mb-3">
        <p class="text-xs text-amber-400/80">
          Origin foci cost your free focus pick. They have only one level and can normally only be taken during character creation.
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each ORIGIN_FOCI as focus (focus.id)}
          {@const selected = isSelected(focus.id)}

          <div
            class="card p-4 transition-all {selected ? 'border-amber-500 border-glow-blue' : ''}"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-display tracking-wider text-white">{focus.name}</h4>
                  <span class="px-2 py-0.5 text-xs rounded-full border {getFocusTypeColor('origin')}">
                    origin
                  </span>
                </div>
                <p class="text-xs text-slate-400">{focus.description}</p>
              </div>

              <button
                onclick={() => toggleFocus(focus)}
                class="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  {selected ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
              >
                {selected ? '✓' : '+'}
              </button>
            </div>

            <!-- Expand/Collapse -->
            <button
              onclick={() => expandedId = expandedId === focus.id ? null : focus.id}
              class="text-xs text-cyan-400 hover:underline"
            >
              {expandedId === focus.id ? 'Hide abilities' : 'Show abilities'}
            </button>

            {#if expandedId === focus.id}
              <div class="mt-3 pt-3 border-t border-slate-700 space-y-3">
                <div>
                  <span class="text-xs font-display text-amber-400">Traits</span>
                  <p class="text-xs text-slate-400 mt-1">{focus.level1.description}</p>
                  <ul class="mt-2 space-y-1">
                    {#each focus.level1.abilities as ability}
                      <li class="text-xs text-slate-300 flex items-start gap-1.5">
                        <span class="text-amber-400 mt-0.5">&#9670;</span>
                        {ability}
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/if}

            <!-- Selected State -->
            {#if selected}
              <div class="mt-3 flex gap-2">
                <span class="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-400">
                  Origin
                </span>
              </div>

              <!-- Robot PC: Sub-type Selection -->
              {#if focus.id === 'robot-pc'}
                <div class="mt-3 pt-3 border-t border-slate-700">
                  <p class="text-xs text-slate-400 mb-2">Choose your robot sub-type:</p>
                  <div class="space-y-2">
                    {#each ROBOT_TYPES as robotType}
                      {@const isTypeSelected = characterStore.draft.robotType === robotType.id}
                      <button
                        onclick={() => selectRobotType(robotType.id)}
                        class="w-full text-left p-2.5 rounded border transition-all
                          {isTypeSelected
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}"
                      >
                        <div class="flex items-start gap-2">
                          <div class="mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center
                            {isTypeSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}">
                            {#if isTypeSelected}
                              <div class="w-2 h-2 rounded-full bg-white"></div>
                            {/if}
                          </div>
                          <div class="flex-1">
                            <span class="text-xs font-display text-white">{robotType.name}</span>
                            <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{robotType.description}</p>
                            {#if isTypeSelected}
                              <ul class="mt-1.5 space-y-0.5">
                                {#each robotType.abilities as ability}
                                  <li class="text-[11px] text-slate-300 flex items-start gap-1">
                                    <span class="text-amber-400 mt-0.5">&#9670;</span>
                                    {ability}
                                  </li>
                                {/each}
                              </ul>
                            {/if}
                          </div>
                        </div>
                      </button>
                    {/each}
                  </div>

                  <!-- Bonus skill / attribute selection based on sub-type -->
                  {#if characterStore.draft.robotType}
                    <div class="mt-3 pt-2 border-t border-slate-700/50">
                      {#if characterStore.draft.robotType === 'vehicle-bot'}
                        <span class="text-xs text-green-400">
                          Bonus skill: Pilot (automatic)
                        </span>
                      {:else}
                        <!-- Android or Worker Bot: choose bonus skill -->
                        {#if focusSkillChoices[focus.id]}
                          <span class="text-xs text-green-400">
                            Function skill: {getSkillById(focusSkillChoices[focus.id])?.name || focusSkillChoices[focus.id]}
                          </span>
                        {:else}
                          <p class="text-xs text-slate-400 mb-1">Choose bonus skill (your intended function):</p>
                          <select
                            class="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                            onchange={(e) => {
                              const val = (e.target as HTMLSelectElement).value;
                              if (val) selectFocusBonusSkill(focus.id, val);
                            }}
                          >
                            <option value="">-- Select --</option>
                            {#each robotBonusSkills as skill}
                              <option value={skill.id}>{skill.name}</option>
                            {/each}
                          </select>
                        {/if}
                      {/if}

                      <!-- Worker Bot: Attribute bonus picker -->
                      {#if characterStore.draft.robotType === 'worker-bot'}
                        <div class="mt-2">
                          {#if characterStore.draft.robotAttributeBonus}
                            <span class="text-xs text-green-400">
                              Attribute bonus: +1 {ATTRIBUTE_OPTIONS.find(a => a.id === characterStore.draft.robotAttributeBonus)?.label} modifier
                            </span>
                          {:else}
                            <p class="text-xs text-slate-400 mb-1">Choose attribute for +1 modifier bonus (max +2):</p>
                            <select
                              class="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                              onchange={(e) => {
                                const val = (e.target as HTMLSelectElement).value;
                                if (val) characterStore.draft.robotAttributeBonus = val;
                              }}
                            >
                              <option value="">-- Select Attribute --</option>
                              {#each ATTRIBUTE_OPTIONS as attr}
                                <option value={attr.id}>{attr.label}</option>
                              {/each}
                            </select>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- Alien Origin: Feature Picker -->
              {#if focus.id === 'alien-origin'}
                <div class="mt-3 pt-3 border-t border-slate-700">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs text-slate-400">Choose 2 alien features:</p>
                    <span class="text-xs font-display {characterStore.draft.alienFeatures.length === 2 ? 'text-green-400' : 'text-amber-400'}">
                      {characterStore.draft.alienFeatures.length} / 2
                    </span>
                  </div>
                  <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {#each ALIEN_FEATURES as feature}
                      {@const featureSelected = isAlienFeatureSelected(feature.id)}
                      {@const atLimit = characterStore.draft.alienFeatures.length >= 2 && !featureSelected}
                      <button
                        onclick={() => toggleAlienFeature(feature.id)}
                        disabled={atLimit}
                        class="w-full text-left p-2.5 rounded border transition-all
                          {featureSelected
                            ? 'border-green-500/50 bg-green-500/10'
                            : atLimit
                              ? 'border-slate-700/50 bg-slate-800/50 opacity-40 cursor-not-allowed'
                              : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}"
                      >
                        <div class="flex items-start gap-2">
                          <div class="mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                            {featureSelected ? 'bg-green-500 border-green-500' : 'border-slate-500'}">
                            {#if featureSelected}
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            {/if}
                          </div>
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-display text-white">{feature.name}</span>
                              {#if !feature.isMajor}
                                <span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-600/50 text-slate-400">minor</span>
                              {/if}
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <!-- Standard Foci Grid -->
    <div class="grid gap-3 sm:grid-cols-2">
      {#each filteredFoci() as focus (focus.id)}
        {@const selected = isSelected(focus.id)}
        {@const level = getSelectedLevel(focus.id)}
        {@const isExpanded = expandedId === focus.id}

        <div
          class="card p-4 transition-all {selected ? 'border-cyan-500 border-glow-blue' : ''}"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-display tracking-wider text-white">{focus.name}</h4>
                <span class="px-2 py-0.5 text-xs rounded-full border {getFocusTypeColor(focus.type)}">
                  {focus.type}
                </span>
              </div>
              <p class="text-xs text-slate-400">{focus.description}</p>
            </div>

            <button
              onclick={() => toggleFocus(focus)}
              class="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                {selected ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
            >
              {selected ? '✓' : '+'}
            </button>
          </div>

          <!-- Expand/Collapse -->
          <button
            onclick={() => expandedId = isExpanded ? null : focus.id}
            class="text-xs text-cyan-400 hover:underline"
          >
            {isExpanded ? 'Hide abilities' : 'Show abilities'}
          </button>

          {#if isExpanded}
            <div class="mt-3 pt-3 border-t border-slate-700 space-y-3">
              <!-- Level 1 -->
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-display text-cyan-400">Level 1</span>
                  {#if focus.level1.bonusSkill}
                    <span class="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                      +{focus.level1.bonusSkill}
                    </span>
                  {:else if focus.level1.bonusSkillChoices}
                    <span class="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
                      +{focus.level1.bonusSkillChoices.map(id => getSkillById(id)?.name || id).join(' or ')}
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-slate-400">{focus.level1.description}</p>
              </div>

              <!-- Level 2 -->
              {#if focus.level2}
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-display text-purple-400">Level 2</span>
                  </div>
                  <p class="text-xs text-slate-400">{focus.level2.description}</p>
                </div>
              {/if}

              <!-- Upgrade Button -->
              {#if selected && level === 1 && focus.level2 && characterStore.draft.selectedFoci.length < maxFoci()}
                <button
                  onclick={() => upgradeFocus(focus.id)}
                  class="btn btn-secondary text-xs w-full"
                >
                  Upgrade to Level 2
                </button>
              {/if}
            </div>
          {/if}

          <!-- Level Indicator + Bonus Skill Choice -->
          {#if selected}
            <div class="mt-3 flex gap-2">
              <span class="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400">
                Level {level}
              </span>
            </div>
            {@const focusData = getFocusById(focus.id)}
            {#if focusData?.level1.bonusSkillChoices}
              <div class="mt-2">
                {#if focusSkillChoices[focus.id]}
                  <span class="text-xs text-green-400">
                    Bonus skill: {getSkillById(focusSkillChoices[focus.id])?.name || focusSkillChoices[focus.id]}
                  </span>
                {:else}
                  <p class="text-xs text-slate-400 mb-1">Choose bonus skill:</p>
                  <select
                    class="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded"
                    onchange={(e) => {
                      const val = (e.target as HTMLSelectElement).value;
                      if (val) selectFocusBonusSkill(focus.id, val);
                    }}
                  >
                    <option value="">-- Select --</option>
                    {#each focusData.level1.bonusSkillChoices as skillId}
                      <option value={skillId}>{getSkillById(skillId)?.name || skillId}</option>
                    {/each}
                  </select>
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
