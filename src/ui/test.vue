<template>
  <h1 class="H1">自由展示 Vue</h1>
  <button @click="a++">value is {{ a }}</button>
</template>
<script lang="ts" setup>
import { ref } from "vue";
const a = ref(1);
</script>

<style></style>
