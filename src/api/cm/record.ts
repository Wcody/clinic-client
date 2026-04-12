import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault,
  BQSearchFilter,
  type BQOptionsType
} from "../api";

/**
 * 诊断信息定义
 */
export interface Diagnosis {
  C06x__C: string; // 诊断编码
  C07x__N: string; // 诊断名称
  C08x__C: string; // 入院情况
  F06x__: string; //出院情况
}

/**
 * 获取诊断信息缺省值
 */
export const getDiagnosisDefault: (row?: Diagnosis) => Diagnosis = (
  row?: Diagnosis
) => {
  return {
    C06x__C: row?.C06x__C ?? "",
    C07x__N: row?.C07x__N ?? "",
    C08x__C: row?.C08x__C ?? "",
    F06x__: row?.F06x__ ?? ""
  };
};

/**
 * 手术信息实体类型定义
 */
export interface ShoushuItem {
  // 手术操作编码
  pso1: string;
  // 手术操作名称
  pso2: string;
  // 手术操作日期，格式为 'YYYY-MM-DD HH:MM:SS'
  pso3: string;
  // 手术操作级别
  pso4: string;
  // 手术持续时间
  pso5: number;
  // 手术操作术者
  pso6: string;
  // 手术操作Ⅰ助
  pso7: string;
  // 手术操作Ⅱ助
  pso8: string;
  // 手术操作切口愈合等级
  pso9: string;
  // 手术操作麻醉方式
  pso10: string;
  // 手术麻醉分级
  pso11: string;
  // 手术操作麻醉医师
  pso12: string;
}

/**
 * 获取手术信息缺省值
 */
export const getShoushuItemDefault: (row?: ShoushuItem) => ShoushuItem = (
  row?: ShoushuItem
) => {
  return {
    pso1: row?.pso1 ?? "",
    pso2: row?.pso2 ?? "",
    pso3: row?.pso3 ?? "",
    pso4: row?.pso4 ?? "",
    pso5: row?.pso5 ?? 0,
    pso6: row?.pso6 ?? "",
    pso7: row?.pso7 ?? "",
    pso8: row?.pso8 ?? "",
    pso9: row?.pso9 ?? "",
    pso10: row?.pso10 ?? "",
    pso11: row?.pso11 ?? "",
    pso12: row?.pso12 ?? ""
  };
};

/**
 * 重症信息定义
 */
export interface ZhongzhengItem {
  C48x__C: string; // 重症监护室名称
  C49x__: string; // 进入时间
  C50x__: string; // 退出时间
}

/**
 * 获取重症信息缺省值
 */
export const getZhongzhengDefault: (row?: ZhongzhengItem) => ZhongzhengItem = (
  row?: ZhongzhengItem
) => {
  return {
    C48x__C: row?.C48x__C ?? "",
    C49x__: row?.C49x__ ?? "",
    C50x__: row?.C50x__ ?? ""
  };
};

/**
 * 病案实体类型定义
 */
