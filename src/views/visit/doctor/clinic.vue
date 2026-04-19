<!--
  - 版权声明 Copyright (c) 2026。
  - 版权所有者： [缩微存储管理系统]
  - 首创日期： 2026年4月11日
  -->

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";

import { Close, Plus, Check } from "@element-plus/icons-vue";
import BqPatientBasicInfo from "@/components/BqPatientBasicInfo";
import { BqDiagnosisSelector } from "@/components/BqDiagnosisSelector";
import {
  BqMedicineSelector,
  type MedicineItem
} from "@/components/BqMedicineSelector";
import { BqExamineItemSelector } from "@/components/BqExamineItemSelector";
import { BqTreatmentItemSelector } from "@/components/BqTreatmentItemSelector";
import type { BQExamineItemEntityType } from "@/api/pharmacy/examine";
import type { BQTreatmentItemEntityType } from "@/api/pharmacy/treatment";
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
  type BqAdditionalFeeEntityType
} from "@/api/visit/clinic";
import type { BQDiagnosisDictEntityType } from "@/api/visit/diagnosis";
import {
  saveRegistrationApi,
  getRegistrationByIdApi,
  updateRegistrationApi,
  RegistrationStatus,
  FeeStatus
} from "@/api/visit/register";
import type { BQMedicalRecordTemplateEntityType } from "@/api/cm/medicalRecordTemplate";
import type { BQPrescriptionTemplateDetailEntityType } from "@/api/cm/prescriptionTemplate";
import { ElMessage, ElMessageBox } from "element-plus";
import HistoryMedicalRecord from "./comp/HistoryMedicalRecord.vue";
import MedicalRecordTemplate from "./comp/MedicalRecordTemplate.vue";
import HistoryPrescription from "./comp/HistoryPrescription.vue";
import PrescriptionTemplate from "./comp/PrescriptionTemplate.vue";
import { useRoute } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "DoctorWorkbench"
});

// 获取路由传参
const route = useRoute();
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
const currentRegStatus = ref<string>("");
const currentRegStatusFee = ref<string>("");

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

  // 没有患者ID时，根据患者信息创建患者并持久化
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

  // 已有挂号ID直接返回
  if (currentRegId.value) {
    return { patientId, regId: currentRegId.value };
  }

  // 没有挂号ID时，根据患者信息生成挂号记录并设为接诊中（已接诊）
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

