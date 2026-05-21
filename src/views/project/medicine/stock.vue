<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import Plus from "@iconify-icons/ep/plus";
import Back from "@iconify-icons/ep/back";
import Check from "@iconify-icons/ep/check";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import BqMedicineSelector from "@/components/BqMedicineSelector";
import {
  getDrugStockPageApi,
  type BQDrugStockEntityType
} from "@/api/pharmacy/stock";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "ProjectMedicineStock"
});

// ==================== 标签页 ====================
const activeTab = ref("inventory");

const handleTabChange = () => {
  if (activeTab.value === "check") {
    loadCheckList();
  }
};

// ==================== 药品库存 Tab ====================
const inventoryTableRef = ref();
const inventoryContentRef = ref();
const inventoryQueryFormRef = ref();
const inventoryLoading = ref(false);

const inventoryQueryForm = reactive({
  keyword: "",
  category: ""
});

const categoryOptions = [
  { label: "全部", value: "" },
  { label: "西药", value: "西药" },
  { label: "中成药", value: "中成药" },
  { label: "中草药", value: "中草药" },
  { label: "耗材", value: "耗材" }
];

const inventoryColumns: TableColumnList = [
  { label: "药品名称", prop: "name", minWidth: 180 },
  { label: "规格", prop: "specification", minWidth: 120 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 180 },
  { label: "类型", prop: "typeString", minWidth: 100 },
  { label: "当前库存", prop: "stock", minWidth: 120 },
  { label: "最低库存", prop: "minimumStock", minWidth: 120 },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

const inventoryList = ref<BQDrugStockEntityType[]>([]);

const inventoryPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleInventorySearch = () => {
  inventoryPagination.currentPage = 1;
  loadInventoryList();
};

const handleInventoryReset = () => {
  inventoryQueryForm.keyword = "";
  inventoryQueryForm.category = "";
  inventoryPagination.currentPage = 1;
  loadInventoryList();
};

const loadInventoryList = async () => {
  inventoryLoading.value = true;
  try {
    const filters: any[] = [];
    
    if (inventoryQueryForm.keyword) {
      filters.push(new BQSearchFilter("name", "like", inventoryQueryForm.keyword));
    }
    
    if (inventoryQueryForm.category) {
      filters.push(new BQSearchFilter("typeString", "eq", inventoryQueryForm.category));
    }
    
    const params = {
      current: inventoryPagination.currentPage,
      size: inventoryPagination.pageSize,
      filters: filters.length > 0 ? filters : undefined
    };
    
    const res = await getDrugStockPageApi(params);
    if (res.code === 0 && res.data) {
      inventoryList.value = res.data.records || [];
      inventoryPagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询药品库存列表失败:", error);
    ElMessage.error("查询失败，请稍后重试");
  } finally {
    inventoryLoading.value = false;
  }
};

const handleInventoryPageChange = (page: number) => {
  inventoryPagination.currentPage = page;
  loadInventoryList();
};

const handleInventorySizeChange = (size: number) => {
  inventoryPagination.pageSize = size;
  loadInventoryList();
};

// ==================== 库存详情 ====================
const showDetail = ref(false);
const currentDrug = ref<any>({});

const detailColumns: TableColumnList = [
  { label: "入库单号", prop: "inboundNo", minWidth: 180 },
  { label: "入库时间", prop: "inboundTime", minWidth: 160 },
  { label: "入库数量", prop: "quantity", minWidth: 100 },
  { label: "进货价", prop: "purchasePrice", minWidth: 100 },
  { label: "入库类型", prop: "inboundType", minWidth: 100 },
  { label: "操作人", prop: "operator", minWidth: 100 },
  { label: "生产批号", prop: "batchNo", minWidth: 120 },
  { label: "批次库存", prop: "batchStock", minWidth: 100 }
];

const detailList = ref<any[]>([]);
const detailLoading = ref(false);
const detailTableRef = ref();

const detailPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleViewStockDetail = (row: any) => {
  currentDrug.value = row;
  detailList.value = [
    // {
    //   id: "1",
    //   inboundNo: "1901041044143502",
    //   inboundTime: "2019-01-04 10:44:03",
    //   quantity: "3盒2粒",
    //   purchasePrice: "0.0元",
    //   inboundType: "其他入库",
    //   operator: "曾俊华",
    //   batchNo: "",
    //   batchStock: "0盒0粒"
    // }
  ];
  detailPagination.total = 1;
  showDetail.value = true;
};

const handleDetailPageChange = (page: number) => {
  detailPagination.currentPage = page;
};

const handleDetailSizeChange = (size: number) => {
  detailPagination.pageSize = size;
};

const handleBackToList = () => {
  showDetail.value = false;
};

// ==================== 库存盘点 Tab ====================
const checkTableRef = ref();
const checkContentRef = ref();
const checkQueryFormRef = ref();
const checkLoading = ref(false);

const checkQueryForm = reactive({
  orderNo: "",
  startTime: "",
  endTime: "",
  checker: ""
});

const checkerOptions = [
  { label: "全部", value: "" }
  // { label: "曾俊华", value: "曾俊华" }
];

const checkColumns: TableColumnList = [
  { label: "序号", prop: "serialNo", minWidth: 80 },
  { label: "盘点单号", prop: "orderNo", minWidth: 200 },
  { label: "盘点种类", prop: "checkType", minWidth: 120 },
  { label: "盘点时间", prop: "checkTime", minWidth: 160 },
  { label: "盘点人", prop: "checker", minWidth: 120 },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

const checkList = ref<any[]>([
  // {
  //   id: "1",
  //   serialNo: "001",
  //   orderNo: "2604121804306969",
  //   checkType: "1",
  //   checkTime: "2026-04-12",
  //   checker: "曾俊华"
  // }
]);

const checkPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 1
});

const loadCheckList = () => {
  // TODO: 调用库存盘点列表接口
};

const handleCheckSearch = () => {
  checkPagination.currentPage = 1;
  loadCheckList();
};

const handleCheckReset = () => {
  checkQueryForm.orderNo = "";
  checkQueryForm.startTime = "";
  checkQueryForm.endTime = "";
  checkQueryForm.checker = "";
  checkPagination.currentPage = 1;
  loadCheckList();
};

const handleCheckPageChange = (page: number) => {
  checkPagination.currentPage = page;
  loadCheckList();
};

const handleCheckSizeChange = (size: number) => {
  checkPagination.pageSize = size;
  loadCheckList();
};

// ==================== 新建盘点单 ====================
const showNewCheck = ref(false);

const newCheckForm = reactive({
  checkDate: "2026-04-12",
  checker: "",
  items: [
    {
      id: "d1",
      medicineName: "太子参",
      category: "中药",
      specification: "g",
      manufacturer: "",
      bookQuantity: "1500.0",
      unit: "g",
      actualQuantity: ""
    }
  ] as any[]
});

const newCheckSelectedDrug = ref("");

const handleNewCheckDrugSelect = (medicine: any) => {
  const exists = newCheckForm.items.find(i => i.id === medicine.id);
  if (exists) {
    ElMessage.warning("该药品已添加");
    newCheckSelectedDrug.value = "";
    return;
  }
  newCheckForm.items.push({
    id: medicine.id,
    medicineName: medicine.name,
    category: medicine.category || "",
    specification: medicine.spec,
    manufacturer: medicine.manufacturer,
    bookQuantity: medicine.stock || "0",
    unit: "g", // 默认单位，可根据实际情况调整
    actualQuantity: ""
  });
  newCheckSelectedDrug.value = "";
};

const handleNewCheck = () => {
  newCheckForm.items = [
    {
      id: "d1",
      medicineName: "太子参",
      category: "中药",
      specification: "g",
      manufacturer: "",
      bookQuantity: "1500.0",
      unit: "g",
      actualQuantity: ""
    }
  ];
  newCheckSelectedDrug.value = "";
  showNewCheck.value = true;
};

const removeNewCheckItem = (index: number) => {
  newCheckForm.items.splice(index, 1);
};

const handleCheckComplete = () => {
  ElMessageBox.confirm("确认完成本次盘点吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    ElMessage.success("盘点完成");
    showNewCheck.value = false;
    loadCheckList();
  });
};

