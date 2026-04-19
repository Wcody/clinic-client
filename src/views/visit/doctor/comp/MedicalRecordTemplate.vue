<script setup lang="ts">
import { ref, computed } from "vue";
import { Document } from "@element-plus/icons-vue";
import {
  getMedicalRecordTemplateListApi,
  getMedicalRecordTemplateApi,
  type BQMedicalRecordTemplateEntityType
} from "@/api/cm/medicalRecordTemplate";
import { ElMessage } from "element-plus";

const emit = defineEmits<{
  confirm: [detail: BQMedicalRecordTemplateEntityType];
}>();

const visible = ref(false);
const loading = ref(false);
const searchName = ref("");
const selectedIndex = ref(0);
const list = ref<BQMedicalRecordTemplateEntityType[]>([]);

const filteredList = computed(() => {
  const kw = searchName.value.trim().toLowerCase();
  if (!kw) return list.value;
  return list.value.filter(t => (t.name || "").toLowerCase().includes(kw));
});

const tplFields: { key: keyof BQMedicalRecordTemplateEntityType; label: string }[] = [
  { key: "complaint", label: "主诉" },
  { key: "historyOfPresentIllness", label: "现病史" },
  { key: "pastHistory", label: "既往史" },
  { key: "personalHistory", label: "个人史" },
  { key: "familyHistory", label: "家族史" },
  { key: "obstericalHistory", label: "婚育史" },
  { key: "bodyTemperature", label: "体温(℃)" },
  { key: "heartRate", label: "心率(次/分)" },
  { key: "breathRate", label: "呼吸(次/分)" },
  { key: "bloodPressureHight", label: "血压" },
  { key: "otherExamine", label: "其他检查" },
  { key: "treatmentRecommendation", label: "治疗建议" }
];

const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(escaped, "gi"),
    match => `<span class="keyword-highlight">${match}</span>`
  );
};

const load = async () => {
  loading.value = true;
  try {
    const res = await getMedicalRecordTemplateListApi({
      filters2: [{ field: "hasCategory", operator: "eq", value: "false" }]
    });
    if (res?.data) {
      list.value = (res.data as BQMedicalRecordTemplateEntityType[]).filter(
        t => !t.hasCategory
      );
    }
  } catch {
    ElMessage.error("加载病历模板失败");
  } finally {
    loading.value = false;
  }
};

const handleConfirm = async () => {
  const tpl = filteredList.value[selectedIndex.value];
  if (!tpl) return;
  try {
    const res = await getMedicalRecordTemplateApi(String(tpl.id));
    const detail = res?.data;
    if (detail) {
      emit("confirm", detail);
      visible.value = false;
      ElMessage.success("已调用病历模板");
    }
  } catch {
    ElMessage.error("获取病历模板详情失败");
  }
};

const open = () => {
  list.value = [];
  searchName.value = "";
  selectedIndex.value = 0;
  visible.value = true;
  load();
};

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="调用病历模板"
    align-center
    class="medical-record-template-dialog"
  >
    <div class="dialog-container">
    <div class="search-bar">
      <span class="search-label">模板名称</span>
      <el-input
        v-model="searchName"
        style="width: 220px"
        placeholder="输入名称过滤"
        clearable
      />
    </div>
    <div class="dialog-body">
      <div class="tpl-list">
        <div v-if="loading" style="padding: 20px; text-align: center">加载中...</div>
        <div
          v-else-if="filteredList.length === 0"
          class="empty-text"
          style="padding: 20px"
        >
          暂无模板
        </div>
        <div
          v-for="(tpl, idx) in filteredList"
          :key="tpl.id"
          class="list-item"
          :class="{ active: selectedIndex === idx }"
          @click="selectedIndex = idx"
        >
          <el-icon class="item-icon"><Document /></el-icon>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="highlightKeyword(tpl.name || '', searchName)" />
        </div>
      </div>
      <div class="tpl-detail">
        <template v-if="filteredList[selectedIndex]">
          <div class="detail-row">
            <span class="detail-label">模板名称</span>
            <span class="detail-value">{{ filteredList[selectedIndex].name }}</span>
          </div>
          <template v-for="field in tplFields" :key="field.key">
            <div
              v-if="filteredList[selectedIndex][field.key]"
              class="detail-row"
            >
              <span class="detail-label">{{ field.label }}</span>
              <span class="detail-value">
                {{
                  field.key === "bloodPressureHight"
                    ? `${filteredList[selectedIndex].bloodPressureHight} / ${filteredList[selectedIndex].bloodPressureLow ?? "--"} mmHg`
                    : filteredList[selectedIndex][field.key]
                }}
              </span>
            </div>
          </template>
        </template>
      </div>
    </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.medical-record-template-dialog {
  :deep(.el-dialog) {
    width: auto;
    max-width: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;

  .search-label {
    font-size: 13px;
    color: #606266;
  }
}

.dialog-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.tpl-list {
  width: 220px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  background: #fafafa;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;

  &:hover {
    background: #ecf5ff;
  }

  &.active {
    background: #ecf5ff;
    color: #409eff;
  }

  .item-icon {
    flex-shrink: 0;
    color: #909399;
  }

  :deep(.keyword-highlight) {
    color: #f56c6c;
    font-weight: bold;
  }
}

.tpl-detail {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;

  .detail-label {
    width: 100px;
    flex-shrink: 0;
    color: #909399;
  }

  .detail-value {
    flex: 1;
    color: #303133;
    word-break: break-all;
  }
}

.empty-text {
  color: #909399;
  font-size: 13px;
}
</style>
