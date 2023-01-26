const ItemsModel = require("../dist/items-model.cjs");

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

  const temp = [{ id: 1, name: "test1" }, { id: 2, name: "test2" }];
  const temp2 = [{ id: 3, name: "test3" }, { id: 4, name: "test4" }];

  describe("ItemsModel has method add", () => {
    expect(typeof basic.add).toBe("function");

    it("adds an item to the items array", () => {
      basic.add({ id: 11, name: "testness" });

      expect(basic.getByAttribute("id", 11) instanceof Constructor).toBe(true);

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

    it("inserts items into the items array at the given id", () => {
      
      temp.forEach(i => {
        basic.add(i);
      });

      expect(basic.getAll().length).toEqual(2);
      expect(basic.getByAttribute("id", 1) instanceof Constructor).toBe(true);
      basic.insert(1, temp2);
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

    it("updates items in the items array", () => {
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

    it("emits an updated-constructor-1 event when item with id 1 is updated", done => {
      basic.add(temp[0]);

      const updatedItem = { id: 1, name: "Update Test" };
      basic.once("updated-constructor-1", item => {
        expect(item).toEqual(updatedItem);
        done();
      });

      basic.update(updatedItem);
    });
  });

  describe("ItemsModel has method remove", () => {
    expect(typeof basic.remove).toBe("function");

    it("removes an item from the items array by the id", () => {
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
});