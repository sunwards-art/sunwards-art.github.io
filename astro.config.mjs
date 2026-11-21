// Tailwind v4 runs as a Vite plugin (no tailwind.config.js, no @astrojs/tailwind).
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://sunwards-art.github.io',
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
