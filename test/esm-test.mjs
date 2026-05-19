import ItemsModel from "../dist/items-model.mjs";

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
  console.error("ESM test failed: expected count 2, got", model.getAll().length);
  process.exit(1);
}

console.log("ESM test passed");
