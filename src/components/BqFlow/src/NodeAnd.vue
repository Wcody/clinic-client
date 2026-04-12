<script setup>
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData
} from "@vue-flow/core";

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

const connections = useHandleConnections({
  type: "target"
});

const nodesData = useNodesData(() => connections.value[0]?.source);
console.log("nodesData", nodesData);
</script>

<template>
  <Handle type="source" :position="Position.Bottom" />
  <Handle type="target" :position="Position.Top" />

  <div class="node-content">
    <div class="label">{{ data.label }}</div>
  </div>
</template>

<style scoped>
.node-content {
  width: 50px;
  height: 50px;
  border: 2px solid #409eff;
  transform: rotate(45deg);
  background-color: white; /* 根据需要设置背景颜色 */
  display: flex; /* 启用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.node-content .label {
  transform: rotate(-45deg);
}
</style>
