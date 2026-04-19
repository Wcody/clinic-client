<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import {
  getWorkloadListApi,
  getWorkloadSummaryApi,
  type WorkloadRow,
  type WorkloadSummary
} from "@/api/analysis/workload";
import { getDoctorListApi } from "@/api/analysis/diary";

defineOptions({ name: "AnalysisWorkloadIndex" });

// ==================== 筛选 ====================
const doctorOptions = ref<{ label: string; value: string }[]>([]);

const queryForm = reactive({
  doctor: "",
  dateRange: ["", ""] as [string, string]
});

const fmt = (date: string, isEnd = false) =>
  date
    ? dayjs(date).format(isEnd ? "YYYY-MM-DD 23:59:59" : "YYYY-MM-DD 00:00:00")
    : "";

const buildParams = () => {
  const [start, end] = queryForm.dateRange || ["", ""];
  const params: Record<string, string> = {};
  if (queryForm.doctor) params.doctor = queryForm.doctor;
  const s = fmt(start, false);
  const e = fmt(end, true);
  if (s) params.startTime = s;
  if (e) params.endTime = e;
  return params;
};

// ==================== 汇总卡片 ====================
const summary = reactive<WorkloadSummary>({
  totalSales: 0,
  totalCost: 0,
  totalProfit: 0
});

const loadSummary = async () => {
  try {
    const res = await getWorkloadSummaryApi(buildParams());
    if (res.code === 0 && res.data) Object.assign(summary, res.data);
  } catch {
    /* 静默 */
  }
};

// ==================== 表格 ====================
const loading = ref(false);
const tableData = ref<WorkloadRow[]>([]);

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getWorkloadListApi(buildParams());
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || [];
    } else {
      ElMessage.error(res.errMsg || "查询失败");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "查询失败");
  } finally {
    loading.value = false;
  }
};

const fmtAmt = (val: any) =>
  val == null ? "0.00元" : `${Number(val).toFixed(2)}元`;

// ==================== 操作 ====================
const handleQuery = () => Promise.all([loadSummary(), loadList()]);

const handleExport = () => ElMessage.info("导出功能开发中");

// ==================== 初始化 ====================
onMounted(async () => {
  try {
    const res = await getDoctorListApi();
    if (res.code === 0 && res.data) {
      const raw = (res.data as any)?.list ?? res.data;
      doctorOptions.value = (Array.isArray(raw) ? raw : []).map((d: any) => ({
        label: d.name,
        value: d.name
      }));
    }
  } catch {
    /* 静默 */
  }
  handleQuery();
});
</script>

