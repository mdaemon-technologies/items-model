import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };

export default [
  // browser-friendly UMD build
  {
    input: 'src/items-model.js',
    output: {
      file: pkg.main,
      format: 'umd',
      exports: 'default',
      name: 'ItemsModel'
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
      { file: pkg.common, format: 'cjs', exports: 'default', 'name': 'ItemsModel' },
      { file: pkg.module, format: 'es', exports: 'default', 'name': 'ItemsModel' }
    ],
    plugins: [
      nodeResolve(),
      terser()
    ]
  },
]