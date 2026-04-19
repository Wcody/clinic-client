<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Plus from "@iconify-icons/ep/plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  getDrugPageApi,
  addDrugApi,
  updateDrugApi,
  deleteLogicDrugApi,
  type BQDrugEntityType,
  getDrugEntityDefault
} from "@/api/pharmacy/drug";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "ProjectMedicineIndex"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const loading = ref(false);

const queryForm = reactive({
  keyword: "",
  category: "",
  status: ""
});

const categoryOptions = [
  { label: "全部", value: "" },
  { label: "西药", value: "西药" },
  { label: "中成药", value: "中成药" },
  { label: "中草药", value: "中草药" },
  { label: "耗材", value: "耗材" }
];

const medicineCategoryOptions = [
  { label: "西药", value: "西药" },
  { label: "中成药", value: "中成药" },
  { label: "中草药", value: "中草药" },
  { label: "耗材", value: "耗材" }
];

const unitOptions = [
  { label: "盒", value: "盒" },
  { label: "片", value: "片" },
  { label: "粒", value: "粒" },
  { label: "瓶", value: "瓶" },
  { label: "包", value: "包" },
  { label: "袋", value: "袋" },
  { label: "支", value: "支" },
  { label: "g", value: "g" },
  { label: "ml", value: "ml" },
  { label: "丸", value: "丸" }
];

const expiryUnitOptions = [
  { label: "天", value: "天" },
  { label: "月", value: "月" },
  { label: "年", value: "年" }
];

const statusOptions = [
  { label: "全部", value: "" },
  { label: "启用", value: "1" },
  { label: "禁用", value: "0" }
];

// 新增对话框
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const medicineFormRef = ref<FormInstance>();

const defaultMedicineForm = () => ({
  category: "西药",
  medicineName: "",
  manufacturer: "",
  specification: "",
  approvalNumber: "",
  barcode: "",
  customCode: "",
  wholesaleUnit: "",
  conversionValue: "",
  retailUnit: "",
  defaultSaleType: "wholesale",
  wholesalePrice: "0.00",
  purchasePrice: "0.00",
  retailPrice: "0.00",
  initialStockQty: "",
  initialStockUnit: "",
  minStock: "",
  productionDate: "",
  expiryValue: "",
  expiryUnit: "月",
  batchNumber: "",
  supplierId: ""
});

const medicineForm = reactive(defaultMedicineForm());

const medicineFormRules: FormRules = {
  medicineName: [{ required: true, message: "请选择或输入药品名称", trigger: "blur" }]
};

const columns: TableColumnList = [
  { label: "药品名称", prop: "name", minWidth: 200 },
  { label: "规格", prop: "specification", minWidth: 120 },
  { label: "类型", prop: "typeString", minWidth: 100 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 200 },
  { label: "库存", prop: "stock", minWidth: 120 },
  { label: "处方价", prop: "prescriptionPrice", minWidth: 120 },
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 200, slot: "operation" }
];

const dataList = ref<BQDrugEntityType[]>([]);

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
  queryForm.keyword = "";
  queryForm.category = "";
  queryForm.status = "";
  pagination.currentPage = 1;
  handleQuery();
};

