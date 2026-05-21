<script setup lang="ts">
import { computed, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../../hooks";
import { getTenantEntityDefault } from "@/api/system/tenant";
import { authTypeOptions } from "@/utils/dataconst";
import { transformI18n } from "@/plugins/i18n";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherGroupOptions: [],
    ...getTenantEntityDefault()
  })
});

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);
const treeProps = {
  value: "eid",
  label: "title",
  children: "children"
};
const selectedMenuCount = computed(
  () => newFormInline.value.menuIds?.length ?? 0
);

function onMenuCheck(_data, checkedInfo) {
  newFormInline.value.menuIds = checkedInfo.checkedKeys || [];
}

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
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="诊所名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入诊所名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="负责人" prop="principal">
          <el-input
            v-model="newFormInline.principal"
            clearable
            placeholder="请输入负责人"
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
        <el-form-item label="最大用户数" prop="maxUserCount">
          <el-input-number
            v-model="newFormInline.maxUserCount"
            class="!w-full"
            :min="0"
            :max="500"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="false" :value="12" :xs="24" :sm="24">
        <el-form-item label="设备码" prop="deviceCode">
          <el-input
            v-model="newFormInline.deviceCode"
            class="!w-full"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="截止日期" prop="expireDate">
          <el-date-picker
            v-model="newFormInline.expireDate"
            type="datetime"
            class="!w-full"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择截止日期"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="归属诊所管理组">
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
            placeholder="请选择归属诊所管理组"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>
      <template v-if="newFormInline.title !== '新增'">
        <re-col :value="8" :xs="24" :sm="24">
          <el-form-item label="当前用户数">
            <el-input-number
              :model-value="newFormInline.currentUserCount ?? 0"
              class="!w-full"
              disabled
              controls-position="right"
            />
          </el-form-item>
        </re-col>
        <re-col :value="8" :xs="24" :sm="24">
          <el-form-item label="管理员数">
            <el-input-number
              :model-value="newFormInline.adminCount ?? 0"
              class="!w-full"
              disabled
              controls-position="right"
            />
          </el-form-item>
        </re-col>
        <re-col :value="8" :xs="24" :sm="24">
          <el-form-item label="菜单授权数">
            <el-input-number
              :model-value="newFormInline.menuCount ?? 0"
              class="!w-full"
              disabled
              controls-position="right"
            />
          </el-form-item>
        </re-col>
      </template>
      <re-col>
        <el-form-item label="菜单授权">
          <div
            class="w-full rounded-[4px] border border-[var(--el-border-color)]"
          >
            <div
              class="flex items-center justify-between border-b border-[var(--el-border-color)] px-3 py-2 text-sm text-[var(--el-text-color-secondary)]"
            >
              <span>已选 {{ selectedMenuCount }} 项</span>
            </div>
            <el-tree-v2
              show-checkbox
              :data="newFormInline.menuOptions"
              :props="treeProps"
              :height="260"
              :check-strictly="false"
              :default-checked-keys="newFormInline.menuIds"
              @check="onMenuCheck"
            >
              <template #default="{ node }">
                <span>{{ transformI18n(node.label) }}</span>
              </template>
            </el-tree-v2>
          </div>
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.title === '新增'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="诊所状态">
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
      <template v-if="newFormInline.title === '新增'">
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="初始管理员账号" prop="adminAccount">
            <el-input
              v-model="newFormInline.adminAccount"
              clearable
              placeholder="请输入初始管理员账号"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="初始管理员密码" prop="adminPassword">
            <el-input
              v-model="newFormInline.adminPassword"
              clearable
              show-password
              placeholder="请输入初始管理员密码"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="管理员姓名" prop="adminName">
            <el-input
              v-model="newFormInline.adminName"
              clearable
              placeholder="默认使用负责人或账号"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="管理员手机号" prop="adminPhone">
            <el-input
              v-model="newFormInline.adminPhone"
              clearable
              placeholder="默认使用诊所手机号"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="管理员邮箱" prop="adminEmail">
            <el-input
              v-model="newFormInline.adminEmail"
              clearable
              placeholder="默认使用诊所邮箱"
            />
          </el-form-item>
        </re-col>
      </template>

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
