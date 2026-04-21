<!--
  - 病历信息表单组件
  - 父组件传入 reactive 对象引用，子组件直接操作其属性
  -->
<script setup lang="ts">

defineOptions({ name: "MedicalRecordForm" });

const props = defineProps<{
  form: {
    chiefComplaint: string;
    presentIllness: string;
    pastHistory: string;
    allergyHistory: number;
    allergyDetail: string;
    personalHistory: string;
    marriageHistory: string;
    familyHistory: string;
    travelHistory: string;
    contactHistory: string;
    temperature: string;
    heartRate: string;
    respiration: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    otherExamination: string;
    treatmentAdvice: string;
  };
}>();

const emit = defineEmits<{
  "view-history": [];
  "call-template": [];
}>();

</script>

<template>
  <el-form label-width="100px" class="medical-record-form">
    <el-form-item label="主诉" class="form-row">
      <el-input v-model="props.form.chiefComplaint" class="form-input-full" />
      <el-button type="primary" @click="emit('view-history')">历史病历</el-button>
      <el-button type="primary" @click="emit('call-template')">调用病历模板</el-button>
    </el-form-item>

    <el-form-item label="现病史" class="form-row">
      <el-input v-model="props.form.presentIllness" class="form-input-full" />
    </el-form-item>

    <el-form-item label="既往史" class="form-row">
      <el-input v-model="props.form.pastHistory" class="form-input-full" />
    </el-form-item>

    <el-form-item label="过敏史" class="form-row">
      <el-radio-group v-model="props.form.allergyHistory" class="inline-radio">
        <el-radio :value="1">是</el-radio>
        <el-radio :value="0">否认</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="props.form.allergyHistory === 1" class="form-row">
      <el-input
        v-model="props.form.allergyDetail"
        type="textarea"
        :rows="2"
        placeholder="请输入过敏详情"
        class="form-input-full"
      />
    </el-form-item>

    <el-form-item v-show="false" label="个人史" class="form-row">
      <el-input v-model="props.form.personalHistory" class="form-input-full" />
    </el-form-item>

    <el-form-item v-show="false" label="婚育史" class="form-row">
      <el-input v-model="props.form.marriageHistory" class="form-input-full" />
    </el-form-item>

    <el-form-item v-show="false" label="家族史" class="form-row">
      <el-input v-model="props.form.familyHistory" class="form-input-full" />
    </el-form-item>

    <el-form-item v-show="false" label="旅行史" class="form-row label-red">
      <el-input
        v-model="props.form.travelHistory"
        type="textarea"
        :rows="2"
        class="form-textarea"
      />
    </el-form-item>

    <el-form-item label="接触史" class="form-row label-red">
      <el-input
        v-model="props.form.contactHistory"
        type="textarea"
        :rows="2"
        class="form-textarea"
      />
    </el-form-item>

    <el-form-item label="体格检查" class="form-row">
      <span class="exam-label">体温/T</span>
      <el-input v-model="props.form.temperature" type="number" class="exam-input" />
      <span class="exam-unit">°C</span>
      <span class="exam-label">心率/P</span>
      <el-input v-model="props.form.heartRate" type="number" class="exam-input" />
      <span class="exam-unit">次/分</span>
      <span class="exam-label">呼吸/R</span>
      <el-input v-model="props.form.respiration" type="number" class="exam-input" />
      <span class="exam-unit">次/分</span>
      <span class="exam-label">血压</span>
      <el-input
        v-model="props.form.bloodPressureSystolic"
        type="number"
        class="exam-input-small"
      />
      <span class="exam-divider">/</span>
      <el-input
        v-model="props.form.bloodPressureDiastolic"
        type="number"
        class="exam-input-small"
      />
      <span class="exam-unit">mmHg</span>
    </el-form-item>

    <el-form-item label="其他检查" class="form-row">
      <el-input v-model="props.form.otherExamination" class="form-input-full" />
    </el-form-item>

    <el-form-item label="治疗建议" class="form-row">
      <el-input v-model="props.form.treatmentAdvice" class="form-input-full" />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.medical-record-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .form-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .inline-radio {
      display: flex;
      gap: 20px;
    }

    .form-input-full {
      flex: 1;
      min-width: 300px;
    }

    .form-textarea {
      width: 100%;
    }

    .exam-label {
      color: #606266;
      font-size: 14px;
      white-space: nowrap;
    }

    .exam-input {
      width: 80px;
    }

    .exam-input-small {
      width: 60px;
    }

    .exam-unit {
      color: #909399;
      font-size: 13px;
      white-space: nowrap;
    }

    .exam-divider {
      color: #606266;
      font-size: 16px;
      padding: 0 4px;
    }

    .diagnosis-table {
      width: 100%;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;

      .table-header {
        display: flex;
        background-color: #f5f7fa;
        padding: 12px;
        font-weight: 600;
        color: #606266;

        .col-disease {
          flex: 1;
        }

        .col-action {
          width: 100px;
          text-align: center;
        }
      }

      .table-body {
        min-height: 60px;
        padding: 8px 12px;

        .empty-text {
          color: #909399;
          font-size: 14px;
          text-align: center;
          padding: 12px 0;
        }

        .diagnosis-row {
          display: flex;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .col-disease {
            flex: 1;
            font-size: 14px;

            .diag-code {
              margin-left: 8px;
              color: #909399;
              font-size: 12px;
            }
          }

          .col-action {
            width: 100px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
