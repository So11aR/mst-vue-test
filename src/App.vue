<template>
  <div class="app-container">
    <h2>Дерево элементов</h2>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Загрузка данных (имитация 2 сек)...</p>
    </div>

    <!-- Ошибка загрузки -->
    <div v-else-if="error" class="error-message">
      Ошибка загрузки данных: {{ error }}
    </div>

    <!-- Таблица AG Grid -->
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
import { onMounted, defineComponent, h } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { useTreeData } from './composables/useTreeData';
import type { Item } from './types/item';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// 1. Вся логика данных — в composable.
const { treeStore, rowData, loading, error, load } = useTreeData();

// 2. Внутренний рендерер автоколонки — «Группа» / «Элемент».
const CategoryInnerRenderer = defineComponent({
  name: 'CategoryInnerRenderer',
  props: { params: { type: Object, required: true } },
  setup(props) {
    return () => {
      const item = (props.params as any).data as Item | undefined;
      if (!item) return h('span', '');
      const isGroup = treeStore.getChildren(item.id).length > 0;
      return h('span', isGroup ? 'Группа' : 'Элемент');
    };
  },
});

// 3. Автоколонка дерева.
const autoGroupColumnDef = {
  colId: 'ag-Grid-AutoColumn',
  headerName: 'Категория',
  width: 200,
  suppressHeaderMenuButton: true,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: CategoryInnerRenderer,
  },
};

// 4. Обычные колонки.
const columnDefs = [
  {
    colId: 'index',
    headerName: '№ п/п',
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
];

// 5. Колонки по умолчанию.
const defaultColDef = {
  sortable: false,
  filter: false,
  resizable: false,
  suppressHeaderMenuButton: true,
};

// 6. Перемещаем автоколонку на 1-ю позицию.
const onGridReady = (params: any) => {
  params.api.moveColumns(['ag-Grid-AutoColumn'], 1);
};

// 7. Путь для AG Grid Tree Data делегируем в TreeStore.
const getDataPath = (data: Item): string[] => {
  const parents = treeStore.getAllParents(data.id);
  return parents.reverse().map((parent) => parent.id.toString());
};

onMounted(() => {
  load();
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

.error-message {
  padding: 16px;
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>