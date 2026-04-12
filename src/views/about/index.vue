<script setup lang="ts">
import { getAuthInfoApi } from "@/api/system/user";
import { useSystemAuthinfo } from "@/views/auth/systemAuthInfo";
import { ref } from "vue";

defineOptions({
  name: "About"
});

const systemInfoRef = ref([]);
const authInfoRef = ref([]);

getAuthInfoApi().then(res => {
  const { systemInfo, authInfo } = useSystemAuthinfo(res);
  systemInfoRef.value = systemInfo;
  authInfoRef.value = authInfo;
});
</script>

<template>
  <div style="max-height: 80vh; overflow-y: auto">
    <!-- <el-card class="mb-4 box-card" shadow="never">
      <span>
        vue-pure-admin 是一款开源免费且开箱即用的中后台管理系统模版。完全采用
        ECMAScript 模块（ESM）规范来编写和组织代码，使用了最新的
        Vue3、Vite、Element-Plus、TypeScript、Pinia、Tailwindcss
        等主流技术开发。
      </span>
    </el-card> -->

    <el-card class="m-4 box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-bold">系统信息</span>
        </div>
      </template>
      <PureDescriptions border :columns="systemInfoRef" :column="2" />
    </el-card>

    <el-card class="m-4 box-card" shadow="never">
      <template #header>
        <div class="card-header flex items-center">
          <span class="font-bold">授权信息</span>
          <el-tag type="primary" effect="dark" size="small" round class="ml-1">
            {{ authInfoRef.length }}
          </el-tag>
        </div>
      </template>
      <PureDescriptions border :columns="authInfoRef" :column="2" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
:deep(.main-label) {
  font-size: 16px !important;
  color: var(--el-color-danger) !important;
}

:deep(.pure-version) {
  font-size: 14px !important;
  font-weight: 600 !important;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}

.main-content {
  margin: 0 !important;
}
</style>
<style lang="scss">
.el-descriptions__cell.label-fixed-width {
  width: 150px !important;
}

.el-descriptions__cell.content-fixed-width {
  width: calc(50% - 150px) !important;
}
</style>
