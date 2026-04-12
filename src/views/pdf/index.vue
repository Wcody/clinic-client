<script setup lang="ts">
import BqPdfViewer from "@/components/BqPdfViewer";
import { onMounted, onUnmounted, ref } from "vue";

onMounted(() => {
  //console.log("app-main mounted");
});

onUnmounted(() => {
  //console.log("app-main unmounted");
});

const zoomRef = ref(100);
const currentPage = ref(1);
</script>

<template>
  <div class="app-main">
    <div>
      <span>页码：</span
      ><ElInputNumber v-model="currentPage" :step="1" :min="1" />
      <span>百分比：</span
      ><ElInputNumber v-model="zoomRef" :step="10" :min="10" />
    </div>
    <BqPdfViewer
      v-model:currentPage="currentPage"
      pdfUrl="/images/1.pdf"
      style="height: calc(100% - 32px); background-color: blue"
    />
  </div>
</template>

<style lang="scss" scoped>
.app-main {
  height: 100%;
  min-height: 100%;
  //background-color: #f8f8f8;
  background-color: #e9e9e9;
}
</style>
