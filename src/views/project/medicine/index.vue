<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Plus from "@iconify-icons/ep/plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import {
  getDrugPageApi,
  addDrugApi,
  updateDrugApi,
  deleteLogicDrugApi,
  type BQDrugEntityType,
  getDrugEntityDefault
} from "@/api/pharmacy/drug";
import { BQSearchFilter } from "@/api/api";
import {
  getMedicalDictionaryListApi,
  type BQMedicalDictionaryEntityType
} from "@/api/cm/medicalDictionary";
import {
  applyTenantInitDataGuard,
  useIsPlatformTenant,
  withTenantInitDataColumn
} from "@/utils/tenantInitData";

defineOptions({
  name: "ProjectMedicineIndex"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const loading = ref(false);
const isPlatformTenant = useIsPlatformTenant();

const queryForm = reactive({
  keyword: "",
  type: 0,
  status: ""
});

const medicineCategoryOptions = [
  { label: "全部", value: 0 },
  { label: "西药", value: 1 },
  { label: "中药", value: 2 },
  { label: "中成药", value: 3 }
];

const unitOptions = ref<{ label: string; value: string }[]>([]);
const unitIdOptions = ref<{ label: string; value: number }[]>([]);
const useWayOptions = ref<{ label: string; value: string }[]>([]);
const frequencyOptions = ref<{ label: string; value: string }[]>([]);
const decoWayOptions = ref<{ label: string; value: string }[]>([]);
// 原始字典数据，用于名称↔ID互转（兼容存量数据）
const useWayRaw = ref<BQMedicalDictionaryEntityType[]>([]);
const frequencyRaw = ref<BQMedicalDictionaryEntityType[]>([]);
const decoWayRaw = ref<BQMedicalDictionaryEntityType[]>([]);

const nameToId = (raw: BQMedicalDictionaryEntityType[], nameOrId?: string | null): string | undefined => {
  if (!nameOrId) return undefined;
  if (/^\d+$/.test(nameOrId)) return nameOrId;
  const opt = raw.find(o => o.name === nameOrId);
  return opt ? String(opt.id) : undefined;
};

const loadUnitOptions = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", 3)]
    });
    if (res.code === 0 && res.data) {
      const mapped = res.data.map((item: BQMedicalDictionaryEntityType) => ({
        label: item.name,
        value: item.id as number
      }));
      unitOptions.value = res.data.map(
        (item: BQMedicalDictionaryEntityType) => ({
          label: item.name,
          value: item.name
        })
      );
      unitIdOptions.value = mapped;
    }
  } catch (error) {
    console.error("加载单位字典失败:", error);
  }
};

const loadUseWayOptions = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", 1)]
    });
    if (res.code === 0 && res.data) {
      useWayRaw.value = res.data;
      useWayOptions.value = res.data.map(
        (item: BQMedicalDictionaryEntityType) => ({
          label: item.name,
          value: String(item.id)
        })
      );
    }
  } catch (error) {
    console.error("加载用法字典失败:", error);
  }
};

const loadFrequencyOptions = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", 2)]
    });
    if (res.code === 0 && res.data) {
      frequencyRaw.value = res.data;
      frequencyOptions.value = res.data.map(
        (item: BQMedicalDictionaryEntityType) => ({
          label: item.name,
          value: String(item.id)
        })
      );
    }
  } catch (error) {
    console.error("加载频率字典失败:", error);
  }
};

const loadDecoWayOptions = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", 5 + "")]
    });
    if (res.code === 0 && res.data) {
      decoWayRaw.value = res.data;
      decoWayOptions.value = res.data.map(
        (item: BQMedicalDictionaryEntityType) => ({
          label: item.name,
          value: String(item.id)
        })
      );
    }
  } catch (error) {
    console.error("加载煎药方式字典失败:", error);
  }
};

const statusOptions = [
  { label: "全部", value: "" },
  { label: "启用", value: "true" },
  { label: "禁用", value: "false" }
];

// 新增对话框
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const medicineFormRef = ref<FormInstance>();

const defaultMedicineForm = () => ({
  id: undefined as number | undefined,
  type: 1, // 默认西药(type=1)
  status: true,
  name: "",
  manufacturer: "",
  specification: "",
  approvalNumber: "",
  barcode: "",
  customCode: "",
  wholesaleUnit: "",
  conversionValue: "",
  prescriptionUnit: "",
  defaultSaleType: 0 as number, // 0整卖 1散卖
  wholesalePrice: "0.00",
  purchaseCostPrice: "0.00",
  prescriptionPrice: "0.00",
  stock: "",
  minStock: "",
  productionDate: "",
  expireDate: "",
  productionBatchNumber: "",
  supplier: "",
  singleDosage: "",
  unitId: undefined as number | undefined,
  useWay: undefined as string | undefined,
  frequency: undefined as string | undefined,
  decoWay: undefined as string | undefined,
  tenantInitData: true
});

