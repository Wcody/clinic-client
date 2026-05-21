<script setup lang="ts">
import { ref } from "vue";
import { useSystemAuthinfo } from "./systemAuthInfo";
import { getAuthInfoApi } from "@/api/system/user";
import { useTenantInfoStoreHook } from "@/store/modules/tenantInfo";

defineOptions({
  name: "SysAuthorization"
});

const systemInfoRef = ref([]);
const authInfoRef = ref([]);
const tenantInfoStore = useTenantInfoStoreHook();

Promise.all([tenantInfoStore.loadTenantInfo(), getAuthInfoApi()]).then(([, res]) => {
  const { systemInfo, authInfo, isPlatform } = useSystemAuthinfo(res);
  systemInfoRef.value = systemInfo;
  authInfoRef.value = authInfo;
  pageTitle.value = isPlatform ? "平台信息" : "诊所信息";
  authTitle.value = isPlatform ? "平台授权" : "诊所授权";
});

const pageTitle = ref("系统信息");
const authTitle = ref("授权信息");

function goBack() {
  window.location.href = "/";
}
</script>

<template>
  <div style="max-height: 100vh; overflow-y: auto">
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

    <div class="flex justify-center">
      <el-button type="primary" @click="goBack">进入系统</el-button>
    </div>
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