<template>
  <div class="workload-container">
    <!-- 筛选栏 -->
    <el-form :inline="true" class="search-form bg-bg_color pl-8 pt-3 pb-1">
      <el-form-item>
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD"
          class="!w-[280px]"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="queryForm.doctor"
          placeholder="全部"
          clearable
          class="!w-[130px]"
        >
          <el-option
            v-for="d in doctorOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          @click="handleQuery"
        >查询</el-button>
        <el-button @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 销售概览 -->
    <div class="overview-section">
      <div class="overview-title">
        <span class="title-bar" />销售概览：
      </div>
      <el-row :gutter="16" class="overview-cards">
        <!-- 总利润 -->
        <el-col :span="8">
          <div class="stat-card yellow">
            <div class="card-content">
              <div class="card-amount">
                {{ Number(summary.totalProfit).toFixed(2) }}元
              </div>
              <div class="card-label">总利润</div>
            </div>
            <div class="card-icon">
              <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
                <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.7)" stroke-width="3"/>
                <text x="32" y="42" text-anchor="middle" font-size="28" font-weight="bold" fill="rgba(255,255,255,0.9)">¥</text>
              </svg>
            </div>
          </div>
        </el-col>
        <!-- 总销售额 -->
        <el-col :span="8">
          <div class="stat-card blue">
            <div class="card-content">
              <div class="card-amount">
                {{ Number(summary.totalSales).toFixed(2) }}元
              </div>
              <div class="card-label">总销售额</div>
            </div>
            <div class="card-icon">
              <svg viewBox="0 0 64 64" width="60" height="60" fill="rgba(255,255,255,0.85)">
                <rect x="8"  y="32" width="10" height="24" rx="2"/>
                <rect x="27" y="20" width="10" height="36" rx="2"/>
                <rect x="46" y="10" width="10" height="46" rx="2"/>
                <path d="M8 28 L32 16 L56 8" stroke="rgba(255,255,255,0.95)" stroke-width="3" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </el-col>
        <!-- 总成本 -->
        <el-col :span="8">
          <div class="stat-card green">
            <div class="card-content">
              <div class="card-amount">
                {{ Number(summary.totalCost).toFixed(2) }}元
              </div>
              <div class="card-label">总成本</div>
            </div>
            <div class="card-icon">
              <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
                <path d="M10 44 L24 28 L36 36 L54 14" stroke="rgba(255,255,255,0.9)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <polygon points="46,10 58,10 58,22" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>
          </div>
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
        <el-table-column prop="doctor"           label="医生"     min-width="90"  align="center" fixed />
        <el-table-column prop="patientCount"      label="患者人数" min-width="90"  align="center" />
        <el-table-column prop="visitCount"        label="门诊人次" min-width="90"  align="center" />
        <el-table-column prop="prescriptionCount" label="处方数"   min-width="80"  align="center" />
        <el-table-column label="处方总费用" min-width="130" align="center">
          <template #default="{ row }">{{ fmtAmt(row.prescriptionFee) }}</template>
        </el-table-column>
        <el-table-column label="实收总额" min-width="120" align="center">
          <template #default="{ row }">{{ fmtAmt(row.actualAmount) }}</template>
        </el-table-column>
        <el-table-column label="总成本" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.totalCost) }}</template>
        </el-table-column>
        <el-table-column label="总利润" min-width="110" align="center">
          <template #default="{ row }">
            <span :class="Number(row.totalProfit) >= 0 ? 'profit-pos' : 'profit-neg'">
              {{ fmtAmt(row.totalProfit) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="西药费"   min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.westernDrugFee) }}</template>
        </el-table-column>
        <el-table-column label="中草药费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.chineseHerbalFee) }}</template>
        </el-table-column>
        <el-table-column label="中成药费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.chinesePatentFee) }}</template>
        </el-table-column>
        <el-table-column label="治疗费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.treatmentFee) }}</template>
        </el-table-column>
        <el-table-column label="诊查费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.consultFee) }}</template>
        </el-table-column>
        <el-table-column label="材料费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.materialFee) }}</template>
        </el-table-column>
        <el-table-column label="其他费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.otherFee) }}</template>
        </el-table-column>
        <el-table-column label="附加费" min-width="110" align="center">
          <template #default="{ row }">{{ fmtAmt(row.additionalFee) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workload-container {
  height: 100%;
  background: var(--el-bg-color-page, #f5f7fa);

  .search-form {
    background: #fff;
    margin-bottom: 0;
    :deep(.el-form-item) { margin-bottom: 12px; }
  }

  /* 销售概览 */
  .overview-section {
    padding: 16px 16px 12px;
    background: #fff;
    margin-bottom: 12px;
  }

  .overview-title {
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 14px;

    .title-bar {
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #409eff;
      border-radius: 2px;
      margin-right: 8px;
    }
  }

  .overview-cards { margin: 0 !important; }

  .stat-card {
    border-radius: 10px;
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    position: relative;

    &.yellow {
      background: linear-gradient(135deg, #f9a825 0%, #ffd54f 100%);
    }
    &.blue {
      background: linear-gradient(135deg, #0288d1 0%, #29b6f6 100%);
    }
    &.green {
      background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%);
    }

    /* 右上角装饰圆 */
    &::after {
      content: '';
      position: absolute;
      right: -24px;
      top: -24px;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .card-content {
      .card-amount {
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
      }
      .card-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 8px;
      }
    }

    .card-icon {
      flex-shrink: 0;
      z-index: 1;
    }
  }

  /* 表格 */
  .table-wrap {
    padding: 0 16px 16px;
    background: #fff;
  }

  .profit-pos { color: #67c23a; font-weight: 500; }
  .profit-neg { color: #f56c6c; font-weight: 500; }
}
</style>
