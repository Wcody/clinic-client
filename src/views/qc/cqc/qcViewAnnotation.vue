<script setup lang="ts">
import QcEditAnnotation from "./qcEditAnnotation.vue";
import { h, onMounted, ref, watch } from "vue";
import {
  AnnotationFormItem,
  AnnotationFormProps,
  FormProps
} from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import DeleteIcon from "@iconify-icons/ri/delete-bin-line";
import EditIcon from "@iconify-icons/ri/edit-2-line";
import FixedIcon from "@iconify-icons/ri/firefox-line";
import { addDialog } from "@/components/ReDialog";
import { ElSelect } from "element-plus";
import {
  addAnnotationApi,
  deleteAnnotationApi,
  fixByAnnotationIdApi,
  getAnnotationEntityDefault,
  getAnnotationListAttachmentIdApi,
  getTotalPointsApi,
  updateAnnotationApi
} from "@/api/cm/annotation";
import { message } from "@/utils/message";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const viewType = props.otherInfo?.type || "view";
const isQc = viewType === "qc";

const emit = defineEmits(["update:totalPoints"]);

const selectKeyNodeIndexRef = ref(0);
const annotationListRef = ref([]);

async function refreshList() {
  const res = await getAnnotationListAttachmentIdApi(
    props.formInline.selectNodeId as string
  );
  annotationListRef.value = res.data || [];
  const res2 = await getTotalPointsApi(props.formInline.eid as string);
  const points = res2.data || 0;
  emit("update:totalPoints", 100 - (points as number));
}

function onAnnotationClick(index) {
  selectKeyNodeIndexRef.value = index;
}

function addAnotation(row) {
  const annotationRef = ref();
  addDialog({
    title: "添加批注",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () => {
      return h(QcEditAnnotation, {
        ref: annotationRef,
        formInline: getAnnotationEntityDefault(row)
      });
    },
    beforeSure: async (done, { options, index }) => {
      const formRef = annotationRef.value.getRef();
      const curData = annotationRef.value.getData() as AnnotationFormItem;
      curData.recordId = props.formInline.eid;
      curData.attachmentId = props.formInline.selectNodeId as string;

      formRef.validate(async valid => {
        if (valid) {
          await addAnnotationApi(curData);
          message("添加批注成功", { type: "success" });
          refreshList();
          done(options, index);
        }
      });
    }
  });
}

async function fixAnotation(row) {
  const res = await fixByAnnotationIdApi(row.eid);
  if (res) {
    refreshList();
    message("修复成功", { type: "success" });
  }
}

async function delAnotation(row) {
  const res = await deleteAnnotationApi(row.eid);
  if (res) {
    refreshList();
    message("删除成功", { type: "success" });
  }
}

function editAnotation(row) {
  const annotationRef = ref();
  addDialog({
    title: "编辑批注",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () => {
      return h(QcEditAnnotation, {
        ref: annotationRef,
        formInline: getAnnotationEntityDefault(row)
      });
    },
    beforeSure: async (done, { options, index }) => {
      const formRef = annotationRef.value.getRef();
      const curData = annotationRef.value.getData() as AnnotationFormItem;
      formRef.validate(async valid => {
        if (valid) {
          await updateAnnotationApi(curData);
          message("编辑批注成功", { type: "success" });
          refreshList();
          done(options, index);
        }
      });
    }
  });
}

onMounted(() => {
  watch(
    () => props.formInline.selectNodeId,
    () => {
      refreshList().then();
    }
  );
});

defineExpose({
  addAnotation
});
</script>

<template>
  <div class="w-full h-full overflow-auto p-[10px]">
    <el-empty
      v-if="annotationListRef.length < 1"
      description="暂无数据"
      :image-size="60"
    />
    <el-space
      v-else
      direction="vertical"
      class="h-full w-full overflow-auto parent-root"
    >
      <el-card
        v-for="(item, index) in annotationListRef"
        :key="index"
        class="w-full"
        :style="{
          background:
            selectKeyNodeIndexRef == index
              ? 'var(--el-color-primary-light-8)'
              : ''
        }"
        @click="onAnnotationClick(index)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <span style="color: midnightblue">批注{{ index + 1 }}</span>
            <el-space>
              <el-popconfirm
                v-if="!item.fixer && isQc"
                title="确认修复该批注信息吗?"
                confirm-button-text="修复"
                @confirm="fixAnotation(item)"
              >
                <template #reference>
                  <el-button
                    type="primary"
                    size="small"
                    :icon="useRenderIcon(FixedIcon)"
                    >确认修复</el-button
                  >
                </template>
              </el-popconfirm>
              <el-button
                v-if="!item.fixer && isQc"
                type="primary"
                link
                title="编辑批注"
                :icon="useRenderIcon(EditIcon)"
                @click="editAnotation(item)"
              />
              <el-popconfirm
                v-if="isQc"
                title="确认删除该批注信息吗?"
                confirm-button-text="删除"
                confirm-button-type="danger"
                @confirm="delAnotation(item)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    title="删除批注"
                    :icon="useRenderIcon(DeleteIcon)"
                  />
                </template>
              </el-popconfirm>
            </el-space>
          </div>
        </template>
        <div class="flex flex-col gap-[8px]">
          <el-space v-if="false">
            <el-input v-model="item.x" placeholder="x" />
            <el-input v-model="item.y" placeholder="x" />
            <el-input v-model="item.w" placeholder="x" />
            <el-input v-model="item.h" placeholder="x" />
          </el-space>
          <div class="flex items-center justify-between">
            <span>{{ item.createdBy }}</span>
            <span>{{ item.createdTime }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span
              ><span class="title min-width">扣分：</span
              >{{ item.deductionPoints }}</span
            >
            <span
              class="flex items-center text-color"
              :style="{
                color: item.fixer
                  ? 'var(--el-color-success)'
                  : 'var(--el-color-danger)'
              }"
              ><div
                class="circle"
                :style="{
                  backgroundColor: item.fixer
                    ? 'var(--el-color-success)'
                    : 'var(--el-color-danger)'
                }"
              />
              {{ item.fixer ? "已修复" : "未修复" }}</span
            >
          </div>
          <div class="flex">
            <span class="title min-width">批注项目：</span>
            <span>{{ item.annotationItem }}</span>
          </div>
          <div class="flex">
            <span class="title min-width">批注内容：</span>
            <span>{{ item.annotationContent }}</span>
          </div>
          <div class="flex">
            <span class="title min-width">备注：</span>
            <span>{{ item.remark }}</span>
          </div>
        </div>
      </el-card>
    </el-space>
  </div>
</template>

<style lang="scss">
.parent-root .el-space__item {
  width: 100%;
}

.parent-root .title {
  color: gray;
}

.parent-root .title.min-width {
  min-width: 70px;
}

.parent-root .circle {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
  border-radius: 50%;
}

.parent-root .text-color {
  color: var(--el-color-success);
}
</style>
