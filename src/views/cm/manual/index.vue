<script setup lang="ts">
import QcUpload from "@/views/qc/cqc/qcUpload.vue";
import { useRecord } from "./utils/hook";
import { ref, computed, nextTick, onMounted, h } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

import { Upload } from "@/components/ReCropper/src/svg";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { hasAuth } from "@/router/utils";
import { useRoute } from "vue-router";
import { addDialog } from "@/components/ReDialog";
import { uploadAttachment4OcrApi } from "@/api/cm/attachment";
import { message } from "@/utils/message";

defineOptions({
  name: "CMManual"
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
const route = useRoute();
const paths = ["/fcmgr/fcfm/index", "/mcmgr/mccm/index", "/mcmgr/mcoem/index"];
const captions = ["档案", "临床病案", "门急诊病案"];
const initKind = paths.indexOf(route.path);
const caption = captions[initKind];

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
} = useRecord(initKind, caption);

function uploadFile() {
  const uploadRef = ref();
  addDialog({
    title: "上传文件并根据分类规则生成病案或档案",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () =>
      h(QcUpload, {
        ref: uploadRef,
        formInline: {
          uploadType: 2,
          initKind: initKind,
          recordId: 0
        } as any
      }),
    beforeSure: (done, { options, index }) => {
      const formRef = uploadRef.value.getRef();
      const curData = uploadRef.value.getData() as any;
      formRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          //新建表单对象
          const formData = new FormData();
          for (let e of curData.fileList) {
            formData.append("fileList", e.raw);
          }
          await uploadAttachment4OcrApi(formData);
          message("上传成功", { type: "success" });
          onSearch();
          done(options, index);
        }
      });
    }
  });
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      v-auth="'manual:search'"
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
        :title="`${caption}管理`"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            v-auth="'manual:save'"
            type="default"
            :icon="useRenderIcon(Upload)"
            @click="uploadFile"
          >
            手动上传{{ caption }}
          </el-button>
          <el-button
            v-auth="'manual:save'"
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog('新建', { recordKind: initKind } as any)"
          >
            新建{{ caption }}
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
                v-if="hasAuth('manual:update')"
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
                v-if="hasAuth('manual:delete')"
                :title="`是否确认删除${caption}编码为${row.recordCode}的这条数据`"
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
