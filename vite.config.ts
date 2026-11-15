import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { investigationsSchema } from './src/data/schema';

const base = process.env.GITHUB_ACTIONS ? '/ghostflame/' : '/';

function validateDataset() {
  return {
    name: 'validate-investigations',
    buildStart() {
      const raw = JSON.parse(
        readFileSync(new URL('./src/data/investigations.json', import.meta.url), 'utf8'),
      );
      const result = investigationsSchema.safeParse(raw);
      if (!result.success) {
        throw new Error(`Invalid investigations dataset: ${result.error.message}`);
      }
    },
  };
}

function preloadCriticalFonts() {
  const critical = [
    'newsreader-latin-400-normal',
    'newsreader-latin-400-italic',
    'hanken-grotesk-latin-400-normal',
  ];
  return {
    name: 'preload-critical-fonts',
    enforce: 'post' as const,
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string, context: { bundle?: Record<string, unknown> }) {
        const fonts = Object.keys(context.bundle ?? {}).filter(
          (file) => file.endsWith('.woff2') && critical.some((name) => file.includes(name)),
        );
        const links = fonts
          .map(
            (file) =>
              `<link rel="preload" href="${base}${file}" as="font" type="font/woff2" crossorigin />`,
          )
          .join('\n    ');
        return links ? html.replace('</head>', `    ${links}\n  </head>`) : html;
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [validateDataset(), preloadCriticalFonts(), react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
