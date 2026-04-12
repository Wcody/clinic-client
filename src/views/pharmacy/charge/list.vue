<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
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

// ==================== 待诊患者 ====================
const pendingColumns = ref([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "姓名", prop: "name", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "年龄", prop: "age", minWidth: 100 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "挂号时间", prop: "registerTime", minWidth: 160 },
  { label: "备注", prop: "remark", minWidth: 150 },
  { label: "状态", prop: "status", minWidth: 100 },
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
  { label: "姓名", prop: "name", minWidth: 150 },
  { label: "性别", prop: "gender", minWidth: 100 },
  { label: "年龄", prop: "age", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "就诊时间", prop: "visitTime", minWidth: 180 },
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 150, slot: "diagnosedOperation" }
]);

const diagnosedList = ref([
  {
    id: "1",
    name: "车梦儿",
    gender: "女",
    age: "31岁0月",
    doctor: "曾俊华",
    visitTime: "2026-04-11 17:01:05",
    status: "未收费"
  },
  {
    id: "2",
    name: "麦穗",
    gender: "女",
    age: "28岁9月",
    doctor: "曾俊华",
    visitTime: "2026-04-11 16:59:25",
    status: "未收费"
  },
  {
    id: "3",
    name: "陈梅芳",
    gender: "女",
    age: "32岁4月",
    doctor: "曾俊华",
    visitTime: "2026-04-11 16:52:47",
    status: "未收费"
  },
  {
    id: "4",
    name: "吴国静夫莫陈彪",
    gender: "男",
    age: "27岁0月",
    doctor: "曾俊华",
    visitTime: "2026-04-11 16:17:40",
    status: "未收费"
  },
  {
    id: "5",
    name: "黄巧夫李春辉",
    gender: "男",
    age: "36岁0月",
    doctor: "曾俊华",
    visitTime: "2026-04-11 16:14:05",
    status: "未收费"
  }
]);

const diagnosedPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 28525
});

// ==================== 方法 ====================
// 查询数据
const handleQuery = () => {
  if (activeTab.value === "pending") {
    // 查询待诊患者
  } else {
    // 查询已诊患者
  }
};

// 查询
const handleSearch = () => {
  diagnosedPagination.currentPage = 1;
  handleQuery();
};

// 重置查询
const handleResetQuery = () => {
  diagnosedQueryForm.patientName = "";
  diagnosedQueryForm.dateRange = ["", ""];
  diagnosedPagination.currentPage = 1;
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
const handleViewPatientDetail = (row: any) => {
  ElMessage.info(`查看患者详情: ${row.name}`);
};

// 查看就诊详情
const handleViewVisitDetail = (row: any) => {
  ElMessage.info(`查看就诊详情: ${row.name}`);
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
                      <span>{{ (pendingPagination.currentPage - 1) * pendingPagination.pageSize + $index + 1 }}</span>
                    </template>

                    <!-- 操作列 -->
                    <template #pendingOperation>
                      <span class="text-gray-400">无操作</span>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 已收费 -->
      <el-tab-pane label="已诊患者" name="diagnosed">
        <div class="tab-content">
          <div class="main">
            <!--已收费 -->
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
                <el-button :icon="useRenderIcon(Refresh)" @click="handleResetQuery">
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
  }
}
</style>
