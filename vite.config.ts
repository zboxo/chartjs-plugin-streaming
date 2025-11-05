import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
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
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});