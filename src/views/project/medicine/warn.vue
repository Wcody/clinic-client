<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import {
  getDrugStockPageApi,
  type BQDrugStockEntityType
} from "@/api/pharmacy/stock";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "ProjectMedicineWarn"
});

// ==================== 标签页 ====================
const activeTab = ref("expiry");

const handleTabChange = () => {
  if (activeTab.value === "expiry") {
    loadExpiryList();
  } else {
    loadStockList();
  }
};

const categoryOptions = [
  { label: "全部", value: "" },
  { label: "西药", value: "西药" },
  { label: "中成药", value: "中成药" },
  { label: "中草药", value: "中草药" },
  { label: "耗材", value: "耗材" }
];

// ==================== 有效期预警 Tab ====================
const expiryTableRef = ref();
const expiryQueryFormRef = ref();
const expiryLoading = ref(false);

const expiryExpireOptions = [
  { label: "全部", value: "" },
  { label: "已过期", value: "expired" },
  { label: "30天内", value: "30" },
  { label: "60天内", value: "60" },
  { label: "90天内", value: "90" }
];

const expiryQueryForm = reactive({
  keyword: "",
  expireDays: "",
  category: ""
});

const expiryColumns: TableColumnList = [
  { label: "药品名称", prop: "medicineName", minWidth: 180 },
  { label: "规格", prop: "specification", minWidth: 100 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 180 },
  { label: "生产批号", prop: "batchNo", minWidth: 140 },
  { label: "药品分类", prop: "category", minWidth: 100 },
  { label: "生产日期", prop: "productionDate", minWidth: 120 },
  { label: "有效期至", prop: "expiryDate", minWidth: 120 },
  { label: "库存数量", prop: "stockQty", minWidth: 120 },
  { label: "剩余天数", prop: "remainDays", minWidth: 100, slot: "remainDays" }
];

const expiryList = ref([
  {
    id: "1",
    medicineName: "太子参",
    specification: "g",
    manufacturer: "",
    batchNo: "",
    category: "中药",
    productionDate: "2019-04-01",
    expiryDate: "无期",
    stockQty: "1499.0g",
    remainDays: "无"
  },
  {
    id: "2",
    medicineName: "双氯芬酸钠肠溶片",
    specification: "25 mg",
    manufacturer: "",
    batchNo: "",
    category: "西药",
    productionDate: "2018-04-27",
    expiryDate: "2019-04-27",
    stockQty: "19瓶46片",
    remainDays: "已过期"
  },
  {
    id: "3",
    medicineName: "醋酸泼尼松片",
    specification: "45粒7.5g*8粒/盒",
    manufacturer: "吉林恒金药业股份有限公司",
    batchNo: "",
    category: "中成药",
    productionDate: "2016-10-07",
    expiryDate: "2018-10-07",
    stockQty: "99盒0粒",
    remainDays: "已过期"
  },
  {
    id: "4",
    medicineName: "糖米沙坦片",
    specification: "40mg",
    manufacturer: "",
    batchNo: "",
    category: "西药",
    productionDate: "2019-04-06",
    expiryDate: "2019-04-06",
    stockQty: "11盒0片",
    remainDays: "已过期"
  },
  {
    id: "5",
    medicineName: "注射用头孢唑钠",
    specification: "1.0g",
    manufacturer: "",
    batchNo: "",
    category: "西药",
    productionDate: "2017-06-08",
    expiryDate: "2019-06-08",
    stockQty: "49瓶16支",
    remainDays: "已过期"
  },
  {
    id: "6",
    medicineName: "野木瓜片",
    specification: "100片/盒",
    manufacturer: "",
    batchNo: "",
    category: "中成药",
    productionDate: "2017-06-13",
    expiryDate: "2019-06-08",
    stockQty: "1998盒28片",
    remainDays: "已过期"
  },
  {
    id: "7",
    medicineName: "止崩白洁丸",
    specification: "3g",
    manufacturer: "陕西创药有限责任公司",
    batchNo: "",
    category: "中成药",
    productionDate: "2016-06-16",
    expiryDate: "2019-06-16",
    stockQty: "47盒3袋",
    remainDays: "已过期"
  },
  {
    id: "8",
    medicineName: "穿黄清热胶囊",
    specification: "每粒0.36g",
    manufacturer: "四川好医生药业集团有限公司",
    batchNo: "",
    category: "中成药",
    productionDate: "2016-06-22",
    expiryDate: "2019-06-22",
    stockQty: "15瓶1粒",
    remainDays: "已过期"
  },
  {
    id: "9",
    medicineName: "马来酸伊莫拉定片",
    specification: "2mg",
    manufacturer: "齐鲁制药有限公司",
    batchNo: "",
    category: "西药",
    productionDate: "2017-07-12",
    expiryDate: "2019-07-12",
    stockQty: "18盒6片",
    remainDays: "已过期"
  },
  {
    id: "10",
    medicineName: "增力养生丸",
    specification: "7.5g*8粒/盒",
    manufacturer: "吉林恒金药业股份有限公司",
    batchNo: "",
    category: "中成药",
    productionDate: "2017-07-13",
    expiryDate: "2019-07-13",
    stockQty: "90盒0粒",
    remainDays: "已过期"
  }
]);

const expiryPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 112
});

const handleExpirySearch = () => {
  expiryPagination.currentPage = 1;
  loadExpiryList();
};

const handleExpiryReset = () => {
  expiryQueryForm.keyword = "";
  expiryQueryForm.expireDays = "";
  expiryQueryForm.category = "";
  expiryPagination.currentPage = 1;
  loadExpiryList();
};

