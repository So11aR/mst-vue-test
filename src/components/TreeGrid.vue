<template>
  <ag-grid-vue
    class="ag-theme-alpine"
    style="width: 100%"
    dom-layout="autoHeight"
    :row-height="48"
    :header-height="48"
    :columnDefs="columnDefs"
    :defaultColDef="defaultColDef"
    :rowData="rowData"
    :treeData="true"
    :getDataPath="getDataPath"
    :groupDefaultExpanded="-1"
    :autoGroupColumnDef="autoGroupColumnDef"
    :initial-state="initialState"
    :suppress-column-move-animation="true"
  />
</template>

<script setup lang="ts">
import { defineComponent, h, type PropType } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import type {
  ColDef,
  AutoGroupColumnDef,
  GridState,
  ICellRendererParams,
} from 'ag-grid-community';

import type { TreeStore } from '../stores/TreeStore';
import type { Item } from '../types/item';

const props = defineProps<{
  rowData: Item[];
  treeStore: TreeStore;
}>();

const CategoryInnerRenderer = defineComponent({
  name: 'CategoryInnerRenderer',
  props: {
    params: {
      type: Object as PropType<ICellRendererParams>,
      required: true,
    },
  },
  setup(rendererProps) {
    return () => {
      const data = rendererProps.params?.data as Item | undefined;
      if (!data) return h('span', '');

      const isGroup = props.treeStore.hasChildren(data.id);
      return h('span', isGroup ? 'Группа' : 'Элемент');
    };
  },
});

// Автоколонка дерева. AG Grid создаёт её сам, здесь только настраиваем.
const autoGroupColumnDef: AutoGroupColumnDef<Item> = {
  headerName: 'Категория',
  width: 200,
  suppressHeaderMenuButton: true,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: CategoryInnerRenderer,
  },
};

// Обычные колонки — без автоколонки.
const columnDefs: ColDef<Item>[] = [
  {
    colId: 'index',
    headerName: '№ п/п',
    valueGetter: (params) =>
      params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
    width: 80,
  },
  {
    colId: 'name',
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
];

const defaultColDef: ColDef<Item> = {
  sortable: false,
  filter: false,
  resizable: false,
  suppressHeaderMenuButton: true,
};

// Порядок колонок задаём до первой отрисовки.
const initialState: GridState = {
  columnOrder: {
    orderedColIds: ['index', 'ag-Grid-AutoColumn', 'name'],
  },
};

const getDataPath = (data: Item): string[] =>
  props.treeStore.getDataPath(data.id);
</script>

<style scoped>
:deep(.ag-theme-alpine) {
  font-family: "Inter", Arial, sans-serif;
  font-size: 14px;
}

:deep(.ag-cell) {
  padding-left: 16px;
  padding-right: 16px;
  line-height: 48px;
}

:deep(.ag-header-cell) {
  padding-left: 16px;
  padding-right: 16px;
}

/* Увеличенная стрелка раскрытия дерева */
:deep(.ag-icon-tree-closed),
:deep(.ag-icon-tree-open) {
  font-size: 20px;
  width: 20px;
  height: 20px;
  line-height: 20px;
}
</style>