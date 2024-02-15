<template>
  <div class="app">
    <Column title="Первый столбец" maxItems="3"></Column>
    <Column title="Второй столбец" maxItems="5"></Column>
    <Column title="Третий столбец" maxItems="0"></Column>
  </div>
</template>

<script>
import Column from './components/Column.vue';

export default {
  components: {
    Column
  }
}
</script>

<script setup>
</script>

<style scoped>
</style>
