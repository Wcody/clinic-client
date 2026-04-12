<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { ssformRules } from "./utils/rule";
import { SSFormProps } from "./utils/types";
import { getShoushuItemDefault } from "@/api/cm/record";
import {
  rc013Options,
  rc014Options,
  rc024Options,
  rc029Options
} from "@/utils/dataconst";

const props = withDefaults(defineProps<SSFormProps>(), {
  initKind: 1,
  formInline: () => ({
    ...getShoushuItemDefault()
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
    :rules="ssformRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-row>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手术操作编码" prop="pso1">
          <el-input
            v-model="newFormInline.pso1"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手术操作名称" prop="pso2">
          <el-input
            v-model="newFormInline.pso2"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row>
      <re-col :value="8" :xs="24" :sm="24">
        <el-form-item label="手术操作日期" prop="pso3">
          <el-date-picker
            v-model="newFormInline.pso3"
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
        <el-form-item label="手术操作级别" prop="pso4">
          <el-select
            v-model="newFormInline.pso4"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc029Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="8" :xs="24" :sm="24">
        <el-form-item label="手术持续时间" prop="pso5">
          <el-input-number
            v-model="newFormInline.pso5"
            :min="0"
            :max="99999"
            clearable
            placeholder="请输入"
          /><span class="ml-[10px] mr-[20px]">时</span>
        </el-form-item>
      </re-col>
    </el-row>
    <el-row>
      <re-col :value="8" :xs="24" :sm="24">
        <el-form-item label="手术操作术者" prop="pso6">
          <el-input
            v-model="newFormInline.pso6"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="8" :xs="24" :sm="24">
        <el-form-item label="手术操作Ⅰ助" prop="pso7">
          <el-input
            v-model="newFormInline.pso7"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="8" :xs="24" :sm="24">
        <el-form-item label="手术操作Ⅱ助" prop="pso8">
          <el-input
            v-model="newFormInline.pso8"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row>
      <re-col v-if="initKind == 1" :value="6" :xs="24" :sm="24">
        <el-form-item label="手术操作切口愈合等级" prop="pso9">
          <el-select
            v-model="newFormInline.pso9"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc014Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :value="6" :xs="24" :sm="24">
        <el-form-item label="手术操作麻醉方式" prop="pso10">
          <el-select
            v-model="newFormInline.pso10"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc013Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col v-if="initKind == 1" :value="6" :xs="24" :sm="24">
        <el-form-item label="手术麻醉分级" prop="pso11">
          <el-select
            v-model="newFormInline.pso11"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rc024Options"
              :key="item.value"
              :label="`${item.value} - ${item.label}`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :value="6" :xs="24" :sm="24">
        <el-form-item label="手术操作麻醉医师" prop="pso12">
          <el-input
            v-model="newFormInline.pso12"
            clearable
            placeholder="请输入"
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
