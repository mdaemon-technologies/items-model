'use strict';
// The UMD bundle, as a <script> tag loads it: window.ItemsModel.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { exercise, apiNames } = require('./exercise.cjs');

const FILE = path.resolve(__dirname, '..', 'dist', 'items-model.umd.js');

/**
 * Runs the UMD bundle as a classic script in a fresh context. The package is
 * "type": "module", so Node would load a .js file as ESM; a browser runs it as
 * a script, so this does too.
 *
 * @param {object} context - The context's global object.
 * @returns {object} The same object, after the bundle ran.
 */
function runUmd(context) {
  vm.runInNewContext(fs.readFileSync(FILE, 'utf8'), context, { filename: FILE });
  return context;
}

test('dist/items-model.umd.js defines a global ItemsModel', () => {
  // No `window` here, so getCopy() takes the shallow fallback, as in Node.
  const context = runUmd({});
  exercise(context.ItemsModel);
});

test('dist/items-model.umd.js uses structuredClone when window has it', () => {
  // A browser-like global: window is the global object and has structuredClone.
  const window = { structuredClone };
  window.window = window;
  runUmd(window);
  exercise(window.ItemsModel, { deepCopies: true });
});

test('dist/items-model.umd.js fills module.exports under a CommonJS loader', () => {
  // The bundle's CommonJS branch, which bundlers such as webpack 4 use.
  const module = { exports: {} };
  runUmd({ module, exports: module.exports });
  exercise(module.exports);
});

test('the CommonJS, ES module and UMD bundles expose the same API', async () => {
  const cjs = require('@mdaemon/items-model');
  const esm = (await import('@mdaemon/items-model')).default;
  const umd = runUmd({}).ItemsModel;

  const names = apiNames(cjs);
  assert.ok(names.includes('getFirstByAttribute') && names.includes('upsert') && names.includes('on'));
  assert.deepEqual(apiNames(esm), names);
  assert.deepEqual(apiNames(umd), names);
});
