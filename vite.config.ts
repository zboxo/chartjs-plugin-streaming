import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'ChartStreaming',
      fileName: (format) => {
        if (format === 'es') return 'chartjs-plugin-streaming.esm.js';
        if (format === 'umd') return 'chartjs-plugin-streaming.js';
        return `chartjs-plugin-streaming.${format}.js`;
      },
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['chart.js', 'chart.js/helpers'],
      output: {
        globals: {
          'chart.js': 'Chart',
          'chart.js/helpers': 'Chart.helpers'
        },
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  optimizeDeps: {
    exclude: ['chart.js']
  }
});
