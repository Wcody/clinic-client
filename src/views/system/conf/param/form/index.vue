<script setup lang="ts">
import { computed, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { getParamItemEntityDefault } from "@/api/system/param";
import { UploadProps } from "element-plus";
import UploadIcon from "@iconify-icons/ri/upload-line";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherDeptOptions: [],
    ...getParamItemEntityDefault()
  })
});

const uploadRef = ref();
const dialogVisibleRef = ref();
const dialogImageUrlRef = ref();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const fileListRef = ref([]);
const previewImage = computed(
  () => newFormInline.value.paramValue?.fileList?.[0]
);

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  fileListRef.value.length = 0;
};

const handlePictureCardPreview: UploadProps["onPreview"] = uploadFile => {
  dialogImageUrlRef.value = uploadFile.url!;
  dialogVisibleRef.value = true;
};

function getRef() {
  return ruleFormRef.value;
}

function getFileList() {
  return fileListRef.value;
}

defineExpose({ getRef, getFileList });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-row>
      <re-col>
        <el-form-item label="参数值" prop="paramValue">
          <el-input-number
            v-if="newFormInline.paramType === 1"
            v-model="newFormInline.paramValue.value"
            clearable
            placeholder="请输入参数值"
          />
          <img
            v-else-if="newFormInline.paramType === 3 && previewImage"
            class="w-[300px]"
            :src="'ams/mvc/v1/download/images/' + previewImage"
            alt="图片预览"
          />
          <el-empty
            v-else-if="newFormInline.paramType === 3"
            description="未设置"
            :image-size="80"
          />
          <el-input
            v-else
            v-model="newFormInline.paramValue.value"
            clearable
            placeholder="请输入参数值"
          />
        </el-form-item>
        <el-form-item
          v-if="newFormInline.paramType === 3"
          label="修改参数"
          prop="paramValue"
        >
          <el-upload
            ref="uploadRef"
            v-model:file-list="fileListRef"
            name="files"
            :limit="1"
            list-type="picture-card"
            accept=".jpg,.jpeg,.png,.bmp"
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
      <re-col>
        <el-form-item label="备注">
          <span class="text-sm">{{ newFormInline.paramDesc }}</span>
        </el-form-item>
      </re-col>
    </el-row>
    <el-dialog v-model="dialogVisibleRef">
      <img class="w-full" :src="dialogImageUrlRef" alt="图片预览" />
    </el-dialog>
  </el-form>
</template>

<style lang="scss" scoped>
.el-row .el-col {
  padding-right: 30px;
}

.el-row {
  padding-left: 24px;
}
</style>
