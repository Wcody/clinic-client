<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { getRecordFieldOptionsApi } from "@/api/cm/record";
import {
  ruleTypeOptions,
  ruleKindOptions,
  limitKindOptions
} from "@/utils/dataconst";
import { useUserStore } from "@/store/modules/user";

const props = defineProps({
  fieldOptions: {
    type: Array,
    required: false
  },
  row: {
    type: Object,
    required: false
  },
  initKind: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    default: "新建"
  }
});

const newFormInline = ref({} as any);
const ruleFormRef = ref();

const isSuper = useUserStore().isSuper();

if (!props.row) {
  Object.assign(newFormInline.value, {
    fieldName: "",
    ruleType: isSuper ? 0 : 1,
    ruleKind: 0,
    limitKind: 0,
    ruleDesc: "",
    ruleContent: "",
    builtIn: isSuper,
    status: true
  });
} else {
  Object.assign(newFormInline.value, props.row);
}

function getRef() {
  return ruleFormRef.value;
}

const formRules = reactive({
  fieldName: [{ required: true, message: "参数值必填", trigger: "blur" }],
  ruleType: [{ required: true, message: "参数值必填", trigger: "blur" }],
  ruleKind: [{ required: true, message: "参数值必填", trigger: "blur" }],
  paramValue: [{ required: true, message: "参数值必填", trigger: "blur" }],
  limitKind: [{ required: true, message: "参数值必填", trigger: "blur" }],
  ruleDesc: [{ required: true, message: "参数值必填", trigger: "blur" }],
  ruleContent: [{ required: true, message: "参数值必填", trigger: "blur" }]
});

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
    <el-row>
      <re-col>
        <el-form-item label="系统字段" prop="fieldName">
          <el-select-v2
            v-model="newFormInline.fieldName"
            filterable
            :options="props.fieldOptions"
            placeholder="请选择系统字段"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="isSuper">
        <el-form-item label="规则类型" prop="ruleType">
          <el-select-v2
            v-model="newFormInline.ruleType"
            :options="ruleTypeOptions"
            placeholder="请选择规则类型"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="规则类别" prop="ruleKind">
          <el-select-v2
            v-model="newFormInline.ruleKind"
            :options="ruleKindOptions"
            placeholder="请选择规则类别"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="强制类别" prop="limitKind">
          <el-select-v2
            v-model="newFormInline.limitKind"
            :options="limitKindOptions"
            placeholder="请选择强制类别"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="规则描述" prop="ruleDesc">
          <el-input
            v-model="newFormInline.ruleDesc"
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item
          :label="`规则内容(${newFormInline.fieldName})`"
          prop="ruleContent"
        >
          <el-input
            v-model="newFormInline.ruleContent"
            placeholder="请输入规则内容"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="是否启用" prop="status">
          <el-switch
            v-model="newFormInline.status"
            active-text="是"
            inactive-text="否"
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
