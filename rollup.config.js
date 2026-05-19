import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

export default [
  // browser-friendly UMD build
  {
    input: 'src/items-model.ts',
    output: [
      { file: pkg.main, format: 'umd', exports: 'default', name: 'ItemsModel' },
      { file: pkg.common, format: 'cjs', exports: 'default', name: 'ItemsModel' },
      { file: pkg.module, format: 'es', exports: 'default', name: 'ItemsModel' }
    ],
    plugins: [
      typescript(),
      nodeResolve(),
      commonjs(),
      esbuild({ minify: true })
    ]
  }
]