// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import attachments from './src/integrations/attachments.ts';

export default defineConfig({
  site: 'https://mmmmmmseong.github.io',
  integrations: [sitemap(), attachments()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
