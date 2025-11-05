import {defineConfig} from 'vite';
import {resolve} from 'path';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) 2017-${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ChartStreaming',
      fileName: (format) => {
        if (format === 'es') {
          return 'chartjs-plugin-streaming.esm.js';
        }
        if (format === 'umd') {
          return 'chartjs-plugin-streaming.js';
        }
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
        banner
      }
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: true
  }
});
