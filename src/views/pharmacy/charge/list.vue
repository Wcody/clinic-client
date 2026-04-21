<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { useWindowSize } from "@vueuse/core";
import PureTable from "@pureadmin/table";
import {
  getChargeListApi,
  FeeStatus,
  RegistrationStatus
} from "@/api/visit/register";

defineOptions({
  name: "PharmacyChargeList"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const activeTab = ref("pending");

const { height: windowHeight } = useWindowSize();
const tableOffsetBottom = ref(110);

const updateOffsetBottom = () => {
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
    tableOffsetBottom.value =
      headerHeight + searchHeight + paginationHeight + spacing;
  });
};

const handleTabChange = () => {
  setTimeout(() => {
    updateOffsetBottom();
  }, 200);
  handleQuery();
};

// ==================== 待收费 ====================
const pendingColumns = ref([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "姓名", prop: "patient", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "年龄", prop: "age", minWidth: 100 },
  { label: "总金额", prop: "totalPrice", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "挂号时间", prop: "orderTime", minWidth: 160 },
  { label: "收费状态", prop: "statusFee", minWidth: 100 },
  { label: "操作", fixed: "right", width: 150, slot: "pendingOperation" }
]);

const pendingList = ref([]);

const pendingPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 已诊患者 ====================
const diagnosedQueryForm = reactive({
  patientName: "",
  dateRange: ["", ""]
});

const diagnosedColumns = ref([
  { label: "姓名", prop: "patient", minWidth: 150 },
  { label: "性别", prop: "gender", minWidth: 100 },
  { label: "年龄", prop: "age", minWidth: 120 },
  { label: "总金额", prop: "totalPrice", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "就诊时间", prop: "orderTime", minWidth: 180 },
  { label: "就诊状态", prop: "status", minWidth: 100 },
  { label: "收费状态", prop: "statusFee", minWidth: 100 },
  { label: "操作", fixed: "right", width: 150, slot: "diagnosedOperation" }
]);

const diagnosedList = ref([]);

const diagnosedPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 方法 ====================
const handleQuery = async () => {
  if (activeTab.value === "pending") {
    try {
      const res = await getChargeListApi({
        statusFee: FeeStatus.UNPAID,
        currentPage: pendingPagination.currentPage,
        pageSize: pendingPagination.pageSize
      });
      if (res?.data) {
        pendingList.value = res.data.list ?? [];
        pendingPagination.total = res.data.total ?? 0;
      }
    } catch {
      ElMessage.error("获取待收费列表失败");
    }
  } else {
    const startTime = diagnosedQueryForm.dateRange?.[0]
      ? `${diagnosedQueryForm.dateRange[0]} 00:00:00`
      : undefined;
    const endTime = diagnosedQueryForm.dateRange?.[1]
      ? `${diagnosedQueryForm.dateRange[1]} 23:59:59`
      : undefined;
    const params: Record<string, any> = {
      status: RegistrationStatus.RECEIVED,
      currentPage: diagnosedPagination.currentPage,
      pageSize: diagnosedPagination.pageSize
    };
    if (diagnosedQueryForm.patientName) params.patientName = diagnosedQueryForm.patientName;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    try {
      const res = await getChargeListApi(params);
      if (res?.data) {
        diagnosedList.value = res.data.list ?? [];
        diagnosedPagination.total = res.data.total ?? 0;
      }
    } catch {
      ElMessage.error("获取已诊患者列表失败");
    }
  }
};

const handleSearch = () => {
  diagnosedPagination.currentPage = 1;
  handleQuery();
};

const handleResetQuery = () => {
  diagnosedQueryForm.patientName = "";
  diagnosedQueryForm.dateRange = ["", ""];
  diagnosedPagination.currentPage = 1;
  handleQuery();
};

const handlePendingPageChange = (page: number) => {
  pendingPagination.currentPage = page;
  handleQuery();
};

const handlePendingSizeChange = (size: number) => {
  pendingPagination.pageSize = size;
  handleQuery();
};

const handleDiagnosedPageChange = (page: number) => {
  diagnosedPagination.currentPage = page;
  handleQuery();
};

const handleDiagnosedSizeChange = (size: number) => {
  diagnosedPagination.pageSize = size;
  handleQuery();
};

const handleViewPatientDetail = (row: any) => {
  ElMessage.info(`查看患者详情: ${row.patient}`);
};

const handleViewVisitDetail = (row: any) => {
  ElMessage.info(`查看就诊详情: ${row.patient}`);
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="visit-container">
    <el-tabs
      v-model="activeTab"
      class="visit-tabs"
      @tab-click="handleTabChange"
    >
      <!-- 待收费 -->
      <el-tab-pane label="待收费" name="pending">
        <div class="tab-content">
          <div class="main">
            <div
              ref="contentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full', '!mt-0']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="待收费"
                :columns="pendingColumns"
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
                    :adaptiveConfig="{ offsetBottom: tableOffsetBottom }"
                    :data="pendingList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="pendingPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handlePendingSizeChange"
                    @page-current-change="handlePendingPageChange"
                  >
                    <template #index="{ $index }">
                      <span>{{
                        (pendingPagination.currentPage - 1) *
                          pendingPagination.pageSize +
                        $index +
                        1
                      }}</span>
                    </template>
                    <template #pendingOperation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewPatientDetail(row)"
                      >
                        收费
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 已诊患者 -->
      <el-tab-pane label="已诊患者" name="diagnosed">
        <div class="tab-content">
          <div class="main">
            <el-form
              ref="queryFormRef"
              :model="diagnosedQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item label="患者姓名">
                <el-input
                  v-model="diagnosedQueryForm.patientName"
                  placeholder="请输入患者姓名"
                  clearable
                  class="!w-[180px]"
                />
              </el-form-item>
              <el-form-item label="就诊时间">
                <el-date-picker
                  v-model="diagnosedQueryForm.dateRange"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="!w-[280px]"
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
                <el-button
                  :icon="useRenderIcon(Refresh)"
                  @click="handleResetQuery"
                >
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
                title="已诊患者"
                :columns="diagnosedColumns"
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
                    :adaptiveConfig="{ offsetBottom: tableOffsetBottom }"
                    :data="diagnosedList"
                    row-key="id"
                    :columns="dynamicColumns"
                    :pagination="diagnosedPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleDiagnosedSizeChange"
                    @page-current-change="handleDiagnosedPageChange"
                  >
                    <template #diagnosedOperation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewPatientDetail(row)"
                      >
                        患者详情
                      </el-button>
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewVisitDetail(row)"
                      >
                        就诊详情
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
  }
}
</style>
