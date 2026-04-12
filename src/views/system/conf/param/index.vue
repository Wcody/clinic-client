<script setup lang="ts">
import { ref } from "vue";
import tree from "./tree.vue";
import { useParam } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import EditPenIcon from "@iconify-icons/ep/edit-pen";
import RefreshIcon from "@iconify-icons/ep/refresh";

defineOptions({
  name: "SysConfParam"
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  treeData,
  treeLoading,
  pagination,
  deviceDetection,
  onSearch,
  resetForm,
  onTreeSelect,
  handleUpdate,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useParam(tableRef, treeRef);
</script>

<template>
  <div :class="['flex', 'justify-between', deviceDetection() && 'flex-wrap']">
    <tree
      ref="treeRef"
      :class="['mr-2', deviceDetection() ? 'w-full' : 'min-w-[200px]']"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
    <div
      :class="[deviceDetection() ? ['w-full', 'mt-2'] : 'w-[calc(100%-200px)]']"
    >
      <el-form
        ref="formRef"
        v-auth="'paramItem:list'"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
      >
        <el-form-item label="参数名称" prop="paramName">
          <el-input
            v-model="form.paramName"
            placeholder="参数名称过滤"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
        <el-form-item label="参数描述过滤" prop="paramDesc">
          <el-input
            v-model="form.paramDesc"
            placeholder="参数描述搜索"
            clearable
            class="!w-[360px]"
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
          <el-button
            :icon="useRenderIcon(RefreshIcon)"
            @click="resetForm(formRef)"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <PureTableBar
        :title="`系统参数(${form.parentName})`"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons />
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            row-key="eid"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            align-whole="center"
            table-layout="auto"
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{
              color: 'var(--el-text-color-primary)'
            }"
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #operation="{ row }">
              <el-button
                v-auth="'paramItem:update'"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPenIcon)"
                @click="handleUpdate(row)"
              >
                修改
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep(.el-button:focus-visible) {
  outline: none;
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
