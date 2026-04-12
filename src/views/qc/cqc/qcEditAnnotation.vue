<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { AnnotationFormProps } from "./utils/types";

const props = defineProps<AnnotationFormProps>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

onMounted(async () => {});

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
            label="批注分类"
            prop="annotationKind"
            :rules="[{ required: true, message: '必填项' }]"
            ><el-input
              v-model="newFormInline.annotationKind"
              clearable
              placeholder="请输入分类"
          /></el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item
            label="批注项目"
            prop="annotationItem"
            :rules="[{ required: true, message: '必填项' }]"
            ><el-input
              v-model="newFormInline.annotationItem"
              clearable
              placeholder="请输入项目"
          /></el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item
            label="扣分值"
            prop="deductionPoints"
            :rules="[{ required: true, message: '必填项' }]"
            ><el-input-number
              v-model="newFormInline.deductionPoints"
              :min="0"
              :max="100"
              placeholder="请输入扣分值"
          /></el-form-item>
        </re-col>
        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="批注内容" prop="annotationContent"
            ><el-input
              v-model="newFormInline.annotationContent"
              type="textarea"
              clearable
              placeholder="请输入批注内容"
          /></el-form-item>
        </re-col>
        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="备注" prop="remark"
            ><el-input
              v-model="newFormInline.remark"
              type="textarea"
              clearable
              placeholder="请输入备注"
          /></el-form-item>
        </re-col>
      </el-row>
    </el-form>
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
