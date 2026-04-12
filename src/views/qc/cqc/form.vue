<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const departmentKindNames = ["所属", "住院", "就诊"];

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-row>
      <re-col v-if="newFormInline.initKind" :value="12" :xs="24" :sm="24">
        <el-form-item label="病案类别" prop="recordKind">
          <el-radio-group v-model="newFormInline.recordKind">
            <el-radio :value="1">临床病案</el-radio>
            <el-radio :value="2">门急诊病案</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item :label="`${formInline.caption}编码`" prop="recordCode">
          <el-input
            v-model="newFormInline.recordCode"
            clearable
            :placeholder="`请输入${formInline.caption}编码`"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item
          :label="`${formInline.initKind ? '患者' : formInline.caption}名称`"
          prop="patientName"
        >
          <el-input
            v-model="newFormInline.patientName"
            clearable
            :placeholder="`请输入${formInline.initKind ? '患者' : formInline.caption}名称`"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.initKind" :value="12" :xs="24" :sm="24">
        <el-form-item label="患者编码" prop="patientCode">
          <el-input
            v-model="newFormInline.patientCode"
            clearable
            placeholder="请输入患者编码"
          />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row v-if="newFormInline.initKind">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="患者性别" prop="gender">
          <el-radio-group v-model="newFormInline.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="身份证号" prop="idCard">
          <el-input
            v-model="newFormInline.idCard"
            clearable
            placeholder="请输入身份证号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="出生日期" prop="dateOfBirth">
          <el-date-picker
            v-model="newFormInline.dateOfBirth"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            placeholder="请输入出生日期"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="国籍" prop="nationality">
          <el-input
            v-model="newFormInline.nationality"
            clearable
            placeholder="请输入国籍"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="民族" prop="ethnicity">
          <el-input
            v-model="newFormInline.ethnicity"
            clearable
            placeholder="请输入民族"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="现住址" prop="phoneNumber">
          <el-input
            v-model="newFormInline.phoneNumber"
            clearable
            placeholder="请输入现住址"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="联系电话" prop="phoneNumber">
          <el-input
            v-model="newFormInline.phoneNumber"
            clearable
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="婚姻状况" prop="maritalStatus">
          <el-input
            v-model="newFormInline.phoneNumber"
            clearable
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="是否药物过敏" prop="hasAllergy">
          <el-switch
            v-model="newFormInline.hasAllergy"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="药物过敏内容" prop="allergicDrug">
          <el-input
            v-model="newFormInline.allergicDrug"
            clearable
            placeholder="请输入药敏过敏内容"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="newFormInline.contactPerson"
            clearable
            placeholder="请输入联系人"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="联系人关系" prop="contactRelation">
          <el-input
            v-model="newFormInline.contactRelation"
            clearable
            placeholder="请输入联系人关系"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="联系人电话" prop="contactPhoneNumber">
          <el-input
            v-model="newFormInline.contactPhoneNumber"
            clearable
            placeholder="请输入联系人电话"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item
          :label="`${departmentKindNames[newFormInline.recordKind]}次数`"
          prop="admissionCount"
        >
          <el-input-number
            v-model="newFormInline.admissionCount"
            :min="0"
            :max="9999"
            :placeholder="`请输入${departmentKindNames[newFormInline.recordKind]}次数`"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item
          :label="`${departmentKindNames[newFormInline.recordKind]}日期`"
          prop="admissionDate"
        >
          <el-date-picker
            v-model="newFormInline.admissionDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            :placeholder="`请输入${departmentKindNames[newFormInline.recordKind]}日期`"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item
          :label="`${departmentKindNames[newFormInline.recordKind]}科室`"
          prop="department"
        >
          <el-input
            v-model="newFormInline.department"
            clearable
            :placeholder="`请输入${departmentKindNames[newFormInline.recordKind]}科室`"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="出院日期" prop="dischargeDate">
          <el-date-picker
            v-model="newFormInline.dischargeDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            placeholder="请输入出院日期"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="出院科室" prop="dischargeDepartment">
          <el-input
            v-model="newFormInline.dischargeDepartment"
            clearable
            placeholder="请输入出院科室"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="主管医生" prop="attendingDoctor">
          <el-input
            v-model="newFormInline.attendingDoctor"
            clearable
            placeholder="请输入主管医生"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="主要诊断编码" prop="mainDiagnosisCode">
          <el-input
            v-model="newFormInline.mainDiagnosisCode"
            clearable
            placeholder="请输入主要诊断编码"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="主要诊断名称" prop="mainDiagnosisName">
          <el-input
            v-model="newFormInline.mainDiagnosisName"
            clearable
            placeholder="请输入主要诊断名称"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="主要手术编码" prop="mainSurgeryCode">
          <el-input
            v-model="newFormInline.mainSurgeryCode"
            clearable
            placeholder="请输入主要手术编码"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="主要手术名称" prop="mainSurgeryName">
          <el-input
            v-model="newFormInline.mainSurgeryName"
            clearable
            placeholder="请输入手术诊断名称"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="是否死亡" prop="hasDeceased">
          <el-switch
            v-model="newFormInline.hasDeceased"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="上架号" prop="shelfNumber">
          <el-input
            v-model="newFormInline.shelfNumber"
            clearable
            placeholder="请输入上架号"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="病区编码" prop="wardCode">
          <el-input
            v-model="newFormInline.wardCode"
            clearable
            placeholder="请输入病区编码"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="newFormInline.recordKind === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="病区名称" prop="wardName">
          <el-input
            v-model="newFormInline.wardName"
            clearable
            placeholder="请输入病区名称"
          />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row>
      <re-col v-if="newFormInline.initKind === 0" :value="24" :xs="24" :sm="24">
        <el-form-item
          :label="`${departmentKindNames[newFormInline.recordKind]}科室`"
          prop="department"
        >
          <el-input
            v-model="newFormInline.department"
            clearable
            :placeholder="`请输入${departmentKindNames[newFormInline.recordKind]}科室`"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
.el-row .el-col {
  padding-right: 30px;
}

.el-row {
  padding-left: 24px;
}
</style>
