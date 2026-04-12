<script setup lang="ts">
import { ref } from "vue";
import { useGroup } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { useRoute } from "vue-router";

defineOptions({
  name: "SystemTenantGroup"
});

const route = useRoute();
const initKind = route.fullPath == "/sysm/group/index" ? 0 : 1;

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSelectionChange,
  getTitle
} = useGroup(initKind);
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      v-auth="'group:search'"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="getTitle() + '名称：'" prop="name">
        <el-input
          v-model="form.name"
          :placeholder="'请输入' + getTitle() + '名称'"
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
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
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

    <PureTableBar
      :title="getTitle() + '管理'"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'group:save'"
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增', { kindId: initKind } as any)"
        >
          {{ "新增" + getTitle() }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          border
          stripe
          :adaptiveConfig="{ offsetBottom: 45 }"
          align-whole="center"
          row-key="eid"
          showOverflowTooltip
          table-layout="auto"
          default-expand-all
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
        >
          <template #operation="{ row }">
            <el-button
              v-auth="'group:update'"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-button
              v-auth="'group:save'"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(AddFill)"
              @click="
                openDialog('新增', {
                  parentId: row.eid,
                  kindId: initKind
                } as any)
              "
            >
              新增
            </el-button>
            <el-popconfirm
              :title="`是否确认删除${getTitle()}名称为${row.name}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  v-auth="'group:delete'"
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
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
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
