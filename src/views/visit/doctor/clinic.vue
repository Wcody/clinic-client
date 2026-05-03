<!--
  - 版权声明 Copyright (c) 2026。
  - 版权所有者： [缩微存储管理系统]
  - 首创日期： 2026年4月11日
  -->

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from "vue";

import { Close, Plus, Check, ArrowDown } from "@element-plus/icons-vue";
import BqPatientBasicInfo from "@/components/BqPatientBasicInfo";
import { BqDiagnosisSelector } from "@/components/BqDiagnosisSelector";
import {
  getMedicalDictionaryListApi,
  type BQMedicalDictionaryEntityType
} from "@/api/cm/medicalDictionary";
import { BQSearchFilter } from "@/api/api";

// ==================== API 导入 ====================
import {
  savePatientApi,
  updatePatientApi,
  getPatientByIdApi,
  saveMedicalRecordApi,
  updateMedicalRecordApi,
  saveMedicalOrderApi,
  getMedicalRecordByRegIdApi,
  getPrescriptionFullListByRegIdApi,
  printPrescriptionPdfApi,
  type BqSaveMedicalOrderDtoType,
  getAdditionalFeeListApi,
  type BqPatientEntityType,
  type BqMedicalRecordEntityType,
  type BqAdditionalFeeEntityType,
  type BqPrescriptionEntityType,
  type BqPrescriptionItemEntityType
} from "@/api/visit/clinic";
import type { BQDiagnosisDictEntityType } from "@/api/visit/diagnosis";
import {
  saveRegistrationApi,
  getRegistrationByIdApi,
  updateRegistrationApi,
  RegistrationStatus,
  FeeStatus
} from "@/api/visit/register";
import {
  addMedicalRecordTemplateApi,
  type BQMedicalRecordTemplateEntityType
} from "@/api/cm/medicalRecordTemplate";
import {
  addPrescriptionTemplateApi,
  addPrescriptionTemplateDetailBatchApi,
  type BQPrescriptionTemplateDetailEntityType,
  type BQPrescriptionTemplateEntityType
} from "@/api/cm/prescriptionTemplate";
import { getDrugsByIdsApi } from "@/api/pharmacy/drug";
import { ElMessage, ElMessageBox } from "element-plus";
import HistoryMedicalRecord from "./comp/HistoryMedicalRecord.vue";
import MedicalRecordTemplate from "./comp/MedicalRecordTemplate.vue";
import HistoryPrescription from "./comp/HistoryPrescription.vue";
import PrescriptionTemplate from "./comp/PrescriptionTemplate.vue";
import MedicalRecordForm from "./comp/MedicalRecordForm.vue";
import WesternPrescription from "./comp/WesternPrescription.vue";
import ChinesePrescription from "./comp/ChinesePrescription.vue";
import ExamTreatmentPrescription from "./comp/ExamTreatmentPrescription.vue";
import AdditionalFeePrescription from "./comp/AdditionalFeePrescription.vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
import type {
  PrescriptionItem,
  PrescriptionGroup,
  PrescriptionTypeData
} from "./prescriptionTypes";

defineOptions({
  name: "WorkDoctor"
});

// 获取路由传参
const route = useRoute();
const router = useRouter();
const routeRegId = route.query.regId as unknown as number;
const routePatientId = route.query.patientId as unknown as number;

// ==================== 接诊缓存（按用户eid隔离）====================
const getClinicCacheKey = () => {
  const eid = useUserStoreHook().eid ?? "unknown";
  return `clinic_visit_${eid}`;
};

const saveClinicCache = (regId: number, patientId: number) => {
  localStorage.setItem(
    getClinicCacheKey(),
    JSON.stringify({ regId, patientId })
  );
};

