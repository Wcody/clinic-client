<script setup lang="ts">
import { ref, computed } from "vue";
import { Document } from "@element-plus/icons-vue";
import {
  getPrescriptionTemplateListApi,
  getPrescriptionTemplateDetailByTemplateIdApi,
  type BQPrescriptionTemplateEntityType,
  type BQPrescriptionTemplateDetailEntityType
} from "@/api/cm/prescriptionTemplate";
import {
  getMedicalDictionaryListApi,
  type BQMedicalDictionaryEntityType
} from "@/api/cm/medicalDictionary";
import { BQSearchFilter } from "@/api/api";
import { ElMessage } from "element-plus";

const props = defineProps<{
  prescriptionType?: number;
}>();

const emit = defineEmits<{
  confirm: [details: BQPrescriptionTemplateDetailEntityType[], templateInfo: BQPrescriptionTemplateEntityType];
}>();

const visible = ref(false);
const loading = ref(false);
const searchName = ref("");
const selectedIndex = ref(0);
const list = ref<BQPrescriptionTemplateEntityType[]>([]);
const drugList = ref<BQPrescriptionTemplateDetailEntityType[]>([]);
const currentTemplate = ref<BQPrescriptionTemplateEntityType | null>(null);
const usageOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const frequencyOptions = ref<BQMedicalDictionaryEntityType[]>([]);

const filteredList = computed(() => {
  let result = list.value;
  const kw = searchName.value.trim().toLowerCase();
  if (!kw) return result;
  return result.filter(t => (t.name || "").toLowerCase().includes(kw));
});

const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(escaped, "gi"),
    match => `<span class="keyword-highlight">${match}</span>`
  );
};

const handleSelectTemplate = async (idx: number) => {
  selectedIndex.value = idx;
  const tpl = filteredList.value[idx];
  if (!tpl?.id) return;
  currentTemplate.value = tpl;
  try {
    const res = await getPrescriptionTemplateDetailByTemplateIdApi(String(tpl.id));
    drugList.value = (res?.data as BQPrescriptionTemplateDetailEntityType[]) || [];
  } catch {
    drugList.value = [];
  }
};

const loadUsageDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "1")]
    });
    if (res?.data) {
      usageOptions.value = (res.data as BQMedicalDictionaryEntityType[]).filter(
        (item: any) => item.status !== false
      );
    }
  } catch {}
};

const loadFrequencyDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "2")]
    });
    if (res?.data) {
      frequencyOptions.value = (res.data as BQMedicalDictionaryEntityType[]).filter(
        (item: any) => item.status !== false
      );
    }
  } catch {}
};

const getUsageName = (id?: number) => {
  if (id == null) return '';
  const item = usageOptions.value.find(o => o.id === id);
  return item?.name ?? String(id);
};

const getFrequencyName = (id?: number) => {
  if (id == null) return '';
  const item = frequencyOptions.value.find(o => o.id === id);
  return item?.name ?? String(id);
};

const load = async () => {
  loading.value = true;
  try {
    const res = await getPrescriptionTemplateListApi({});
    if (res?.data) {
      list.value = (res.data as BQPrescriptionTemplateEntityType[]).filter(
        t => !t.hasCategory && t.prescriptionType === props.prescriptionType
      );
    }
  } catch {
    ElMessage.error("加载处方模板失败");
  } finally {
    loading.value = false;
  }
};

const handleConfirm = () => {
  const tpl = filteredList.value[selectedIndex.value];
  console.log("handleConfirm called, tpl:", tpl, "drugList:", drugList.value);
  if (!tpl) return;
  emit("confirm", drugList.value, tpl);
  visible.value = false;
  ElMessage.success("已调用处方模板");
};

const open = () => {
  list.value = [];
  drugList.value = [];
  currentTemplate.value = null;
  searchName.value = "";
  selectedIndex.value = 0;
  visible.value = true;
  load();
  loadUsageDictionary();
  loadFrequencyDictionary();
};

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="调用处方模板"
    align-center
    class="prescription-template-dialog"
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
          @click="handleSelectTemplate(idx)"
        >
          <el-icon class="item-icon"><Document /></el-icon>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="highlightKeyword(tpl.name || '', searchName)" />
        </div>
      </div>
      <div class="tpl-detail">
        <div class="detail-header">
          <span class="detail-label">处方模板信息：</span>
          <div v-if="!currentTemplate" class="empty-text">请选择模板</div>
          <table v-else class="info-table">
            <tbody>
              <tr>
                <th>模板名称</th>
                <td>{{ currentTemplate.name || '' }}</td>
                <th>处方类型</th>
                <td>{{ currentTemplate.prescriptionType === 1 ? '西/成药' : currentTemplate.prescriptionType === 2 ? '中药' : currentTemplate.prescriptionType === 3 ? '检查检验' : currentTemplate.prescriptionType === 4 ? '处置项目' : '' }}</td>
              </tr>
              <tr>
                <th>用法</th>
                <td>{{ getUsageName(currentTemplate.usageType) }}</td>
                <th>频率</th>
                <td>{{ getFrequencyName(currentTemplate.frequence) }}</td>
              </tr>
              <tr>
                <th>剂数</th>
                <td>{{ currentTemplate.doseAmount || '' }}</td>
                <th>建议/医嘱</th>
                <td>{{ currentTemplate.recommendation || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="detail-drugs">
          <span class="detail-label">处方用药：</span>
          <div v-if="!drugList.length" class="empty-text">请选择模板</div>
          <table v-else class="drug-table">
            <thead>
              <tr>
                <th>组号</th>
                <th>药品名称</th>
                <th>规格</th>
                <th>单次用量</th>
                <th>天数</th>
                <th>单价（元）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(drug, di) in drugList" :key="di">
                <td>{{ drug.groupNo }}</td>
                <td>{{ drug.drugName }}</td>
                <td>{{ drug.specification }}</td>
                <td>{{ drug.singleUsageAmount }}</td>
                <td>{{ drug.days }}</td>
                <td>{{ drug.price ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
.prescription-template-dialog {
  :deep(.el-dialog) {
    width: auto;
    max-width: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-container {
  height: 60vh;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  flex-shrink: 0;

  .detail-label {
    font-size: 13px;
    color: #606266;
    display: block;
    margin-bottom: 8px;
  }
}

.detail-drugs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .detail-label {
    font-size: 13px;
    color: #606266;
    display: block;
    margin-bottom: 8px;
    flex-shrink: 0;
  }
}

.drug-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  flex: 1;
  min-height: 0;

  th,
  td {
    border: 1px solid #ebeef5;
    padding: 6px 10px;
    text-align: left;
  }

  th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
    width: 100px;
  }

  td {
    color: #303133;
  }
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    border: 1px solid #ebeef5;
    padding: 6px 10px;
    text-align: left;
  }

  th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
    width: 100px;
  }

  td {
    color: #303133;
    width: auto;
  }
}

.empty-text {
  color: #909399;
  font-size: 13px;
}
</style>
