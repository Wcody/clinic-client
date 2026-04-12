<script setup lang="ts">
import { ref } from "vue";
import { useUserOnline } from "./hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Plane from "@iconify-icons/ri/plane-line";
import Refresh from "@iconify-icons/ep/refresh";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "OnlineUser"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  onSearch,
  resetForm,
  handleOffline,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useUserOnline();
</script>

<template>
  <div class="main">
    <el-form
      v-if="hasAuth('user:onlineList')"
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="用户名" prop="account">
        <el-input
          v-model="form.account"
          placeholder="请输入用户名"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="IP" prop="ip">
        <el-input
          v-model="form.ip"
          placeholder="请输入用户名"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="在线用户" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          border
          stripe
          :adaptiveConfig="{ offsetBottom: 40 }"
          :data="dataList"
          :columns="dynamicColumns"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-popconfirm
              :title="`是否强制下线${row.account}`"
              @confirm="handleOffline(row)"
            >
              <template #reference>
                <el-button
                  v-if="hasAuth('user:kickOut')"
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Plane)"
                >
                  强退
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 8px 8px 0 8px !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
