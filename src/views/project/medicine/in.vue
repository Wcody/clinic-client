<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import BqMedicineSelector from "@/components/BqMedicineSelector";
import {
  getDrugWarehousingPageApi,
  addDrugWarehousingApi,
  deleteLogicDrugWarehousingApi,
  type BQDrugWarehousingEntityType
} from "@/api/pharmacy/warehousing";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "ProjectMedicineIn"
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

// ==================== 新增入库 Tab ====================
const inboundForm = reactive({
  operator: "曾俊华",
  inboundType: "采购入库",
  items: [] as any[]
});

const inboundTypeOptions = [
  { label: "采购入库", value: "采购入库" },
  { label: "赠送入库", value: "赠送入库" },
  { label: "借用入库", value: "借用入库" },
  { label: "退货入库", value: "退货入库" },
  { label: "其他入库", value: "其他入库" }
];

// 从规格中提取单位，如 "30g/盒" → "盒"
const getUnitFromSpec = (spec: string): string => {
  if (!spec) return "";
  const parts = spec.split("/");
  return parts[parts.length - 1]?.trim() || "";
};

// 底部药品选择器
const newDrugName = ref("");

const handleDrugSelect = (medicine: any) => {
  const unit = getUnitFromSpec(medicine.spec);
  inboundForm.items.push({
    drugId: medicine.id,
    drugName: medicine.name,
    specification: medicine.spec,
    unit,
    quantity: "",
    prescriptionPrice: medicine.price,
    purchasePrice: "",
    manufacturer: medicine.manufacturer,
    productionDate: "",
    expiryDate: "",
    batchNo: "",
    supplier: "",
    remark: ""
  });
  newDrugName.value = "";
};

const removeInboundItem = (index: number) => {
  inboundForm.items.splice(index, 1);
};

// ==================== 快捷入库弹窗 ====================
const quickDialogVisible = ref(false);
const quickDialogSelection = ref<any[]>([]);
const quickDialogTableRef = ref();

const quickDrugList = ref([
  {
    id: "q1",
    drugName: "龙脑安神丸",
    specification: "每丸重5g",
    manufacturer: "吉林恒金药业股份有限公司",
    currentStock: "0盒0粒"
  },
  {
    id: "q2",
    drugName: "功立欣灌肠液",
    specification: "50ml*7瓶/条",
    manufacturer: "安徽天洋药业有限公司",
    currentStock: "0瓶0ml"
  },
  {
    id: "q3",
    drugName: "汉武神液",
    specification: "25ml*10支",
    manufacturer: "",
    currentStock: "4盒0支"
  },
  {
    id: "q4",
    drugName: "养肾活血酒(伯诺神液)",
    specification: "10ml*5支/盒",
    manufacturer: "河南省汉帝药业有限公司",
    currentStock: "0盒0支"
  },
  {
    id: "q5",
    drugName: "康怡佳抑菌凝胶",
    specification: "6支/盒",
    manufacturer: "",
    currentStock: "0盒0支"
  },
  {
    id: "q6",
    drugName: "功立欣2号粉",
    specification: "1g*1支/盒",
    manufacturer: "",
    currentStock: "0盒0支"
  },
  {
    id: "q7",
    drugName: "暖宫贴（功立欣）",
    specification: "2贴/盒",
    manufacturer: "",
    currentStock: "0盒0贴"
  }
]);

const quickDialogPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 7
});

const openQuickDialog = () => {
  quickDialogSelection.value = [];
  quickDialogVisible.value = true;
};

const handleQuickSelectionChange = (selection: any[]) => {
  quickDialogSelection.value = selection;
};

const handleQuickConfirm = () => {
  if (quickDialogSelection.value.length === 0) {
    ElMessage.warning("请至少选择一条药品");
    return;
  }
  quickDialogSelection.value.forEach(drug => {
    const unit = getUnitFromSpec(drug.specification);
    inboundForm.items.push({
      drugId: drug.id,
      drugName: drug.drugName,
      specification: drug.specification,
      unit,
      quantity: "",
      prescriptionPrice: drug.prescriptionPrice || "",
      purchasePrice: "",
      manufacturer: drug.manufacturer,
      productionDate: "",
      expiryDate: "",
      batchNo: "",
      supplier: "",
      remark: ""
    });
  });
  quickDialogVisible.value = false;
  ElMessage.success(`已添加 ${quickDialogSelection.value.length} 条药品`);
};

