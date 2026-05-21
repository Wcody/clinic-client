<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import Delete from "@iconify-icons/ep/delete";
import Back from "@iconify-icons/ep/back";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import BqMedicineSelector from "@/components/BqMedicineSelector";
import {
  getDrugSalesPageApi,
  addDrugSalesApi,
  type BQDrugSalesEntityType
} from "@/api/pharmacy/sales";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "ProjectMedicineOut"
});

// ==================== 标签页 ====================
const activeTab = ref("form");

const handleTabChange = () => {
  if (activeTab.value === "record") {
    loadRecordList();
  }
};

const switchToRecord = () => {
  activeTab.value = "record";
  loadRecordList();
};

const switchToForm = () => {
  activeTab.value = "form";
};

// ==================== 新增出库 Tab ====================
const outboundForm = reactive({
  operator: "",
  outboundType: "领用出库",
  items: [] as any[]
});

const outboundTypeOptions = [
  { label: "领用出库", value: "领用出库" },
  { label: "销售出库", value: "销售出库" },
  { label: "调拨出库", value: "调拨出库" },
  { label: "其他出库", value: "其他出库" }
];

const getUnitFromSpec = (spec: string): string => {
  if (!spec) return "";
  const parts = spec.split("/");
  return parts[parts.length - 1]?.trim() || "";
};

const newDrugName = ref("");

const handleDrugSelect = (medicine: any) => {
  outboundForm.items.push({
    drugId: medicine.id,
    drugName: medicine.name,
    specification: medicine.spec,
    manufacturer: medicine.manufacturer,
    unit: "g", // 默认单位，可根据实际情况调整
    quantity: "",
    prescriptionPrice: `${medicine.price}元/g`,
    purchasePrice: `${(parseFloat(medicine.price) * 0.3).toFixed(2)}元/g`, // 假设成本价是处方价的30%
    productionDate: "",
    expiryDate: "",
    batchNo: "",
    supplier: "",
    remark: ""
  });
  newDrugName.value = "";
};

const removeOutboundItem = (index: number) => {
  outboundForm.items.splice(index, 1);
};

const parsePrice = (priceStr: string): number => {
  const match = priceStr?.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

const totalPrescriptionAmount = computed(() => {
  return outboundForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parsePrice(item.prescriptionPrice);
    return sum + qty * price;
  }, 0);
});

const totalCostAmount = computed(() => {
  return outboundForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parsePrice(item.purchasePrice);
    return sum + qty * price;
  }, 0);
});

const handleSave = () => {
  if (outboundForm.items.length === 0) {
    ElMessage.warning("请至少添加一行药品");
    return;
  }
  const hasEmpty = outboundForm.items.some(
    item => !item.drugName || !item.quantity
  );
  if (hasEmpty) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }
  // TODO: 调用保存接口
  ElMessage.success("保存成功");
};

// ==================== 出库记录 Tab ====================
const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const recordLoading = ref(false);

const recordQueryForm = reactive({
  keyword: "",
  startTime: "",
  endTime: "",
  outboundType: ""
});

const recordColumns: TableColumnList = [
  { label: "序号", prop: "serialNo", minWidth: 100 },
  { label: "出库单号", prop: "orderNo", minWidth: 200 },
  { label: "出库时间", prop: "outboundTime", minWidth: 160 },
  { label: "出库金额", prop: "amount", minWidth: 120 },
  { label: "出库类型", prop: "outboundType", minWidth: 120 },
  { label: "操作人", prop: "operator", minWidth: 120 },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

const recordList = ref<any[]>([
  // {
  //   id: "1",
  //   serialNo: "001",
  //   orderNo: "2604121826727232",
  //   outboundTime: "2026-04-12",
  //   amount: "0.30元",
  //   outboundType: "领用出库",
  //   operator: "曾俊华"
  // }
]);

const recordPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 1
});

// ==================== 出库详情 ====================
const showRecordDetail = ref(false);
const currentRecord = ref<any>({});

