<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import Delete from "@iconify-icons/ep/delete";
import ArrowDown from "@iconify-icons/ep/arrow-down";
import { IconifyIconOffline, IconifyIconOnline } from "@pureadmin/utils";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { useWindowSize } from "@vueuse/core";
import PureTable from "@pureadmin/table";

defineOptions({
  name: "VisitList"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const activeTab = ref("pending");

// 动态计算表格底部偏移量
const { height: windowHeight } = useWindowSize();
const tableOffsetBottom = ref(110);

// 监听容器高度变化，动态计算 offsetBottom
const updateOffsetBottom = () => {
  const viewportHeight = windowHeight.value;

  if (activeTab.value !== "diagnosed") {
    tableOffsetBottom.value = 110;
    return;
  }

  nextTick(() => {
    const headerHeight = 55;
    const searchFormEl = queryFormRef.value?.$el;
    const searchHeight = searchFormEl?.offsetHeight || 60;
    const paginationHeight = 50;
    const spacing = 24;

    const currentOffset =
      headerHeight + searchHeight + paginationHeight + spacing;
    tableOffsetBottom.value = currentOffset;
  });
};

// 监听标签页切换
const handleTabChange = () => {
  setTimeout(() => {
    updateOffsetBottom();
  }, 200);
  handleQuery();
};

// ==================== 新增零售 ====================
const retailForm = reactive({
  patientId: "",
  patientName: "",
  items: [
    {
      drugId: "",
      drugName: "白葡奈氏菌片",
      specification: "0.3mg*40片/盒",
      manufacturer: "山东齐鲁药业",
      unitPrice: 1.20,
      quantity: "",
      unit: "片",
      amount: 0,
      showDrugSelect: false
    }
  ]
});

// 药品选择相关数据
const drugSearchText = ref("");
const currentSelectItem = ref(null);
const addDrugPopoverVisible = ref(false);
const addDrugInputText = ref(""); // 添加药品输入框文本

// 药品筛选条件
const drugFilters = reactive({
  showOwnDrug: true,
  showWestern: false,
  showChinese: false,
  showExam: false,
  showTreatment: false,
  showAdditional: false
});

// 药品表格数据
const drugTableData = ref([
  {
    id: "1",
    name: "白葡奈氏菌片",
    specification: "0.3mg*40片/盒",
    manufacturer: "山东齐鲁药业",
    stock: "70盒0.00片",
    price: "1.20元/片",
    source: "我的药库",
    unitPrice: 1.20,
    unit: "片"
  },
  {
    id: "2",
    name: "阿莫西林胶囊",
    specification: "0.5g*24粒/盒",
    manufacturer: "",
    stock: "3盒0.00粒",
    price: "3.00元/粒",
    source: "我的药库",
    unitPrice: 3.00,
    unit: "粒"
  },
  {
    id: "3",
    name: "化风丹",
    specification: "0.12g*90丸/盒",
    manufacturer: "贵州万胜药业有限责任公司",
    stock: "12盒0.00丸",
    price: "128.00元/盒",
    source: "我的药库",
    unitPrice: 128.00,
    unit: "盒"
  },
  {
    id: "4",
    name: "龙脑安神丸",
    specification: "每丸重5g",
    manufacturer: "吉林恒金药业股份有限公司",
    stock: "0盒0.00粒",
    price: "200.00元/粒",
    source: "我的药库",
    unitPrice: 200.00,
    unit: "粒"
  },
  {
    id: "5",
    name: "清浊祛毒丸",
    specification: "8g*9袋/盒",
    manufacturer: "广西清之品制药有限责任公司",
    stock: "2盒0.00袋",
    price: "5.00元/袋",
    source: "我的药库",
    unitPrice: 5.00,
    unit: "袋"
  }
]);

// 药品分页
const drugPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 2079
});

// 打开药品选择
const openDrugSelect = (item) => {
  currentSelectItem.value = item;
  drugSearchText.value = "";
  loadDrugList();
};

