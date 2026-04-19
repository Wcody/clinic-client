<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getPatientByIdApi,
  updatePatientApi,
  type BQPatientEntityType
} from "@/api/cm/patient";
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

// ==================== 基本信息 ====================
const patientId = ref<number>(0);

const basicForm = reactive<Partial<BQPatientEntityType>>({
  name: "",
  gender: "男",
  mobile: "",
  idCard: "",
  archiveNo: "",
  province: undefined,
  city: undefined,
  district: undefined,
  address: "",
  isAllergy: false,
  allergicHistory: ""
});

// UI-only age fields (compose to/from entity age string + firstAge/lastAge/ageType)
const ageYears = ref(0);
const ageMonths = ref(0);
const ageUnit = ref("岁");

const ageUnitOptions = [
  { label: "岁", value: "岁" },
  { label: "月", value: "月" },
  { label: "天", value: "天" }
];

const ageUnitToType = (unit: string) =>
  unit === "岁" ? 1 : unit === "月" ? 2 : 3;

const parseAge = (age: string | undefined) => {
  if (!age) return;
  const matchYear = age.match(/^(\d+)岁(\d+)?月?/);
  if (matchYear) {
    ageYears.value = parseInt(matchYear[1]);
    ageMonths.value = matchYear[2] ? parseInt(matchYear[2]) : 0;
    ageUnit.value = "岁";
    return;
  }
  const matchMonth = age.match(/^(\d+)月(\d+)?天?/);
  if (matchMonth) {
    ageYears.value = parseInt(matchMonth[1]);
    ageMonths.value = matchMonth[2] ? parseInt(matchMonth[2]) : 0;
    ageUnit.value = "月";
    return;
  }
  const matchDay = age.match(/^(\d+)天/);
  if (matchDay) {
    ageYears.value = parseInt(matchDay[1]);
    ageMonths.value = 0;
    ageUnit.value = "天";
  }
};

const composeAge = (): string => {
  if (ageUnit.value === "岁") {
    return ageMonths.value > 0
      ? `${ageYears.value}岁${ageMonths.value}月`
      : `${ageYears.value}岁`;
  }
  if (ageUnit.value === "月") {
    return ageMonths.value > 0
      ? `${ageYears.value}月${ageMonths.value}天`
      : `${ageYears.value}月`;
  }
  return `${ageYears.value}天`;
};

const loadPatient = async (id: number) => {
  if (!id) return;
  patientId.value = id;
  try {
    const res = await getPatientByIdApi(id);
    if (res.code === 0 && res.data) {
      const p = res.data as BQPatientEntityType;
      basicForm.name = p.name ?? "";
      basicForm.gender = p.gender ?? "男";
      basicForm.mobile = p.mobile ?? "";
      basicForm.idCard = p.idCard ?? "";
      basicForm.archiveNo = p.archiveNo ?? "";
      basicForm.province = p.province;
      basicForm.city = p.city;
      basicForm.district = p.district;
      basicForm.address = p.address ?? "";
      basicForm.isAllergy = p.isAllergy ?? false;
      basicForm.allergicHistory = p.allergicHistory ?? "";
      (basicForm as any).id = p.id;
      (basicForm as any).version = p.version;
      parseAge(p.age);
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

const handleModify = async () => {
  try {
    const data: Partial<BQPatientEntityType> & Record<string, any> = {
      ...basicForm,
      age: composeAge(),
      firstAge: ageYears.value,
      lastAge: ageUnit.value === "天" ? 0 : ageMonths.value,
      ageType: ageUnitToType(ageUnit.value)
    };
    const res = await updatePatientApi(data);
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
          <div class="patient-code">档案编号：{{ basicForm.archiveNo }}</div>

          <el-form label-width="90px" class="basic-form">
            <!-- 行1: 姓名 性别 年龄 -->
            <div class="form-row">
              <el-form-item label="* 姓名">
                <el-input v-model="basicForm.name" class="field-input" />
              </el-form-item>
              <el-form-item label="* 性别">
                <el-radio-group v-model="basicForm.gender">
                  <el-radio value="男">男</el-radio>
                  <el-radio value="女">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="* 年龄" class="age-item">
                <el-input
                  v-model.number="ageYears"
                  class="age-year-input"
                />
                <el-select v-model="ageUnit" class="age-unit-select">
                  <el-option
                    v-for="item in ageUnitOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-input
                  v-model.number="ageMonths"
                  class="age-month-input"
                />
                <span class="age-month-label">月</span>
              </el-form-item>
            </div>

            <!-- 行2: 手机号 身份证 档案号 -->
            <div class="form-row">
              <el-form-item label="手机号">
                <el-input v-model="basicForm.mobile" class="field-input" />
              </el-form-item>
              <el-form-item label="身份证">
                <el-input v-model="basicForm.idCard" class="field-input" />
              </el-form-item>
              <el-form-item label="档案号">
                <el-input v-model="basicForm.archiveNo" class="field-input" />
              </el-form-item>
            </div>

            <!-- 行3: 地址 -->
            <div class="form-row">
              <el-form-item label="详细地址" class="address-full-item">
                <el-input
                  v-model="basicForm.address"
                  class="address-detail-input"
                />
              </el-form-item>
            </div>

            <!-- 行4: 过敏史 -->
            <div class="form-row">
              <el-form-item label="过敏史">
                <el-radio-group v-model="basicForm.isAllergy">
                  <el-radio :value="true">是</el-radio>
                  <el-radio :value="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="basicForm.isAllergy" label="过敏药物">
                <el-input
                  v-model="basicForm.allergicHistory"
                  class="field-input"
                  placeholder="请填写过敏药物"
                />
              </el-form-item>
            </div>

            <!-- 修改按钮 -->
            <div class="form-actions">
              <el-button type="primary" @click="handleModify">修改</el-button>
            </div>
          </el-form>
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

  .patient-code {
    font-size: 13px;
    color: #1890ff;
    margin-bottom: 16px;
  }

  .basic-form {
    .form-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 4px;
      flex-wrap: wrap;

      :deep(.el-form-item) {
        margin-bottom: 12px;
        margin-right: 20px;
      }
    }

    .field-input {
      width: 180px;
    }

    .age-item {
      :deep(.el-form-item__content) {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .age-year-input {
        width: 60px;
      }

      .age-unit-select {
        width: 70px;
      }

      .age-month-input {
        width: 50px;
      }

      .age-month-label {
        font-size: 13px;
        color: #606266;
        white-space: nowrap;
      }
    }

    .address-full-item {
      :deep(.el-form-item__content) {
        display: flex;
        align-items: center;
      }

      .address-detail-input {
        width: 380px;
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e4e7ed;
    }
  }
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
