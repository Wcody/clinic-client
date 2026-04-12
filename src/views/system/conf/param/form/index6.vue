<script setup lang="ts">
import { onMounted, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { getParamItemEntityDefault } from "@/api/system/param";
import { on } from "events";
import { getKindByKindListApi } from "@/api/cm/kind";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "修改",
    higherDeptOptions: [],
    ...getParamItemEntityDefault()
  })
});

const dataRef = ref([]);
const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
console.log("newFormInline", newFormInline.value);

const filterMethod = (query, item) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};

onMounted(async () => {
  const res = await getKindByKindListApi(
    newFormInline.value.paramConfig.initKind
  );
  dataRef.value = res.data;
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
  >
    <el-row>
      <re-col>
        <el-form-item label="是否启用齐套性规则校验">
          <el-switch
            v-model="newFormInline.paramValue.status"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.paramValue.status">
        <el-form-item label="参数值">
          <el-transfer
            v-model="newFormInline.paramValue.kindList"
            filterable
            :titles="['可选择的分类', '已选择的分类']"
            :props="{
              label: 'name',
              key: 'eid'
            }"
            :filter-method="filterMethod"
            filter-placeholder="请输入分类名称"
            :data="dataRef"
          />
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

.el-transfer {
  --el-transfer-panel-width: 24vw;
}
</style>