// 加载药品列表
const loadDrugList = () => {
  // TODO: 调用接口获取药品列表
  // getDrugPage({
  //   keyword: drugSearchText.value,
  //   showOwnDrug: drugFilters.showOwnDrug,
  //   showWestern: drugFilters.showWestern,
  //   showChinese: drugFilters.showChinese,
  //   showExam: drugFilters.showExam,
  //   showTreatment: drugFilters.showTreatment,
  //   showAdditional: drugFilters.showAdditional,
  //   currentPage: drugPagination.currentPage,
  //   pageSize: drugPagination.pageSize
  // }).then(res => {
  //   drugTableData.value = res.data.list;
  //   drugPagination.total = res.data.total;
  // });
};

// 药品搜索
const handleDrugSearch = () => {
  drugPagination.currentPage = 1;
  loadDrugList();
};

// 选择药品
const handleSelectDrug = (row) => {
  if (currentSelectItem.value) {
    currentSelectItem.value.drugId = row.id;
    currentSelectItem.value.drugName = row.name;
    currentSelectItem.value.specification = row.specification;
    currentSelectItem.value.manufacturer = row.manufacturer;
    currentSelectItem.value.unitPrice = row.unitPrice;
    currentSelectItem.value.unit = row.unit;
    currentSelectItem.value.amount = 0;
    currentSelectItem.value.quantity = "";
    // 关闭面板
    currentSelectItem.value.showDrugSelect = false;
  }
};

// 打开添加药品选择
const openAddDrugSelect = () => {
  addDrugInputText.value = "";
  drugPagination.currentPage = 1;
  loadDrugList();
};

// 选择药品（添加药品行）
const handleAddDrugSelect = (row) => {
  addDrugItem();
  const newItem = retailForm.items[retailForm.items.length - 1];
  newItem.drugId = row.id;
  newItem.drugName = row.name;
  newItem.specification = row.specification;
  newItem.manufacturer = row.manufacturer;
  newItem.unitPrice = row.unitPrice;
  newItem.unit = row.unit;
  newItem.amount = 0;
  newItem.quantity = "";
  // 清空输入框并关闭面板
  addDrugInputText.value = "";
  addDrugPopoverVisible.value = false;
};

// 计算总金额
const getTotalAmount = () => {
  return retailForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
};

// 添加药品行
const addDrugItem = () => {
  retailForm.items.push({
    drugId: "",
    drugName: "",
    specification: "",
    manufacturer: "",
    unitPrice: 0,
    quantity: "",
    unit: "片",
    amount: 0,
    showDrugSelect: false
  });
};

// 删除药品行
const removeDrugItem = (index: number) => {
  if (retailForm.items.length > 1) {
    retailForm.items.splice(index, 1);
  } else {
    ElMessage.warning("至少保留一行");
  }
};

// 计算单项金额
const calculateItemAmount = (item: any) => {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  item.amount = qty * price;
};

// 保存零售记录
const handleSaveRetail = () => {
  // 验证必填项
  const hasEmptyItem = retailForm.items.some(
    item => !item.drugName || !item.quantity
  );
  if (hasEmptyItem) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }

  // TODO: 调用保存接口
  ElMessage.success("保存成功");
};

// 收费
const handleChargeRetail = () => {
  // 验证必填项
  const hasEmptyItem = retailForm.items.some(
    item => !item.drugName || !item.quantity
  );
  if (hasEmptyItem) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }

  // TODO: 调用收费接口
  ElMessage.success("收费成功");
};

// 打开患者信息输入
const handleInputPatientInfo = () => {
  ElMessage.info("打开患者信息输入对话框");
};

// ==================== 零售记录 ====================
const retailRecordQueryForm = reactive({
  patientName: "",
  dateRange: ["", ""]
});

const retailRecordColumns = ref([
  { label: "销售ID", prop: "id", minWidth: 120 },
  { label: "金额", prop: "amount", minWidth: 120 },
  { label: "实收金额", prop: "actualAmount", minWidth: 120 },
  { label: "操作人", prop: "operatorPerson", minWidth: 120 },
  { label: "创建时间", prop: "created", minWidth: 180 },
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 150, slot: "retailRecordOperation" }
]);

