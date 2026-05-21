<script setup lang="ts">
import { getAuthInfoApi } from "@/api/system/user";
import { getTenantAuthInfoApi } from "@/api/system/tenant";
import { useSystemAuthinfo } from "@/views/auth/systemAuthInfo";
import { useTenantInfoStoreHook } from "@/store/modules/tenantInfo";
import { isPlatformTenant } from "@/utils/tenantInitData";
import { ref } from "vue";

defineOptions({
  name: "About"
});

const systemInfoRef = ref([]);
const authInfoRef = ref([]);
const tenantInfoStore = useTenantInfoStoreHook();

Promise.all([
  tenantInfoStore.loadTenantInfo(),
  isPlatformTenant() ? getAuthInfoApi() : getTenantAuthInfoApi()
]).then(([, res]) => {
  const { systemInfo, authInfo, isPlatform } = useSystemAuthinfo(res);
  systemInfoRef.value = systemInfo;
  authInfoRef.value = authInfo;
  pageTitle.value = isPlatform ? "平台信息" : "诊所信息";
  authTitle.value = isPlatform ? "平台授权" : "诊所授权";
});

const pageTitle = ref("系统信息");
const authTitle = ref("授权信息");
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
          <span class="font-bold">{{ pageTitle }}</span>
        </div>
      </template>
      <PureDescriptions border :columns="systemInfoRef" :column="2" />
    </el-card>

    <el-card class="m-4 box-card" shadow="never">
      <template #header>
        <div class="card-header flex items-center">
          <span class="font-bold">{{ authTitle }}</span>
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