const handleBackFromNewCheck = () => {
  showNewCheck.value = false;
};

// ==================== 盘点详情 ====================
const showCheckDetail = ref(false);
const currentCheck = ref<any>({});

const checkDetailColumns: TableColumnList = [
  { label: "药品名称", prop: "medicineName", minWidth: 150 },
  { label: "规格", prop: "specification", minWidth: 100 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 150 },
  { label: "药品分类", prop: "category", minWidth: 100 },
  { label: "账面数量", prop: "bookQuantity", minWidth: 110 },
  { label: "实际数量", prop: "actualQuantity", minWidth: 110 },
  { label: "进货价", prop: "purchasePrice", minWidth: 110 },
  { label: "盈亏价", prop: "profitLoss", minWidth: 100 }
];

const checkDetailList = ref<any[]>([]);
const checkDetailLoading = ref(false);
const checkDetailTableRef = ref();

const checkDetailPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleViewCheckDetail = (row: any) => {
  currentCheck.value = row;
  checkDetailList.value = [
    {
      id: "1",
      medicineName: "太子参",
      specification: "g",
      manufacturer: "",
      category: "中药",
      bookQuantity: "1500.0g",
      actualQuantity: "1500.0g",
      purchasePrice: "0.09元/g",
      profitLoss: "0.00元"
    }
  ];
  checkDetailPagination.total = 1;
  showCheckDetail.value = true;
};