const retailRecordList = ref([
  {
    id: "10001",
    amount: "120.00",
    actualAmount: "120.00",
    operatorPerson: "张三",
    created: "2026-04-11 17:01:05",
    status: 1,
    statusRemark: "已收费"
  },
  {
    id: "10002",
    amount: "85.50",
    actualAmount: "85.50",
    operatorPerson: "李四",
    created: "2026-04-11 16:59:25",
    status: 1,
    statusRemark: "已收费"
  },
  {
    id: "10003",
    amount: "200.00",
    actualAmount: "0.00",
    operatorPerson: "王五",
    created: "2026-04-11 16:52:47",
    status: 0,
    statusRemark: "未收费"
  },
  {
    id: "10004",
    amount: "500.00",
    actualAmount: "500.00",
    operatorPerson: "张三",
    created: "2026-04-11 15:30:00",
    status: 1,
    statusRemark: "已收费"
  },
  {
    id: "10005",
    amount: "300.00",
    actualAmount: "0.00",
    operatorPerson: "赵六",
    created: "2026-04-11 14:20:00",
    status: 0,
    statusRemark: "未收费"
  }
]);

const retailRecordPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 方法 ====================
// 查询数据
const handleQuery = () => {
  if (activeTab.value === "pending") {
    // 新增零售页签，无需查询
  } else {
    // 查询零售记录
    loadRetailRecords();
  }
};

// 加载零售记录
const loadRetailRecords = () => {
  // TODO: 调用接口获取零售记录
  // getSalePage({
  //   currentPage: retailRecordPagination.currentPage,
  //   pageSize: retailRecordPagination.pageSize,
  //   ...retailRecordQueryForm
  // }).then(res => {
  //   retailRecordList.value = res.data.list;
  //   retailRecordPagination.total = res.data.total;
  // });
};

// 查询
const handleSearch = () => {
  retailRecordPagination.currentPage = 1;
  loadRetailRecords();
};

// 重置查询
const handleResetQuery = () => {
  retailRecordQueryForm.patientName = "";
  retailRecordQueryForm.dateRange = ["", ""];
  retailRecordPagination.currentPage = 1;
  loadRetailRecords();
};

// 分页改变 - 零售记录
const handleRetailRecordPageChange = (page: number) => {
  retailRecordPagination.currentPage = page;
  loadRetailRecords();
};

const handleRetailRecordSizeChange = (size: number) => {
  retailRecordPagination.pageSize = size;
  loadRetailRecords();
};

// 查看零售记录详情
const handleViewRetailDetail = (row: any) => {
  ElMessage.info(`查看零售记录详情: ${row.id}`);
};

// 删除零售记录
const handleDeleteRetail = (row: any) => {
  ElMessage.warning(`删除零售记录: ${row.id}`);
};

