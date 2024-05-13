[![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmdaemon-technologies%2Fitems-model%2Fmaster%2Fpackage.json&query=%24.version&prefix=v&label=npm&color=blue)](https://www.npmjs.com/package/@mdaemon/items-model) [![Static Badge](https://img.shields.io/badge/node-v14%2B-blue?style=flat&label=node&color=blue)](https://nodejs.org) [![install size](https://packagephobia.com/badge?p=@mdaemon/items-model)](https://packagephobia.com/result?p=@mdaemon/items-model) [![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmdaemon-technologies%2Fitems-model%2Fmaster%2Fpackage.json&query=%24.license&prefix=v&label=license&color=green)](https://github.com/mdaemon-technologies/items-model/blob/master/LICENSE) [![Node.js CI](https://github.com/mdaemon-technologies/items-model/actions/workflows/node.js.yml/badge.svg)](https://github.com/mdaemon-technologies/items-model/actions/workflows/node.js.yml)

# @mdaemon/items-model, A basic items Map model library with TypeScript support
### Includes MDaemon's Emitter library as a dependency
[ [@mdaemon/items-model on npm](https://www.npmjs.com/package/@mdaemon/items-model "npm") ]

The "items-model" provides basic methods for manipulating an array of objects based on a constructor

# Install #

	  $ npm install @mdaemon/items-model --save  

# Node CommonJS #
```javascript
    const ItemsModel = require("@mdaemon/items-model/dist/items-model.cjs");
```

# Node Modules #

```javascript
    import ItemsModel from "@mdaemon/items-model/dist/items-model.mjs";  
```

# Web #
```HTML
    <script type="text/javascript" src="/path_to_modules/dist/items-model.umd.js"></script>
    <!-- necessary for versions < 2.0.0 -->
    <script type="text/javascript">window.ItemsModel = window["items-model"];</script>
```

### ItemsModel ###

```javascript
    
  class Car {
    id = 0;
    make = "";
    model = "";
    color = "";
  }
  
  class Cars extends ItemsModel {
    constructor() {
      super({
        itemConstructor: Car,
        itemName: "Car"
      });
    }
  }
  
  // or
  
  // if you do not include an id attribute like below, a numbered id will be assigned
  function Car(config) {
    this.make = "";
    this.model = "";
    this.color = "";

    Object.assign(this, config);
  }
    
  function Cars() { 
    Object.assign(this, new ItemsModel({
      itemConstructor: Car,
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
  
  // gets the internal items Map
  carsModel.getAll(); // [Car]

  // gets all the ids from the items Map
  carsModel.getAllIds();

  // gets a copy of the internal items Map, so that manipulation of the items in the array do not impact the internal array
  carsModel.getCopies(); // [Car]

  // gets a copy of the requested item by id, so that manipulation of the item does not impact the internal item
  carsModel.getCopy(0); // Car
  carsModel.getCopy(1); // null

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

  // sets the values for all matching items
  // returns an array of objects that use the id and success true or false
  carsModel.setAttributesByAttr("model", "Odyssey", { color: "gray" }); // [{ 0: true }]

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

## v2.0.0 ##
<b>Breaking change:</b> Instead of window["items-model"], window.ItemsModel must be used for umd builds.

See [@mdaemon/emitter](https://github.com/mdaemon-technologies/emitter "@mdaemon/emitter") for how to details on the event emitter

# License #

Published under the [LGPL-2.1 license](https://github.com/mdaemon-technologies/items-model/blob/main/LICENSE "LGPL-2.1 License").

Published by<br/> 
<b>MDaemon Technologies, Ltd.<br/>
Simple Secure Email</b><br/>
[https://www.mdaemon.com](https://www.mdaemon.com)