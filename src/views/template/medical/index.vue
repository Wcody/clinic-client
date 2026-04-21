<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  type BQMedicalRecordTemplateEntityType,
  getMedicalRecordTemplateEntityDefault,
  getMedicalRecordTemplateTreeApi,
  getMedicalRecordTemplateApi,
  addMedicalRecordTemplateApi,
  updateMedicalRecordTemplateApi,
  deleteMedicalRecordTemplateApi
} from "@/api/cm/medicalRecordTemplate";

defineOptions({
  name: "TemplateMedicalIndex"
});

const listLoading = ref(false);
const formLoading = ref(false);
const treeData = ref<any[]>([]);
const selectedId = ref("");
const isNew = ref(false);
const isCategoryNode = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const searchKeyword = ref("");
const isDirty = ref(false);

const form = reactive<BQMedicalRecordTemplateEntityType>(
  getMedicalRecordTemplateEntityDefault()
);
const metaInfo = reactive({ updatedTime: "", updatedBy: "" });

// ─── 计算属性 ─────────────────────────────────────────────────
const hasSelected = computed(() => !!selectedId.value || isNew.value);
const canSave = computed(() => hasSelected.value && !isCategoryNode.value);
const canDelete = computed(() => !!selectedId.value && !isNew.value && !isCategoryNode.value);
const canCancel = computed(() => hasSelected.value && isDirty.value);
const canEdit = computed(() => !!selectedId.value && !isNew.value && !isCategoryNode.value);
const formDisabled = computed(() => !isNew.value && !isEditing.value);

// 过滤后的树形数据（本地搜索）
const filteredTreeData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return treeData.value;
  }

  const keyword = searchKeyword.value.toLowerCase().trim();

  const filterNodes = (nodes: any[]): any[] => {
    return nodes
      .map(node => {
        const newNode = { ...node };
        if (node.children && node.children.length > 0) {
          newNode.children = filterNodes(node.children);
        }
        const nameMatch = node.name?.toLowerCase().includes(keyword);
        if (nameMatch || (newNode.children && newNode.children.length > 0)) {
          return newNode;
        }
        return null;
      })
      .filter(node => node !== null);
  };

  return filterNodes(treeData.value);
});

// ─── 数据加载 ─────────────────────────────────────────────────
const loadTreeData = async () => {
  listLoading.value = true;
  try {
    const res: any = await getMedicalRecordTemplateTreeApi();
    if (res.code === 0 && res.data) {
      treeData.value = res.data;
    } else {
      ElMessage.error(res.errMsg || res.message || "加载失败");
    }
  } catch (error) {
    console.error("加载树形数据失败:", error);
    ElMessage.error("加载树形数据失败");
  } finally {
    listLoading.value = false;
  }
};

const loadTemplateDetail = async (templateId: string) => {
  isLoading.value = true;
  try {
    const res: any = await getMedicalRecordTemplateApi(templateId);
    if (res.code === 0 && res.data) {
      Object.assign(form, getMedicalRecordTemplateEntityDefault(res.data));
      metaInfo.updatedTime = res.data.updatedTime ?? res.data.createdTime ?? "";
      metaInfo.updatedBy = res.data.updatedBy ?? res.data.createdBy ?? "";
      isDirty.value = false;
    } else {
      ElMessage.error(res.errMsg || res.message || "加载详情失败");
    }
  } catch (error) {
    console.error("加载模板详情失败:", error);
    ElMessage.error("加载模板详情失败");
  } finally {
    isLoading.value = false;
  }
};

