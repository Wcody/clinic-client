<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { CollapseModelValue } from "element-plus";
import _ from "lodash";
import { rc011Options } from "@/utils/dataconst";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const activeNames = ref(["1", "2", "3"]);
const handleChange = (val: CollapseModelValue) => {
  console.log(val);
};
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
    :rules="formRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item name="1">
        <template #title>
          <span class="item-title">基本信息</span>
        </template>
        <el-row>
          <re-col :value="12" :xs="24" :sm="12">
            <el-form-item label="档案号" prop="recordCode">
              <el-input
                v-model="newFormInline.recordCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="12">
            <el-form-item label="档案名称" prop="patientName">
              <el-input
                v-model="newFormInline.patientName"
                clearable
                placeholder="请输入姓名"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span class="item-title">质控信息</span>
        </template>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="一级质控" prop="qualityControlNurse">
              <el-input
                v-model="newFormInline.qualityControlNurse"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="二级质控" prop="qualityControlPhysician">
              <el-input
                v-model="newFormInline.qualityControlPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="档案质量" prop="residentPhysicianCode">
              <el-select
                v-model="newFormInline.residentPhysicianCode"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc011Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="质控日期" prop="residentPhysician">
              <el-date-picker
                v-model="newFormInline.residentPhysician"
                type="date"
                placeholder="请选择"
                clearable
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                date-format="YYYY-MM-DD"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <span class="item-title">其他信息</span>
        </template>
        <el-row>
          <re-col :value="24" :xs="24" :sm="12">
            <el-form-item label="备注">
              <el-input
                v-model="newFormInline.remark"
                :maxlength="200"
                show-word-limit
                placeholder="请输入备注信息"
                type="textarea"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
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

<style lang="scss">
.el-collapse-item__header {
  background-color: rgb(64 149 255 / 5%);
}

.el-collapse-item__header.is-active {
  background-color: rgb(64 149 255 / 0);
}
</style>
