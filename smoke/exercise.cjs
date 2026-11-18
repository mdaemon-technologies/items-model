'use strict';
/**
 * Smoke checks for the built bundles, shared by the smoke.test.* files.
 *
 * The full suite runs under Vitest, which needs Node 22.12 or later, but the
 * package supports Node 18. These checks run on every supported Node version
 * with nothing but node:test and node:assert, so they need no install and no
 * TypeScript. src/__tests__ covers behaviour in depth; these check that each
 * bundle loads and works the way a consumer uses it.
 *
 * Plain JavaScript on purpose: keep it to syntax and APIs Node 18.0 has. Each
 * file is run with plain `node`, not `node --test`, which Node 18.0 lacks;
 * node:test still runs the tests and sets a failing exit code.
 */
const assert = require('node:assert/strict');

/** An item type whose instances default to id 0, so ItemsModel keeps given ids. */
class Item {
  constructor(config) {
    this.id = 0;
    this.name = '';
    this.meta = { owner: '' };
    if (config) {
      Object.assign(this, config);
    }
  }
}

/** An item type with no default id, so ItemsModel generates one. */
class BareItem {
  constructor(config) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

/**
 * Runs the checks against one loaded ItemsModel class.
 *
 * @param {Function} ItemsModel - The class as a consumer receives it.
 * @param {object} [options]
 * @param {boolean} [options.deepCopies=false] - Whether getCopy() should be a
 *   deep copy: true where the bundle sees window.structuredClone, false where
 *   it falls back to a shallow Object.assign copy (plain Node).
 */
function exercise(ItemsModel, options) {
  const deepCopies = !!(options && options.deepCopies);
  assert.equal(typeof ItemsModel, 'function', 'the export is the ItemsModel class');

  const model = new ItemsModel({ itemConstructor: Item, itemName: 'item' });
  assert.ok(model instanceof ItemsModel);
  assert.equal(model.getName(), 'item');

  // Events come from the bundled @mdaemon/emitter. It catches handler errors,
  // so record what fires and assert afterwards instead of inside handlers.
  const events = { added: [], indexed: [], set: [], inserted: [], updated: [], removed: [] };
  for (const name of Object.keys(events)) {
    model.on(`${name}-item`, data => {
      events[name].push(name === 'indexed' || name === 'removed' ? data : data.id);
    });
  }

  // Adding and reading
  assert.equal(model.add('not an object'), false);
  assert.equal(model.addAll('not an array'), false);
  assert.equal(model.addAll([
    { id: 1, name: 'one', meta: { owner: 'a' } },
    { id: 2, name: 'two', meta: { owner: 'b' } }
  ]), true);
  assert.equal(model.getAll().length, 2);
  assert.ok(model.getAll().every(item => item instanceof Item), 'items are built with itemConstructor');
  assert.deepEqual(plain(model.getAllIds()), [1, 2]);
  assert.equal(model.getById(1).name, 'one');
  assert.equal(model.getById(99), null);
  assert.equal(model.getIndex(2), 1);
  assert.equal(model.getIndex(99), -1);

  // Generated ids, for an item type without a default id
  const bare = new ItemsModel({ itemConstructor: BareItem, itemName: 'bare' });
  bare.add({ name: 'a' });
  bare.add({ name: 'b' });
  assert.deepEqual(plain(bare.getAllIds()), [1, 2]);

  // Lookups by attribute, including a dotted path
  assert.equal(model.getByAttribute('name', 'two').id, 2);
  assert.equal(model.getByAttribute('meta.owner', 'a').id, 1);
  assert.equal(model.getByAttribute('name', 'missing'), null);
  assert.equal(model.getFirstByAttribute('name', 'two').id, 2);
  assert.equal(model.getAllByAttribute('name', 'one').length, 1);

  // Setting attributes
  assert.equal(model.setAttributes(1, { name: 'uno' }), true);
  assert.equal(model.getById(1).name, 'uno');
  assert.equal(model.setAttributes(1, { name: 'uno' }), false, 'no change');
  assert.equal(model.setAttributes(99, { name: 'x' }), false, 'no such item');
  assert.deepEqual(plain(model.setAttributesByAttribute('name', 'two', { name: 'dos' })), [{ 2: true }]);

  // Dangerous keys are skipped, so nothing reaches a prototype
  const polluting = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
  assert.equal(model.setAttributes(1, polluting), false);
  assert.equal({}.polluted, undefined, 'Object.prototype is untouched');
  assert.equal('polluted' in model.getById(1), false, "the item's prototype chain is untouched");
  assert.equal(model.getByAttribute('__proto__', Object.prototype), null);

  // Inserting after a parent: existing ids are updated in place, new ones inserted
  assert.equal(model.upsert, model.insert, 'upsert is an alias of insert');
  assert.equal(model.insert(1, [{ id: 3, name: 'three' }, { id: 2, name: 'DOS' }]), true);
  assert.deepEqual(plain(model.getAllIds()), [1, 3, 2]);
  assert.equal(model.getIndex(3), 1);
  assert.equal(model.getIndex(2), 2);
  assert.equal(model.getById(2).name, 'DOS');
  assert.equal(model.insert(99, [{ id: 4 }]), false, 'no such parent');

  // Updating
  assert.equal(model.update({ id: 1, name: 'one' }), true);
  assert.equal(model.update({ id: 1, name: 'one' }), false, 'no change');
  assert.equal(model.update({ id: 99, name: 'x' }), false, 'no such item');

  // Copies
  const original = model.getById(1);
  const copy = model.getCopy(1);
  assert.notEqual(copy, original);
  assert.deepEqual(plain(copy), plain(original));
  if (deepCopies) {
    assert.notEqual(copy.meta, original.meta, 'structuredClone copies nested objects');
  } else {
    assert.equal(copy.meta, original.meta, 'the fallback copy is shallow');
  }
  assert.equal(model.getCopy(99), undefined);
  assert.equal(model.getCopies().length, 3);

  // Removing
  assert.equal(model.remove(2), true);
  assert.equal(model.remove(2), false);
  assert.deepEqual(plain(model.getAllIds()), [1, 3]);
  assert.equal(model.getIndex(3), 1);

  model.clear();
  assert.equal(model.getAll().length, 0);

  assert.deepEqual(events, {
    added: [1, 2],
    indexed: ['id: 1, index: 0', 'id: 2, index: 1'],
    set: [1, 2],
    inserted: [3],
    updated: [2, 1],
    removed: [2]
  });

  // Events behave as on @mdaemon/emitter 2 (src/__tests__/items-model.events.test.ts has the details).
  const compat = new ItemsModel({ itemConstructor: Item, itemName: 'compat' });
  // A handler's exception propagates out of the method that emitted the event.
  const error = new Error('handler failed');
  compat.on('added-compat', () => { throw error; });
  assert.throws(() => compat.add({ id: 1 }), thrown => thrown === error);
  // Registering again under the same name and namespace replaces the handler.
  const ran = [];
  compat.on('set-compat', () => ran.push('first'));
  compat.on('set-compat', () => ran.push('second'));
  compat.setAttributes(1, { name: 'changed' });
  assert.deepEqual(ran, ['second']);
}

/**
 * The method names an instance exposes, own and inherited, without
 * Object.prototype's. Covers the instance-field aliases (getFirstByAttribute,
 * upsert) and the methods the emitter binds onto each instance.
 *
 * @param {Function} ItemsModel - A loaded ItemsModel class.
 * @returns {string[]} The sorted names.
 */
function apiNames(ItemsModel) {
  const model = new ItemsModel({ itemConstructor: Item, itemName: 'item' });
  const names = new Set();
  for (let o = model; o !== null && Object.getPrototypeOf(o) !== null; o = Object.getPrototypeOf(o)) {
    for (const key of Object.getOwnPropertyNames(o)) {
      if (key !== 'constructor' && typeof model[key] === 'function') {
        names.add(key);
      }
    }
  }
  return Array.from(names).sort();
}

/**
 * Copies a result into this realm. The UMD bundle runs in a vm context, whose
 * objects have that context's prototypes, and strict deep equality compares
 * prototypes.
 *
 * @param {unknown} value - A JSON-compatible result.
 * @returns {unknown} An equal value built from this realm's objects.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { exercise, apiNames };
