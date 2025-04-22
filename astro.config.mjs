import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mdhomecare.com.au', // Your final domain
  // base: '/', // Usually '/' for root domains, or '/<repo-name>' if deployed in a subfolder
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Customize the sitemap entries if needed
        if (item.url.includes('/blog/')) {
          return {
            ...item,
            changefreq: 'monthly',
            priority: 0.8,
          };
        }
        if (item.url === 'https://mdhomecare.com.au/') {
          return {
            ...item,
            changefreq: 'daily',
            priority: 1.0,
          };
        }
        if (item.url.includes('/services/')) {
          return {
            ...item,
            changefreq: 'monthly',
            priority: 0.9,
          };
        }
        return item;
      },
    }),
  ],
}); 