const recordDetailColumns: TableColumnList = [
  { label: "药品名称", prop: "medicineName", minWidth: 120 },
  { label: "规格", prop: "specification", minWidth: 80 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 140 },
  { label: "出库数量", prop: "quantity", minWidth: 100 },
  { label: "处方价", prop: "prescriptionPrice", minWidth: 100 },
  { label: "进货价", prop: "purchasePrice", minWidth: 100 },
  { label: "生产日期", prop: "productionDate", minWidth: 110 },
  { label: "有效日期", prop: "expiryDate", minWidth: 110 },
  { label: "生产批号", prop: "batchNo", minWidth: 110 },
  { label: "供应商", prop: "supplier", minWidth: 150 },
  { label: "备注", prop: "remark", minWidth: 80 }
];

const recordDetailList = ref<any[]>([]);
const recordDetailLoading = ref(false);
const recordDetailTableRef = ref();

const recordDetailPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const loadRecordList = () => {
  // TODO: 调用出库记录接口
};

const handleSearch = () => {
  recordPagination.currentPage = 1;
  loadRecordList();
};

const handleResetQuery = () => {
  recordQueryForm.keyword = "";
  recordQueryForm.startTime = "";
  recordQueryForm.endTime = "";
  recordQueryForm.outboundType = "";
  recordPagination.currentPage = 1;
  loadRecordList();
};

const handlePageChange = (page: number) => {
  recordPagination.currentPage = page;
  loadRecordList();
};

const handleSizeChange = (size: number) => {
  recordPagination.pageSize = size;
  loadRecordList();
};

const handleViewDetail = (row: any) => {
  currentRecord.value = row;
  recordDetailList.value = [
    {
      id: "1",
      medicineName: "太子参",
      specification: "g",
      manufacturer: "",
      quantity: "1.0g",
      prescriptionPrice: "0.30元/g",
      purchasePrice: "0.09元/g",
      productionDate: "2019-04-01",
      expiryDate: "暂无",
      batchNo: "",
      supplier: "广东清源中药饮片有限公司",
      remark: ""
    }
  ];
  recordDetailPagination.total = 1;
  showRecordDetail.value = true;
};

const handleRecordDetailPageChange = (page: number) => {
  recordDetailPagination.currentPage = page;
};

const handleRecordDetailSizeChange = (size: number) => {
  recordDetailPagination.pageSize = size;
};

const handleBackToRecord = () => {
  showRecordDetail.value = false;
};

const handlePrint = () => {
  ElMessage.info("打印出库单");
};

onMounted(() => {});
</script>