const loadExpiryList = () => {
  // TODO: 调用有效期预警列表接口
};

const handleExpiryPageChange = (page: number) => {
  expiryPagination.currentPage = page;
  loadExpiryList();
};

const handleExpirySizeChange = (size: number) => {
  expiryPagination.pageSize = size;
  loadExpiryList();
};

// ==================== 库存预警 Tab ====================
const stockTableRef = ref();
const stockQueryFormRef = ref();
const stockLoading = ref(false);

const stockQueryForm = reactive({
  keyword: "",
  category: ""
});

const stockColumns: TableColumnList = [
  { label: "药品名称", prop: "name", minWidth: 180 },
  { label: "规格", prop: "specification", minWidth: 120 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 180 },
  { label: "类型", prop: "typeString", minWidth: 100 },
  { label: "库存数量", prop: "stock", minWidth: 120 },
  { label: "最低库存", prop: "minimumStock", minWidth: 120 }
];

const stockWarnList = ref<BQDrugStockEntityType[]>([]);

const stockPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleStockSearch = () => {
  stockPagination.currentPage = 1;
  loadStockList();
};

const handleStockReset = () => {
  stockQueryForm.keyword = "";
  stockQueryForm.category = "";
  stockPagination.currentPage = 1;
  loadStockList();
};

const loadStockList = async () => {
  stockLoading.value = true;
  try {
    const filters: any[] = [];
    
    if (stockQueryForm.keyword) {
      filters.push(new BQSearchFilter("name", "like", stockQueryForm.keyword));
    }
    
    if (stockQueryForm.category) {
      filters.push(new BQSearchFilter("typeString", "eq", stockQueryForm.category));
    }
    
    // 添加库存预警过滤：当前库存 <= 最低库存
    // 注意：这里需要后端支持，或者前端过滤
    const params = {
      current: stockPagination.currentPage,
      size: stockPagination.pageSize,
      filters: filters.length > 0 ? filters : undefined
    };
    
    const res = await getDrugStockPageApi(params);
    if (res.code === 0 && res.data) {
      // 前端过滤：只显示库存低于最低库存的记录
      let records = res.data.records || [];
      records = records.filter(item => {
        const stock = parseFloat(item.stock || "0");
        const minStock = parseFloat(item.minimumStock || "0");
        return minStock > 0 && stock <= minStock;
      });
      
      stockWarnList.value = records;
      stockPagination.total = records.length;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询库存预警列表失败:", error);
    ElMessage.error("查询失败，请稍后重试");
  } finally {
    stockLoading.value = false;
  }
};

const handleStockPageChange = (page: number) => {
  stockPagination.currentPage = page;
  loadStockList();
};

const handleStockSizeChange = (size: number) => {
  stockPagination.pageSize = size;
  loadStockList();
};

onMounted(() => {
  loadStockList();
});
</script>

<template>
  <div class="warn-container">
    <el-tabs v-model="activeTab" class="warn-tabs" @tab-click="handleTabChange">
      <!-- ========== 有效期预警 ========== -->
      <el-tab-pane label="有效期预警" name="expiry">
        <div class="tab-content">
          <div class="main">
            <el-form
              ref="expiryQueryFormRef"
              :model="expiryQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item label="输入药品名查询" prop="keyword">
                <el-input
                  v-model="expiryQueryForm.keyword"
                  placeholder="药品名称"
                  clearable
                  class="!w-[200px]"
                />
              </el-form-item>
              <el-form-item label="失效期限" prop="expireDays">
                <el-select
                  v-model="expiryQueryForm.expireDays"
                  placeholder="全部"
                  clearable
                  class="!w-[120px]"
                >
                  <el-option
                    v-for="item in expiryExpireOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="药品分类" prop="category">
                <el-select
                  v-model="expiryQueryForm.category"
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
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  :loading="expiryLoading"
                  @click="handleExpirySearch"
                >
                  查询
                </el-button>
              </el-form-item>
            </el-form>

            <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="有效期预警"
                :columns="expiryColumns"
                @refresh="loadExpiryList"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="expiryTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="expiryLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="expiryList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="expiryPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleExpirySizeChange"
                    @page-current-change="handleExpiryPageChange"
                  >
                    <template #remainDays="{ row }">
                      <span
                        :class="{
                          'text-danger': row.remainDays === '已过期',
                          'text-warning':
                            row.remainDays !== '已过期' &&
                            row.remainDays !== '无'
                        }"
                      >
                        {{ row.remainDays }}
                      </span>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== 库存预警 ========== -->
      <el-tab-pane label="库存预警" name="stock" lazy>
        <div class="tab-content">
          <div class="main">
            <el-form
              ref="stockQueryFormRef"
              :model="stockQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item label="输入药品名查询" prop="keyword">
                <el-input
                  v-model="stockQueryForm.keyword"
                  placeholder="药品名称"
                  clearable
                  class="!w-[200px]"
                />
              </el-form-item>
              <el-form-item label="药品分类" prop="category">
                <el-select
                  v-model="stockQueryForm.category"
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
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  :loading="stockLoading"
                  @click="handleStockSearch"
                >
                  查询
                </el-button>
              </el-form-item>
            </el-form>

            <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="库存预警"
                :columns="stockColumns"
                @refresh="loadStockList"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="stockTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="stockLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="stockWarnList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="stockPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleStockSizeChange"
                    @page-current-change="handleStockPageChange"
                  />
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.warn-container {
  .warn-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 16px;
      background-color: var(--el-bg-color);
    }
  }

  .tab-content {
    padding-top: 8px;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.text-danger {
  color: var(--el-color-danger);
}

.text-warning {
  color: var(--el-color-warning);
}
</style>