const totalPrescriptionAmount = computed(() => {
  return inboundForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.prescriptionPrice) || 0;
    return sum + qty * price;
  }, 0);
});

const totalCostAmount = computed(() => {
  return inboundForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.purchasePrice) || 0;
    return sum + qty * price;
  }, 0);
});

const handleSave = () => {
  if (inboundForm.items.length === 0) {
    ElMessage.warning("请至少添加一行药品");
    return;
  }
  const hasEmpty = inboundForm.items.some(
    item => !item.drugName || !item.quantity
  );
  if (hasEmpty) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }
  // TODO: 调用保存接口
  ElMessage.success("保存成功");
};

// ==================== 入库记录 Tab ====================
const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const recordLoading = ref(false);

const recordQueryForm = reactive({
  keyword: "",
  startTime: "",
  endTime: "",
  inboundType: ""
});

const recordColumns: TableColumnList = [
  { label: "序号", prop: "serialNo", minWidth: 100 },
  { label: "入库单号", prop: "orderNo", minWidth: 180 },
  { label: "入库时间", prop: "inboundTime", minWidth: 160 },
  { label: "入库金额", prop: "amount", minWidth: 120 },
  { label: "入库类型", prop: "inboundType", minWidth: 120 },
  { label: "操作人", prop: "operator", minWidth: 120 },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

const recordList = ref([
  {
    id: "1",
    serialNo: "001",
    orderNo: "240830182044091 4",
    inboundTime: "2024-08-30",
    amount: "189.80元",
    inboundType: "采购入库",
    operator: "曾俊华"
  },
  {
    id: "2",
    serialNo: "002",
    orderNo: "240830181858628 4",
    inboundTime: "2024-08-30",
    amount: "0.00元",
    inboundType: "其他入库",
    operator: "曾俊华"
  },
  {
    id: "3",
    serialNo: "003",
    orderNo: "201019183322185 4",
    inboundTime: "2020-10-19",
    amount: "0.00元",
    inboundType: "其他入库",
    operator: "曾俊华"
  },
  {
    id: "4",
    serialNo: "004",
    orderNo: "200827108055455 68",
    inboundTime: "2020-08-27",
    amount: "0.00元",
    inboundType: "其他入库",
    operator: "曾俊华"
  },
  {
    id: "5",
    serialNo: "005",
    orderNo: "200823082964553 7",
    inboundTime: "2020-08-23",
    amount: "0.00元",
    inboundType: "其他入库",
    operator: "曾俊华"
  },
  {
    id: "6",
    serialNo: "006",
    orderNo: "200823084282020 8",
    inboundTime: "2020-08-23",
    amount: "0.00元",
    inboundType: "其他入库",
    operator: "曾俊华"
  },
  {
    id: "7",
    serialNo: "007",
    orderNo: "200823807267604 9",
    inboundTime: "2020-08-23",
    amount: "3020.00元",
    inboundType: "采购入库",
    operator: "曾俊华"
  },
  {
    id: "8",
    serialNo: "008",
    orderNo: "200104129263781 2",
    inboundTime: "2020-01-04",
    amount: "288.00元",
    inboundType: "采购入库",
    operator: "曾俊华"
  },
  {
    id: "9",
    serialNo: "009",
    orderNo: "191204141679829",
    inboundTime: "2019-12-04",
    amount: "380.00元",
    inboundType: "采购入库",
    operator: "曾俊华"
  },
  {
    id: "10",
    serialNo: "010",
    orderNo: "191128122190050 5",
    inboundTime: "2019-11-28",
    amount: "110.00元",
    inboundType: "采购入库",
    operator: "曾俊华"
  },
  {
    id: "11",
    serialNo: "011",
    orderNo: "191128115073015 0",
    inboundTime: "2019-11-28",
    amount: "80.00元",
    inboundType: "采购入库",
    operator: "曾俊华"
  }
]);

const recordPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 114
});

