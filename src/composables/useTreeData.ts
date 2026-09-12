import { shallowRef, ref } from 'vue';
import { TreeStore } from '../stores/TreeStore';
import type { Item } from '../types/item';

export interface UseTreeDataOptions {
  url?: string;
  delay?: number;
}

export function useTreeData(options: UseTreeDataOptions = {}) {
  const {
    url = `${import.meta.env.BASE_URL}items.json`,
    delay = 2000,
  } = options;

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