export type BQRecordEntityType = {
  recordKind: number;
  patientId: string;
  patientKind: number;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  hasAllergy: boolean;
  allergicDrug: string;
  contactPerson: string;
  contactRelation: string;
  contactPhoneNumber: string;
  recordSource: string;
  hasArchived: boolean;
  lengthOfStay: number;
  attendingDoctor: string;
  mainDiagnosisName: string;
  mainSurgeryCode: string;
  mainSurgeryName: string;
  hasDeceased: boolean;
  shelfNumber: string;
  wardCode: string;
  wardName: string;
  hasPrinted: boolean;
  hasQualityChecked: boolean;
  hasCompleted: boolean;
  // 医院名称
  hospitalName: string;
  // 统一社会信用代码
  creditCode: string;
  // 病案号
  recordCode: string;
  // 住院次数
  admissionCount: number;
  // 入院时间，格式为 'YYYY-MM-DD HH:MM:SS'
  admissionDate: string;
  // 出院时间，格式为 'YYYY-MM-DD HH:MM:SS'
  dischargeDate: string;
  // 健康卡号
  patientCode: string;
  // 医疗付费方式
  payType: string;
  // 患者姓名
  patientName: string;
  // 患者性别，通常为数字代码（例如：0-未知，1-男，2-女）
  gender: number;
  // 患者出生日期，格式为 'YYYY-MM-DD'
  birthDate: string;
  // 患者年龄（岁）
  ageYear: number;
  // 患者年龄（天）
  ageDay: number;
  // 患者婚姻状态
  maritalStatus: number;
  // 患者国籍
  nationality: string;
  // 患者民族
  ethnicity: string;
  // 证件类型
  idType: string;
  // 证件号码
  idCard: string;
  // 职业
  profession: string;
  // 出生地址
  birthAddress: string;
  // 籍贯省（自治区、直辖市）
  nativeProvince: string;
  // 户口地址
  hukouAddress: string;
  // 户口地址邮政编码
  hukouZipCode: string;
  // 现住址
  liveAddress: string;
  // 现住址电话
  livePhone: string;
  // 现住址邮编
  liveZipCode: string;
  // 工作单位及地址
  workUnitAddress: string;
  // 工作单位电话
  workUnitPhone: string;
  // 工作单位邮政编码
  workUnitZipCode: string;
  // 联系人姓名
  contactName: string;
  // 联系人关系
  contactRelationship: string;
  // 联系人地址
  contactAddress: string;
  // 联系电话
  contactPhone: string;
  // 是否为日间手术
  hasDaySurgery: string;
  // 入院途径
  admissionRoute: string;
  // 入院科别
  admissionDepartment: string;
  // 入院病房
  admissionWard: string;
  // 转科科别
  transferDepartment: string;
  // 出院科别
  dischargeDepartment: string;
  // 出院病房
  dischargeWard: string;
  // 实际住院（天）
  actualHospitalizationDays: number;
  // 入院时情况
  admissionCondition: string;
  // 入院诊断编码
  admissionDiagnosisCode: string;
  // 入院诊断名称
  admissionDiagnosisName: string;
  // 入院后确诊日期，格式为 'YYYY-MM-DD'
  postAdmissionConfirmationDate: string;
  // 出院主要诊断编码
  primaryDiagnosisCode: string;
  // 出院主要诊断名称
  primaryDiagnosisName: string;
  // 出院主要诊断入院病情
  primaryDiagnosisAdmissionCondition: string;
  // 主要诊断出院情况
  primaryDiagnosisDischargeCondition: string;
  // 病理诊断编码
  pathologyDiagnosisCode: string;
  // 病理诊断名称
  pathologyDiagnosisName: string;
  // 病理号
  pathologyNumber: string;
  // 损伤、中毒外部原因编码
  externalCauseOfInjuryOrPoisoningCode: string;
  // 损伤、中毒外部原因名称
  externalCauseOfInjuryOrPoisoningName: string;
  // 有无药物过敏史
  drugAllergyHistory: string;
  // 药物过敏名称
  allergyDrugs: string;
  // HBsAg检测结果
  nbsag: string;
  // HCV-Ab检测结果
  hcvab: string;
  // HIV-Ab检测结果
  hivab: string;
  // 科主任编码
  departmentHeadCode: string;
  // 科主任
  departmentHead: string;
  // 主（副主）任医师编码
  attendingPhysicianCode: string;
  // 主（副主）任医师
  attendingPhysician: string;
  // 主治医师编码
  associatePhysicianCode: string;
  // 主治医师
  associatePhysician: string;
  // 住院医师编码
  residentPhysicianCode: string;
  // 住院医师
  residentPhysician: string;
  // 责任护士编码
  responsibleNurseCode: string;
  // 责任护士
  responsibleNurse: string;
  // 进修医师
  visitingPhysician: string;
  // 实习医师
  internPhysician: string;
  // 编码员
  coder: string;
  // 病案质量
  medicalRecordQuality: string;
  // 质控医师
  qualityControlPhysician: string;
  // 质控护士
  qualityControlNurse: string;
  // 质控日期，格式为 'YYYY-MM-DD'
  qualityControlDate: string;
  // 死亡患者尸检
  autopsyForDeceased: string;
  // ABO血型
  aboBloodType: string;
  // Rh血型
  rhBloodType: string;
  // 主要手术操作编码
  pso1: string;
  // 主要手术操作名称
  pso2: string;
  // 主要手术操作日期，格式为 'YYYY-MM-DD HH:MM:SS'
  pso3: string;
  // 主要手术操作级别
  pso4: string;
  // 主要手术持续时间
  pso5: number;
  // 主要手术操作术者
  pso6: string;
  // 主要手术操作Ⅰ助
  pso7: string;
  // 主要手术操作Ⅱ助
  pso8: string;
  // 主要手术操作切口愈合等级
  pso9: string;
  // 主要手术操作麻醉方式
  pso10: string;
  // 主要手术麻醉分级
  pso11: string;
  // 主要手术操作麻醉医师
  pso12: string;
  // 特级护理天数
  intensiveCareDays: number;
  // 一级护理天数
  firstLevelCareDays: number;
  // 二级护理天数
  secondLevelCareDays: number;
  // 三级护理天数
  thirdLevelCareDays: number;
  // 输血反应
  bloodTransfusionReaction: number;
  // 红细胞
  redBloodCells: number;
  // 血小板
  platelets: number;
  // 血浆
  plasma: number;
  // 全血
  wholeBlood: number;
  // 自体血回输
  autologousBloodTransfusion: number;
  // 新生儿出生体重（克）1
  A18x01: number;
  // 新生儿出生体重（克）2
  A18x02: number;
  // 新生儿出生体重（克）3
  A18x03: number;
  // 新生儿出生体重（克）4
  A18x04: number;
  // 新生儿出生体重（克）5
  A18x05: number;
  // 新生儿入院体重（克）
  A17: number;
  // 颅脑损伤患者入院前昏迷时间（天）
  C28: number;
  // 颅脑损伤患者入院前昏迷时间（小时）
  C29: number;
  // 颅脑损伤患者入院前昏迷时间（分钟）
  C30: number;
  // 颅脑损伤患者入院后昏迷时间（天）
  C31: number;
  // 颅脑损伤患者入院后昏迷时间（小时）
  C32: number;
  // 颅脑损伤患者入院后昏迷时间（分钟）
  C33: number;
  // 有创呼吸机使用时间
  C47: number;
  // 是否有出院31日内再住院计划
  B36C: string;
  // 出院31天再住院计划目的
  B37: string;
  // 离院方式
  B34C: string;
  // 医嘱转院、转社区卫生服务机构/乡镇卫生院名称
  B35: string;
  // 其他过敏史
  otherAllergyHistory: string;
  // 其他过敏原
  otherAllergens: string;
  // 挂号时间，格式为 'YYYY-MM-DD HH:MM:SS'
  registrationTime: string;
  // 报到时间，格式为 'YYYY-MM-DD HH:MM:SS'
  checkInTime: string;
  // 就诊时间，格式为 'YYYY-MM-DD HH:MM:SS'
  visitTime: string;
  // 就诊科室
  department: string;
  // 接诊医师
  attendingPhysician: string;
  // 接诊医师职称
  physicianTitle: string;
  // 就诊类型
  visitType: string;
  // 是否复诊
  isRevisit: string;
  // 是否输液
  isInfusion: string;
  // 是否为门诊慢特病患者
  isSpecialPatient: string;
  // 急诊患者分级
  emergencyLevel: string;
  // 急诊患者去向
  emergencyOutcome: string;
  // 住院证开具时间，格式为 'YYYY-MM-DD HH:MM:SS'
  admissionCertTime: string;
  // 患者主诉
  chiefComplaint: string;
  // 门（急）诊主要诊断
  mainDiagnosis: string;
  // 门（急）诊主要诊断编码
  mainDiagnosisCode: string;
  // 门（急）诊其他诊断
  otherDiagnosis: string;
  // 门（急）诊其他诊断编码
  otherDiagnosisCode: string;
  // 手术及操作日期，格式为 'YYYY-MM-DD HH:MM:SS'
  surgeryDate: string;
  // 手术及操作名称
  surgeryName: string;
  // 手术及操作编码
  surgeryCode: string;
  // 手术及操作者
  surgeon: string;
  // 麻醉方式
  anesthesiaMethod: string;
  // 麻醉医师
  anesthesiologist: string;
  // 手术分级管理级别
  surgeryGrade: number;
  // 门（急）诊总费用
  totalCost: number;
  // 其中，自付金额
  selfPaidCost: number;
  // 1.一般医疗服务费
  generalServiceCost: number;
  // 2.一般治疗操作费
  generalTreatmentCost: number;
  // 3.护理费
  nursingCost: number;
  // 4.综合医疗服务类其他费用
  otherServiceCost: number;
  // 5.病理诊断费
  pathologyCost: number;
  // 6.实验室诊断费
  labTestCost: number;
  // 7.影像学诊断费
  imagingCost: number;
  // 8.临床诊断项目费
  clinicalCost: number;
  // 9.非手术治疗项目费
  nonSurgicalCost: number;
  // 其中：临床物理治疗费
  physicalTherapyCost: number;
  // 10.手术治疗费
  surgeryTotalCost: number;
  // 其中：麻醉费
  anesthesiaCost: number;
  // 其中：手术费
  surgeryCost: number;
  // 11.康复费
  recoveryCost: number;
  // 12.中医治疗费
  chineseMedicineCost: number;
  // 13.西药费
  westernMedicineCost: number;
  // 其中：抗菌药物费用
  antibioticCost: number;
  // 14.中成药费
  chinesePrepCost: number;
  // 15.中草药费
  herbalMedicineCost: number;
  // 16.血费
  bloodCost: number;
  // 17.白蛋白类制品费
  albuminCost: number;
  // 18.球蛋白类制品费
  globulinCost: number;
  // 19.凝血因子类制品费
  coagulationCost: number;
  // 20.细胞因子类制品费
  cytokineCost: number;
  // 21.检查用一次性医用材料费
  disposableExamCost: number;
  // 22.治疗用一次性医用材料费
  disposableTreatmentCost: number;
  // 23.手术用一次性医用材料费
  disposableSurgeryCost: number;
  // 24.其他费
  otherCost: number;
  // 入院诊断信息表
  admissionDiagnosis: Diagnosis[];
  // 出院诊断信息表
  dischargeDiagnosis: Diagnosis[];
  // 手术信息表
  shoushuDetails: ShoushuItem[];
  // 重症监护信息表
  zhongzhengDetails: ZhongzhengItem[];
  // 病案状态
  status: boolean;
  // 备注
  remark: string;
} & BQBaseEntityType;

