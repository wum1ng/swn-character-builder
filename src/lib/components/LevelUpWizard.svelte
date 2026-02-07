<script lang="ts">
  import type { Character, LevelUpRecord } from '$types/character';
  import { characterStore } from '$stores/character.svelte';
  import { getAttributeModifier, formatModifier } from '$data/attributes';
  import { getClassById, getAttackBonus } from '$data/classes';
  import { getSkillById, SKILLS, COMBAT_SKILLS, NON_COMBAT_SKILLS, PSYCHIC_SKILLS } from '$data/skills';
  import { FOCI, COMBAT_FOCI, NON_COMBAT_FOCI, getFocusById } from '$data/foci';
  import { PSYCHIC_DISCIPLINES, getDisciplineById, getTechniqueById } from '$data/psychic';
  import type { PsychicTechnique } from '$types/character';

  interface Props {
    character: Character;
    onComplete: (updated: Character) => void;
    onCancel: () => void;
  }

  let { character, onComplete, onCancel }: Props = $props();

  type LevelUpStep = 'overview' | 'hp' | 'skills' | 'focus' | 'technique' | 'summary';

  const newLevel = character.level + 1;
  const charClass = getClassById(character.classId);

  const isPsychic = $derived(
    character.classId === 'psychic' ||
    character.partialClasses?.includes('partial-psychic') ||
    false
  );

  const isEvenLevel = newLevel % 2 === 0;
  const bonusFocusType = characterStore.getBonusFocusType(character);
  const skillPoints = characterStore.getSkillPointsPerLevel(character);
  const maxSkillRank = characterStore.getMaxSkillRank(newLevel);

  // Steps to show
  const steps = $derived.by(() => {
    const s: LevelUpStep[] = ['overview', 'hp', 'skills'];
    if (isEvenLevel) s.push('focus');
    if (isPsychic) s.push('technique');
    s.push('summary');
    return s;
  });

  let currentStep = $state<LevelUpStep>('overview');
  const currentStepIndex = $derived(steps.indexOf(currentStep));

  // HP state
  let hpRolls = $state<number[] | null>(null);
  let hpTotal = $state<number | null>(null);
  let hpGained = $state<number | null>(null);
  let isRolling = $state(false);

  // Skill state
  let normalPointsSpent = $state(0);
  let bonusPointSpent = $state(false);
  let skillChanges = $state<Map<string, { fromRank: number; toRank: number }>>(new Map());

  // Focus state
  let selectedFocus = $state<{ focusId: string; level: 1 | 2 } | null>(null);
  let selectedBonusFocus = $state<{ focusId: string; level: 1 | 2 } | null>(null);

  // Technique state
  let selectedTechnique = $state<string | null>(null);

  // Derived: points remaining
  const normalPointsRemaining = $derived(skillPoints.normal - normalPointsSpent);
  const bonusPointRemaining = $derived(skillPoints.bonusNonCombat - (bonusPointSpent ? 1 : 0));

  // Get current skill rank (including pending changes)
  function getCurrentRank(skillId: string): number {
    const change = skillChanges.get(skillId);
    if (change) return change.toRank;
    const existing = character.skills.find(s => s.skillId === skillId);
    return existing?.rank ?? -1;
  }

  function getBaseRank(skillId: string): number {
    const existing = character.skills.find(s => s.skillId === skillId);
    return existing?.rank ?? -1;
  }

  function canRaiseSkill(skillId: string): boolean {
    const currentRank = getCurrentRank(skillId);
    const baseRank = getBaseRank(skillId);

    // Can't raise above max rank for this level
    if (currentRank >= maxSkillRank) return false;

    // Can't raise more than 1 rank per level-up
    if (currentRank > baseRank) return false;

    // Need points available
    const isCombat = COMBAT_SKILLS.includes(skillId);
    const isPsychicSkill = PSYCHIC_SKILLS.includes(skillId);
    const isNonCombat = !isCombat && !isPsychicSkill;

    // Psychic skills require having the discipline
    if (isPsychicSkill && !character.psychicDisciplines?.includes(skillId)) {
      return false;
    }

    // Check if bonus point can be used (non-combat, non-psychic only)
    if (isNonCombat && bonusPointRemaining > 0) return true;
    if (normalPointsRemaining > 0) return true;

    return false;
  }

  function raiseSkill(skillId: string) {
    if (!canRaiseSkill(skillId)) return;

    const currentRank = getCurrentRank(skillId);
    const baseRank = getBaseRank(skillId);
    const newRank = currentRank + 1;

    const isCombat = COMBAT_SKILLS.includes(skillId);
    const isPsychicSkill = PSYCHIC_SKILLS.includes(skillId);
    const isNonCombat = !isCombat && !isPsychicSkill;

    // Spend bonus point first if applicable
    if (isNonCombat && bonusPointRemaining > 0 && !bonusPointSpent) {
      bonusPointSpent = true;
    } else {
      normalPointsSpent++;
    }

    const newMap = new Map(skillChanges);
    newMap.set(skillId, { fromRank: baseRank, toRank: newRank });
    skillChanges = newMap;
  }

  function undoSkillRaise(skillId: string) {
    const change = skillChanges.get(skillId);
    if (!change) return;

    const isCombat = COMBAT_SKILLS.includes(skillId);
    const isPsychicSkill = PSYCHIC_SKILLS.includes(skillId);
    const isNonCombat = !isCombat && !isPsychicSkill;

    // Refund the point
    if (isNonCombat && bonusPointSpent && normalPointsRemaining === skillPoints.normal) {
      bonusPointSpent = false;
    } else {
      normalPointsSpent = Math.max(0, normalPointsSpent - 1);
    }

    const newMap = new Map(skillChanges);
    newMap.delete(skillId);
    skillChanges = newMap;
  }

  // Focus helpers
  function getAvailableFoci(type?: 'combat' | 'non-combat'): typeof FOCI {
    let pool = type === 'combat' ? COMBAT_FOCI :
               type === 'non-combat' ? NON_COMBAT_FOCI :
               FOCI.filter(f => f.type !== 'psychic' && f.type !== 'origin');

    return pool.filter(f => {
      const existing = character.foci.find(cf => cf.focusId === f.id);
      // Can pick new focus at level 1, or upgrade existing level 1 to level 2
      if (!existing) return f.level2 !== undefined || true; // new at level 1
      if (existing.level === 1 && f.level2) return true; // upgrade to level 2
      return false;
    });
  }

  function getFocusAction(focusId: string): 1 | 2 {
    const existing = character.foci.find(f => f.focusId === focusId);
    return existing?.level === 1 ? 2 : 1;
  }

  function selectFocus(focusId: string, isBonus: boolean) {
    const level = getFocusAction(focusId);
    if (isBonus) {
      selectedBonusFocus = { focusId, level };
    } else {
      selectedFocus = { focusId, level };
    }
  }

  // Technique helpers
  function getAvailableTechniques(): PsychicTechnique[] {
    if (!character.psychicDisciplines?.length) return [];
    const techniques: PsychicTechnique[] = [];

    for (const discId of character.psychicDisciplines) {
      const disc = getDisciplineById(discId);
      if (!disc) continue;

      // Find skill level in this discipline
      const skillRank = getCurrentRank(disc.skill);

      // Get techniques at or below skill level
      for (const tech of disc.techniques) {
        if (tech.level > skillRank) continue;
        // Skip if already known
        if (character.psychicTechniques?.includes(tech.id)) continue;
        techniques.push(tech);
      }
    }

    return techniques;
  }

  // Rolling HP
  function rollHP() {
    isRolling = true;
    const result = characterStore.rollLevelUpHP(character);
    setTimeout(() => {
      hpRolls = result.rolls;
      hpTotal = result.total;
      hpGained = result.gained;
      isRolling = false;
    }, 500);
  }

  // Navigation
  function nextStep() {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      currentStep = steps[idx + 1];
    }
  }

  function prevStep() {
    const idx = currentStepIndex;
    if (idx > 0) {
      currentStep = steps[idx - 1];
    }
  }

  function canAdvance(): boolean {
    switch (currentStep) {
      case 'overview': return true;
      case 'hp': return hpGained !== null;
      case 'skills': return true; // skill points are optional to spend
      case 'focus': return true; // focus is optional
      case 'technique': return true; // technique is optional
      default: return true;
    }
  }

  // Complete level-up
  async function completeLevelUp() {
    const updated: Character = JSON.parse(JSON.stringify(character));

    // Increment level
    updated.level = newLevel;

    // Deduct XP
    updated.experience = updated.experience - (character.level * 3);

    // Add HP
    updated.hitPointsMax += hpGained!;
    updated.hitPointsCurrent += hpGained!;

    // Apply skill changes
    for (const [skillId, change] of skillChanges) {
      const existing = updated.skills.find(s => s.skillId === skillId);
      if (existing) {
        existing.rank = change.toRank;
      } else {
        updated.skills.push({ skillId, rank: change.toRank });
      }
    }

    // Apply focus
    if (selectedFocus) {
      const existing = updated.foci.find(f => f.focusId === selectedFocus!.focusId);
      if (existing) {
        existing.level = selectedFocus.level;
      } else {
        updated.foci.push({ focusId: selectedFocus.focusId, level: selectedFocus.level });
        // Apply bonus skill for new level-1 focus
        if (selectedFocus.level === 1) {
          const focusData = getFocusById(selectedFocus.focusId);
          if (focusData?.level1.bonusSkill && !focusData.level1.bonusSkillChoices) {
            const existing = updated.skills.find(s => s.skillId === focusData.level1.bonusSkill);
            if (existing) {
              existing.rank = Math.min(existing.rank + 1, maxSkillRank);
            } else {
              updated.skills.push({ skillId: focusData.level1.bonusSkill, rank: 0 });
            }
          }
        }
      }
    }

    // Apply bonus focus
    if (selectedBonusFocus) {
      const existing = updated.foci.find(f => f.focusId === selectedBonusFocus!.focusId);
      if (existing) {
        existing.level = selectedBonusFocus.level;
      } else {
        updated.foci.push({ focusId: selectedBonusFocus.focusId, level: selectedBonusFocus.level });
        if (selectedBonusFocus.level === 1) {
          const focusData = getFocusById(selectedBonusFocus.focusId);
          if (focusData?.level1.bonusSkill && !focusData.level1.bonusSkillChoices) {
            const existing = updated.skills.find(s => s.skillId === focusData.level1.bonusSkill);
            if (existing) {
              existing.rank = Math.min(existing.rank + 1, maxSkillRank);
            } else {
              updated.skills.push({ skillId: focusData.level1.bonusSkill, rank: 0 });
            }
          }
        }
      }
    }

    // Apply technique
    if (selectedTechnique) {
      if (!updated.psychicTechniques) updated.psychicTechniques = [];
      updated.psychicTechniques.push(selectedTechnique);
    }

    // Record level-up history
    const record: LevelUpRecord = {
      fromLevel: character.level,
      toLevel: newLevel,
      hpRoll: hpRolls!.reduce((s, r) => s + r, 0),
      hpGained: hpGained!,
      skillPointsSpent: Array.from(skillChanges.entries()).map(([skillId, c]) => ({
        skillId,
        fromRank: c.fromRank,
        toRank: c.toRank
      })),
      focusGained: selectedFocus ?? undefined,
      bonusFocusGained: selectedBonusFocus ?? undefined,
      techniqueGained: selectedTechnique ?? undefined,
      timestamp: new Date().toISOString()
    };
    updated.levelUpHistory.push(record);

    // Recalculate derived stats
    characterStore.recalculateDerivedStats(updated);
    updated.updatedAt = new Date().toISOString();

    // Save
    await characterStore.saveCharacter(updated);
    onComplete(updated);
  }

  // New saving throws preview
  const newSaves = $derived.by(() => {
    const strMod = getAttributeModifier(character.attributes.strength);
    const dexMod = getAttributeModifier(character.attributes.dexterity);
    const conMod = getAttributeModifier(character.attributes.constitution);
    const intMod = getAttributeModifier(character.attributes.intelligence);
    const wisMod = getAttributeModifier(character.attributes.wisdom);
    const chaMod = getAttributeModifier(character.attributes.charisma);
    return {
      physical: 15 - newLevel - Math.max(strMod, conMod),
      evasion: 15 - newLevel - Math.max(intMod, dexMod),
      mental: 15 - newLevel - Math.max(wisMod, chaMod)
    };
  });

  const newAttackBonus = $derived(
    getAttackBonus(character.classId, newLevel, character.partialClasses as string[] | undefined)
  );