// ==================== 患者选择回调（同一时间同一医生只允许接诊一个患者）====================
const onPatientSelect = async (user: any) => {
  if (currentRegId.value) {
    try {
      await ElMessageBox.confirm(
        "当前已有正在接诊的患者，是否结束当前就诊并接诊新患者？",
        "提示",
        { confirmButtonText: "确认", cancelButtonText: "取消", type: "warning" }
      );
      // 结束就诊成功后，清空当前接诊状态和处方数据
      clearClinicCache();
      currentRegId.value = undefined;
      currentMedicalRecordId.value = undefined;
      // 清空所有处方类型的处方组ID
      Object.values(medicalOrderForm.prescriptionData).forEach(typeData => {
        typeData.groups.forEach(g => (g.prescId = undefined));
      });
      medicalRecordForm.diagnoses = [];
      ElMessage.success("已结束就诊");
    } catch {
      return;
    }
  }

  // 将患者历史信息同步到病历表单
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

// 基本信息组件保存事件：将修改的患者信息持久化到后端
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
const medicalRecordFormRef = ref();
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

// ==================== 诊断选择 ====================
const diagnosisInputValue = ref("");

const handleDiagnosisSelect = (diagnosis: BQDiagnosisDictEntityType) => {
  const exists = medicalRecordForm.diagnoses.some(d => d.id === diagnosis.id);
  if (!exists) {
    medicalRecordForm.diagnoses.push(diagnosis);
  }
  diagnosisInputValue.value = "";
};

const removeDiagnosis = (index: number) => {
  medicalRecordForm.diagnoses.splice(index, 1);
};

// 医嘱中的诊断（从病历同步，两个页签共享同一份）
const medicalOrderDiagnoses = computed(() => medicalRecordForm.diagnoses);

// ==================== 历史病历弹窗组件 ====================
const historyMedicalRecordRef = ref<InstanceType<typeof HistoryMedicalRecord>>();

const handleViewHistory = () => {
  if (!basicInfoRef.value?.form.id) {
    ElMessage.warning("请先选择患者");
    return;
  }
  historyMedicalRecordRef.value?.open();
};

// ==================== 历史处方弹窗组件 ====================
const historyPrescriptionRef = ref<InstanceType<typeof HistoryPrescription>>();

const handleViewPrescriptionHistory = () => {
  if (!basicInfoRef.value?.form.id) {
    ElMessage.warning("请先选择患者");
    return;
  }
  historyPrescriptionRef.value?.open();
};

// ==================== 病历模板弹窗组件 ====================
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

// ==================== 处方模板弹窗组件 ====================
const prescriptionTemplateRef =
  ref<InstanceType<typeof PrescriptionTemplate>>();

const handleCallTemplate = () => {
  prescriptionTemplateRef.value?.open();
};

const onPrescriptionTemplateConfirm = (
  details: BQPrescriptionTemplateDetailEntityType[]
) => {
  const items: PrescriptionItem[] = details.map(d => {
    const unitId = d.quantityUnit ?? undefined;
    const price = parseFloat(String(d.price ?? "").replace(/[^\d.]/g, "")) || 0;
    return {
      itemId: d.drugId ? Number(d.drugId) : undefined,
      itemType: 1,
      itemName: d.drugName || "",
      spec: d.specification || "",
      unitId: unitId ?? getUnitId(d.unit),
      unit: getUnitName(unitId) || d.unit || "",
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
      entrust: "",
      price,
      totalPrice: 0
    };
  });
  const currentData = getCurrentPrescriptionData();
  if (currentData.groups[currentData.currentGroup]) {
    currentData.groups[currentData.currentGroup].items = items;
  }
};

// ==================== 药品选择 ====================
const categoryToItemType = (category: MedicineItem["category"]): number => {
  if (category === "exam") return 2;
  if (category === "treatment") return 3;
  return 1;
};

// ==================== 医嘱信息表单 ====================
const medicalOrderFormRef = ref();

type PrescriptionItem = {
  id?: number;
  itemId?: number;
  itemType: number; // 1药品 2检查 3处置
  itemName: string;
  spec: string;
  unit: string;
  unitId?: number;
  priceUnit?: string;
  priceUnitId?: number;
  singleDosage: string;
  useWay: string;
  frequency: string;
  time: number;
  days: number;
  totalNum: number;
  entrust: string;
  price: number;
  totalPrice: number;
};

type PrescriptionGroup = {
  name: string;
  prescType: number; // 1西 2中 3检查 4处置
  prescId?: number; // 已持久化的处方主表ID
  items: PrescriptionItem[];
};

// 每种处方类型的数据结构
type PrescriptionTypeData = {
  groups: PrescriptionGroup[];
  currentGroup: number;
};

const medicalOrderForm = reactive({
  prescriptionType: "western",
  // 每种处方类型独立维护自己的处方组列表
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

// 医疗字典数据（用法列表，dictType=1；频率列表，dictType=2；单位列表，dictType=3）
const usageOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const frequencyOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const unitOptions = ref<BQMedicalDictionaryEntityType[]>([]);

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

// 获取当前处方类型的处方组数据
const getCurrentPrescriptionData = () => {
  return medicalOrderForm.prescriptionData[medicalOrderForm.prescriptionType];
};

const prescriptionTabs = ref([
  { label: "西/成药处方", value: "western", prescType: 1 },
  { label: "中药处方", value: "chinese", prescType: 2 },
  { label: "检查检验项目", value: "exam", prescType: 3 },
  { label: "处置项目", value: "treatment", prescType: 4 }
]);

const handleAddDrug = (medicine: MedicineItem) => {
  const currentData = getCurrentPrescriptionData();
  const group = currentData.groups[currentData.currentGroup];
  if (!group) return;
  group.items.push({
    itemType: categoryToItemType(medicine.category),
    itemName: medicine.name,
    spec: medicine.spec,
    unit: "",
    unitId: undefined,
    priceUnit: "",
    priceUnitId: undefined,
    singleDosage: "",
    useWay: "",
    frequency: "",
    time: 1,
    days: 7,
    totalNum: 0,
    entrust: "",
    price: parseFloat(medicine.price || "0") || 0,
    totalPrice: 0
  });
};

const handleAddExamItem = (item: BQExamineItemEntityType) => {
  const currentData = medicalOrderForm.prescriptionData["exam"];
  const group = currentData.groups[currentData.currentGroup];
  if (!group) return;
  group.items.push({
    itemType: 2,
    itemName: item.name ?? "",
    spec: "1次",
    unit: "",
    unitId: undefined,
    priceUnit: "",
    priceUnitId: undefined,
    singleDosage: "",
    useWay: "",
    frequency: "",
    time: 1,
    days: 1,
    totalNum: 0,
    entrust: "",
    price: parseFloat(item.sellingPrice || "0") || 0,
    totalPrice: 0
  });
};

const handleAddTreatmentItem = (item: BQTreatmentItemEntityType) => {
  const currentData = medicalOrderForm.prescriptionData["treatment"];
  const group = currentData.groups[currentData.currentGroup];
  if (!group) return;
  group.items.push({
    itemType: 3,
    itemName: item.name ?? "",
    spec: "1次",
    unit: "",
    unitId: undefined,
    priceUnit: "",
    priceUnitId: undefined,
    singleDosage: "",
    useWay: "",
    frequency: "",
    time: 1,
    days: 1,
    totalNum: 0,
    entrust: "",
    price: parseFloat(item.sellingPrice || "0") || 0,
    totalPrice: 0
  });
};

// 自动计算计价总量：单次用量 × 频率次数 × 天数
const calculateTotalNum = (item: PrescriptionItem) => {
  if (!item.singleDosage || !item.days) {
    item.totalNum = 0;
    return;
  }

  const singleDosage = parseFloat(item.singleDosage);
  if (isNaN(singleDosage)) {
    item.totalNum = 0;
    return;
  }

  const freqPatterns: [RegExp, number][] = [
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
  const matched = freqPatterns.find(([re]) => re.test(item.frequency));
  const timesPerDay = matched ? matched[1] : 1;
  item.time = timesPerDay;

  item.totalNum = Number((singleDosage * timesPerDay * item.days).toFixed(2));
  recalcItemPrice(item);
};

const getItemPriceUnit = (item: PrescriptionItem): string => {
  if (item.priceUnit) return item.priceUnit;
  if (item.spec) {
    const m = item.spec.match(/[/／]([^/／]+)$/);
    if (m) return m[1].trim();
    const m2 = item.spec.match(/([\u4e00-\u9fa5]+)$/);
    if (m2) return m2[1];
  }
  return item.unit || "";
};

const recalcItemPrice = (item: PrescriptionItem) => {
  item.totalPrice = parseFloat(
    ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
  );
};

const handleUnitChange = (item: PrescriptionItem) => {
  const opt = unitOptions.value.find(o => o.id === item.unitId);
  item.unit = opt?.name ?? "";
};

const removePrescriptionItem = (groupIndex: number, itemIndex: number) => {
  const currentData = getCurrentPrescriptionData();
  currentData.groups[groupIndex]?.items.splice(itemIndex, 1);
};

const addPrescriptionGroup = () => {
  const currentData = getCurrentPrescriptionData();
  const prescType = getPrescTypeByTab(medicalOrderForm.prescriptionType);
  const prefix =
    medicalOrderForm.prescriptionType === "exam" ||
    medicalOrderForm.prescriptionType === "treatment"
      ? "项目"
      : "处方";
  currentData.groups.push({
    name: `${prefix}${currentData.groups.length + 1}`,
    prescType,
    items: []
  });
  currentData.currentGroup = currentData.groups.length - 1;
};

const removePrescriptionGroup = (index: number) => {
  const currentData = getCurrentPrescriptionData();
  if (currentData.groups.length > 1) {
    currentData.groups.splice(index, 1);
    if (currentData.currentGroup >= currentData.groups.length) {
      currentData.currentGroup = currentData.groups.length - 1;
    }
  }
};

const getPrescTypeByTab = (tab: string): number => {
  const map: Record<string, number> = {
    western: 1,
    chinese: 2,
    exam: 3,
    treatment: 4
  };
  return map[tab] || 1;
};

const prescTypeRef = computed(() =>
  getPrescTypeByTab(medicalOrderForm.prescriptionType)
);

const getPrescriptionAmount = () => {
  const currentData = getCurrentPrescriptionData();
  const group = currentData.groups[currentData.currentGroup];
  if (!group) return 0;
  return group.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

// ==================== 自动计算处方项目小计价格 ====================
// 监听所有处方类型的所有处方组的项目变化，自动计算 totalPrice = price * totalNum
watch(
  () => medicalOrderForm.prescriptionData,
  newData => {
    Object.values(newData).forEach(typeData => {
      typeData.groups.forEach(group => {
        group.items.forEach(item => {
          // 自动计算小计：单价 × 数量
          item.totalPrice = parseFloat(
            ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
          );
        });
      });
    });
  },
  { deep: true }
);

// ==================== 附加费 ====================
const availableAdditionalFees = ref<BqAdditionalFeeEntityType[]>([]);
const addFeeDialogVisible = ref(false);

const loadAdditionalFees = async () => {
  try {
    const res = await getAdditionalFeeListApi();
    if (res?.data) {
      availableAdditionalFees.value = res.data as BqAdditionalFeeEntityType[];
      // 默认添加项自动填入（仅首次）
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

// 列表中是否已选
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
  }
};

const handleAddFee = () => {
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

  // 遍历所有处方类型的所有处方组计算总金额
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

// ==================== 保存病历（持久化到 bq_medical_record 表）====================
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
    .map(d => d.id)
    .filter(Boolean)
    .join(",");
  const diagnosisText = medicalRecordForm.diagnoses
    .map(d => d.diagnosisName)
    .join("，");

  const payload: Partial<BqMedicalRecordEntityType> = {
    patientId,
    regId: currentRegId.value,
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

// ==================== 构造医嘱 DTO（收集所有非空处方组）====================
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
          useWay: item.useWay,
          frequency: item.frequency,
          days: item.days,
          totalNum: item.totalNum,
          entrust: item.entrust,
          price: item.price,
          totalPrice: item.totalPrice
        }))
      });
    });
  }

  return { groupRefs, prescriptions };
};

