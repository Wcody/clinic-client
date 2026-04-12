<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { zdformRules } from "./utils/rule";
import { ZZFormProps } from "./utils/types";
import { getZhongzhengDefault } from "@/api/cm/record";
import { rc015Options } from "@/utils/dataconst";

const props = withDefaults(defineProps<ZZFormProps>(), {
  initKind: 1,
  formInline: () => ({
    ...getZhongzhengDefault()
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

function getData() {
  return newFormInline.value;
}

defineExpose({ getRef, getData });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="zdformRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-row>
      <re-col :value="8" :xs="24" :sm="24">
        <el-form-item label="重症监护室名称" prop="C48x__C">
          <el-select
            v-model="newFormInline.C48x__C"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc015Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :value="8" :xs="24" :sm="24">
        <el-form-item label="进入时间" prop="C49x__">
          <el-date-picker
            v-model="newFormInline.C49x__"
            type="datetime"
            placeholder="请选择"
            clearable
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY-MM-DD"
            time-format="HH:mm:ss"
          />
        </el-form-item>
      </re-col>
      <re-col :value="8" :xs="24" :sm="24">
        <el-form-item label="退出时间" prop="C50x__">
          <el-date-picker
            v-model="newFormInline.C50x__"
            type="datetime"
            placeholder="请选择"
            clearable
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY-MM-DD"
            time-format="HH:mm:ss"
          />
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

.item-title {
  margin-left: 10px;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: bold;
  color: rgb(21 128 61);
}
</style>
