'use strict';

/*
*    Copyright (C) 1998-2022  MDaemon Technologies, Ltd.
*
*    This library is free software; you can redistribute it and/or
*    modify it under the terms of the GNU Lesser General Public
*    License as published by the Free Software Foundation; either
*    version 2.1 of the License, or (at your option) any later version.
*
*    This library is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
*    Lesser General Public License for more details.
*
*    You should have received a copy of the GNU Lesser General Public
*    License along with this library; if not, write to the Free Software
*    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
*    USA
*/

const is$1 = (function () {
  var isObject = function (val) {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  };

  var isString = function (str) {
    return typeof str === "string";
  };

  var isArray = function (arr) {
    return Array.isArray(arr);
  };

  var isBoolean = function (bool) {
    return typeof bool === "boolean";
  };

  var isNumber = function (num) {
    return typeof num === "number";
  };

  var isFunction = function (func) {
    return typeof func === "function";
  };

  var isNull = function (val) {
    return val === null;
  };

  var isUndefined = function (val) {
    return val === undefined || typeof val === "undefined";
  };

  return {
    string: isString,
    object: isObject,
    array: isArray,
    bool: isBoolean,
    number: isNumber,
    func: isFunction,
    nul: isNull,
    undef: isUndefined
  };
}());

/*
*    Copyright (C) 1998-2022  MDaemon Technologies, Ltd.
*
*    This library is free software; you can redistribute it and/or
*    modify it under the terms of the GNU Lesser General Public
*    License as published by the Free Software Foundation; either
*    version 2.1 of the License, or (at your option) any later version.
*
*    This library is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
*    Lesser General Public License for more details.
*
*    You should have received a copy of the GNU Lesser General Public
*    License along with this library; if not, write to the Free Software
*    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
*    USA
*/

function Event(name, id, func) {
  this.name = name;
  this.id = id;
  this.func = func;
}

function Emitter() {
  const events = [];
  const oneTime = [];

  const getEventIndex = (name, id) => {
    let idx = events.length;
    while (idx) {
      idx -= 1;
      if (events[idx].name === name && events[idx].id === id) {
        return idx;
      }
    }

    return -1;
  };

  const getEvents = (name) => {
    const evs = [];
    for (let idx = 0, iMax = events.length; idx < iMax; idx += 1) {
      if (events[idx].name === name) {
        evs.push(events[idx]);
      }
    }

    return evs;
  };

  this.register = (name, id, func) => {
    const eventName = name;
    let callback = func;
    let eventId = id;
    if (is$1.func(eventId)) {
      if (is$1.string(callback)) {
        const temp = callback;
        callback = eventId;
        eventId = temp;
      } else {
        callback = id;
        eventId = 'all';
      }
    }

    if (!eventName) {
      return;
    }

    const idx = getEventIndex(eventName, eventId);
    const ev = new Event(eventName, eventId, callback);
    if (idx === -1) {
      events.push(ev);
    } else {
      events[idx] = ev;
    }
  };

  this.on = this.register;
  this.subscribe = this.register;

  this.once = (name, func) => {
    if (!name) {
      return;
    }

    const ev = new Event(name, '', func);
    oneTime.push(ev);
  };

  this.onMany = (id, obj) => {
    if (!obj) {
      return;
    }

    Object.keys(obj).forEach((key) => {
      this.on(key, id, obj[key]);
    });
  };

  this.unregister = (name, id) => {
    const eventId = !id ? 'all' : id;

    if (!name) {
      return;
    }

    let idx = 0;

    if (eventId === 'all') {
      idx = events.length;
      while (idx) {
        idx -= 1;
        if (events[idx].id === 'all') {
          events.splice(idx, 1);
        }
      }

      idx = oneTime.length;
      while (idx) {
        idx -= 1;
        if (oneTime[idx].name === name) {
          oneTime.splice(idx, 1);
        }
      }

      return;
    }

    idx = getEventIndex(name, id);
    if (idx !== -1) {
      events.splice(idx, 1);
    }
  };

  this.off = this.unregister;
  this.unsubscribe = this.unregister;

  this.offAll = (id) => {
    let idx = events.length;
    while (idx) {
      idx -= 1;
      if (events[idx].id === id) {
        events.splice(idx, 1);
      }
    }
  };

  this.trigger = (name, data) => {
    const evs = getEvents(name);
    for (let idx = 0, iMax = evs.length; idx < iMax; idx += 1) {
      evs[idx].func(data, name);
    }

    let idx = oneTime.length;
    while (idx) {
      idx -= 1;
      if (oneTime[idx].name === name) {
        oneTime[idx].func(data, name);
        oneTime.splice(idx, 1);
      }
    }
  };

  this.emit = this.trigger;
  this.publish = this.trigger;

  this.propagate = (data, name) => {
    this.trigger(name, data);
  };

  this.isRegistered = (name, id) => {
    const eventId = !id ? 'all' : id;

    let idx = events.length;
    while (idx) {
      idx -= 1;
      if (events[idx].id === eventId && events[idx].name === name) {
        return true;
      }
    }

    idx = oneTime.length;
    while (idx) {
      idx -= 1;
      if (oneTime[idx].name === name) {
        return true;
      }
    }

    return false;
  };
}

const is = (function () {
  const obj = (a) => {
    return typeof a === "object" && a !== null;
  };

  const num = (a) => {
    return typeof a === "number";
  };

  const str = (a) => {
    return typeof a === "string";
  };

  const arr = (a) => {
    return Array.isArray(a);
  };

  const undef = (a) => {
    return typeof a === "undefined";
  };

  return {
    object: obj,
    number: num,
    string: str,
    array: arr,
    undef
  };
}());

const updateProps = (a, b) => {
  let changed = false;
  if (!is.object(a) || !is.object(b)) {
    return false;
  }
  
  Object.keys(b).forEach(prop => {
    if (is.object(a[prop])) {
      changed = updateProps(a[prop], b[prop]);
    }
    else if (is.array(a[prop]) && is.array(b[prop])) {
      for (var i = 0, iMax = b[prop].length; i < iMax; i++) {
        if (is.object(a[prop][i])) {
          changed = updateProps(a[prop][i], b[prop][i]);
        }
        else if (a[prop][i] !== b[prop][i]) {
          a[prop][i] = b[prop][i];
          changed = true;
        }
      }
    }
    else if (a[prop] !== b[prop]) {
      a[prop] = b[prop];
      changed = true;
    }
  });

  return changed;
};

const isValidID = (id) => {
  return is.number(id) || is.string(id);
};

function ItemsModel(config) {
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

  const copy = (function () { 
    return !!window && window.structuredClone ? structuredClone : (item) => { return Object.assign({}, item); };
  }());

  this.getCopies = function () {
    return items.map(item => {
      return copy(item);
    });
  };

  this.getCopy = function (id) {
    let item = self.getByAttribute("id", id);
    return !item ? item : copy(item);
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

module.exports = ItemsModel;
