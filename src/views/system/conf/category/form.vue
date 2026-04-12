<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getCategoryMappingEntityDefault } from "@/api/system/category";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    ...getCategoryMappingEntityDefault()
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-form-item label="对照名称" prop="mappingName">
      <el-input
        v-model="newFormInline.mappingName"
        clearable
        placeholder="请输入对照名称"
      />
    </el-form-item>
    <el-form-item label="来源系统" prop="sourceSystem">
      <el-input
        v-model="newFormInline.sourceSystem"
        clearable
        placeholder="请输入来源系统"
      />
    </el-form-item>
    <el-form-item label="源分类编码" prop="otherCode">
      <el-input
        v-model="newFormInline.otherCode"
        clearable
        placeholder="请输入源分类编码"
      />
    </el-form-item>
    <el-form-item label="源分类名称" prop="otherName">
      <el-input
        v-model="newFormInline.otherName"
        clearable
        placeholder="请输入源分类名称"
      />
    </el-form-item>
    <el-form-item label="系统分类编码" prop="sysCode">
      <el-input
        v-model="newFormInline.sysCode"
        clearable
        placeholder="请输入系统分类编码"
      />
    </el-form-item>
    <el-form-item label="系统分类名称" prop="sysName">
      <el-input
        v-model="newFormInline.sysName"
        clearable
        placeholder="请输入系统分类名称"
      />
    </el-form-item>
    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
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
