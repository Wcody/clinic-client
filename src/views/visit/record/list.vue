<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { useWindowSize } from "@vueuse/core";
import PureTable from "@pureadmin/table";
import PatientDetail from "./comp/PatientDetail.vue";
import {
  getVisitRecordListApi,
  updateVisitRecordApi,
  type BQVisitRecordEntityType,
  type BQVisitRecordSearchParams
} from "@/api/visit/record";
import router from "@/router";
import dayjs from "dayjs";

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

// ==================== 年龄格式化 ====================
const formatAge = (row: BQVisitRecordEntityType) => {
  const { firstAge, lastAge, ageType } = row;
  if (firstAge == null) return "";
  if (ageType === 1) {
    return lastAge ? `${firstAge}岁${lastAge}月` : `${firstAge}岁`;
  }
  if (ageType === 2) {
    return lastAge ? `${firstAge}月${lastAge}天` : `${firstAge}月`;
  }
  if (ageType === 3) return `${firstAge}天`;
  return String(firstAge);
};

// ==================== 待诊患者 ====================
const pendingColumns = ref<any>([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "姓名", prop: "patient", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "年龄", prop: "firstAge", minWidth: 100, slot: "pendingAge" },
  { label: "挂号号", prop: "registrationNo", minWidth: 120 },
  { label: "科室", prop: "department", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "挂号时间", prop: "orderTime", minWidth: 160 },
  { label: "操作", fixed: "right", width: 150, slot: "pendingOperation" }
]);

const pendingList = ref<BQVisitRecordEntityType[]>([]);
const loading = ref(false);

const pendingPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 已诊患者 ====================
const diagnosedQueryForm = reactive({
  patientName: "",
  dateRange: [
    dayjs().subtract(1, "month").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(1, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss")
  ]
});

const diagnosedColumns = ref<any>([
  { label: "姓名", prop: "patient", minWidth: 150 },
  { label: "性别", prop: "gender", minWidth: 100 },
  { label: "年龄", prop: "firstAge", minWidth: 120, slot: "diagnosedAge" },
  { label: "挂号号", prop: "registrationNo", minWidth: 120 },
  { label: "科室", prop: "department", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "就诊时间", prop: "orderTime", minWidth: 180 },
  { label: "操作", fixed: "right", width: 300, slot: "diagnosedOperation" }
]);

const diagnosedList = ref<BQVisitRecordEntityType[]>([]);

const diagnosedPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 方法 ====================
// 查询数据
const handleQuery = async () => {
  loading.value = true;
  try {
    if (activeTab.value === "pending") {
      // 查询待诊患者（status = "待接诊"）
      const params: BQVisitRecordSearchParams = {
        patientName: diagnosedQueryForm.patientName,
        status: "待接诊",
        currentPage: pendingPagination.currentPage,
        pageSize: pendingPagination.pageSize
      };

      const res = await getVisitRecordListApi(params);
      console.log("查询待诊患者接口返回：", res);
      if (res.code === 0 && res.data) {
        pendingList.value = res.data.list || [];
        pendingPagination.total = res.data.total || 0;
      } else {
        ElMessage.error(res.errMsg || "查询失败");
      }
    } else {
      // 查询已诊患者（status = "已接诊"）
      const params: BQVisitRecordSearchParams = {
        patientName: diagnosedQueryForm.patientName,
        status: "已接诊",
        currentPage: diagnosedPagination.currentPage,
        pageSize: diagnosedPagination.pageSize
      };

      if (
        diagnosedQueryForm.dateRange &&
        diagnosedQueryForm.dateRange.length === 2
      ) {
        params.startTime = diagnosedQueryForm.dateRange[0];
        params.endTime = diagnosedQueryForm.dateRange[1];
      }

      const res = await getVisitRecordListApi(params);
      if (res.code === 0 && res.data) {
        diagnosedList.value = res.data.list || [];
        diagnosedPagination.total = res.data.total || 0;
      } else {
        ElMessage.error(res.errMsg || "查询失败");
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.message || "查询失败");
  } finally {
    loading.value = false;
  }
};

// 查询
const handleSearch = () => {
  if (activeTab.value === "pending") {
    pendingPagination.currentPage = 1;
  } else {
    diagnosedPagination.currentPage = 1;
  }
  handleQuery();
};

// 重置查询
const handleResetQuery = () => {
  diagnosedQueryForm.patientName = "";
  diagnosedQueryForm.dateRange = ["", ""];
  if (activeTab.value === "pending") {
    pendingPagination.currentPage = 1;
  } else {
    diagnosedPagination.currentPage = 1;
  }
  handleQuery();
};

// 分页改变 - 待诊患者
const handlePendingPageChange = (page: number) => {
  pendingPagination.currentPage = page;
  handleQuery();
};

const handlePendingSizeChange = (size: number) => {
  pendingPagination.pageSize = size;
  handleQuery();
};

// 分页改变 - 已诊患者
const handleDiagnosedPageChange = (page: number) => {
  diagnosedPagination.currentPage = page;
  handleQuery();
};

const handleDiagnosedSizeChange = (size: number) => {
  diagnosedPagination.pageSize = size;
  handleQuery();
};

// 查看患者详情
const showPatientDetail = ref(false);
const selectedPatient = ref<any>(null);

const handleViewPatientDetail = (row: BQVisitRecordEntityType) => {
  selectedPatient.value = row;
  showPatientDetail.value = true;
};

const handlePatientDetailBack = () => {
  showPatientDetail.value = false;
  selectedPatient.value = null;
};

// 接诊操作（将状态从"待接诊"更新为"已接诊"）
const handleReceivePatient = async (row: BQVisitRecordEntityType) => {
  // 路由跳转
  router.push({
    name: "WorkDoctor",
    query: {
      regId: row.id,
      patientId: row.patientId
    }
  });
};

// 就诊详情（跳转到医生工作台查看）
const handleViewVisitDetail = (row: BQVisitRecordEntityType) => {
  router.push({
    name: "WorkDoctor",
    query: {
      regId: row.id,
      patientId: row.patientId
    }
  });
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
      <!-- 待诊患者 -->
      <el-tab-pane label="待诊患者" name="pending">
        <div class="tab-content">
          <div class="main">
            <div
              ref="contentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full', '!mt-0']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="待诊患者"
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
                    :loading="loading"
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
                    <!-- 序号列 -->
                    <template #index="{ $index }">
                      <span>{{
                        (pendingPagination.currentPage - 1) *
                          pendingPagination.pageSize +
                        $index +
                        1
                      }}</span>
                    </template>

                    <!-- 年龄列 -->
                    <template #pendingAge="{ row }">
                      <span>{{ formatAge(row) }}</span>
                    </template>

                    <!-- 操作列 -->
                    <template #pendingOperation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleReceivePatient(row)"
                      >
                        接诊
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
          <!-- 患者详情覆盖层 -->
          <PatientDetail
            v-if="showPatientDetail && selectedPatient"
            :patient="selectedPatient"
            class="detail-overlay"
            @back="handlePatientDetailBack"
          />

          <div v-show="!showPatientDetail" class="main">
            <!-- 查询表单 -->
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

            <!-- 表格 -->
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
                    :loading="loading"
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
                    <!-- 年龄列 -->
                    <template #diagnosedAge="{ row }">
                      <span>{{ formatAge(row) }}</span>
                    </template>

                    <!-- 操作列 -->
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
    position: relative;
  }

  .detail-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    background-color: #fff;
    overflow: hidden;
  }
}
</style>
