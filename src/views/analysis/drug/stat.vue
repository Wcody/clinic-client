<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import {
  getDrugSalesStatListApi,
  getDrugSalesStatSummaryApi,
  type DrugSalesStatRow,
  type DrugSalesSummary
} from "@/api/analysis/drug";
import { getDoctorListApi } from "@/api/analysis/diary";

defineOptions({ name: "AnalysisDrugStat" });

// ==================== 筛选 ====================
const queryForm = reactive({
  drugName: "",
  dateRange: ["", ""] as [string, string]
});

const fmt = (date: string, isEnd = false) =>
  date ? dayjs(date).format(isEnd ? "YYYY-MM-DD 23:59:59" : "YYYY-MM-DD 00:00:00") : "";

const buildParams = () => {
  const [start, end] = queryForm.dateRange || ["", ""];
  const params: Record<string, string> = {};
  if (queryForm.drugName) params.drugName = queryForm.drugName;
  const s = fmt(start, false);
  const e = fmt(end, true);
  if (s) params.startTime = s;
  if (e) params.endTime = e;
  return params;
};

// ==================== 汇总卡片 ====================
const summary = reactive<DrugSalesSummary>({
  drugTypeCount: 0,
  totalQuantity: 0,
  totalAmount: 0
});

const loadSummary = async () => {
  try {
    const res = await getDrugSalesStatSummaryApi(buildParams());
    if (res.code === 0 && res.data) Object.assign(summary, res.data);
  } catch { /* 静默 */ }
};

// ==================== 表格 ====================
const loading = ref(false);
const tableData = ref<DrugSalesStatRow[]>([]);
const pagination = reactive({ currentPage: 1, pageSize: 20, total: 0 });

const columns = ref([
  { label: "药品名称", prop: "drugName", minWidth: 140 },
  { label: "规格", prop: "specification", minWidth: 120 },
  { label: "单位", prop: "unit", minWidth: 80 },
  { label: "生产厂家", prop: "manufacturer", minWidth: 160 },
  { label: "销售次数", prop: "saleTimes", minWidth: 90 },
  { label: "总数量", prop: "totalQuantity", minWidth: 100 },
  { label: "总金额", prop: "totalAmount", minWidth: 110 },
  { label: "平均单价", prop: "avgPrice", minWidth: 100 }
]);

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getDrugSalesStatListApi({
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

const handleQuery = () => {
  pagination.currentPage = 1;
  Promise.all([loadSummary(), loadList()]);
};

const handleReset = () => {
  queryForm.drugName = "";
  queryForm.dateRange = ["", ""];
  handleQuery();
};

const handleTodayQuery = () => {
  const today = dayjs().format("YYYY-MM-DD");
  queryForm.dateRange = [today, today];
  handleQuery();
};

const handleExport = () => ElMessage.info("导出功能开发中");

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  loadList();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadList();
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="drug-stat-container">
    <!-- 筛选栏 -->
    <el-form :inline="true" class="search-form bg-bg_color pl-8 pt-3 pb-1">
      <el-form-item>
        <el-input
          v-model="queryForm.drugName"
          placeholder="输入药品名称查询"
          clearable
          class="!w-[160px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
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
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          @click="handleQuery"
        >查询</el-button>
        <el-button type="success" @click="handleTodayQuery">查看今日数据</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 汇总卡片 -->
    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">药品种类</div>
            <div class="stat-value">{{ summary.drugTypeCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">总销售数量</div>
            <div class="stat-value">{{ Number(summary.totalQuantity).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">总销售金额</div>
            <div class="stat-value primary">¥{{ Number(summary.totalAmount).toFixed(2) }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计表格 -->
    <div class="table-wrap">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        size="small"
        style="width: 100%"
        :header-cell-style="{
          color: 'var(--el-text-color-primary)',
          background: 'var(--el-fill-color-light)'
        }"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth"
          align="center"
        />
      </el-table>

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
    </div>
  </div>
</template>

<style scoped lang="scss">
.drug-stat-container {
  height: 100%;
  background: var(--el-bg-color-page, #f5f7fa);

  .search-form {
    background: #fff;
    margin-bottom: 12px;
    :deep(.el-form-item) { margin-bottom: 12px; }
  }

  .stats-row {
    padding: 0 16px 12px;
  }

  .stat-card {
    :deep(.el-card__body) { padding: 16px 20px; }
    .stat-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      &.primary { color: #2dd4bf; }
    }
  }

  .table-wrap {
    padding: 0 16px 16px;
    background: #fff;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 12px 0;
  }
}
</style>