<script setup lang="ts">
import { ref, watchEffect } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../../hooks";
import { getUserEntityDefault } from "@/api/system/user";
import { useIsPlatformTenant } from "@/utils/tenantInitData";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherDeptOptions: [],
    ...getUserEntityDefault()
  })
});

const sexOptions = [
  {
    value: 0,
    label: "未知"
  },
  {
    value: 1,
    label: "男"
  },
  {
    value: 2,
    label: "女"
  }
];
const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);
const isPlatformTenant = useIsPlatformTenant();

watchEffect(() => {
  if (!isPlatformTenant.value) {
    newFormInline.value.tenantInitData = false;
  }
});

function getRef() {
  return ruleFormRef.value;
}

function isFromUserInfo() {
  return newFormInline.value.eid && !newFormInline.value.account;
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
      <re-col v-if="!isFromUserInfo()" :value="12" :xs="24" :sm="24">
        <el-form-item label="登录账号" prop="account">
          <el-input
            v-model="newFormInline.account"
            clearable
            placeholder="请输入登录账号"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="!isFromUserInfo() && newFormInline.title === '新增'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="newFormInline.password"
            clearable
            placeholder="请输入登录密码"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="!isFromUserInfo()" :value="12" :xs="24" :sm="24">
        <el-form-item label="用户姓名" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入用户姓名"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="用户昵称" prop="nickname">
          <el-input
            v-model="newFormInline.nickname"
            clearable
            placeholder="请输入用户昵称"
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
        <el-form-item label="用户性别">
          <el-select
            v-model="newFormInline.sex"
            placeholder="请选择用户性别"
            class="w-full"
            clearable
          >
            <el-option
              v-for="(item, index) in sexOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col v-if="!isFromUserInfo()" :value="12" :xs="24" :sm="24">
        <el-form-item label="归属科室">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherDeptOptions"
            :props="{
              value: 'eid',
              label: 'name',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择归属科室"
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
        <el-form-item label="用户状态">
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
      <re-col
        v-if="isPlatformTenant && !isFromUserInfo()"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="租户初始化数据">
          <el-switch
            v-model="newFormInline.tenantInitData"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
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
