<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';

  let { children } = $props();
</script>

<div class="star-field"></div>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="{base}/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span class="text-xl">✦</span>
          </div>
          <div>
            <h1 class="font-display text-lg tracking-wider text-white group-hover:text-cyan-400 transition-colors">
              SWN
            </h1>
            <p class="text-xs text-slate-500 tracking-wide">Character Builder</p>
          </div>
        </a>
        
        <nav class="flex items-center gap-2">
          <a href="{base}/" class="btn btn-ghost text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="hidden sm:inline">Home</span>
          </a>
          <a href="{base}/create" class="btn btn-primary text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">New Character</span>
          </a>
        </nav>
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="flex-1">
    {@render children()}
  </main>
  
  <!-- Footer -->
  <footer class="border-t border-slate-800/50 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Built for <a href="https://www.drivethrurpg.com/product/230009/Stars-Without-Number-Revised-Edition-Free-Version" target="_blank" rel="noopener" class="text-cyan-400 hover:underline">Stars Without Number</a> by Sine Nomine Publishing
        </p>
        <p class="flex items-center gap-2">
          <span>Made with</span>
          <span class="text-red-400">♥</span>
          <span>using SvelteKit</span>
        </p>
      </div>
    </div>
  </footer>
</div>