const handleQuery = async () => {
  loading.value = true;
  try {
    const filters: any[] = [];

    if (queryForm.keyword) {
      filters.push(new BQSearchFilter("name", "like", queryForm.keyword));
    }

    if (queryForm.category) {
      filters.push(new BQSearchFilter("typeString", "eq", queryForm.category));
    }

    if (queryForm.status) {
      filters.push(
        new BQSearchFilter(
          "status",
          "eq",
          queryForm.status === "1" ? "启用" : "禁用"
        )
      );
    }

    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      filters: filters.length > 0 ? filters : undefined
    };

    const res = await getDrugPageApi(params);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询药品列表失败:", error);
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

const handleAdd = () => {
  dialogTitle.value = "新增";
  Object.assign(medicineForm, defaultMedicineForm());
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!medicineFormRef.value) return;
  await medicineFormRef.value.validate(async valid => {
    if (valid) {
      try {
        loading.value = true;
        
        // 构建提交数据
        const submitData: any = {
          name: medicineForm.medicineName,
          specification: medicineForm.specification,
          manufacturer: medicineForm.manufacturer,
          prescriptionPrice: medicineForm.retailPrice || medicineForm.wholesalePrice,
          purchaseCostPrice: medicineForm.purchasePrice,
          stock: medicineForm.initialStockQty,
          status: "启用"
        };
        
        // 设置药品类型
        if (medicineForm.category === "西药") {
          submitData.type = 1;
          submitData.typeString = "西药";
        } else if (medicineForm.category === "中成药") {
          submitData.type = 3;
          submitData.typeString = "中成药";
        } else if (medicineForm.category === "中草药") {
          submitData.type = 2;
          submitData.typeString = "中药";
        }
        
        let res;
        if (dialogTitle.value === "新增") {
          res = await addDrugApi(submitData);
        } else {
          submitData.id = medicineForm.id;
          res = await updateDrugApi(submitData);
        }
        
        if (res.code === 0) {
          ElMessage.success(dialogTitle.value === "新增" ? "新增成功" : "更新成功");
          dialogVisible.value = false;
          handleQuery();
        } else {
          ElMessage.error(res.errMsg || res.message || "操作失败");
        }
      } catch (error) {
        console.error("保存药品失败:", error);
        ElMessage.error("保存失败，请稍后重试");
      } finally {
        loading.value = false;
      }
    }
  });
};

const handleDialogClose = () => {
  medicineFormRef.value?.resetFields();
};

const handleEdit = (row: BQDrugEntityType) => {
  dialogTitle.value = "编辑";
  
  // 映射后端字段到表单字段
  medicineForm.id = row.id;
  medicineForm.medicineName = row.name;
  medicineForm.specification = row.specification || "";
  medicineForm.manufacturer = row.manufacturer || "";
  medicineForm.prescriptionPrice = row.prescriptionPrice || "0.00";
  medicineForm.purchasePrice = row.purchaseCostPrice || "0.00";
  medicineForm.retailPrice = row.prescriptionPrice || "0.00";
  medicineForm.wholesalePrice = row.prescriptionPrice || "0.00";
  medicineForm.initialStockQty = row.stock || "";
  
  // 根据type设置category
  if (row.type === 1) {
    medicineForm.category = "西药";
  } else if (row.type === 3) {
    medicineForm.category = "中成药";
  } else if (row.type === 2) {
    medicineForm.category = "中草药";
  } else {
    medicineForm.category = "西药";
  }
  
  dialogVisible.value = true;
};

const handleToggleStatus = async (row: BQDrugEntityType) => {
  const action = row.status === "启用" ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确认${action}药品「${row.name}」吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    });
    
    const newStatus = row.status === "启用" ? "禁用" : "启用";
    const res = await updateDrugApi({
      id: row.id,
      status: newStatus
    });
    
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

