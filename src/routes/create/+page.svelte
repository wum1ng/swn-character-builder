<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { characterStore } from '$stores/character.svelte';
  import AttributesStep from '$lib/components/steps/AttributesStep.svelte';
  import BackgroundStep from '$lib/components/steps/BackgroundStep.svelte';
  import ClassStep from '$lib/components/steps/ClassStep.svelte';
  import FociStep from '$lib/components/steps/FociStep.svelte';
  import SkillsStep from '$lib/components/steps/SkillsStep.svelte';
  import HitPointsStep from '$lib/components/steps/HitPointsStep.svelte';
  import EquipmentStep from '$lib/components/steps/EquipmentStep.svelte';
  import DetailsStep from '$lib/components/steps/DetailsStep.svelte';
  import SummaryStep from '$lib/components/steps/SummaryStep.svelte';

  const stepLabels: Record<string, string> = {
    attributes: 'Attributes',
    background: 'Background',
    class: 'Class',
    foci: 'Foci',
    skills: 'Skills',
    psychic: 'Psychic',
    hitpoints: 'Hit Points',
    equipment: 'Equipment',
    details: 'Details',
    summary: 'Summary'
  };

  onMount(() => {
    const isRandom = $page.url.searchParams.get('random') === 'true';
    if (isRandom) {
      characterStore.generateRandomCharacter();
    } else {
      characterStore.reset();
    }
  });
  
  function getStepComponent(step: string) {
    switch (step) {
      case 'attributes': return AttributesStep;
      case 'background': return BackgroundStep;
      case 'class': return ClassStep;
      case 'foci': return FociStep;
      case 'skills': return SkillsStep;
      case 'hitpoints': return HitPointsStep;
      case 'details': return DetailsStep;
      case 'summary': return SummaryStep;
      default: return null;
    }
  }
  
  async function handleComplete() {
    try {
      const character = characterStore.buildCharacter();
      await characterStore.saveCharacter(character);
      if (characterStore.error) {
        alert('Failed to save: ' + characterStore.error);
        return;
      }
      goto(`${base}/`);
    } catch (e) {
      alert('Error saving character: ' + (e instanceof Error ? e.message : String(e)));
    }
  }
  
  $effect(() => {
    // Update page title based on current step
    document.title = `${stepLabels[characterStore.draft.currentStep]} - SWN Character Builder`;
  });
</script>

<svelte:head>
  <title>{stepLabels[characterStore.draft.currentStep]} - SWN Character Builder</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  <!-- Progress Header -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-display text-xl sm:text-2xl tracking-wider">
        {stepLabels[characterStore.draft.currentStep]}
      </h1>
      <span class="text-sm text-slate-400">
        Step {characterStore.currentStepIndex + 1} of {characterStore.steps.length}
      </span>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div 
        class="progress-bar-fill" 
        style="width: {((characterStore.currentStepIndex + 1) / characterStore.steps.length) * 100}%"
      ></div>
    </div>
    
    <!-- Step Indicators (desktop) -->
    <div class="hidden lg:flex items-center justify-between mt-4 text-xs">
      {#each characterStore.steps as step, i}
        {@const isActive = characterStore.draft.currentStep === step}
        {@const isPast = i < characterStore.currentStepIndex}
        {@const isSkipped = step === 'psychic' && 
          characterStore.draft.classId !== 'psychic' && 
          !characterStore.draft.partialClasses?.includes('partial-psychic')}
        
        {#if !isSkipped}
          <button
            onclick={() => isPast && characterStore.goToStep(step)}
            class="flex flex-col items-center gap-1 transition-colors {isPast ? 'cursor-pointer hover:text-cyan-400' : 'cursor-default'}"
            disabled={!isPast}
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display
              {isActive ? 'bg-cyan-500 text-slate-900' : isPast ? 'bg-cyan-500/30 text-cyan-400' : 'bg-slate-700 text-slate-500'}">
              {i + 1}
            </div>
            <span class="{isActive ? 'text-cyan-400' : isPast ? 'text-slate-400' : 'text-slate-600'}">
              {stepLabels[step]}
            </span>
          </button>
        {/if}
      {/each}
    </div>
  </div>
  
  <!-- Step Content -->
  <div class="card p-6 sm:p-8 mb-8">
    {#if characterStore.draft.currentStep === 'attributes'}
      <AttributesStep />
    {:else if characterStore.draft.currentStep === 'background'}
      <BackgroundStep />
    {:else if characterStore.draft.currentStep === 'class'}
      <ClassStep />
    {:else if characterStore.draft.currentStep === 'foci'}
      <FociStep />
    {:else if characterStore.draft.currentStep === 'skills'}
      <SkillsStep />
    {:else if characterStore.draft.currentStep === 'hitpoints'}
      <HitPointsStep />
    {:else if characterStore.draft.currentStep === 'equipment'}
      <EquipmentStep />
    {:else if characterStore.draft.currentStep === 'details'}
      <DetailsStep />
    {:else if characterStore.draft.currentStep === 'summary'}
      <SummaryStep oncomplete={handleComplete} />
    {/if}
  </div>
  
  <!-- Navigation Buttons -->
  <div class="flex items-center justify-between gap-4">
    <button
      onclick={() => characterStore.prevStep()}
      disabled={!characterStore.canGoBack}
      class="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
    
    <div class="flex items-center gap-2">
      <button onclick={() => characterStore.reset()} class="btn btn-ghost text-red-400">
        Reset
      </button>
      
      {#if characterStore.draft.currentStep !== 'summary'}
        <button
          onclick={() => characterStore.nextStep()}
          disabled={!characterStore.canGoForward}
          class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>
