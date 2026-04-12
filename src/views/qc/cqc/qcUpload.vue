<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { UploadFormProps } from "./utils/types";
import { UploadProps } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import UploadIcon from "@iconify-icons/ri/upload-line";
import { getKindByKindListApi } from "@/api/cm/kind";

const props = defineProps<UploadFormProps>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
//默认图片上传
newFormInline.value.uploadType = 2;
const departmentKindNames = ["所属", "住院", "就诊"];
const optionsRef = ref();

const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const isAllKind = !newFormInline.value.recordId;

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  //console.log(uploadFile, uploadFiles);
};

const handlePictureCardPreview: UploadProps["onPreview"] = uploadFile => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

watch(
  () => newFormInline.value.uploadType,
  () => {
    newFormInline.value.fileList = [];
  }
);

onMounted(async () => {
  optionsRef.value = (
    await getKindByKindListApi(newFormInline.value.initKind)
  ).data;
});

function getRef() {
  return ruleFormRef.value;
}

function getData() {
  return newFormInline.value;
}

defineExpose({ getRef, getData });
</script>

<template>
  <div>
    <el-form
      ref="ruleFormRef"
      :model="newFormInline"
      :rules="formRules"
      label-position="top"
      style="max-height: 80vh; overflow-y: auto"
    >
      <el-row>
        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item
            v-if="!isAllKind"
            label="分类"
            prop="kindId"
            :rules="[{ required: true, message: '必填项' }]"
            ><el-select
              v-model="newFormInline.kindId"
              filterable
              placeholder="请选择一个分类"
            >
              <el-option
                v-for="item in optionsRef"
                :key="item.eid"
                :label="item.name"
                :value="item.eid"
              /> </el-select
          ></el-form-item>
        </re-col>
        <!-- <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="上传方式" prop="uploadType">
            <el-radio-group v-model="newFormInline.uploadType">
              <el-radio :value="1">PDF文件上传</el-radio>
              <el-radio :value="2">图片上传</el-radio>
            </el-radio-group>
          </el-form-item>
        </re-col> -->
        <re-col
          v-if="newFormInline.uploadType === 1"
          :value="24"
          :xs="24"
          :sm="24"
        >
          <el-form-item
            label="选择一个PDF文件"
            prop="fileList"
            :rules="[{ required: true, message: 'PDF文件不能为空' }]"
          >
            <el-upload
              ref="uploadRef"
              v-model:file-list="newFormInline.fileList"
              list-type="text"
              accept=".pdf"
              action="#"
              style="width: 100%"
              :limit="1"
              :auto-upload="false"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
            >
              <el-button
                v-if="!newFormInline.fileList?.length"
                type="primary"
                :icon="useRenderIcon(UploadIcon)"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </re-col>
        <re-col v-else :value="24" :xs="24" :sm="24">
          <el-form-item
            label="选择一个或多个图片"
            prop="fileList"
            :rules="[{ required: true, message: '图片不能为空' }]"
          >
            <el-upload
              ref="uploadRef"
              v-model:file-list="newFormInline.fileList"
              name="files"
              list-type="picture-card"
              accept=".jpg,.jpeg,.png,.bmp"
              drag
              multiple
              action="#"
              :auto-upload="false"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
            >
              <div class="el-upload__text">
                <IconifyIconOffline
                  :icon="UploadIcon"
                  width="32"
                  class="m-auto mb-2"
                />
                可点击或拖拽上传
              </div>
            </el-upload>
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
    <el-dialog v-model="dialogVisible">
      <img class="w-full" :src="dialogImageUrl" alt="图片预览" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.el-row .el-col {
  padding-right: 30px;
}

.el-row {
  padding-left: 24px;
}
</style>
