import {defineConfig} from 'vite';
import {resolve} from 'path';

const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) 2017-${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
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
        banner
      }
    },
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: false
  }
});
