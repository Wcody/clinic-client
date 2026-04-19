<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import dayjs from "dayjs";
import {
  getDiaryListApi,
  getDoctorListApi,
  type BQDiaryRecordType
} from "@/api/analysis/diary";

defineOptions({
  name: "AnalysisDiaryIndex"
});

// ==================== 筛选表单 ====================
const queryFormRef = ref();

const queryForm = reactive({
  patientName: "",
  diagnosis: "",
  doctor: "",
  chargeStatus: "",
  dateRange: ["", ""] as [string, string]
});

// 缴费状态选项
const chargeStatusOptions = [
  { label: "未缴费", value: "未缴费" },
  { label: "已缴费", value: "已缴费" },
  { label: "已退费", value: "已退费" }
];

// 医生列表
const doctorOptions = ref<{ label: string; value: string }[]>([]);

// ==================== 表格 ====================
const tableRef = ref();
const tableOffsetBottom = ref(160);

const columns = ref([
  { label: "就诊时间", prop: "orderTime", minWidth: 160 },
  { label: "姓名", prop: "patient", minWidth: 100 },
  { label: "性别", prop: "gender", minWidth: 70 },
  { label: "年龄", prop: "ageStr", minWidth: 90 },
  { label: "身份证", prop: "idCard", minWidth: 160 },
  { label: "联系电话", prop: "mobile", minWidth: 130 },
  { label: "联系地址", prop: "address", minWidth: 180 },
  { label: "医生", prop: "doctor", minWidth: 90 },
  { label: "初/复诊", prop: "visitType", minWidth: 80, slot: "visitType" },
  { label: "诊断", prop: "diagnosis", minWidth: 140 },
  { label: "治疗方案", fixed: "right", width: 90, slot: "treatment" }
]);

const tableData = ref<BQDiaryRecordType[]>([]);
const loading = ref(false);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 工具函数 ====================

/** 格式化年龄 */
const formatAge = (row: BQDiaryRecordType) => {
  if (!row.ageFirst && row.ageFirst !== 0) return "";
  const unitMap: Record<number, string> = { 1: "岁", 2: "月", 3: "天" };
  const unit = unitMap[row.ageType] ?? "岁";
  return `${row.ageFirst}${unit}`;
};

/** 将 dateRange 格式化为长时间字符串 */
const formatDateTime = (date: string, isEnd = false): string => {
  if (!date) return "";
  return dayjs(date).format(isEnd ? "YYYY-MM-DD 23:59:59" : "YYYY-MM-DD 00:00:00");
};

// ==================== 查询 ====================

const handleQuery = async () => {
  loading.value = true;
  try {
    const [start, end] = queryForm.dateRange || ["", ""];
    const params: any = {
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    if (queryForm.patientName) params.patientName = queryForm.patientName;
    if (queryForm.doctor) params.doctor = queryForm.doctor;
    if (start) params.startTime = formatDateTime(start, false);
    if (end) params.endTime = formatDateTime(end, true);

    const res = await getDiaryListApi(params);
    if (res.code === 0 && res.data) {
      const list = (res.data.list || []).map(item => ({
        ...item,
        ageStr: formatAge(item)
      }));
      tableData.value = list;
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

const handleSearch = () => {
  pagination.currentPage = 1;
  handleQuery();
};

const handleReset = () => {
  queryForm.patientName = "";
  queryForm.diagnosis = "";
  queryForm.doctor = "";
  queryForm.chargeStatus = "";
  queryForm.dateRange = ["", ""];
  pagination.currentPage = 1;
  handleQuery();
};

/** 查看今日数据：将时间范围固定为今天 */
const handleTodayQuery = () => {
  const today = dayjs().format("YYYY-MM-DD");
  queryForm.dateRange = [today, today];
  pagination.currentPage = 1;
  handleQuery();
};

/** 导出（预留） */
const handleExport = () => {
  ElMessage.info("导出功能开发中");
};

// ==================== 分页 ====================

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

// ==================== 治疗方案查看 ====================
const handleViewTreatment = (row: BQDiaryRecordType) => {
  ElMessage.info(`治疗方案：${row.treatmentPlan || "暂无数据"}`);
};

// ==================== 加载医生列表 ====================
const loadDoctors = async () => {
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
    // 静默失败，不影响页面
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  loadDoctors();
  handleQuery();
});
</script>

<template>
  <div class="diary-container">
    <!-- 查询表单 -->
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      class="search-form bg-bg_color w-[99%] pl-8 pt-[12px] pb-[4px] overflow-auto"
    >
      <!-- 患者姓名/身份证 -->
      <el-form-item>
        <el-input
          v-model="queryForm.patientName"
          placeholder="输入患者姓名查询"
          clearable
          class="!w-[160px]"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <!-- 诊断 -->
      <el-form-item>
        <el-select
          v-model="queryForm.diagnosis"
          placeholder="全部"
          clearable
          class="!w-[130px]"
        >
          <!-- 诊断选项后续可从接口加载 -->
        </el-select>
      </el-form-item>

      <!-- 医生 -->
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

      <!-- 缴费状态 -->
      <el-form-item>
        <el-select
          v-model="queryForm.chargeStatus"
          placeholder="全部"
          clearable
          class="!w-[130px]"
        >
          <el-option
            v-for="opt in chargeStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <!-- 时间范围 -->
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

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button type="success" @click="handleTodayQuery">
          查看今日数据
        </el-button>
        <el-button @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <div :class="['flex', deviceDetection() ? 'flex-wrap' : '']">
      <PureTableBar
        :class="['w-full', '!mt-0']"
        title="门诊日志"
        :columns="columns"
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
            :data="tableData"
            :loading="loading"
            row-key="id"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small'"
            :header-cell-style="{ color: 'var(--el-text-color-primary)' }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <!-- 初/复诊 -->
            <template #visitType="{ row }">
              <el-tag
                :type="row.isFirstVisit ? 'primary' : 'info'"
                size="small"
              >
                {{ row.isFirstVisit ? "初诊" : "复诊" }}
              </el-tag>
            </template>

            <!-- 治疗方案 -->
            <template #treatment="{ row }">
              <el-button
                link
                type="primary"
                :size="size"
                @click="handleViewTreatment(row)"
              >
                查看
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
.diary-container {
  height: 100%;
  background-color: #fff;

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}
</style>
