<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { BQSearchFilter } from "@/api/api";
import {
  getBasicSettingPageApi,
  addBasicSettingApi,
  updateBasicSettingApi,
  type BQBasicSettingEntityType,
  getBasicSettingEntityDefault
} from "@/api/system/setting";
import {
  applyTenantInitDataGuard,
  useIsPlatformTenant,
  withTenantInitDataColumn
} from "@/utils/tenantInitData";

defineOptions({ name: "SettingBasic" });

// ── 页签定义 ──────────────────────────────────────────────
const tabs = [
  { key: "usage", label: "用法" },
  { key: "frequency", label: "频率" },
  { key: "unit", label: "单位" },
  { key: "dosageForm", label: "剂型" },
  { key: "decoction", label: "煎药方式（中药）" },
  { key: "allergy", label: "过敏史" }
];
const activeTab = ref("usage");
const isPlatformTenant = useIsPlatformTenant();

// ── 当前页签配置 ──────────────────────────────────────────
const currentTab = computed(() => tabs.find(t => t.key === activeTab.value));

// 用法页签有额外列
const isUsageTab = computed(() => activeTab.value === "usage");

// ── 列定义 ───────────────────────────────────────────────
const usageColumns = ref<any>([
  { label: "名称", prop: "name", minWidth: 160 },
  { label: "所属类别", prop: "typeName", minWidth: 160 },
  {
    label: "药品类别",
    prop: "medicineType",
    minWidth: 160,
    slot: "medicineType"
  },
  { label: "排序", prop: "seq", minWidth: 100, slot: "sort" },
  {
    label: "执行项目",
    prop: "executionProject",
    minWidth: 120,
    slot: "executionProject"
  },
  { label: "操作", fixed: "right", width: 160, slot: "operation" }
]);

const commonColumns = ref<any>([
  { label: "名称", prop: "name", minWidth: 280 },
  { label: "所属类别", prop: "typeName", minWidth: 280 },
  { label: "排序", prop: "seq", minWidth: 180, slot: "sort" },
  { label: "操作", fixed: "right", width: 180, slot: "operation" }
]);

const columns = computed(() => {
  const currentColumns = isUsageTab.value ? usageColumns.value : commonColumns.value;
  return isPlatformTenant.value
    ? withTenantInitDataColumn(currentColumns)
    : currentColumns;
});

// ── 数据列表 ──────────────────────────────────────────────
const dataList = ref<BQBasicSettingEntityType[]>([]);
const loading = ref(false);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ── 弹窗 ──────────────────────────────────────────────────
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const nameInputRef = ref<HTMLInputElement>();

// 基础类别下拉选项（与页签一一对应）
const categoryOptions = tabs.map(t => ({ label: t.label, value: t.key }));

const itemForm = reactive<BQBasicSettingEntityType>(
  getBasicSettingEntityDefault()
);

// 类别映射:前端 key -> 后端 dictType
const categoryToDictType: Record<string, number> = {
  usage: 1, // 用法
  frequency: 2, // 频率
  unit: 3, // 单位
  dosageForm: 4, // 剂型
  decoction: 5, // 煎药方式
  allergy: 6 // 过敏史
};

// dictType -> typeName 映射
const dictTypeToTypeName: Record<number, string> = {
  1: "用法",
  2: "频率",
  3: "单位",
  4: "剂型",
  5: "煎药方式",
  6: "过敏史"
};

// 后端 dictType -> 前端 key
const dictTypeToCategory: Record<number, string> = {
  1: "usage",
  2: "frequency",
  3: "unit",
  4: "dosageForm",
  5: "decoction",
  6: "allergy"
};

// 当前弹窗所选类别对应的页签 key
const dialogCategoryKey = computed(
  () => dictTypeToCategory[itemForm.dictType] || "usage"
);
const isDialogUsage = computed(() => dialogCategoryKey.value === "usage");
const isDialogFrequency = computed(
  () => dialogCategoryKey.value === "frequency"
);

const formRules: FormRules = {
  name: [{ required: true, message: "该项必填", trigger: ["blur", "change"] }],
  drugType: [
    { required: true, message: "该项必填", trigger: ["blur", "change"] }
  ]
};

// 查询数据
const handleQuery = async () => {
  loading.value = true;
  try {
    const dictType = categoryToDictType[activeTab.value];
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      filters: [new BQSearchFilter("dictType", "eq", dictType.toString())]
    };
    const res = await getBasicSettingPageApi(params);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("查询失败");
  } finally {
    loading.value = false;
  }
};