const handleDelete = async (row: BQDrugEntityType) => {
  try {
    await ElMessageBox.confirm(`确认删除药品「${row.name}」吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    });
    
    const res = await deleteLogicDrugApi(row.id);
    if (res) {
      ElMessage.success("删除成功");
      handleQuery();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败，请稍后重试");
    }
  }
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="药品检索" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          placeholder="药品名称或自编码"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="药品分类" prop="category">
        <el-select
          v-model="queryForm.category"
          placeholder="全部"
          clearable
          class="!w-[120px]"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="药品状态" prop="status">
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
        title="药品列表"
        :columns="columns"
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
                编辑
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
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="handleDelete(row)"
              >
                删除
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
    width="660px"
    :close-on-click-modal="false"
    draggable
    @close="handleDialogClose"
  >
    <el-form
      ref="medicineFormRef"
      :model="medicineForm"
      :rules="medicineFormRules"
      label-width="80px"
      class="medicine-form"
    >
      <!-- 基础信息 -->
      <div class="section-title">基础信息</div>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="药品分类">
            <el-select v-model="medicineForm.category" class="w-full">
              <el-option
                v-for="item in medicineCategoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="药品名称" prop="medicineName">
            <el-select
              v-model="medicineForm.medicineName"
              filterable
              allow-create
              default-first-option
              placeholder="请输入药品名称"
              class="w-full"
            >
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="生产厂家">
            <el-input v-model="medicineForm.manufacturer" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="规格">
            <el-input v-model="medicineForm.specification" placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="批准文号">
            <el-input v-model="medicineForm.approvalNumber" placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="条形码">
            <el-input v-model="medicineForm.barcode" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="自编码">
            <el-input v-model="medicineForm.customCode" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 使用信息 -->
      <div class="section-title">使用信息</div>
      <el-row :gutter="12">
        <el-col :span="24">
          <el-form-item label="单位换算1">
            <div class="conversion-row">
              <el-select
                v-model="medicineForm.wholesaleUnit"
                placeholder="必选"
                class="unit-select"
              >
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span class="conversion-eq">=</span>
              <el-input
                v-model="medicineForm.conversionValue"
                class="conversion-input"
                placeholder=""
              />
              <el-select
                v-model="medicineForm.retailUnit"
                placeholder="必选"
                class="unit-select"
              >
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span class="conversion-hint">例如：1盒=10片</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="24">
          <el-form-item label="">
            <div class="sale-type-row">
              <span class="sale-type-label">提示：默认售卖方式</span>
              <el-radio-group v-model="medicineForm.defaultSaleType">
                <el-radio value="wholesale">整卖</el-radio>
                <el-radio value="retail">散卖</el-radio>
              </el-radio-group>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="整卖单价">
            <el-input v-model="medicineForm.wholesalePrice" class="price-input">
              <template #append>元/{{ medicineForm.wholesaleUnit || "" }}</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="进货价">
            <el-input v-model="medicineForm.purchasePrice" class="price-input">
              <template #append>元/{{ medicineForm.wholesaleUnit || "" }}</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="散卖单价">
            <el-input v-model="medicineForm.retailPrice" class="price-input">
              <template #append>元/{{ medicineForm.retailUnit || "" }}</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <div class="more-info-link">
            <el-button link type="primary">更多信息</el-button>
          </div>
        </el-col>
      </el-row>

      <!-- 库存信息 -->
      <div class="section-title">库存信息</div>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="初始库存">
            <div class="stock-row">
              <el-input v-model="medicineForm.initialStockQty" class="stock-qty" />
              <el-input v-model="medicineForm.initialStockUnit" class="stock-unit" placeholder="" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存下限">
            <el-input v-model="medicineForm.minStock" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="生产日期">
            <el-date-picker
              v-model="medicineForm.productionDate"
              type="date"
              placeholder=""
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保质期">
            <div class="expiry-row">
              <el-input
                v-model="medicineForm.expiryValue"
                class="expiry-input"
                placeholder="例如：18"
              />
              <el-select v-model="medicineForm.expiryUnit" class="expiry-unit">
                <el-option
                  v-for="item in expiryUnitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="生产批号">
            <el-input v-model="medicineForm.batchNumber" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商">
            <el-select v-model="medicineForm.supplierId" class="w-full" clearable>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
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

.medicine-form {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
    padding: 6px 12px;
    margin: 0 0 12px;
    border-radius: 4px;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
  }

  .conversion-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;

    .unit-select {
      width: 90px;
      flex-shrink: 0;
    }

    .conversion-eq {
      flex-shrink: 0;
      color: var(--el-text-color-regular);
    }

    .conversion-input {
      width: 80px;
      flex-shrink: 0;
    }

    .conversion-hint {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      margin-left: 8px;
    }
  }

  .sale-type-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .sale-type-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }

  .price-input {
    width: 100%;
  }

  .more-info-link {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    padding-top: 4px;
  }

  .stock-row {
    display: flex;
    gap: 6px;
    width: 100%;

    .stock-qty {
      flex: 1;
    }

    .stock-unit {
      width: 80px;
      flex-shrink: 0;
    }
  }

  .expiry-row {
    display: flex;
    gap: 6px;
    width: 100%;

    .expiry-input {
      flex: 1;
    }

    .expiry-unit {
      width: 80px;
      flex-shrink: 0;
    }
  }
}
</style>