const loadClinicCache = (): { regId: number; patientId: number } | null => {
  try {
    const raw = localStorage.getItem(getClinicCacheKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearClinicCache = () => {
  localStorage.removeItem(getClinicCacheKey());
};

const activeTab = ref("medical-record");

// ==================== 基本信息组件 ref（所有页签共用同一份数据）====================
const basicInfoRef = ref<InstanceType<typeof BqPatientBasicInfo>>();

// ==================== 当前接诊状态 ====================
const currentRegId = ref<number | undefined>(undefined);
const currentMedicalRecordId = ref<number | undefined>(undefined);
const currentRegStatus = ref<string | null>(null);
const currentRegStatusFee = ref<string | null>(null);

// ==================== 确保患者和挂号记录存在 ====================
const ensurePatientAndRegistration = async (): Promise<{
  patientId: number;
  regId: number;
} | null> => {
  const form = basicInfoRef.value?.form;
  if (!form?.name?.trim()) {
    ElMessage.warning("请先填写患者基本信息");
    return null;
  }

  let patientId = form.id;

  if (!patientId) {
    try {
      const res = await savePatientApi({
        name: form.name,
        gender: form.gender,
        firstAge: form.firstAge,
        ageType: form.ageType,
        lastAge: form.lastAge,
        idCard: form.idCard,
        mobile: form.mobile,
        province: form.province ?? undefined,
        city: form.city ?? undefined,
        district: form.district ?? undefined,
        address: form.address,
        isAllergy: form.isAllergy,
        allergicHistory: form.allergicHistory
      });
      if (!res?.data?.id) {
        ElMessage.error("创建患者失败");
        return null;
      }
      patientId = res.data.id!;
      form.id = patientId;
    } catch {
      ElMessage.error("创建患者失败");
      return null;
    }
  }

  if (currentRegId.value) {
    return { patientId, regId: currentRegId.value };
  }

  try {
    const res = await saveRegistrationApi({
      registration: {
        patientId,
        patient: form.name,
        gender: form.gender,
        firstAge: form.firstAge,
        lastAge: form.lastAge,
        ageType: form.ageType,
        department: "",
        doctor: "",
        isFirstVisit: form.isFirstVisit,
        status: RegistrationStatus.WAITING,
        orderTime: new Date().toISOString()
      }
    });
    if (!res?.data?.id) {
      ElMessage.error("创建挂号记录失败");
      return null;
    }
    currentRegId.value = res.data.id;
    return { patientId, regId: res.data.id };
  } catch {
    ElMessage.error("创建挂号记录失败");
    return null;
  }
};

// ==================== 患者选择回调 ====================
const onBeforePatientSelect = async (user: any) => {
  if (currentRegId.value) {
    // 确认之前先获取当前患者ID
    const currentPatientId = basicInfoRef.value?.form?.id;
    try {
      await ElMessageBox.confirm("当前已有正在接诊的患者，是否切换？", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      });
      // 确认后，保存当前状态到缓存
      saveClinicCache(currentRegId.value, currentPatientId);
      // 重置状态
      currentRegId.value = undefined;
      currentMedicalRecordId.value = undefined;
      Object.values(medicalOrderForm.prescriptionData).forEach(typeData => {
        typeData.groups.forEach(g => (g.prescId = undefined));
      });
      medicalRecordForm.diagnoses = [];
      // 确认后应用新患者数据
      basicInfoRef.value?.confirmPatientSelect(user);
    } catch {
      // 取消，不做任何操作
    }
  } else {
    // 没有正在接诊的患者，直接应用
    basicInfoRef.value?.confirmPatientSelect(user);
  }
};

const onPatientSelect = async (user: any) => {
  medicalRecordForm.pastHistory = user.pastHistory || "";
  medicalRecordForm.personalHistory = user.personalHistory || "";
  medicalRecordForm.marriageHistory = user.obstericalHistory || "";
  medicalRecordForm.familyHistory = user.familyHistory || "";
  medicalRecordForm.travelHistory = user.travelHistory || "";
  medicalRecordForm.contactHistory = user.contactHistory || "";
  medicalRecordForm.allergyHistory = user.isAllergy ? 1 : 0;
  medicalRecordForm.allergyDetail = user.allergicHistory || "";

  ElMessage.success(`已选择患者: ${user.name}`);
};

const onReset = () => {
  // 重置所有状态和数据
  currentRegId.value = undefined;
  currentMedicalRecordId.value = undefined;
  currentRegStatus.value = null;
  currentRegStatusFee.value = null;
  forceShowSaveBtn.value = false;
  // 重置病历表单
  medicalRecordForm.chiefComplaint = "";
  medicalRecordForm.presentIllness = "";
  medicalRecordForm.pastHistory = "";
  medicalRecordForm.allergyHistory = 0;
  medicalRecordForm.allergyDetail = "";
  medicalRecordForm.personalHistory = "";
  medicalRecordForm.marriageHistory = "";
  medicalRecordForm.familyHistory = "";
  medicalRecordForm.travelHistory = "";
  medicalRecordForm.contactHistory = "";
  medicalRecordForm.temperature = "";
  medicalRecordForm.heartRate = "";
  medicalRecordForm.respiration = "";
  medicalRecordForm.bloodPressureSystolic = "";
  medicalRecordForm.bloodPressureDiastolic = "";
  medicalRecordForm.otherExamination = "";
  medicalRecordForm.diagnoses = [];
  medicalRecordForm.treatmentAdvice = "";
  // 重置处方数据
  Object.values(medicalOrderForm.prescriptionData).forEach(typeData => {
    typeData.groups = [
      {
        name: typeData.groups[0]?.name || "处方1",
        prescType: typeData.groups[0]?.prescType || 1,
        items: []
      }
    ];
    typeData.currentGroup = 0;
  });
  // 重置附加费
  medicalOrderForm.additionalFees = [];
  // 清除缓存
  clearClinicCache();
  // 重置快照（重置后数据为空，保存按钮应禁用）
  takeMedicalRecordSnapshot();
  takeMedicalOrderSnapshot();
  // 路由跳转清空URL参数
  router.push("/visit/doctor/clinic");
};

const onBasicInfoSave = async (formData: any) => {
  if (!formData.id) return;
  try {
    await updatePatientApi({
      id: formData.id,
      name: formData.name,
      gender: formData.gender,
      firstAge: formData.firstAge,
      ageType: formData.ageType,
      lastAge: formData.lastAge,
      idCard: formData.idCard,
      mobile: formData.mobile,
      province: formData.province ?? undefined,
      city: formData.city ?? undefined,
      district: formData.district ?? undefined,
      address: formData.address,
      isAllergy: formData.isAllergy,
      allergicHistory: formData.allergicHistory
    });
    ElMessage.success("患者信息已更新");
  } catch {
    ElMessage.error("更新患者信息失败");
  }
};

// ==================== 病历信息表单 ====================
const medicalRecordForm = reactive({
  chiefComplaint: "",
  presentIllness: "",
  pastHistory: "",
  allergyHistory: 0,
  allergyDetail: "",
  personalHistory: "",
  marriageHistory: "",
  familyHistory: "",
  travelHistory: "",
  contactHistory: "",
  temperature: "",
  heartRate: "",
  respiration: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  otherExamination: "",
  diagnoses: [] as BQDiagnosisDictEntityType[],
  treatmentAdvice: ""
});

// ==================== 诊断信息面板 ====================
const diagnosisCollapsed = ref(false);
const diagnosisInputValue = ref("");

const diagnosisHint = computed(() =>
  medicalRecordForm.diagnoses.map(d => d.diagnosisName).join("、")
);

const handleDiagnosisSelect = (diagnosis: BQDiagnosisDictEntityType) => {
  const exists = medicalRecordForm.diagnoses.some(
    d => d.diagnosisName === diagnosis.diagnosisName
  );
  if (exists) {
    ElMessage.warning("该诊断已在列表中");
    diagnosisInputValue.value = "";
    return;
  }
  medicalRecordForm.diagnoses.push(diagnosis);
  diagnosisInputValue.value = "";
};

const removeDiagnosis = (index: number) => {
  medicalRecordForm.diagnoses.splice(index, 1);
};

// ==================== 历史病历弹窗 ====================
const historyMedicalRecordRef =
  ref<InstanceType<typeof HistoryMedicalRecord>>();

const handleViewHistory = () => {
  if (!basicInfoRef.value?.form.id) {
    ElMessage.warning("请先选择患者");
    return;
  }
  historyMedicalRecordRef.value?.open();
};

const onHistoryMedicalRecordConfirm = (record: any) => {
  medicalRecordForm.chiefComplaint = record.chiefComplaint || "";
  medicalRecordForm.presentIllness = record.presentIllness || "";
  medicalRecordForm.pastHistory = record.pastHistory || "";
  medicalRecordForm.treatmentAdvice = record.advice || "";
  if (record.physicalExam) {
    medicalRecordForm.temperature = record.physicalExam.temperature || "";
    medicalRecordForm.heartRate = record.physicalExam.heartRate || "";
    medicalRecordForm.respiration = record.physicalExam.respiration || "";
    medicalRecordForm.bloodPressureSystolic =
      record.physicalExam.bloodPressureSystolic || "";
    medicalRecordForm.bloodPressureDiastolic =
      record.physicalExam.bloodPressureDiastolic || "";
    medicalRecordForm.otherExamination = record.physicalExam.other || "";
  }
  // 回填诊断信息
  if (record.diagnosis) {
    const names = record.diagnosis.split("，").filter(Boolean);
    const codes = record.diagnosisIds
      ? record.diagnosisIds.split(",").filter(Boolean)
      : [];
    medicalRecordForm.diagnoses = names.map(
      (name: string, index: number) =>
        ({
          id: codes[index] || "0",
          diagnosisCode: codes[index] || "",
          diagnosisName: name,
          pinyin: "",
          status: true,
          version: 0,
          deleted: false,
          deletedTime: null,
          deletedBy: "",
          createdBy: ""
        }) as BQDiagnosisDictEntityType
    );
    diagnosisCollapsed.value = false;
  }
  ElMessage.success("已从历史病历导入");
};

// ==================== 历史处方弹窗 ====================
const historyPrescriptionRef = ref<InstanceType<typeof HistoryPrescription>>();

const handleViewPrescriptionHistory = () => {
  if (!basicInfoRef.value?.form.id) {
    ElMessage.warning("请先选择患者");
    return;
  }
  historyPrescriptionRef.value?.open();
};

const onHistoryPrescriptionConfirm = (
  prescription: BqPrescriptionEntityType,
  items: BqPrescriptionItemEntityType[],
  importDiagnosis: boolean
) => {
  const typeKeyMap: Record<number, string> = {
    1: "western",
    2: "chinese",
    3: "exam",
    4: "treatment"
  };
  const typeKey = typeKeyMap[prescription.prescType as number];
  if (!typeKey) {
    ElMessage.warning("未知的处方类型");
    return;
  }

  medicalOrderForm.prescriptionType = typeKey;

  const convertedItems: PrescriptionItem[] = items.map(item => {
    // 历史数据以原值为准；unitId/priceUnitId 若缺失则通过名称反查
    const unitObj = item.unitId
      ? unitOptions.value.find(o => o.id === item.unitId)
      : findUnitOption(item.unit);
    const priceUnitObj = item.priceUnitId
      ? unitOptions.value.find(o => o.id === item.priceUnitId)
      : findUnitOption(item.priceUnit);

    return {
      id: item.id,
      itemId: item.itemId,
      itemType: item.itemType ?? 1,
      itemName: item.itemName ?? "",
      spec: item.spec ?? "",
      unit: unitObj?.name ?? item.unit ?? "",
      unitId: unitObj?.id,
      priceUnit: priceUnitObj?.name ?? item.priceUnit ?? "",
      priceUnitId: priceUnitObj?.id,
      singleDosage: item.singleDosage ?? "",
      useWay: item.useWay ?? "",
      frequency: item.frequency ?? "",
      time: 1,
      days: item.days ?? 0,
      totalNum: Number(item.totalNum ?? 0),
      entrust: item.entrust ?? "",
      price: Number(item.price ?? 0),
      totalPrice: Number(item.totalPrice ?? 0),
      prescriptionPrice: item.prescriptionPrice,
      prescriptionUnit: item.prescriptionUnit,
      wholesalePrice: item.wholesalePrice,
      wholesaleUnit: item.wholesaleUnit,
      conversionValue: item.conversionValue,
      decoWay: item.decoWay,
      defaultSaleType: item.defaultSaleType,
      groupNo: item.groupNo,
      sort: item.sort
    };
  });

  supplementDrugInfoFromHistory(convertedItems).then(() => {
    const typeData = medicalOrderForm.prescriptionData[typeKey];
    if (typeData.groups.length > 0) {
      const currentGroup = typeData.groups[typeData.currentGroup];
      currentGroup.items = convertedItems;
    } else {
      const groupName =
        typeKey === "western" || typeKey === "chinese" ? "处方" : "项目";
      typeData.groups.push({
        name: `${groupName}1`,
        prescType: prescription.prescType as number,
        prescId: undefined,
        items: convertedItems
      });
    }

    if (typeKey === "chinese") {
      chinesePrescriptionRef.value?.applyTemplateSettings({
        usageTypeName: usageOptions.value.find(
          o => o.id === prescription.usageType
        )?.name,
        frequenceName: frequencyOptions.value.find(
          o => o.id === prescription.frequence
        )?.name,
        doseAmount: prescription.doseAmount,
        days: prescription.days,
        decoWay: prescription.recommendation || "",
        skipApplyItems: true
      });
      nextTick(() => {
        chinesePrescriptionRef.value?.applyBatchToItems?.();
      });
    }

    // 同时导入诊断信息
    if (importDiagnosis && prescription.diagnosis) {
      const names = prescription.diagnosis.split("，").filter(Boolean);
      medicalRecordForm.diagnoses = names.map(
        name =>
          ({
            id: "0",
            diagnosisCode: "",
            diagnosisName: name,
            pinyin: "",
            status: true,
            deleted: false,
            deletedTime: null,
            deletedBy: "",
            createdBy: ""
          }) as BQDiagnosisDictEntityType
      );
      diagnosisCollapsed.value = false;
    }

    ElMessage.success("已从历史处方导入");
  });
};

// ==================== 病历模板 ====================
const medicalRecordTemplateRef =
  ref<InstanceType<typeof MedicalRecordTemplate>>();

const handleCallMedicalTemplate = () => {
  medicalRecordTemplateRef.value?.open();
};

const onMedicalTemplateConfirm = (
  detail: BQMedicalRecordTemplateEntityType
) => {
  medicalRecordForm.chiefComplaint = detail.complaint || "";
  medicalRecordForm.presentIllness = detail.historyOfPresentIllness || "";
  medicalRecordForm.pastHistory = detail.pastHistory || "";
  medicalRecordForm.personalHistory = detail.personalHistory || "";
  medicalRecordForm.marriageHistory = detail.obstericalHistory || "";
  medicalRecordForm.familyHistory = detail.familyHistory || "";
  if (detail.bodyTemperature)
    medicalRecordForm.temperature = String(detail.bodyTemperature);
  if (detail.heartRate) medicalRecordForm.heartRate = String(detail.heartRate);
  if (detail.breathRate)
    medicalRecordForm.respiration = String(detail.breathRate);
  if (detail.bloodPressureHight)
    medicalRecordForm.bloodPressureSystolic = String(detail.bloodPressureHight);
  if (detail.bloodPressureLow)
    medicalRecordForm.bloodPressureDiastolic = String(detail.bloodPressureLow);
  medicalRecordForm.otherExamination = detail.otherExamine || "";
  medicalRecordForm.treatmentAdvice = detail.treatmentRecommendation || "";
};

// ==================== 处方模板 ====================
const prescriptionTemplateRef =
  ref<InstanceType<typeof PrescriptionTemplate>>();
const chinesePrescriptionRef = ref<InstanceType<typeof ChinesePrescription>>();

const handleCallTemplate = () => {
  prescriptionTemplateRef.value?.open();
};

// ==================== 药品信息补全函数 ====================

// 频率匹配模式
const templateFreqPatterns: [RegExp, number][] = [
  [/q4h|每4小时|每四小时/i, 6],
  [/q6h|每6小时|每六小时/i, 4],
  [/q8h|每8小时|每八小时/i, 3],
  [/q12h|每12小时|每十二小时/i, 2],
  [/qid|每日四次|4次.?日|四次.?日/i, 4],
  [/tid|每日三次|3次.?日|三次.?日/i, 3],
  [/bid|每日两次|每日二次|2次.?日|两次.?日/i, 2],
  [/tiw|每周三次|3次.?周|三次.?周/i, 3 / 7],
  [/biw|每周两次|每周二次|2次.?周|两次.?周/i, 2 / 7],
  [/qw|每周一次|1次.?周|一次.?周/i, 1 / 7],
  [/qod|隔日|隔天|每隔一日/i, 0.5],
  [/qn|每晚|每夜|睡前/i, 1],
  [/qd|每日一次|每天一次|1次.?日|一次.?日|st|立即/i, 1]
];

// 计算处方模板的 totalNum（考虑频率和大小单位换算）
const calcTemplateTotalNum = (item: PrescriptionItem) => {
  if (!item.singleDosage || !item.days) {
    item.totalNum = 0;
    item.totalPrice = 0;
    return;
  }
  const singleDosage = parseFloat(item.singleDosage);
  if (isNaN(singleDosage)) {
    item.totalNum = 0;
    item.totalPrice = 0;
    return;
  }
  const matched = templateFreqPatterns.find(([re]) =>
    re.test(String(item.frequency || ""))
  );
  const timesPerDay = matched ? matched[1] : 1;
  item.time = timesPerDay;

  // 总量 = 单次用量 × 频次 × 天数（单位是 unit）
  const total = singleDosage * timesPerDay * item.days;
  const conversion = parseFloat(item.conversionValue || "0");

  // 根据 unit 和 priceUnit 的关系决定是否换算
  // unit = 大单位，priceUnit = 小单位 → totalNum = total × 整散比
  // unit = 小单位，priceUnit = 大单位 → totalNum = total ÷ 整散比
  // unit = priceUnit（相同）→ totalNum = total
  if (conversion > 0) {
    if (
      item.unit === item.wholesaleUnit &&
      item.priceUnit === item.prescriptionUnit
    ) {
      // unit=大，priceUnit=小，乘以整散比
      item.totalNum = Math.ceil(total * conversion);
    } else if (
      item.unit === item.prescriptionUnit &&
      item.priceUnit === item.wholesaleUnit
    ) {
      // unit=小，priceUnit=大，除以整散比
      item.totalNum = Math.ceil(total / conversion);
    } else {
      // 相同单位，不换算
      item.totalNum = Math.ceil(total);
    }
  } else {
    // 没有整散比，不换算
    item.totalNum = Math.ceil(total);
  }

  // 计算总价
  item.totalPrice = parseFloat(
    ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
  );
};

// 通过名称或 ID 字符串在单位字典中查找选项（兼容两种存储方式）
const findUnitOption = (nameOrId?: string) => {
  if (!nameOrId) return undefined;
  return (
    unitOptions.value.find(o => o.name === nameOrId) ??
    unitOptions.value.find(o => String(o.id) === nameOrId)
  );
};

// 名称↔ID 双向转换工具（兼容存量数据，纯数字字符串视为 ID）
const resolveDecoWayId = (nameOrId?: string): string | undefined => {
  if (!nameOrId) return undefined;
  if (/^\d+$/.test(nameOrId)) return nameOrId;
  const opt = decoOptions.value.find(o => o.name === nameOrId);
  return opt ? String(opt.id) : undefined;
};

const resolveUsageWayId = (nameOrId?: string): string | undefined => {
  if (!nameOrId) return undefined;
  if (/^\d+$/.test(nameOrId)) return nameOrId;
  const opt = usageOptions.value.find(o => o.name === nameOrId);
  return opt ? String(opt.id) : undefined;
};

// 主表 usageType/frequence 是 number，但兼容意外传入名称字符串的情况
const resolveUsageWayToNumber = (
  nameOrId?: string | number
): number | undefined => {
  if (nameOrId == null) return undefined;
  if (typeof nameOrId === "number") return nameOrId;
  if (/^\d+$/.test(nameOrId)) return Number(nameOrId);
  return usageOptions.value.find(o => o.name === nameOrId)?.id;
};

const resolveFrequencyId = (nameOrId?: string): string | undefined => {
  if (!nameOrId) return undefined;
  if (/^\d+$/.test(nameOrId)) return nameOrId;
  const opt = frequencyOptions.value.find(o => o.name === nameOrId);
  return opt ? String(opt.id) : undefined;
};

const resolveFrequencyToNumber = (
  nameOrId?: string | number
): number | undefined => {
  if (nameOrId == null) return undefined;
  if (typeof nameOrId === "number") return nameOrId;
  if (/^\d+$/.test(nameOrId)) return Number(nameOrId);
  return frequencyOptions.value.find(o => o.name === nameOrId)?.id;
};

// useWay/frequency：药库现在存 ID，处方明细需要名称，转换回来
const resolveUsageWayName = (nameOrId?: string): string | undefined => {
  if (!nameOrId) return undefined;
  if (!/^\d+$/.test(nameOrId)) return nameOrId;
  return usageOptions.value.find(o => String(o.id) === nameOrId)?.name;
};

const resolveFrequencyName = (nameOrId?: string): string | undefined => {
  if (!nameOrId) return undefined;
  if (!/^\d+$/.test(nameOrId)) return nameOrId;
  return frequencyOptions.value.find(o => String(o.id) === nameOrId)?.name;
};

// 补全处方模板数据：以药库为准
const supplementDrugInfoFromTemplate = async (items: PrescriptionItem[]) => {
  console.log(
    "supplementDrugInfoFromTemplate called, items:",
    JSON.stringify(items, null, 2)
  );
  const drugIds = items.map(item => item.itemId).filter(Boolean) as number[];
  console.log("drugIds:", drugIds);
  if (drugIds.length === 0) return;

  const drugRes = await getDrugsByIdsApi(drugIds);
  if (!drugRes?.data) return;

  const drugMap = new Map(drugRes.data.map((d: any) => [d.id, d]));

  items.forEach(item => {
    const drug = drugMap.get(item.itemId);
    if (!drug) return;

    // 以药库为准
    if (drug.name) item.itemName = drug.name;
    if (drug.specification) item.spec = drug.specification;
    if (drug.useWay) item.useWay = resolveUsageWayName(drug.useWay);
    if (drug.frequency) item.frequency = resolveFrequencyName(drug.frequency);
    if (drug.prescriptionPrice) item.prescriptionPrice = drug.prescriptionPrice;
    if (drug.prescriptionUnit) item.prescriptionUnit = drug.prescriptionUnit;
    if (drug.wholesalePrice) item.wholesalePrice = drug.wholesalePrice;
    if (drug.wholesaleUnit) item.wholesaleUnit = drug.wholesaleUnit;
    if (drug.conversionValue) item.conversionValue = drug.conversionValue;
    if (drug.decoWay) item.decoWay = resolveDecoWayId(drug.decoWay);
    if (drug.defaultSaleType !== undefined)
      item.defaultSaleType = drug.defaultSaleType;

    // 同步单次用量
    if (drug.singleDosage) item.singleDosage = drug.singleDosage;

    // 单次用量单位：优先药库 unitId，回退到大单位
    const saleType = Number(drug.defaultSaleType);
    const unitObj = drug.unitId
      ? unitOptions.value.find(o => o.id === drug.unitId)
      : findUnitOption(drug.wholesaleUnit);
    item.unit = unitObj?.name ?? "";
    item.unitId = unitObj?.id;

    // 单价：根据 defaultSaleType
    item.price =
      saleType === 0
        ? parseFloat(drug.wholesalePrice || "0") || 0
        : parseFloat(drug.prescriptionPrice || "0") || 0;

    // 加价总量单位：整卖用大单位，散卖用小单位，回退到单次用量单位
    const targetUnit =
      saleType === 0 ? drug.wholesaleUnit : drug.prescriptionUnit;
    const priceUnitObj = findUnitOption(targetUnit) ?? unitObj;
    item.priceUnit = priceUnitObj?.name ?? "";
    item.priceUnitId = priceUnitObj?.id;

    // 计算 totalNum 和 totalPrice（考虑频率和大小单位换算）
    calcTemplateTotalNum(item);
  });
};

// 补全历史处方数据：以当前数据为准，药库补充缺失值
const supplementDrugInfoFromHistory = async (items: PrescriptionItem[]) => {
  // 优先用 drugIds 查找
  const drugIds = items.map(item => item.itemId).filter(Boolean) as number[];
  console.log("supplementDrugInfoFromHistory drugIds:", drugIds);

  // 同时收集药品名称，用于没有 drugId 时通过名称查找
  const drugNames = items
    .map(item => item.itemName)
    .filter(Boolean) as string[];

  if (drugIds.length === 0 && drugNames.length === 0) return;

  // 如果有 drugIds，用 ID 查询
  if (drugIds.length > 0) {
    const drugRes = await getDrugsByIdsApi(drugIds);
    console.log("supplementDrugInfoFromHistory drugRes:", drugRes);
    if (drugRes?.data) {
      const drugMap = new Map(drugRes.data.map((d: any) => [Number(d.id), d]));
      applyDrugInfo(items, drugMap, true);
    }
  }

  // 如果有名称但没有查到对应药品，用名称再查一次
  if (
    drugNames.length > 0 &&
    items.some(item => !item.itemId || !item.wholesaleUnit)
  ) {
    // 这里可以调用按名称查询药品的接口
    // 目前暂时跳过，等待后端补充 itemId
  }
};

// 应用药品信息到 items（历史数据模式：以当前数据为准，药库补充缺失值）
const applyDrugInfo = (
  items: PrescriptionItem[],
  drugMap: Map<number, any>,
  skipIfHasValue: boolean
) => {
  items.forEach(item => {
    const drug = item.itemId ? drugMap.get(item.itemId) : undefined;
    if (!drug) return;

    // 以当前数据为准，药库补充缺失值
    if (skipIfHasValue) {
      if (!item.itemName && drug.name) item.itemName = drug.name;
      if (!item.spec && drug.specification) item.spec = drug.specification;
      if (!item.useWay && drug.useWay)
        item.useWay = resolveUsageWayName(drug.useWay);
      if (!item.frequency && drug.frequency)
        item.frequency = resolveFrequencyName(drug.frequency);
      if (!item.prescriptionPrice && drug.prescriptionPrice) {
        item.prescriptionPrice = drug.prescriptionPrice;
      }
      if (!item.prescriptionUnit && drug.prescriptionUnit) {
        item.prescriptionUnit = drug.prescriptionUnit;
      }
      if (!item.wholesalePrice && drug.wholesalePrice) {
        item.wholesalePrice = drug.wholesalePrice;
      }
      if (!item.wholesaleUnit && drug.wholesaleUnit) {
        item.wholesaleUnit = drug.wholesaleUnit;
      }
      if (!item.conversionValue && drug.conversionValue) {
        item.conversionValue = drug.conversionValue;
      }
      if (!item.decoWay && drug.decoWay) {
        item.decoWay = resolveDecoWayId(drug.decoWay);
      }
      if (
        item.defaultSaleType === undefined &&
        drug.defaultSaleType !== undefined
      ) {
        item.defaultSaleType = drug.defaultSaleType;
      }
    } else {
      // 完全覆盖模式
      if (drug.name) item.itemName = drug.name;
      if (drug.specification) item.spec = drug.specification;
      if (drug.useWay) item.useWay = resolveUsageWayName(drug.useWay);
      if (drug.frequency) item.frequency = resolveFrequencyName(drug.frequency);
      if (drug.prescriptionPrice)
        item.prescriptionPrice = drug.prescriptionPrice;
      if (drug.prescriptionUnit) item.prescriptionUnit = drug.prescriptionUnit;
      if (drug.wholesalePrice) item.wholesalePrice = drug.wholesalePrice;
      if (drug.wholesaleUnit) item.wholesaleUnit = drug.wholesaleUnit;
      if (drug.conversionValue) item.conversionValue = drug.conversionValue;
      if (drug.decoWay) item.decoWay = resolveDecoWayId(drug.decoWay);
      if (drug.defaultSaleType !== undefined)
        item.defaultSaleType = drug.defaultSaleType;
    }

    // 单次用量单位：有 unit 名称但无 unitId 时通过名称反查；都没有则从药库补全
    if (item.unit && !item.unitId) {
      const uObj = findUnitOption(item.unit);
      if (uObj) {
        item.unit = uObj.name ?? "";
        item.unitId = uObj.id;
      }
    }
    if (!item.unit && !item.unitId) {
      const uObj = drug.unitId
        ? unitOptions.value.find(o => o.id === drug.unitId)
        : findUnitOption(drug.wholesaleUnit);
      if (uObj) {
        item.unit = uObj.name ?? "";
        item.unitId = uObj.id;
      }
    }

    // 计价总量单位：有 priceUnit 名称但无 priceUnitId 时反查；都没有则按 defaultSaleType 从药库补全
    const saleType = Number(drug.defaultSaleType ?? item.defaultSaleType);
    if (item.priceUnit && !item.priceUnitId) {
      const uObj = findUnitOption(item.priceUnit);
      if (uObj) {
        item.priceUnit = uObj.name ?? "";
        item.priceUnitId = uObj.id;
      }
    }
    if (!item.priceUnit) {
      const targetUnit =
        saleType === 0 ? drug.wholesaleUnit : drug.prescriptionUnit;
      const uObj = findUnitOption(targetUnit);
      if (uObj) {
        item.priceUnit = uObj.name ?? "";
        item.priceUnitId = uObj.id;
        if (!item.price) {
          item.price =
            saleType === 0
              ? parseFloat(drug.wholesalePrice || "0") || 0
              : parseFloat(drug.prescriptionPrice || "0") || 0;
        }
      } else {
        // 回退到单次用量单位
        item.priceUnit = item.unit;
        item.priceUnitId = item.unitId;
      }
    }
  });
};

const onPrescriptionTemplateConfirm = async (
  details: BQPrescriptionTemplateDetailEntityType[],
  templateInfo: BQPrescriptionTemplateEntityType
) => {
  console.log(
    "onPrescriptionTemplateConfirm called, details:",
    JSON.stringify(details, null, 2)
  );

  // 检查模板数据中是否有组号
  const hasGroupNo = details.some(
    d => d.groupNo !== undefined && d.groupNo !== null
  );

  const items: PrescriptionItem[] = details.map(d => {
    const unitId = d.quantityUnit ?? undefined;
    const price = parseFloat(String(d.price ?? "").replace(/[^\d.]/g, "")) || 0;
    return {
      itemId: d.drugId ? Number(d.drugId) : undefined,
      itemType: 1,
      itemName: d.drugName || "",
      spec: d.specification || "",
      unitId: unitId,
      unit: getUnitName(unitId) || "",
      singleDosage: d.singleUsageAmount
        ? String(d.singleUsageAmount)
        : d.quantity
          ? String(d.quantity)
          : "",
      useWay: "",
      frequency: "",
      time: 1,
      days: d.days || 0,
      totalNum: d.quantity || 0,
      entrust: d.recommendation || "",
      price,
      totalPrice: 0,
      decoWay: d.cookingType
        ? decoOptions.value.find(o => o.id === d.cookingType)?.name || ""
        : "",
      groupNo: hasGroupNo ? d.groupNo : 1
    };
  });

  // 补全药品信息
  console.log("Before supplementDrugInfoFromTemplate");
  await supplementDrugInfoFromTemplate(items);
  console.log(
    "After supplementDrugInfoFromTemplate, items:",
    JSON.stringify(items, null, 2)
  );

  const currentData = getCurrentPrescriptionData();
  if (currentData.groups[currentData.currentGroup]) {
    currentData.groups[currentData.currentGroup].items = items;
  }

  // 中药处方需要带入用法/频率/剂数
  if (medicalOrderForm.prescriptionType === "chinese") {
    chinesePrescriptionRef.value?.applyTemplateSettings({
      usageTypeName: usageOptions.value.find(
        o => o.id === templateInfo.usageType
      )?.name,
      frequenceName: frequencyOptions.value.find(
        o => o.id === templateInfo.frequence
      )?.name,
      doseAmount: templateInfo.doseAmount,
      days: templateInfo.days,
      recommendation: templateInfo.recommendation || ""
    });
  }
};

// ==================== 医嘱信息表单 ====================
const medicalOrderFormRef = ref();

const medicalOrderForm = reactive({
  prescriptionType: "western",
  prescriptionData: {
    western: {
      groups: [
        { name: "处方1", prescType: 1, items: [] as PrescriptionItem[] }
      ],
      currentGroup: 0
    },
    chinese: {
      groups: [
        { name: "处方1", prescType: 2, items: [] as PrescriptionItem[] }
      ],
      currentGroup: 0
    },
    exam: {
      groups: [
        { name: "项目1", prescType: 3, items: [] as PrescriptionItem[] }
      ],
      currentGroup: 0
    },
    treatment: {
      groups: [
        { name: "项目1", prescType: 4, items: [] as PrescriptionItem[] }
      ],
      currentGroup: 0
    }
  } as Record<string, PrescriptionTypeData>,
  additionalFees: [] as { id?: number; name: string; amount: number }[]
});

// 医疗字典
const usageOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const frequencyOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const unitOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const decoOptions = ref<BQMedicalDictionaryEntityType[]>([]);

const unitIdToName = computed<Record<number, string>>(() =>
  Object.fromEntries(unitOptions.value.map(o => [o.id, o.name ?? ""]))
);
const unitNameToId = computed<Record<string, number>>(() =>
  Object.fromEntries(
    unitOptions.value
      .filter(o => o.name)
      .map(o => [o.name as string, o.id as number])
  )
);
const getUnitName = (id?: number) =>
  id != null ? (unitIdToName.value[id] ?? "") : "";
const getUnitId = (name?: string) =>
  name ? (unitNameToId.value[name] ?? undefined) : undefined;

const getCurrentPrescriptionData = () =>
  medicalOrderForm.prescriptionData[medicalOrderForm.prescriptionType];

const prescriptionTabs = ref([
  { label: "西/成药处方", value: "western", prescType: 1 },
  { label: "中药处方", value: "chinese", prescType: 2 },
  { label: "检查检验项目", value: "exam", prescType: 3 },
  { label: "处置项目", value: "treatment", prescType: 4 },
  { label: "附加费", value: "additionalFee", prescType: 5 }
]);

const getPrescTypeByTab = (tab: string): number => {
  const map: Record<string, number> = {
    western: 1,
    chinese: 2,
    exam: 3,
    treatment: 4,
    additionalFee: 5
  };
  return map[tab] || 1;
};

const prescTypeRef = computed(() =>
  getPrescTypeByTab(medicalOrderForm.prescriptionType)
);

// ==================== 附加费 ====================
const availableAdditionalFees = ref<BqAdditionalFeeEntityType[]>([]);
const addFeeDialogVisible = ref(false);

const loadAdditionalFees = async () => {
  try {
    const res = await getAdditionalFeeListApi();
    if (res?.data) {
      availableAdditionalFees.value = res.data as BqAdditionalFeeEntityType[];
      if (medicalOrderForm.additionalFees.length === 0) {
        medicalOrderForm.additionalFees = availableAdditionalFees.value
          .filter(f => f.defaultAdd)
          .map(f => ({
            id: f.id,
            name: f.name || "",
            amount: f.sellingPrice || 0
          }));
      }
    }
  } catch {}
};

const isFeeAdded = (fee: BqAdditionalFeeEntityType) =>
  medicalOrderForm.additionalFees.some(f => f.id === fee.id);

const toggleFee = (fee: BqAdditionalFeeEntityType) => {
  const idx = medicalOrderForm.additionalFees.findIndex(f => f.id === fee.id);
  if (idx >= 0) {
    medicalOrderForm.additionalFees.splice(idx, 1);
  } else {
    medicalOrderForm.additionalFees.push({
      id: fee.id,
      name: fee.name || "",
      amount: fee.sellingPrice || 0
    });
    // 选择后关闭弹窗
    addFeeDialogVisible.value = false;
  }
};

const handleAddFee = () => {
  medicalOrderForm.prescriptionType = "additionalFee";
  addFeeDialogVisible.value = true;
  loadAdditionalFees();
};

const removeFee = (index: number) => {
  medicalOrderForm.additionalFees.splice(index, 1);
};

const getTotalAmount = () => {
  const feeTotal = medicalOrderForm.additionalFees.reduce(
    (sum, fee) => sum + (fee.amount || 0),
    0
  );
  const prescTotal = Object.values(medicalOrderForm.prescriptionData).reduce(
    (sum, typeData) =>
      sum +
      typeData.groups.reduce(
        (s, group) =>
          s +
          group.items.reduce(
            (itemSum, item) => itemSum + (item.totalPrice || 0),
            0
          ),
        0
      ),
    0
  );
  return feeTotal + prescTotal;
};

// ==================== 脏数据检测 ====================
const medicalRecordSnapshot = ref("");
const medicalOrderSnapshot = ref("");

const getMedicalRecordState = () =>
  JSON.stringify({
    chiefComplaint: medicalRecordForm.chiefComplaint,
    presentIllness: medicalRecordForm.presentIllness,
    pastHistory: medicalRecordForm.pastHistory,
    allergyHistory: medicalRecordForm.allergyHistory,
    allergyDetail: medicalRecordForm.allergyDetail,
    personalHistory: medicalRecordForm.personalHistory,
    marriageHistory: medicalRecordForm.marriageHistory,
    familyHistory: medicalRecordForm.familyHistory,
    travelHistory: medicalRecordForm.travelHistory,
    contactHistory: medicalRecordForm.contactHistory,
    temperature: medicalRecordForm.temperature,
    heartRate: medicalRecordForm.heartRate,
    respiration: medicalRecordForm.respiration,
    bloodPressureSystolic: medicalRecordForm.bloodPressureSystolic,
    bloodPressureDiastolic: medicalRecordForm.bloodPressureDiastolic,
    otherExamination: medicalRecordForm.otherExamination,
    diagnoses: medicalRecordForm.diagnoses.map(d => d.diagnosisName),
    treatmentAdvice: medicalRecordForm.treatmentAdvice
  });

const getMedicalOrderState = () =>
  JSON.stringify({
    prescriptions: Object.fromEntries(
      Object.entries(medicalOrderForm.prescriptionData).map(([k, v]) => [
        k,
        v.groups.map(g => ({
          prescId: g.prescId,
          prescType: g.prescType,
          items: g.items.map(i => ({
            itemId: i.itemId,
            itemName: i.itemName,
            singleDosage: i.singleDosage,
            useWay: i.useWay,
            frequency: i.frequency,
            days: i.days,
            totalNum: i.totalNum,
            price: i.price,
            entrust: i.entrust,
            groupNo: i.groupNo,
            decoWay: i.decoWay
          }))
        }))
      ])
    ),
    additionalFees: medicalOrderForm.additionalFees.map(f => ({
      id: f.id,
      amount: f.amount
    }))
  });

const takeMedicalRecordSnapshot = () => {
  medicalRecordSnapshot.value = getMedicalRecordState();
};

const takeMedicalOrderSnapshot = () => {
  medicalOrderSnapshot.value = getMedicalOrderState();
};

const medicalRecordDirty = computed(
  () => getMedicalRecordState() !== medicalRecordSnapshot.value
);

const medicalOrderDirty = computed(
  () => getMedicalOrderState() !== medicalOrderSnapshot.value
);

// ==================== 保存病历 ====================
const saveMedicalRecord = async (): Promise<number | undefined> => {
  const form = basicInfoRef.value?.form;
  const patientId = form?.id;
  if (!patientId) {
    ElMessage.warning("请先选择或填写患者信息");
    return undefined;
  }

  const physicalExam = JSON.stringify({
    temperature: medicalRecordForm.temperature,
    heartRate: medicalRecordForm.heartRate,
    respiration: medicalRecordForm.respiration,
    bloodPressureSystolic: medicalRecordForm.bloodPressureSystolic,
    bloodPressureDiastolic: medicalRecordForm.bloodPressureDiastolic,
    other: medicalRecordForm.otherExamination
  });

  const diagnosisIds = medicalRecordForm.diagnoses
    .map(d => d.diagnosisCode)
    .filter(Boolean)
    .join(",");
  const diagnosisText = medicalRecordForm.diagnoses
    .map(d => d.diagnosisName)
    .join("，");

  const doctorId = useUserStoreHook().eid;

  const payload: Partial<BqMedicalRecordEntityType> = {
    patientId,
    regId: currentRegId.value,
    doctorId: doctorId ? Number(doctorId) : undefined,
    chiefComplaint: medicalRecordForm.chiefComplaint,
    presentIllness: medicalRecordForm.presentIllness,
    pastHistory: medicalRecordForm.pastHistory,
    physicalExam,
    diagnosis: diagnosisText,
    diagnosisIds,
    advice: medicalRecordForm.treatmentAdvice,
    seeTime: new Date().toISOString()
  };

  if (currentMedicalRecordId.value) {
    payload.id = currentMedicalRecordId.value;
    const res = await updateMedicalRecordApi(
      payload as BqMedicalRecordEntityType
    );
    return res?.data?.id || currentMedicalRecordId.value;
  } else {
    const res = await saveMedicalRecordApi(payload);
    if (res?.data?.id) {
      currentMedicalRecordId.value = res.data.id;
    }
    return res?.data?.id;
  }
};

// ==================== 构造医嘱 DTO ====================
type GroupRef = { typeKey: string; gi: number };

const collectPrescriptionGroups = (): {
  groupRefs: GroupRef[];
  prescriptions: BqSaveMedicalOrderDtoType["prescriptions"];
} => {
  const groupRefs: GroupRef[] = [];
  const prescriptions: BqSaveMedicalOrderDtoType["prescriptions"] = [];

  for (const [typeKey, typeData] of Object.entries(
    medicalOrderForm.prescriptionData
  )) {
    typeData.groups.forEach((group, gi) => {
      if (group.items.length === 0) return;
      groupRefs.push({ typeKey, gi });
      prescriptions.push({
        prescId: group.prescId,
        prescType: group.prescType,
        groupNo: group.name,
        totalPrice: group.items.reduce((s, i) => s + (i.totalPrice || 0), 0),
        usageType: resolveUsageWayToNumber(group.usageType),
        frequence: resolveFrequencyToNumber(group.frequence),
        doseAmount: group.doseAmount,
        days: group.days,
        recommendation: group.recommendation,
        decoWay: resolveDecoWayId(group.decoWay),
        items: group.items.map(item => ({
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          spec: item.spec,
          unit: item.unit,
          unitId: item.unitId,
          priceUnit: item.priceUnit,
          priceUnitId: item.priceUnitId,
          singleDosage: item.singleDosage,
          useWay: resolveUsageWayId(
            item.useWay != null ? String(item.useWay) : undefined
          ),
          frequency: resolveFrequencyId(
            item.frequency != null ? String(item.frequency) : undefined
          ),
          days: item.days,
          totalNum: item.totalNum,
          entrust: item.entrust,
          price: item.price,
          totalPrice: item.totalPrice,
          groupNo: item.groupNo,
          decoWay: resolveDecoWayId(item.decoWay)
        }))
      });
    });
  }

  // 处理附加费 (prescType: 5)
  if (medicalOrderForm.additionalFees.length > 0) {
    const additionalFeeTotal = medicalOrderForm.additionalFees.reduce(
      (sum, fee) => sum + (fee.amount || 0),
      0
    );
    groupRefs.push({ typeKey: "additionalFee", gi: 0 });
    prescriptions.push({
      prescType: 5,
      groupNo: "附加费",
      totalPrice: additionalFeeTotal,
      items: medicalOrderForm.additionalFees.map((fee, index) => ({
        itemType: 5,
        itemId: fee.id,
        itemName: fee.name,
        spec: "",
        unit: "",
        unitId: undefined,
        priceUnit: "",
        priceUnitId: undefined,
        singleDosage: "",
        useWay: "",
        frequency: "",
        days: 0,
        totalNum: 1,
        entrust: "",
        price: fee.amount,
        totalPrice: fee.amount,
        groupNo: index + 1
      }))
    });
  }

  return { groupRefs, prescriptions };
};

const applyMedicalOrderResult = (
  result: { patientId: number; regId: number; prescIds: (number | null)[] },
  groupRefs: GroupRef[]
) => {
  // 不覆盖 currentRegId 和 form.id，避免ID混乱
  result.prescIds?.forEach((prescId, idx) => {
    if (prescId == null) return;
    const { typeKey, gi } = groupRefs[idx];
    // 跳过附加费，附加费没有 prescriptionData 中的 groups
    if (typeKey === "additionalFee") return;
    medicalOrderForm.prescriptionData[typeKey].groups[gi].prescId = prescId;
  });
};

// ==================== 处方标签快速点击检测 ====================
const prescriptionTabClickTimes: number[] = [];
const forceShowSaveBtn = ref(false);

const handlePrescriptionTabClick = () => {
  const now = Date.now();
  // 清除1秒前的记录
  const recentClicks = prescriptionTabClickTimes.filter(t => now - t < 1000);
  recentClicks.push(now);
  prescriptionTabClickTimes.length = 0;
  prescriptionTabClickTimes.push(...recentClicks);
  // 1秒内点击3次且保存按钮不显示时，强制显示保存按钮
  if (recentClicks.length >= 3 && !canShowSaveBtn.value) {
    forceShowSaveBtn.value = true;
    ElMessage.warning("进入测试模式");
  }
};

// ==================== 按钮状态 ====================
const canShowSaveBtn = computed(
  () =>
    (currentRegStatus.value === RegistrationStatus.WAITING &&
      currentRegStatusFee.value === FeeStatus.UNPAID) ||
    !currentRegStatus.value ||
    !currentRegStatusFee.value ||
    forceShowSaveBtn.value
);
const canCharge = computed(
  () => currentRegStatusFee.value === FeeStatus.UNPAID
);
const canEndVisit = computed(
  () => currentRegStatus.value === RegistrationStatus.WAITING
);

// ==================== 操作按钮 ====================
const handleSave = async () => {
  try {
    const ids = await ensurePatientAndRegistration();
    if (!ids) return;
    await saveMedicalRecord();
    takeMedicalRecordSnapshot();
    ElMessage.success("保存成功");
  } catch {
    ElMessage.error("保存失败");
  }
};

const handleSaveMedicalOrder = async () => {
  const form = basicInfoRef.value?.form;
  if (!form?.name?.trim()) {
    ElMessage.warning("请先填写患者基本信息");
    return;
  }
  const { groupRefs, prescriptions } = collectPrescriptionGroups();
  if (prescriptions.length === 0) {
    ElMessage.warning("请录入处方明细");
    return;
  }
  try {
    const ids = await ensurePatientAndRegistration();
    if (!ids) return;

    // 病历有未保存的修改时，先保存病历
    if (medicalRecordDirty.value) {
      await saveMedicalRecord();
      takeMedicalRecordSnapshot();
    }

    const res = await saveMedicalOrderApi({
      patientId: ids.patientId,
      regId: ids.regId,
      recordId: currentMedicalRecordId.value || undefined,
      prescriptions
    });
    if (res?.data) {
      applyMedicalOrderResult(res.data, groupRefs);
      takeMedicalOrderSnapshot();
      ElMessage.success("保存成功");
    }
  } catch {
    ElMessage.error("保存失败");
  }
};

const handlePrint = () => {
  ElMessage.info("打印病历");
};

const handleSaveAsTemplate = async () => {
  const form = medicalRecordForm;
  const isEmpty =
    !form.chiefComplaint?.trim() &&
    !form.presentIllness?.trim() &&
    !form.pastHistory?.trim() &&
    !form.personalHistory?.trim() &&
    !form.marriageHistory?.trim() &&
    !form.familyHistory?.trim() &&
    !form.travelHistory?.trim() &&
    !form.contactHistory?.trim() &&
    !form.temperature?.trim() &&
    !form.heartRate?.trim() &&
    !form.respiration?.trim() &&
    !form.bloodPressureSystolic?.trim() &&
    !form.bloodPressureDiastolic?.trim() &&
    !form.otherExamination?.trim() &&
    !form.treatmentAdvice?.trim() &&
    form.diagnoses.length === 0;

  if (isEmpty) {
    ElMessage.warning("不允许创建空模板");
    return;
  }

  try {
    const { value: name } = await ElMessageBox.prompt(
      "请输入病历模板名称",
      "另存为病历模板",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputErrorMessage: "模板名称不能为空"
      }
    );
    if (!name?.trim()) return;

    await addMedicalRecordTemplateApi({
      name: name.trim(),
      complaint: form.chiefComplaint,
      historyOfPresentIllness: form.presentIllness,
      pastHistory: form.pastHistory,
      personalHistory: form.personalHistory,
      obstericalHistory: form.marriageHistory,
      familyHistory: form.familyHistory,
      bodyTemperature: form.temperature
        ? parseFloat(form.temperature)
        : undefined,
      heartRate: form.heartRate ? parseFloat(form.heartRate) : undefined,
      breathRate: form.respiration ? parseFloat(form.respiration) : undefined,
      bloodPressureHight: form.bloodPressureSystolic
        ? parseFloat(form.bloodPressureSystolic)
        : undefined,
      bloodPressureLow: form.bloodPressureDiastolic
        ? parseFloat(form.bloodPressureDiastolic)
        : undefined,
      otherExamine: form.otherExamination,
      treatmentRecommendation: form.treatmentAdvice,
      status: true
    });
    ElMessage.success("病历模板保存成功");
  } catch (err: any) {
    if (err === "cancel" || err?.action === "cancel") return;
    ElMessage.error("保存病历模板失败");
  }
};

const handleSubmit = async () => {
  const { groupRefs, prescriptions } = collectPrescriptionGroups();
  if (prescriptions.length === 0) {
    ElMessage.warning("请录入处方明细");
    return;
  }
  try {
    const ids = await ensurePatientAndRegistration();
    if (!ids) return;
    const recordId = await saveMedicalRecord();
    if (!recordId) {
      ElMessage.error("保存病历失败");
      return;
    }
    const res = await saveMedicalOrderApi({
      patientId: ids.patientId,
      regId: ids.regId,
      recordId,
      prescriptions
    });
    if (res?.data) {
      applyMedicalOrderResult(res.data, groupRefs);
    }
    takeMedicalRecordSnapshot();
    takeMedicalOrderSnapshot();
    await syncPatientInfo();
    ElMessage.success("提交成功");
  } catch {
    ElMessage.error("提交失败");
  }
};

const handlePrintPrescription = async (
  showPrice: boolean,
  printCurrent: boolean,
  prescType?: number
) => {
  const regId = currentRegId.value;
  if (!regId) {
    ElMessage.warning("暂无处方信息，请先录入并保存");
    return;
  }

  try {
    const blob = await printPrescriptionPdfApi(
      regId,
      showPrice,
      printCurrent,
      prescType
    );
    if (!blob || blob.size === 0) {
      ElMessage.error("获取处方PDF失败");
      return;
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => setTimeout(() => win.print(), 300));
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    ElMessage.error("生成处方PDF失败，请重试");
  }
};

// 处理打印命令
const handlePrintCommand = (command: string) => {
  let showPrice = false;
  let printCurrent = false;
  let prescType: number | undefined;

  if (command === "current-no-price") {
    showPrice = false;
    printCurrent = true;
    prescType = getPrescTypeByTab(medicalOrderForm.prescriptionType);
  } else if (command === "current-with-price") {
    showPrice = true;
    printCurrent = true;
    prescType = getPrescTypeByTab(medicalOrderForm.prescriptionType);
  } else if (command === "all-no-price") {
    showPrice = false;
    printCurrent = false;
  } else if (command === "all-with-price") {
    showPrice = true;
    printCurrent = false;
  }
  handlePrintPrescription(showPrice, printCurrent, prescType);
};

const handleSaveAsPrescriptionTemplate = async () => {
  const typeData = getCurrentPrescriptionData();
  const currentGroup = typeData.groups[typeData.currentGroup];

  if (!currentGroup || currentGroup.items.length === 0) {
    ElMessage.warning("不允许创建空模板");
    return;
  }

  try {
    const { value: name } = await ElMessageBox.prompt(
      "请输入处方模板名称",
      "另存为处方模板",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputErrorMessage: "模板名称不能为空"
      }
    );
    if (!name?.trim()) return;

    const prescType = currentGroup.prescType;

    // 中药：先将 batch 状态刷入 group，确保 usageType/frequence/recommendation 最新
    if (prescType === 2) {
      chinesePrescriptionRef.value?.applyBatchToItems?.();
    }

    const templatePayload: BQPrescriptionTemplateEntityType = {
      name: name.trim(),
      prescriptionType: prescType,
      templateType: 1,
      status: true
    };
    if (prescType === 2) {
      templatePayload.usageType = currentGroup.usageType;
      templatePayload.frequence = currentGroup.frequence;
      templatePayload.doseAmount = currentGroup.doseAmount;
      templatePayload.days = currentGroup.days;
      templatePayload.recommendation = currentGroup.recommendation;
    }

    const templateRes = await addPrescriptionTemplateApi(templatePayload);
    const templateId = templateRes?.data?.id;
    if (!templateId) {
      ElMessage.error("保存处方模板失败");
      return;
    }

    const details = currentGroup.items.map((item, index) => {
      const decoWayIdStr = resolveDecoWayId(item.decoWay);
      return {
        templateId,
        drugId: item.itemId,
        drugName: item.itemName || "",
        specification: item.spec,
        quantity: item.totalNum,
        quantityUnit: item.priceUnitId,
        singleUsageAmount: item.singleDosage
          ? parseFloat(item.singleDosage)
          : undefined,
        singleUsageUnit: item.unitId,
        days: item.days,
        cookingType: decoWayIdStr ? Number(decoWayIdStr) : undefined,
        usageType: resolveUsageWayToNumber(item.useWay),
        frequency: resolveFrequencyToNumber(item.frequency),
        recommendation: item.entrust || undefined,
        groupNo: item.groupNo,
        sort: index
      };
    });

    await addPrescriptionTemplateDetailBatchApi(
      details as BQPrescriptionTemplateDetailEntityType[]
    );
    ElMessage.success("处方模板保存成功");
  } catch (err: any) {
    if (err === "cancel" || err?.action === "cancel") return;
    ElMessage.error("保存处方模板失败");
  }
};

