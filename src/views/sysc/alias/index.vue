<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

defineOptions({
  name: "RegistrationFeeManagement"
});

const tableRef = ref();
const contentRef = ref();
const dialogVisible = ref(false);
const dialogTitle = ref("添加挂号项");

// 表单数据
const feeForm = reactive({
  id: "",
  name: "",
  salesPrice: 0,
  costPrice: 0,
  isDefault: false,
  status: true
});

// 表格列定义
const columns = ref([
  { label: "默认勾选", prop: "isDefault", minWidth: 120, slot: "default" },
  { label: "项目名称", prop: "name", minWidth: 200 },
  { label: "销售价", prop: "salesPrice", minWidth: 150, slot: "salesPrice" },
  { label: "成本价", prop: "costPrice", minWidth: 150, slot: "costPrice" },
  { label: "操作", fixed: "right", width: 150, slot: "operation" }
]);

// 数据列表
const dataList = ref([
  {
    id: "1",
    name: "普通门诊",
    salesPrice: 5.0,
    costPrice: 5.0,
    isDefault: true,
    status: true
  },
  {
    id: "2",
    name: "专家门诊",
    salesPrice: 0.0,
    costPrice: 0.0,
    isDefault: false,
    status: true
  }
]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 2
});

// 查询数据
const handleQuery = () => {
  // TODO: 调用后端接口
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
const openDialog = (type: string, row?: any) => {
  dialogTitle.value = type === "添加" ? "添加挂号项" : "编辑挂号项";
  if (row) {
    Object.assign(feeForm, row);
  } else {
    Object.assign(feeForm, {
      id: "",
      name: "",
      salesPrice: 0,
      costPrice: 0,
      isDefault: false,
      status: true
    });
  }
  dialogVisible.value = true;
};

// 保存挂号项
const handleSave = () => {
  if (!feeForm.name) {
    ElMessage.warning("请输入项目名称");
    return;
  }
  if (feeForm.salesPrice < 0) {
    ElMessage.warning("销售价不能为负数");
    return;
  }
  if (feeForm.costPrice < 0) {
    ElMessage.warning("成本价不能为负数");
    return;
  }

  // TODO: 调用后端接口保存
  ElMessage.success(dialogTitle.value === "添加挂号项" ? "添加成功" : "编辑成功");
  dialogVisible.value = false;
  handleQuery();
};

// 禁用/启用
const handleToggleStatus = (row: any) => {
  const action = row.status ? "禁用" : "启用";
  ElMessageBox.confirm(`确定要${action}【${row.name}】吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    // TODO: 调用后端接口
    row.status = !row.status;
    ElMessage.success(`${action}成功`);
  }).catch(() => {});
};

// 设置默认
const handleSetDefault = (row: any) => {
  if (row.isDefault) return;
  
  dataList.value.forEach(item => {
    item.isDefault = item.id === row.id;
  });
  
  // TODO: 调用后端接口
  ElMessage.success("设置默认成功");
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
                <span></span>
              </el-radio>
            </template>

            <!-- 销售价列 -->
            <template #salesPrice="{ row }">
              <span>{{ row.salesPrice.toFixed(2) }} 元</span>
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
      <el-form :model="feeForm" label-width="100px">
        <el-form-item label="项目名称" required>
          <el-input v-model="feeForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="销售价" required>
          <el-input-number
            v-model="feeForm.salesPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="成本价" required>
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
