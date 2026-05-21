<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import {
  getSurchargeFeePageApi,
  addSurchargeFeeApi,
  updateSurchargeFeeApi,
  deleteSurchargeFeeApi,
  type BQSurchargeFeeEntityType,
  getSurchargeFeeEntityDefault
} from "@/api/system/setting";
import {
  applyTenantInitDataGuard,
  useIsPlatformTenant,
  withTenantInitDataColumn
} from "@/utils/tenantInitData";

defineOptions({ name: "SettingSurcharge" });

const tableRef = ref();
const contentRef = ref();
const dialogVisible = ref(false);
const dialogTitle = ref("添加附加费用");
const loading = ref(false);
const nameInputRef = ref<HTMLInputElement>();
const formRef = ref<FormInstance>();
const isPlatformTenant = useIsPlatformTenant();

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入项目名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
  ],
  sellingPrice: [
    { required: true, message: "请输入价格", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("价格不能为负数"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  costPrice: [
    { required: true, message: "请输入成本价", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("成本价不能为负数"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

const feeForm = reactive<BQSurchargeFeeEntityType>(
  getSurchargeFeeEntityDefault()
);

const columns = ref<any>([
  {
    label: "默认添加到处方",
    prop: "defaultAdd",
    minWidth: 150,
    slot: "defaultAdd"
  },
  { label: "项目名称", prop: "name", minWidth: 200 },
  { label: "价格", prop: "sellingPrice", minWidth: 150, slot: "sellingPrice" },
  { label: "成本价", prop: "costPrice", minWidth: 150, slot: "costPrice" },
  { label: "操作", fixed: "right", width: 150, slot: "operation" }
]);

const tableColumns = computed(() => {
  return isPlatformTenant.value
    ? withTenantInitDataColumn(columns.value)
    : columns.value;
});

const dataList = ref<BQSurchargeFeeEntityType[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleQuery = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize
    };
    const res = await getSurchargeFeePageApi(params);
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

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

const openDialog = (type: string, row?: BQSurchargeFeeEntityType) => {
  dialogTitle.value = type === "添加" ? "添加附加费用" : "编辑附加费用";
  if (row) {
    Object.assign(feeForm, getSurchargeFeeEntityDefault(row));
  } else {
    Object.assign(feeForm, getSurchargeFeeEntityDefault());
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

    const api = feeForm.id ? updateSurchargeFeeApi : addSurchargeFeeApi;
    const res = await api(applyTenantInitDataGuard({ ...feeForm }));
    if (res.code === 0) {
      ElMessage.success(
        dialogTitle.value === "添加附加费用" ? "添加成功" : "编辑成功"
      );
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

const handleToggleStatus = async (row: BQSurchargeFeeEntityType) => {
  const action = row.status ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确定要${action}【${row.name}】吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const updatedRow = applyTenantInitDataGuard({ ...row, status: !row.status });
    const res = await updateSurchargeFeeApi(updatedRow);
    if (res.code === 0) {
      row.status = !row.status;
      ElMessage.success(`${action}成功`);
    } else {
      ElMessage.error(res.errMsg || res.message || `${action}失败`);
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(`${action}失败:`, error);
      ElMessage.error(`${action}失败`);
    }
  }
};

const handleToggleDefault = async (row: BQSurchargeFeeEntityType) => {
  try {
    const res = await updateSurchargeFeeApi(
      applyTenantInitDataGuard({ ...row })
    );
    if (res.code !== 0) {
      ElMessage.error(res.errMsg || res.message || "更新失败");
      row.defaultAdd = !row.defaultAdd; // 恢复原状态
    }
  } catch (error) {
    console.error("更新失败:", error);
    ElMessage.error("更新失败");
    row.defaultAdd = !row.defaultAdd; // 恢复原状态
  }
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="main">
    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        class="w-full"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="附加费管理"
        :columns="tableColumns"
        @refresh="handleQuery"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog('添加')"
          >
            新增附加费用
          </el-button>
        </template>

        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="dataList"
            :loading="loading"
            row-key="id"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{ color: 'var(--el-text-color-primary)' }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <!-- 默认添加到处方 -->
            <template #defaultAdd="{ row }">
              <el-checkbox
                v-model="row.defaultAdd"
                @change="handleToggleDefault(row)"
              />
            </template>

            <!-- 价格 -->
            <template #sellingPrice="{ row }">
              <span>{{ row.sellingPrice.toFixed(2) }} 元</span>
            </template>

            <!-- 成本价 -->
            <template #costPrice="{ row }">
              <span>{{ row.costPrice.toFixed(2) }} 元</span>
            </template>

            <!-- 操作 -->
            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="openDialog('编辑', row)"
              >
                编辑
              </el-button>
              <el-button
                class="reset-margin"
                link
                :type="row.status ? 'danger' : 'success'"
                :size="size"
                @click="handleToggleStatus(row)"
              >
                {{ row.status ? "禁用" : "启用" }}
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="feeForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input
            ref="nameInputRef"
            v-model="feeForm.name"
            placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item label="价格" prop="sellingPrice">
          <el-input-number
            v-model="feeForm.sellingPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="成本价">
          <el-input-number
            v-model="feeForm.costPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="默认添加到处方">
          <el-switch v-model="feeForm.defaultAdd" />
        </el-form-item>
        <el-form-item v-if="isPlatformTenant" label="租户初始化数据">
          <el-switch
            v-model="feeForm.tenantInitData"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 8px 8px 0 8px !important;
}
</style>
