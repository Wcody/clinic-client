<script setup lang="tsx">
import { computed, onMounted, reactive, ref, watch } from "vue";
import _ from "lodash";

defineOptions({
  name: "BqImgViewer"
});

const font = reactive({
  color: "rgba(0, 0, 0, .15)",
  textAlign: "center",
  fontSize: "16"
});

const props = withDefaults(
  defineProps<{
    zoomValue: number;
    imgList: Array<any>;
    currentPage: number;
    userName: string;
  }>(),
  { zoomValue: 100, imgList: () => [], currentPage: 1, userName: "admin" }
);

const emit = defineEmits([
  "changePage",
  "changeZoom",
  "update:currentPage",
  "update:zoomValue"
]);

const itemWidth = computed(() => {
  return `calc(60% * ${props.zoomValue / 100})`;
});

const scrollArea = ref<HTMLDivElement>();
const currentPage = ref(props.currentPage);

const handleScroll = e => {
  const len = props.imgList.length;
  if (len < 2) {
    return;
  }
  const allHeight = e.target.scrollHeight;
  const itemHeight = allHeight / len;
  const val = Math.ceil(e.target.scrollTop / itemHeight) + 1;
  if (val != currentPage.value && val <= len) {
    currentPage.value = val;
    emit("update:currentPage", currentPage.value);
    //console.log("val", val);
  }
};

function onChangePage({ currentPage }) {
  emit("changePage", { currentPage });
}

function goToPage(currentPage: number) {}

function getSignDivHtml(): string {
  //只返回第一行的
  const item = scrollArea.value.children[0];
  return item.children[item.children.length - 1].outerHTML;
}

defineExpose({ goToPage, getSignDivHtml });

onMounted(() => {
  watch(
    () => props.currentPage,
    val => {
      if (val === currentPage.value || val > props.imgList.length) {
        return;
      }

      const allHeight = scrollArea.value.scrollHeight;
      const itemHeight = allHeight / props.imgList.length;
      console.log("allHeight", allHeight, "itemHeight", itemHeight);
      currentPage.value = val;
      scrollArea.value.scrollTop = (val - 1) * itemHeight;
    }
  );
});
</script>

<template>
  <div class="bq-img-viewer" element-loading-background="transparent">
    <div ref="scrollArea" class="items" @scrollend="handleScroll">
      <el-watermark
        v-for="{ url, index } in props.imgList"
        :key="index"
        class="item"
        :font="font"
        :content="[userName, new Date().toLocaleString()]"
      >
        <el-image :src="url" style="width: 100%" lazy />
        <el-image class="sign" src="/images/sign.png" lazy />
      </el-watermark>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bq-img-viewer {
  width: 100%;
  height: 100%;
}

.bq-img-viewer .items {
  display: fixed;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #e9e9e9;
}

.bq-img-viewer .items .item {
  width: v-bind(itemWidth);
  height: auto;
  aspect-ratio: 1 / 1.414;
  margin: 16px auto;
  background-color: #f8f8f8;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2);
}

.bq-img-viewer .items .item .sign {
  width: 20%;
  position: absolute;
  bottom: 10%;
  right: 10%;
  opacity: 0.3;
}
</style>