const applyMedicalOrderResult = (
  result: { patientId: number; regId: number; prescIds: (number | null)[] },
  groupRefs: GroupRef[]
) => {
  const form = basicInfoRef.value?.form;
  if (form && !form.id && result.patientId) form.id = result.patientId;
  if (!currentRegId.value && result.regId) currentRegId.value = result.regId;
  result.prescIds?.forEach((prescId, idx) => {
    if (prescId == null) return;
    const { typeKey, gi } = groupRefs[idx];
    medicalOrderForm.prescriptionData[typeKey].groups[gi].prescId = prescId;
  });
};

// ==================== 同步患者信息到数据库 ====================
const syncPatientInfo = async () => {
  const form = basicInfoRef.value?.form;
  if (!form?.id) return;
  const payload: BqPatientEntityType = {
    id: form.id,
    name: form.name,
    gender: form.gender,
    idCard: form.idCard,
    mobile: form.mobile,
    province: form.province ?? undefined,
    city: form.city ?? undefined,
    district: form.district ?? undefined,
    address: form.address,
    isAllergy: form.isAllergy,
    allergicHistory: form.allergicHistory,
    firstAge: form.firstAge,
    lastAge: form.lastAge,
    ageType: form.ageType
  };
  await updatePatientApi(payload);
};

// ==================== 按钮状态计算 ====================
const canShowSaveBtn = computed(
  () =>
    (currentRegStatus.value === RegistrationStatus.WAITING &&
      currentRegStatusFee.value === FeeStatus.UNPAID) ||
    !currentRegStatus.value ||
    !currentRegStatusFee.value
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
    await syncPatientInfo();
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
    const res = await saveMedicalOrderApi({
      patientId: form.id || undefined,
      patientName: form.name,
      gender: form.gender,
      firstAge: form.firstAge,
      lastAge: form.lastAge,
      ageType: form.ageType,
      idCard: form.idCard,
      mobile: form.mobile,
      province: form.province ?? undefined,
      city: form.city ?? undefined,
      district: form.district ?? undefined,
      address: form.address,
      isAllergy: form.isAllergy,
      allergicHistory: form.allergicHistory,
      regId: currentRegId.value || undefined,
      isFirstVisit: form.isFirstVisit,
      recordId: currentMedicalRecordId.value || undefined,
      prescriptions
    });
    if (res?.data) {
      applyMedicalOrderResult(res.data, groupRefs);
      ElMessage.success("保存成功");
    }
  } catch {
    ElMessage.error("保存失败");
  }
};

