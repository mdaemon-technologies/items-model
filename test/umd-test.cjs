const vm = require("vm");
const fs = require("fs");
const path = require("path");

// UMD is designed for browsers - test it by simulating a global context
const code = fs.readFileSync(path.join(__dirname, "../dist/items-model.umd.js"), "utf8");
const context = { globalThis: {}, self: {}, console };
vm.runInNewContext(code, context);

const ItemsModel = context.globalThis.ItemsModel || context.self.ItemsModel;

if (typeof ItemsModel !== "function") {
  console.error("UMD test failed: ItemsModel is not a function, got", typeof ItemsModel);
  process.exit(1);
}

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
  console.error("UMD test failed: expected count 2, got", model.getAll().length);
  process.exit(1);
}

console.log("UMD test passed");
