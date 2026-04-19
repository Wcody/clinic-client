<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useECharts, useDark } from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import {
  getFinanceListApi,
  getFinanceSummaryApi,
  getFinanceChartApi,
  getFinanceTypesApi,
  type FinanceStatsRow,
  type FinanceSummary
} from "@/api/analysis/finance";

defineOptions({ name: "AnalysisFinanceIndex" });

// ==================== 主题 ====================
const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

// ==================== 筛选 ====================
const dimension = ref("日");
const typeOptions = ref<string[]>([]);
const queryForm = reactive({
  typeString: "",
  dateRange: ["", ""] as [string, string]
});

const dimensionOptions = [
  { label: "日", value: "日" },
  { label: "月", value: "月" }
];

// 格式化时间
const fmt = (date: string, isEnd = false) =>
  date
    ? dayjs(date).format(isEnd ? "YYYY-MM-DD 23:59:59" : "YYYY-MM-DD 00:00:00")
    : "";

const buildParams = () => {
  const [start, end] = queryForm.dateRange || ["", ""];
  const params: Record<string, any> = { dimension: dimension.value };
  if (queryForm.typeString) params.typeString = queryForm.typeString;
  const s = fmt(start, false);
  const e = fmt(end, true);
  if (s) params.startTime = s;
  if (e) params.endTime = e;
  return params;
};

// ==================== 汇总卡片 ====================
const summary = reactive<FinanceSummary>({
  totalAmount: 0,
  actualAmount: 0,
  refundAmount: 0
});

const loadSummary = async () => {
  try {
    const { dimension: _d, ...rest } = buildParams();
    const res = await getFinanceSummaryApi(rest);
    if (res.code === 0 && res.data) {
      Object.assign(summary, res.data);
    }
  } catch {
    /* 静默 */
  }
};

// ==================== 折线图 ====================
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

const loadChart = async () => {
  try {
    const res = await getFinanceChartApi(buildParams());
    if (res.code === 0 && res.data) {
      const { dates, amounts } = res.data;
      await nextTick();
      setOptions({
        tooltip: { trigger: "axis" },
        grid: { top: "20px", left: "60px", right: "20px", bottom: "30px" },
        xAxis: {
          type: "category",
          data: dates,
          axisLabel: { fontSize: 12, rotate: dates.length > 10 ? 30 : 0 }
        },
        yAxis: {
          type: "value",
          name: "金额(元)",
          axisLabel: { fontSize: 12 },
          splitLine: { show: true }
        },
        series: [
          {
            name: "收费金额",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            itemStyle: { color: "#2dd4bf" },
            lineStyle: { color: "#2dd4bf", width: 2 },
            areaStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(45,212,191,0.3)" },
                  { offset: 1, color: "rgba(45,212,191,0.02)" }
                ]
              }
            },
            data: amounts
          }
        ]
      });
    }
  } catch {
    /* 静默 */
  }
};

// ==================== 表格 ====================
const loading = ref(false);
const tableData = ref<FinanceStatsRow[]>([]);
const pagination = reactive({ currentPage: 1, pageSize: 20, total: 0 });

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getFinanceListApi({
      ...buildParams(),
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || "查询失败");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "查询失败");
  } finally {
    loading.value = false;
  }
};

// 金额格式化
const fmtAmt = (val: any) =>
  val == null ? "0.00" : Number(val).toFixed(2);

// ==================== 统一查询 ====================
const handleQuery = () => {
  pagination.currentPage = 1;
  Promise.all([loadSummary(), loadChart(), loadList()]);
};

const handleReset = () => {
  queryForm.typeString = "";
  queryForm.dateRange = ["", ""];
  dimension.value = "日";
  handleQuery();
};

const handleTodayQuery = () => {
  const today = dayjs().format("YYYY-MM-DD");
  queryForm.dateRange = [today, today];
  handleQuery();
};

const handleExport = () => ElMessage.info("导出功能开发中");

// ==================== 分页 ====================
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  loadList();
};
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadList();
};

// ==================== 初始化 ====================
onMounted(async () => {
  try {
    const res = await getFinanceTypesApi();
    if (res.code === 0 && Array.isArray(res.data)) {
      typeOptions.value = res.data;
    }
  } catch {
    /* 静默 */
  }
  handleQuery();
});
</script>