const handleCharge = async () => {
  if (!currentRegId.value) {
    ElMessage.warning("当前没有正在接诊的患者");
    return;
  }
  try {
    await updateRegistrationApi({
      id: currentRegId.value,
      statusFee: FeeStatus.PAID
    } as any);
    currentRegStatusFee.value = FeeStatus.PAID;
    ElMessage.success("收费成功");
  } catch {
    ElMessage.error("收费失败");
  }
};

const handleEndVisit = async () => {
  if (!currentRegId.value) {
    ElMessage.warning("当前没有正在接诊的患者");
    return;
  }
  try {
    await ElMessageBox.confirm("确认结束本次就诊？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    });
    await updateRegistrationApi({
      id: currentRegId.value,
      status: RegistrationStatus.RECEIVED
    } as any);
    currentRegStatus.value = RegistrationStatus.RECEIVED;
    clearClinicCache();
    ElMessage.success("就诊已结束");
  } catch (e: any) {
    if (e !== "cancel") ElMessage.error("操作失败");
  }
};

// ==================== 加载医疗字典 ====================
const loadUsageDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "1")]
    });
    if (res.code === 0 && res.data) {
      usageOptions.value = res.data.filter(
        (item: any) => item.status !== false
      );
    }
  } catch (error) {
    console.error("加载用法字典失败:", error);
  }
};

const loadFrequencyDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "2")]
    });
    if (res.code === 0 && res.data) {
      frequencyOptions.value = res.data.filter(
        (item: any) => item.status !== false
      );
    }
  } catch (error) {
    console.error("加载频率字典失败:", error);
  }
};

const loadUnitDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "3")]
    });
    if (res.code === 0 && res.data) {
      unitOptions.value = res.data.filter((item: any) => item.status !== false);
    }
  } catch (error) {
    console.error("加载单位字典失败:", error);
  }
};

const loadDecoDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "5")]
    });
    if (res.code === 0 && res.data) {
      decoOptions.value = res.data.filter((item: any) => item.status !== false);
    }
  } catch (error) {
    console.error("加载煎药方式字典失败:", error);
  }
};

// ==================== 根据路由参数加载数据 ====================
const loadFromRoute = async (
  newRegId?: number | string,
  newPatientId?: number | string
) => {
  let loadRegId: number;
  let loadPatientId: number;

  // 优先使用传入的新参数，否则用路由参数或缓存
  if (newRegId && newPatientId) {
    loadRegId = Number(newRegId);
    loadPatientId = Number(newPatientId);
    saveClinicCache(loadRegId, loadPatientId);
  } else if (routeRegId && routePatientId) {
    loadRegId = Number(routeRegId);
    loadPatientId = Number(routePatientId);
    saveClinicCache(loadRegId, loadPatientId);
  } else {
    const cached = loadClinicCache();
    if (!cached) return;
    loadRegId = cached.regId;
    loadPatientId = cached.patientId;
  }

  // 切换患者前先重置所有业务状态，防止旧数据残留
  currentMedicalRecordId.value = undefined;
  currentRegStatus.value = null;
  currentRegStatusFee.value = null;
  forceShowSaveBtn.value = false;
  diagnosisCollapsed.value = false;
  medicalRecordForm.chiefComplaint = "";
  medicalRecordForm.presentIllness = "";
  medicalRecordForm.pastHistory = "";
  medicalRecordForm.allergyHistory = 0;
  medicalRecordForm.allergyDetail = "";
  medicalRecordForm.personalHistory = "";
  medicalRecordForm.marriageHistory = "";
  medicalRecordForm.familyHistory = "";
  medicalRecordForm.travelHistory = "";
  medicalRecordForm.contactHistory = "";
  medicalRecordForm.temperature = "";
  medicalRecordForm.heartRate = "";
  medicalRecordForm.respiration = "";
  medicalRecordForm.bloodPressureSystolic = "";
  medicalRecordForm.bloodPressureDiastolic = "";
  medicalRecordForm.otherExamination = "";
  medicalRecordForm.diagnoses = [];
  medicalRecordForm.treatmentAdvice = "";
  Object.values(medicalOrderForm.prescriptionData).forEach(td => {
    const prescType = td.groups[0]?.prescType ?? 1;
    const prefix = prescType === 3 || prescType === 4 ? "项目" : "处方";
    td.groups = [{ name: `${prefix}1`, prescType, items: [] }];
    td.currentGroup = 0;
  });
  medicalOrderForm.additionalFees = [];

  try {
    const patientRes = await getPatientByIdApi(loadPatientId);
    if (patientRes?.data) {
      basicInfoRef.value?.selectPatient(patientRes.data);
    }
  } catch {
    ElMessage.error("加载患者信息失败");
    return;
  }

  currentRegId.value = loadRegId;
  try {
    const regRes = await getRegistrationByIdApi(loadRegId);
    if (regRes?.data) {
      currentRegStatus.value = regRes.data.status ?? null;
      currentRegStatusFee.value = regRes.data.statusFee ?? null;
    }
  } catch {}

  try {
    const recordRes = await getMedicalRecordByRegIdApi(loadRegId);
    const record = recordRes?.data;
    if (record) {
      currentMedicalRecordId.value = record.id;
      medicalRecordForm.chiefComplaint = record.chiefComplaint ?? "";
      medicalRecordForm.presentIllness = record.presentIllness ?? "";
      medicalRecordForm.pastHistory = record.pastHistory ?? "";
      medicalRecordForm.treatmentAdvice = record.advice ?? "";
      if (record.physicalExam) {
        try {
          const exam = JSON.parse(record.physicalExam);
          medicalRecordForm.temperature = exam.temperature ?? "";
          medicalRecordForm.heartRate = exam.heartRate ?? "";
          medicalRecordForm.respiration = exam.respiration ?? "";
          medicalRecordForm.bloodPressureSystolic =
            exam.bloodPressureSystolic ?? "";
          medicalRecordForm.bloodPressureDiastolic =
            exam.bloodPressureDiastolic ?? "";
          medicalRecordForm.otherExamination = exam.other ?? "";
        } catch {}
      }
      // 回填诊断信息
      if (record.diagnosis) {
        const names = record.diagnosis.split("，").filter(Boolean);
        const codes = record.diagnosisIds
          ? record.diagnosisIds.split(",").filter(Boolean)
          : [];
        console.log("回填诊断 - names:", names, "codes:", codes);
        medicalRecordForm.diagnoses = names.map(
          (name, index) =>
            ({
              id: codes[index] || "0",
              diagnosisCode: codes[index] || "",
              diagnosisName: name,
              pinyin: "",
              status: true,
              version: 0,
              deleted: false,
              deletedTime: null,
              deletedBy: "",
              createdBy: ""
            }) as BQDiagnosisDictEntityType
        );
        console.log("回填后 diagnoses:", medicalRecordForm.diagnoses);
        console.log("diagnosisCollapsed 状态:", diagnosisCollapsed.value);
        diagnosisCollapsed.value = false;
      }
    }
  } catch {}

  try {
    const prescRes = await getPrescriptionFullListByRegIdApi(loadRegId);
    const fullList = prescRes?.data;
    if (fullList && fullList.length > 0) {
      const typeKeyMap: Record<number, string> = {
        1: "western",
        2: "chinese",
        3: "exam",
        4: "treatment"
      };
      Object.values(medicalOrderForm.prescriptionData).forEach(td => {
        td.groups = [];
      });
      // 收集所有 items 用于后续补全药品信息
      const allItems: PrescriptionItem[] = [];
      for (const full of fullList) {
        const presc = full.prescription;

        // 处理附加费 (prescType: 5)
        if (presc.prescType === 5) {
          medicalOrderForm.additionalFees = (full.items ?? []).map(
            (item: any) => ({
              id: item.itemId,
              name: item.itemName ?? "",
              amount: Number(item.price ?? 0)
            })
          );
          continue;
        }

        const typeKey = typeKeyMap[presc.prescType as number] ?? "western";
        const typeData = medicalOrderForm.prescriptionData[typeKey];
        const items: PrescriptionItem[] = (full.items ?? []).map(
          (item: any) => {
            // 根据 defaultSaleType 设置单位和单价
            const saleType = Number(item.defaultSaleType);
            let resolvedUnit = item.unit || getUnitName(item.unitId);
            let resolvedUnitId = item.unitId
              ? Number(item.unitId)
              : getUnitId(item.unit);
            let resolvedPrice = Number(item.price ?? 0);
            let resolvedPriceUnit =
              item.priceUnit || getUnitName(item.priceUnitId);
            let resolvedPriceUnitId = item.priceUnitId
              ? Number(item.priceUnitId)
              : getUnitId(item.priceUnit);

            if (saleType === 1 && item.prescriptionUnit) {
              // 散卖：用小单位
              resolvedUnit = item.prescriptionUnit;
              resolvedUnitId = unitOptions.value.find(
                o => o.name === item.prescriptionUnit
              )?.id;
              resolvedPrice = parseFloat(item.prescriptionPrice || "0") || 0;
              resolvedPriceUnit = item.prescriptionUnit;
              resolvedPriceUnitId = resolvedUnitId;
            } else if (saleType === 0 && item.wholesaleUnit) {
              // 整卖：用大单位
              resolvedUnit = item.wholesaleUnit;
              resolvedUnitId = unitOptions.value.find(
                o => o.name === item.wholesaleUnit
              )?.id;
              resolvedPrice = parseFloat(item.wholesalePrice || "0") || 0;
              resolvedPriceUnit = item.wholesaleUnit;
              resolvedPriceUnitId = resolvedUnitId;
            }

            return {
              id: item.id,
              itemId: item.itemId,
              itemType: item.itemType ?? 1,
              itemName: item.itemName ?? "",
              spec: item.spec ?? "",
              unit: resolvedUnit,
              unitId: resolvedUnitId,
              priceUnit: resolvedPriceUnit,
              priceUnitId: resolvedPriceUnitId,
              singleDosage: item.singleDosage ?? "",
              useWay: item.useWay ?? "",
              frequency: item.frequency ?? "",
              time: 1,
              days: item.days ?? 0,
              totalNum: Number(item.totalNum ?? 0),
              entrust: item.entrust ?? "",
              price: resolvedPrice,
              totalPrice: Number(item.totalPrice ?? 0),
              // 补充药品字段
              prescriptionPrice: item.prescriptionPrice,
              prescriptionUnit: item.prescriptionUnit,
              wholesalePrice: item.wholesalePrice,
              wholesaleUnit: item.wholesaleUnit,
              conversionValue: item.conversionValue,
              decoWay: item.decoWay,
              defaultSaleType: item.defaultSaleType,
              groupNo: item.groupNo
            };
          }
        );
        allItems.push(...items);
        // 设置 group 主表字段（中药处方需要 usageType, frequence 等）
        typeData.groups.push({
          name: presc.groupNo ?? `处方${typeData.groups.length + 1}`,
          prescType: presc.prescType as number,
          prescId: presc.id,
          items,
          usageType: presc.usageType,
          frequence: presc.frequence,
          doseAmount: presc.doseAmount,
          days: presc.days,
          recommendation: presc.recommendation,
          decoWay: presc.decoWay
        });
        typeData.currentGroup = 0;
      }

      // 循环结束后，设置 currentGroup 并处理中药处方的 batch 回填
      if (medicalOrderForm.prescriptionData.chinese.groups.length > 0) {
        medicalOrderForm.prescriptionData.chinese.currentGroup = 0;
        const firstChineseGroup =
          medicalOrderForm.prescriptionData.chinese.groups[0];
        nextTick(() => {
          // 只有当 usageType/frequence 有值时才查找名称
          const usageTypeNum =
            firstChineseGroup.usageType != null
              ? Number(firstChineseGroup.usageType)
              : null;
          const frequenceNum =
            firstChineseGroup.frequence != null
              ? Number(firstChineseGroup.frequence)
              : null;
          const usageTypeName =
            usageTypeNum != null
              ? usageOptions.value.find(o => Number(o.id) === usageTypeNum)
                  ?.name
              : undefined;
          const frequenceName =
            frequenceNum != null
              ? frequencyOptions.value.find(o => Number(o.id) === frequenceNum)
                  ?.name
              : undefined;
          chinesePrescriptionRef.value?.applyTemplateSettings({
            usageTypeName,
            frequenceName,
            doseAmount: firstChineseGroup.doseAmount,
            days: firstChineseGroup.days,
            decoWay: firstChineseGroup.decoWay || "",
            recommendation: firstChineseGroup.recommendation || "",
            skipApplyItems: true
          });
        });
      }

      Object.entries(medicalOrderForm.prescriptionData).forEach(([key, td]) => {
        if (td.groups.length === 0) {
          const prescType =
            { western: 1, chinese: 2, exam: 3, treatment: 4 }[key] ?? 1;
          const prefix =
            key === "exam" || key === "treatment" ? "项目" : "处方";
          td.groups.push({ name: `${prefix}1`, prescType, items: [] });
        }
      });
      // 补全所有处方明细的药品信息
      await supplementDrugInfoFromHistory(allItems);
    }
  } catch {}

  // 数据加载完成后取快照，保存按钮初始为禁用
  takeMedicalRecordSnapshot();
  takeMedicalOrderSnapshot();
};

