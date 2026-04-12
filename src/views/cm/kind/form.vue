<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getKindEntityDefault } from "@/api/cm/kind";
import { usePublicHooks } from "../../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    ...getKindEntityDefault()
  })
});

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
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
    <el-form-item label="分类名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入分类名称"
      />
    </el-form-item>

    <el-form-item label="分类标识" prop="code">
      <el-input
        v-model="newFormInline.code"
        clearable
        placeholder="请输入分类标识"
      />
    </el-form-item>

    <el-form-item v-if="newFormInline.title === '新增'" label="分类状态">
      <el-switch
        v-model="newFormInline.status"
        inline-prompt
        :active-value="true"
        :inactive-value="false"
        active-text="启用"
        inactive-text="停用"
        :style="switchStyle"
      />
    </el-form-item>

    <el-form-item label="显示顺序" prop="orderValue">
      <el-input-number
        v-model="newFormInline.orderValue"
        clearable
        placeholder="请输入显示顺序"
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