const medicineForm = reactive(defaultMedicineForm());

const medicineFormRules: FormRules = {
  name: [{ required: true, message: "请选择或输入药品名称", trigger: "blur" }]
};

const columns: TableColumnList = [
  { label: "药品名称", prop: "name", minWidth: 200 },
  { label: "规格", prop: "specification", minWidth: 120 },
  { label: "类型", prop: "typeString", minWidth: 100 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 200 },
  { label: "库存", prop: "stock", minWidth: 120 },
  { label: "处方价", prop: "prescriptionPrice", minWidth: 120, formatter: (row: BQDrugEntityType) => row.prescriptionPrice ? `${row.prescriptionPrice}元${row.prescriptionUnit ? '/' + row.prescriptionUnit : ''}` : "" },
  { label: "状态", prop: "status", minWidth: 100, formatter: (row: BQDrugEntityType) => row.status ? "已启用" : "已禁用" },
  { label: "操作", fixed: "right", width: 200, slot: "operation" }
];

const tableColumns = computed(() => {
  return isPlatformTenant.value ? withTenantInitDataColumn(columns) : columns;
});

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
  queryForm.type = 0;
  queryForm.status = "";
  pagination.currentPage = 1;
  handleQuery();
};

const handleQuery = async () => {
  loading.value = true;
  try {
    const filters: any[] = [];

    if (queryForm.keyword) {
      filters.push(
        new BQSearchFilter("name,pinyin", "orLike", queryForm.keyword)
      );
    }

    if (queryForm.type) {
      filters.push(new BQSearchFilter("type", "eq", queryForm.type + ""));
    }

    if (queryForm.status !== "") {
      filters.push(new BQSearchFilter("status", "eq", queryForm.status));
    }

    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      filters: filters.length > 0 ? filters : null
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
          name: medicineForm.name,
          specification: medicineForm.specification,
          manufacturer: medicineForm.manufacturer,
          prescriptionPrice: medicineForm.prescriptionPrice,
          prescriptionUnit: medicineForm.prescriptionUnit ?? undefined,
          wholesalePrice: medicineForm.wholesalePrice,
          wholesaleUnit: medicineForm.wholesaleUnit ?? undefined,
          purchaseCostPrice: medicineForm.purchaseCostPrice,
          conversionValue: medicineForm.conversionValue
            ? Number(medicineForm.conversionValue)
            : undefined,
          stock: medicineForm.stock,
          minStock: medicineForm.minStock || undefined,
          approvalNumber: medicineForm.approvalNumber || undefined,
          barcode: medicineForm.barcode || undefined,
          customCode: medicineForm.customCode || undefined,
          defaultSaleType: medicineForm.defaultSaleType,
          productionDate: medicineForm.productionDate || undefined,
          expireDate: medicineForm.expireDate || undefined,
          productionBatchNumber:
            medicineForm.productionBatchNumber || undefined,
          supplier: medicineForm.supplier || undefined,
          singleDosage: medicineForm.singleDosage || undefined,
          unitId: medicineForm.unitId ?? undefined,
          useWay: medicineForm.useWay || "",
          frequency: medicineForm.frequency || "",
          status: medicineForm.status,
          decoWay: medicineForm.decoWay || "",
          tenantInitData: medicineForm.tenantInitData
        };
        applyTenantInitDataGuard(submitData);

        // 设置药品类型
        submitData.type = medicineForm.type;

        let res;
        if (dialogTitle.value === "新增") {
          res = await addDrugApi(submitData);
        } else {
          submitData.id = medicineForm.id;
          res = await updateDrugApi(submitData);
        }
        if (res.code === 0) {
          ElMessage.success(
            dialogTitle.value === "新增" ? "新增成功" : "更新成功"
          );
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

  medicineForm.id = row.id;
  medicineForm.name = row.name;
  medicineForm.specification = row.specification || "";
  medicineForm.manufacturer = row.manufacturer || "";
  medicineForm.prescriptionPrice = row.prescriptionPrice || "0.00";
  medicineForm.prescriptionUnit = row.prescriptionUnit || "";
  medicineForm.wholesalePrice = row.wholesalePrice || "0.00";
  medicineForm.wholesaleUnit = row.wholesaleUnit || "";
  medicineForm.purchaseCostPrice = row.purchaseCostPrice || "0.00";
  medicineForm.conversionValue = row.conversionValue?.toString() || "";
  medicineForm.stock = row.stock || "";
  medicineForm.minStock = row.minStock || "";
  medicineForm.approvalNumber = row.approvalNumber || "";
  medicineForm.barcode = row.barcode || "";
  medicineForm.customCode = row.customCode || "";
  medicineForm.defaultSaleType = row.defaultSaleType ?? 0;
  medicineForm.type = row.type;
  medicineForm.status = row.status ?? true;
  medicineForm.productionDate = row.productionDate || "";
  medicineForm.expireDate = row.expireDate || "";
  medicineForm.productionBatchNumber = row.productionBatchNumber || "";
  medicineForm.supplier = row.supplier || "";
  medicineForm.singleDosage = row.singleDosage || "";
  medicineForm.unitId = row.unitId ?? undefined;
  medicineForm.useWay = nameToId(useWayRaw.value, row.useWay);
  medicineForm.frequency = nameToId(frequencyRaw.value, row.frequency);
  medicineForm.decoWay = nameToId(decoWayRaw.value, row.decoWay) ?? "";
  medicineForm.tenantInitData = row.tenantInitData ?? true;

  dialogVisible.value = true;
};

const handleToggleStatus = async (row: BQDrugEntityType) => {
  const action = row.status ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确认${action}药品「${row.name}」吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res = await updateDrugApi(applyTenantInitDataGuard({
      id: row.id,
      status: !row.status,
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
  loadUnitOptions();
  loadUseWayOptions();
  loadFrequencyOptions();
  loadDecoWayOptions();
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
        <el-form-item label="药品检索" prop="keyword">
          <el-input
            v-model="queryForm.keyword"
            placeholder="药品名称或自编码"
            clearable
            class="!w-[200px]"
          />
        </el-form-item>
        <el-form-item label="药品分类" prop="type">
          <el-select
            v-model="queryForm.type"
            placeholder="全部"
            clearable
            class="!w-[120px]"
          >
            <el-option
              v-for="item in medicineCategoryOptions"
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
                  编辑
                </el-button>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status ? "禁用" : "启用" }}
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
      width="760px"
      :close-on-click-modal="false"
      draggable
      :body-style="{ height: '560px', overflowY: 'auto' }"
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
              <el-select v-model="medicineForm.type" class="w-full">
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
            <el-form-item label="药品名称" prop="name">
              <el-input
                v-model="medicineForm.name"
                placeholder="请输入药品名称"
                class="w-full"
              />
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
                  v-model="medicineForm.prescriptionUnit"
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
                  <el-radio :value="0">整卖</el-radio>
                  <el-radio :value="1">散卖</el-radio>
                </el-radio-group>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="整卖单价">
              <el-input
                v-model="medicineForm.wholesalePrice"
                class="price-input"
              >
                <template #append
                  >元/{{ medicineForm.wholesaleUnit || "" }}</template
                >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进货价">
              <el-input
                v-model="medicineForm.purchaseCostPrice"
                class="price-input"
              >
                <template #append
                  >元/{{ medicineForm.wholesaleUnit || "" }}</template
                >
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="散卖单价">
              <el-input
                v-model="medicineForm.prescriptionPrice"
                class="price-input"
              >
                <template #append
                  >元/{{ medicineForm.prescriptionUnit || "" }}</template
                >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="medicineForm.type === 2">
            <el-form-item label="煎药方式">
              <el-select
                v-model="medicineForm.decoWay"
                placeholder="请选择"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in decoWayOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="单次用量">
              <el-input v-model="medicineForm.singleDosage" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-select
                v-model="medicineForm.unitId"
                placeholder="请选择"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in unitIdOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="用法">
              <el-select
                v-model="medicineForm.useWay"
                placeholder="请选择"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in useWayOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="频率">
              <el-select
                v-model="medicineForm.frequency"
                placeholder="请选择"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in frequencyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 库存信息 -->
        <div class="section-title">库存信息</div>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="初始库存">
              <div class="stock-row">
                <el-input v-model="medicineForm.stock" class="stock-qty" />
                <span class="stock-unit-label">{{
                  medicineForm.wholesaleUnit || "整卖单位"
                }}</span>
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
            <el-form-item label="有效期">
              <el-date-picker
                v-model="medicineForm.expireDate"
                type="date"
                placeholder=""
                class="w-full"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="isPlatformTenant" :gutter="12">
          <el-col :span="12">
            <el-form-item label="租户初始化数据" label-width="120px">
              <el-switch
                v-model="medicineForm.tenantInitData"
                inline-prompt
                :active-value="true"
                :inactive-value="false"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="生产批号">
              <el-input v-model="medicineForm.productionBatchNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">
              <el-input v-model="medicineForm.supplier" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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

    :deep(.el-input-group__append) {
      min-width: 90px;
      text-align: center;
    }
  }

  .stock-row {
    display: flex;
    gap: 6px;
    width: 100%;

    .stock-qty {
      flex: 1;
    }

    .stock-unit-label {
      flex-shrink: 0;
      padding: 0 10px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
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
