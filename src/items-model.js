import Emitter from "@mdaemon/emitter/dist/emitter.mjs";
import { is, updateProps } from "./utils";

const isValidID = (id) => {
  return is.number(id) || is.string(id);
};

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

  const items = [];

  this.clear = function () {
    items.splice(0, items.length);
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

    items.push(item);

    return true;
  };
  
  this.getAll = function () {
    return items;
  };

  this.getAllIds = function () {
    return items.map(item => {
      return item.id;
    });
  };

  this.getCopies = function () {
    return items.map(item => {
      return new ItemConstructor(item);
    });
  };

  this.getById = function (id) {
    return self.getByAttribute("id", id);
  };

  this.getIndex = function (id) {
    if (!isValidID(id)) {
      return false;
    }

    let i = items.length;
    while (i--) {
      if (id === items[i].id) {
        return i;
      }
    }

    return -1;
  };

  const getAttributeValue = (obj, attr) => {
    if (attr.indexOf(".") !== -1) {
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

    let i = items.length;
    while (i--) {
      let propVal = getAttributeValue(items[i], attr);
      if (val === propVal) {
        return items[i];
      }
    }

    return null;
  };

  this.getAllByAttribute = function (attr, val) {
    let arr = [];
    if (!is.string(attr) || is.undef(val)) {
      return arr;
    }

    for (var i = 0, iMax = items.length; i < iMax; i++) {
      let propVal = getAttributeValue(items[i], attr);
      if (val === propVal) {
        arr.push(items[i]);
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

    return updateProps(item, obj);
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

    insertThese.forEach((item, idx) => {
      item = new ItemConstructor(item);
      if (needsId) {
        if (item.id === -1) {
          item.id = genId();
        }
      }

      items.splice(parentIndex + 1 + idx, 0, item);
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

    let i = items.length;
    while (i--) {
      if (items[i].id === item.id && updateProps(items[i], item)) {
        self.emit(`updated-${itemName}-${item.id}`, item);
        return true;
      }
    }

    return false;
  };

  this.remove = function (id) {
    if (!isValidID(id)) {
      return false;
    }

    let i = items.length;
    while (i--) {
      if (items[i].id === id) {
        items.splice(i, 1);
        return true;
      }
    }

    return false;
  };
}