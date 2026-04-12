<script setup lang="ts">
import { Panel, useVueFlow } from "@vue-flow/core";
import Icon from "./Icon.vue";

const { zoomOut, zoomIn, fitView } = useVueFlow();

function onZoomOut() {
  zoomOut();
}

function onZoomIn() {
  zoomIn();
}

function onZoomFit() {
  fitView();
}
</script>

<template>
  <Panel position="top-left">
    <div class="buttons">
      <button title="放大" @click="onZoomIn">
        <Icon name="zoom-in" />
      </button>
      <button title="缩小" @click="onZoomOut">
        <Icon name="zoom-out" />
      </button>
      <button title="最佳视图" @click="onZoomFit">
        <Icon name="zoom-fit" />
      </button>
    </div>
  </Panel>
</template>
