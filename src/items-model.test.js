/**
 * @jest-environment jsdom
 */

const ItemsModel = require("../dist/items-model.umd.js");
const temp = [{ id: 1, name: "test1", selected: false }, { id: 2, name: "test2", selected: false }];
const temp2 = [{ id: 3, name: "test3", selected: true }, { id: 4, name: "test4", selected: true }];

describe("ItemsModel tests", () => {
  function Constructor(config) {
    this.id = 0;
    this.name = "";

    Object.assign(this, config);
  }

  it("accepts a config with parts itemConstructor and itemName", () => {
    let temp = new ItemsModel({
      itemConstructor: Constructor,
      itemName: "constructor"
    });

    expect(temp instanceof ItemsModel).toBe(true);
  });

  const basic = new ItemsModel({
    itemConstructor: Constructor,
    itemName: "constructor"
  });

  basic.on("indexed-constructor", (idx) => {
    console.log("indexed-constructor", idx);
  });

  describe("ItemsModel has method add", () => {
    expect(typeof basic.add).toBe("function");

    it("adds an item to the items array", () => {
      basic.add({ id: 11, name: "testness" });

      expect(basic.getByAttribute("id", 11) instanceof Constructor).toBe(true);

      basic.clear();
    });
  });

  describe("ItemsModel has method addAll", () => {
    expect(typeof basic.addAll).toBe("function");

    it("adds an array of items to the items array", () => {
      basic.addAll([
        { id: 11, name: "testness1" },
        { id: 12, name: "testness2" }
      ]);

      expect(basic.getByAttribute("id", 11) instanceof Constructor).toBe(true);
      expect(basic.getByAttribute("id", 12) instanceof Constructor).toBe(true);

      basic.clear();
    });
  });

  describe("ItemsModel has method clear", () => {
    expect(typeof basic.clear).toBe("function");

    it("clears out the items array", () => {
      basic.add({ id: 10, name: "test" });

      expect(basic.getByAttribute("id", 10) instanceof Constructor).toBe(true);
      basic.clear();
      expect(basic.getByAttribute("id", 10)).toBe(null);
    });

  });

  describe("ItemsModel has method insert", () => {
    expect(typeof basic.insert).toBe("function");

    it("inserts items into the items array at the given id", done => {
      basic.once("inserted-constructor", (o) => {
        expect(typeof o).toEqual("object");
        done();
      });

      temp.forEach(i => {
        basic.add(i);
      });

      expect(basic.getAll().length).toEqual(2);
      expect(basic.getByAttribute("id", 1) instanceof Constructor).toBe(true);
      basic.insert(1, temp2);
        console.log(basic.getIndex(1));
      expect(basic.getAll().length).toEqual(4);
      expect(basic.getByAttribute("id", 3) instanceof Constructor).toBe(true);
      expect(basic.getIndex(3)).toEqual(1);
      basic.clear();
    });
  });

  describe("ItemsModel has method upsert", () => {
    expect(typeof basic.upsert).toBe("function");

    it("is an alias of insert", () => {
      expect(basic.insert).toBe(basic.upsert);
    });
  });

  describe("ItemsModel has method update", () => {
    expect(typeof basic.update).toBe("function");

    it("updates items in the items array", done => {
      basic.once("added-constructor", (o) => {
        expect(typeof o).toEqual("object");
        expect(o.name).toEqual("test1");
      });

      basic.once("indexed-constructor", str => {
        expect(typeof str).toEqual("string");
        done();
      });

      basic.add(temp[0]);
      expect(basic.getById(1).name).toEqual("test1");
      expect(basic.update({ id: 1, name: "Updated Name!" })).toBe(true);
      expect(basic.getById(1).name).toEqual("Updated Name!");
      expect(basic.update({ id: 1, name: "test1" })).toBe(true);
      basic.clear();
    });

    it("returns false when the item does not exist in the items array", () => {
      basic.add(temp[0]);
      expect(basic.getById(1) instanceof Constructor).toBe(true);
      expect(basic.update({ id: 3, name: "Test" })).toBe(false);
      basic.clear();
    });

    it("returns false when the update did not change anything", () => {
      basic.add(temp[0]);
      expect(basic.getById(1) instanceof Constructor).toBe(true);
      expect(basic.update({ id: 1, name: "test1" })).toBe(false);
      basic.clear();
    });

    it("emits an updated-constructor event when item is updated", done => {
      basic.add(temp[0]);

      const updatedItem = { id: 1, name: "Update Test", selected: false };
      basic.once("updated-constructor", item => {
        expect(item).toEqual(updatedItem);
        done();
      });

      basic.update(updatedItem);
      basic.clear();
    });
  });

  describe("ItemsModel has method remove", () => {
    expect(typeof basic.remove).toBe("function");

    it("removes an item from the items array by the id", done => {
      basic.once("removed-constructor", id => {
        expect(typeof id).toEqual("number");
        expect(id).toEqual(1)
        done();
      });

      basic.add(temp[0]);

      expect(basic.getById(1) instanceof Constructor).toBe(true);
      expect(basic.remove()).toBe(false);
      expect(basic.remove(2)).toBe(false);
      expect(basic.remove(1)).toBe(true);

      basic.clear();
    });
  });

  describe("ItemsModel has method getIndex", () => {
    expect(typeof basic.getIndex).toBe("function");

    it("retrieves the index number of an item in the array by the id", () => {
      basic.add(temp[0]);

      expect(basic.getIndex(1)).toEqual(0);
      expect(basic.getIndex(2)).toEqual(-1);

      basic.clear();
    });
  });

  describe("ItemsModel has method getByAttribute", () => {
    expect(typeof basic.getByAttribute).toBe("function");

    it("retrieves an item by the designated attribute and value", () => {
      basic.add({ id: 2, name: "attribute", value: "testing" });

      expect(basic.getByAttribute("name", "value")).toBe(null);
      expect(basic.getByAttribute("name", "attribute") instanceof Constructor).toBe(true);
      expect(basic.getByAttribute("value", "testing") instanceof Constructor).toBe(true);
      expect(basic.getByAttribute()).toBe(null);
      expect(basic.getByAttribute("value")).toBe(null);

      basic.clear();
    });
  });

  describe("ItemsModel has method getFirstByAttribute", () => {
    expect(typeof basic.getFirstByAttribute).toBe("function");

    it("is an alias of getByAttribute", () => {
      expect(basic.getByAttribute === basic.getFirstByAttribute).toBe(true);
    });
  });

  describe("ItemsModel has method getAllByAttribute", () => {
    expect(typeof basic.getAllByAttribute).toBe("function");

    it("retrieves an array of items with the corresponding attribute and value combination", () => {
      basic.add({ id: 1, name: "test1", selected: true });
      basic.add({ id: 2, name: "test2", selected: false });
      basic.add({ id: 3, name: "test3", selected: true });

      expect(basic.getAll().length).toEqual(3);
      expect(basic.getAllByAttribute("selected", true).length).toEqual(2);
      expect(basic.getAllByAttribute("selected", false).length).toEqual(1);
      expect(basic.getAllByAttribute("name", "test3").length).toEqual(1);

      basic.clear();
    });
  });

  describe("ItemsModel has method setAttributes", () => {
    expect(typeof basic.setAttributes).toBe("function");

    it("sets the values of the given object on the give item id", () => {
      basic.add(temp[0]);

      expect(basic.getById(1) instanceof Constructor).toBe(true);
      expect(basic.setAttributes(1, { name: "testing setAttributes" })).toBe(true);
      expect(basic.getById(1).name).toEqual("testing setAttributes");

      basic.clear();
    });
  });

  describe("ItemsModel has method setAttributesByAttribute", () => {
    expect(typeof basic.setAttributesByAttribute).toBe("function");

    it("sets the values for all items that match the given attribution value pair with the passed object", () => {
      temp.forEach(item => {
        basic.add(item);
      });

      temp2.forEach(item => {
        basic.add(item);
      });

      expect(Array.isArray(basic.setAttributesByAttribute())).toBe(true);
      let results = basic.setAttributesByAttribute("selected", false, { selected: true });
      expect(results.length).toBe(2);
      results.forEach(result => {
        Object.keys(result).forEach(id => {
          expect(result[id]).toBe(true);
        });
      });

      results = basic.setAttributesByAttribute("name", "test4", { selected: false });
      expect(results.length).toBe(1);
      results.forEach(result => {
        Object.keys(result).forEach(id => {
          expect(result[id]).toBe(true);
        });
      });      

      basic.clear();
    });
  });

  describe("ItemsModel has method getById", () => {
    expect(typeof basic.getById).toBe("function");

    it("retrieves an item by the id", () => {
      basic.add(temp[0]);

      expect(basic.getById(1).name).toEqual("test1");
      expect(basic.getById(0)).toBe(null);

      basic.clear();
    });
  });

  describe("ItemsModel has method getAll", () => {
    expect(typeof basic.getAll).toBe("function");

    it("retrieves the items array", () => {
      basic.add(temp[0]);
      basic.add(temp[1]);

      expect(basic.getAll().length).toBe(2);

      basic.clear();
    });
  });

  describe("ItemsModel has method getAllIds", () => {
    expect(typeof basic.getAllIds).toBe("function");

    it("retrieves an array of all item ids", () => {
      basic.add(temp[0]);
      basic.add(temp[1]);

      expect(basic.getAllIds().length).toBe(2);
      expect(basic.getAllIds()).toEqual([1, 2]);

      basic.clear();
    });
  });

  describe("ItemsModel has method getCopies", () => {
    expect(typeof basic.getCopies).toBe("function");

    it("retrieves a copy of the items array, so that changes to the items will not impact the original objects", () => {
      basic.add(temp2[0]);
      basic.add(temp2[1]);

      expect(basic.getCopies().length).toBe(2);
      expect(basic.getCopies()).toEqual(basic.getAll());
      expect(basic.getCopies()).not.toBe(basic.getAll());

      basic.clear();
    });
  });

  describe("ItemsModel has method getCopy", () => {
    expect(typeof basic.getCopy).toBe("function");

    it("retrieves a copy of a specific items in the items array", () => {
      basic.add(temp2[0]);
      basic.add(temp2[1]);

      expect(basic.getCopy(3)).toEqual(temp2[0]);
      expect(basic.getCopy(4)).toEqual(temp2[1]);

      basic.clear();
    });
  });
});