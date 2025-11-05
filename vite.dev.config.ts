import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
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