<template>
  <div class="outbound-container">
    <el-tabs
      v-model="activeTab"
      class="outbound-tabs"
      @tab-click="handleTabChange"
    >
      <!-- ========== 新增出库 ========== -->
      <el-tab-pane label="新增出库" name="form">
        <div class="tab-content">
          <div class="outbound-form-container">
            <!-- 顶部操作栏 -->
            <div class="outbound-header">
              <div class="header-left">
                <span class="operator-label"
                  >操作人：{{ outboundForm.operator }}</span
                >
                <el-form-item label="出库类型" class="type-form-item">
                  <el-select
                    v-model="outboundForm.outboundType"
                    class="!w-[130px]"
                  >
                    <el-option
                      v-for="opt in outboundTypeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <el-button type="primary" @click="switchToRecord">
                查看出库记录
              </el-button>
            </div>

            <!-- 药品表格 -->
            <div class="outbound-table-wrapper">
              <table class="outbound-table">
                <thead>
                  <tr>
                    <th style="min-width: 160px">药品名称</th>
                    <th style="min-width: 110px">规格</th>
                    <th style="min-width: 130px">生产厂家</th>
                    <th style="min-width: 90px">出库数量</th>
                    <th style="min-width: 90px">处方价</th>
                    <th style="min-width: 90px">进货价</th>
                    <th style="min-width: 130px">生产日期</th>
                    <th style="min-width: 130px">有效日期</th>
                    <th style="min-width: 120px">生产批号</th>
                    <th style="min-width: 110px">供应商</th>
                    <th style="min-width: 100px">备注</th>
                    <th style="width: 60px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 已选药品行 -->
                  <tr v-for="(item, index) in outboundForm.items" :key="index">
                    <td>
                      <span class="drug-name-label">{{ item.drugName }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.specification }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.manufacturer }}</span>
                    </td>
                    <td>
                      <el-tooltip
                        content="必填项"
                        placement="top"
                        :show-after="300"
                      >
                        <div class="input-with-unit">
                          <el-input
                            v-model="item.quantity"
                            type="number"
                            class="cell-input required-input"
                          />
                          <span class="cell-unit">{{ item.unit }}</span>
                        </div>
                      </el-tooltip>
                    </td>
                    <td>
                      <span class="cell-text price-text">{{
                        item.prescriptionPrice
                      }}</span>
                    </td>
                    <td>
                      <span class="cell-text price-text">{{
                        item.purchasePrice
                      }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.productionDate }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{
                        item.expiryDate || "暂无"
                      }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.batchNo }}</span>
                    </td>
                    <td>
                      <span class="cell-text">{{ item.supplier }}</span>
                    </td>
                    <td>
                      <el-input v-model="item.remark" class="cell-input" />
                    </td>
                    <td>
                      <el-button
                        type="danger"
                        link
                        @click="removeOutboundItem(index)"
                      >
                        <IconifyIconOffline :icon="Delete" />
                      </el-button>
                    </td>
                  </tr>

                  <!-- 药品选择行 -->
                  <tr>
                    <td colspan="12" class="add-drug-row">
                      <BqMedicineSelector
                        v-model="newDrugName"
                        class="add-drug-selector"
                        @select="handleDrugSelect"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 底部操作区 -->
            <div class="outbound-footer">
              <div class="total-info">
                <span class="total-label">
                  合计处方金额：
                  <span class="total-value">{{
                    totalPrescriptionAmount.toFixed(0)
                  }}</span>
                  元
                </span>
                <span class="total-label ml-8">
                  合计成本金额：
                  <span class="total-value">{{
                    totalCostAmount.toFixed(0)
                  }}</span>
                  元
                </span>
              </div>
              <el-button type="primary" class="btn-save" @click="handleSave">
                保存
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== 出库记录 ========== -->
      <el-tab-pane label="出库记录" name="record" lazy>
        <div class="tab-content">
          <!-- 列表视图 -->
          <div v-if="!showRecordDetail" class="main">
            <el-form
              ref="queryFormRef"
              :model="recordQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item prop="keyword">
                <el-input
                  v-model="recordQueryForm.keyword"
                  placeholder="输入单号查询"
                  clearable
                  class="!w-[180px]"
                />
              </el-form-item>
              <el-form-item prop="startTime">
                <el-date-picker
                  v-model="recordQueryForm.startTime"
                  type="date"
                  placeholder="起始时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[150px]"
                />
              </el-form-item>
              <el-form-item prop="endTime">
                <el-date-picker
                  v-model="recordQueryForm.endTime"
                  type="date"
                  placeholder="结束时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[150px]"
                />
              </el-form-item>
              <el-form-item label="出库类型" prop="outboundType">
                <el-select
                  v-model="recordQueryForm.outboundType"
                  placeholder="全部"
                  clearable
                  class="!w-[120px]"
                >
                  <el-option label="全部" value="" />
                  <el-option label="领用出库" value="领用出库" />
                  <el-option label="销售出库" value="销售出库" />
                  <el-option label="调拨出库" value="调拨出库" />
                  <el-option label="其他出库" value="其他出库" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  :loading="recordLoading"
                  @click="handleSearch"
                >
                  查询
                </el-button>
                <el-button type="primary" @click="switchToForm">
                  新增出库
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
                title="出库记录"
                :columns="recordColumns"
                @refresh="loadRecordList"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="tableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="recordLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="recordList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="recordPagination"
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
                        @click="handleViewDetail(row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>

          <!-- 出库详情视图 -->
          <div v-else class="record-detail-view">
            <div class="record-detail-header">
              <div class="record-detail-info">
                <span class="detail-item"
                  >出库单号：<span class="detail-value">{{
                    currentRecord.orderNo
                  }}</span></span
                >
                <span class="detail-item"
                  >出库时间：<span class="detail-value">{{
                    currentRecord.outboundTime
                  }}</span></span
                >
                <span class="detail-item"
                  >出库金额：<span class="detail-value">{{
                    currentRecord.amount
                  }}</span></span
                >
                <span class="detail-item"
                  >出库类型：<span class="detail-value">{{
                    currentRecord.outboundType
                  }}</span></span
                >
              </div>
              <div class="record-detail-actions">
                <el-button type="primary" @click="handlePrint">打印</el-button>
                <el-button
                  type="primary"
                  :icon="useRenderIcon(Back)"
                  @click="handleBackToRecord"
                >
                  返回出库记录
                </el-button>
              </div>
            </div>

            <div class="record-detail-title">出库明细列表</div>

            <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title=""
                :columns="recordDetailColumns"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="recordDetailTableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="recordDetailLoading"
                    :size="size"
                    adaptive
                    border
                    stripe
                    :adaptiveConfig="{ offsetBottom: 108 }"
                    :data="recordDetailList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="recordDetailPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleRecordDetailSizeChange"
                    @page-current-change="handleRecordDetailPageChange"
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