const handleCheckDetailPageChange = (page: number) => {
  checkDetailPagination.currentPage = page;
};

const handleCheckDetailSizeChange = (size: number) => {
  checkDetailPagination.pageSize = size;
};

const handleBackToCheckList = () => {
  showCheckDetail.value = false;
};

onMounted(() => {
  loadInventoryList();
});
</script>

<template>
  <div class="stock-container">
    <el-tabs
      v-model="activeTab"
      class="stock-tabs"
      @tab-click="handleTabChange"
    >
      <!-- ========== 药品库存 ========== -->
      <el-tab-pane label="药品库存" name="inventory">
        <div class="tab-content">
          <!-- 列表视图 -->
          <div v-if="!showDetail" class="main">
            <el-form
              ref="inventoryQueryFormRef"
              :model="inventoryQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item label="药品分类" prop="category">
                <el-select
                  v-model="inventoryQueryForm.category"
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
              <el-form-item prop="keyword">
                <el-input
                  v-model="inventoryQueryForm.keyword"
                  placeholder="输入药品名/生产厂家搜索"
                  clearable
                  class="!w-[220px]"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  :loading="inventoryLoading"
                  @click="handleInventorySearch"
                >
                  查询
                </el-button>
              </el-form-item>
            </el-form>

            <div
              ref="inventoryContentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="药品库存"
                :columns="inventoryColumns"
                @refresh="loadInventoryList"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="inventoryTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="inventoryLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="inventoryList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="inventoryPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleInventorySizeChange"
                    @page-current-change="handleInventoryPageChange"
                  >
                    <template #operation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewStockDetail(row)"
                      >
                        库存详情
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>

          <!-- 库存详情视图 -->
          <div v-else class="detail-view">
            <div class="detail-header">
              <div class="detail-info">
                <span class="detail-label"
                  >药品名称：<span class="detail-value">{{
                    currentDrug.medicineName
                  }}</span></span
                >
                <span class="detail-label ml-8"
                  >当前库存：<span class="detail-value">{{
                    currentDrug.currentStock
                  }}</span></span
                >
              </div>
              <el-button
                type="primary"
                :icon="useRenderIcon(Back)"
                @click="handleBackToList"
              >
                返回
              </el-button>
            </div>

            <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title=""
                :columns="detailColumns"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="detailTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="detailLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="detailList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="detailPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleDetailSizeChange"
                    @page-current-change="handleDetailPageChange"
                  />
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== 库存盘点 ========== -->
      <el-tab-pane label="库存盘点" name="check" lazy>
        <div class="tab-content">
          <!-- 新建盘点单视图 -->
          <div v-if="showNewCheck" class="new-check-view">
            <div class="new-check-header">
              <div class="new-check-info">
                <span class="new-check-item"
                  >盘点日期：<span class="new-check-value">{{
                    newCheckForm.checkDate
                  }}</span></span
                >
                <span class="new-check-item"
                  >盘点人：<span class="new-check-value">{{
                    newCheckForm.checker
                  }}</span></span
                >
              </div>
              <div class="new-check-actions">
                <el-button
                  type="primary"
                  :icon="useRenderIcon(Check)"
                  @click="handleCheckComplete"
                >
                  盘点完成
                </el-button>
                <el-button
                  type="primary"
                  :icon="useRenderIcon(Back)"
                  @click="handleBackFromNewCheck"
                >
                  返回
                </el-button>
              </div>
            </div>

            <div class="new-check-table-wrapper">
              <table class="new-check-table">
                <thead>
                  <tr>
                    <th style="min-width: 160px">药品名称</th>
                    <th style="min-width: 120px">药品分类</th>
                    <th style="min-width: 100px">规格</th>
                    <th style="min-width: 160px">生产厂家</th>
                    <th style="min-width: 110px">账面数量</th>
                    <th style="min-width: 130px">实际数量</th>
                    <th style="width: 60px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in newCheckForm.items"
                    :key="item.id"
                  >
                    <td>
                      <span class="cell-text">{{ item.medicineName }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.category }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.specification }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.manufacturer }}</span>
                    </td>
                    <td>
                      <span class="cell-text"
                        >{{ item.bookQuantity }}{{ item.unit }}</span
                      >
                    </td>
                    <td>
                      <div class="input-with-unit">
                        <el-input
                          v-model="item.actualQuantity"
                          type="number"
                          class="cell-input required-input"
                        />
                        <span class="cell-unit">{{ item.unit }}</span>
                      </div>
                    </td>
                    <td>
                      <el-button
                        type="danger"
                        link
                        @click="removeNewCheckItem(index)"
                      >
                        <IconifyIconOffline :icon="Delete" />
                      </el-button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="7" class="add-drug-row">
                      <BqMedicineSelector
                        v-model="newCheckSelectedDrug"
                        class="add-drug-selector"
                        @select="handleNewCheckDrugSelect"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else-if="!showCheckDetail" class="main">
            <el-form
              ref="checkQueryFormRef"
              :model="checkQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item prop="orderNo">
                <el-input
                  v-model="checkQueryForm.orderNo"
                  placeholder="输入盘点单号"
                  clearable
                  class="!w-[180px]"
                />
              </el-form-item>
              <el-form-item label="盘点时间" prop="startTime">
                <el-date-picker
                  v-model="checkQueryForm.startTime"
                  type="date"
                  placeholder=""
                  value-format="YYYY-MM-DD"
                  class="!w-[140px]"
                />
              </el-form-item>
              <el-form-item prop="endTime">
                <span class="date-separator">-</span>
                <el-date-picker
                  v-model="checkQueryForm.endTime"
                  type="date"
                  placeholder=""
                  value-format="YYYY-MM-DD"
                  class="!w-[140px]"
                />
              </el-form-item>
              <el-form-item label="盘点人" prop="checker">
                <el-select
                  v-model="checkQueryForm.checker"
                  placeholder="全部"
                  clearable
                  class="!w-[120px]"
                >
                  <el-option
                    v-for="item in checkerOptions"
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
                  :loading="checkLoading"
                  @click="handleCheckSearch"
                >
                  查询
                </el-button>
              </el-form-item>
            </el-form>

            <div
              ref="checkContentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="库存盘点"
                :columns="checkColumns"
                @refresh="loadCheckList"
              >
                <template #buttons>
                  <el-button
                    type="primary"
                    :icon="useRenderIcon(Plus)"
                    @click="handleNewCheck"
                  >
                    新建盘点单
                  </el-button>
                </template>
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="checkTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="checkLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="checkList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="checkPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleCheckSizeChange"
                    @page-current-change="handleCheckPageChange"
                  >
                    <template #operation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewCheckDetail(row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>

          <!-- 盘点详情视图 -->
          <div v-else class="check-detail-view">
            <div class="check-detail-header">
              <div class="check-detail-info">
                <span class="check-info-item"
                  >盘点单号：<span class="check-info-value">{{
                    currentCheck.orderNo
                  }}</span></span
                >
                <span class="check-info-item"
                  >盘点日期：<span class="check-info-value">{{
                    currentCheck.checkTime
                  }}</span></span
                >
                <span class="check-info-item"
                  >盘点人：<span class="check-info-value">{{
                    currentCheck.checker
                  }}</span></span
                >
                <span class="check-info-item"
                  >盈亏进货总金额：<span class="check-info-value"
                    >0.00元</span
                  ></span
                >
              </div>
              <el-button
                type="primary"
                :icon="useRenderIcon(Back)"
                @click="handleBackToCheckList"
              >
                返回上一级
              </el-button>
            </div>

            <div class="check-detail-title">盘点详情列表</div>

            <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title=""
                :columns="checkDetailColumns"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="checkDetailTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="checkDetailLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="checkDetailList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="checkDetailPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleCheckDetailSizeChange"
                    @page-current-change="handleCheckDetailPageChange"
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
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.date-separator {
  margin: 0 4px;
  color: #606266;
}

