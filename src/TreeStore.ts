export interface Item {
  id: string | number;
  parent: string | number | null;
  label: string;
}

export class TreeStore {
  private items: Item[] = [];
  private itemsMap = new Map<string | number, Item>();
  private childrenMap = new Map<string | number | null, Item[]>();

  constructor(items: Item[] = []) {
    this.setItems(items);
  }

  setItems(items: Item[]): void {
    this.items = items;
    this.itemsMap.clear();
    this.childrenMap.clear();

    for (const item of items) {
      this.itemsMap.set(item.id, item);

      let children = this.childrenMap.get(item.parent);
      if (!children) {
        children = [];
        this.childrenMap.set(item.parent, children);
      }
      children.push(item);
    }
  }

  getAll(): Item[] {
    return [...this.items];
  }

  getItem(id: string | number): Item | undefined {
    return this.itemsMap.get(id);
  }

  getChildren(id: string | number): Item[] {
    const children = this.childrenMap.get(id);
    return children ? [...children] : [];
  }

  getAllChildren(id: string | number): Item[] {
    const result: Item[] = [];
    this.collectChildren(id, result);
    return result;
  }

  private collectChildren(id: string | number, acc: Item[]): void {
    const children = this.childrenMap.get(id);
    if (!children) return;

    for (const child of children) {
      acc.push(child);
      this.collectChildren(child.id, acc);
    }
  }

  getAllParents(id: string | number): Item[] {
    const result: Item[] = [];
    let currentItem = this.itemsMap.get(id);

    while (currentItem) {
      result.push(currentItem);
      if (currentItem.parent === null) break;
      currentItem = this.itemsMap.get(currentItem.parent);
    }
    return result;
  }

  addItem(item: Item): void {
    this.items.push(item);
    this.itemsMap.set(item.id, item);

    let children = this.childrenMap.get(item.parent);
    if (!children) {
      children = [];
      this.childrenMap.set(item.parent, children);
    }
    children.push(item);
  }

  removeItem(id: string | number): void {
    const item = this.itemsMap.get(id);
    if (!item) return;

    const descendants = this.getAllChildren(id);
    const idsToRemove = new Set<string | number>([id]);
    for (const desc of descendants) {
      idsToRemove.add(desc.id);
    }

    this.items = this.items.filter((i) => !idsToRemove.has(i.id));

    idsToRemove.forEach((removeId) => {
      this.itemsMap.delete(removeId);
      this.childrenMap.delete(removeId);
    });

    if (item.parent !== null) {
      const siblings = this.childrenMap.get(item.parent);
      if (siblings) {
        this.childrenMap.set(
          item.parent,
          siblings.filter((s) => s.id !== id),
        );
      }
    }
  }

  updateItem(item: Item): void {
    const oldItem = this.itemsMap.get(item.id);
    if (!oldItem) return;

    if (oldItem.parent !== item.parent) {
      if (oldItem.parent !== null) {
        const oldSiblings = this.childrenMap.get(oldItem.parent);
        if (oldSiblings) {
          this.childrenMap.set(
            oldItem.parent,
            oldSiblings.filter((s) => s.id !== item.id),
          );
        }
      }

      let newSiblings = this.childrenMap.get(item.parent);
      if (!newSiblings) {
        newSiblings = [];
        this.childrenMap.set(item.parent, newSiblings);
      }
      newSiblings.push(item);
    }

    this.itemsMap.set(item.id, item);
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
  }
}
