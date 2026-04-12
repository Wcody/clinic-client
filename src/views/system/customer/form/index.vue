<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../../hooks";
import { getCustomerEntityDefault } from "@/api/system/customer";
import { authTypeOptions } from "@/utils/dataconst";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherGroupOptions: [],
    ...getCustomerEntityDefault()
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
    <el-row>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="授权类型" prop="authType">
          <el-radio-group v-model="newFormInline.authType">
            <el-radio
              v-for="(item, index) in authTypeOptions"
              :key="index"
              :value="item.value"
              >{{ item.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="客户名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入登录账号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="负责人" prop="principal">
          <el-input
            v-model="newFormInline.principal"
            clearable
            placeholder="请输入用户姓名"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="newFormInline.phone"
            clearable
            placeholder="请输入手机号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="最大诊所数" prop="maxTenantCount">
          <el-input-number
            v-model="newFormInline.maxTenantCount"
            class="!w-full"
            :min="0"
            :max="500"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="诊所最大用户数" prop="maxUserCount">
          <el-input-number
            v-model="newFormInline.maxUserCount"
            class="!w-full"
            :min="0"
            :max="500"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="设备码" prop="deviceCode">
          <el-input
            v-model="newFormInline.deviceCode"
            type="textarea"
            class="!w-full"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="失效日期" prop="expireDate">
          <el-date-picker
            v-model="newFormInline.expireDate"
            type="date"
            class="!w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="归属客户组">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherGroupOptions"
            :props="{
              value: 'eid',
              label: 'name',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择归属客户组"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.title === '新增'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="客户状态">
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
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
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
</style>
