import { shallowRef, ref } from 'vue';
import { TreeStore } from '../stores/TreeStore';
import type { Item } from '../types/item';

export interface UseTreeDataOptions {
  url?: string;
  delay?: number;
}

// Vite подставляет BASE_URL, но вне Vite-окружения (например,
// в некоторых тест-раннерах) import.meta.env может быть undefined.
const BASE_URL = import.meta.env?.BASE_URL ?? '/';

export function useTreeData(options: UseTreeDataOptions = {}) {
  const url = options.url ?? `${BASE_URL}items.json`;
  const delay = options.delay ?? 2000;

  const treeStore = new TreeStore();
  const rowData = shallowRef<Item[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const refresh = () => {
    rowData.value = treeStore.getAll();
  };

  const load = async (overrideUrl?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(overrideUrl ?? url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data: Item[] = await response.json();

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      treeStore.setItems(data);
      refresh();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Неизвестная ошибка';
      console.error('Ошибка загрузки данных:', e);
    } finally {
      loading.value = false;
    }
  };

  return { treeStore, rowData, loading, error, load, refresh };
}