/**
 * 获取病案缺省值
 */
export const getRecordEntityDefault: (
  row?: BQRecordEntityType
) => BQRecordEntityType = (row?: BQRecordEntityType) => {
  return {
    recordKind: row?.recordKind ?? 0,
    recordCode: row?.recordCode ?? "",
    patientId: row?.patientId ?? "",
    patientKind: row?.patientKind ?? 0,
    patientCode: row?.patientCode ?? "",
    idCard: row?.idCard ?? "",
    patientName: row?.patientName ?? "",
    gender: row?.gender ?? 0,
    dateOfBirth: row?.dateOfBirth ?? "",
    phoneNumber: row?.phoneNumber ?? "",
    address: row?.address ?? "",
    nationality: row?.nationality ?? "",
    ethnicity: row?.ethnicity ?? "",
    maritalStatus: row?.maritalStatus ?? 0,
    hasAllergy: row?.hasAllergy ?? false,
    allergicDrug: row?.allergicDrug ?? "",
    contactPerson: row?.contactPerson ?? "",
    contactRelation: row?.contactRelation ?? "",
    contactPhoneNumber: row?.contactPhoneNumber ?? "",
    recordSource: row?.recordSource ?? "",
    admissionCount: row?.admissionCount ?? 0,
    hasArchived: row?.hasArchived ?? false,
    admissionDate: row?.admissionDate ?? "",
    dischargeDate: row?.dischargeDate ?? "",
    department: row?.department ?? "",
    dischargeDepartment: row?.dischargeDepartment ?? "",
    lengthOfStay: row?.lengthOfStay ?? 0,
    attendingDoctor: row?.attendingDoctor ?? "",
    mainDiagnosisCode: row?.mainDiagnosisCode ?? "",
    mainDiagnosisName: row?.mainDiagnosisName ?? "",
    mainSurgeryCode: row?.mainSurgeryCode ?? "",
    mainSurgeryName: row?.mainSurgeryName ?? "",
    hasDeceased: row?.hasDeceased ?? false,
    shelfNumber: row?.shelfNumber ?? "",
    wardCode: row?.wardCode ?? "",
    wardName: row?.wardName ?? "",
    hasPrinted: row?.hasPrinted ?? false,
    hasQualityChecked: row?.hasQualityChecked ?? false,
    hasCompleted: row?.hasCompleted ?? false,
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    hospitalName: row?.hospitalName ?? "",
    creditCode: row?.creditCode ?? "",
    payType: row?.payType ?? "",
    birthDate: row?.birthDate ?? "",
    ageYear: row?.ageYear ?? 0,
    ageDay: row?.ageDay ?? 0,
    idType: row?.idType ?? "",
    profession: row?.profession ?? "",
    birthAddress: row?.birthAddress ?? "",
    nativeProvince: row?.nativeProvince ?? "",
    hukouAddress: row?.hukouAddress ?? "",
    hukouZipCode: row?.hukouZipCode ?? "",
    liveAddress: row?.liveAddress ?? "",
    livePhone: row?.livePhone ?? "",
    liveZipCode: row?.liveZipCode ?? "",
    workUnitAddress: row?.workUnitAddress ?? "",
    workUnitPhone: row?.workUnitPhone ?? "",
    workUnitZipCode: row?.workUnitZipCode ?? "",
    contactName: row?.contactName ?? "",
    contactRelationship: row?.contactRelationship ?? "",
    contactAddress: row?.contactAddress ?? "",
    contactPhone: row?.contactPhone ?? "",
    hasDaySurgery: row?.hasDaySurgery ?? "",
    admissionRoute: row?.admissionRoute ?? "",
    admissionDepartment: row?.admissionDepartment ?? "",
    admissionWard: row?.admissionWard ?? "",
    transferDepartment: row?.transferDepartment ?? "",
    dischargeWard: row?.dischargeWard ?? "",
    actualHospitalizationDays: row?.actualHospitalizationDays ?? 0,
    admissionCondition: row?.admissionCondition ?? "",
    admissionDiagnosisCode: row?.admissionDiagnosisCode ?? "",
    admissionDiagnosisName: row?.admissionDiagnosisName ?? "",
    postAdmissionConfirmationDate: row?.postAdmissionConfirmationDate ?? "",
    primaryDiagnosisCode: row?.primaryDiagnosisCode ?? "",
    primaryDiagnosisName: row?.primaryDiagnosisName ?? "",
    primaryDiagnosisAdmissionCondition:
      row?.primaryDiagnosisAdmissionCondition ?? "",
    primaryDiagnosisDischargeCondition:
      row?.primaryDiagnosisDischargeCondition ?? "",
    pathologyDiagnosisCode: row?.pathologyDiagnosisCode ?? "",
    pathologyDiagnosisName: row?.pathologyDiagnosisName ?? "",
    pathologyNumber: row?.pathologyNumber ?? "",
    externalCauseOfInjuryOrPoisoningCode:
      row?.externalCauseOfInjuryOrPoisoningCode ?? "",
    externalCauseOfInjuryOrPoisoningName:
      row?.externalCauseOfInjuryOrPoisoningName ?? "",
    drugAllergyHistory: row?.drugAllergyHistory ?? "",
    allergyDrugs: row?.allergyDrugs ?? "",
    nbsag: row?.nbsag ?? "",
    hcvab: row?.hcvab ?? "",
    hivab: row?.hivab ?? "",
    departmentHeadCode: row?.departmentHeadCode ?? "",
    departmentHead: row?.departmentHead ?? "",
    attendingPhysicianCode: row?.attendingPhysicianCode ?? "",
    attendingPhysician: row?.attendingPhysician ?? "",
    associatePhysicianCode: row?.associatePhysicianCode ?? "",
    associatePhysician: row?.associatePhysician ?? "",
    residentPhysicianCode: row?.residentPhysicianCode ?? "",
    residentPhysician: row?.residentPhysician ?? "",
    responsibleNurseCode: row?.responsibleNurseCode ?? "",
    responsibleNurse: row?.responsibleNurse ?? "",
    visitingPhysician: row?.visitingPhysician ?? "",
    internPhysician: row?.internPhysician ?? "",
    coder: row?.coder ?? "",
    medicalRecordQuality: row?.medicalRecordQuality ?? "",
    qualityControlPhysician: row?.qualityControlPhysician ?? "",
    qualityControlNurse: row?.qualityControlNurse ?? "",
    qualityControlDate: row?.qualityControlDate ?? "",
    autopsyForDeceased: row?.autopsyForDeceased ?? "",
    aboBloodType: row?.aboBloodType ?? "",
    rhBloodType: row?.rhBloodType ?? "",
    pso1: row?.pso1 ?? "",
    pso2: row?.pso2 ?? "",
    pso3: row?.pso3 ?? "",
    pso4: row?.pso4 ?? "",
    pso5: row?.pso5 ?? 0,
    pso6: row?.pso6 ?? "",
    pso7: row?.pso7 ?? "",
    pso8: row?.pso8 ?? "",
    pso9: row?.pso9 ?? "",
    pso10: row?.pso10 ?? "",
    pso11: row?.pso11 ?? "",
    pso12: row?.pso12 ?? "",
    intensiveCareDays: row?.intensiveCareDays ?? 0,
    firstLevelCareDays: row?.firstLevelCareDays ?? 0,
    secondLevelCareDays: row?.secondLevelCareDays ?? 0,
    thirdLevelCareDays: row?.thirdLevelCareDays ?? 0,
    bloodTransfusionReaction: row?.bloodTransfusionReaction ?? 0,
    redBloodCells: row?.redBloodCells ?? 0,
    platelets: row?.platelets ?? 0,
    plasma: row?.plasma ?? 0,
    wholeBlood: row?.wholeBlood ?? 0,
    autologousBloodTransfusion: row?.autologousBloodTransfusion ?? 0,
    A18x01: row?.A18x01 ?? 0,
    A18x02: row?.A18x02 ?? 0,
    A18x03: row?.A18x03 ?? 0,
    A18x04: row?.A18x04 ?? 0,
    A18x05: row?.A18x05 ?? 0,
    A17: row?.A17 ?? 0,
    C28: row?.C28 ?? 0,
    C29: row?.C29 ?? 0,
    C30: row?.C30 ?? 0,
    C31: row?.C31 ?? 0,
    C32: row?.C32 ?? 0,
    C33: row?.C33 ?? 0,
    C47: row?.C47 ?? 0,
    B36C: row?.B36C ?? "",
    B37: row?.B37 ?? "",
    B34C: row?.B34C ?? "",
    B35: row?.B35 ?? "",
    otherAllergyHistory: row?.otherAllergyHistory ?? "",
    otherAllergens: row?.otherAllergens ?? "",
    registrationTime: row?.registrationTime ?? "",
    checkInTime: row?.checkInTime ?? "",
    visitTime: row?.visitTime ?? "",
    physicianTitle: row?.physicianTitle ?? "",
    visitType: row?.visitType ?? "",
    isRevisit: row?.isRevisit ?? "",
    isInfusion: row?.isInfusion ?? "",
    isSpecialPatient: row?.isSpecialPatient ?? "",
    emergencyLevel: row?.emergencyLevel ?? "",
    emergencyOutcome: row?.emergencyOutcome ?? "",
    admissionCertTime: row?.admissionCertTime ?? "",
    chiefComplaint: row?.chiefComplaint ?? "",
    mainDiagnosis: row?.mainDiagnosis ?? "",
    otherDiagnosis: row?.otherDiagnosis ?? "",
    otherDiagnosisCode: row?.otherDiagnosisCode ?? "",
    surgeryDate: row?.surgeryDate ?? "",
    surgeryName: row?.surgeryName ?? "",
    surgeryCode: row?.surgeryCode ?? "",
    surgeon: row?.surgeon ?? "",
    anesthesiaMethod: row?.anesthesiaMethod ?? "",
    anesthesiologist: row?.anesthesiologist ?? "",
    surgeryGrade: row?.surgeryGrade ?? 0,
    totalCost: row?.totalCost ?? 0,
    selfPaidCost: row?.selfPaidCost ?? 0,
    generalServiceCost: row?.generalServiceCost ?? 0,
    generalTreatmentCost: row?.generalTreatmentCost ?? 0,
    nursingCost: row?.nursingCost ?? 0,
    otherServiceCost: row?.otherServiceCost ?? 0,
    pathologyCost: row?.pathologyCost ?? 0,
    labTestCost: row?.labTestCost ?? 0,
    imagingCost: row?.imagingCost ?? 0,
    clinicalCost: row?.clinicalCost ?? 0,
    nonSurgicalCost: row?.nonSurgicalCost ?? 0,
    physicalTherapyCost: row?.physicalTherapyCost ?? 0,
    surgeryTotalCost: row?.surgeryTotalCost ?? 0,
    anesthesiaCost: row?.anesthesiaCost ?? 0,
    surgeryCost: row?.surgeryCost ?? 0,
    recoveryCost: row?.recoveryCost ?? 0,
    chineseMedicineCost: row?.chineseMedicineCost ?? 0,
    westernMedicineCost: row?.westernMedicineCost ?? 0,
    antibioticCost: row?.antibioticCost ?? 0,
    chinesePrepCost: row?.chinesePrepCost ?? 0,
    herbalMedicineCost: row?.herbalMedicineCost ?? 0,
    bloodCost: row?.bloodCost ?? 0,
    albuminCost: row?.albuminCost ?? 0,
    globulinCost: row?.globulinCost ?? 0,
    coagulationCost: row?.coagulationCost ?? 0,
    cytokineCost: row?.cytokineCost ?? 0,
    disposableExamCost: row?.disposableExamCost ?? 0,
    disposableTreatmentCost: row?.disposableTreatmentCost ?? 0,
    disposableSurgeryCost: row?.disposableSurgeryCost ?? 0,
    otherCost: row?.otherCost ?? 0,
    admissionDiagnosis: row?.admissionDiagnosis ?? [],
    dischargeDiagnosis: row?.dischargeDiagnosis ?? [],
    shoushuDetails: row?.shoushuDetails ?? [],
    zhongzhengDetails: row?.zhongzhengDetails ?? [],
    ...getBaseEntityDefault(row)
  };
};

