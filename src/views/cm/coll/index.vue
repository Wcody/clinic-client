<script setup lang="ts">
import { useCollector } from "./utils/hook";
import { ref, computed, nextTick, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "MKind"
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
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useCollector();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      v-auth="'kind:search'"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="`采集器名称：`" prop="collectorName">
        <el-input
          v-model="form.collectorName"
          :placeholder="`请输入采集器名称`"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item :label="`IP地址：`" prop="remoteIp">
        <el-input
          v-model="form.remoteIp"
          :placeholder="`请输入IP地址`"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item :label="`电脑名称：`" prop="computerName">
        <el-input
          v-model="form.computerName"
          :placeholder="`请输入电脑名称`"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item :label="`设备ID：`" prop="deviceId">
        <el-input
          v-model="form.deviceId"
          :placeholder="`请输入设备ID`"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
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
        title="采集器列表"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            v-auth="'kind:save'"
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog('注册')"
          >
            注册采集器
          </el-button>
        </template>
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
                v-if="hasAuth('kind:update')"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('修改', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                v-if="hasAuth('kind:delete')"
                :title="`是否确认删除名称为${row.collectorName}的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(Delete)"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
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
