<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Plus from "@iconify-icons/ep/plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import {
  getDiagnosisDictPageApi,
  saveDiagnosisDictApi,
  updateDiagnosisDictApi,
  deleteDiagnosisDictLogicApi,
  type BQDiagnosisDictEntityType
} from "@/api/visit/diagnosis";
import { BQSearchFilter } from "@/api/api";

defineOptions({ name: "SettingDiagnosisIndex" });

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const formRef = ref<FormInstance>();
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增诊断");
const nameInputRef = ref<HTMLInputElement>();

const queryForm = reactive({
  keyword: "",
  status: ""
});

const statusOptions = [
  { label: "全部", value: "" },
  { label: "启用", value: "true" },
  { label: "禁用", value: "false" }
];

const defaultForm = (): Partial<BQDiagnosisDictEntityType> => ({
  diagnosisCode: "",
  diagnosisName: "",
  pinyin: "",
  status: true
});

const form = reactive<Partial<BQDiagnosisDictEntityType>>(defaultForm());

const formRules: FormRules = {
  diagnosisCode: [
    { required: true, message: "请输入ICD编码", trigger: "blur" },
    { max: 50, message: "长度不超过50个字符", trigger: "blur" }
  ],
  diagnosisName: [
    { required: true, message: "请输入诊断名称", trigger: "blur" },
    { max: 100, message: "长度不超过100个字符", trigger: "blur" }
  ]
};

const columns: TableColumnList = [
  { label: "ICD编码", prop: "diagnosisCode", minWidth: 120 },
  { label: "诊断名称", prop: "diagnosisName", minWidth: 200 },
  { label: "拼音码", prop: "pinyin", minWidth: 120 },
  { label: "状态", prop: "status", minWidth: 100, slot: "status" },
  { label: "创建人", prop: "createdBy", minWidth: 100 },
  { label: "创建时间", prop: "createdTime", minWidth: 160 },
  { label: "操作", fixed: "right", width: 200, slot: "operation" }
];

const dataList = ref<BQDiagnosisDictEntityType[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const handleSearch = () => {
  pagination.currentPage = 1;
  handleQuery();
};

const handleResetQuery = () => {
  queryForm.keyword = "";
  queryForm.status = "";
  pagination.currentPage = 1;
  handleQuery();
};

const handleQuery = async () => {
  loading.value = true;
  try {
    const filters: any[] = [];

    if (queryForm.keyword) {
      filters.push(
        new BQSearchFilter("diagnosisName", "like", queryForm.keyword)
      );
    }

    if (queryForm.status !== "") {
      filters.push(new BQSearchFilter("status", "eq", queryForm.status));
    }

    const params: Record<string, any> = {
      page: pagination.currentPage,
      size: pagination.pageSize
    };
    if (filters.length > 0) {
      params.filters = filters;
    }

    const res = await getDiagnosisDictPageApi(params);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.errMsg || res.message || "查询失败");
    }
  } catch (error) {
    console.error("查询诊断列表失败:", error);
    ElMessage.error("查询失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

const openDialog = (type: "add" | "edit", row?: BQDiagnosisDictEntityType) => {
  if (type === "add") {
    dialogTitle.value = "新增诊断";
    Object.assign(form, defaultForm());
  } else {
    dialogTitle.value = "编辑诊断";
    Object.assign(form, {
      id: row!.id,
      diagnosisCode: row!.diagnosisCode,
      diagnosisName: row!.diagnosisName,
      pinyin: row!.pinyin,
      status: row!.status,
      version: row!.version
    });
  }
  formRef.value?.clearValidate();
  dialogVisible.value = true;
  nextTick(() => {
    nameInputRef.value?.focus();
  });
};

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const isEdit = !!form.id;
    const res = isEdit
      ? await updateDiagnosisDictApi(form as BQDiagnosisDictEntityType)
      : await saveDiagnosisDictApi(form);

    if (res.code === 0) {
      ElMessage.success(isEdit ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      handleQuery();
    } else {
      ElMessage.error(res.errMsg || res.message || "保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleToggleStatus = async (row: BQDiagnosisDictEntityType) => {
  const action = row.status ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(
      `确定要${action}诊断「${row.diagnosisName}」吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const res = await updateDiagnosisDictApi({
      ...row,
      status: !row.status
    });

    if (res.code === 0) {
      row.status = !row.status;
      ElMessage.success(`${action}成功`);
    } else {
      ElMessage.error(res.errMsg || res.message || `${action}失败`);
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(`${action}失败:`, error);
      ElMessage.error(`${action}失败`);
    }
  }
};

const handleDelete = async (row: BQDiagnosisDictEntityType) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除诊断「${row.diagnosisName}」吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const res = await deleteDiagnosisDictLogicApi(row.id);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      handleQuery();
    } else {
      ElMessage.error(res.errMsg || res.message || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败，请稍后重试");
    }
  }
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
      <el-form-item label="诊断检索" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          placeholder="诊断名称/ICD编码/拼音码"
          clearable
          class="!w-[220px]"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="全部"
          clearable
          class="!w-[120px]"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        class="w-full"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="诊断字典"
        :columns="columns"
        @refresh="handleQuery"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(Plus)"
            @click="openDialog('add')"
          >
            新增
          </el-button>
        </template>

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
            :header-cell-style="{ color: 'var(--el-text-color-primary)' }"
            @page-size-change="handleSizeChange"
            @page-current-change="handlePageChange"
          >
            <template #status="{ row }">
              <el-tag :type="row.status ? 'success' : 'danger'" size="small">
                {{ row.status ? "启用" : "禁用" }}
              </el-tag>
            </template>

            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="openDialog('edit', row)"
              >
                编辑
              </el-button>
              <el-button
                class="reset-margin"
                link
                :type="row.status ? 'danger' : 'success'"
                :size="size"
                @click="handleToggleStatus(row)"
              >
                {{ row.status ? "禁用" : "启用" }}
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="danger"
                :size="size"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
      draggable
      @close="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="90px"
      >
        <el-form-item label="ICD编码" prop="diagnosisCode">
          <el-input
            ref="nameInputRef"
            v-model="form.diagnosisCode"
            placeholder="请输入ICD编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="诊断名称" prop="diagnosisName">
          <el-input
            v-model="form.diagnosisName"
            placeholder="请输入诊断名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="拼音码">
          <el-input
            v-model="form.pinyin"
            placeholder="请输入拼音码"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          确定
        </el-button>
      </template>
    </el-dialog>
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
