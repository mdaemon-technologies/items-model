import Emitter from "@mdaemon/emitter";
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
    private ItemConstructor;
    private needsId;
    private itemName;
    private items;
    private indexes;
    /**
     * Creates a new ItemsModel instance.
     *
     * @param {IItemsModelConfig} config - The configuration options for the ItemsModel.
     */
    constructor(config: IItemsModelConfig);
    /**
     * Generates a unique ID for a new item by finding
     * the maximum ID in the existing items array and
     * incrementing by 1.
     */
    private genId;
    /**
     * Gets the name of the item from the configuration.
     *
     * @returns {string} The name of the item.
     */
    getName(): string;
    /**
     * Clears all items and indexes from the model.
     */
    clear(): void;
    /**
     * Indexes an item by its ID and assigns it an index.
     *
     * @param {string|number} id - The ID of the item to index
     * @param {number} [idx] - The index to assign the item
     */
    private indexItem;
    /**
     * Adds an item to the model. Validates the item
     * is an object, assigns an ID if needed, adds to map,
     * emits event, and indexes the item.
     *
     * @param {Object} item - The item object to add
     * @returns {boolean} True if the item was added successfully
     */
    add(item: any): boolean;
    /**
     * Adds an array of items to the model by calling
     * add() on each one.
     *
     * @param {Object[]} arr - Array of item objects to add
     * @returns {boolean} True if the items were added successfully
     */
    addAll(arr: any[]): boolean;
    /**
     * Gets all items in the model.
     * @returns {Object[]} An array of all item objects.
     */
    getAll(): ItemObject[];
    /**
     * Gets all item IDs in the model.
     * @returns {Array} An array of item ID strings and numbers.
     */
    getAllIds(): (string | number)[];
    /**
     * Creates a deep copy function based on available capabilities
     */
    private copy;
    /**
     * Returns an array containing deep copies of all items in the model.
     * Uses the copy() utility to clone each item.
     */
    getCopies(): ItemObject[];
    /**
     * Returns a deep copy of the item with the given ID.
     * Uses the copy() utility to clone the item.
     * Returns undefined if no item with the given ID exists.
     */
    getCopy(id: string | number): ItemObject | undefined;
    /**
     * Gets the item with the given ID.
     * @param {string|number} id - The ID of the item to get.
     * @returns {Object|null} The item object, or null if not found.
     */
    getById(id: string | number): ItemObject | null;
    /**
     * Gets the index of the item with the given ID.
     *
     * @param {string|number} id - The ID of the item to find the index for.
     * @returns {number} The index of the item, or -1 if not found.
     */
    getIndex(id: string | number): number;
    /**
     * Gets the value of the given attribute from the provided object.
     * Supports dot notation for nested attributes.
     *
     * @param {Object} obj - The object to get the attribute value from
     * @param {string} attr - The attribute name, optionally using dot notation for nested attributes
     * @returns {*} The value of the attribute on the object
     */
    private getAttributeValue;
    /**
     * Gets the first item that matches the given attribute and value.
     *
     * @param {string} attr - The attribute name to match against.
     * @param {*} val - The value to match the attribute against.
     * @returns {Object|null} The matching item, or null if not found.
     */
    getByAttribute(attr: string, val: any): ItemObject | null;
    /**
     * Gets the first item that matches the given attribute.
     * Delegates to {@link getByAttribute}.
     */
    getFirstByAttribute: (attr: string, val: any) => ItemObject | null;
    /**
     * Gets all items that match the given attribute and value.
     *
     * @param {string} attr - The attribute name to match against.
     * @param {*} val - The value to match the attribute against.
     * @returns {Array} An array of all matching items.
     */
    getAllByAttribute(attr: string, val: any): ItemObject[];
    /**
     * Sets the attributes on an item with the given ID.
     *
     * @param {string|number} id - The ID of the item to update.
     * @param {Object} obj - The attributes to update on the item.
     * @returns {boolean} True if the item was updated, false otherwise.
     */
    setAttributes(id: string | number, obj: any): boolean;
    /**
     * Updates multiple items matching the given attribute and value with the given object of attributes.
     *
     * @param {string} attr - The attribute to match items against.
     * @param {*} val - The value to match the attribute against.
     * @param {Object} obj - The attributes to update on the matching items.
     * @returns {Array} An array of objects indicating which item IDs were updated.
     */
    setAttributesByAttribute(attr: string, val: any, obj: any): Record<string | number, boolean>[];
    /**
     * Inserts new items as children of the item with the given parent ID.
     *
     * @param {string|number} parent - The ID of the parent item.
     * @param {Object[]} insertItems - The new items to insert.
     * @returns {boolean} True if the insert was successful, false otherwise.
     */
    insert(parent: string | number, insertItems: any[]): boolean;
    /**
     * Alias for {@link insert}. Allows upsert semantics where new items will be inserted if no existing item matches the id.
     */
    upsert: (parent: string | number, insertItems: any[]) => boolean;
    /**
     * Updates an existing item by ID.
     *
     * @param {Object} item - The item object with the id property to update.
     * @returns {boolean} True if the update was successful, false otherwise.
     */
    update(item: any): boolean;
    /**
     * Removes an item by ID.
     *
     * @param {string|number} id - The ID of the item to remove.
     * @returns {boolean} True if the item was removed, false otherwise.
     */
    remove(id: string | number): boolean;
}