const handlePrint = () => {
  ElMessage.info("打印病历");
};

const handleSaveAsTemplate = () => {
  ElMessage.info("另存为病历模板");
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
    await syncPatientInfo();
    ElMessage.success("提交成功");
  } catch {
    ElMessage.error("提交失败");
  }
};

const handlePrintPrescription = async () => {
  const form = basicInfoRef.value?.form;
  const { groupRefs, prescriptions } = collectPrescriptionGroups();

  // 1. 有处方数据时先保存（确保最新数据落库）
  if (prescriptions.length > 0) {
    if (!form?.name?.trim()) {
      ElMessage.warning("请先填写患者基本信息");
      return;
    }
    try {
      const res = await saveMedicalOrderApi({
        patientId: form.id || undefined,
        patientName: form.name,
        gender: form.gender,
        firstAge: form.firstAge,
        lastAge: form.lastAge,
        ageType: form.ageType,
        idCard: form.idCard,
        mobile: form.mobile,
        province: form.province ?? undefined,
        city: form.city ?? undefined,
        district: form.district ?? undefined,
        address: form.address,
        isAllergy: form.isAllergy,
        allergicHistory: form.allergicHistory,
        regId: currentRegId.value || undefined,
        isFirstVisit: form.isFirstVisit,
        recordId: currentMedicalRecordId.value || undefined,
        prescriptions
      });
      if (res?.data) {
        applyMedicalOrderResult(res.data, groupRefs);
      } else {
        ElMessage.error("保存医嘱失败，无法打印");
        return;
      }
    } catch {
      ElMessage.error("保存失败，无法打印");
      return;
    }
  }

  const regId = currentRegId.value;
  if (!regId) {
    ElMessage.warning("暂无处方信息，请先录入并保存");
    return;
  }

  // 2. 询问是否包含处方金额
  let showPrice = true;
  try {
    await ElMessageBox.confirm("打印处方是否包含处方金额？", "打印选项", {
      confirmButtonText: "包含金额",
      cancelButtonText: "不含金额",
      distinguishCancelAndClose: true,
      type: "info"
    });
  } catch (action) {
    if (action === "cancel") {
      showPrice = false;
    } else {
      return; // 关闭弹窗，取消打印
    }
  }

  // 3. 获取PDF并打开打印预览
  try {
    const blob = await printPrescriptionPdfApi(regId, showPrice);
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

const handleSaveAsPrescriptionTemplate = () => {
  ElMessage.info("另存为处方模板");
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

// ==================== 加载医疗字典数据（用法列表）====================
const loadUsageDictionary = async () => {
  try {
    const res = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "1")] // dictType=1 表示用法
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
      filters: [new BQSearchFilter("dictType", "eq", "2")] // dictType=2 表示频率
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
      filters: [new BQSearchFilter("dictType", "eq", "3")] // dictType=3 表示单位
    });
    if (res.code === 0 && res.data) {
      unitOptions.value = res.data.filter((item: any) => item.status !== false);
    }
  } catch (error) {
    console.error("加载单位字典失败:", error);
  }
};

// ==================== 根据路由参数或本地缓存加载患者/病历/处方数据 ====================
const loadFromRoute = async () => {
  let loadRegId: number;
  let loadPatientId: number;

  if (routeRegId && routePatientId) {
    // 从接诊页面跳转过来：使用路由参数并写入本地缓存
    loadRegId = Number(routeRegId);
    loadPatientId = Number(routePatientId);
    saveClinicCache(loadRegId, loadPatientId);
  } else {
    // 无路由参数：尝试从本地缓存恢复
    const cached = loadClinicCache();
    if (!cached) return;
    loadRegId = cached.regId;
    loadPatientId = cached.patientId;
  }

  // 1. 加载患者信息并回填基本信息
  try {
    const patientRes = await getPatientByIdApi(loadPatientId);
    if (patientRes?.data) {
      basicInfoRef.value?.selectPatient(patientRes.data);
    }
  } catch {
    ElMessage.error("加载患者信息失败");
    return;
  }

  // 2. 缓存挂号ID及状态
  currentRegId.value = loadRegId;
  try {
    const regRes = await getRegistrationByIdApi(loadRegId);
    if (regRes?.data) {
      currentRegStatus.value = regRes.data.status ?? "";
      currentRegStatusFee.value = regRes.data.statusFee ?? "";
    }
  } catch {}

  // 3. 加载病历
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
    }
  } catch {}

  // 4. 加载处方及明细
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
      // 清空默认空组
      Object.values(medicalOrderForm.prescriptionData).forEach(td => {
        td.groups = [];
      });
      for (const full of fullList) {
        const presc = full.prescription;
        const typeKey = typeKeyMap[presc.prescType as number] ?? "western";
        const typeData = medicalOrderForm.prescriptionData[typeKey];
        typeData.groups.push({
          name: presc.groupNo ?? `处方${typeData.groups.length + 1}`,
          prescType: presc.prescType as number,
          prescId: presc.id,
          items: (full.items ?? []).map((item: any) => ({
            id: item.id,
            itemId: item.itemId,
            itemType: item.itemType ?? 1,
            itemName: item.itemName ?? "",
            spec: item.spec ?? "",
            unit: item.unit || getUnitName(item.unitId),
            unitId: item.unitId ? Number(item.unitId) : getUnitId(item.unit),
            priceUnit: item.priceUnit || getUnitName(item.priceUnitId),
            priceUnitId: item.priceUnitId
              ? Number(item.priceUnitId)
              : getUnitId(item.priceUnit),
            singleDosage: item.singleDosage ?? "",
            useWay: item.useWay ?? "",
            frequency: item.frequency ?? "",
            time: 1,
            days: item.days ?? 0,
            totalNum: Number(item.totalNum ?? 0),
            entrust: item.entrust ?? "",
            price: Number(item.price ?? 0),
            totalPrice: Number(item.totalPrice ?? 0)
          }))
        });
        typeData.currentGroup = 0;
      }
      // 补回空组（每种类型至少保留一个组）
      Object.entries(medicalOrderForm.prescriptionData).forEach(([key, td]) => {
        if (td.groups.length === 0) {
          const prescType =
            { western: 1, chinese: 2, exam: 3, treatment: 4 }[key] ?? 1;
          const prefix =
            key === "exam" || key === "treatment" ? "项目" : "处方";
          td.groups.push({ name: `${prefix}1`, prescType, items: [] });
        }
      });
    }
  } catch {}
};

