<script lang="ts">
  import { authStore } from '$stores/auth.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  let email = $state('');
  let emailSent = $state(false);
  let loading = $state(false);

  async function handleEmailLogin() {
    if (!email) return;
    loading = true;
    const { error } = await authStore.signInWithEmail(email);
    loading = false;
    if (!error) {
      emailSent = true;
    }
  }

  async function handleGitHubLogin() {
    await authStore.signInWithGitHub();
  }

  function handleClose() {
    email = '';
    emailSent = false;
    loading = false;
    onClose();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick={handleClose}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="card p-6 max-w-md w-full" onclick={(e) => e.stopPropagation()}>
      <h3 class="font-display text-xl tracking-wider text-cyan-400 mb-4">
        Sign In for Cloud Sync
      </h3>

      {#if emailSent}
        <div class="text-center py-6">
          <div class="text-green-400 mb-2">Check your email!</div>
          <p class="text-slate-400 text-sm">
            We sent a magic link to <strong class="text-white">{email}</strong>.
            Click it to sign in.
          </p>
        </div>
      {:else}
        <p class="text-slate-400 text-sm mb-6">
          Sign in to sync your characters across devices and prevent data loss.
        </p>

        <!-- Email magic link -->
        <div class="space-y-3 mb-6">
          <input
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            class="input"
            onkeydown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
          />
          <button
            onclick={handleEmailLogin}
            disabled={loading || !email}
            class="btn btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-700"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-slate-900 text-slate-500">or</span>
          </div>
        </div>

        <!-- GitHub OAuth -->
        <button
          onclick={handleGitHubLogin}
          class="btn btn-secondary w-full"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        {#if authStore.error}
          <p class="text-red-400 text-sm mt-4">{authStore.error}</p>
        {/if}
      {/if}

      <button onclick={handleClose} class="btn btn-ghost w-full mt-4">
        {emailSent ? 'Close' : 'Cancel'}
      </button>
    </div>
  </div>
{/if}
