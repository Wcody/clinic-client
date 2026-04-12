<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

defineOptions({
  name: "BaseDataManagement"
});

const tableRef = ref();
const contentRef = ref();
const activeTab = ref("usage");
const dialogVisible = ref(false);
const dialogTitle = ref("新建基础项目");

// 表单数据
const baseDataForm = reactive({
  id: "",
  name: "",
  category: "",
  sortOrder: 1,
  isPublic: true,
  executeProject: false
});

// 当前激活页签的配置
const tabConfigs = {
  usage: {
    label: "用法",
    columns: [
      { label: "名称", prop: "name", minWidth: 200 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "药品类别", prop: "drugCategory", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "执行项目", prop: "executeProject", minWidth: 120, slot: "executeProject" },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [
      { id: "1", name: "口服", category: "用法", drugCategory: "西药", sortOrder: 1, isPublic: true, executeProject: false },
      { id: "2", name: "冲服", category: "用法", drugCategory: "西药", sortOrder: 2, isPublic: true, executeProject: false },
      { id: "3", name: "静脉注射", category: "用法", drugCategory: "西药", sortOrder: 3, isPublic: true, executeProject: true },
      { id: "4", name: "静脉滴注", category: "用法", drugCategory: "西药", sortOrder: 3, isPublic: true, executeProject: true },
      { id: "5", name: "肌肉注射", category: "用法", drugCategory: "西药", sortOrder: 4, isPublic: true, executeProject: true },
      { id: "6", name: "皮下注射", category: "用法", drugCategory: "西药", sortOrder: 5, isPublic: true, executeProject: true },
      { id: "7", name: "皮试", category: "用法", drugCategory: "西药", sortOrder: 6, isPublic: true, executeProject: true },
      { id: "8", name: "舌下含服", category: "用法", drugCategory: "西药", sortOrder: 7, isPublic: true, executeProject: false },
      { id: "9", name: "穴位注射", category: "用法", drugCategory: "西药", sortOrder: 7, isPublic: false, executeProject: false },
      { id: "10", name: "外用", category: "用法", drugCategory: "西药", sortOrder: 8, isPublic: true, executeProject: false },
      { id: "11", name: "外敷", category: "用法", drugCategory: "西药", sortOrder: 9, isPublic: true, executeProject: false },
      { id: "12", name: "外洗", category: "用法", drugCategory: "西药", sortOrder: 10, isPublic: true, executeProject: false }
    ],
    total: 41
  },
  frequency: {
    label: "频率",
    columns: [
      { label: "名称", prop: "name", minWidth: 250 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [
      { id: "1", name: "每日一次（qd） 1天1次", category: "频率", sortOrder: 1, isPublic: true },
      { id: "2", name: "每日两次（bid） 1天2次", category: "频率", sortOrder: 2, isPublic: true },
      { id: "3", name: "每日三次（tid） 1天3次", category: "频率", sortOrder: 3, isPublic: true },
      { id: "4", name: "每日四次（qid） 1天4次", category: "频率", sortOrder: 4, isPublic: true },
      { id: "5", name: "饭后 1天3次", category: "频率", sortOrder: 5, isPublic: true },
      { id: "6", name: "饭前 1天3次", category: "频率", sortOrder: 6, isPublic: true },
      { id: "7", name: "饭间服用 1天3次", category: "频率", sortOrder: 7, isPublic: true },
      { id: "8", name: "必要时（prn） 1天1次", category: "频率", sortOrder: 8, isPublic: true },
      { id: "9", name: "立即（st） 1天1次", category: "频率", sortOrder: 9, isPublic: true },
      { id: "10", name: "2小时一次 1天12次", category: "频率", sortOrder: 10, isPublic: true },
      { id: "11", name: "4小时一次 1天6次", category: "频率", sortOrder: 11, isPublic: true },
      { id: "12", name: "6小时一次 1天4次", category: "频率", sortOrder: 12, isPublic: true }
    ],
    total: 22
  },
  unit: {
    label: "单位",
    columns: [
      { label: "名称", prop: "name", minWidth: 200 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [
      { id: "1", name: "片", category: "单位", sortOrder: 1, isPublic: true },
      { id: "2", name: "粒", category: "单位", sortOrder: 2, isPublic: true },
      { id: "3", name: "盒", category: "单位", sortOrder: 3, isPublic: true },
      { id: "4", name: "板", category: "单位", sortOrder: 4, isPublic: true },
      { id: "5", name: "包", category: "单位", sortOrder: 5, isPublic: true },
      { id: "6", name: "g", category: "单位", sortOrder: 6, isPublic: true },
      { id: "7", name: "支", category: "单位", sortOrder: 7, isPublic: true },
      { id: "8", name: "袋", category: "单位", sortOrder: 8, isPublic: true },
      { id: "9", name: "丸", category: "单位", sortOrder: 9, isPublic: true },
      { id: "10", name: "只", category: "单位", sortOrder: 10, isPublic: true },
      { id: "11", name: "瓶", category: "单位", sortOrder: 11, isPublic: true },
      { id: "12", name: "滴", category: "单位", sortOrder: 12, isPublic: true }
    ],
    total: 62
  },
  dosageForm: {
    label: "剂型",
    columns: [
      { label: "名称", prop: "name", minWidth: 200 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [
      { id: "1", name: "颗粒剂", category: "剂型", sortOrder: 1, isPublic: true },
      { id: "2", name: "气雾剂", category: "剂型", sortOrder: 2, isPublic: true },
      { id: "3", name: "针剂", category: "剂型", sortOrder: 3, isPublic: true },
      { id: "4", name: "片剂", category: "剂型", sortOrder: 4, isPublic: true },
      { id: "5", name: "胶囊剂", category: "剂型", sortOrder: 5, isPublic: true },
      { id: "6", name: "合剂", category: "剂型", sortOrder: 6, isPublic: true },
      { id: "7", name: "注射剂", category: "剂型", sortOrder: 7, isPublic: true },
      { id: "8", name: "丸剂", category: "剂型", sortOrder: 8, isPublic: true },
      { id: "9", name: "溶液剂", category: "剂型", sortOrder: 9, isPublic: true },
      { id: "10", name: "滴丸剂", category: "剂型", sortOrder: 10, isPublic: true },
      { id: "11", name: "注射液", category: "剂型", sortOrder: 11, isPublic: true },
      { id: "12", name: "喷雾剂", category: "剂型", sortOrder: 12, isPublic: true }
    ],
    total: 257
  },
  decoction: {
    label: "煎药方式（中药）",
    columns: [
      { label: "名称", prop: "name", minWidth: 200 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [],
    total: 0
  },
  allergy: {
    label: "过敏史",
    columns: [
      { label: "名称", prop: "name", minWidth: 200 },
      { label: "所属类别", prop: "category", minWidth: 120 },
      { label: "排序", prop: "sortOrder", minWidth: 100 },
      { label: "操作", fixed: "right", width: 200, slot: "operation" }
    ],
    data: [],
    total: 0
  }
};

// 当前表格列
const currentColumns = computed(() => tabConfigs[activeTab.value]?.columns || []);
// 当前数据列表
const currentDataList = computed(() => tabConfigs[activeTab.value]?.data || []);
// 当前总数
const currentTotal = computed(() => tabConfigs[activeTab.value]?.total || 0);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 41
});

// 监听页签切换
const handleTabChange = () => {
  pagination.currentPage = 1;
  pagination.total = currentTotal.value;
};

// 查询数据
const handleQuery = () => {
  // TODO: 调用后端接口
};

// 分页改变
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

// 每页显示数量改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

// 打开添加对话框
const openDialog = () => {
  dialogTitle.value = "新建基础项目";
  Object.assign(baseDataForm, {
    id: "",
    name: "",
    category: tabConfigs[activeTab.value]?.label || "",
    sortOrder: 1,
    isPublic: true,
    executeProject: false
  });
  dialogVisible.value = true;
};

// 保存基础项目
const handleSave = () => {
  if (!baseDataForm.name) {
    ElMessage.warning("请输入项目名称");
    return;
  }

  // TODO: 调用后端接口保存
  ElMessage.success("添加成功");
  dialogVisible.value = false;
  handleQuery();
};

// Lifecycle
onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="main">
    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        :class="['w-full']"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="基础数据设置"
        :columns="currentColumns"
        @refresh="handleQuery"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog"
          >
            新建基础项目
          </el-button>
        </template>
        
        <!-- 页签切换 -->
        <template #default>
          <el-tabs
            v-model="activeTab"
            class="data-tabs"
            @tab-change="handleTabChange"
          >
            <el-tab-pane
              v-for="(config, key) in tabConfigs"
              :key="key"
              :label="config.label"
              :name="key"
            />
          </el-tabs>
        </template>

        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            adaptive
            border
            stripe
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="currentDataList"
            row-key="id"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <!-- 执行项目列 -->
            <template #executeProject="{ row }">
              <el-checkbox :model-value="row.executeProject" disabled />
            </template>

            <!-- 操作列 -->
            <template #operation="{ row }">
              <template v-if="row.isPublic">
                <span class="text-gray-400">公共数据不允许编辑</span>
              </template>
              <template v-else>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                >
                  编辑
                </el-button>
              </template>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>

    <!-- 添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="baseDataForm" label-width="120px">
        <el-form-item label="项目名称" required>
          <el-input v-model="baseDataForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="所属类别">
          <el-input v-model="baseDataForm.category" disabled />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="baseDataForm.sortOrder"
            :min="1"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item
          v-if="activeTab === 'usage'"
          label="药品类别"
        >
          <el-select v-model="baseDataForm.drugCategory" style="width: 100%">
            <el-option label="西药" value="西药" />
            <el-option label="中药" value="中药" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="activeTab === 'usage'"
          label="执行项目"
        >
          <el-switch v-model="baseDataForm.executeProject" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 8px 8px 0 8px !important;
}

.data-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}
</style>
