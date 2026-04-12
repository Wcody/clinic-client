<script setup lang="ts">
import BqImgDrawer from "@/components/BqImgDrawer";
import BqImgViewer from "@/components/BqImgViewer";
import { onMounted, onUnmounted, ref } from "vue";

onMounted(() => {
  console.log("app-main mounted");
});

onUnmounted(() => {
  console.log("app-main unmounted");
});

const imgList = ref([]);
for (let i = 0; i < 74; i++) {
  imgList.value.push({
    url: `/images/1_${i < 10 ? "0" + i : i}.png`,
    alt: "image"
  });
}

const zoomRef = ref(100);
const currentPage = ref(1);
</script>

<template>
  <div class="app-main">
    <div>
      <span>页码：</span
      ><ElInputNumber
        v-model="currentPage"
        :step="1"
        :min="1"
        :max="imgList.length"
      />
      <span>百分比：</span
      ><ElInputNumber v-model="zoomRef" :step="10" :min="10" />
    </div>
    <BqImgViewer
      v-model:current-page="currentPage"
      style="height: calc(100% - 32px)"
      :zoom-value="zoomRef"
      :img-list="imgList"
    />
    <!-- <BqImgDrawer src="/images/1_01.png" :rect="[0, 0, 100, 100]" /> -->
  </div>
</template>

<style lang="scss" scoped>
.app-main {
  height: 100%;
  min-height: 100%;
  //background-color: #f8f8f8;
  background-color: #e9e9e9;
  overflow: scroll;
}
</style>