const loadRecordList = () => {
  // TODO: 调用入库记录接口
};

const handleSearch = () => {
  recordPagination.currentPage = 1;
  loadRecordList();
};

const handleResetQuery = () => {
  recordQueryForm.keyword = "";
  recordQueryForm.startTime = "";
  recordQueryForm.endTime = "";
  recordQueryForm.inboundType = "";
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
  ElMessage.info(`查看入库详情: ${row.orderNo}`);
};

onMounted(() => {
  // 初始化空行
});
</script>

<template>
  <div class="inbound-container">
    <el-tabs
      v-model="activeTab"
      class="inbound-tabs"
      @tab-click="handleTabChange"
    >
      <!-- ========== 新增入库 ========== -->
      <el-tab-pane label="新增入库" name="form">
        <div class="tab-content">
          <div class="inbound-form-container">
            <!-- 顶部操作栏 -->
            <div class="inbound-header">
              <div class="header-left">
                <span class="operator-label"
                  >操作人：{{ inboundForm.operator }}</span
                >
                <el-form-item label="入库类型" class="type-form-item">
                  <el-select
                    v-model="inboundForm.inboundType"
                    class="!w-[130px]"
                  >
                    <el-option
                      v-for="opt in inboundTypeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <el-button type="primary" @click="switchToRecord">
                查看入库记录
              </el-button>
            </div>

            <!-- 药品表格 -->
            <div class="inbound-table-wrapper">
              <table class="inbound-table">
                <thead>
                  <tr>
                    <th style="min-width: 160px">药品名称</th>
                    <th style="min-width: 110px">规格</th>
                    <th style="min-width: 90px">入库数量</th>
                    <th style="min-width: 90px">处方价</th>
                    <th style="min-width: 90px">进货价</th>
                    <th style="min-width: 130px">生产厂家</th>
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
                  <tr v-for="(item, index) in inboundForm.items" :key="index">
                    <!-- 药品名称 - 标签显示 -->
                    <td>
                      <span class="drug-name-label">{{ item.drugName }}</span>
                    </td>
                    <!-- 规格 - 标签显示 -->
                    <td>
                      <span class="cell-text">{{ item.specification }}</span>
                    </td>
                    <!-- 入库数量 - 必填 -->
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
                    <!-- 处方价 - 只读显示 -->
                    <td>
                      <span class="cell-text price-text">
                        {{ item.prescriptionPrice }} 元/{{ item.unit }}
                      </span>
                    </td>
                    <!-- 进货价 - 必填 -->
                    <td>
                      <el-tooltip
                        content="必填项"
                        placement="top"
                        :show-after="300"
                      >
                        <div class="input-with-unit">
                          <el-input
                            v-model="item.purchasePrice"
                            type="number"
                            class="cell-input required-input"
                          />
                          <span class="cell-unit">元/{{ item.unit }}</span>
                        </div>
                      </el-tooltip>
                    </td>
                    <!-- 生产厂家 -->
                    <td>
                      <el-input
                        v-model="item.manufacturer"
                        class="cell-input"
                      />
                    </td>
                    <!-- 生产日期 - 必填 -->
                    <td>
                      <el-tooltip
                        content="必填项"
                        placement="top"
                        :show-after="300"
                      >
                        <div class="required-date-wrapper">
                          <el-date-picker
                            v-model="item.productionDate"
                            type="date"
                            value-format="YYYY-MM-DD"
                            placeholder=""
                            class="cell-date"
                          />
                        </div>
                      </el-tooltip>
                    </td>
                    <!-- 有效日期 - 必填 -->
                    <td>
                      <el-tooltip
                        content="必填项"
                        placement="top"
                        :show-after="300"
                      >
                        <div class="required-date-wrapper">
                          <el-date-picker
                            v-model="item.expiryDate"
                            type="date"
                            value-format="YYYY-MM-DD"
                            placeholder=""
                            class="cell-date"
                          />
                        </div>
                      </el-tooltip>
                    </td>
                    <!-- 生产批号 -->
                    <td>
                      <el-input v-model="item.batchNo" class="cell-input" />
                    </td>
                    <!-- 供应商 -->
                    <td>
                      <el-select
                        v-model="item.supplier"
                        clearable
                        class="cell-select"
                      />
                    </td>
                    <!-- 备注 -->
                    <td>
                      <el-input v-model="item.remark" class="cell-input" />
                    </td>
                    <!-- 操作 -->
                    <td>
                      <el-button
                        type="danger"
                        link
                        @click="removeInboundItem(index)"
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

                  <!-- 快捷入库按钮行 -->
                  <tr>
                    <td colspan="12">
                      <el-button link type="primary" @click="openQuickDialog">
                        + 快捷入库
                      </el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 底部操作区 -->
            <div class="inbound-footer">
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

      <!-- ========== 入库记录 ========== -->
      <el-tab-pane label="入库记录" name="record" lazy>
        <div class="tab-content">
          <div class="main">
            <!-- 查询表单 -->
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
              <el-form-item label="入库类型" prop="inboundType">
                <el-select
                  v-model="recordQueryForm.inboundType"
                  placeholder="全部"
                  clearable
                  class="!w-[120px]"
                >
                  <el-option label="全部" value="" />
                  <el-option label="采购入库" value="采购入库" />
                  <el-option label="赠送入库" value="赠送入库" />
                  <el-option label="借用入库" value="借用入库" />
                  <el-option label="退货入库" value="退货入库" />
                  <el-option label="其他入库" value="其他入库" />
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
                <el-button
                  :icon="useRenderIcon(Refresh)"
                  @click="handleResetQuery"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 表格 -->
            <div
              ref="contentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="入库记录"
                :columns="recordColumns"
                @refresh="loadRecordList"
              >
                <template #buttons>
                  <el-button type="primary" @click="switchToForm">
                    新增入库
                  </el-button>
                </template>
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
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 快捷入库弹窗 ========== -->
    <el-dialog
      v-model="quickDialogVisible"
      title="以下药品库存低于库存下限，请及时入库"
      width="760px"
      :close-on-click-modal="false"
    >
      <el-table
        ref="quickDialogTableRef"
        :data="quickDrugList"
        border
        stripe
        height="360"
        @selection-change="handleQuickSelectionChange"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column prop="drugName" label="药品名称" min-width="160" />
        <el-table-column prop="specification" label="规格" min-width="120" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="180" />
        <el-table-column prop="currentStock" label="当前库存" width="110" />
      </el-table>

      <!-- 分页 -->
      <div class="quick-dialog-pagination">
        <el-pagination
          v-model:current-page="quickDialogPagination.currentPage"
          v-model:page-size="quickDialogPagination.pageSize"
          :total="quickDialogPagination.total"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :page-sizes="[20, 50]"
          small
        />
      </div>

      <template #footer>
        <el-button type="primary" @click="handleQuickConfirm">确定</el-button>
        <el-button @click="quickDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.quick-dialog-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
}

.inbound-container {
  height: 100%;

  .inbound-tabs {
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

  // ---- 新增入库 ----
  .inbound-form-container {
    padding: 16px 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .inbound-header {
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

    .inbound-table-wrapper {
      flex: 1;
      overflow: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

      .inbound-table {
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

              // 药品名称标签
              .drug-name-label {
                display: block;
                font-size: 13px;
                color: #303133;
                word-break: break-all;
                text-align: left;
                padding: 0 4px;
              }

              // 普通文本标签
              .cell-text {
                font-size: 13px;
                color: #606266;
              }

              .price-text {
                white-space: nowrap;
              }

              // 带单位的输入框
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

              // 必填输入框 - 粉色边框
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

              // 必填日期选择器 - 粉色边框（用 div 包裹，使 tooltip 和 CSS 均生效）
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

              // 药品选择行
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

    .inbound-footer {
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
</style>
