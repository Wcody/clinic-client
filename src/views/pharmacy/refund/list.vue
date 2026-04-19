<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import { ElMessage } from "element-plus";

defineOptions({
  name: "PharmacyRefund"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();

const queryForm = reactive({
  patientName: "",
  dateRange: ["", ""]
});

const columns = ref([
  { label: "姓名", prop: "patientName", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "退费员", prop: "refundOperator", minWidth: 100 },
  { label: "收费类型", prop: "chargeType", minWidth: 120 },
  { label: "退费时间", prop: "refundTime", minWidth: 180 },
  { label: "退费金额", prop: "refundAmount", minWidth: 120 },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
]);

const dataList = ref([
  {
    id: "1",
    patientName: "陈军仙",
    gender: "女",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-11-30 10:51:48",
    refundAmount: "2190.00 元"
  },
  {
    id: "2",
    patientName: "梁国男",
    gender: "男",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-12-30 08:07:08",
    refundAmount: "583.00 元"
  },
  {
    id: "3",
    patientName: "张一",
    gender: "女",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-09-01 11:24:46",
    refundAmount: "866.00 元"
  },
  {
    id: "4",
    patientName: "吴国静技师落海",
    gender: "男",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-05-17 19:13:03",
    refundAmount: "15.00 元"
  },
  {
    id: "5",
    patientName: "吴国静技师落海",
    gender: "男",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-05-17 19:11:03",
    refundAmount: "470.80 元"
  },
  {
    id: "6",
    patientName: "卢德富",
    gender: "女",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-01-13 10:23:59",
    refundAmount: "316.50 元"
  },
  {
    id: "7",
    patientName: "陈乃香",
    gender: "男",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2021-02-27 14:31:35",
    refundAmount: "405.00 元"
  },
  {
    id: "8",
    patientName: "冯杰",
    gender: "女",
    refundOperator: "曾俊华",
    chargeType: "门诊处方",
    refundTime: "2020-10-24 09:14:27",
    refundAmount: "340.00 元"
  }
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 8
});

const loading = ref(false);

const handleSearch = () => {
  pagination.currentPage = 1;
  handleQuery();
};

const handleResetQuery = () => {
  queryForm.patientName = "";
  queryForm.dateRange = ["", ""];
  pagination.currentPage = 1;
  handleQuery();
};

const handleQuery = () => {
  // TODO: 调用退费列表接口
};

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看退费详情: ${row.patientName}`);
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="患者姓名" prop="patientName">
        <el-input
          v-model="queryForm.patientName"
          placeholder="请输入患者姓名"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="时间" prop="dateRange">
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="!w-[260px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="handleResetQuery">
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
        title="退费列表"
        :columns="columns"
        @refresh="handleQuery"
      >
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="dataList"
            row-key="id"
            :columns="dynamicColumns"
            :pagination="pagination"
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
                详情
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
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
</style>