// ==================== Lifecycle ====================
onMounted(async () => {
  await loadAdditionalFees();
  await loadUsageDictionary();
  await loadFrequencyDictionary();
  await loadUnitDictionary();
  await loadFromRoute();
});
</script>

<template>
  <div class="doctor-container">
    <!-- 基本信息区：独立于页签之外，所有页签共用同一份患者数据 -->
    <div class="doctor-basic-info">
      <BqPatientBasicInfo
        ref="basicInfoRef"
        @user-select="onPatientSelect"
        @save="onBasicInfoSave"
      />
    </div>

    <!-- 页签内容区 -->
    <div class="doctor-content">
      <el-tabs v-model="activeTab" class="doctor-tabs">
        <!-- 病历信息 -->
        <el-tab-pane label="病历信息" name="medical-record">
          <div class="tab-content">
            <div class="medical-record-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">病历信息</span>
              </div>

              <el-form
                ref="medicalRecordFormRef"
                :model="medicalRecordForm"
                label-width="100px"
                class="medical-record-form"
              >
                <!-- 主诉 -->
                <el-form-item label="主诉" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.chiefComplaint"
                    class="form-input-full"
                  />
                  <el-button type="primary" @click="handleViewHistory">
                    历史病历
                  </el-button>
                  <el-button type="primary" @click="handleCallMedicalTemplate">
                    调用病历模板
                  </el-button>
                </el-form-item>

                <!-- 现病史 -->
                <el-form-item label="现病史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.presentIllness"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 既往史 -->
                <el-form-item label="既往史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.pastHistory"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 过敏史 -->
                <el-form-item label="过敏史" class="form-row">
                  <el-radio-group
                    v-model="medicalRecordForm.allergyHistory"
                    class="inline-radio"
                  >
                    <el-radio :value="1">是</el-radio>
                    <el-radio :value="0">否认</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 过敏详情 -->
                <el-form-item
                  v-if="medicalRecordForm.allergyHistory === 1"
                  class="form-row"
                >
                  <el-input
                    v-model="medicalRecordForm.allergyDetail"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入过敏详情"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 个人史 -->
                <el-form-item label="个人史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.personalHistory"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 婚育史 -->
                <el-form-item label="婚育史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.marriageHistory"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 家族史 -->
                <el-form-item label="家族史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.familyHistory"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 旅行史 -->
                <el-form-item label="旅行史" class="form-row label-red">
                  <el-input
                    v-model="medicalRecordForm.travelHistory"
                    type="textarea"
                    :rows="2"
                    class="form-textarea"
                  />
                </el-form-item>

                <!-- 接触史 -->
                <el-form-item label="接触史" class="form-row label-red">
                  <el-input
                    v-model="medicalRecordForm.contactHistory"
                    type="textarea"
                    :rows="2"
                    class="form-textarea"
                  />
                </el-form-item>

                <!-- 体格检查 -->
                <el-form-item label="体格检查" class="form-row">
                  <span class="exam-label">体温/T</span>
                  <el-input
                    v-model="medicalRecordForm.temperature"
                    type="number"
                    class="exam-input"
                  />
                  <span class="exam-unit">°C</span>

                  <span class="exam-label">心率/P</span>
                  <el-input
                    v-model="medicalRecordForm.heartRate"
                    type="number"
                    class="exam-input"
                  />
                  <span class="exam-unit">次/分</span>

                  <span class="exam-label">呼吸/R</span>
                  <el-input
                    v-model="medicalRecordForm.respiration"
                    type="number"
                    class="exam-input"
                  />
                  <span class="exam-unit">次/分</span>

                  <span class="exam-label">血压</span>
                  <el-input
                    v-model="medicalRecordForm.bloodPressureSystolic"
                    type="number"
                    class="exam-input-small"
                  />
                  <span class="exam-divider">/</span>
                  <el-input
                    v-model="medicalRecordForm.bloodPressureDiastolic"
                    type="number"
                    class="exam-input-small"
                  />
                  <span class="exam-unit">mmHg</span>
                </el-form-item>

                <!-- 其他检查 -->
                <el-form-item label="其他检查" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.otherExamination"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 输入诊断 -->
                <el-form-item label="输入诊断" class="form-row">
                  <BqDiagnosisSelector
                    v-model="diagnosisInputValue"
                    placeholder="输入诊断编码/名称/拼音搜索"
                    @select="handleDiagnosisSelect"
                  />
                </el-form-item>

                <!-- 诊断列表 -->
                <el-form-item label="诊断" class="form-row">
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
                          <span class="diag-code">{{
                            diag.diagnosisCode
                          }}</span>
                        </div>
                        <div class="col-action">
                          <el-button
                            type="danger"
                            link
                            size="small"
                            @click="removeDiagnosis(idx)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 治疗建议 -->
                <el-form-item label="治疗建议" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.treatmentAdvice"
                    class="form-input-full"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 医嘱信息 -->
        <el-tab-pane label="医嘱信息" name="medical-order">
          <div class="tab-content">
            <div class="medical-order-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">医嘱信息</span>
              </div>

              <el-form
                ref="medicalOrderFormRef"
                :model="medicalOrderForm"
                label-width="100px"
                class="medical-order-form"
              >
                <!-- 诊断（从病历信息页签同步） -->
                <el-form-item label="诊断" class="form-row">
                  <div class="diagnosis-table">
                    <div class="table-header">
                      <div class="col-disease">疾病诊断</div>
                      <div class="col-action">操作</div>
                    </div>
                    <div class="table-body">
                      <div
                        v-if="medicalOrderDiagnoses.length === 0"
                        class="empty-text"
                      >
                        暂无诊断（请在病历信息中添加）
                      </div>
                      <div
                        v-for="(diag, idx) in medicalOrderDiagnoses"
                        :key="diag.id"
                        class="diagnosis-row"
                      >
                        <div class="col-disease">
                          {{ diag.diagnosisName }}
                          <span class="diag-code">{{
                            diag.diagnosisCode
                          }}</span>
                        </div>
                        <div class="col-action">
                          <el-button
                            type="danger"
                            link
                            size="small"
                            @click="removeDiagnosis(idx)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-form-item>

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

                    <!-- 每种处方类型的独立容器 -->
                    <div
                      v-for="tab in prescriptionTabs"
                      v-show="medicalOrderForm.prescriptionType === tab.value"
                      :key="tab.value"
                      class="prescription-type-content"
                    >
                      <!-- 处方组标签 + 添加按钮 -->
                      <div class="prescription-group-header">
                        <div class="group-tags">
                          <span
                            v-for="(group, index) in medicalOrderForm
                              .prescriptionData[tab.value].groups"
                            :key="index"
                            :class="[
                              'group-tag',
                              {
                                active:
                                  medicalOrderForm.prescriptionData[tab.value]
                                    .currentGroup === index
                              }
                            ]"
                            @click="
                              medicalOrderForm.prescriptionData[
                                tab.value
                              ].currentGroup = index
                            "
                          >
                            {{ group.name }}
                            <el-icon
                              v-if="
                                medicalOrderForm.prescriptionData[tab.value]
                                  .groups.length > 1
                              "
                              @click.stop="removePrescriptionGroup(index)"
                              ><Close
                            /></el-icon>
                          </span>
                          <span
                            class="add-group-btn"
                            @click="addPrescriptionGroup"
                          >
                            <el-icon><Plus /></el-icon>
                          </span>
                        </div>
                      </div>

                      <!-- 药品/项目选择 -->
                      <div class="drug-search-row">
                        <BqMedicineSelector
                          v-if="
                            tab.value === 'western' || tab.value === 'chinese'
                          "
                          placeholder="输入药品名称搜索并选择"
                          class="drug-search-select"
                          @select="handleAddDrug"
                        />
                        <BqExamineItemSelector
                          v-else-if="tab.value === 'exam'"
                          placeholder="输入检查检验项目名称搜索并选择"
                          class="drug-search-select"
                          @select="handleAddExamItem"
                        />
                        <BqTreatmentItemSelector
                          v-else-if="tab.value === 'treatment'"
                          placeholder="输入处置项目名称搜索并选择"
                          class="drug-search-select"
                          @select="handleAddTreatmentItem"
                        />
                      </div>

                      <!-- 处方明细表格 -->
                      <div class="prescription-table">
                        <div class="table-header">
                          <div class="col-operation">操作</div>
                          <div class="col-group">序号</div>
                          <div class="col-name">药品名称</div>
                          <div class="col-spec">规格</div>
                          <div class="col-dosage">单次用量</div>
                          <div class="col-unit">单位</div>
                          <div class="col-usage">用法</div>
                          <div class="col-frequency">频率</div>
                          <div class="col-days">天数</div>
                          <div class="col-total">计价总量</div>
                          <div class="col-note">嘱托</div>
                          <div class="col-price">单价(元)/计价单位</div>
                          <div class="col-amount">金额(元)</div>
                        </div>
                        <div class="table-body">
                          <div
                            v-if="
                              !medicalOrderForm.prescriptionData[tab.value]
                                ?.groups[
                                medicalOrderForm.prescriptionData[tab.value]
                                  .currentGroup
                              ]?.items?.length
                            "
                            class="empty-text"
                          >
                            暂无药品，请搜索添加
                          </div>
                          <div
                            v-for="(item, itemIdx) in medicalOrderForm
                              .prescriptionData[tab.value]?.groups[
                              medicalOrderForm.prescriptionData[tab.value]
                                .currentGroup
                            ]?.items"
                            :key="itemIdx"
                            class="prescription-item-row"
                          >
                            <div class="col-operation">
                              <el-button
                                type="danger"
                                link
                                size="small"
                                @click="
                                  removePrescriptionItem(
                                    medicalOrderForm.prescriptionData[tab.value]
                                      .currentGroup,
                                    itemIdx
                                  )
                                "
                              >
                                <el-icon><Close /></el-icon>
                              </el-button>
                            </div>
                            <div class="col-group">{{ itemIdx + 1 }}</div>
                            <div class="col-name">{{ item.itemName }}</div>
                            <div class="col-spec">{{ item.spec }}</div>
                            <div class="col-dosage">
                              <el-input
                                v-model="item.singleDosage"
                                size="small"
                                style="width: 100%"
                                @input="calculateTotalNum(item)"
                              />
                            </div>
                            <div class="col-unit">
                              <el-select
                                v-model="item.unitId"
                                size="small"
                                style="width: 100%"
                                placeholder="单位"
                                clearable
                                @change="handleUnitChange(item)"
                              >
                                <el-option
                                  v-for="opt in unitOptions"
                                  :key="opt.id"
                                  :label="opt.name"
                                  :value="opt.id"
                                />
                              </el-select>
                            </div>
                            <div class="col-usage">
                              <el-select
                                v-model="item.useWay"
                                size="small"
                                style="width: 100%"
                                placeholder="用法"
                                clearable
                              >
                                <el-option
                                  v-for="opt in usageOptions"
                                  :key="opt.id"
                                  :label="opt.name"
                                  :value="opt.name"
                                />
                              </el-select>
                            </div>
                            <div class="col-frequency">
                              <el-select
                                v-model="item.frequency"
                                size="small"
                                style="width: 100%"
                                placeholder="频率"
                                clearable
                                @change="calculateTotalNum(item)"
                              >
                                <el-option
                                  v-for="opt in frequencyOptions"
                                  :key="opt.id"
                                  :label="opt.name"
                                  :value="opt.name"
                                />
                              </el-select>
                            </div>
                            <div class="col-days">
                              <el-input
                                v-model.number="item.days"
                                size="small"
                                type="number"
                                :min="1"
                                style="width: 100%"
                                @change="calculateTotalNum(item)"
                              />
                            </div>
                            <div class="col-total">
                              <el-input
                                v-model.number="item.totalNum"
                                size="small"
                                style="width: 100%"
                                type="number"
                                min="0"
                                @input="recalcItemPrice(item)"
                              />
                            </div>
                            <div class="col-note">
                              <el-input
                                v-model="item.entrust"
                                size="small"
                                style="width: 100%"
                              />
                            </div>
                            <div class="col-price">
                              <el-input
                                v-model.number="item.price"
                                size="small"
                                type="number"
                                min="0"
                                @input="recalcItemPrice(item)"
                              />
                              <span
                                v-if="getItemPriceUnit(item)"
                                class="price-unit-label"
                                >/{{ getItemPriceUnit(item) }}</span
                              >
                            </div>
                            <div class="col-amount">
                              {{ (item.totalPrice || 0).toFixed(2) }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 处方金额 -->
                      <div class="prescription-amount">
                        处方金额：¥ {{ getPrescriptionAmount().toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 附加费用 -->
                <el-form-item label="附加费用" class="form-row">
                  <el-button type="primary" @click="handleAddFee">
                    <el-icon><Plus /></el-icon>
                    点击添加
                  </el-button>
                  <span
                    v-for="(fee, index) in medicalOrderForm.additionalFees"
                    :key="index"
                    class="fee-tag"
                  >
                    {{ fee.name }} {{ fee.amount }}元
                    <el-icon @click="removeFee(index)"><Close /></el-icon>
                  </span>
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
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">附件管理</span>
              </div>
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
          @click="handleSaveMedicalOrder"
        >
          保存
        </el-button>
        <el-button type="primary" size="large" @click="handlePrintPrescription">
          打印处方
        </el-button>
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

    <!-- 历史病历弹窗组件 -->
    <HistoryMedicalRecord
      ref="historyMedicalRecordRef"
      :patient-id="basicInfoRef?.form.id"
    />

    <!-- 历史处方弹窗组件 -->
    <HistoryPrescription
      ref="historyPrescriptionRef"
      :patient-id="basicInfoRef?.form.id"
    />

    <!-- 病历模板弹窗组件 -->
    <MedicalRecordTemplate
      ref="medicalRecordTemplateRef"
      @confirm="onMedicalTemplateConfirm"
    />

    <!-- 处方模板弹窗组件 -->
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

  .doctor-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;

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

        .medical-record-form,
        .medical-order-form {
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

            .diagnosis-select {
              width: 280px;
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

            .prescription-type-content {
              background-color: #fff;
              padding: 16px;

              .prescription-group-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;

                .group-tags {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .group-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background-color: #f5f7fa;
                    border: 1px solid #e4e7ed;
                    border-radius: 4px;
                    font-size: 14px;
                    color: #606266;
                    cursor: pointer;
                    transition: all 0.3s;

                    &:hover {
                      border-color: #409eff;
                      color: #409eff;
                    }

                    &.active {
                      background-color: #409eff;
                      border-color: #409eff;
                      color: #fff;
                    }
                  }

                  .add-group-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: 1px dashed #409eff;
                    border-radius: 4px;
                    color: #409eff;
                    cursor: pointer;

                    &:hover {
                      background-color: #ecf5ff;
                    }
                  }
                }
              }

              .drug-search-row {
                margin-bottom: 12px;

                .drug-search-select {
                  width: 320px;
                }
              }
            }

            .prescription-table {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;
              margin-bottom: 12px;
              overflow-x: auto;

              .table-header,
              .table-body .prescription-item-row {
                .col-operation {
                  width: 36px;
                  flex-shrink: 0;
                }
                .col-group {
                  width: 44px;
                  flex-shrink: 0;
                }
                .col-name {
                  flex: 1;
                  min-width: 130px;
                }
                .col-spec {
                  width: 88px;
                  flex-shrink: 0;
                }
                .col-dosage {
                  width: 72px;
                  flex-shrink: 0;
                }
                .col-unit {
                  width: 80px;
                  flex-shrink: 0;
                }
                .col-usage {
                  width: 90px;
                  flex-shrink: 0;
                }
                .col-frequency {
                  width: 148px;
                  flex-shrink: 0;
                }
                .col-days {
                  width: 72px;
                  flex-shrink: 0;
                  input[type="number"]::-webkit-outer-spin-button,
                  input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    appearance: none;
                    margin: 0;
                  }
                  input[type="number"] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                  }
                }
                .col-total {
                  width: 68px;
                  flex-shrink: 0;
                  text-align: right;
                  padding-right: 8px;
                }
                .col-note {
                  width: 110px;
                  flex-shrink: 0;
                }
                .col-price {
                  width: 136px;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  .price-unit-label {
                    white-space: nowrap;
                    font-size: 12px;
                    color: #f56c6c;
                    font-weight: 700;
                    flex-shrink: 0;
                  }
                  input[type="number"]::-webkit-outer-spin-button,
                  input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    appearance: none;
                    margin: 0;
                  }
                  input[type="number"] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                  }
                  padding-right: 4px;
                }
                .col-amount {
                  width: 72px;
                  flex-shrink: 0;
                  text-align: right;
                  padding-right: 4px;
                }
              }

              .table-header {
                display: flex;
                align-items: center;
                background-color: #f5f7fa;
                padding: 8px 12px;
                font-weight: 600;
                color: #606266;
                font-size: 13px;
                min-width: 1060px;
                gap: 4px;
              }

              .table-body {
                min-height: 60px;
                padding: 4px 12px;

                .empty-text {
                  color: #909399;
                  font-size: 14px;
                  text-align: center;
                  padding: 16px 0;
                }

                .prescription-item-row {
                  display: flex;
                  align-items: center;
                  padding: 5px 0;
                  border-bottom: 1px solid #f0f0f0;
                  font-size: 13px;
                  min-width: 1060px;
                  gap: 4px;

                  &:last-child {
                    border-bottom: none;
                  }

                  .col-group {
                    color: #409eff;
                  }

                  .col-spec {
                    color: #909399;
                    font-size: 12px;
                  }

                  .col-total {
                    color: #303133;
                    font-weight: 500;
                  }

                  .col-price {
                    color: #409eff;
                  }

                  .col-amount {
                    color: #f56c6c;
                    font-weight: 700;
                  }
                }
              }
            }

            .prescription-amount {
              font-size: 14px;
              color: #606266;
              padding: 8px 0;
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

        &:hover {
          background-color: #f5f7fa;
        }

        &.active {
          background-color: #409eff;
          color: #fff;

          .item-icon {
            color: #fff;
          }
        }
      }
    }

    .template-detail {
      flex: 1;
      overflow-y: auto;
      padding: 16px;

      .detail-desc {
        margin-bottom: 16px;

        .detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 6px;
          font-size: 14px;
          color: #606266;

          .meta-item {
            white-space: nowrap;
          }

          .diagnosis-red {
            color: #f56c6c;
          }
        }
      }

      .detail-label {
        font-size: 14px;
        color: #303133;
        display: block;
        margin-bottom: 10px;
      }

      .empty-text {
        color: #909399;
        font-size: 14px;
        padding: 16px 0;
      }

      .tpl-detail-row {
        display: flex;
        align-items: baseline;
        padding: 6px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        gap: 8px;

        &:last-child {
          border-bottom: none;
        }

        .tpl-label {
          flex-shrink: 0;
          width: 80px;
          color: #909399;
          text-align: right;

          &::after {
            content: "：";
          }
        }

        .tpl-value {
          flex: 1;
          color: #303133;
          word-break: break-all;
        }
      }

      .keyword-highlight {
        color: #e6a23c;
        font-weight: 600;
        background: none;
      }

      .drug-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;

        th,
        td {
          border: 1px solid #e4e7ed;
          padding: 8px 10px;
          text-align: left;
          color: #303133;
        }

        th {
          background-color: #f5f7fa;
          font-weight: 600;
          color: #606266;
        }
      }
    }
  }
}

.fee-empty {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.fee-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  .fee-select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
    user-select: none;

    &:hover {
      border-color: #409eff;
      background: #f0f7ff;
    }

    &--active {
      border-color: #409eff;
      background: #ecf5ff;
    }

    .fee-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .fee-item-name {
        font-size: 14px;
        color: #303133;
      }

      .fee-tag {
        flex-shrink: 0;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 3px;
        line-height: 18px;

        &--common {
          background: #fdf6ec;
          color: #e6a23c;
          border: 1px solid #f5dab1;
        }

        &--default {
          background: #f0f9eb;
          color: #67c23a;
          border: 1px solid #c2e7b0;
        }
      }
    }

    .fee-item-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      .fee-item-price {
        font-size: 15px;
        font-weight: 600;
        color: #f56c6c;
        min-width: 60px;
        text-align: right;
      }

      .fee-check-icon {
        color: #409eff;
        font-size: 16px;
        width: 16px;
      }
    }
  }
}
</style>