// ─── 操作 ─────────────────────────────────────────────────────
const handleNodeClick = async (data: any) => {
  const targetId = String(data.id);

  // 如果点击的是当前选中节点，不做处理
  if (targetId === selectedId.value && !isNew.value) return;

  // 如果当前有未保存的修改（编辑模式或新增模式），先提示保存
  const wasEditing = isNew.value || isEditing.value;
  if (wasEditing && isDirty.value) {
    try {
      await ElMessageBox.confirm("当前有未保存的修改，是否保存？", "提示", {
        confirmButtonText: "保存",
        cancelButtonText: "不保存",
        type: "warning"
      });
      await handleSave();
      // 保存后继续执行加载新节点
    } catch {
      // 用户选择"不保存"：恢复到编辑前的状态，停留当前节点
      if (isEditing.value && selectedId.value) {
        isEditing.value = false;
        isDirty.value = false;
        await loadTemplateDetail(selectedId.value);
      } else if (isNew.value) {
        isNew.value = false;
        isEditing.value = false;
        isDirty.value = false;
        Object.assign(form, getMedicalRecordTemplateEntityDefault());
        metaInfo.updatedTime = "";
        metaInfo.updatedBy = "";
      }
      // 停留当前节点，不执行切换
      return;
    }
  }

  // 切换到新节点
  selectedId.value = targetId;
  isCategoryNode.value = !!data.hasCategory;
  isNew.value = false;
  isEditing.value = false;
  isDirty.value = false;

  if (data.hasCategory) {
    Object.assign(form, getMedicalRecordTemplateEntityDefault({ ...data }));
    metaInfo.updatedTime = data.updatedTime ?? data.createdTime ?? "";
    metaInfo.updatedBy = data.updatedBy ?? data.createdBy ?? "";
  } else {
    await loadTemplateDetail(String(data.id));
  }
};

const handleAdd = async () => {
  // 如果当前有未保存的修改（编辑模式或新增模式），先提示保存
  const wasEditing = isNew.value || isEditing.value;
  if (wasEditing && isDirty.value) {
    try {
      await ElMessageBox.confirm("当前有未保存的修改，是否保存？", "提示", {
        confirmButtonText: "保存",
        cancelButtonText: "不保存",
        type: "warning"
      });
      await handleSave();
      // 保存后继续执行新增
    } catch {
      // 用户选择"不保存"：恢复到编辑前的状态，停留当前状态
      if (isEditing.value && selectedId.value) {
        isEditing.value = false;
        isDirty.value = false;
        await loadTemplateDetail(selectedId.value);
      } else if (isNew.value) {
        isNew.value = false;
        isEditing.value = false;
        isDirty.value = false;
        Object.assign(form, getMedicalRecordTemplateEntityDefault());
        metaInfo.updatedTime = "";
        metaInfo.updatedBy = "";
      }
      // 停留当前状态，不执行新增
      return;
    }
  }

  selectedId.value = "";
  isNew.value = true;
  isCategoryNode.value = false;
  isEditing.value = false;
  isDirty.value = false;
  Object.assign(form, getMedicalRecordTemplateEntityDefault());
  metaInfo.updatedTime = "";
  metaInfo.updatedBy = "";
};

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning("请输入名称");
    return;
  }

  formLoading.value = true;
  try {
    const now = new Date().toISOString();
    let savedId = (form as any).id;

    if (isNew.value) {
      const submitData = { ...form, createdTime: now, updatedTime: now };
      const res: any = await addMedicalRecordTemplateApi(submitData);
      if (res.code === 0 && res.data) {
        savedId = res.data.id;
        isNew.value = false;
        selectedId.value = String(savedId);
        isEditing.value = false;
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(res.errMsg || res.message || "保存失败");
        return;
      }
    } else {
      const submitData = { ...form, updatedTime: now };
      const res: any = await updateMedicalRecordTemplateApi(submitData);
      if (res.code === 0) {
        isEditing.value = false;
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(res.errMsg || res.message || "保存失败");
        return;
      }
    }

    isDirty.value = false;
    await loadTreeData();
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  } finally {
    formLoading.value = false;
  }
};

const handleCancel = () => {
  if (isNew.value) {
    isNew.value = false;
    isCategoryNode.value = false;
    Object.assign(form, getMedicalRecordTemplateEntityDefault());
    metaInfo.updatedTime = "";
    metaInfo.updatedBy = "";
  } else if (selectedId.value) {
    loadTemplateDetail(selectedId.value);
  }
  isEditing.value = false;
  isDirty.value = false;
};

const handleEdit = () => {
  if (!canEdit.value) return;
  isEditing.value = true;
};