/**
 * 病案实体结果定义
 */
export type BQRecordEntityResultType = BQResultType<BQRecordEntityType>;

/**
 * 病案实体分页结果定义
 */
export type BQRecordSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQRecordEntityType>
>;

/**
 * 病案实体列表结果定义
 */
export type BQRecordSearchListResultType = BQResultType<
  BQSearchListResultType<BQRecordEntityType>
>;

/**
 * 查询病案Api
 */
export const getRecordApi = eid => {
  return http.request<BQRecordEntityResultType>("get", "/record/get/" + eid);
};

/**
 * 增加病案API
 */
export const addRecordApi = (data?: object) => {
  return http.request<BQRecordEntityResultType>("post", "/record/save", {
    data
  });
};

/**
 * 更新病案API
 */
export const updateRecordApi = (data?: object) => {
  return http.request<BQRecordEntityResultType>("post", "/record/update", {
    data
  });
};

/**
 * 获取所有病案API
 */
export const getRecordListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQRecordSearchListResultType>("get", "/record/list", {
    params
  });
};

/**
 * 获取所有病案API
 */
export const getRecordKind0ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("recordKind", "eq", "0")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQRecordSearchListResultType>("get", "/record/list", {
    params
  });
};

/**
 * 获取所有病案API
 */
export const getRecordKind1ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("recordKind", "eq", "1")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQRecordSearchListResultType>("get", "/record/list", {
    params
  });
};

/**
 * 获取所有病案分页API
 */
export const getRecordPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQRecordSearchPageResultType>("get", "/record/page", {
    params
  });
};

/**
 * 删除病案API
 */
export const deleteRecordApi = (eid: string) => {
  return http.request<Boolean>("get", `/record/delete/${eid}`);
};

/**
 * 病案启用禁用API
 */
export const setStatusRecordApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/record/setStatus/${eid}/${status}`);
};

/**
 * 质控API
 */
export const qcApi = (kind: string, act: string, eid: string, data: string) => {
  return http.request<BQRecordEntityResultType>(
    "post",
    `/record/${kind}/${act}/${eid}`,
    {
      data
    }
  );
};

/**
 * 获取所有字段键值对API
 */
export const getRecordFieldOptionsApi = (initKind: number) => {
  return http.request<BQResultType<BQOptionsType>>(
    "get",
    `/record/fieldOptions/${initKind}`
  );
};

/**
 * 根据条件获取列表API
 */
export const getWzRecordListByApi = data => {
  return http.request<BQRecordSearchListResultType>("post", `/record/listWz`, {
    data
  });
};