// Lifecycle
onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="visit-container">
    <!-- 标签页 -->
    <el-tabs
      v-model="activeTab"
      class="visit-tabs"
      @tab-click="handleTabChange"
    >
      <!-- 新增零售 -->
      <el-tab-pane label="新增零售" name="pending">
        <div class="tab-content">
          <div class="retail-form-container">
            <!-- 顶部操作栏 -->
            <div class="retail-header">
              <el-button type="primary" @click="handleInputPatientInfo">
                输入患者信息
              </el-button>
            </div>

            <!-- 药品表格 -->
            <div class="retail-table-wrapper">
              <table class="retail-table">
                <thead>
                  <tr>
                    <th style="width: 200px">药品名称</th>
                    <th style="width: 180px">药品规格</th>
                    <th style="width: 180px">生产厂家</th>
                    <th style="width: 120px">单价（元）</th>
                    <th style="width: 100px">数量</th>
                    <th style="width: 120px">单位</th>
                    <th style="width: 120px">金额（元）</th>
                    <th style="width: 80px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in retailForm.items" :key="index">
                    <td>
                      <span class="drug-name-text">{{ item.drugName || '请选择药品' }}</span>
                    </td>
                    <td>
                      <span class="text-cell">{{ item.specification }}</span>
                    </td>
                    <td>
                      <span class="text-cell">{{ item.manufacturer }}</span>
                    </td>
                    <td>
                      <el-input-number
                        v-model="item.unitPrice"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        class="price-input"
                      />
                    </td>
                    <td>
                      <el-input
                        v-model="item.quantity"
                        type="number"
                        placeholder=""
                        class="quantity-input"
                        @input="calculateItemAmount(item)"
                      />
                    </td>
                    <td>
                      <el-select v-model="item.unit" class="unit-select">
                        <el-option label="片" value="片" />
                        <el-option label="盒" value="盒" />
                        <el-option label="瓶" value="瓶" />
                        <el-option label="支" value="支" />
                        <el-option label="袋" value="袋" />
                      </el-select>
                    </td>
                    <td>
                      <span class="amount-cell">{{ item.amount.toFixed(2) }}</span>
                    </td>
                    <td>
                      <el-button
                        type="danger"
                        link
                        @click="removeDrugItem(index)"
                      >
                        <IconifyIconOffline :icon="Delete" />
                      </el-button>
                    </td>
                  </tr>
                  <!-- 添加药品行 -->
                  <tr>
                    <td colspan="8">
                      <el-popover
                        v-model:visible="addDrugPopoverVisible"
                        placement="bottom-start"
                        :width="1100"
                        trigger="click"
                      >
                        <template #reference>
                          <el-input
                            v-model="addDrugInputText"
                            placeholder="请选择药品"
                            clearable
                            class="add-drug-select"
                            @focus="openAddDrugSelect"
                          >
                            <template #suffix>
                              <IconifyIconOffline :icon="ArrowDown" />
                            </template>
                          </el-input>
                        </template>
                        <!-- 药品选择面板 -->
                        <div class="drug-select-panel">
                          <!-- 筛选选项 -->
                          <div class="drug-filter-options">
                            <el-checkbox v-model="drugFilters.showOwnDrug" @change="handleDrugSearch">
                              仅显示自有药品
                            </el-checkbox>
                            <el-checkbox v-model="drugFilters.showWestern" @change="handleDrugSearch">
                              西/成药
                            </el-checkbox>
                            <el-checkbox v-model="drugFilters.showChinese" @change="handleDrugSearch">
                              中药
                            </el-checkbox>
                            <el-checkbox v-model="drugFilters.showExam" @change="handleDrugSearch">
                              检查检验项目
                            </el-checkbox>
                            <el-checkbox v-model="drugFilters.showTreatment" @change="handleDrugSearch">
                              处置项目
                            </el-checkbox>
                            <el-checkbox v-model="drugFilters.showAdditional" @change="handleDrugSearch">
                              附加费
                            </el-checkbox>
                          </div>
                          <!-- 药品表格 -->
                          <el-table
                            :data="drugTableData"
                            border
                            stripe
                            height="400"
                            @row-click="handleAddDrugSelect"
                            style="cursor: pointer"
                          >
                            <el-table-column prop="name" label="名字" width="180" />
                            <el-table-column prop="specification" label="规格" width="180" />
                            <el-table-column prop="manufacturer" label="生产厂家" min-width="200" />
                            <el-table-column prop="stock" label="库存" width="120" />
                            <el-table-column prop="price" label="价格" width="120" />
                            <el-table-column prop="source" label="来源" width="120" />
                          </el-table>
                          <!-- 分页 -->
                          <div class="drug-pagination">
                            <el-pagination
                              v-model:current-page="drugPagination.currentPage"
                              v-model:page-size="drugPagination.pageSize"
                              :total="drugPagination.total"
                              :page-sizes="[20, 50, 100]"
                              layout="total, sizes, prev, pager, next, jumper"
                              @size-change="loadDrugList"
                              @current-change="loadDrugList"
                            />
                          </div>
                        </div>
                      </el-popover>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 底部操作区 -->
            <div class="retail-footer">
              <div class="total-amount">
                总金额：<span class="amount-value">{{ getTotalAmount().toFixed(2) }}</span>元
              </div>
              <div class="action-buttons">
                <el-button type="primary" class="btn-save" @click="handleSaveRetail">
                  保存
                </el-button>
                <el-button type="warning" class="btn-charge" @click="handleChargeRetail">
                  收费
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 零售记录 -->
      <el-tab-pane label="零售记录" name="diagnosed" lazy>
        <div class="tab-content">
          <div class="main">
            <!-- 查询表单 -->
            <el-form
              ref="queryFormRef"
              :model="retailRecordQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item>
                <el-select v-model="retailRecordQueryForm.status" placeholder="全部" class="!w-[120px]">
                  <el-option label="全部" value="" />
                  <el-option label="已收费" :value="1" />
                  <el-option label="未收费" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="retailRecordQueryForm.keyword"
                  placeholder="输入单号/姓名查询"
                  clearable
                  class="!w-[220px]"
                />
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker
                  v-model="retailRecordQueryForm.startTime"
                  type="date"
                  placeholder="起始时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[160px]"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="retailRecordQueryForm.endTime"
                  type="date"
                  placeholder="结束时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[160px]"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  @click="handleSearch"
                >
                  查询
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
                title="零售记录"
                :columns="retailRecordColumns"
                @refresh="handleQuery"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="tableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    adaptive
                    border
                    stripe
                    :data="retailRecordList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="retailRecordPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleRetailRecordSizeChange"
                    @page-current-change="handleRetailRecordPageChange"
                  >
                    <!-- 状态列 -->
                    <template #status="{ row }">
                      <span>{{ row.status === 1 ? '已收费' : '未收费' }}</span>
                    </template>

                    <!-- 操作列 -->
                    <template #retailRecordOperation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewRetailDetail(row)"
                      >
                        查看
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

