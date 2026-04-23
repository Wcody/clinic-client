<script setup lang="ts">
import { ref } from "vue";
import { Document } from "@element-plus/icons-vue";
import {
  getMedicalRecordListByPatientIdApi,
  type BqMedicalRecordEntityType
} from "@/api/visit/clinic";

const props = defineProps<{
  patientId?: number;
}>();

type HistoryPhysicalExam = {
  temperature?: string;
  heartRate?: string;
  respiration?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  other?: string;
};

type HistoryRecord = {
  visitTime: string;
  visitType: string;
  chiefComplaint: string;
  presentIllness: string;
  pastHistory: string;
  diagnosis: string;
  diagnosisIds: string;
  advice: string;
  physicalExam: HistoryPhysicalExam;
  height?: string;
  weight?: string;
};

const visible = ref(false);
const loading = ref(false);
const list = ref<HistoryRecord[]>([]);
const selectedIndex = ref(0);

const load = async () => {
  if (!props.patientId) return;
  loading.value = true;
  list.value = [];
  selectedIndex.value = 0;
  try {
    const res = await getMedicalRecordListByPatientIdApi(props.patientId, 20);
    const records: BqMedicalRecordEntityType[] = res?.data || [];
    list.value = records.map(record => {
      let physicalExam: HistoryPhysicalExam = {};
      try {
        if (record.physicalExam) physicalExam = JSON.parse(record.physicalExam);
      } catch {}
      return {
        visitTime: record.seeTime || record.createTime || "",
        visitType: record.regId ? "复诊" : "初诊",
        chiefComplaint: record.chiefComplaint || "",
        presentIllness: record.presentIllness || "",
        pastHistory: record.pastHistory || "",
        diagnosis: record.diagnosis || "",
        diagnosisIds: record.diagnosisIds || "",
        advice: record.advice || "",
        physicalExam,
        height: record.height != null ? String(record.height) : "",
        weight: record.weight != null ? String(record.weight) : ""
      };
    });
  } finally {
    loading.value = false;
  }
};

const open = () => {
  visible.value = true;
  load();
};

const emit = defineEmits<{
  confirm: [record: HistoryRecord];
}>();

const handleConfirm = () => {
  if (list.value.length > 0 && selectedIndex.value >= 0) {
    emit("confirm", list.value[selectedIndex.value]);
    visible.value = false;
  }
};

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="历史病历"
    align-center
    class="history-medical-record-dialog"
  >
    <div v-if="loading" class="dialog-body" style="justify-content: center; align-items: center">加载中...</div>
    <div v-else class="dialog-body">
      <div class="record-list">
        <div
          v-if="list.length === 0"
          class="empty-text"
          style="padding: 20px"
        >
          暂无历史病历
        </div>
        <div
          v-for="(item, idx) in list"
          :key="idx"
          class="list-item"
          :class="{ active: selectedIndex === idx }"
          @click="selectedIndex = idx"
        >
          <el-icon class="item-icon"><Document /></el-icon>
          <span class="item-text">
            <span class="item-time">{{ item.visitTime }}</span>
            <span class="item-diag">{{ item.diagnosis }}</span>
          </span>
        </div>
      </div>
      <div v-if="list.length > 0" class="record-detail">
        <template v-if="list[selectedIndex]">
          <div class="detail-header">
            <div class="detail-row">
              <span class="detail-label">就诊时间</span>
              <span class="detail-value">{{ list[selectedIndex].visitTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">就诊类型</span>
              <span class="detail-value">{{ list[selectedIndex].visitType }}</span>
            </div>
            <div v-if="list[selectedIndex].chiefComplaint" class="detail-row">
              <span class="detail-label">主诉</span>
              <span class="detail-value">{{ list[selectedIndex].chiefComplaint }}</span>
            </div>
            <div v-if="list[selectedIndex].presentIllness" class="detail-row">
              <span class="detail-label">现病史</span>
              <span class="detail-value">{{ list[selectedIndex].presentIllness }}</span>
            </div>
            <div v-if="list[selectedIndex].pastHistory" class="detail-row">
              <span class="detail-label">既往史</span>
              <span class="detail-value">{{ list[selectedIndex].pastHistory }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">体温</span>
              <span class="detail-value">{{ list[selectedIndex].physicalExam?.temperature || '--' }} ℃</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">心率</span>
              <span class="detail-value">{{ list[selectedIndex].physicalExam?.heartRate || '--' }} 次/分</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">呼吸</span>
              <span class="detail-value">{{ list[selectedIndex].physicalExam?.respiration || '--' }} 次/分</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">血压</span>
              <span class="detail-value">
                {{ list[selectedIndex].physicalExam?.bloodPressureSystolic || '--' }} /
                {{ list[selectedIndex].physicalExam?.bloodPressureDiastolic || '--' }} mmHg
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">其他检查</span>
              <span class="detail-value">{{ list[selectedIndex].physicalExam?.other || '--' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">身高</span>
              <span class="detail-value">{{ list[selectedIndex].height || '--' }} cm</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">体重</span>
              <span class="detail-value">{{ list[selectedIndex].weight || '--' }} kg</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">诊断</span>
              <span class="detail-value diagnosis-red">{{ list[selectedIndex].diagnosis || '--' }}</span>
            </div>
            <div v-if="list[selectedIndex].diagnosisIds" class="detail-row">
              <span class="detail-label">诊断编码</span>
              <span class="detail-value">{{ list[selectedIndex].diagnosisIds }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">治疗建议</span>
              <span class="detail-value">{{ list[selectedIndex].advice || '--' }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :disabled="list.length === 0"
        @click="handleConfirm"
      >
        导入当前病历
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.history-medical-record-dialog {
  :deep(.el-dialog) {
    --el-dialog-width: 90vw;
    width: var(--el-dialog-width);
    height: 70vh;
    max-width: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    height: 70vh;
    min-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
  }
}

.dialog-body {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 70vh;
  overflow: hidden;
}

.record-list {
  width: 220px;
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

  &:hover {
    background: #ecf5ff;
  }

  &.active {
    background: #ecf5ff;
    color: #409eff;
  }

  .item-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: #909399;
  }

  .item-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;

    .item-time {
      color: #606266;
    }

    .item-diag {
      color: #909399;
      margin-top: 2px;
    }
  }
}

.record-detail {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.detail-header {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 16px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;

  .detail-label {
    width: 80px;
    flex-shrink: 0;
    color: #909399;
  }

  .detail-value {
    flex: 1;
    color: #303133;
    word-break: break-all;

    &.diagnosis-red {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}

.empty-text {
  color: #909399;
  font-size: 13px;
}
</style>
