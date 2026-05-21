<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getRoleEntityDefault } from "@/api/system/role";
import { usePublicHooks } from "../../hooks";
import { useIsPlatformTenant } from "@/utils/tenantInitData";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    ...getRoleEntityDefault()
  })
});

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
    <el-form-item label="角色名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色标识" prop="code">
      <el-input
        v-model="newFormInline.code"
        clearable
        placeholder="请输入角色标识"
      />
    </el-form-item>

    <el-form-item label="密级" prop="status">
      <el-select v-model="newFormInline.secretLevel" placeholder="请选择密级">
        <el-option label="公开(没有密级限制)" :value="0" />
        <el-option label="内部(初级密级限制)" :value="1" />
        <el-option label="秘密(中级密级限制)" :value="2" />
        <el-option label="机密(高级密级限制)" :value="3" />
        <el-option label="绝密(特级密级限制)" :value="4" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="newFormInline.title === '新增'" label="角色状态">
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

    <el-form-item v-if="isPlatformTenant" label="租户初始化数据">
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
