<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import tree from "./tree.vue";
import { useTenant } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Role from "@iconify-icons/ri/admin-line";
import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Close from "@iconify-icons/ep/close";
import Check from "@iconify-icons/ep/check";
import Info from "@iconify-icons/ep/info-filled";
import { delay, subBefore, useResizeObserver } from "@pureadmin/utils";

defineOptions({
  name: "SystemTenant"
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

const treeRef = ref();
const formRef = ref();
const tableRef = ref();
const menuTreeRef = ref();
const contentRef = ref();
const treeHeight = ref();

const {
  form,
  curRow,
  isShow,
  loading,
  isLinkage,
  columns,
  rowStyle,
  dataList,
  treeData,
  menuTreeData,
  treeLoading,
  selectedNum,
  pagination,
  buttonClass,
  treeSearchValue,
  isExpandAll,
  isSelectAll,
  treeProps,
  deviceDetection,
  onSearch,
  resetForm,
  onbatchDel,
  openDialog,
  handleMenu,
  downloadAuth,
  handleSave,
  onTreeSelect,
  handleDelete,
  handleUser,
  handleSizeChange,
  onSelectionCancel,
  handleCurrentChange,
  handleSelectionChange,
  onQueryChanged,
  filterMethod,
  transformI18n
} = useTenant(tableRef, treeRef, menuTreeRef);

onMounted(() => {
  useResizeObserver(tableRef, async () => {
    await nextTick();
    delay(60).then(() => {
      treeHeight.value =
        parseFloat(
          subBefore(
            tableRef.value.getTableDoms().tableWrapper.style.height,
            "px"
          )
        ) - 8;
    });
  });
});
</script>

<template>
  <div
    ref="contentRef"
    :class="['flex', 'justify-between', deviceDetection() && 'flex-wrap']"
  >
    <tree
      ref="treeRef"
      :class="['mr-2', deviceDetection() ? 'w-full' : 'min-w-[200px]']"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
    <div
      :class="[
        deviceDetection() ? 'w-full' : '!w-[calc(100%-216px)]',
        'flex',
        'flex-col'
      ]"
    >
      <el-form
        ref="formRef"
        v-auth="'tenant:search'"
        :class="['!w-full']"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
      >
        <el-form-item label="诊所名称：" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入诊所名称"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="手机号码：" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号码"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择"
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
      <div :class="['w-full', 'flex']">
        <PureTableBar
          :title="`诊所管理(${form.parentName})`"
          :columns="columns"
          :class="[isShow ? '!w-[calc(60%-0px)]' : 'w-full']"
          @refresh="onSearch"
        >
          <template #buttons>
            <el-button
              v-auth="'tenant:save'"
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openDialog('新增', { parentId: form.parentId } as any)"
            >
              新增诊所
            </el-button>
          </template>
          <template v-slot="{ size, dynamicColumns }">
            <div
              v-if="selectedNum > 0"
              v-motion-fade
              class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
            >
              <div class="flex-auto">
                <span
                  style="font-size: var(--el-font-size-base)"
                  class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]"
                >
                  已选 {{ selectedNum }} 项
                </span>
                <el-button type="primary" text @click="onSelectionCancel">
                  取消选择
                </el-button>
              </div>
              <el-popconfirm title="是否确认删除?" @confirm="onbatchDel">
                <template #reference>
                  <el-button
                    v-auth="'tenant:delete'"
                    type="danger"
                    text
                    class="mr-1"
                  >
                    批量删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
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
                  v-auth="'tenant:update'"
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
                  :title="`是否确认删除诊所名称为${row.name}的这条数据`"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button
                      v-auth="'tenant:delete'"
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
                <el-dropdown>
                  <el-button
                    class="ml-3 mt-[2px]"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(More)"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <el-button
                          v-auth="'tenant:saveUserIds'"
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Role)"
                          @click="handleUser(row)"
                        >
                          设置管理员
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-button
                          v-auth="'tenant:saveMenuIds'"
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Role)"
                          @click="handleMenu(row)"
                        >
                          设置可用菜单
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="false">
                        <el-button
                          v-auth="'tenant:saveMenuIds'"
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Role)"
                          @click="downloadAuth(row)"
                        >
                          下载授权文件
                        </el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
        <div
          v-if="isShow"
          class="!w-[calc(40%-8px)] mt-2 px-2 pb-2 bg-bg_color ml-2 overflow-auto"
        >
          <div class="flex justify-between w-full px-3 pt-5 pb-4">
            <div class="flex">
              <span :class="iconClass">
                <IconifyIconOffline
                  v-tippy="{
                    content: '关闭'
                  }"
                  class="dark:text-white"
                  width="18px"
                  height="18px"
                  :icon="Close"
                  @click="handleMenu"
                />
              </span>
              <span :class="[iconClass, 'ml-2']">
                <IconifyIconOffline
                  v-tippy="{
                    content: '保存可用菜单'
                  }"
                  class="dark:text-white"
                  width="18px"
                  height="18px"
                  :icon="Check"
                  @click="handleSave"
                />
              </span>
            </div>
            <p class="font-bold truncate">
              可用菜单
              {{ `${curRow?.name ? `（${curRow.name}）` : ""}` }}
            </p>
          </div>
          <el-input
            v-model="treeSearchValue"
            placeholder="请输入菜单进行搜索"
            class="mb-1"
            clearable
            @input="onQueryChanged"
          />
          <div class="flex flex-wrap">
            <el-checkbox v-model="isExpandAll" label="展开/折叠" />
            <el-checkbox v-model="isSelectAll" label="全选/全不选" />
            <el-checkbox v-model="isLinkage" label="父子联动" />
          </div>
          <el-tree-v2
            ref="menuTreeRef"
            show-checkbox
            :data="menuTreeData"
            :props="treeProps"
            :height="treeHeight"
            :check-strictly="!isLinkage"
            :filter-method="filterMethod"
          >
            <template #default="{ node }">
              <span style="padding-right: 10px">{{
                transformI18n(node.label)
              }}</span>
              <IconifyIconOffline
                v-if="node.data.remark"
                v-tippy="{
                  content: node.data.remark
                }"
                style="color: #409eff"
                width="16px"
                height="16px"
                :icon="Info"
                @click="handleSave"
              />
            </template>
          </el-tree-v2>
        </div>
      </div>
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
