<script setup lang="ts">
import { BqFlowConf } from "@/components/BqFlowConf";

defineOptions({
  name: "SysDFlow"
});
</script>

<template>
  <el-card
    class="h-[calc(100%-18px)]"
    body-class="h-full"
    header="审批流程设置"
  >
    <el-tabs :class="['h-full', 'm-0']" tab-position="left" lazy>
      <el-tab-pane label="归档流程设置">
        <BqFlowConf eid="57b4f5493b4c49b49c9fa9f7db4c8f5d" />
      </el-tab-pane>
      <el-tab-pane label="借阅流程设置" lazy
        ><BqFlowConf eid="9c8b9a524a534d67a1b23f9c9e4d5a6f"
      /></el-tab-pane>
      <el-tab-pane label="续借流程设置" lazy
        ><BqFlowConf eid="2b7d3f4a0f3411e898d69b1c8c6dffd5"
      /></el-tab-pane>
      <el-tab-pane label="封存流程设置" lazy
        ><BqFlowConf eid="6f9619ff8b7d42af9187a51ed22e9c5c"
      /></el-tab-pane>
      <el-tab-pane label="召回流程设置" lazy
        ><BqFlowConf eid="3e5e9f357b424a42a1f34c2a5e1c8b9b"
      /></el-tab-pane>
      <el-tab-pane label="打印流程设置" lazy
        ><BqFlowConf eid="9d1b02017c454a779ef76e66b77a6b38"
      /></el-tab-pane>
      <el-tab-pane label="复印流程设置" lazy
        ><BqFlowConf eid="4a5d8b6fe1d64a5ca3d4a5e1c8b9b2f3"
      /></el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped lang="scss"></style>
