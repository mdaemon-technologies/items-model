import Emitter from "@mdaemon/emitter/dist/emitter.mjs";
import { is, updateProps, isValidID } from "./utils";

export default function ItemsModel(config) {
  const self = this;
  Object.assign(this, new Emitter());

  const ItemConstructor = config.itemConstructor;
  let needsId = false;
  if (!isValidID(ItemConstructor.prototype.id)) {
    ItemConstructor.prototype.id = -1;
    needsId = true;
  }

  const genId = () => {
    let id = items.length;
    return self.getAllIds().reduce((initial, i) => {
      return Math.max(initial, i);
    }, id);
  };

  const itemName = config.itemName;
  this.getName = function () {
    return itemName;
  };

  const items = new Map();
  const indexes = new Map();

  this.clear = function () {
    items.clear();
  };

  this.add = function (item) {
    if (!is.object(item)) {
      return false;
    }

    item = new ItemConstructor(item);
    if (needsId) {
      if (item.id === -1) {
        item.id = genId();
      }
    }

    items.set(item.id, item);
    self.emit(`added-${itemName}`, item);

    const index = items.size - 1;
    indexes.set(item.id, index);
    return true;
  };
  
  this.getAll = function () {
    return Array.from(items.values());
  };

  this.getAllIds = function () {
    return Array.from(items.keys()).filter(key => is.string(key) || is.number(key));
  };

  const copy = (function () { 
    return !!window && window.structuredClone ? structuredClone : (item) => { return Object.assign({}, item); };
  }());

  this.getCopies = function () {
    return self.getAll().map(item => {
      return copy(item);
    });
  };

  this.getCopy = function (id) {
    let item = items.get(id);
    return !item ? item : copy(item);
  };

  this.getById = function (id) {
    return items.get(id) || null;
  };

  this.getIndex = function (id) {
    if (!isValidID(id)) {
      return false;
    }
    return indexes.get(id) || -1;
  };

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

  this.setAttributes = function (id, obj) {
    if (!isValidID(id) || !is.object(obj)) {
      return false;
    }

    if (is.string(id) && !id.trim()) {
      return false;
    }

    let item = self.getById(id);
    if (item === null) {
      return false;
    }

    if (updateProps(item, obj)){
      items.set(item.id, item);
      self.emit(`set-${itemName}-${item.id}`, item);
      return true;
    }

    return false;
  };

  this.insert = function (parent, insertItems) {
    if (!isValidID(parent) || !is.array(insertItems)) {
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

      arr.splice(parentIndex + 1 + idx, 0, item);
      self.emit(`inserted-${itemName}-${item.id}`, item);

      const insertIndex = parentIndex + 1 + idx;
      indexes.set(item.id, insertIndex);

      indexes.forEach((value, key) => {
        if (value >= insertIndex) {
          indexes.set(key, value + 1);
        }
      });
    });

    items.clear();

    arr.forEach(item => {
      items.set(item.id, item);
    });

    return true;
  };

  this.upsert = this.insert;

  this.update = function (item) {
    if (!is.object(item) || !isValidID(item.id)) {
      return false;
    }

    if (self.getIndex(item.id) === -1) {
      return false;
    }

    let oldItem = self.getById(item.id);
    if (updateProps(oldItem, item)) {
      items.set(item.id, oldItem);
      self.emit(`updated-${itemName}-${item.id}`, oldItem);
      return true;
    }

    return false;
  };

  this.remove = function (id) {
    if (!isValidID(id)) {
      return false;
    }

    if (items.delete(id)) {
      self.emit(`removed-${itemName}-${id}`);

      const removedIndex = indexes.get(id);
      indexes.forEach(index => {
        if (index >= removedIndex) {
          indexes.set(index, index - 1);
        }
      });

      indexes.delete(id);
      return true;
    }

    return false;
  };
}