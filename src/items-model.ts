import Emitter from "@mdaemon/emitter";
import { is, updateProps } from "./utils";

/**
 * Interface for the configuration options of ItemsModel
 */
export interface IItemsModelConfig {
  itemConstructor: new (item?: any) => any;
  itemName: string;
}

/**
 * Interface for a generic item
 */
export interface ItemObject {
  [key: string]: any;
}

/**
 * ItemsModel class for managing collections of items
 */
export default class ItemsModel extends Emitter {
  private ItemConstructor: new (item?: any) => any;
  private needsId: boolean;
  private itemName: string;
  private items: Map<string | number, ItemObject>;
  private indexes: Map<string | number, number>;
  
  /**
   * Creates a new ItemsModel instance.
   * 
   * @param {IItemsModelConfig} config - The configuration options for the ItemsModel.
   */
  constructor(config: IItemsModelConfig) {
    super();
    
    this.ItemConstructor = config.itemConstructor;
    this.needsId = false;
    
    if (!is.validID(this.ItemConstructor.prototype.id)) {
      this.ItemConstructor.prototype.id = -1;
      this.needsId = true;
    }
    
    this.itemName = config.itemName;
    this.items = new Map<string | number, ItemObject>();
    this.indexes = new Map<string | number, number>();
  }
  
  /**
   * Generates a unique ID for a new item by finding
   * the maximum ID in the existing items array and 
   * incrementing by 1.
   */
  private genId(): number {
    if (!this.needsId) {
      return -1;
    }
    let id = this.items.size;
    let highestId: number = this.getAllIds().reduce((initial: number, id: number | string) => {
      if (typeof id === "string") {
        return initial;
      }
      return Math.max(initial, id);
    }, id) as number;

    return highestId + 1;
  }
  
  /**
   * Gets the name of the item from the configuration.
   * 
   * @returns {string} The name of the item.
   */
  getName(): string {
    return this.itemName;
  }
  
  /**
   * Clears all items and indexes from the model.
   */
  clear(): void {
    this.items.clear();
    this.indexes.clear();
  }
  
  /**
   * Indexes an item by its ID and assigns it an index.
   * 
   * @param {string|number} id - The ID of the item to index 
   * @param {number} [idx] - The index to assign the item
   */
  private indexItem(id: string | number, idx?: number): void {
    const index = idx !== undefined ? idx : this.items.size - 1;
    this.indexes.set(id, index);
    this.emit(`indexed-${this.itemName}`, `id: ${id}, index: ${index}`);
  }
  
  /**
   * Adds an item to the model. Validates the item 
   * is an object, assigns an ID if needed, adds to map,
   * emits event, and indexes the item.
   * 
   * @param {Object} item - The item object to add
   * @returns {boolean} True if the item was added successfully
   */
  add(item: any): boolean {
    if (!is.object(item)) {
      return false;
    }
    
    item = new this.ItemConstructor(item);
    if (this.needsId && item.id === -1) {
      item.id = this.genId();
    }
    
    this.items.set(item.id, item);
    this.emit(`added-${this.itemName}`, item);
    this.indexItem(item.id);
    
    return true;
  }
  
  /**
   * Adds an array of items to the model by calling
   * add() on each one.
   *
   * @param {Object[]} arr - Array of item objects to add
   * @returns {boolean} True if the items were added successfully
   */
  addAll(arr: any[]): boolean {
    if (!is.array(arr)) {
      return false;
    }
    
    arr.forEach(item => {
      this.add(item);
    });
    
    return true;
  }
  
  /**
   * Gets all items in the model.
   * @returns {Object[]} An array of all item objects.
   */
  getAll(): ItemObject[] {
    return Array.from(this.items.values());
  }
  
  /**
   * Gets all item IDs in the model.
   * @returns {Array} An array of item ID strings and numbers.
   */
  getAllIds(): (string | number)[] {
    return Array.from(this.items.keys()).filter(key => is.string(key) || is.number(key));
  }
  
  /**
   * Creates a deep copy function based on available capabilities
   */
  private copy = typeof window !== 'undefined' && !!window.structuredClone ? 
    structuredClone : 
    <T>(item: T): T => { return Object.assign({}, item); };
  
  /**
   * Returns an array containing deep copies of all items in the model.
   * Uses the copy() utility to clone each item.
   */
  getCopies(): ItemObject[] {
    return this.getAll().map((item: ItemObject) => {
      return this.copy(item);
    });
  }
  
  /**
   * Returns a deep copy of the item with the given ID.
   * Uses the copy() utility to clone the item.
   * Returns undefined if no item with the given ID exists.
   */
  getCopy(id: string | number): ItemObject | undefined {
    let item = this.items.get(id);
    return !item ? item : this.copy(item);
  }
  
  /**
   * Gets the item with the given ID.
   * @param {string|number} id - The ID of the item to get.
   * @returns {Object|null} The item object, or null if not found.
   */
  getById(id: string | number): ItemObject | null {
    return this.items.get(id) || null;
  }
  
  /**
   * Gets the index of the item with the given ID.
   * 
   * @param {string|number} id - The ID of the item to find the index for.
   * @returns {number} The index of the item, or -1 if not found.
   */
  getIndex(id: string | number): number {
    if (!is.validID(id)) {
      return -1;
    }
    
    let idx = this.indexes.get(id);
    return typeof idx === "undefined" ? -1 : idx;
  }
  
  /**
   * Gets the value of the given attribute from the provided object. 
   * Supports dot notation for nested attributes.
   * 
   * @param {Object} obj - The object to get the attribute value from
   * @param {string} attr - The attribute name, optionally using dot notation for nested attributes
   * @returns {*} The value of the attribute on the object
   */
  private getAttributeValue(obj: any, attr: string): any {
    if (attr.includes(".")) {
      let attrs = attr.split(".").filter(str => !!str.trim());
      let val = { ...obj };
      
      for (let i = 0, iMax = attrs.length; i < iMax; i++) {
        val = val[attrs[i]];
      }
      
      return val;
    }
    
    return obj[attr];
  }
  
