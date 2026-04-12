<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === "zh" ? zhCn : en;
    }
  }
});
</script>
<style lang="scss">
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}

.vue-flow__handle {
  height: 12px;
  width: 12px;
  background: #ff0072;
  border-radius: 6px;
}

.vue-flow__handle:hover {
  background: #409eff;
}

.vue-flow__edges path {
  stroke-width: 3;
}

.vue-flow__node {
  display: flex; /* 启用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  background-color: transparent;
}

.vue-flow__node.selected .node-content {
  border: 2px solid blue;
}

.vue-flow__node:not(.selected):hover .node-content {
  border: 2px solid lightblue;
}

.vue-flow__node-and,
.vue-flow__node-or {
  height: 82px;
}

.vue-flow__node-start,
.vue-flow__node-end,
.vue-flow__node-role {
  height: 62px;
}

.vue-flow__panel {
  background-color: snow;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
}

.vue-flow__panel.left.top .buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vue-flow__panel button {
  border: none;
  cursor: pointer;
  background-color: white;
  border-radius: 8px;
  color: #777;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  width: 40px;
  height: 40px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vue-flow__panel button:hover {
  background-color: #409eff;
  color: white;
  transition: background-color 0.2s;
}

.vue-flow__panel button svg {
  width: 100%;
  height: 100%;
}
</style>
