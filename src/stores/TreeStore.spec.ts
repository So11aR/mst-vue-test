import { describe, it, expect, beforeEach } from "vitest";
import { TreeStore } from "./TreeStore";
import type { Item } from "../types/item";

// Тестовые данные из задания
const items: Item[] = [
  { id: 1, parent: null, label: "Айтем 1" },
  { id: "91064cee", parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
  { id: 4, parent: "91064cee", label: "Айтем 4" },
  { id: 5, parent: "91064cee", label: "Айтем 5" },
  { id: 6, parent: "91064cee", label: "Айтем 6" },
  { id: 7, parent: 4, label: "Айтем 7" },
  { id: 8, parent: 4, label: "Айтем 8" },
];

describe("TreeStore", () => {
  let store: TreeStore;

  beforeEach(() => {
    store = new TreeStore(items);
  });

  describe("getAll", () => {
    it("возвращает все элементы", () => {
      expect(store.getAll()).toHaveLength(8);
    });

    it("возвращает пустой массив для пустого хранилища", () => {
      const empty = new TreeStore();
      expect(empty.getAll()).toEqual([]);
    });
  });

  describe("getItem", () => {
    it("находит элемент по числовому id", () => {
      expect(store.getItem(1)?.label).toBe("Айтем 1");
    });

    it("находит элемент по строковому id", () => {
      expect(store.getItem("91064cee")?.label).toBe("Айтем 2");
    });

    it("возвращает undefined для несуществующего id", () => {
      expect(store.getItem(999)).toBeUndefined();
    });
  });

  describe("getChildren", () => {
    it("возвращает прямых детей", () => {
      const children = store.getChildren(1);
      expect(children).toHaveLength(2);
      expect(children.map((c) => c.id)).toEqual(["91064cee", 3]);
    });

    it("возвращает пустой массив, если детей нет", () => {
      expect(store.getChildren(7)).toEqual([]);
    });

    it("возвращает пустой массив для несуществующего id", () => {
      expect(store.getChildren(999)).toEqual([]);
    });
  });

  describe("hasChildren", () => {
    it("true для группы", () => {
      expect(store.hasChildren(1)).toBe(true);
    });

    it("false для листа", () => {
      expect(store.hasChildren(7)).toBe(false);
    });

    it("false для несуществующего id", () => {
      expect(store.hasChildren(999)).toBe(false);
    });
  });

  describe("getAllChildren", () => {
    it("возвращает всех потомков рекурсивно", () => {
      const all = store.getAllChildren(1);
      expect(all).toHaveLength(7); // все, кроме корня
    });

    it("возвращает только потомков конкретной ветки", () => {
      const all = store.getAllChildren(4);
      expect(all.map((c) => c.id).sort()).toEqual([7, 8]);
    });

    it("возвращает пустой массив для листа", () => {
      expect(store.getAllChildren(7)).toEqual([]);
    });
  });

  describe("getAllParents", () => {
    it("возвращает путь от элемента к корню", () => {
      const parents = store.getAllParents(7);
      expect(parents.map((p) => p.id)).toEqual([7, 4, "91064cee", 1]);
    });

    it("для корня возвращает только сам корень", () => {
      const parents = store.getAllParents(1);
      expect(parents.map((p) => p.id)).toEqual([1]);
    });

    it("возвращает пустой массив для несуществующего id", () => {
      expect(store.getAllParents(999)).toEqual([]);
    });
  });

  describe("getPath / getDataPath", () => {
    it("getPath возвращает путь от корня к элементу", () => {
      expect(store.getPath(7).map((p) => p.id)).toEqual([1, "91064cee", 4, 7]);
    });

    it("getDataPath возвращает строковые id", () => {
      expect(store.getDataPath(7)).toEqual(["1", "91064cee", "4", "7"]);
    });
  });

  describe("setItems", () => {
    it("полностью заменяет данные", () => {
      store.setItems([{ id: 100, parent: null, label: "Новый" }]);
      expect(store.getAll()).toHaveLength(1);
      expect(store.getItem(1)).toBeUndefined();
      expect(store.getItem(100)?.label).toBe("Новый");
    });

    it("очищает хранилище при пустом массиве", () => {
      store.setItems([]);
      expect(store.getAll()).toEqual([]);
    });
  });

  describe("addItem", () => {
    it("добавляет новый элемент в конец", () => {
      store.addItem({ id: 9, parent: 1, label: "Айтем 9" });
      expect(store.getAll()).toHaveLength(9);
      expect(store.getItem(9)?.label).toBe("Айтем 9");
    });

    it("добавляет в children родителя", () => {
      store.addItem({ id: 9, parent: 1, label: "Айтем 9" });
      expect(store.getChildren(1).map((c) => c.id)).toContain(9);
    });

    it("добавляет корневой элемент", () => {
      store.addItem({ id: 10, parent: null, label: "Новый корень" });
      expect(store.getChildren(null)).toContainEqual(
        expect.objectContaining({ id: 10 }),
      );
    });
  });

  describe("removeItem", () => {
    it("удаляет элемент и всех его потомков", () => {
      store.removeItem("91064cee");
      expect(store.getItem("91064cee")).toBeUndefined();
      expect(store.getItem(4)).toBeUndefined();
      expect(store.getItem(5)).toBeUndefined();
      expect(store.getItem(6)).toBeUndefined();
      expect(store.getItem(7)).toBeUndefined();
      expect(store.getItem(8)).toBeUndefined();
    });

    it("оставляет нетронутых соседей", () => {
      store.removeItem("91064cee");
      expect(store.getItem(1)).toBeDefined();
      expect(store.getItem(3)).toBeDefined();
    });

    it("удаляет лист без последствий для других", () => {
      store.removeItem(7);
      expect(store.getAll()).toHaveLength(7);
      expect(store.getChildren(4).map((c) => c.id)).toEqual([8]);
    });

    it("ничего не делает для несуществующего id", () => {
      store.removeItem(999);
      expect(store.getAll()).toHaveLength(8);
    });
  });

  describe("updateItem", () => {
    it("обновляет поля без смены родителя", () => {
      store.updateItem({ id: 3, parent: 1, label: "Обновлённый" });
      expect(store.getItem(3)?.label).toBe("Обновлённый");
      expect(store.getChildren(1)).toHaveLength(2); // родитель тот же
    });

    it("переносит элемент к новому родителю", () => {
      store.updateItem({ id: 3, parent: 4, label: "Айтем 3" });
      expect(store.getChildren(1).map((c) => c.id)).not.toContain(3);
      expect(store.getChildren(4).map((c) => c.id)).toContain(3);
    });

    it("переносит элемент в корень", () => {
      store.updateItem({ id: 3, parent: null, label: "Айтем 3" });
      expect(store.getChildren(null).map((c) => c.id)).toContain(3);
    });

    it("ничего не делает для несуществующего id", () => {
      store.updateItem({ id: 999, parent: 1, label: "Несуществующий" });
      expect(store.getAll()).toHaveLength(8);
    });
  });
});
