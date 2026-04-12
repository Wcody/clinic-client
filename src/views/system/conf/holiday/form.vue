<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getHolidayEntityDefault } from "@/api/system/holiday";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    ...getHolidayEntityDefault()
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
    <el-form-item label="名称" prop="holidayName">
      <el-input
        v-model="newFormInline.holidayName"
        clearable
        placeholder="请输入名称"
      />
    </el-form-item>
    <el-form-item label="日期" prop="holidayDate">
      <el-date-picker
        v-model="newFormInline.holidayDate"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        clearable
        placeholder="请输入日期"
      />
    </el-form-item>
    <el-form-item label="每年循环" prop="recurring">
      <el-switch
        v-model="newFormInline.recurring"
        active-text="是"
        inactive-text="否"
      />
    </el-form-item>
    <el-form-item label="工作日" prop="workday">
      <el-switch
        v-model="newFormInline.workday"
        active-text="是"
        inactive-text="否"
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
