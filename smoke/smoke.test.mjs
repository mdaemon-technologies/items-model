// The ES module entry, resolved through package.json's "exports" -> "import".
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import ItemsModel from '@mdaemon/items-model';
import * as namespace from '@mdaemon/items-model';
import smoke from './exercise.cjs';

test('import loads dist/items-model.mjs', () => {
  // import.meta.resolve needs a flag before Node 18.19; the import above has
  // already resolved either way, so this only pins down which file it chose.
  if (typeof import.meta.resolve === 'function') {
    assert.equal(
      fileURLToPath(import.meta.resolve('@mdaemon/items-model')),
      fileURLToPath(new URL('../dist/items-model.mjs', import.meta.url))
    );
  }
  // The module has a default export only.
  assert.deepEqual(Object.keys(namespace), ['default']);
  smoke.exercise(ItemsModel);
});
