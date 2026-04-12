<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { getParamItemEntityDefault } from "@/api/system/param";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "修改",
    higherDeptOptions: [],
    ...getParamItemEntityDefault()
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
console.log("newFormInline", newFormInline.value);

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
    <el-row>
      <re-col>
        <el-form-item label="参数值" prop="paramValue">
          <el-radio-group v-model="newFormInline.paramValue.value">
            <el-radio
              v-for="(item, index) in newFormInline.paramConfig.options"
              :key="index"
              class="w-full"
              :value="item.value"
              >{{ item.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="备注">
          <span class="text-sm">{{ newFormInline.paramDesc }}</span>
        </el-form-item>
      </re-col>
    </el-row>
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
