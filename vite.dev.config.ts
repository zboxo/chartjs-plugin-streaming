import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ChartStreaming',
      fileName: 'chartjs-plugin-streaming'
    },
    rollupOptions: {
      external: ['chart.js', 'chart.js/helpers'],
      output: {
        globals: {
          'chart.js': 'Chart',
          'chart.js/helpers': 'Chart.helpers'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['chart.js']
  }
});