const handleStatusChange = async (value: boolean) => {
  if (isNew.value || !selectedId.value) return;

  try {
    const now = new Date().toISOString();
    const submitData = { ...(form as any), status: value, updatedTime: now };
    const res: any = await updateMedicalRecordTemplateApi(submitData);
    if (res.code === 0) {
      ElMessage.success(value ? "已启用" : "已停用");
      isDirty.value = false;
      await loadTreeData();
    } else {
      ElMessage.error(res.errMsg || res.message || "状态更新失败");
      form.status = !value;
    }
  } catch (error) {
    console.error("状态更新失败:", error);
    ElMessage.error("状态更新失败");
    form.status = !value;
  }
};

const handleDelete = async () => {
  if (!selectedId.value || isNew.value) return;

  try {
    await ElMessageBox.confirm(
      isCategoryNode.value ? "确认删除该目录？删除后不可恢复。" : "确认删除该模板？删除后不可恢复。",
      "提示",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
    );

    const res: any = await deleteMedicalRecordTemplateApi(selectedId.value);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      selectedId.value = "";
      isNew.value = false;
      isCategoryNode.value = false;
      isEditing.value = false;
      isDirty.value = false;
      Object.assign(form, getMedicalRecordTemplateEntityDefault());
      metaInfo.updatedTime = "";
      metaInfo.updatedBy = "";
      await loadTreeData();
    } else {
      ElMessage.error(res.errMsg || res.message || "删除失败");
    }
  } catch (error) {
    if ((error as any) !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 监听表单变化，标记脏值
watch(
  () => ({ ...form }),
  () => {
    if (hasSelected.value && !isCategoryNode.value && !isLoading.value) {
      isDirty.value = true;
    }
  },
  { deep: true }
);

onMounted(() => {
  loadTreeData();
});
</script>

<template>
  <div
    class="w-full h-[calc(100vh-131px)] flex gap-[6px] p-[6px] bg-[var(--el-bg-color-page)]"
  >
    <!-- 左侧：400px，树形列表 -->
    <div
      class="w-[400px] shrink-0 h-full bg-bg_color flex flex-col overflow-hidden"
    >
      <!-- 搜索栏 -->
      <div
        class="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-[var(--el-border-color-light)]"
      >
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称"
          clearable
          size="small"
          class="flex-1"
          :disabled="isNew || isEditing"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 树形列表 -->
      <div v-loading="listLoading" class="flex-1 overflow-y-auto py-1" :class="{ 'pointer-events-none opacity-60': isNew || isEditing }">
        <el-empty
          v-if="filteredTreeData.length === 0"
          description="暂无数据"
          :image-size="50"
          class="mt-10"
        />
        <el-tree
          v-else
          :data="filteredTreeData"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          :current-node-key="selectedId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span
              :class="[
                'text-[13px] select-none truncate w-full',
                data.hasCategory
                  ? 'font-medium text-[var(--el-text-color-primary)]'
                  : 'text-[var(--el-text-color-regular)]'
              ]"
              :title="node.label"
            >
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 h-full bg-bg_color flex flex-col overflow-hidden">
      <!-- 操作栏 -->
      <div
        class="h-[44px] shrink-0 flex items-center justify-between px-4 border-b border-[var(--el-border-color-light)]"
      >
        <el-button type="primary" size="small" @click="handleAdd">+ 新增</el-button>
        <div class="flex items-center gap-2">
          <!-- 修改模式/新增模式：显示保存和取消 -->
          <template v-if="isEditing || isNew">
            <el-button type="primary" size="small" :loading="formLoading" @click="handleSave">
              保存
            </el-button>
            <el-button size="small" @click="handleCancel">
              取消
            </el-button>
          </template>
          <!-- 默认模式：显示修改和删除 -->
          <template v-else>
            <el-button type="primary" size="small" :disabled="!canEdit" @click="handleEdit">
              修改
            </el-button>
            <el-button type="danger" size="small" :disabled="!canDelete" @click="handleDelete">
              删除
            </el-button>
          </template>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto">
        <el-form
          v-if="hasSelected"
          :model="form"
          label-width="90px"
          size="small"
          class="px-4 pt-3 pb-4"
        >
          <!-- 目录节点提示 -->
          <el-alert
            v-if="isCategoryNode"
            title="当前为目录节点（只读）"
            type="info"
            :closable="false"
            show-icon
            class="mb-3"
          />

          <!-- 模板名称 + 模板类别 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="模板名称">
                <el-input v-model="form.name" placeholder="请输入模板名称" :disabled="formDisabled" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模板类别">
                <el-select v-model="form.type" style="width: 100%" :disabled="formDisabled">
                  <el-option label="个人" :value="1" />
                  <el-option label="诊所" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 病历各段 -->
          <el-form-item label="主诉">
            <el-input v-model="form.complaint" type="textarea" :rows="2" placeholder="请输入主诉" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="现病史">
            <el-input v-model="form.historyOfPresentIllness" type="textarea" :rows="4" placeholder="请输入现病史" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="既往史">
            <el-input v-model="form.pastHistory" type="textarea" :rows="3" placeholder="请输入既往史" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="个人史">
            <el-input v-model="form.personalHistory" type="textarea" :rows="2" placeholder="请输入个人史" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="婚育史">
            <el-input v-model="form.obstericalHistory" type="textarea" :rows="2" placeholder="请输入婚育史" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="家族史">
            <el-input v-model="form.familyHistory" type="textarea" :rows="2" placeholder="请输入家族史" :disabled="formDisabled" />
          </el-form-item>

          <!-- 体格检查 -->
          <el-form-item label="体格检查">
            <div class="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span class="vital-label">体温/T</span>
              <el-input v-model.number="form.bodyTemperature" class="vital-input" type="number" step="0.1" :disabled="formDisabled" />
              <span class="vital-unit">℃</span>
              <span class="vital-label">心率/P</span>
              <el-input v-model.number="form.heartRate" class="vital-input" type="number" :disabled="formDisabled" />
              <span class="vital-unit">次/分</span>
              <span class="vital-label">呼吸/R</span>
              <el-input v-model.number="form.breathRate" class="vital-input" type="number" :disabled="formDisabled" />
              <span class="vital-unit">次/分</span>
              <span class="vital-label">血压</span>
              <el-input v-model.number="form.bloodPressureHight" class="vital-input-bp" type="number" :disabled="formDisabled" />
              <span class="vital-unit">/</span>
              <el-input v-model.number="form.bloodPressureLow" class="vital-input-bp" type="number" :disabled="formDisabled" />
              <span class="vital-unit">mmHg</span>
            </div>
          </el-form-item>

          <el-form-item label="其他辅助检查">
            <el-input v-model="form.otherExamine" type="textarea" :rows="2" placeholder="请输入其他辅助检查" :disabled="formDisabled" />
          </el-form-item>
          <el-form-item label="治疗建议">
            <el-input v-model="form.treatmentRecommendation" type="textarea" :rows="2" placeholder="请输入治疗建议" :disabled="formDisabled" />
          </el-form-item>

          <!-- 底部状态栏 -->
          <div
            class="flex items-center justify-end gap-6 mt-3 text-[12px] text-[var(--el-text-color-secondary)]"
          >
            <div class="flex items-center gap-2">
              <span>状态：</span>
              <el-switch
                v-model="form.status"
                active-text="启用"
                inactive-text="停用"
                :disabled="isNew"
                @change="handleStatusChange"
              />
            </div>
            <span
              >操作时间：{{
                metaInfo.updatedTime
                  ? new Date(metaInfo.updatedTime).toLocaleString("zh-CN")
                  : "-"
              }}</span
            >
            <span>操作人：{{ metaInfo.updatedBy || "-" }}</span>
          </div>
        </el-form>

        <el-empty
          v-else
          description="请从左侧选择模板或点击新增"
          class="mt-20"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vital-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.vital-unit {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}

.vital-input {
  width: 70px;
}

.vital-input-bp {
  width: 60px;
}

:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
