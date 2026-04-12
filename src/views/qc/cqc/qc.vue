<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { useRenderFlicker } from "@/components/ReFlicker";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import ArrowRight from "@iconify-icons/ri/arrow-right-double-line";
import ArrowLeft from "@iconify-icons/ri/arrow-left-double-line";

const props = defineProps<FormProps>();

const divLeftRef = ref<HTMLDivElement>();
const divRightRef = ref<HTMLDivElement>();
const defaulSidetWidth = 400;
const spliterWidth = 4;
const leftSideWidthRef = ref(defaulSidetWidth);
const rightSideWidthRef = ref(defaulSidetWidth);
const isMoving = ref({ left: false, right: false });
const leftSideCssWidthRef = computed(() => {
  return `${leftSideWidthRef.value}px`;
});
const rightSideCssWidthRef = computed(() => {
  return `${rightSideWidthRef.value}px`;
});
const leftSideCssDisplayRef = computed(() => {
  return leftSideWidthRef.value < 50 ? "none" : "block";
});
const rightSideCssDisplayRef = computed(() => {
  return rightSideWidthRef.value < 50 ? "none" : "block";
});
const leftBarStyleRef = computed(() => {
  return {
    left:
      (leftSideCssDisplayRef.value == "none" ? 0 : leftSideWidthRef.value) +
      spliterWidth +
      "px"
  };
});
const rightBarStyleRef = computed(() => {
  return {
    right:
      (rightSideCssDisplayRef.value == "none" ? 0 : rightSideWidthRef.value) +
      spliterWidth +
      "px"
  };
});
const leftIconRef = computed(() => {
  return markRaw(
    useRenderIcon(
      leftSideCssDisplayRef.value == "none" ? ArrowRight : ArrowLeft
    )
  );
});
const rightIconRef = computed(() => {
  return markRaw(
    useRenderIcon(
      rightSideCssDisplayRef.value == "none" ? ArrowLeft : ArrowRight
    )
  );
});
const newFormInline = ref(props.formInline);
const departmentKindNames = ["所属", "住院", "就诊"];
const clientHeightRef = ref("calc(100vh - 85px)");
const clientWidthRef = computed(() => {
  return `calc(100% - ${(leftSideCssDisplayRef.value == "none" ? 0 : leftSideWidthRef.value) + (rightSideCssDisplayRef.value == "none" ? 0 : rightSideWidthRef.value) + spliterWidth * 2}px)`;
});

const resizeObserver = new ResizeObserver(() => {
  if (props.headerRef.value) {
    clientHeightRef.value = `calc(100vh - ${props.headerRef.value.getHeaderRef().value.clientHeight + 53}px)`;
  }
});

const onLeftSplitterMouseDown = (e: MouseEvent) => {
  const oldX = e.clientX;
  const oldWidth = divLeftRef.value?.offsetWidth || 0;
  const oldCursor = document.body.style.cursor;
  document.body.style.cursor = "col-resize";
  document.onmousemove = e => {
    isMoving.value.left = true;
    leftSideWidthRef.value = Math.min(
      Math.max(oldWidth + (e.clientX - oldX), 0),
      600
    );
    e.preventDefault();
    e.stopPropagation();
  };
  document.onmouseup = () => {
    isMoving.value.left = false;
    document.onmousemove = null;
    document.onmouseup = null;
    document.body.style.cursor = oldCursor;
    e.preventDefault();
    e.stopPropagation();
  };
  e.preventDefault();
  e.stopPropagation();
};

const onRightSplitterMouseDown = (e: MouseEvent) => {
  const oldX = e.clientX;
  const oldWidth = divRightRef.value?.offsetWidth || 0;
  const oldCursor = document.body.style.cursor;
  document.body.style.cursor = "col-resize";
  document.onmousemove = e => {
    isMoving.value.right = true;
    rightSideWidthRef.value = Math.min(
      Math.max(oldWidth - (e.clientX - oldX), 0),
      600
    );
    e.preventDefault();
    e.stopPropagation();
  };
  document.onmouseup = () => {
    isMoving.value.right = false;
    document.onmousemove = null;
    document.onmouseup = null;
    document.body.style.cursor = oldCursor;
    e.preventDefault();
    e.stopPropagation();
  };
  e.preventDefault();
  e.stopPropagation();
};

onMounted(() => {
  resizeObserver.observe(props.headerRef.value.getHeaderRef().value);
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});

function leftBarClick() {
  if (leftSideCssDisplayRef.value == "none") {
    leftSideWidthRef.value = defaulSidetWidth;
  } else {
    leftSideWidthRef.value = 0;
  }
}

function rightBarClick() {
  if (rightSideCssDisplayRef.value == "none") {
    rightSideWidthRef.value = defaulSidetWidth;
  } else {
    rightSideWidthRef.value = 0;
  }
}

function showDetail() {
  console.log("showDetail");
}

function uploadFile() {
  console.log("uploadFile");
}

function switchViewMode() {
  console.log("switchViewMode");
}

function reCollect() {
  console.log("reCollect");
}

function doCollect() {
  console.log("doCollect");
}

defineExpose({
  showDetail,
  uploadFile,
  switchViewMode,
  reCollect,
  doCollect
});
</script>

<template>
  <div class="full-main">
    <div ref="divLeftRef" class="left-side">left</div>
    <div class="left-spliter" @mousedown="onLeftSplitterMouseDown" />
    <div class="client" />
    <div class="right-spliter" @mousedown="onRightSplitterMouseDown" />
    <div ref="divRightRef" class="right-side">right</div>
    <el-button
      class="left-bar"
      style="font-size: 20px"
      type="primary"
      size="small"
      circle
      text
      :class="{ 'is-moving': isMoving.left }"
      :icon="leftIconRef"
      :style="leftBarStyleRef"
      @click="leftBarClick"
    />
    <el-button
      class="right-bar"
      style="font-size: 20px"
      type="primary"
      size="small"
      circle
      text
      :class="{ 'is-moving': isMoving.right }"
      :icon="rightIconRef"
      :style="rightBarStyleRef"
      @click="rightBarClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.full-main {
  position: relative;
  border-top: 1px solid #ebeef5;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  margin: auto;
  width: 100%;
  height: v-bind(clientHeightRef);
}

.left-side {
  display: v-bind(leftSideCssDisplayRef);
  box-sizing: border-box;
  width: v-bind(leftSideCssWidthRef);
}

.right-side {
  display: v-bind(rightSideCssDisplayRef);
  box-sizing: border-box;
  width: v-bind(rightSideCssWidthRef);
}

.left-spliter {
  overflow-x: hidden;
  cursor: col-resize;
  box-sizing: border-box;
  background-color: #ebeef5;
  width: 4px;
}

.right-spliter {
  overflow-x: hidden;
  cursor: col-resize;
  box-sizing: border-box;
  background-color: #ebeef5;
  width: 4px;
}

.left-bar {
  top: 40%;
  left: 20%;
  position: absolute;
}

.right-bar {
  top: 40%;
  right: 20%;
  position: absolute;
}

.is-moving {
  display: none;
}

.client {
  box-sizing: border-box;
  width: v-bind(clientWidthRef);
}
</style>
