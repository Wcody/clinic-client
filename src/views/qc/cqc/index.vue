<script setup lang="ts">
import { useRecord } from "./utils/hook";
import { ref, computed, nextTick, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

import Upload from "@iconify-icons/ri/upload-line";
import Role from "@iconify-icons/ri/admin-line";
import Password from "@iconify-icons/ri/lock-password-line";
import More from "@iconify-icons/ep/more-filled";
import Trace from "@iconify-icons/ri/truck-line";
import View from "@iconify-icons/ri/eye-line";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

import { hasAuth } from "@/router/utils";
import {
  getActionKind,
  getInitKind,
  getActionKindTitles,
  getActions,
  getTitles
} from "@/utils/qc";
import { useRoute } from "vue-router";

defineOptions({
  name: "QCCQControl"
});

const iconClass = computed(() => {
  return [
    "w-[22px]",
    "h-[22px]",
    "flex",
    "justify-center",
    "items-center",
    "outline-none",
    "rounded-[4px]",
    "cursor-pointer",
    "transition-colors",
    "hover:bg-[#0000000f]",
    "dark:hover:bg-[#ffffff1f]",
    "dark:hover:text-[#ffffffd9]"
  ];
});

//获取路由路径
const initKind = getInitKind();
const actionKind = getActionKind();
const caption = initKind ? "病案" : "档案";

const formRef = ref();
const tableRef = ref();
const contentRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  viewDialog,
  traceDialog,
  qcDialog,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useRecord(initKind, caption);
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      v-auth="'record:search'"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item
        :label="`${initKind ? '患者' : '档案'}名称：`"
        prop="patientName"
      >
        <el-input
          v-model="form.patientName"
          :placeholder="`请输入${initKind ? '患者' : '档案'}名称`"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item :label="`${caption}编码：`" prop="recordCode">
        <el-input
          v-model="form.recordCode"
          :placeholder="`请输入${caption}编码`"
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

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        :class="['w-full']"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        :title="`${getTitles()[initKind]}(${getActionKindTitles()[actionKind]})`"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons />
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="dataList"
            :row-key="() => 'eid'"
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
                v-if="hasAuth('record:update')"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(Trace)"
                @click="traceDialog(row)"
              >
                示踪
              </el-button>
              <el-button
                v-if="hasAuth('record:update')"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(View)"
                @click="viewDialog(row)"
              >
                浏览
              </el-button>
              <el-button
                v-if="hasAuth('record:update')"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :disabled="false"
                :icon="useRenderIcon(Role)"
                @click="qcDialog(row, getActions()[actionKind])"
              >
                {{ getActionKindTitles()[actionKind] }}
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

.main-content {
  margin: 8px 8px 0 8px !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
