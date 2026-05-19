const ItemsModel = require("../dist/items-model.cjs");

class Constructor {
  constructor(config) {
    this.id = 0;
    this.name = "";
    if (config) Object.assign(this, config);
  }
}

const model = new ItemsModel({
  itemConstructor: Constructor,
  itemName: "constructor"
});

model.addAll([{ id: 1, name: "test1" }, { id: 2, name: "test2" }]);

if (model.getAll().length !== 2) {
  console.error("CJS test failed: expected count 2, got", model.getAll().length);
  process.exit(1);
}

console.log("CJS test passed");
