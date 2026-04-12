<script setup lang="ts">
import { ref } from "vue";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { calculateAgeString, toDate } from "@/utils/date";
import { genderLables } from "@/utils/dataconst";

import InfoIcon from "@iconify-icons/ri/information-line";
import UploadIcon from "@iconify-icons/ri/upload-line";
import PdfModeIcon from "@iconify-icons/ri/file-pdf-2-line";
import ImageModeIcon from "@iconify-icons/ri/image-line";
import ReCollectIcon from "@iconify-icons/ri/restart-line";
import CollectIcon from "@iconify-icons/ri/star-line";
import CollectedIcon from "@iconify-icons/ri/star-fill";
import CloseIcon from "@iconify-icons/ri/close-line";

import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "质控",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const viewType = props.otherInfo?.type || "view";
const isQc = viewType === "qc";
const headerRef = ref();
const newFormInline = ref(props.formInline);
const newHeaderInfo = ref(props.headerInfo);
const departmentKindNames = ["所属", "住院", "就诊"];

function getHeaderRef() {
  return headerRef;
}

function getHeaderInfo() {
  return newHeaderInfo.value;
}

defineExpose({
  getHeaderRef,
  getHeaderInfo
});
</script>

<template>
  <div ref="headerRef" class="flex flex-row justify-between items-end">
    <el-space>
      <h4 :id="props.headerInfo.titleId" :class="props.headerInfo.titleClass">
        {{ props.formInline.caption + (viewType == "view" ? "浏览" : "质控") }}
      </h4>
      <el-button
        :icon="useRenderIcon(InfoIcon)"
        style="font-size: 20px"
        type="primary"
        size="small"
        title="详情"
        circle
        text
        @click="props.contentRef.value?.showDetail"
      />
    </el-space>
    <span>
      <span style="color: gray">病案号：</span>
      <span class="content">{{ props.formInline.recordCode }}</span>
    </span>
    <span>
      <span style="color: gray">患者：</span>
      <span class="content">{{ props.formInline.patientName }}</span>
    </span>
    <span>
      <span style="color: gray">性别：</span>
      <span class="content">{{ genderLables[props.formInline.gender] }}</span>
    </span>
    <span>
      <span style="color: gray">年龄：</span>
      <span class="content">{{
        calculateAgeString(
          toDate(props.formInline.dateOfBirth),
          toDate(props.formInline.admissionDate)
        )
      }}</span>
    </span>
    <span>
      <span style="color: gray">科室：</span>
      <span class="content">{{ props.formInline.department }}</span>
    </span>
    <span>
      <span style="color: gray">出院日期：</span>
      <span class="content">{{ props.formInline.dischargeDate }}</span>
    </span>
    <span>
      <span style="color: gray">住院次数：</span>
      <span class="content">{{ props.formInline.admissionCount }}</span>
    </span>
    <el-space>
      <el-button
        v-if="isQc"
        type="primary"
        plain
        :icon="useRenderIcon(UploadIcon)"
        @click="contentRef.value?.uploadFile"
      >
        上传
      </el-button>
      <el-button
        v-if="false"
        type="primary"
        plain
        :icon="useRenderIcon(PdfModeIcon)"
        @click="contentRef.value?.switchViewMode"
      >
        PDF模式
      </el-button>
      <el-button
        v-if="false"
        type="primary"
        plain
        :icon="useRenderIcon(ReCollectIcon)"
        @click="contentRef.value?.reCollect"
      >
        重采
      </el-button>
      <el-button
        v-if="false"
        type="primary"
        plain
        :icon="useRenderIcon(CollectIcon)"
        @click="contentRef.value?.doCollect"
      >
        收藏
      </el-button>
      <el-button
        type="danger"
        :icon="useRenderIcon(CloseIcon)"
        @click="props.headerInfo.close"
      >
        关闭
      </el-button>
    </el-space>
  </div>
</template>

<style lang="scss" scoped></style>
