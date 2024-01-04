import Emitter from "@mdaemon/emitter/dist/emitter.mjs";
import { is, updateProps } from "./utils";

export default function ItemsModel(config) {
  const self = this;
  Object.assign(this, new Emitter());

  const ItemConstructor = config.itemConstructor;
  let needsId = false;
  if (!is.validID(ItemConstructor.prototype.id)) {
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
    indexes.clear();
  };

  const indexItem = (id, idx) => {
    const index = idx || items.size - 1;
    indexes.set(id, index);
    self.emit(`indexed-${itemName}`, `id: ${id}, index: ${index}`);
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
    indexItem(item.id);
    
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
    if (!is.validID(id)) {
      return -1;
    }

    let idx = indexes.get(id);
    return is.undef(idx) ? -1 : idx;
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

  this.getFirstByAttribute = this.getByAttribute;

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

    if (updateProps(item, obj)){
      items.set(item.id, item);
      self.emit(`set-${itemName}-${item.id}`, item); //deprecated 1.2.3
      self.emit(`set-${itemName}`, item);
      return true;
    }

    return false;
  };

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
      self.emit(`inserted-${itemName}-${item.id}`, item); //deprecated 1.2.3
      self.emit(`inserted-${itemName}`, item);
    });

    self.clear();
    arr.forEach((item, index) => {
      items.set(item.id, item);
      indexes.set(item.id, index);
    });

    return true;
  };

  this.upsert = this.insert;

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
      self.emit(`updated-${itemName}-${item.id}`, oldItem); //deprecated 1.2.3
      self.emit(`updated-${itemName}`, oldItem);
      return true;
    }

    return false;
  };

  this.remove = function (id) {
    if (!is.validID(id)) {
      return false;
    }

    if (items.delete(id)) {
      self.emit(`removed-${itemName}-${id}`); //deprecated 1.2.3
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