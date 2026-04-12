<script setup lang="ts">
import ZDForm from "@/views/cm/manual/zdForm.vue";
import SSForm from "@/views/cm/manual/ssForm.vue";
import ZZForm from "@/views/cm/manual/zzForm.vue";
import { h, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import {
  getDiagnosisDefault,
  getRecordEntityDefault,
  getShoushuItemDefault,
  getZhongzhengDefault
} from "@/api/cm/record";
import { CollapseModelValue } from "element-plus";
import {
  rc032Options,
  rc001Options,
  rc004Options,
  rc005Options,
  rc007Options,
  rc011Options,
  rc016Options,
  rc019Options,
  rc027Options,
  rc028Options,
  rc030Options,
  rc031Options,
  rc033Options,
  rc035Options,
  rc036Options,
  rc040Options,
  rc003Options,
  rc002Options,
  rc026Options,
  rc023Options,
  rc037Options,
  rc038Options,
  rc005Labels,
  rc013Labels,
  rc014Labels,
  rc015Labels,
  rc024Labels,
  rc027Labels,
  rc029Labels
} from "@/utils/dataconst";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { addDialog } from "@/components/ReDialog";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const activeNames = ref(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
const handleChange = (val: CollapseModelValue) => {
  console.log(val);
};
const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function openZDDialog(act, props?) {
  const row = props?.row;
  const zdFormRef = ref();
  addDialog({
    title: `${act}诊断信息`,
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () =>
      h(ZDForm, {
        ref: zdFormRef,
        initKind: newFormInline.value.initKind,
        formInline: getDiagnosisDefault(row)
      }),
    beforeSure: (done, { options, index }) => {
      const formRef = zdFormRef.value.getRef();
      const curData = zdFormRef.value.getData() as any;
      formRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          if (row) {
            Object.assign(row, curData);
          } else {
            newFormInline.value.dischargeDiagnosis.push(curData);
          }
          done(options, index);
        }
      });
    }
  });
}

function openSSDialog(act, props?) {
  const row = props?.row;
  const ssFormRef = ref();
  addDialog({
    title: `${act}手术信息`,
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () =>
      h(SSForm, {
        ref: ssFormRef,
        initKind: newFormInline.value.initKind,
        formInline: getShoushuItemDefault(row)
      }),
    beforeSure: (done, { options, index }) => {
      const formRef = ssFormRef.value.getRef();
      const curData = ssFormRef.value.getData() as any;
      formRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          if (row) {
            Object.assign(row, curData);
          } else {
            newFormInline.value.shoushuDetails.push(curData);
          }
          done(options, index);
        }
      });
    }
  });
}

function openZZDialog(act, props?) {
  const row = props?.row;
  const zzFormRef = ref();
  addDialog({
    title: `${act}重症监护信息`,
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () =>
      h(ZZForm, {
        ref: zzFormRef,
        initKind: newFormInline.value.initKind,
        formInline: getZhongzhengDefault(row)
      }),
    beforeSure: (done, { options, index }) => {
      const formRef = zzFormRef.value.getRef();
      const curData = zzFormRef.value.getData() as any;
      formRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          if (row) {
            Object.assign(row, curData);
          } else {
            newFormInline.value.zhongzhengDetails.push(curData);
          }
          done(options, index);
        }
      });
    }
  });
}

function handleDeleteZD(props) {
  newFormInline.value.dischargeDiagnosis.splice(props.$index, 1);
}

function handleDeleteSS(props) {
  newFormInline.value.shoushuDetails.splice(props.$index, 1);
}

function handleDeleteZZ(props) {
  newFormInline.value.zhongzhengDetails.splice(props.$index, 1);
}

function getRef() {
  return ruleFormRef.value;
}

function getData() {
  return newFormInline.value;
}