.outbound-container {
  height: 100%;

  .outbound-tabs {
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

  .outbound-form-container {
    padding: 16px 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .outbound-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 24px;

        .operator-label {
          font-size: 14px;
          color: #303133;
        }

        .type-form-item {
          margin-bottom: 0;
        }
      }
    }

    .outbound-table-wrapper {
      flex: 1;
      overflow: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

      .outbound-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;

        thead {
          background-color: #f5f7fa;
          position: sticky;
          top: 0;
          z-index: 1;

          th {
            padding: 10px 6px;
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
              padding: 6px;
              border-bottom: 1px solid #ebeef5;
              vertical-align: middle;
              text-align: center;

              .cell-input,
              .cell-select,
              .cell-date {
                width: 100%;
              }

              .drug-name-label {
                display: block;
                font-size: 13px;
                color: #303133;
                word-break: break-all;
                text-align: left;
                padding: 0 4px;
              }

              .cell-text {
                font-size: 13px;
                color: #606266;
              }

              .price-text {
                white-space: nowrap;
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

              .required-date-wrapper {
                width: 100%;

                :deep(.el-input__wrapper) {
                  box-shadow: 0 0 0 1px #ffb8b8 inset;
                  background-color: #fff8f8;

                  &:hover {
                    box-shadow: 0 0 0 1px #f56c6c inset;
                  }
                }

                .cell-date {
                  width: 100%;
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

    .outbound-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 12px;
      gap: 24px;

      .total-info {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #303133;

        .total-label {
          white-space: nowrap;
        }

        .total-value {
          color: #f56c6c;
          font-weight: 600;
          font-size: 16px;
          margin: 0 2px;
        }

        .ml-8 {
          margin-left: 32px;
        }
      }

      .btn-save {
        min-width: 80px;
      }
    }
  }
}

.record-detail-view {
  height: 100%;

  .record-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e4e7ed;

    .record-detail-info {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      font-size: 14px;
      color: #606266;

      .detail-item {
        white-space: nowrap;
      }

      .detail-value {
        color: #303133;
        font-weight: 500;
      }
    }

    .record-detail-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }

  .record-detail-title {
    margin: 8px 20px 0;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    border-left: 3px solid var(--el-color-primary);
    line-height: 1.4;
  }
}
</style>
