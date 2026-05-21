<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Plus from "@iconify-icons/ep/plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  getTreatmentItemPageApi,
  addTreatmentItemApi,
  updateTreatmentItemApi,
  deleteLogicTreatmentItemApi,
  type BQTreatmentItemEntityType,
  getTreatmentItemEntityDefault
} from "@/api/pharmacy/treatment";
import { BQSearchFilter } from "@/api/api";
import {
  applyTenantInitDataGuard,
  useIsPlatformTenant,
  withTenantInitDataColumn
} from "@/utils/tenantInitData";

defineOptions({
  name: "ProjectTreatIndex"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const loading = ref(false);
const isPlatformTenant = useIsPlatformTenant();

const queryForm = reactive({
  name: "",
  status: ""
});

const statusOptions = [
  { label: "全部", value: "" },
  { label: "启用", value: "1" },
  { label: "禁用", value: "0" }
];

const columns: TableColumnList = [
  { label: "序号", prop: "seq", minWidth: 120 },
  { label: "治疗项目名称", prop: "name", minWidth: 400 },
  { label: "项目价格", prop: "sellingPrice", minWidth: 200 },
  { label: "成本价", prop: "costPrice", minWidth: 200 },
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 160, slot: "operation" }
];

const tableColumns = computed(() => {
  return isPlatformTenant.value ? withTenantInitDataColumn(columns) : columns;
});

const dataList = ref<BQTreatmentItemEntityType[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleSearch = () => {
  pagination.currentPage = 1;
  handleQuery();
};

const handleResetQuery = () => {
  queryForm.name = "";
  queryForm.status = "";
  pagination.currentPage = 1;
  handleQuery();
};

const handleQuery = async () => {
  loading.value = true;
  try {
    const filters: any[] = [];
    
    if (queryForm.name) {
      filters.push(new BQSearchFilter("name", "like", queryForm.name));
    }
    
    if (queryForm.status) {
      filters.push(new BQSearchFilter("status", "eq", queryForm.status === "1" ? "启用" : "禁用"));
    }
    
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      filters: filters.length > 0 ? filters : undefined
    };
    
    const res = await getTreatmentItemPageApi(params);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询治疗项目列表失败:", error);
    ElMessage.error("查询失败，请稍后重试");
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

// 新增对话框
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const treatFormRef = ref<FormInstance>();

const defaultTreatForm = () => ({
  id: undefined as number | undefined,
  name: "",
  sellingPrice: "",
  costPrice: "",
  status: "启用",
  isExecProject: false,
  tenantInitData: true
});

const treatForm = reactive(defaultTreatForm());

const treatFormRules: FormRules = {
  name: [{ required: true, message: "该项必填", trigger: "blur" }]
};

const handleAdd = () => {
  dialogTitle.value = "新增";
  Object.assign(treatForm, defaultTreatForm());
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!treatFormRef.value) return;
  await treatFormRef.value.validate(async valid => {
    if (valid) {
      try {
        loading.value = true;
        
        const submitData: any = {
          name: treatForm.name,
          sellingPrice: treatForm.sellingPrice,
          costPrice: treatForm.costPrice,
          status: treatForm.status,
          isExecProject: treatForm.isExecProject,
          tenantInitData: treatForm.tenantInitData
        };
        applyTenantInitDataGuard(submitData);
        
        let res;
        if (dialogTitle.value === "新增") {
          res = await addTreatmentItemApi(submitData);
        } else {
          submitData.id = treatForm.id;
          res = await updateTreatmentItemApi(submitData);
        }
        
        if (res.code === 0) {
          ElMessage.success(dialogTitle.value === "新增" ? "新增成功" : "更新成功");
          dialogVisible.value = false;
          handleQuery();
        } else {
          ElMessage.error(res.errMsg || res.message || "操作失败");
        }
      } catch (error) {
        console.error("保存治疗项目失败:", error);
        ElMessage.error("保存失败，请稍后重试");
      } finally {
        loading.value = false;
      }
    }
  });
};

const handleDialogClose = () => {
  treatFormRef.value?.resetFields();
};

const handleEdit = (row: BQTreatmentItemEntityType) => {
  dialogTitle.value = "编辑";
  treatForm.id = row.id;
  treatForm.name = row.name;
  treatForm.sellingPrice = row.sellingPrice || "";
  treatForm.costPrice = row.costPrice || "";
  treatForm.status = row.status || "启用";
  treatForm.isExecProject = row.isExecProject ?? false;
  treatForm.tenantInitData = row.tenantInitData ?? true;
  dialogVisible.value = true;
};

const handleToggleStatus = async (row: BQTreatmentItemEntityType) => {
  const action = row.status === "启用" ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确认${action}项目「${row.name}」吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    });
    
    const newStatus = row.status === "启用" ? "禁用" : "启用";
    const res = await updateTreatmentItemApi(applyTenantInitDataGuard({
      id: row.id,
      status: newStatus,
      tenantInitData: row.tenantInitData
    }));
    
    if (res.code === 0) {
      ElMessage.success(`${action}成功`);
      handleQuery();
    } else {
      ElMessage.error(res.errMsg || res.message || `${action}失败`);
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      ElMessage.error("操作失败，请稍后重试");
    }
  }
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryForm.name"
          placeholder="请输入项目名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="项目状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="全部"
          clearable
          class="!w-[120px]"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="handleResetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        :class="['w-full']"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="治疗项目列表"
        :columns="tableColumns"
        @refresh="handleQuery"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(Plus)"
            @click="handleAdd"
          >
            新增
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="dataList"
            row-key="id"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small'"
            :header-cell-style="{
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === "启用" ? "禁用" : "启用" }}
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>

  <!-- 新增/编辑对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="580px"
    :close-on-click-modal="false"
    draggable
    @close="handleDialogClose"
  >
    <el-form
      ref="treatFormRef"
      :model="treatForm"
      :rules="treatFormRules"
      label-width="150px"
    >
      <el-form-item label="治疗项目名称" prop="name">
        <el-input v-model="treatForm.name" />
      </el-form-item>
      <el-form-item label="项目价格">
        <el-input v-model="treatForm.sellingPrice">
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="成本价">
        <el-input v-model="treatForm.costPrice">
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="">
        <el-checkbox v-model="treatForm.isExecProject">执行项目</el-checkbox>
      </el-form-item>
      <el-form-item v-if="isPlatformTenant" label="租户初始化数据">
        <el-switch
          v-model="treatForm.tenantInitData"
          inline-prompt
          :active-value="true"
          :inactive-value="false"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
