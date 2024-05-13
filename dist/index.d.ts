import BasicItems from "../src/items-model";

export = BasicItems;

interface ItemObject {
  [key: string]: any;
}

declare class BasicItems {
  getName(): string;
  clear(): void;
  add(itemObject: ItemObject): boolean;
  addAll(itemObjects: ItemObject[]): boolean;
  getAll(): ItemObject[];
  getAllIds(): string[] | number[];
  getCopies(): ItemObject[];
  getCopy(id: string | number): ItemObject;
  getById(id: string | number): ItemObject;
  getIndex(id: string | number): ItemObject;
  getByAttribute(attribute: string, value: string | number | boolean | any[] | ItemObject);
  getAllByAttribute(attribute: string, value: string | number | boolean | any[] | ItemObject);
  setAttributes(id: string | number, properties: ItemObject): boolean;
  setAttributesByAttribute(attribute: string, value: string | number | boolean | any[] | ItemObject, properties: ItemObject): boolean;
  insert(parentId: string | number, insertItems: ItemObject[]): boolean;
  upsert(parentId: string | number, upsertItems: ItemObject[]): boolean;
  update(itemObject: ItemObject): boolean;
  remove(id: string | number): boolean;
}