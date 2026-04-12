<script setup lang="tsx">
import {
  NodeMouseEvent,
  useVueFlow,
  VueFlow,
  Node,
  Edge
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import SaveRestoreControls from "./Controls.vue";
import NodeStart from "./NodeStart.vue";
import NodeEnd from "./NodeEnd.vue";
import NodeRole from "./NodeRole.vue";
import NodeAnd from "./NodeAnd.vue";
import NodeOr from "./NodeOr.vue";

defineOptions({
  name: "BqFlow"
});

const props = withDefaults(
  defineProps<{
    nodes: Node<any, any, string>[];
    edges: Edge[];
  }>(),
  { nodes: () => [], edges: () => [] }
);

const { onInit, onNodeDragStop, onConnect, addEdges, setViewport, toObject } =
  useVueFlow();

onInit(vueFlowInstance => {
  vueFlowInstance.fitView();
});

onNodeDragStop(({ event, nodes, node }) => {
  console.log("Node Drag Stop", { event, nodes, node });
});

onConnect(connection => {
  addEdges(connection);
});

const handleNodeDoubleClick = (event: NodeMouseEvent) => {
  console.log("Node Double Click", event.node);
};
</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    fit-view-on-init
    @node-double-click="handleNodeDoubleClick"
  >
    <!-- <Controls /> -->
    <SaveRestoreControls />
    <Background pattern-color="#aaa" :gap="16" />
    <MiniMap />
    <template #node-start="props">
      <NodeStart :id="props.id" :data="props.data" />
    </template>
    <template #node-end="props">
      <NodeEnd :id="props.id" :data="props.data" />
    </template>
    <template #node-and="props">
      <NodeAnd :id="props.id" :data="props.data" />
    </template>
    <template #node-or="props">
      <NodeOr :id="props.id" :data="props.data" />
    </template>
    <template #node-role="props">
      <NodeRole :id="props.id" :data="props.data" />
    </template>
  </VueFlow>
</template>

<style lang="scss" scoped></style>
