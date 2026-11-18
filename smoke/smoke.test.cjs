'use strict';
// The CommonJS entry, resolved through package.json's "exports" -> "require".
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { exercise } = require('./exercise.cjs');

test('require() loads dist/items-model.cjs', () => {
  assert.equal(
    require.resolve('@mdaemon/items-model'),
    path.resolve(__dirname, '..', 'dist', 'items-model.cjs')
  );
  // module.exports is the class itself, not { default }.
  const ItemsModel = require('@mdaemon/items-model');
  assert.equal(typeof ItemsModel, 'function');
  exercise(ItemsModel);
});
