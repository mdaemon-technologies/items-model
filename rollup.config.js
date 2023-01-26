import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // browser-friendly UMD build
  {
    input: 'src/items-model.js',
    output: {
      name: 'items-model',
      file: "dist/items-model.umd.js",
      format: 'umd'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'src/items-model.js',
    output: [
      { file: "dist/items-model.cjs", format: 'cjs', exports: 'default' },
      { file: "dist/items-model.mjs", format: 'es' }
    ],
    plugins: [
      nodeResolve()
    ]
  },
]