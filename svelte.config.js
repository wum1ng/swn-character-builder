import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: true
    }),
    paths: {
      base: dev ? '' : '/swn-character-builder'
    },
    alias: {
      $lib: './src/lib',
      $data: './src/data',
      $stores: './src/stores',
      $types: './src/types'
    }
  }
};

export default config;
