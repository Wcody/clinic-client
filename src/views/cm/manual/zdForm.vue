<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { zdformRules } from "./utils/rule";
import { ZDFormProps } from "./utils/types";
import { getDiagnosisDefault } from "@/api/cm/record";
import { rc005Options, rc027Options } from "@/utils/dataconst";

const props = withDefaults(defineProps<ZDFormProps>(), {
  initKind: 1,
  formInline: () => ({
    ...getDiagnosisDefault()
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
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="诊断编码" prop="C06x__C">
          <el-input
            v-model="newFormInline.C06x__C"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="诊断名称" prop="C07x__N">
          <el-input
            v-model="newFormInline.C07x__N"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="24" :xs="24" :sm="24">
        <el-form-item label="入院情况" prop="C08x__C">
          <el-select
            v-model="newFormInline.C08x__C"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc027Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="24" :xs="24" :sm="24">
        <el-form-item label="出院情况" prop="F06x__">
          <el-select
            v-model="newFormInline.F06x__"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc005Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
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
