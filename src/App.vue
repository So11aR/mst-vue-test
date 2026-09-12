<template>
  <div class="app-container">
    <h2>Дерево элементов</h2>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Загрузка данных (имитация 2 сек)...</p>
    </div>

    <div v-else-if="error" class="error-message">
      Ошибка загрузки данных: {{ error }}
    </div>

    <TreeGrid v-else :row-data="rowData" :tree-store="treeStore" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import TreeGrid from './components/TreeGrid.vue';
import { useTreeData } from './composables/useTreeData';

const { treeStore, rowData, loading, error, load } = useTreeData();

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