const openDialog = (row?: BQBasicSettingEntityType) => {
  isEdit.value = !!row;
  if (row) {
    Object.assign(itemForm, getBasicSettingEntityDefault(row));
  } else {
    const dictType = categoryToDictType[activeTab.value];
    Object.assign(itemForm, {
      ...getBasicSettingEntityDefault(),
      dictType: dictType,
      typeName: dictTypeToTypeName[dictType]
    });
  }
  formRef.value?.clearValidate();
  dialogVisible.value = true;

  // 弹窗打开后,自动聚焦到名称输入框
  nextTick(() => {
    nameInputRef.value?.focus();
  });
};

const handleSave = async () => {
  try {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;

    const api = isEdit.value ? updateBasicSettingApi : addBasicSettingApi;
    const res = await api(applyTenantInitDataGuard({ ...itemForm }));
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? "编辑成功" : "新建成功");
      dialogVisible.value = false;
      handleQuery();
    } else {
      ElMessage.error(res.errMsg || res.message || "保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  }
};

// ── 页签切换 ──────────────────────────────────────────────
const handleTabChange = () => {
  pagination.currentPage = 1;
  handleQuery();
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="main">
    <!-- 表格 -->
    <PureTableBar :columns="columns" @refresh="handleQuery">
      <template #title>
        <el-tabs
          v-model="activeTab"
          class="basic-tabs"
          @tab-change="handleTabChange"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.key"
            :label="tab.label"
            :name="tab.key"
          />
        </el-tabs>
      </template>
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新建基础项目
        </el-button>
      </template>
      <template #default>
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          adaptive
          border
          stripe
          :adaptiveConfig="{ offsetBottom: 110 }"
          :data="dataList"
          :loading="loading"
          row-key="id"
          :columns="columns"
          :pagination="pagination"
          :header-cell-style="{ color: 'var(--el-text-color-primary)' }"
          @page-current-change="
            p => {
              pagination.currentPage = p;
              handleQuery();
            }
          "
          @page-size-change="
            s => {
              pagination.pageSize = s;
              pagination.currentPage = 1;
              handleQuery();
            }
          "
        >
          <!-- 排序 -->
          <template #sort="{ row }">
            <span :style="{ color: 'var(--el-color-primary)' }">{{
              row.seq
            }}</span>
          </template>

          <!-- 所属类别 -->
          <template #typeName="{ row }">
            <span>{{ row.typeName || "-" }}</span>
          </template>

          <!-- 药品类别(仅用法页签) -->
          <template #medicineType="{ row }">
            <span>{{ row.medicineType ? "西药" : "中药" }}</span>
          </template>

          <!-- 执行项目(仅用法页签) -->
          <template #executionProject="{ row }">
            <el-checkbox v-model="row.executionProject" disabled />
          </template>

          <!-- 操作 -->
          <template #operation="{ row }">
            <span v-if="row.common" class="public-tip">公共数据不允许编辑</span>
            <el-button v-else link type="primary" @click="openDialog(row)"
              >编辑</el-button
            >
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 新建/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="
        isEdit
          ? '编辑' + dictTypeToTypeName[itemForm.dictType]
          : '新建' + dictTypeToTypeName[itemForm.dictType]
      "
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="itemForm"
        :rules="formRules"
        label-width="90px"
      >
        <!-- 基础类别(不可修改) -->
        <el-form-item label="基础类别">
          <el-input :value="dictTypeToTypeName[itemForm.dictType]" disabled />
        </el-form-item>

        <!-- 药品类别(仅用法) -->
        <el-form-item v-if="isDialogUsage" label="药品类别" prop="medicineType">
          <el-select v-model="itemForm.medicineType" style="width: 100%">
            <el-option label="西药" :value="true" />
            <el-option label="中药" :value="false" />
          </el-select>
        </el-form-item>

        <!-- 名称(必填) -->
        <el-form-item label="名称" prop="name">
          <el-input ref="nameInputRef" v-model="itemForm.name" />
        </el-form-item>

        <!-- 天/次(仅频率) -->
        <el-form-item v-if="isDialogFrequency" label=" ">
          <div class="freq-row">
            <el-input-number
              v-model.number="itemForm.day"
              :min="1"
              style="width: 120px"
            />
            <span class="freq-unit">天</span>
            <el-input-number
              v-model.number="itemForm.time"
              :min="1"
              style="width: 120px"
            />
            <span class="freq-unit">次</span>
          </div>
        </el-form-item>

        <!-- 排序 -->
        <el-form-item label="排序">
          <el-input-number
            v-model.number="itemForm.seq"
            :min="1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          v-if="isPlatformTenant"
          label="租户初始化数据"
          label-width="120px"
        >
          <el-switch
            v-model="itemForm.tenantInitData"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.basic-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.public-tip {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.freq-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.freq-unit {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}
</style>