  /**
   * Gets the first item that matches the given attribute and value.
   * 
   * @param {string} attr - The attribute name to match against.
   * @param {*} val - The value to match the attribute against.
   * @returns {Object|null} The matching item, or null if not found.
   */
  getByAttribute(attr: string, val: any): ItemObject | null {
    if (!is.string(attr) || is.undef(val)) {
      return null;
    }
    
    for (let item of this.items.values()) {
      let propVal = this.getAttributeValue(item, attr);
      if (propVal === val) {
        return item;
      }
    }
    
    return null;
  }
  
  /**
   * Gets the first item that matches the given attribute.
   * Delegates to {@link getByAttribute}.
   */
  getFirstByAttribute = this.getByAttribute;
  
  /**
   * Gets all items that match the given attribute and value.
   * 
   * @param {string} attr - The attribute name to match against.
   * @param {*} val - The value to match the attribute against.
   * @returns {Array} An array of all matching items.
   */
  getAllByAttribute(attr: string, val: any): ItemObject[] {
    let arr: ItemObject[] = [];
    if (!is.string(attr) || is.undef(val)) {
      return arr;
    }
    
    for (let item of this.items.values()) {
      let propVal = this.getAttributeValue(item, attr);
      if (val === propVal) {
        arr.push(item);
      }
    }
    
    return arr;
  }
  
  /**
   * Sets the attributes on an item with the given ID.
   * 
   * @param {string|number} id - The ID of the item to update. 
   * @param {Object} obj - The attributes to update on the item.
   * @returns {boolean} True if the item was updated, false otherwise.
   */
  setAttributes(id: string | number, obj: any): boolean {
    if (!is.validID(id) || !is.object(obj)) {
      return false;
    }
    
    if (typeof id === "string" && !id.trim()) {
      return false;
    }
    
    let item = this.getById(id);
    if (item === null) {
      return false;
    }
    
    if (updateProps(item, obj)) {
      this.items.set(item.id, item);
      this.emit(`set-${this.itemName}`, item);
      return true;
    }
    
    return false;
  }
  
  /**
   * Updates multiple items matching the given attribute and value with the given object of attributes. 
   * 
   * @param {string} attr - The attribute to match items against.
   * @param {*} val - The value to match the attribute against. 
   * @param {Object} obj - The attributes to update on the matching items.
   * @returns {Array} An array of objects indicating which item IDs were updated.
   */
  setAttributesByAttribute(attr: string, val: any, obj: any): Record<string | number, boolean>[] {
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
        this.items.set(item.id, item);
        this.emit(`set-${this.itemName}`, item);
        return { [item.id]: true };
      }
      
      return { [item.id]: false };
    });
    
    return results;
  }
  
  /**
   * Inserts new items as children of the item with the given parent ID.
   * 
   * @param {string|number} parent - The ID of the parent item. 
   * @param {Object[]} insertItems - The new items to insert.
   * @returns {boolean} True if the insert was successful, false otherwise.
   */
  insert(parent: string | number, insertItems: any[]): boolean {
    if (!is.validID(parent) || !is.array(insertItems)) {
      return false;
    }
    
    let parentIndex = this.getIndex(parent);
    if (parentIndex === -1) {
      return false;
    }
    
    let insertThese: any[] = [];
    for (let i = 0, iMax = insertItems.length; i < iMax; i++) {
      if (!this.update(insertItems[i])) {
        insertThese.push(insertItems[i]);
      }
    }
    
    const arr = Array.from(this.items.values());
    insertThese.forEach((item, idx) => {
      item = new this.ItemConstructor(item);
      if (this.needsId && item.id === -1) {
        item.id = this.genId();
      }
      
      const insertIndex = parentIndex + 1 + idx;
      arr.splice(insertIndex, 0, item);
      this.emit(`inserted-${this.itemName}`, item);
    });
    
    this.clear();
    arr.forEach((item, index) => {
      this.items.set(item.id, item);
      this.indexes.set(item.id, index);
    });
    
    return true;
  }
  
  /**
   * Alias for {@link insert}. Allows upsert semantics where new items will be inserted if no existing item matches the id.
   */
  upsert = this.insert;
  
  /**
   * Updates an existing item by ID.
   * 
   * @param {Object} item - The item object with the id property to update.
   * @returns {boolean} True if the update was successful, false otherwise.
   */
  update(item: any): boolean {
    if (!is.object(item) || !is.validID(item.id)) {
      return false;
    }
    
    if (this.getIndex(item.id) === -1) {
      return false;
    }
    
    let oldItem = this.getById(item.id);
    if (oldItem && updateProps(oldItem, item)) {
      this.items.set(item.id, oldItem);
      this.emit(`updated-${this.itemName}`, oldItem);
      return true;
    }
    
    return false;
  }
  
  /**
   * Removes an item by ID.
   * 
   * @param {string|number} id - The ID of the item to remove.
   * @returns {boolean} True if the item was removed, false otherwise.
   */
  remove(id: string | number): boolean {
    if (!is.validID(id)) {
      return false;
    }
    
    if (this.items.delete(id)) {
      this.emit(`removed-${this.itemName}`, id);
      
      const removedIndex = this.indexes.get(id);
      this.indexes.delete(id);
      this.indexes.forEach((index, key) => {
        if (index >= removedIndex!) {
          this.indexes.set(key, index - 1);
        }
      });
      
      return true;
    }
    
    return false;
  }
}