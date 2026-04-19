<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import {
  getRegistrationFeePageApi,
  addRegistrationFeeApi,
  updateRegistrationFeeApi,
  deleteRegistrationFeeApi,
  type BQRegistrationFeeEntityType,
  getRegistrationFeeEntityDefault
} from "@/api/system/setting";

defineOptions({
  name: "RegistrationFeeManagement"
});

const tableRef = ref();
const contentRef = ref();
const dialogVisible = ref(false);
const dialogTitle = ref("添加挂号项");
const loading = ref(false);
const nameInputRef = ref<HTMLInputElement>();
const formRef = ref<FormInstance>();

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入项目名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
  ],
  sellingPrice: [
    { required: true, message: "请输入销售价", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("销售价不能为负数"));
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

// 表单数据
const feeForm = reactive<BQRegistrationFeeEntityType>(
  getRegistrationFeeEntityDefault()
);

// 表格列定义
const columns = ref<any>([
  { label: "默认勾选", prop: "isDefault", minWidth: 120, slot: "default" },
  { label: "项目名称", prop: "name", minWidth: 200 },
  {
    label: "销售价",
    prop: "sellingPrice",
    minWidth: 150,
    slot: "sellingPrice"
  },
  { label: "成本价", prop: "costPrice", minWidth: 150, slot: "costPrice" },
  { label: "操作", fixed: "right", width: 150, slot: "operation" }
]);

// 数据列表
const dataList = ref<BQRegistrationFeeEntityType[]>([]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 查询数据
const handleQuery = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize
    };
    const res = await getRegistrationFeePageApi(params);
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

// 分页改变
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

// 每页显示数量改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

// 打开添加/编辑对话框
const openDialog = (type: string, row?: BQRegistrationFeeEntityType) => {
  dialogTitle.value = type === "添加" ? "添加挂号项" : "编辑挂号项";
  if (row) {
    Object.assign(feeForm, getRegistrationFeeEntityDefault(row));
  } else {
    Object.assign(feeForm, getRegistrationFeeEntityDefault());
  }
  formRef.value?.clearValidate();
  dialogVisible.value = true;

  // 弹窗打开后,自动聚焦到名称输入框
  nextTick(() => {
    nameInputRef.value?.focus();
  });
};

// 保存挂号项
const handleSave = async () => {
  try {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;

    const api = feeForm.id ? updateRegistrationFeeApi : addRegistrationFeeApi;
    const res = await api(feeForm);
    if (res.code === 0) {
      ElMessage.success(
        dialogTitle.value === "添加挂号项" ? "添加成功" : "编辑成功"
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

// 禁用/启用
const handleToggleStatus = async (row: BQRegistrationFeeEntityType) => {
  const action = row.status ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确定要${action}【${row.name}】吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const updatedRow = { ...row, status: !row.status };
    const res = await updateRegistrationFeeApi(updatedRow);
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

// 设置默认
const handleSetDefault = async (row: BQRegistrationFeeEntityType) => {
  if (row.isDefault) return;

  try {
    // 先取消其他默认项
    const promises = dataList.value
      .filter(item => item.isDefault && item.id !== row.id)
      .map(item => updateRegistrationFeeApi({ ...item, isDefault: false }));

    await Promise.all(promises);

    // 设置当前项为默认
    const res = await updateRegistrationFeeApi({ ...row, isDefault: true });
    if (res.code === 0) {
      dataList.value.forEach(item => {
        item.isDefault = item.id === row.id;
      });
      ElMessage.success("设置默认成功");
    } else {
      ElMessage.error(res.errMsg || res.message || "设置默认失败");
      handleQuery(); // 刷新数据
    }
  } catch (error) {
    console.error("设置默认失败:", error);
    ElMessage.error("设置默认失败");
    handleQuery(); // 刷新数据
  }
};

// Lifecycle
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
        :class="['w-full']"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="挂号费管理"
        :columns="columns"
        @refresh="handleQuery"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog('添加')"
          >
            添加挂号项
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
            :header-cell-style="{
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <!-- 默认勾选列 -->
            <template #default="{ row }">
              <el-radio
                :model-value="row.isDefault"
                :label="true"
                @change="handleSetDefault(row)"
              >
                <span />
              </el-radio>
            </template>

            <!-- 销售价列 -->
            <template #sellingPrice="{ row }">
              <span>{{ row.sellingPrice.toFixed(2) }} 元</span>
            </template>

            <!-- 成本价列 -->
            <template #costPrice="{ row }">
              <span>{{ row.costPrice.toFixed(2) }} 元</span>
            </template>

            <!-- 操作列 -->
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
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input
            ref="nameInputRef"
            v-model="feeForm.name"
            placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item label="销售价" prop="sellingPrice">
          <el-input-number
            v-model="feeForm.sellingPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number
            v-model="feeForm.costPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="feeForm.isDefault" />
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
