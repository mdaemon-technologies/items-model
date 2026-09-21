# @mdaemon/items-model

[![npm](https://img.shields.io/npm/v/@mdaemon/items-model?color=blue)](https://www.npmjs.com/package/@mdaemon/items-model)
[![license](https://img.shields.io/npm/l/@mdaemon/items-model?color=green)](LICENSE)
[![node](https://img.shields.io/node/v/@mdaemon/items-model)](https://nodejs.org)
[![install size](https://packagephobia.com/badge?p=@mdaemon/items-model)](https://packagephobia.com/result?p=@mdaemon/items-model)
[![CI](https://github.com/mdaemon-technologies/items-model/actions/workflows/node.js.yml/badge.svg)](https://github.com/mdaemon-technologies/items-model/actions/workflows/node.js.yml)

A basic items manipulation model

A basic items Map model library with TypeScript support. Includes MDaemon's Emitter library as a dependency.

The "items-model" provides basic methods for manipulating an array of objects based on a constructor

## Install

```bash
npm install @mdaemon/items-model
```

## Usage

### ES modules
```ts
import ItemsModel, { IItemsModelConfig, ItemObject } from "@mdaemon/items-model";
// or
import ItemsModel from "@mdaemon/items-model";  
```

### CommonJS
```js
const ItemsModel = require("@mdaemon/items-model");
```

### Browser (UMD)
```html
    <script type="text/javascript" src="/path_to_modules/dist/items-model.umd.js"></script>
<!-- necessary for versions < 2.0.0 -->
    <script type="text/javascript">window.ItemsModel = window["items-model"];</script>
```

## ItemsModel

```ts
import ItemsModel, { ItemObject } from "@mdaemon/items-model";

// TypeScript class extending ItemObject interface
class Car implements ItemObject {
  id: number = 0;
  make: string = "";
  model: string = "";
  color: string = "";
  [key: string]: any; // Allow additional properties

  constructor(config?: any) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

class Cars extends ItemsModel {
  constructor() {
    super({
      itemConstructor: Car,
      itemName: "Car"
    });
  }
}

// Alternative: Function-based constructor (still supported)
// If you do not include an id attribute, a numbered id will be assigned
function CarLegacy(config?: any) {
  this.id = 0;
  this.make = "";
  this.model = "";
  this.color = "";

  if (config) {
    Object.assign(this, config);
  }
}

function CarsLegacy() { 
  Object.assign(this, new ItemsModel({
    itemConstructor: CarLegacy,
    itemName: "Car"
  }));
}
    
const carsModel = new Cars();

// returns the name set for the model items
carsModel.getName(); // "Car";

// empties the internal items Map
carsModel.clear(); 
  
// adds a new Car to the items Map with only the config object
carsModel.add({ make: "Honda", model: "Element", color: "gray" });
// emits "added-Car" and "indexed-Car"

// adds an array of items to the items Map
carsModel.addAll([{ make: "Toyota", model: "Camry", color: "tan" }, { make: "Ford", model: "Focus", color: "white" }]);
// emits "added-Car" and "indexed-Car" for each item

// gets the internal items Map
carsModel.getAll(); // [Car]

// gets all the ids from the items Map
carsModel.getAllIds();

// gets a copy of the internal items Map, so that manipulation of the items in the array do not impact the internal array
carsModel.getCopies(); // [Car]

// gets a copy of the requested item by id, so that manipulation of the item does not impact the internal item
carsModel.getCopy(0); // Car
carsModel.getCopy(1); // undefined

// gets an item from the internal items Map based on the id
carsModel.getById(0); // Car
carsModel.getById(1); // null

// gets the index of a given item in the internal array
carsModel.getIndex(0); // 0
carsModel.getIndex(1); // -1

// gets the first item from the internal items Map based on an attribute/value combination
carsModel.getByAttribute("make", "Honda"); // Car
carsModel.getByAttribute("model", "Odyssey"); // null

carsModel.getFirstByAttribute("make", "Honda"); // Car -- this is an alias for getByAttribute

// gets all the items from the internal array based on an attribute/value combination
carsModel.getAllByAttribute("make", "Honda"); // [Car]
carsModel.getAllByAttribute("model", "Odyssey"); // []

// sets the values passed in an object based on the id
// returns success true or false
carsModel.setAttributes(0, { model: "Odyssey", color: "blue" }); // true
carsModel.setAttributes(1, { model: "Odyssey" }); // false
// emits "set-Car"

// sets the values for all matching items
// returns an array of objects that use the id and success true or false
carsModel.setAttributesByAttribute("model", "Odyssey", { color: "gray" }); // [{ 0: true }]
// emits "set-Car" for each matching item

// inserts or updates the passed items after the parent id
// returns success true or false
carsModel.insert(0, [{ make: "Toyota", model: "Camry", color: "tan" }]); // true
carsModel.insert(2, [{ make: "Toyota", model: "Carolla", color: "red" }]); // false because a parent of id 2
//emits "inserted-Car"

// upsert is an alias for insert
carsModel.upsert(1, [{ id: 0, model: "Element" }]); // true

// similar to set attributes, except the full object is expected (including the id)
// returns success true or false
carsModel.update({ id: 1, make: "Toyota", model: "Camry", color: "brown" }); // true
// emits "updated-Car"

// removes the item from the internal items Map based on the id
// returns success true or false
carsModel.remove(1); // true
carsModel.remove(2); // false
// emits "removed-Car"

```

See [@mdaemon/emitter](https://github.com/mdaemon-technologies/emitter "@mdaemon/emitter") for how to details on the event emitter

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Published under the [LGPL-2.1](LICENSE) license.

Published by **MDaemon Technologies, Ltd.**  
Simple Secure Email  
[https://www.mdaemon.com](https://www.mdaemon.com)