.new-check-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  box-sizing: border-box;

  .new-check-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .new-check-info {
      display: flex;
      align-items: center;
      gap: 32px;
      font-size: 14px;
      color: #606266;

      .new-check-item {
        white-space: nowrap;
      }

      .new-check-value {
        color: #303133;
        font-weight: 500;
      }
    }

    .new-check-actions {
      display: flex;
      gap: 8px;
    }
  }

  .new-check-table-wrapper {
    flex: 1;
    overflow: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .new-check-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      thead {
        background-color: #f5f7fa;
        position: sticky;
        top: 0;
        z-index: 1;

        th {
          padding: 10px 8px;
          text-align: center;
          font-weight: 600;
          color: #606266;
          border-bottom: 1px solid #e4e7ed;
          white-space: nowrap;
        }
      }

      tbody {
        tr {
          &:hover {
            background-color: #f5f7fa;
          }

          td {
            padding: 6px 8px;
            border-bottom: 1px solid #ebeef5;
            vertical-align: middle;
            text-align: center;

            .cell-text {
              font-size: 13px;
              color: #606266;
            }

            .input-with-unit {
              display: flex;
              align-items: center;
              gap: 4px;

              .cell-input {
                flex: 1;
                min-width: 0;
              }

              .cell-unit {
                font-size: 12px;
                color: #606266;
                white-space: nowrap;
              }
            }

            .required-input {
              :deep(.el-input__wrapper) {
                box-shadow: 0 0 0 1px #ffb8b8 inset;
                background-color: #fff8f8;

                &:hover {
                  box-shadow: 0 0 0 1px #f56c6c inset;
                }

                &.is-focus {
                  box-shadow: 0 0 0 1px #f56c6c inset;
                }
              }
            }

            &.add-drug-row {
              text-align: left;

              .add-drug-selector {
                width: 180px;
              }
            }
          }
        }
      }
    }
  }
}

.check-detail-view {
  height: 100%;

  .check-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e4e7ed;

    .check-detail-info {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      font-size: 14px;
      color: #606266;

      .check-info-item {
        white-space: nowrap;
      }

      .check-info-value {
        color: #303133;
        font-weight: 500;
      }
    }
  }

  .check-detail-title {
    padding: 12px 20px 4px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    border-left: 3px solid var(--el-color-primary);
    margin: 8px 20px 0;
    line-height: 1.4;
  }
}

.detail-view {
  height: 100%;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e4e7ed;

    .detail-info {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #606266;

      .detail-label {
        white-space: nowrap;
      }

      .detail-value {
        color: #303133;
        font-weight: 500;
      }

      .ml-8 {
        margin-left: 32px;
      }
    }
  }
}

.stock-container {
  height: 100%;

  .stock-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      flex-shrink: 0;
      margin-bottom: 0;
      background-color: #fff;
      padding-left: 20px;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
    }
  }

  .tab-content {
    height: calc(100vh - 169px);
    background-color: #fff;
    overflow: hidden;
  }
}
</style>
