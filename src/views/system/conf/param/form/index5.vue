<script setup lang="ts">
import ruleForm from "./rule.vue";
import { h, onMounted, reactive, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { getParamItemEntityDefault } from "@/api/system/param";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { addDialog } from "@/components/ReDialog";
import _ from "lodash";
import { message } from "@/utils/message";
import { getRecordFieldOptionsApi } from "@/api/cm/record";
import {
  limitKindLables,
  ruleKindLables,
  ruleKindType,
  ruleTypeLables
} from "@/utils/dataconst";
import { ElSwitch, ElTag } from "element-plus";
import { useUserStore } from "@/store/modules/user";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "修改",
    higherDeptOptions: [],
    ...getParamItemEntityDefault()
  })
});

const fieldOptionsRef = ref();
const fieldNamesRef = ref({});
const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const isSuper = useUserStore().isSuper();

const columns = [
  {
    label: "序号",
    type: "index",
    align: "center",
    width: 60
  },
  {
    label: "系统字段",
    prop: "fieldName",
    align: "center",
    cellRenderer: ({ row, props }) => {
      return h(ElTag, {}, () => fieldNamesRef.value[row.fieldName]);
    },
    minWidth: 100
  },
  {
    label: "规则类型",
    prop: "ruleType",
    cellRenderer: ({ row, props }) => {
      return h(
        ElTag,
        { type: row.ruleType ? "success" : "info" },
        () => ruleTypeLables[row.ruleType]
      );
    },
    minWidth: 100
  },
  {
    label: "规则类别",
    prop: "ruleKind",
    align: "center",
    cellRenderer: ({ row, props }) => {
      return h(
        ElTag,
        { type: ruleKindType[row.ruleKind] },
        () => ruleKindLables[row.ruleKind]
      );
    },
    minWidth: 100
  },
  {
    label: "强制类别",
    prop: "limitKind",
    align: "center",
    cellRenderer: ({ row, props }) => {
      return h(
        ElTag,
        { type: row.limitKind ? "info" : "success" },
        () => limitKindLables[row.limitKind]
      );
    },
    minWidth: 100
  },
  {
    label: "规则描述",
    prop: "ruleDesc",
    align: "center",
    minWidth: 200
  },
  {
    label: "规则内容",
    prop: "ruleContent",
    align: "center",
    minWidth: 100
  },
  {
    label: "启用",
    prop: "status",
    align: "center",
    cellRenderer: ({ row, props }) => {
      return h(ElSwitch, {
        activeValue: true,
        inactiveValue: false,
        modelValue: row.status,
        "onUpdate:modelValue": val => {
          row.status = val;
        }
      });
    },
    width: 60
  },
  {
    label: "操作",
    fixed: "right",
    width: 160,
    slot: "operation"
  }
] as any;

function onSearch() {
  console.log("onSearch");
}

function getRef() {
  return ruleFormRef.value;
}

function openDialog(title: string, row?: any) {
  console.log("openDialog", title, row);
  const formRef = ref();
  addDialog({
    title,
    props: {
      fieldOptions: fieldOptionsRef.value,
      title,
      initKind: props.formInline.paramConfig.initKind,
      row: _.cloneDeep(row)
    },
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    style: { width: "50vw", maxHeight: "80vh" },
    fullscreenIcon: false,
    closeOnClickModal: false,
    contentRenderer: () => h(ruleForm, { ref: formRef }),
    beforeSure: (done, { options }) => {
      const FormRef = formRef.value.getRef();
      const curData = formRef.value.getData();
      function chores() {
        if (row) {
          Object.assign(row, curData);
        } else {
          newFormInline.value.paramValue.dataList.push(curData);
        }
        message(`${title}规则成功`, {
          type: "success"
        });
        done(); // 关闭弹框
      }
      FormRef.validate(async valid => {
        if (valid) {
          chores();
        }
      });
    }
  });
}

onMounted(async () => {
  const res = await getRecordFieldOptionsApi(
    newFormInline.value.paramConfig.initKind
  );
  if (res.code === 0) {
    fieldOptionsRef.value = res.data;
    // 获取键值对
    fieldNamesRef.value = res.data.reduce((acc, cur) => {
      acc[cur.value] = cur.label;
      return acc;
    }, {});
  }
});

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-position="top"
  >
    <el-row>
      <re-col>
        <el-form-item label="是否启用完整性规则校验">
          <el-switch
            v-model="newFormInline.paramValue.status"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.paramValue.status">
        <el-form-item label="参数值">
          <PureTableBar :title="newFormInline.paramName" :columns="columns">
            <template #buttons
              ><el-button
                type="primary"
                :icon="useRenderIcon(AddFill)"
                @click="openDialog('新建')"
              >
                新建规则
              </el-button></template
            >
            <template v-slot="{ size, dynamicColumns }">
              <pure-table
                ref="tableRef"
                style="max-height: 50vh; width: 65vw"
                adaptive
                border
                stripe
                fit
                column-width="auto"
                :adaptiveConfig="{ offsetBottom: 108 }"
                align-whole="center"
                table-layout="auto"
                :size="size"
                :data="newFormInline.paramValue.dataList"
                :columns="dynamicColumns"
                :header-cell-style="{
                  color: 'var(--el-text-color-primary)'
                }"
              >
                <template #operation="{ index, row }">
                  <el-button
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(EditPen)"
                    :disabled="row.ruleType === 0 && !isSuper"
                    @click="openDialog('修改', row)"
                  >
                    修改
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    :size="size"
                    :icon="useRenderIcon(Delete)"
                    :disabled="row.ruleType === 0 && !isSuper"
                    @click="
                      () => {
                        newFormInline.paramValue.dataList.splice(index, 1);
                      }
                    "
                  >
                    删除
                  </el-button>
                </template>
              </pure-table>
            </template>
          </PureTableBar>
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