// ==================== Lifecycle ====================
onMounted(async () => {
  await loadAdditionalFees();
  await loadUsageDictionary();
  await loadFrequencyDictionary();
  await loadUnitDictionary();
  await loadDecoDictionary();
  await loadFromRoute();
  // loadFromRoute 无数据时提前返回，此处兜底确保快照已初始化
  if (!medicalRecordSnapshot.value) takeMedicalRecordSnapshot();
  if (!medicalOrderSnapshot.value) takeMedicalOrderSnapshot();
});

// 监听路由参数变化
watch(
  () => [route.query.regId, route.query.patientId],
  ([newRegId, newPatientId]) => {
    console.log("路由参数变化:", newRegId, newPatientId);
    if (newRegId && newPatientId) {
      loadFromRoute(newRegId, newPatientId);
    }
  }
);
</script>

<template>
  <div class="doctor-container">
    <!-- 基本信息区 -->
    <div class="doctor-basic-info">
      <BqPatientBasicInfo
        ref="basicInfoRef"
        @user-select="onPatientSelect"
        @before-patient-select="onBeforePatientSelect"
        @save="onBasicInfoSave"
        @reset="onReset"
      />
    </div>

    <!-- 诊断信息区 -->
    <div class="doctor-diagnosis-info">
      <div
        class="section-title-bar"
        @click="diagnosisCollapsed = !diagnosisCollapsed"
      >
        <span class="title-accent" />
        <span class="title-text">诊断信息</span>
        <span
          v-if="diagnosisCollapsed && medicalRecordForm.diagnoses.length > 0"
          class="diagnosis-hint"
        >
          {{ diagnosisHint }}
        </span>
        <span
          class="collapse-arrow"
          :class="{ collapsed: diagnosisCollapsed }"
        />
      </div>
      <div v-show="!diagnosisCollapsed" class="diagnosis-body">
        <div class="diagnosis-input-row">
          <label class="diag-label">输入诊断</label>
          <div class="diag-selector-wrap">
            <BqDiagnosisSelector
              v-model="diagnosisInputValue"
              placeholder="输入诊断编码/名称/拼音搜索"
              @select="handleDiagnosisSelect"
            />
          </div>
        </div>
        <div class="diagnosis-table">
          <div class="table-header">
            <div class="col-disease">疾病诊断</div>
            <div class="col-action">操作</div>
          </div>
          <div class="table-body">
            <div
              v-if="medicalRecordForm.diagnoses.length === 0"
              class="empty-text"
            >
              暂无诊断
            </div>
            <div
              v-for="(diag, idx) in medicalRecordForm.diagnoses"
              :key="diag.id"
              class="diagnosis-row"
            >
              <div class="col-disease">
                {{ diag.diagnosisName }}
                <span v-show="false" class="diag-code">{{
                  diag.diagnosisCode || ""
                }}</span>
              </div>
              <div class="col-action">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="removeDiagnosis(idx)"
                  >删除</el-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页签内容区 -->
    <div class="doctor-content">
      <!-- 透明点击区域 -->
      <div class="tab-click-area" @click="handlePrescriptionTabClick" />
      <el-tabs v-model="activeTab" class="doctor-tabs">
        <!-- 病历信息 -->
        <el-tab-pane label="病历信息" name="medical-record">
          <div class="tab-content">
            <div class="medical-record-section">
              <MedicalRecordForm
                :form="medicalRecordForm"
                @view-history="handleViewHistory"
                @call-template="handleCallMedicalTemplate"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 医嘱信息 -->
        <el-tab-pane label="医嘱信息" name="medical-order">
          <div class="tab-content">
            <div class="medical-order-section">
              <el-form
                ref="medicalOrderFormRef"
                :model="medicalOrderForm"
                label-width="100px"
                class="medical-order-form"
              >
                <!-- 处方 -->
                <el-form-item label="处方" class="form-row prescription-row">
                  <div class="prescription-container">
                    <!-- 处方类型标签页 + 操作按钮 -->
                    <div class="prescription-tabs-header">
                      <div class="prescription-tabs">
                        <div
                          v-for="tab in prescriptionTabs"
                          :key="tab.value"
                          :class="[
                            'tab-item',
                            {
                              active:
                                medicalOrderForm.prescriptionType === tab.value
                            }
                          ]"
                          @click="medicalOrderForm.prescriptionType = tab.value"
                        >
                          {{ tab.label }}
                        </div>
                      </div>
                      <div class="tabs-actions">
                        <el-button
                          size="small"
                          type="primary"
                          @click="handleViewPrescriptionHistory"
                          >历史处方</el-button
                        >
                        <el-button
                          size="small"
                          type="primary"
                          @click="handleCallTemplate"
                          >调用处方模板</el-button
                        >
                      </div>
                    </div>

                    <!-- 西/成药处方 -->
                    <WesternPrescription
                      v-show="medicalOrderForm.prescriptionType === 'western'"
                      :type-data="medicalOrderForm.prescriptionData['western']"
                      :usage-options="usageOptions"
                      :frequency-options="frequencyOptions"
                      :unit-options="unitOptions"
                    />

                    <!-- 中药处方 -->
                    <ChinesePrescription
                      v-show="medicalOrderForm.prescriptionType === 'chinese'"
                      ref="chinesePrescriptionRef"
                      :type-data="medicalOrderForm.prescriptionData['chinese']"
                      :usage-options="usageOptions"
                      :frequency-options="frequencyOptions"
                      :unit-options="unitOptions"
                      :deco-options="decoOptions"
                    />

                    <!-- 检查检验项目 -->
                    <ExamTreatmentPrescription
                      v-show="medicalOrderForm.prescriptionType === 'exam'"
                      type="exam"
                      :type-data="medicalOrderForm.prescriptionData['exam']"
                    />

                    <!-- 处置项目 -->
                    <ExamTreatmentPrescription
                      v-show="medicalOrderForm.prescriptionType === 'treatment'"
                      type="treatment"
                      :type-data="
                        medicalOrderForm.prescriptionData['treatment']
                      "
                    />

                    <!-- 附加费 -->
                    <AdditionalFeePrescription
                      v-show="
                        medicalOrderForm.prescriptionType === 'additionalFee'
                      "
                      :fees="medicalOrderForm.additionalFees"
                      @add="handleAddFee"
                      @remove="removeFee"
                      @update="
                        (index, amount) =>
                          (medicalOrderForm.additionalFees[index].amount =
                            amount)
                      "
                    />
                  </div>
                </el-form-item>

                <!-- 治疗建议 -->
                <el-form-item label="治疗建议" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.treatmentAdvice"
                    type="textarea"
                    :rows="3"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 合计总金额 -->
                <el-form-item
                  label="合计总金额"
                  class="form-row total-amount-row"
                >
                  <span class="total-amount-label">总金额</span>
                  <span class="total-amount"
                    >¥{{ getTotalAmount().toFixed(2) }}</span
                  >
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 附件管理 -->
        <el-tab-pane label="附件管理" name="attachment">
          <div class="tab-content">
            <div class="medical-record-section">
              <div style="padding: 20px; color: #909399; text-align: center">
                暂无附件，敬请期待
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作面板 - 病历信息 -->
    <div v-if="activeTab === 'medical-record'" class="doctor-footer">
      <div class="footer-actions">
        <el-button
          v-show="canShowSaveBtn"
          type="primary"
          size="large"
          :disabled="!medicalRecordDirty"
          @click="handleSave"
        >
          保存
        </el-button>
        <el-button type="primary" size="large" @click="handlePrint">
          打印病历
        </el-button>
        <el-button
          type="primary"
          size="large"
          plain
          @click="handleSaveAsTemplate"
        >
          另存为病历模板
        </el-button>
      </div>
    </div>

    <!-- 底部操作面板 - 医嘱信息 -->
    <div v-if="activeTab === 'medical-order'" class="doctor-footer">
      <div class="footer-actions">
        <el-button
          v-show="canShowSaveBtn"
          type="primary"
          size="large"
          :disabled="!medicalOrderDirty"
          @click="handleSaveMedicalOrder"
        >
          保存
        </el-button>
        <el-dropdown trigger="click" @command="handlePrintCommand">
          <el-button type="primary" size="large">
            打印处方<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="current-no-price"
                >打印当前处方(不含金额)</el-dropdown-item
              >
              <el-dropdown-item command="current-with-price"
                >打印当前处方(含金额)</el-dropdown-item
              >
              <el-dropdown-item command="all-no-price"
                >打印全部处方(不含金额)</el-dropdown-item
              >
              <el-dropdown-item command="all-with-price"
                >打印全部处方(含金额)</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          type="primary"
          size="large"
          plain
          @click="handleSaveAsPrescriptionTemplate"
        >
          另存为处方模板
        </el-button>
        <el-button
          type="warning"
          size="large"
          :disabled="!canCharge"
          @click="handleCharge"
        >
          {{
            currentRegStatusFee === FeeStatus.UNPAID
              ? "完成缴费"
              : currentRegStatusFee || "收费"
          }}
        </el-button>
        <el-button
          type="warning"
          size="large"
          :disabled="!canEndVisit"
          @click="handleEndVisit"
        >
          {{
            currentRegStatus === RegistrationStatus.WAITING
              ? "完成接诊"
              : currentRegStatus || "结束就诊"
          }}
        </el-button>
      </div>
    </div>

    <!-- 历史病历弹窗 -->
    <HistoryMedicalRecord
      ref="historyMedicalRecordRef"
      :patient-id="basicInfoRef?.form.id"
      @confirm="onHistoryMedicalRecordConfirm"
    />

    <!-- 历史处方弹窗 -->
    <HistoryPrescription
      ref="historyPrescriptionRef"
      :patient-id="basicInfoRef?.form.id"
      @confirm="onHistoryPrescriptionConfirm"
    />

    <!-- 病历模板弹窗 -->
    <MedicalRecordTemplate
      ref="medicalRecordTemplateRef"
      @confirm="onMedicalTemplateConfirm"
    />

    <!-- 处方模板弹窗 -->
    <PrescriptionTemplate
      ref="prescriptionTemplateRef"
      :prescription-type="prescTypeRef"
      @confirm="onPrescriptionTemplateConfirm"
    />

    <!-- 附加费选择弹窗 -->
    <el-dialog
      v-model="addFeeDialogVisible"
      title="选择附加费"
      width="560px"
      align-center
    >
      <div v-if="availableAdditionalFees.length === 0" class="fee-empty">
        暂无可用附加费
      </div>
      <div v-else class="fee-select-list">
        <div
          v-for="fee in availableAdditionalFees"
          :key="fee.id"
          class="fee-select-item"
          :class="{ 'fee-select-item--active': isFeeAdded(fee) }"
          @click="toggleFee(fee)"
        >
          <div class="fee-item-left">
            <span class="fee-item-name">{{ fee.name }}</span>
            <span v-if="fee.common" class="fee-tag fee-tag--common">常用</span>
            <span v-if="fee.defaultAdd" class="fee-tag fee-tag--default"
              >默认</span
            >
          </div>
          <div class="fee-item-right">
            <span class="fee-item-price">¥{{ fee.sellingPrice }}</span>
            <el-icon v-if="isFeeAdded(fee)" class="fee-check-icon"
              ><Check
            /></el-icon>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="addFeeDialogVisible = false"
          >完成</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.doctor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;

  .doctor-basic-info {
    flex-shrink: 0;
    border-bottom: 2px solid #afc5fc;
    overflow: hidden;
  }

  .doctor-diagnosis-info {
    flex-shrink: 0;
    border-bottom: 2px solid #afc5fc;
    background: #fff;

    .section-title-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid #e4e7ed;
      background: #fafafa;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #f0f5ff;
      }

      .title-accent {
        display: inline-block;
        width: 4px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .title-text {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        flex-shrink: 0;
      }

      .diagnosis-hint {
        font-size: 13px;
        color: #409eff;
        margin-left: 4px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .collapse-arrow {
        margin-left: auto;
        flex-shrink: 0;
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid #909399;
        transition: transform 0.25s ease;

        &.collapsed {
          transform: rotate(-90deg);
        }
      }
    }

    .diagnosis-body {
      padding: 12px 16px;

      .diagnosis-input-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .diag-label {
          font-size: 13px;
          color: #606266;
          white-space: nowrap;
          min-width: 52px;
          text-align: right;
          flex-shrink: 0;
        }

        .diag-selector-wrap {
          flex: 1;
          min-width: 200px;
        }
      }

      .diagnosis-table {
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        overflow: hidden;

        .table-header {
          display: flex;
          background-color: #f5f7fa;
          padding: 8px 12px;
          font-weight: 600;
          color: #606266;
          font-size: 13px;

          .col-disease {
            flex: 1;
          }

          .col-action {
            width: 80px;
            text-align: center;
          }
        }

        .table-body {
          padding: 4px 12px;

          .empty-text {
            color: #909399;
            font-size: 14px;
            text-align: center;
            padding: 8px 0;
          }

          .diagnosis-row {
            display: flex;
            align-items: center;
            padding: 5px 0;
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
              width: 80px;
              text-align: center;
            }
          }
        }
      }
    }
  }

  .doctor-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;

    .tab-click-area {
      position: absolute;
      right: 0;
      top: 0;
      width: 300px;
      height: 48px;
      z-index: 10;
    }

    .doctor-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-tabs__header) {
        flex-shrink: 0;
        margin-bottom: 0;
        background-color: #fff;
        padding-left: 20px;
      }

      :deep(.el-tabs__content) {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      :deep(.el-tabs__content) {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      :deep(.el-tab-pane) {
        height: 100%;
        overflow: hidden;
        padding: 0;
      }
    }

    .tab-content {
      height: 100%;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      .medical-record-section,
      .medical-order-section {
        background-color: #fff;
        padding: 20px;

        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .title-bar {
            width: 4px;
            height: 18px;
            background-color: #409eff;
            margin-right: 8px;
            border-radius: 2px;
          }

          .title-text {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .medical-order-form {
          :deep(.el-form-item) {
            margin-bottom: 18px;
          }

          .form-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;

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

            &.prescription-row {
              align-items: flex-start;
            }

            .prescription-container {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;
            }

            .prescription-tabs-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background-color: #f5f7fa;
              border-bottom: 1px solid #e4e7ed;

              .prescription-tabs {
                display: flex;

                .tab-item {
                  padding: 10px 20px;
                  font-size: 14px;
                  color: #606266;
                  cursor: pointer;
                  transition: all 0.3s;

                  &:hover {
                    color: #409eff;
                  }

                  &.active {
                    background-color: #409eff;
                    color: #fff;
                  }
                }
              }

              .tabs-actions {
                display: flex;
                gap: 8px;
                padding-right: 12px;
              }
            }

            .fee-tag {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              background-color: #ecf5ff;
              border: 1px solid #b3d8ff;
              border-radius: 4px;
              font-size: 14px;
              color: #409eff;

              .el-icon {
                font-size: 12px;
                cursor: pointer;

                &:hover {
                  opacity: 0.8;
                }
              }
            }

            &.total-amount-row {
              .total-amount-label {
                font-size: 14px;
                color: #606266;
                margin-right: 20px;
              }

              .total-amount {
                font-size: 20px;
                font-weight: 700;
                color: #f56c6c;
              }
            }
          }
        }
      }
    }
  }

  .doctor-footer {
    flex-shrink: 0;
    background-color: #fff;
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);

    .footer-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        min-width: 120px;
        height: 40px;
        font-size: 16px;
      }
    }
  }
}
</style>