<template>
  <div class="finance-container">
    <!-- 筛选栏 -->
    <el-form :inline="true" class="search-form bg-bg_color pl-8 pt-3 pb-1">
      <!-- 时间维度 -->
      <el-form-item>
        <el-select v-model="dimension" class="!w-[80px]">
          <el-option
            v-for="d in dimensionOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>

      <!-- 日期范围 -->
      <el-form-item>
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD"
          class="!w-[260px]"
        />
      </el-form-item>

      <!-- 收费类型 -->
      <el-form-item>
        <el-select
          v-model="queryForm.typeString"
          placeholder="全部"
          clearable
          class="!w-[150px]"
        >
          <el-option
            v-for="t in typeOptions"
            :key="t"
            :label="t"
            :value="t"
          />
        </el-select>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          @click="handleQuery"
        >查询</el-button>
        <el-button type="success" @click="handleTodayQuery">查看今日数据</el-button>
        <el-button @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 卡片 + 图表 -->
    <el-row :gutter="16" class="stats-row">
      <!-- 汇总卡片 -->
      <el-col :span="6">
        <div class="stat-cards">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">累积金额</div>
            <div class="stat-value primary">
              {{ fmtAmt(summary.totalAmount) }}<span class="stat-unit">元</span>
            </div>
          </el-card>
          <el-card shadow="never" class="stat-card mt-3">
            <div class="stat-label">实收金额</div>
            <div class="stat-value success">
              {{ fmtAmt(summary.actualAmount) }}<span class="stat-unit">元</span>
            </div>
          </el-card>
          <el-card shadow="never" class="stat-card mt-3">
            <div class="stat-label">退费金额</div>
            <div class="stat-value danger">
              {{ fmtAmt(summary.refundAmount) }}<span class="stat-unit">元</span>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 折线图 -->
      <el-col :span="18">
        <el-card shadow="never" class="chart-card">
          <div ref="chartRef" style="width: 100%; height: 220px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计表格（多级表头） -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        size="small"
        style="width: 100%"
        :header-cell-style="{ color: 'var(--el-text-color-primary)', background: 'var(--el-fill-color-light)' }"
      >
        <el-table-column prop="periodDate"  label="就诊日期"  min-width="110" align="center" fixed />
        <el-table-column prop="typeString"  label="收费类型"  min-width="100" align="center" />
        <el-table-column prop="chargeCount" label="收费次数"  min-width="80"  align="center" />
        <el-table-column prop="visitCount"  label="就诊人次"  min-width="80"  align="center" />
        <el-table-column prop="totalAmount" label="总金额"    min-width="100" align="center">
          <template #default="{ row }">{{ fmtAmt(row.totalAmount) }}</template>
        </el-table-column>

        <!-- 收费金额 -->
        <el-table-column label="收费金额" align="center">
          <el-table-column label="总金额(元)"  min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.chargeTotal) }}</template>
          </el-table-column>
          <el-table-column label="均费金额(元)" min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.chargeAvg) }}</template>
          </el-table-column>
        </el-table-column>

        <!-- 实收金额 -->
        <el-table-column label="实收金额" align="center">
          <el-table-column label="总金额(元)"  min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.actualTotal) }}</template>
          </el-table-column>
          <el-table-column label="均费金额(元)" min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.actualAvg) }}</template>
          </el-table-column>
        </el-table-column>

        <!-- 未收金额 -->
        <el-table-column label="未收金额" align="center">
          <el-table-column label="总金额(元)"  min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.notChargedTotal) }}</template>
          </el-table-column>
          <el-table-column label="均费金额(元)" min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.notChargedAvg) }}</template>
          </el-table-column>
        </el-table-column>

        <!-- 退费金额 -->
        <el-table-column label="退费金额" align="center">
          <el-table-column label="总金额(元)"  min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.refundTotal) }}</template>
          </el-table-column>
          <el-table-column label="均费金额(元)" min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.refundAvg) }}</template>
          </el-table-column>
        </el-table-column>

        <!-- 盈亏金额 -->
        <el-table-column label="盈亏金额" align="center">
          <el-table-column label="总金额(元)"  min-width="100" align="center">
            <template #default="{ row }">
              <span :class="row.profitTotal >= 0 ? 'text-success' : 'text-danger'">
                {{ fmtAmt(row.profitTotal) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="均费金额(元)" min-width="100" align="center">
            <template #default="{ row }">{{ fmtAmt(row.profitAvg) }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.finance-container {
  height: 100%;
  background: var(--el-bg-color-page, #f5f7fa);
  padding: 0 0 16px;

  .search-form {
    background: #fff;
    margin-bottom: 12px;

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }

  .stats-row {
    padding: 0 12px;
    margin-bottom: 12px;
  }

  .stat-cards {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .stat-card {
    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;

      &.primary { color: #2dd4bf; }
      &.success  { color: #67c23a; }
      &.danger   { color: #f56c6c; }
    }

    .stat-unit {
      font-size: 13px;
      font-weight: 400;
      margin-left: 4px;
      color: var(--el-text-color-secondary);
    }
  }

  .chart-card {
    :deep(.el-card__body) { padding: 12px; }
  }

  .table-card {
    margin: 0 12px;

    :deep(.el-card__body) { padding: 0; }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
  }

  .text-success { color: #67c23a; }
  .text-danger  { color: #f56c6c; }
}
</style>
