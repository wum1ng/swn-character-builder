<script lang="ts">
  import { characterStore } from '$stores/character.svelte';
</script>

<div class="space-y-6">
  <div>
    <h3 class="font-display text-lg tracking-wider mb-4">Character Details</h3>
    <p class="text-sm text-slate-400">
      Give your character a name and flesh out their background story.
    </p>
  </div>
  
  <div class="grid gap-6 sm:grid-cols-2">
    <!-- Name (Required) -->
    <div class="sm:col-span-2">
      <label for="name" class="block text-sm font-display tracking-wider text-cyan-400 mb-2">
        Name <span class="text-red-400">*</span>
      </label>
      <input
        type="text"
        id="name"
        bind:value={characterStore.draft.name}
        placeholder="Enter character name"
        class="input text-lg"
        required
      />
    </div>
    
    <!-- Homeworld -->
    <div>
      <label for="homeworld" class="block text-sm font-display tracking-wider text-slate-400 mb-2">
        Homeworld
      </label>
      <input
        type="text"
        id="homeworld"
        bind:value={characterStore.draft.homeworld}
        placeholder="e.g., Anderia Prime"
        class="input"
      />
    </div>
    
    <!-- Species -->
    <div>
      <label for="species" class="block text-sm font-display tracking-wider text-slate-400 mb-2">
        Species
      </label>
      <input
        type="text"
        id="species"
        bind:value={characterStore.draft.species}
        placeholder="e.g., Human"
        class="input"
      />
    </div>
    
    <!-- Employer -->
    <div class="sm:col-span-2">
      <label for="employer" class="block text-sm font-display tracking-wider text-slate-400 mb-2">
        Employer / Affiliation
      </label>
      <input
        type="text"
        id="employer"
        bind:value={characterStore.draft.employer}
        placeholder="e.g., Free Trader, Corporate Security, Independent"
        class="input"
      />
    </div>
    
    <!-- Goals -->
    <div class="sm:col-span-2">
      <label for="goals" class="block text-sm font-display tracking-wider text-slate-400 mb-2">
        Goals
      </label>
      <textarea
        id="goals"
        bind:value={characterStore.draft.goals}
        placeholder="What drives your character? What do they want to achieve?"
        rows="3"
        class="input resize-none"
      ></textarea>
    </div>
    
    <!-- Notes -->
    <div class="sm:col-span-2">
      <label for="notes" class="block text-sm font-display tracking-wider text-slate-400 mb-2">
        Notes
      </label>
      <textarea
        id="notes"
        bind:value={characterStore.draft.notes}
        placeholder="Any other details about your character's appearance, personality, or history..."
        rows="4"
        class="input resize-none"
      ></textarea>
    </div>
  </div>
  
  <!-- Quick Suggestions -->
  <div class="card p-4 bg-slate-800/30">
    <h4 class="text-sm font-display tracking-wider text-cyan-400 mb-3">Need Inspiration?</h4>
    <div class="grid gap-4 sm:grid-cols-2 text-sm text-slate-400">
      <div>
        <p class="text-slate-300 mb-1">Sample Homeworlds:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Rim colony with frontier justice</li>
          <li>Core world megacity</li>
          <li>Space station or orbital habitat</li>
          <li>Terraformed agricultural world</li>
        </ul>
      </div>
      <div>
        <p class="text-slate-300 mb-1">Sample Goals:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Pay off a massive debt</li>
          <li>Find a missing family member</li>
          <li>Uncover ancient pretech secrets</li>
          <li>Build a crew and buy a ship</li>
        </ul>
      </div>
    </div>
  </div>
</div>
