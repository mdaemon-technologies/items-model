/**
 * Pins how ItemsModel's events behave: as they did on @mdaemon/emitter 2.1.1,
 * now that it is built on emitter 3. Two of emitter 3's breaking changes are
 * undone by ItemsModel (see its constructor and `register`):
 *
 * - An exception thrown by a handler propagates out of the call that emitted
 *   the event, instead of going to emitter 3's onError and being swallowed.
 * - Registering a handler again under the same name and namespace replaces the
 *   earlier one, instead of keeping both.
 *
 * Each check runs against the source and against the built CommonJS bundle
 * (which requires a fresh `npm run build`), since the bundle carries its own
 * copy of the emitter.
 */
import { createRequire } from "node:module";
import SourceItemsModel from "../items-model";

const require = createRequire(import.meta.url);
const BuiltItemsModel: typeof SourceItemsModel = require("../../dist/items-model.cjs");

class Item {
  id = 0;
  name = "";
  constructor(config?: Partial<Item>) {
    Object.assign(this, config);
  }
}

describe.each([
  ["the source", SourceItemsModel],
  ["dist/items-model.cjs", BuiltItemsModel],
])("ItemsModel events (%s)", (_label, ItemsModel) => {
  let model: SourceItemsModel;
  let consoleError: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    model = new ItemsModel({ itemConstructor: Item, itemName: "item" });
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("a handler that throws", () => {
    it("makes the method that emitted the event throw that error", () => {
      const error = new Error("handler failed");
      model.on("added-item", () => { throw error; });

      expect(() => model.add({ id: 1 })).toThrow(error);
      // Nothing reports it on the side: emitter 3's default onError logs instead.
      expect(consoleError).not.toHaveBeenCalled();
    });

    it("stops add() where emitter 2 did: the item is stored but not indexed", () => {
      model.on("added-item", () => { throw new Error("handler failed"); });

      expect(() => model.add({ id: 1 })).toThrow("handler failed");
      expect(model.getById(1)).toBeInstanceOf(Item);
      expect(model.getIndex(1)).toBe(-1);
    });

    it.each([
      ["set-item", (m: SourceItemsModel) => m.setAttributes(1, { name: "x" })],
      ["set-item", (m: SourceItemsModel) => m.setAttributesByAttribute("id", 1, { name: "x" })],
      ["updated-item", (m: SourceItemsModel) => m.update({ id: 1, name: "x" })],
      ["inserted-item", (m: SourceItemsModel) => m.insert(1, [{ id: 2 }])],
      ["removed-item", (m: SourceItemsModel) => m.remove(1)],
      ["indexed-item", (m: SourceItemsModel) => m.add({ id: 2 })],
    ])("propagates out of the call that emits %s", (event, call) => {
      model.add({ id: 1 });
      model.on(event, () => { throw new Error(event); });

      expect(() => call(model)).toThrow(event);
    });

    it("propagates out of emit(), skipping later handlers and one-time handlers", () => {
      const calls: string[] = [];
      model.on("ping", () => { calls.push("first"); throw new Error("first failed"); }, "a");
      model.on("ping", () => { calls.push("second"); }, "b");
      model.once("ping", () => { calls.push("once"); });

      expect(() => model.emit("ping")).toThrow("first failed");
      expect(calls).toEqual(["first"]);
      // The one-time handler did not fire, so it is still registered.
      expect(model.isRegistered("ping")).toBe(true);
    });

    it("propagates from a one-time handler", () => {
      model.once("ping", () => { throw new Error("once failed"); });

      expect(() => model.emit("ping")).toThrow("once failed");
    });
  });

  describe("registering a handler again under the same name and namespace", () => {
    function fired(name = "ping"): string[] {
      const calls: string[] = [];
      model.emit(name, calls);
      return calls;
    }

    it("replaces the earlier handler", () => {
      model.on("ping", (calls: string[]) => calls.push("first"));
      model.on("ping", (calls: string[]) => calls.push("second"));

      expect(fired()).toEqual(["second"]);
    });

    it.each([
      ["on(name, namespace, func)", (m: SourceItemsModel, f: (calls: string[]) => number) => m.on("ping", "ns", f)],
      ["on(name, func, namespace)", (m: SourceItemsModel, f: (calls: string[]) => number) => m.on("ping", f, "ns")],
      ["register(name, namespace, func)", (m: SourceItemsModel, f: (calls: string[]) => number) => m.register("ping", "ns", f)],
      ["subscribe(name, namespace, func)", (m: SourceItemsModel, f: (calls: string[]) => number) => m.subscribe("ping", "ns", f)],
      ["onMany(namespace, { name: func })", (m: SourceItemsModel, f: (calls: string[]) => number) => m.onMany("ns", { ping: f })],
    ])("replaces through %s", (_form, register) => {
      register(model, calls => calls.push("first"));
      register(model, calls => calls.push("second"));

      expect(fired()).toEqual(["second"]);
    });

    it("keeps handlers in other namespaces", () => {
      model.on("ping", "a", (calls: string[]) => calls.push("a1"));
      model.on("ping", "b", (calls: string[]) => calls.push("b"));
      model.on("ping", "a", (calls: string[]) => calls.push("a2"));

      // a2 takes a1's place, ahead of b, as emitter 2 replaced in place.
      expect(fired()).toEqual(["a2", "b"]);
    });

    it("re-sorts when the replacement has another priority", () => {
      model.on("ping", "a", (calls: string[]) => calls.push("a1"));
      model.on("ping", "b", (calls: string[]) => calls.push("b"));
      model.on("ping", "a", (calls: string[]) => calls.push("a2"), SourceItemsModel.LOW_PRIORITY);
      expect(fired()).toEqual(["b", "a2"]);

      model.on("ping", "a", (calls: string[]) => calls.push("a3"), SourceItemsModel.HIGH_PRIORITY);
      expect(fired()).toEqual(["a3", "b"]);
    });

    it("leaves one-time handlers alone", () => {
      model.once("ping", (calls: string[]) => calls.push("once"));
      model.on("ping", (calls: string[]) => calls.push("first"));
      model.on("ping", (calls: string[]) => calls.push("second"));

      expect(fired()).toEqual(["second", "once"]);
    });

    it("does not count toward the listener limit", () => {
      for (let i = 0; i < 50; i++) {
        model.on("ping", `ns${i}`, () => undefined);
      }
      model.on("ping", "ns0", (calls: string[]) => calls.push("replaced"));
      expect(consoleWarn).not.toHaveBeenCalled();
      expect(fired()).toEqual(["replaced"]);

      // A new namespace past the limit is still turned away.
      model.on("ping", "ns50", (calls: string[]) => calls.push("over the limit"));
      expect(consoleWarn).toHaveBeenCalledWith("Max listeners reached for event ping");
      expect(fired()).toEqual(["replaced"]);
    });

    it("is undone by off()", () => {
      model.on("ping", (calls: string[]) => calls.push("first"));
      model.on("ping", (calls: string[]) => calls.push("second"));
      model.off("ping");

      expect(fired()).toEqual([]);
      expect(model.isRegistered("ping")).toBe(false);
    });

    it("still rejects a handler that is not a function, keeping the earlier one", () => {
      model.on("ping", "ns", (calls: string[]) => calls.push("first"));

      // Emitter 3's TypeError at registration is kept: emitter 2 accepted the
      // registration and failed on the next emit instead.
      expect(() => model.on("ping", "ns", "not a function" as any)).toThrow(TypeError);
      expect(fired()).toEqual(["first"]);
    });
  });
});
