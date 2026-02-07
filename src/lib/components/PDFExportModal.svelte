<script lang="ts">
  import type { Character } from '$types/character';
  import CharacterSheetPDF from './CharacterSheetPDF.svelte';
  import { generateCharacterPDF, downloadPDF, DEFAULT_PDF_OPTIONS, type PDFExportOptions } from '$lib/utils/pdfExport';

  interface Props {
    character: Character;
    isOpen: boolean;
    onClose: () => void;
  }

  let { character, isOpen, onClose }: Props = $props();

  let options = $state<PDFExportOptions>({ ...DEFAULT_PDF_OPTIONS });
  let isGenerating = $state(false);
  let sheetContainer = $state<HTMLElement | null>(null);
  let errorMessage = $state<string | null>(null);

  async function handleExport() {
    if (!sheetContainer) return;

    // Find the actual sheet element inside the off-screen container
    const sheetElement = sheetContainer.querySelector('.sheet') as HTMLElement;
    if (!sheetElement) return;

    isGenerating = true;
    errorMessage = null;

    try {
      const blob = await generateCharacterPDF(sheetElement, options);
      const filename = `${character.name.replace(/[^a-zA-Z0-9]/g, '_') || 'character'}_sheet.pdf`;
      downloadPDF(blob, filename);
      onClose();
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : 'Failed to generate PDF';
      console.error('PDF generation failed:', e);
    } finally {
      isGenerating = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <h3 class="font-display text-xl tracking-wider text-cyan-400 mb-4">
        Export PDF Character Sheet
      </h3>

      <!-- Options -->
      <div class="space-y-4 mb-6">
        <!-- Page Size -->
        <div>
          <label class="block text-sm text-slate-400 mb-2">Page Size</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" bind:group={options.pageSize} value="letter"
                class="accent-cyan-400" />
              <span class="text-sm">US Letter</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" bind:group={options.pageSize} value="a4"
                class="accent-cyan-400" />
              <span class="text-sm">A4</span>
            </label>
          </div>
        </div>

        <!-- Color Scheme -->
        <div>
          <label class="block text-sm text-slate-400 mb-2">Color Scheme</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" bind:group={options.colorScheme} value="bw"
                class="accent-cyan-400" />
              <span class="text-sm">Black & White</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" bind:group={options.colorScheme} value="color"
                class="accent-cyan-400" />
              <span class="text-sm">Color Accents</span>
            </label>
          </div>
        </div>

        <!-- Quality -->
        <div>
          <label class="block text-sm text-slate-400 mb-2">Quality</label>
          <select bind:value={options.quality} class="input select">
            <option value="draft">Draft (Fast)</option>
            <option value="standard">Standard</option>
            <option value="high">High (Slow)</option>
          </select>
        </div>

        <!-- Checkboxes -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={options.includeDescriptions}
              class="accent-cyan-400" />
            <span class="text-sm">Include focus descriptions</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={options.includeNotes}
              class="accent-cyan-400" />
            <span class="text-sm">Include notes section</span>
          </label>
        </div>
      </div>

      {#if errorMessage}
        <div class="p-3 rounded bg-red-500/20 border border-red-500/50 mb-4">
          <p class="text-sm text-red-400">{errorMessage}</p>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-end">
        <button onclick={onClose} class="btn btn-ghost" disabled={isGenerating}>
          Cancel
        </button>
        <button
          onclick={handleExport}
          class="btn btn-primary"
          disabled={isGenerating}
        >
          {#if isGenerating}
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Off-screen rendering container for the PDF sheet -->
  <div
    bind:this={sheetContainer}
    style="position: fixed; left: -9999px; top: 0; z-index: -1;"
  >
    <CharacterSheetPDF {character} {options} />
  </div>
{/if}
