<script lang="ts">
  interface Props {
    notes: string;
    onUpdate: (notes: string) => void;
  }

  let { notes, onUpdate }: Props = $props();

  let value = $state(notes);

  const charCount = $derived(value.length);
  const wordCount = $derived(value.trim() ? value.trim().split(/\s+/).length : 0);

  function handleBlur() {
    onUpdate(value);
  }
</script>

<div class="space-y-3">
  <textarea
    bind:value={value}
    onblur={handleBlur}
    rows="10"
    placeholder="Free-form notes about your character, campaign, or anything else..."
    class="input text-sm w-full whitespace-pre-wrap"
  ></textarea>
  <div class="flex justify-end text-[10px] text-slate-600">
    {charCount} chars | {wordCount} words
  </div>
</div>
