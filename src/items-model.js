import Emitter from "@mdaemon/emitter/dist/emitter.mjs";
import { is, updateProps } from "./utils";

/**
 * Creates a new ItemsModel instance.
 * 
 * @param {Object} config - The configuration options for the ItemsModel.
 */
export default function ItemsModel(config) {
  const self = this;
  Object.assign(this, new Emitter());

  const ItemConstructor = config.itemConstructor;
  let needsId = false;
  if (!is.validID(ItemConstructor.prototype.id)) {
    ItemConstructor.prototype.id = -1;
    needsId = true;
  }

  /**
 * Generates a unique ID for a new item by finding
 * the maximum ID in the existing items array and 
 * incrementing by 1.
 */
  const genId = () => {
    let id = items.length;
    return self.getAllIds().reduce((initial, i) => {
      return Math.max(initial, i);
    }, id);
  };

  /**
 * Gets the name of the item from the configuration.
 * 
 * @returns {string} The name of the item.
 */
  const itemName = config.itemName;
  this.getName = function () {
    return itemName;
  };

  const items = new Map();
  const indexes = new Map();

  /**
 * Clears all items and indexes from the model.
 */
  this.clear = function () {
    items.clear();
    indexes.clear();
  };

  /**
 * Indexes an item by its ID and assigns it an index.
 * 
 * @param {*} id - The ID of the item to index 
 * @param {number} [idx] - The index to assign the item
 */
  const indexItem = (id, idx) => {
    const index = idx || items.size - 1;
    indexes.set(id, index);
    self.emit(`indexed-${itemName}`, `id: ${id}, index: ${index}`);
  };

  /**
 * Adds an item to the model. Validates the item 
 * is an object, assigns an ID if needed, adds to map,
 * emits event, and indexes the item.
 * 
 * @param {Object} item - The item object to add
 * @returns {boolean} True if the item was added successfully
 */
  this.add = function (item) {
    if (!is.object(item)) {
      return false;
    }

    item = new ItemConstructor(item);
    if (needsId && item.id === -1) {
      item.id = genId();
    }

    items.set(item.id, item);
    self.emit(`added-${itemName}`, item);
    indexItem(item.id);

    return true;
  };

  /** 
   * Adds an array of items to the model by calling
   * add() on each one.
   *
   * @param {Object[]} arr - Array of item objects to add
   */
  this.addAll = function (arr) {
    if (!is.array(arr)) {
      return false;
    }

    arr.forEach(item => {
      self.add(item);
    });
  };
  
  /**
 * Gets all items in the model.
 * @returns {Object[]} An array of all item objects.
 */
  this.getAll = function () {
    return Array.from(items.values());
  };

  /**
 * Gets all item IDs in the model.
 * @returns {Array} An array of item ID strings and numbers.
 */
  this.getAllIds = function () {
    return Array.from(items.keys()).filter(key => is.string(key) || is.number(key));
  };

  const copy = (function () { 
    return !!window && window.structuredClone ? structuredClone : (item) => { return Object.assign({}, item); };
  }());

  /**
 * Returns an array containing deep copies of all items in the model.
 * Uses the copy() utility to clone each item.
 */
  this.getCopies = function () {
    return self.getAll().map(item => {
      return copy(item);
    });
  };

  /**
 * Returns a deep copy of the item with the given ID.
 * Uses the copy() utility to clone the item.
 * Returns undefined if no item with the given ID exists.
 */
  this.getCopy = function (id) {
    let item = items.get(id);
    return !item ? item : copy(item);
  };

  /**
 * Gets the item with the given ID.
 * @param {string|number} id - The ID of the item to get.
 * @returns {Object|null} The item object, or null if not found.
 */
  this.getById = function (id) {
    return items.get(id) || null;
  };

  /**
 * Gets the index of the item with the given ID.
 * 
 * @param {string|number} id - The ID of the item to find the index for.
 * @returns {number} The index of the item, or -1 if not found.
 */
  this.getIndex = function (id) {
    if (!is.validID(id)) {
      return -1;
    }

    let idx = indexes.get(id);
    return is.undef(idx) ? -1 : idx;
  };

  /**
 * Gets the value of the given attribute from the provided object. 
 * Supports dot notation for nested attributes.
 * 
 * @param {Object} obj - The object to get the attribute value from
 * @param {string} attr - The attribute name, optionally using dot notation for nested attributes
 * @returns {*} The value of the attribute on the object
 */
  const getAttributeValue = (obj, attr) => {
    if (attr.includes(".")) {
      let attrs = attr.split(".").filter(str => !!str.trim());
      let val = { ...obj };

      for (let i = 0, iMax = attrs.length; i < iMax; i++) {
        val = val[attrs[i]];
      }

      return val;
    }

    return obj[attr];
  };

  /**
 * Gets the first item that matches the given attribute and value.
 * 
 * @param {string} attr - The attribute name to match against.
 * @param {*} val - The value to match the attribute against.
 * @returns {Object|null} The matching item, or null if not found.
 */
  this.getByAttribute = function (attr, val) {
    if (!is.string(attr) || is.undef(val)) {
      return null;
    }

    for (let item of items.values()) {
      let propVal = getAttributeValue(item, attr);
      if (propVal === val) {
        return item;
      }
    }

    return null;
  };

  /**
 * Gets the first item that matches the given attribute.
 * Delegates to {@link getByAttribute}.
 */
  this.getFirstByAttribute = this.getByAttribute;

  /**
 * Gets all items that match the given attribute and value.
 * 
 * @param {string} attr - The attribute name to match against.
 * @param {*} val - The value to match the attribute against.
 * @returns {Array} An array of all matching items.
 */
  this.getAllByAttribute = function (attr, val) {
    let arr = [];
    if (!is.string(attr) || is.undef(val)) {
      return arr;
    }

    for (let item of items.values()) {
      let propVal = getAttributeValue(item, attr);
      if (val === propVal) {
        arr.push(item);
      }
    }

    return arr;
  };

  /**
 * Sets the attributes on an item with the given ID.
 * 
 * @param {string} id - The ID of the item to update. 
 * @param {Object} obj - The attributes to update on the item.
 * @returns {boolean} True if the item was updated, false otherwise.
 */
  this.setAttributes = function (id, obj) {
    if (!is.validID(id) || !is.object(obj)) {
      return false;
    }

    if (is.string(id) && !id.trim()) {
      return false;
    }

    let item = self.getById(id);
    if (item === null) {
      return false;
    }

    if (updateProps(item, obj)) {
      items.set(item.id, item);
      self.emit(`set-${itemName}`, item);
      return true;
    }

    return false;
  };

  /**
 * Updates multiple items matching the given attribute and value with the given object of attributes. 
 * 
 * @param {string} attr - The attribute to match items against.
 * @param {*} val - The value to match the attribute against. 
 * @param {Object} obj - The attributes to update on the matching items.
 * @returns {Array} An array of objects indicating which item IDs were updated.
 */
  this.setAttributesByAttribute = function (attr, val, obj) {
    if (!is.string(attr) || !is.object(obj)) {
      return [];
    }

    // we do not want to update an id on multiple items, because they need to be unique
    if (obj.id) {
      delete obj.id;
    }

    if (Object.keys(obj).length < 1) {
      return [];
    }

    let results = this.getAllByAttribute(attr, val).map(item => {
      if (updateProps(item, obj)) {
        items.set(item.id, item);
        self.emit(`set-${itemName}`, item);
        return { [item.id]: true };
      }

      return { [item.id]: false };
    });

    return results;
  };

  /**
 * Inserts new items as children of the item with the given parent ID.
 * 
 * @param {string|number} parent - The ID of the parent item. 
 * @param {Object[]} insertItems - The new items to insert.
 * @returns {boolean} True if the insert was successful, false otherwise.
 */
  this.insert = function (parent, insertItems) {
    if (!is.validID(parent) || !is.array(insertItems)) {
      return false;
    }

    let parentIndex = self.getIndex(parent);
    if (parentIndex === -1) {
      return false;
    }

    let insertThese = [];
    for (let i = 0, iMax = insertItems.length; i < iMax; i++) {
      if (!self.update(insertItems[i])) {
        insertThese.push(insertItems[i]);
      }
    }

    const arr = Array.from(items.values());
    insertThese.forEach((item, idx) => {
      item = new ItemConstructor(item);
      if (needsId && item.id === -1) {
        item.id = genId();
      }

      const insertIndex = parentIndex + 1 + idx;
      arr.splice(insertIndex, 0, item);
      self.emit(`inserted-${itemName}`, item);
    });

    self.clear();
    arr.forEach((item, index) => {
      items.set(item.id, item);
      indexes.set(item.id, index);
    });

    return true;
  };

  /**
 * Alias for {@link insert}. Allows upsert semantics where new items will be inserted if no existing item matches the id.
 */
  this.upsert = this.insert;

  /**
 * Updates an existing item by ID.
 * 
 * @param {Object} item - The item object with the id property to update.
 * @returns {boolean} True if the update was successful, false otherwise.
 */
  this.update = function (item) {
    if (!is.object(item) || !is.validID(item.id)) {
      return false;
    }

    if (self.getIndex(item.id) === -1) {
      return false;
    }

    let oldItem = self.getById(item.id);
    if (updateProps(oldItem, item)) {
      items.set(item.id, oldItem);
      self.emit(`updated-${itemName}`, oldItem);
      return true;
    }

    return false;
  };

  /**
 * Removes an item by ID.
 * 
 * @param {number} id - The ID of the item to remove.
 * @returns {boolean} True if the item was removed, false otherwise.
 */
  this.remove = function (id) {
    if (!is.validID(id)) {
      return false;
    }

    if (items.delete(id)) {
      self.emit(`removed-${itemName}`, id);

      const removedIndex = indexes.get(id);
      indexes.delete(id);
      indexes.forEach((index, key) => {
        if (index >= removedIndex) {
          indexes.set(key, index - 1);
        }
      });

      return true;
    }

    return false;
  };
}