</script>

<div class="max-w-2xl mx-auto">
  <!-- Header -->
  <div class="card p-6 mb-6 text-center">
    <h2 class="font-display text-2xl tracking-wider text-cyan-400 mb-2">Level Up</h2>
    <p class="text-slate-400">
      {character.name} &mdash; Level {character.level} &rarr; Level {newLevel}
    </p>
    <!-- Progress -->
    <div class="flex items-center gap-1 mt-4 max-w-sm mx-auto">
      {#each steps as step, i}
        <div class="flex-1 h-1.5 rounded-full {i <= currentStepIndex ? 'bg-cyan-400' : 'bg-slate-700'}"></div>
      {/each}
    </div>
  </div>

  <!-- Step Content -->
  {#if currentStep === 'overview'}
    <div class="card p-6 space-y-4">
      <h3 class="font-display text-lg tracking-wider text-white">Advancing to Level {newLevel}</h3>
      <div class="space-y-3 text-sm">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div class="text-2xl">&#x2764;</div>
          <div>
            <div class="text-white">Hit Points</div>
            <div class="text-slate-400">Roll {newLevel}d6 + modifiers for all {newLevel} levels, keep if higher than current {character.hitPointsMax} HP (otherwise +1)</div>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div class="text-2xl">&#x2B50;</div>
          <div>
            <div class="text-white">Skill Points</div>
            <div class="text-slate-400">
              {skillPoints.normal} skill points to spend
              {#if skillPoints.bonusNonCombat > 0}
                + {skillPoints.bonusNonCombat} bonus (non-combat only)
              {/if}
            </div>
          </div>
        </div>
        {#if isEvenLevel}
          <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div class="text-2xl">&#x1F3AF;</div>
            <div>
              <div class="text-white">New Focus</div>
              <div class="text-slate-400">
                Pick a new focus or upgrade an existing one
                {#if bonusFocusType}
                  + bonus {bonusFocusType} focus ({charClass?.name})
                {/if}
              </div>
            </div>
          </div>
        {/if}
        {#if isPsychic}
          <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div class="text-2xl">&#x1F52E;</div>
            <div>
              <div class="text-white">Psychic Technique</div>
              <div class="text-slate-400">Learn one new technique from a known discipline</div>
            </div>
          </div>
        {/if}
        <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div class="text-2xl">&#x1F6E1;</div>
          <div>
            <div class="text-white">Improved Stats</div>
            <div class="text-slate-400">
              Attack Bonus: +{character.attackBonus} &rarr; +{newAttackBonus}
              &bull; Saves improve
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStep === 'hp'}
    <div class="card p-6 space-y-4">
      <h3 class="font-display text-lg tracking-wider text-white">Roll Hit Points</h3>
      <p class="text-sm text-slate-400">
        Roll {newLevel}d6 for all {newLevel} levels, plus per-level modifiers.
        If the total beats your current {character.hitPointsMax} HP, use the new total. Otherwise, HP goes up by 1.
      </p>

      {#if hpGained === null}
        <div class="text-center py-6">
          <button onclick={rollHP} disabled={isRolling} class="btn btn-primary text-lg px-8 py-4">
            {#if isRolling}
              <span class="dice-rolling inline-block">&#x1F3B2;</span> Rolling...
            {:else}
              &#x1F3B2; Roll {newLevel}d6
            {/if}
          </button>
        </div>
      {:else}
        <div class="text-center py-4 space-y-3">
          <div class="text-6xl font-display text-cyan-400 dice-rolling">
            +{hpGained}
          </div>
          <div class="flex flex-wrap justify-center gap-2 mb-2">
            {#each hpRolls! as roll}
              <span class="w-8 h-8 flex items-center justify-center rounded bg-slate-700 text-white font-display text-sm">{roll}</span>
            {/each}
          </div>
          <div class="text-sm text-slate-400">
            Dice: {hpRolls!.join(' + ')} = {hpRolls!.reduce((s, r) => s + r, 0)}
          </div>
          <div class="text-xs text-slate-500">
            Per-level bonus: {formatModifier(getAttributeModifier(character.attributes.constitution))} CON
            {#if character.classId === 'warrior'}+ 2 Warrior{/if}
            {#if character.classId === 'adventurer' && character.partialClasses?.includes('partial-warrior')}+ 1 Partial Warrior{/if}
            {#if character.foci.some(f => f.focusId === 'die-hard')}+ 2 Die Hard{/if}
            &times; {newLevel} levels
          </div>
          <div class="text-sm text-slate-300">
            Total rolled: <span class="text-white font-display">{hpTotal}</span>
            vs current max: <span class="text-white font-display">{character.hitPointsMax}</span>
            &rarr;
            {#if hpTotal! > character.hitPointsMax}
              <span class="text-green-400">Higher! New max HP = {hpTotal}</span>
            {:else}
              <span class="text-yellow-400">Not higher, +1 HP</span>
            {/if}
          </div>
          <div class="text-white">
            HP: {character.hitPointsMax} &rarr; <span class="text-green-400 font-display">{character.hitPointsMax + hpGained}</span>
          </div>
          <button onclick={() => { hpRolls = null; hpTotal = null; hpGained = null; }} class="btn btn-ghost text-xs">
            Reroll
          </button>
        </div>
      {/if}
    </div>

  {:else if currentStep === 'skills'}
    <div class="card p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-lg tracking-wider text-white">Spend Skill Points</h3>
        <div class="text-right">
          <div class="text-sm font-display">
            <span class="text-cyan-400">{normalPointsRemaining}</span>
            <span class="text-slate-500"> pts</span>
            {#if skillPoints.bonusNonCombat > 0}
              <span class="text-slate-600"> + </span>
              <span class="text-purple-400">{bonusPointRemaining}</span>
              <span class="text-slate-500"> bonus</span>
            {/if}
          </div>
        </div>
      </div>

      {#if skillPoints.bonusNonCombat > 0}
        <p class="text-xs text-purple-400">
          Expert bonus point must be spent on a non-combat, non-psychic skill.
        </p>
      {/if}

      <p class="text-xs text-slate-500">
        Max skill rank at level {newLevel}: {maxSkillRank}. One rank increase per skill per level.
      </p>

      <div class="space-y-1 max-h-[400px] overflow-y-auto">
        <!-- Non-combat skills -->
        <div class="text-xs text-slate-500 font-display tracking-wider mt-2 mb-1">Non-Combat Skills</div>
        {#each SKILLS.filter(s => NON_COMBAT_SKILLS.includes(s.id)) as skill}
          {@const base = getBaseRank(skill.id)}
          {@const current = getCurrentRank(skill.id)}
          {@const changed = skillChanges.has(skill.id)}
          <div class="flex items-center justify-between p-2 rounded {changed ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/50'}">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-slate-200">{skill.name}</span>
              <span class="text-xs text-slate-500">{current >= 0 ? current : '-'}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              {#if changed}
                <span class="text-xs text-green-400">{base >= 0 ? base : '-'} &rarr; {current}</span>
                <button onclick={() => undoSkillRaise(skill.id)}
                  class="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Undo</button>
              {:else if canRaiseSkill(skill.id)}
                <button onclick={() => raiseSkill(skill.id)}
                  class="px-2 py-0.5 text-xs rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">+1</button>
              {:else}
                <span class="text-xs text-slate-600">
                  {current >= maxSkillRank ? 'Max' : current > base ? 'Done' : ''}
                </span>
              {/if}
            </div>
          </div>
        {/each}

        <!-- Combat skills -->
        <div class="text-xs text-slate-500 font-display tracking-wider mt-3 mb-1">Combat Skills</div>
        {#each SKILLS.filter(s => COMBAT_SKILLS.includes(s.id)) as skill}
          {@const base = getBaseRank(skill.id)}
          {@const current = getCurrentRank(skill.id)}
          {@const changed = skillChanges.has(skill.id)}
          <div class="flex items-center justify-between p-2 rounded {changed ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/50'}">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-sm text-red-300">{skill.name}</span>
              <span class="text-xs text-slate-500">{current >= 0 ? current : '-'}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              {#if changed}
                <span class="text-xs text-green-400">{base >= 0 ? base : '-'} &rarr; {current}</span>
                <button onclick={() => undoSkillRaise(skill.id)}
                  class="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Undo</button>
              {:else if canRaiseSkill(skill.id)}
                <button onclick={() => raiseSkill(skill.id)}
                  class="px-2 py-0.5 text-xs rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">+1</button>
              {:else}
                <span class="text-xs text-slate-600">
                  {current >= maxSkillRank ? 'Max' : current > base ? 'Done' : ''}
                </span>
              {/if}
            </div>
          </div>
        {/each}

        <!-- Psychic skills (if applicable) -->
        {#if isPsychic}
          <div class="text-xs text-slate-500 font-display tracking-wider mt-3 mb-1">Psychic Skills</div>
          {#each SKILLS.filter(s => PSYCHIC_SKILLS.includes(s.id)) as skill}
            {@const base = getBaseRank(skill.id)}
            {@const current = getCurrentRank(skill.id)}
            {@const changed = skillChanges.has(skill.id)}
            {@const hasDiscipline = character.psychicDisciplines?.includes(skill.id)}
            {#if hasDiscipline || base >= 0}
              <div class="flex items-center justify-between p-2 rounded {changed ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-slate-800/50'}">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm text-purple-300">{skill.name}</span>
                  <span class="text-xs text-slate-500">{current >= 0 ? current : '-'}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  {#if changed}
                    <span class="text-xs text-green-400">{base >= 0 ? base : '-'} &rarr; {current}</span>
                    <button onclick={() => undoSkillRaise(skill.id)}
                      class="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Undo</button>
                  {:else if canRaiseSkill(skill.id)}
                    <button onclick={() => raiseSkill(skill.id)}
                      class="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">+1</button>
                  {:else}
                    <span class="text-xs text-slate-600">
                      {!hasDiscipline ? 'No discipline' : current >= maxSkillRank ? 'Max' : current > base ? 'Done' : ''}
                    </span>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    </div>

  {:else if currentStep === 'focus'}
    <div class="card p-6 space-y-4">
      <h3 class="font-display text-lg tracking-wider text-white">Choose Focus</h3>
      <p class="text-sm text-slate-400">
        Pick a new focus at level 1, or upgrade an existing level-1 focus to level 2.
      </p>

      <!-- Normal focus pick -->
      <div>
        <div class="text-xs text-slate-500 font-display tracking-wider mb-2">Your Focus Pick</div>
        <div class="space-y-1 max-h-[250px] overflow-y-auto">
          {#each getAvailableFoci() as focus}
            {@const action = getFocusAction(focus.id)}
            {@const isSelected = selectedFocus?.focusId === focus.id}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              onclick={() => selectedFocus = isSelected ? null : { focusId: focus.id, level: action }}
              class="p-3 rounded-lg cursor-pointer transition-colors {isSelected ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-800/50 hover:bg-slate-800/80'}"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-white">{focus.name}</span>
                  <span class="text-xs px-1.5 py-0.5 rounded {focus.type === 'combat' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}">{focus.type}</span>
                </div>
                <span class="text-xs text-slate-400">
                  {action === 1 ? 'New (Lvl 1)' : 'Upgrade to Lvl 2'}
                </span>
              </div>
              {#if isSelected}
                <p class="text-xs text-slate-400 mt-2">
                  {action === 1 ? focus.level1.description : focus.level2?.description}
                </p>
              {/if}
            </div>
          {/each}
        </div>
        {#if !selectedFocus}
          <p class="text-xs text-slate-600 mt-1 italic">Optional &mdash; you can skip this</p>
        {/if}
      </div>

      <!-- Bonus focus (Warriors/Experts only) -->
      {#if bonusFocusType}
        <div class="mt-4 pt-4 border-t border-slate-700">
          <div class="text-xs text-purple-400 font-display tracking-wider mb-2">
            Bonus {bonusFocusType === 'combat' ? 'Combat' : 'Non-Combat'} Focus ({charClass?.name})
          </div>
          <div class="space-y-1 max-h-[200px] overflow-y-auto">
            {#each getAvailableFoci(bonusFocusType) as focus}
              {@const action = getFocusAction(focus.id)}
              {@const isSelected = selectedBonusFocus?.focusId === focus.id}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                onclick={() => selectedBonusFocus = isSelected ? null : { focusId: focus.id, level: action }}
                class="p-3 rounded-lg cursor-pointer transition-colors {isSelected ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-800/50 hover:bg-slate-800/80'}"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-white">{focus.name}</span>
                  <span class="text-xs text-slate-400">
                    {action === 1 ? 'New (Lvl 1)' : 'Upgrade to Lvl 2'}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

  {:else if currentStep === 'technique'}
    <div class="card p-6 space-y-4">
      <h3 class="font-display text-lg tracking-wider text-white">Learn Technique</h3>
      <p class="text-sm text-slate-400">
        Learn one new technique from a known discipline (at or below your skill level).
      </p>

      {#if getAvailableTechniques().length === 0}
        <p class="text-sm text-slate-500 italic">No techniques available at your current skill levels.</p>
      {:else}
        <div class="space-y-1 max-h-[350px] overflow-y-auto">
          {#each getAvailableTechniques() as tech}
            {@const isSelected = selectedTechnique === tech.id}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              onclick={() => selectedTechnique = isSelected ? null : tech.id}
              class="p-3 rounded-lg cursor-pointer transition-colors {isSelected ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-800/50 hover:bg-slate-800/80'}"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-white">{tech.name}</span>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-purple-400">Level {tech.level}</span>
                  <span class="text-slate-500">{tech.cost}</span>
                </div>
              </div>
              {#if isSelected}
                <p class="text-xs text-slate-400">{tech.description}</p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      {#if !selectedTechnique}
        <p class="text-xs text-slate-600 italic">Optional &mdash; you can skip this</p>
      {/if}
    </div>

  {:else if currentStep === 'summary'}
    <div class="card p-6 space-y-4">
      <h3 class="font-display text-lg tracking-wider text-white">Level Up Summary</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span class="text-slate-400">Level</span>
          <span class="text-white font-display">{character.level} &rarr; <span class="text-cyan-400">{newLevel}</span></span>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span class="text-slate-400">Hit Points</span>
          <span class="text-white font-display">{character.hitPointsMax} &rarr; <span class="text-green-400">{character.hitPointsMax + (hpGained ?? 0)}</span> (+{hpGained})</span>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span class="text-slate-400">Attack Bonus</span>
          <span class="text-white font-display">+{character.attackBonus} &rarr; <span class="text-cyan-400">+{newAttackBonus}</span></span>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span class="text-slate-400">Saves</span>
          <span class="text-xs text-white font-display">
            Phys {character.savingThrows.physical}+ &rarr; <span class="text-green-400">{newSaves.physical}+</span>
            &bull; Eva {character.savingThrows.evasion}+ &rarr; <span class="text-green-400">{newSaves.evasion}+</span>
            &bull; Ment {character.savingThrows.mental}+ &rarr; <span class="text-green-400">{newSaves.mental}+</span>
          </span>
        </div>

        {#if skillChanges.size > 0}
          <div class="p-3 rounded-lg bg-slate-800/50">
            <div class="text-slate-400 mb-2">Skills Raised</div>
            <div class="flex flex-wrap gap-2">
              {#each Array.from(skillChanges.entries()) as [skillId, change]}
                {@const skill = getSkillById(skillId)}
                <span class="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300">
                  {skill?.name || skillId}: {change.fromRank >= 0 ? change.fromRank : '-'} &rarr; {change.toRank}
                </span>
              {/each}
            </div>
          </div>
        {/if}

        {#if selectedFocus}
          <div class="p-3 rounded-lg bg-slate-800/50">
            <div class="text-slate-400 mb-1">Focus</div>
            <span class="text-white">{getFocusById(selectedFocus.focusId)?.name}</span>
            <span class="text-xs text-purple-400 ml-1">Lvl {selectedFocus.level}</span>
          </div>
        {/if}

        {#if selectedBonusFocus}
          <div class="p-3 rounded-lg bg-slate-800/50">
            <div class="text-slate-400 mb-1">Bonus Focus ({charClass?.name})</div>
            <span class="text-white">{getFocusById(selectedBonusFocus.focusId)?.name}</span>
            <span class="text-xs text-purple-400 ml-1">Lvl {selectedBonusFocus.level}</span>
          </div>
        {/if}

        {#if selectedTechnique}
          {@const tech = getTechniqueById(selectedTechnique)}
          <div class="p-3 rounded-lg bg-slate-800/50">
            <div class="text-slate-400 mb-1">New Technique</div>
            <span class="text-white">{tech?.name}</span>
            <span class="text-xs text-purple-400 ml-1">Level {tech?.level}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <div class="flex items-center justify-between mt-6">
    {#if currentStep === 'overview'}
      <button onclick={onCancel} class="btn btn-ghost">Cancel</button>
    {:else}
      <button onclick={prevStep} class="btn btn-ghost">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    {/if}

    {#if currentStep === 'summary'}
      <button onclick={completeLevelUp} class="btn btn-primary">
        Confirm Level Up
      </button>
    {:else}
      <button onclick={nextStep} disabled={!canAdvance()} class="btn btn-primary disabled:opacity-40">
        Next
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}
  </div>
</div>
