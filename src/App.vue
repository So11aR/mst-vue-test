<template>
  <div class="app-container">
    <h2>Дерево элементов</h2>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Загрузка данных (имитация 2 сек)...</p>
    </div>

    <ag-grid-vue
      v-else
      class="ag-theme-alpine"
      style="width: 100%; height: 500px;"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      :tree-data="true"
      :get-data-path="getDataPath"
      :group-default-expanded="-1"
      :auto-group-column-def="autoGroupColumnDef"
      :on-grid-ready="onGridReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { TreeStore, type Item } from './TreeStore';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const treeStore = new TreeStore([]);

const rowData = ref<Item[]>([]);
const loading = ref(true);

const CategoryInnerRenderer = defineComponent({
  name: 'CategoryInnerRenderer',
  props: { params: { type: Object, required: true } },
  setup(props) {
    return () => {
      const item = (props.params as any).data;
      if (!item) return h('span', '');
      const text =
        treeStore.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент';
      return h('span', text);
    };
  },
});

const autoGroupColumnDef = ref({
  colId: 'ag-Grid-AutoColumn',
  headerName: 'Категория',
  width: 200,
  suppressHeaderMenuButton: true,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: CategoryInnerRenderer,
  },
});

const columnDefs = ref([
  {
    colId: 'index',
    headerName: '№ п\\п',
    valueGetter: (params: any) =>
      params.node ? params.node.rowIndex + 1 : '',
    width: 80,
  },
  {
    colId: 'name',
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
]);

const defaultColDef = ref({
  sortable: false,
  filter: false,
  resizable: false,
  suppressHeaderMenuButton: true,
});

const onGridReady = (params: any) => {
  params.api.moveColumns(['ag-Grid-AutoColumn'], 1);
};

const getDataPath = (data: Item): string[] => {
  const parents = treeStore.getAllParents(data.id);
  return parents.reverse().map((parent) => parent.id.toString());
};

const fetchData = async () => {
  try {
    const response = await fetch('/items.json');
    const data: Item[] = await response.json();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    treeStore.setItems(data);
    rowData.value = treeStore.getAll();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>