<style lang="scss">
.call-template-dialog {
  .el-dialog__body {
    padding: 16px 20px 0;
  }

  .template-search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .search-label {
      font-size: 14px;
      color: #606266;
      white-space: nowrap;
    }
  }

  .template-body {
    display: flex;
    border: 1px solid #e4e7ed;
    height: 400px;

    .template-list {
      width: 220px;
      flex-shrink: 0;
      border-right: 1px solid #e4e7ed;
      overflow-y: auto;

      .template-list-item {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 10px 14px;
        font-size: 13px;
        color: #303133;
        cursor: pointer;

        .item-icon {
          font-size: 14px;
          color: #909399;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .list-item-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;

          .list-item-time {
            font-size: 12px;
            white-space: nowrap;
          }

          .list-item-diag {
            font-size: 12px;
            opacity: 0.85;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.fee-empty {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.fee-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .fee-select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      background-color: #f0f7ff;
    }

    &--active {
      border-color: #409eff;
      background-color: #ecf5ff;
    }

    .fee-item-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .fee-item-name {
        font-size: 14px;
        color: #303133;
      }

      .fee-tag {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;

        &--common {
          background-color: #fdf6ec;
          color: #e6a23c;
          border: 1px solid #faecd8;
        }

        &--default {
          background-color: #ecf5ff;
          color: #409eff;
          border: 1px solid #d9ecff;
        }
      }
    }

    .fee-item-right {
      display: flex;
      align-items: center;
      gap: 8px;

      .fee-item-price {
        font-size: 16px;
        font-weight: 600;
        color: #f56c6c;
      }

      .fee-check-icon {
        color: #409eff;
        font-size: 18px;
      }
    }
  }
}
</style>