defineExpose({ getRef, getData });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item name="1">
        <template #title>
          <span class="item-title">基本信息</span>
        </template>
        <el-row>
          <re-col :value="12" :xs="24" :sm="12">
            <el-form-item label="医疗机构" prop="hospitalName">
              <el-input
                v-model="newFormInline.hospitalName"
                clearable
                placeholder="请输入医疗机构"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="12">
            <el-form-item label="机构信用代码" prop="creditCode">
              <el-input
                v-model="newFormInline.creditCode"
                clearable
                placeholder="请输入机构信用代码"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="病案号" prop="recordCode">
              <el-input
                v-model="newFormInline.recordCode"
                clearable
                placeholder="请输入病案号"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="健康卡号" prop="patientCode">
              <el-input
                v-model="newFormInline.patientCode"
                clearable
                placeholder="请输入健康卡号"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="医疗付费方式" prop="payType">
              <el-select
                v-model="newFormInline.payType"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc032Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="住院次数" prop="admissionCount">
              <el-input-number
                v-model="newFormInline.admissionCount"
                :min="1"
                :max="9999"
                clearable
                placeholder="请输入住院次数"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span class="item-title">患者信息</span>
        </template>
        <el-row>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="姓名" prop="patientName">
              <el-input
                v-model="newFormInline.patientName"
                clearable
                placeholder="请输入姓名"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="newFormInline.gender"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc001Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="国籍" prop="nationality">
              <el-select
                v-model="newFormInline.nationality"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc040Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="12">
            <el-form-item label="民族" prop="ethnicity">
              <el-select
                v-model="newFormInline.ethnicity"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc035Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="年龄" prop="ageYear">
              <el-input-number
                v-model="newFormInline.ageYear"
                :min="0"
                :max="150"
                clearable
                placeholder="请输入年龄"
              /><span class="ml-[10px] mr-[20px]">岁</span>
              <el-input-number
                v-model="newFormInline.ageDay"
                :min="1"
                :max="365"
                clearable
                placeholder="请输入年龄"
              /><span class="ml-[10px]">天</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="新生儿出生体重" prop="A18x01">
              <el-input-number
                v-model="newFormInline.A18x01"
                :min="100"
                :max="9999"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px]">克</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="新生儿入院体重" prop="A17">
              <el-input-number
                v-model="newFormInline.A17"
                :min="100"
                :max="9999"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px]">克</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="籍贯省" prop="nativeProvince">
              <el-select
                v-model="newFormInline.nativeProvince"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc036Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="newFormInline.birthDate"
                type="date"
                placeholder="请选择出生日期"
                clearable
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="出生地址" prop="birthAddress">
              <el-input
                v-model="newFormInline.birthAddress"
                clearable
                placeholder="请输入姓名"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="证件类型" prop="idType">
              <el-select
                v-model="newFormInline.idType"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc038Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="证件号" prop="idCard">
              <el-input
                v-model="newFormInline.idCard"
                clearable
                placeholder="请输入证件号"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="职业" prop="profession">
              <el-select
                v-model="newFormInline.profession"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc003Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="婚姻状况" prop="maritalStatus">
              <el-select
                v-model="newFormInline.maritalStatus"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc002Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="现住址" prop="liveAddress">
              <el-input
                v-model="newFormInline.liveAddress"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="联系电话" prop="livePhone">
              <el-input
                v-model="newFormInline.livePhone"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="现住址邮编" prop="liveZipCode">
              <el-input
                v-model="newFormInline.liveZipCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="16" :xs="24" :sm="24">
            <el-form-item label="户口地址" prop="hukouAddress">
              <el-input
                v-model="newFormInline.hukouAddress"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="户口地址邮政编码" prop="hukouZipCode">
              <el-input
                v-model="newFormInline.hukouZipCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="工作单位及地址" prop="workUnitAddress">
              <el-input
                v-model="newFormInline.workUnitAddress"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="工作单位电话" prop="workUnitPhone">
              <el-input
                v-model="newFormInline.workUnitPhone"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="工作单位邮政编码" prop="workUnitZipCode">
              <el-input
                v-model="newFormInline.workUnitZipCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input
                v-model="newFormInline.contactName"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="联系人关系" prop="contactRelationship">
              <el-select
                v-model="newFormInline.contactRelationship"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc033Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="联系人地址" prop="contactAddress">
              <el-input
                v-model="newFormInline.contactAddress"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input
                v-model="newFormInline.contactPhone"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <span class="item-title">诊疗信息</span>
        </template>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="入院途径" prop="admissionRoute">
              <el-select
                v-model="newFormInline.admissionRoute"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc026Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="门（急）诊主要诊断" prop="mainDiagnosis">
              <el-input
                v-model="newFormInline.mainDiagnosis"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item
              label="门（急）诊主要诊断编码"
              prop="mainDiagnosisCode"
            >
              <el-input
                v-model="newFormInline.mainDiagnosisCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院时间" prop="admissionDate">
              <el-date-picker
                v-model="newFormInline.admissionDate"
                type="datetime"
                placeholder="请选择"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                date-format="YYYY-MM-DD"
                time-format="HH:mm:ss"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院科别" prop="admissionDepartment">
              <el-select
                v-model="newFormInline.admissionDepartment"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc023Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院病房" prop="admissionWard">
              <el-input
                v-model="newFormInline.admissionWard"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="转科科别" prop="transferDepartment">
              <el-select
                v-model="newFormInline.transferDepartment"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc023Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院时间" prop="dischargeDate">
              <el-date-picker
                v-model="newFormInline.dischargeDate"
                type="datetime"
                placeholder="请选择"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                date-format="YYYY-MM-DD"
                time-format="HH:mm:ss"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院科别" prop="dischargeDepartment">
              <el-select
                v-model="newFormInline.dischargeDepartment"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc023Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院病房" prop="dischargeWard">
              <el-input
                v-model="newFormInline.dischargeWard"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="实际住院（天）"
              prop="actualHospitalizationDays"
            >
              <el-input-number
                v-model="newFormInline.actualHospitalizationDays"
                :min="1"
                :max="99999"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px]">天</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院时情况" prop="admissionCondition">
              <el-select
                v-model="newFormInline.admissionCondition"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc004Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院诊断编码" prop="admissionDiagnosisCode">
              <el-input
                v-model="newFormInline.admissionDiagnosisCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="入院诊断名称" prop="admissionDiagnosisName">
              <el-input
                v-model="newFormInline.admissionDiagnosisName"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="入院后确诊日期"
              prop="postAdmissionConfirmationDate"
            >
              <el-date-picker
                v-model="newFormInline.postAdmissionConfirmationDate"
                type="date"
                placeholder="请选择"
                clearable
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                date-format="YYYY-MM-DD"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="出院主要诊断入院病情"
              prop="primaryDiagnosisAdmissionCondition"
            >
              <el-select
                v-model="newFormInline.primaryDiagnosisAdmissionCondition"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc027Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院主要诊断编码" prop="primaryDiagnosisCode">
              <el-input
                v-model="newFormInline.primaryDiagnosisCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院主要诊断名称" prop="primaryDiagnosisName">
              <el-input
                v-model="newFormInline.primaryDiagnosisName"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="主要诊断出院情况"
              prop="primaryDiagnosisDischargeCondition"
            >
              <el-select
                v-model="newFormInline.primaryDiagnosisDischargeCondition"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc005Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="24" :xs="24" :sm="24">
            <el-button
              class="absolute right-[30px]"
              size="small"
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openZDDialog('新增')"
              >新增诊断信息</el-button
            >
            <el-form-item label="出院其他诊断信息" prop="dischargeDiagnosis">
              <el-table
                :data="newFormInline.dischargeDiagnosis"
                border
                style="width: 100%"
              >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column
                  prop="C06x__C"
                  align="center"
                  label="诊断编码"
                />
                <el-table-column
                  prop="C07x__N"
                  align="center"
                  label="诊断名称"
                />
                <el-table-column prop="C08x__C" align="center" label="入院情况"
                  ><template #default="scope">
                    {{ rc005Labels[scope.row.C08x__C] }}
                  </template></el-table-column
                >
                <el-table-column prop="F06x__" align="center" label="出院情况">
                  <template #default="scope">
                    {{ rc027Labels[scope.row.F06x__] }}
                  </template>
                </el-table-column>
                <el-table-column
                  fixed="right"
                  label="操作"
                  align="center"
                  width="80"
                >
                  <template #default="slotProps">
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      size="small"
                      :icon="useRenderIcon(EditPen)"
                      @click="openZDDialog('编辑', slotProps)"
                    />
                    <el-popconfirm
                      :title="`是否确认删除这条数据`"
                      @confirm="handleDeleteZD(slotProps)"
                    >
                      <template #reference>
                        <el-button
                          class="reset-margin"
                          link
                          type="danger"
                          size="small"
                          :icon="useRenderIcon(Delete)"
                        />
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item
              label="损伤、中毒外部原因编码"
              prop="externalCauseOfInjuryOrPoisoningCode"
            >
              <el-input
                v-model="newFormInline.externalCauseOfInjuryOrPoisoningCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item
              label="损伤、中毒外部原因名称"
              prop="externalCauseOfInjuryOrPoisoningName"
            >
              <el-input
                v-model="newFormInline.externalCauseOfInjuryOrPoisoningName"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="病理诊断编码" prop="pathologyDiagnosisCode">
              <el-input
                v-model="newFormInline.pathologyDiagnosisCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="病理诊断名称" prop="pathologyDiagnosisName">
              <el-input
                v-model="newFormInline.pathologyDiagnosisName"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="病理号" prop="pathologyNumber">
              <el-input
                v-model="newFormInline.pathologyNumber"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="有无药物过敏史" prop="drugAllergyHistory">
              <el-select
                v-model="newFormInline.drugAllergyHistory"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc037Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="16" :xs="24" :sm="24">
            <el-form-item label="药物过敏名称" prop="allergyDrugs">
              <el-input
                v-model="newFormInline.allergyDrugs"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="ABO血型" prop="aboBloodType">
              <el-select
                v-model="newFormInline.aboBloodType"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc030Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="Rh血型" prop="rhBloodType">
              <el-select
                v-model="newFormInline.rhBloodType"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc031Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="死亡患者尸检" prop="autopsyForDeceased">
              <el-select
                v-model="newFormInline.autopsyForDeceased"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc016Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="HBsAg检测结果" prop="nbsag">
              <el-select
                v-model="newFormInline.nbsag"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc007Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="HCV-Ab检测结果" prop="hcvab">
              <el-select
                v-model="newFormInline.hcvab"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc007Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="HIV-Ab检测结果" prop="hivab">
              <el-select
                v-model="newFormInline.hivab"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc007Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="科主任编码" prop="departmentHeadCode">
              <el-input
                v-model="newFormInline.departmentHeadCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="科主任" prop="departmentHead">
              <el-input
                v-model="newFormInline.departmentHead"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="主（副主）任医师编码"
              prop="attendingPhysicianCode"
            >
              <el-input
                v-model="newFormInline.attendingPhysicianCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="主（副主）任医师" prop="attendingPhysician">
              <el-input
                v-model="newFormInline.attendingPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="主治医师编码" prop="associatePhysicianCode">
              <el-input
                v-model="newFormInline.associatePhysicianCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="主治医师" prop="associatePhysician">
              <el-input
                v-model="newFormInline.associatePhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="住院医师编码" prop="residentPhysicianCode">
              <el-input
                v-model="newFormInline.residentPhysicianCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="住院医师" prop="residentPhysician">
              <el-input
                v-model="newFormInline.residentPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="责任护士编码" prop="responsibleNurseCode">
              <el-input
                v-model="newFormInline.responsibleNurseCode"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="责任护士" prop="responsibleNurse">
              <el-input
                v-model="newFormInline.responsibleNurse"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="4" :xs="24" :sm="24">
            <el-form-item label="进修医师" prop="visitingPhysician">
              <el-input
                v-model="newFormInline.visitingPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="4" :xs="24" :sm="24">
            <el-form-item label="实习医师" prop="internPhysician">
              <el-input
                v-model="newFormInline.internPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="4" :xs="24" :sm="24">
            <el-form-item label="编码员" prop="coder">
              <el-input
                v-model="newFormInline.coder"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="离院方式" prop="B34C">
              <el-select
                v-model="newFormInline.B34C"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc019Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="18" :xs="24" :sm="24">
            <el-form-item
              label="医嘱转院、转社区卫生服务机构/乡镇卫生院名称"
              prop="B35"
            >
              <el-input
                v-model="newFormInline.B35"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="出院31日内再住院计划" prop="B36C">
              <el-select
                v-model="newFormInline.B34C"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc028Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="18" :xs="24" :sm="24">
            <el-form-item label="出院31天再住院计划目的" prop="B37">
              <el-input
                v-model="newFormInline.B37"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="24" :xs="24" :sm="24">
            <el-form-item label="颅脑损伤患者入院前昏迷时间" prop="C28">
              <el-input-number
                v-model="newFormInline.C28"
                :min="0"
                :max="99999"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px] mr-[20px]">天</span>
              <el-input-number
                v-model="newFormInline.C29"
                :min="0"
                :max="23"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px] mr-[20px]">时</span>
              <el-input-number
                v-model="newFormInline.C30"
                :min="0"
                :max="59"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px]">分</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="24" :xs="24" :sm="24">
            <el-form-item label="颅脑损伤患者入院后昏迷时间" prop="C32">
              <el-input-number
                v-model="newFormInline.C32"
                :min="0"
                :max="99999"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px] mr-[20px]">天</span>
              <el-input-number
                v-model="newFormInline.C33"
                :min="0"
                :max="23"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px] mr-[20px]">时</span>
              <el-input-number
                v-model="newFormInline.C47"
                :min="0"
                :max="59"
                clearable
                placeholder="请输入"
              /><span class="ml-[10px]">分</span>
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="4">
        <template #title>
          <span class="item-title">手术信息</span>
        </template>
        <el-row>
          <re-col :value="24" :xs="24" :sm="24">
            <el-button
              class="absolute right-[30px]"
              size="small"
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openSSDialog('新增')"
              >新增手术记录</el-button
            >
            <el-form-item label="手术记录表" prop="shoushuDetails">
              <el-table
                :data="newFormInline.shoushuDetails"
                border
                style="width: 100%"
              >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column
                  prop="pso1"
                  align="center"
                  label="手术操作编码"
                />
                <el-table-column
                  prop="pso2"
                  align="center"
                  label="手术操作名称"
                />
                <el-table-column
                  prop="pso3"
                  align="center"
                  label="手术操作日期"
                />
                <el-table-column prop="pso4" align="center" label="手术操作级别"
                  ><template #default="scope">
                    {{ rc029Labels[scope.row.pso4] }}
                  </template></el-table-column
                >
                <el-table-column
                  prop="pso5"
                  align="center"
                  label="手术持续时间"
                />
                <el-table-column
                  prop="pso6"
                  align="center"
                  label="手术操作术者"
                />
                <el-table-column
                  prop="pso7"
                  align="center"
                  label="手术操作Ⅰ助"
                />
                <el-table-column
                  prop="pso8"
                  align="center"
                  label="手术操作Ⅱ助"
                />
                <el-table-column
                  prop="pso9"
                  align="center"
                  label="手术操作切口愈合等级"
                >
                  <template #default="scope">
                    {{ rc014Labels[scope.row.pso9] }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="pso10"
                  align="center"
                  label="手术操作麻醉方式"
                >
                  <template #default="scope">
                    {{ rc013Labels[scope.row.pso10] }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="pso11"
                  align="center"
                  label="手术麻醉分级"
                >
                  <template #default="scope">
                    {{ rc024Labels[scope.row.pso11] }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="pso12"
                  align="center"
                  label="手术操作麻醉医师"
                />
                <el-table-column
                  fixed="right"
                  label="操作"
                  align="center"
                  width="80"
                >
                  <template #default="slotProps">
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      size="small"
                      :icon="useRenderIcon(EditPen)"
                      @click="openSSDialog('编辑', slotProps)"
                    />
                    <el-popconfirm
                      :title="`是否确认删除这条数据`"
                      @confirm="handleDeleteSS(slotProps)"
                    >
                      <template #reference>
                        <el-button
                          class="reset-margin"
                          link
                          type="danger"
                          size="small"
                          :icon="useRenderIcon(Delete)"
                        />
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="6">
        <template #title>
          <span class="item-title">重症监护信息</span>
        </template>
        <el-row>
          <re-col :value="24" :xs="24" :sm="24">
            <el-button
              class="absolute right-[30px]"
              size="small"
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openZZDialog('新增')"
              >新增重症监护记录</el-button
            >
            <el-form-item label="重症监护记录表" prop="zhongzhengDetails">
              <el-table
                :data="newFormInline.zhongzhengDetails"
                border
                style="width: 100%"
              >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column
                  prop="C48x__C"
                  align="center"
                  label="重症监护室名称"
                  ><template #default="scope">
                    {{ rc015Labels[scope.row.C48x__C] }}
                  </template></el-table-column
                >
                <el-table-column
                  prop="C49x__"
                  align="center"
                  label="进入时间"
                />
                <el-table-column
                  prop="C50x__"
                  align="center"
                  label="退出时间"
                />
                <el-table-column
                  fixed="right"
                  label="操作"
                  align="center"
                  width="80"
                >
                  <template #default="slotProps">
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      size="small"
                      :icon="useRenderIcon(EditPen)"
                      @click="openZZDialog('编辑', slotProps)"
                    />
                    <el-popconfirm
                      :title="`是否确认删除这条数据`"
                      @confirm="handleDeleteZZ(slotProps)"
                    >
                      <template #reference>
                        <el-button
                          class="reset-margin"
                          link
                          type="danger"
                          size="small"
                          :icon="useRenderIcon(Delete)"
                        />
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="7">
        <template #title>
          <span class="item-title">费用信息</span>
        </template>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="住院总费用" prop="totalCost">
              <el-input-number
                v-model="newFormInline.totalCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="其中：自付金额" prop="selfPaidCost">
              <el-input-number
                v-model="newFormInline.selfPaidCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="1.一般医疗服务费" prop="generalServiceCost">
              <el-input-number
                v-model="newFormInline.generalServiceCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="2.一般治疗操作费" prop="generalTreatmentCost">
              <el-input-number
                v-model="newFormInline.generalTreatmentCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="3.护理费" prop="nursingCost">
              <el-input-number
                v-model="newFormInline.nursingCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item
              label="4.综合医疗服务类其他费用"
              prop="otherServiceCost"
            >
              <el-input-number
                v-model="newFormInline.otherServiceCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="5.病理诊断费" prop="pathologyCost">
              <el-input-number
                v-model="newFormInline.pathologyCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="6.实验室诊断费" prop="labTestCost">
              <el-input-number
                v-model="newFormInline.labTestCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="7.影像学诊断费" prop="imagingCost">
              <el-input-number
                v-model="newFormInline.imagingCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="6" :xs="24" :sm="24">
            <el-form-item label="8.临床诊断项目费" prop="clinicalCost">
              <el-input-number
                v-model="newFormInline.clinicalCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="9.非手术治疗项目费" prop="nonSurgicalCost">
              <el-input-number
                v-model="newFormInline.nonSurgicalCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item
              label="其中：临床物理治疗费"
              prop="physicalTherapyCost"
            >
              <el-input-number
                v-model="newFormInline.physicalTherapyCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="10.手术治疗费" prop="surgeryTotalCost">
              <el-input-number
                v-model="newFormInline.surgeryTotalCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="其中：麻醉费" prop="anesthesiaCost">
              <el-input-number
                v-model="newFormInline.anesthesiaCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="11.康复费" prop="recoveryCost">
              <el-input-number
                v-model="newFormInline.recoveryCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="12.中医治疗费" prop="chineseMedicineCost">
              <el-input-number
                v-model="newFormInline.chineseMedicineCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="13.西药费" prop="westernMedicineCost">
              <el-input-number
                v-model="newFormInline.westernMedicineCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="其中：抗菌药物费用" prop="antibioticCost">
              <el-input-number
                v-model="newFormInline.antibioticCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="14.中成药费" prop="chinesePrepCost">
              <el-input-number
                v-model="newFormInline.chinesePrepCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="15.中草药费" prop="herbalMedicineCost">
              <el-input-number
                v-model="newFormInline.herbalMedicineCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="16.血费" prop="bloodCost">
              <el-input-number
                v-model="newFormInline.bloodCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="17.白蛋白类制品费" prop="albuminCost">
              <el-input-number
                v-model="newFormInline.albuminCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="18.球蛋白类制品费" prop="globulinCost">
              <el-input-number
                v-model="newFormInline.globulinCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="19.凝血因子类制品费" prop="coagulationCost">
              <el-input-number
                v-model="newFormInline.coagulationCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="20.细胞因子类制品费" prop="cytokineCost">
              <el-input-number
                v-model="newFormInline.cytokineCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item
              label="21.检查用一次性医用材料费"
              prop="disposableExamCost"
            >
              <el-input-number
                v-model="newFormInline.disposableExamCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
        <el-row>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item
              label="22.治疗用一次性医用材料费"
              prop="disposableTreatmentCost"
            >
              <el-input-number
                v-model="newFormInline.disposableTreatmentCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item
              label="23.手术用一次性医用材料费"
              prop="disposableSurgeryCost"
            >
              <el-input-number
                v-model="newFormInline.disposableSurgeryCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
          <re-col :value="8" :xs="24" :sm="24">
            <el-form-item label="24.其他费" prop="otherCost">
              <el-input-number
                v-model="newFormInline.otherCost"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="999999999"
              /><span class="ml-[10px]">元</span>
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="8">
        <template #title>
          <span class="item-title">质控信息</span>
        </template>
        <el-row>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="质控医师" prop="qualityControlPhysician">
              <el-input
                v-model="newFormInline.qualityControlPhysician"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="质控护士" prop="qualityControlNurse">
              <el-input
                v-model="newFormInline.qualityControlNurse"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="病案质量" prop="residentPhysicianCode">
              <el-select
                v-model="newFormInline.residentPhysicianCode"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rc011Options"
                  :key="item.value"
                  :label="`${item.value} - ${item.label}`"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="质控日期" prop="residentPhysician">
              <el-date-picker
                v-model="newFormInline.residentPhysician"
                type="date"
                placeholder="请选择"
                clearable
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                date-format="YYYY-MM-DD"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="9">
        <template #title>
          <span class="item-title">其他信息</span>
        </template>
        <el-row>
          <re-col :value="24" :xs="24" :sm="12">
            <el-form-item label="备注">
              <el-input
                v-model="newFormInline.remark"
                :maxlength="200"
                show-word-limit
                placeholder="请输入备注信息"
                type="textarea"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<style lang="scss" scoped>
.el-row .el-col {
  padding-right: 30px;
}

.el-row {
  padding-left: 24px;
}

.item-title {
  margin-left: 10px;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: bold;
  color: rgb(21 128 61);
}
</style>

<style lang="scss">
.el-collapse-item__header {
  background-color: rgb(64 149 255 / 5%);
}

.el-collapse-item__header.is-active {
  background-color: rgb(64 149 255 / 0);
}
</style>
