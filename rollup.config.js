import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/items-model.js',
    output: {
      name: 'items-model',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/items-model.js',
    output: [
      { file: "dist/items-model.cjs", format: 'cjs', exports: 'default' },
      { file: "dist/items-model.mjs", format: 'es', exports: 'default' }
    ],
    plugins: [
      nodeResolve(),
      terser()
    ]
  },
]