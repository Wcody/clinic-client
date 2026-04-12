<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getFieldAliasEntityDefault } from "@/api/system/alias";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    ...getFieldAliasEntityDefault()
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
    <el-form-item label="名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入名称"
      />
    </el-form-item>
    <el-form-item label="系统字段" prop="sysValue">
      <el-input
        v-model="newFormInline.sysValue"
        clearable
        placeholder="请输入系统字段"
      />
    </el-form-item>
    <el-form-item label="来源系统" prop="sourceSystem">
      <el-input
        v-model="newFormInline.sourceSystem"
        clearable
        placeholder="请输入来源系统"
      />
    </el-form-item>
    <el-form-item label="源名称：" prop="aliasType">
      <el-input
        v-model="newFormInline.aliasType"
        clearable
        placeholder="请输入源名称"
      />
    </el-form-item>
    <el-form-item label="源字段" prop="aliasValue">
      <el-input
        v-model="newFormInline.aliasValue"
        clearable
        placeholder="请输入源字段"
      />
    </el-form-item>
    <el-form-item label="排序" prop="seq">
      <el-input-number v-model="newFormInline.seq" placeholder="请输入排序" />
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
