<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import BqPatientBasicInfo from "@/components/BqPatientBasicInfo/src/BqPatientBasicInfo.vue";
import { getPatientByIdApi, updatePatientApi } from "@/api/cm/patient";
import {
  getMedicalRecordListApi,
  getMedicalRecordByIdApi,
  type BQMedicalRecordEntityType
} from "@/api/visit/medicalRecord";
import type { BQVisitRecordEntityType } from "@/api/visit/record";

defineOptions({
  name: "PatientDetail"
});

const props = defineProps<{
  patient: BQVisitRecordEntityType;
}>();

const emit = defineEmits<{
  back: [];
}>();

const activeTab = ref("basic");
const basicInfoRef = ref<InstanceType<typeof BqPatientBasicInfo>>();

// ==================== 基本信息 ====================
const patientId = ref<number>(0);

const loadPatient = async (id: number) => {
  if (!id) return;
  patientId.value = id;
  try {
    const res = await getPatientByIdApi(id);
    if (res.code === 0 && res.data) {
      // 使用 BqPatientBasicInfo 组件的 selectPatient 方法填充数据
      basicInfoRef.value?.selectPatient(res.data);
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "加载患者信息失败");
  }
};

watch(
  () => props.patient,
  patient => {
    if (!patient?.patientId) return;
    loadPatient(patient.patientId);
  },
  { immediate: true }
);

const handleBasicSave = async (val: any) => {
  try {
    const res = await updatePatientApi(val);
    if (res.code === 0) {
      ElMessage.success("修改成功");
    } else {
      ElMessage.error(res.errMsg || "修改失败");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "修改失败");
  }
};

// ==================== 就诊信息 ====================
const visitDateRange = ref(["", ""]);
const visitList = ref<BQMedicalRecordEntityType[]>([]);
const visitLoading = ref(false);

const loadVisitList = async () => {
  if (!patientId.value) return;
  visitLoading.value = true;
  try {
    const [startTime, endTime] = visitDateRange.value;
    const res = await getMedicalRecordListApi(
      patientId.value,
      startTime || undefined,
      endTime || undefined
    );
    if (res.code === 0 && res.data) {
      visitList.value = res.data as BQMedicalRecordEntityType[];
    } else {
      ElMessage.error(res.errMsg || "查询就诊记录失败");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "查询就诊记录失败");
  } finally {
    visitLoading.value = false;
  }
};

watch(activeTab, tab => {
  if (tab === "visit" && patientId.value) {
    loadVisitList();
  }
});

const handleVisitQuery = () => {
  loadVisitList();
};

// ==================== 就诊详情弹窗 ====================
const visitDetailVisible = ref(false);
const visitDetailLoading = ref(false);
const currentVisitDetail = ref<BQMedicalRecordEntityType | null>(null);

const handleViewVisitDetail = async (row: BQMedicalRecordEntityType) => {
  if (!row.id) return;
  visitDetailVisible.value = true;
  visitDetailLoading.value = true;
  currentVisitDetail.value = null;
  try {
    const res = await getMedicalRecordByIdApi(row.id);
    if (res.code === 0 && res.data) {
      currentVisitDetail.value = res.data;
    } else {
      ElMessage.error(res.errMsg || "获取就诊详情失败");
      visitDetailVisible.value = false;
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "获取就诊详情失败");
    visitDetailVisible.value = false;
  } finally {
    visitDetailLoading.value = false;
  }
};

// ==================== 附件管理 ====================
const handleUpload = () => {
  ElMessage.info("上传附件");
};

const handleBack = () => {
  emit("back");
};
</script>

<template>
  <div class="patient-detail">
    <!-- 头部 -->
    <div class="detail-header">
      <span class="detail-title">患者详情</span>
      <el-button type="primary" @click="handleBack">返回</el-button>
    </div>

    <!-- 内容页签 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="basic-content">
          <BqPatientBasicInfo
            ref="basicInfoRef"
            :show-allergy="true"
            @save="handleBasicSave"
          />
        </div>
      </el-tab-pane>

      <!-- 就诊信息 -->
      <el-tab-pane label="就诊信息" name="visit">
        <div class="visit-content">
          <!-- 查询条件 -->
          <div class="visit-query">
            <span class="query-label">就诊日期：</span>
            <el-date-picker
              v-model="visitDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              class="date-range-picker"
            />
            <el-button
              type="primary"
              :icon="Search"
              :loading="visitLoading"
              @click="handleVisitQuery"
            >
              查询
            </el-button>
          </div>

          <!-- 就诊记录表格 -->
          <el-table
            :data="visitList"
            v-loading="visitLoading"
            border
            stripe
            class="visit-table"
          >
            <el-table-column
              label="就诊时间"
              prop="seeTime"
              min-width="160"
            />
            <el-table-column
              label="诊断名称"
              prop="diagnosis"
              min-width="200"
            />
            <el-table-column
              label="主诉"
              prop="chiefComplaint"
              min-width="150"
            />
            <el-table-column label="操作" fixed="right" width="100">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="handleViewVisitDetail(row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 附件管理 -->
      <el-tab-pane label="附件管理" name="attachment">
        <div class="attachment-content">
          <el-button type="primary" @click="handleUpload">上传附件</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 就诊详情弹窗 -->
    <el-dialog
      v-model="visitDetailVisible"
      title="就诊详情"
      width="700px"
      :append-to-body="true"
      align-center
      class="visit-detail-dialog"
    >
      <div v-loading="visitDetailLoading">
        <div v-if="currentVisitDetail" class="vd-content">
          <!-- 基本信息 -->
          <div class="vd-meta-row">
            <span class="vd-meta-item"
              >就诊时间：{{ currentVisitDetail.seeTime }}</span
            >
          </div>

          <!-- 病历字段 -->
          <div class="vd-field">
            <span class="vd-label">主诉：</span>
            <span class="vd-value">{{ currentVisitDetail.chiefComplaint }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">现病史：</span>
            <span class="vd-value">{{ currentVisitDetail.presentIllness }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">既往史：</span>
            <span class="vd-value">{{ currentVisitDetail.pastHistory }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">体格检查：</span>
            <span class="vd-value">{{ currentVisitDetail.physicalExam }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">诊断：</span>
            <span class="vd-value diagnosis-red">{{
              currentVisitDetail.diagnosis
            }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">医嘱：</span>
            <span class="vd-value">{{ currentVisitDetail.advice }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="visitDetailVisible = false"
          >确定</el-button
        >
        <el-button @click="visitDetailVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.patient-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;

    .detail-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .detail-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      flex-shrink: 0;
      margin-bottom: 0;
      padding-left: 20px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}

// ========== 基本信息 ==========
.basic-content {
  padding: 16px 20px;
}

// ========== 就诊信息 ==========
.visit-content {
  padding: 16px 20px;

  .visit-query {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .query-label {
      font-size: 13px;
      color: #606266;
      white-space: nowrap;
    }

    .date-range-picker {
      width: 340px;
    }
  }

  .visit-table {
    width: 100%;
  }
}

// ========== 附件管理 ==========
.attachment-content {
  padding: 16px 20px;
}
</style>

<style lang="scss">
.visit-detail-dialog {
  .el-dialog__body {
    padding: 16px 20px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .vd-content {
    font-size: 13px;
    color: #303133;
    line-height: 1.8;

    .vd-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      margin-bottom: 6px;
      color: #606266;
    }

    .vd-field {
      margin-bottom: 6px;
    }

    .vd-label {
      color: #606266;
    }

    .vd-value {
      color: #303133;
    }

    .diagnosis-red {
      color: #f56c6c;
    }
  }
}
</style>