.visit-container {
  height: 100%;
  padding: 0;

  .visit-tabs {
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
    padding: 0;
    background-color: white;
    overflow: hidden;

    // 新增零售表单容器
    .retail-form-container {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .retail-header {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      }

      .retail-table-wrapper {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-radius: 4px;

        .retail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;

          thead {
            background-color: #f5f7fa;
            position: sticky;
            top: 0;
            z-index: 1;

            th {
              padding: 12px 8px;
              text-align: center;
              font-weight: 600;
              color: #606266;
              border-bottom: 1px solid #e4e7ed;
            }
          }

          tbody {
            tr {
              &:hover {
                background-color: #f5f7fa;
              }

              td {
                padding: 8px;
                border-bottom: 1px solid #ebeef5;
                vertical-align: middle;

                .text-cell {
                  color: #606266;
                  font-size: 14px;
                }

                .price-input {
                  width: 100%;
                }

                .quantity-input {
                  width: 100%;
                  input {
                    text-align: center;
                  }
                }

                .unit-select {
                  width: 100%;
                }

                .amount-cell {
                  text-align: right;
                  color: #606266;
                  font-size: 14px;
                }

                .add-drug-select {
                  width: 100%;
                }

                // 药品选择输入框
                .drug-select-input {
                  width: 200px;
                }

                // 删除按钮样式
                .el-button {
                  font-size: 18px;
                  padding: 4px 8px;
                }
              }
            }
          }
        }
      }

      .retail-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e4e7ed;

        .total-amount {
          font-size: 16px;
          color: #606266;

          .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #f56c6c;
            margin: 0 4px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 12px;

          .btn-save {
            min-width: 100px;
            height: 40px;
            font-size: 16px;
          }

          .btn-charge {
            min-width: 100px;
            height: 40px;
            font-size: 16px;
            background-color: #e6a23c;
            border-color: #e6a23c;
            color: #fff;

            &:hover {
              background-color: #ebb563;
              border-color: #ebb563;
            }
          }
        }
      }
    }
  }
}

// 药品选择面板样式
:deep(.drug-select-panel) {
  .drug-search-input {
    margin-bottom: 12px;
  }

  .drug-filter-options {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #e4e7ed;

    .el-checkbox {
      margin-right: 0;
      white-space: nowrap;
    }
  }

  .drug-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
