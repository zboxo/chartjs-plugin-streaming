import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ChartStreaming',
      fileName: () => 'chartjs-plugin-streaming.min.js',
      formats: ['umd']
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
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: false
  }
});