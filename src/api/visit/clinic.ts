/**
 * 医生工作台 - 诊疗页面相关API
 * 涵盖：患者(v1)、病历、处方、处方明细、诊断字典、药品、附加费
 */
import { http } from "@/utils/http";
import type {
  BQResultType,
  BQSearchListResultType,
  BQSearchPageResultType,
  BQSearchParamsType
} from "../api";
import { BQSearchFilter, BQSearchOrder } from "../api";

// ==================== 患者类型（对应 BqPatientEntity，v1接口 /ams/api/v1/patient） ====================

export type BqPatientEntityType = {
  /** 主键ID */
  id?: number;
  /** 患者姓名 */
  name?: string;
  /** 性别："男" | "女" */
  gender?: string;
  /** 年龄字符串，如"31岁0月" */
  age?: string;
  /** 年龄类型：1岁 2月 3天 */
  ageType?: number;
  /** 主年龄（数字） */
  firstAge?: number;
  /** 次年龄（数字） */
  lastAge?: number;
  /** 身份证号 */
  idCard?: string;
  /** 手机号 */
  mobile?: string;
  /** 档案号 */
  archiveNo?: string;
  /** 省份ID */
  province?: number;
  /** 城市ID */
  city?: number;
  /** 区县ID */
  district?: number;
  /** 地址 */
  address?: string;
  /** 是否过敏 */
  isAllergy?: boolean;
  /** 过敏史 */
  allergicHistory?: string;
  /** 既往史 */
  pastHistory?: string;
  /** 个人史 */
  personalHistory?: string;
  /** 家族史 */
  familyHistory?: string;
  /** 婚育史 */
  obstericalHistory?: string;
  /** 旅行史 */
  travelHistory?: string;
  /** 接触史 */
  contactHistory?: string;
  version?: number;
  deleted?: boolean;
  deletedTime?: string;
  deletedBy?: string;
};

// ==================== 挂号类型（对应 BqRegistrationEntity，v1接口 /ams/api/v1/registration） ====================

export type BqRegistrationEntityType = {
  id?: number;
  /** 患者姓名 */
  patient?: string;
  /** 性别 */
  gender?: string;
  /** 初诊年龄 */
  ageFirst?: number;
  /** 末次年龄 */
  ageLast?: number;
  /** 年龄类型 */
  ageType?: number;
  /** 挂号号 */
  registrationNo?: string;
  /** 科室 */
  department?: string;
  /** 医生 */
  doctor?: string;
  clinic?: number;
  registrationType?: number;
  outpatientType?: string;
  /** 是否初诊 */
  isFirstVisit?: boolean;
  /** 下单时间 */
  orderTime?: string;
  /** 状态：待接诊/已接诊/已完成/已取消 */
  status?: string;
  version?: boolean;
  deleted?: boolean;
  deletedTime?: string;
  deletedBy?: string;
};

// ==================== 病历类型（对应 BqMedicalRecordEntity，/ams/api/v1/medical/record） ====================

export type BqMedicalRecordEntityType = {
  id?: number;
  eid?: string;
  /** 挂号ID（无挂号为空） */
  regId?: number;
  /** 患者ID */
  patientId?: number;
  /** 接诊医生ID */
  doctorId?: number;
  /** 主诉 */
  chiefComplaint?: string;
  /** 现病史 */
  presentIllness?: string;
  /** 既往史 */
  pastHistory?: string;
  /** 体格检查（JSON字符串） */
  physicalExam?: string;
  /** 诊断结果文本 */
  diagnosis?: string;
  /** 诊断编码ID串（逗号分隔） */
  diagnosisIds?: string;
  /** 医嘱/治疗建议 */
  advice?: string;
  /** 就诊时间 */
  seeTime?: string;
  createTime?: string;
  updateTime?: string;
};

// ==================== 处方类型（对应 BqPrescriptionEntity，/ams/api/v1/prescription） ====================

export type BqPrescriptionEntityType = {
  id?: number;
  eid?: string;
  /** 处方单号 */
  prescNo?: string;
  /** 就诊记录ID */
  recordId?: number;
  /** 挂号ID */
  regId?: number;
  /** 患者ID */
  patientId?: number;
  /** 开方医生ID */
  doctorId?: number;
  /** 处方类型：1西药 2中药 3检查 4处置 */
  prescType?: number;
  /** 组号 */
  groupNo?: string;
  /** 处方总价 */
  totalPrice?: number;
  /** 状态：1已开 2已缴费 3已发药 4作废 */
  status?: number;
  createdTime?: string;
};

// ==================== 处方明细类型（对应 BqPrescriptionItemEntity，/ams/api/v1/prescription/item） ====================

export type BqPrescriptionItemEntityType = {
  id?: number;
  eid?: string;
  /** 处方ID */
  prescId?: number;
  /** 项目类型：1药品 2检查 3处置 */
  itemType?: number;
  /** 项目ID */
  itemId?: number;
  /** 项目名称 */
  itemName?: string;
  /** 规格 */
  spec?: string;
  /** 单位 */
  unit?: string;
  /** 单次用量 */
  singleDosage?: string;
  /** 用法 */
  useWay?: string;
  /** 频次 */
  frequency?: string;
  /** 天数 */
  days?: number;
  /** 计价总量 */
  totalNum?: number;
  /** 嘱托 */
  entrust?: string;
  /** 单价 */
  price?: number;
  /** 金额 */
  totalPrice?: number;
  createdTime?: string;
};

// ==================== 诊断字典类型（对应 BqDiagnosisDictEntity，/ams/api/v1/diagnosis/dict） ====================

export type BqDiagnosisDictEntityType = {
  id?: number;
  eid?: string;
  /** ICD编码 */
  diagnosisCode?: string;
  /** 诊断名称 */
  diagnosisName?: string;
  /** 拼音码 */
  pinyin?: string;
  status?: number;
};

// ==================== 药品类型（对应 BqDrugEntity，/ams/api/v1/drug） ====================

export type BqDrugEntityType = {
  id?: number;
  /** 药品名称 */
  name?: string;
  type?: boolean;
  typeString?: string;
  /** 规格 */
  specification?: string;
  manufacturer?: string;
  supplier?: string;
  /** 处方价格 */
  prescriptionPrice?: string;
  purchaseCostPrice?: string;
  stock?: string;
  projectCode?: string;
  status?: boolean;
  createTime?: string;
};

// ==================== 附加费类型（对应 BqAdditionalFeeEntity，/ams/api/v1/additional/fee） ====================

export type BqAdditionalFeeEntityType = {
  id?: number;
  clinic?: number;
  /** 附加费名称 */
  name?: string;
  costPrice?: number;
  /** 售价 */
  sellingPrice?: number;
  status?: boolean;
  /** 是否常用 */
  common?: boolean;
  /** 是否默认添加 */
  defaultAdd?: boolean;
  createTime?: string;
};

// ==================== 返回类型 ====================

export type BqPatientResultType = BQResultType<BqPatientEntityType>;
export type BqPatientPageResultType = BQResultType<
  BQSearchPageResultType<BqPatientEntityType>
>;
export type BqPatientListResultType = BQResultType<
  BQSearchListResultType<BqPatientEntityType>
>;

export type BqMedicalRecordResultType = BQResultType<BqMedicalRecordEntityType>;
export type BqMedicalRecordListResultType = BQResultType<
  BQSearchListResultType<BqMedicalRecordEntityType>
>;
export type BqMedicalRecordPageResultType = BQResultType<
  BQSearchPageResultType<BqMedicalRecordEntityType>
>;

export type BqPrescriptionResultType = BQResultType<BqPrescriptionEntityType>;
export type BqPrescriptionListResultType = BQResultType<
  BQSearchListResultType<BqPrescriptionEntityType>
>;

export type BqPrescriptionItemResultType =
  BQResultType<BqPrescriptionItemEntityType>;
export type BqPrescriptionItemListResultType = BQResultType<
  BQSearchListResultType<BqPrescriptionItemEntityType>
>;

export type BqDiagnosisDictPageResultType = BQResultType<
  BQSearchPageResultType<BqDiagnosisDictEntityType>
>;

export type BqDrugPageResultType = BQResultType<
  BQSearchPageResultType<BqDrugEntityType>
>;

export type BqAdditionalFeeListResultType = BQResultType<
  BQSearchListResultType<BqAdditionalFeeEntityType>
>;

// ==================== 处方+明细聚合 DTO ====================

export type BqPrescriptionFullDtoType = {
  prescription: BqPrescriptionEntityType;
  items: BqPrescriptionItemEntityType[];
};

export type BqPrescriptionFullListResultType = BQResultType<
  BQSearchListResultType<BqPrescriptionFullDtoType>
>;

// ==================== 患者 API（v1，/ams/api/v1/patient） ====================

const PATIENT = "/patient";

/**
 * 根据ID获取患者详情
 * GET /patient/get/{id}
 */
export const getPatientByIdApi = (id: number) => {
  return http.request<BqPatientResultType>("get", `${PATIENT}/get/${id}`);
};

/**
 * 新增患者
 * POST /patient/save
 */
export const savePatientApi = (data: Partial<BqPatientEntityType>) => {
  return http.request<BqPatientResultType>("post", `${PATIENT}/save`, { data });
};

/**
 * 更新患者
 * POST /patient/update
 */
export const updatePatientApi = (data: BqPatientEntityType) => {
  return http.request<BqPatientResultType>("post", `${PATIENT}/update`, {
    data
  });
};

/**
 * 分页查询患者
 * GET /patient/page
 */
export const searchPatientPageApi = (
  keyword: string,
  current = 1,
  size = 20
) => {
  const params: any = { current, size };
  if (keyword) {
    params.filters = [new BQSearchFilter("name", "like", keyword)];
  }
  return http.request<BqPatientPageResultType>("get", `${PATIENT}/page`, {
    params
  });
};

/**
 * 关键字搜索患者（姓名/手机/身份证模糊匹配）
 * GET /patient/search?keyword=
 */
export const searchPatientByKeywordApi = (keyword: string) => {
  return http.request<BqPatientListResultType>("get", `${PATIENT}/search`, {
    params: { keyword }
  });
};

// ==================== 病历 API（/ams/api/v1/medical/record） ====================

const MEDICAL_RECORD = "/medical/record";

/**
 * 根据ID获取病历
 */
export const getMedicalRecordByIdApi = (id: number) => {
  return http.request<BqMedicalRecordResultType>(
    "get",
    `${MEDICAL_RECORD}/get/${id}`
  );
};

/**
 * 新增病历
 */
export const saveMedicalRecordApi = (
  data: Partial<BqMedicalRecordEntityType>
) => {
  return http.request<BqMedicalRecordResultType>(
    "post",
    `${MEDICAL_RECORD}/save`,
    { data }
  );
};

/**
 * 更新病历
 */
export const updateMedicalRecordApi = (data: BqMedicalRecordEntityType) => {
  return http.request<BqMedicalRecordResultType>(
    "post",
    `${MEDICAL_RECORD}/update`,
    { data }
  );
};

/**
 * 根据患者ID查询历史病历列表
 */
export const getMedicalRecordListByPatientIdApi = (
  patientId: number,
  size = 100
) => {
  const params = {
    size,
    filters: [new BQSearchFilter("patientId", "eq", String(patientId))],
    orders: [new BQSearchOrder("seeTime", false)]
  };
  return http.request<BqMedicalRecordListResultType>(
    "get",
    `${MEDICAL_RECORD}/list`,
    { params }
  );
};

/**
 * 分页查询病历
 */
export const getMedicalRecordPageApi = (
  params?: Partial<BQSearchParamsType> & { current?: number; size?: number }
) => {
  return http.request<BqMedicalRecordPageResultType>(
    "get",
    `${MEDICAL_RECORD}/page`,
    { params }
  );
};

// ==================== 保存医嘱 DTO 类型 ====================

export type BqSaveMedicalOrderGroupDtoType = {
  prescId?: number;
  prescType: number;
  groupNo: string;
  totalPrice: number;
  items: Partial<BqPrescriptionItemEntityType>[];
};

export type BqSaveMedicalOrderDtoType = {
  patientId?: number;
  patientName?: string;
  gender?: string;
  firstAge?: number;
  lastAge?: number;
  ageType?: number;
  idCard?: string;
  mobile?: string;
  province?: number;
  city?: number;
  district?: number;
  address?: string;
  isAllergy?: boolean;
  allergicHistory?: string;
  regId?: number;
  isFirstVisit?: boolean;
  recordId?: number;
  prescriptions: BqSaveMedicalOrderGroupDtoType[];
};

export type BqSaveMedicalOrderResultDtoType = {
  patientId: number;
  regId: number;
  /** 与请求 prescriptions 列表一一对应的处方主表 ID */
  prescIds: (number | null)[];
};

// ==================== 处方 API（/ams/api/v1/prescription） ====================

const PRESCRIPTION = "/prescription";

/**
 * 统一事务保存医嘱（处方主表 + 处方明细），若患者/挂号不存在则自动新增
 * POST /prescription/saveMedicalOrder
 */
export const saveMedicalOrderApi = (data: BqSaveMedicalOrderDtoType) => {
  return http.request<BQResultType<BqSaveMedicalOrderResultDtoType>>(
    "post",
    `${PRESCRIPTION}/saveMedicalOrder`,
    { data }
  );
};

/**
 * 新增处方
 */
export const savePrescriptionApi = (
  data: Partial<BqPrescriptionEntityType>
) => {
  return http.request<BqPrescriptionResultType>(
    "post",
    `${PRESCRIPTION}/save`,
    { data }
  );
};

/**
 * 更新处方
 */
export const updatePrescriptionApi = (data: BqPrescriptionEntityType) => {
  return http.request<BqPrescriptionResultType>(
    "post",
    `${PRESCRIPTION}/update`,
    { data }
  );
};

/**
 * 根据就诊记录ID查询处方列表
 */
export const getPrescriptionListByRecordIdApi = (recordId: number) => {
  const params = {
    size: 100,
    filters: [new BQSearchFilter("recordId", "eq", String(recordId))],
    orders: [new BQSearchOrder("createTime", true)]
  };
  return http.request<BqPrescriptionListResultType>(
    "get",
    `${PRESCRIPTION}/list`,
    { params }
  );
};

/**
 * 根据患者ID查询历史处方列表
 */
export const getPrescriptionListByPatientIdApi = (
  patientId: number,
  size = 50
) => {
  const params = {
    size,
    filters: [new BQSearchFilter("patientId", "eq", String(patientId))],
    orders: [new BQSearchOrder("createdTime", false)]
  };
  return http.request<BqPrescriptionListResultType>(
    "get",
    `${PRESCRIPTION}/list`,
    { params }
  );
};

// ==================== 处方明细 API（/ams/api/v1/prescription/item） ====================

const PRESCRIPTION_ITEM = "/prescription/item";

/**
 * 批量新增处方明细
 */
export const savePrescriptionItemBatchApi = (
  data: Partial<BqPrescriptionItemEntityType>[]
) => {
  return http.request<BQResultType<boolean>>(
    "post",
    `${PRESCRIPTION_ITEM}/saveBatch`,
    { data }
  );
};

/**
 * 根据处方ID查询明细列表
 */
export const getPrescriptionItemListByPrescIdApi = (prescId: number) => {
  const params = {
    size: 500,
    filters: [new BQSearchFilter("prescId", "eq", String(prescId))],
    orders: [new BQSearchOrder("createdTime", true)]
  };
  return http.request<BqPrescriptionItemListResultType>(
    "get",
    `${PRESCRIPTION_ITEM}/list`,
    { params }
  );
};

/**
 * 逻辑删除处方明细
 */
export const deletePrescriptionItemApi = (id: number) => {
  return http.request<BQResultType<boolean>>(
    "get",
    `${PRESCRIPTION_ITEM}/deleteLogic/${id}`
  );
};

/**
 * 批量逻辑删除处方明细
 */
export const deletePrescriptionItemBatchApi = (ids: number[]) => {
  return http.request<BQResultType<boolean>>(
    "post",
    `${PRESCRIPTION_ITEM}/deleteLogicBatch`,
    { data: ids }
  );
};

// ==================== 诊断字典 API（/ams/api/v1/diagnosis/dict） ====================

const DIAGNOSIS_DICT = "/diagnosis/dict";

/**
 * 搜索诊断字典（按名称模糊查询）
 */
export const searchDiagnosisDictApi = (keyword: string, size = 20) => {
  const params: any = { size, current: 1 };
  if (keyword) {
    params.filters = [new BQSearchFilter("diagnosisName", "like", keyword)];
  }
  return http.request<BqDiagnosisDictPageResultType>(
    "get",
    `${DIAGNOSIS_DICT}/page`,
    { params }
  );
};

// ==================== 药品 API（/ams/api/v1/drug） ====================

const DRUG = "/drug";

/**
 * 搜索药品（按名称模糊查询，分页）
 */
export const searchDrugPageApi = (keyword: string, current = 1, size = 20) => {
  const params: any = { current, size };
  if (keyword) {
    params.filters = [new BQSearchFilter("name", "like", keyword)];
  }
  return http.request<BqDrugPageResultType>("get", `${DRUG}/page`, { params });
};

/**
 * 根据ID获取药品详情
 */
export const getDrugByIdApi = (id: number) => {
  return http.request<BQResultType<BqDrugEntityType>>(
    "get",
    `${DRUG}/get/${id}`
  );
};

/**
 * 根据挂号ID查询病历
 * GET /medical/record/getByRegId/{regId}
 */
export const getMedicalRecordByRegIdApi = (regId: number) => {
  return http.request<BQResultType<BqMedicalRecordEntityType>>(
    "get",
    `${MEDICAL_RECORD}/getByRegId/${regId}`
  );
};

/**
 * 根据挂号ID查询所有处方及明细（一次性返回）
 * GET /prescription/listFullByRegId/{regId}
 */
export const getPrescriptionFullListByRegIdApi = (regId: number) => {
  return http.request<BQResultType<BqPrescriptionFullDtoType[]>>(
    "get",
    `${PRESCRIPTION}/listFullByRegId/${regId}`
  );
};

/**
 * 生成处方PDF，返回 Blob 供前端打印预览
 * GET /prescription/printPdf?regId=xxx&showPrice=true
 */
export const printPrescriptionPdfApi = (
  regId: number,
  showPrice: boolean
): Promise<Blob> => {
  return http.download(
    `${PRESCRIPTION}/printPdf`,
    { params: { regId, showPrice } },
    { baseURL: import.meta.env.VITE_API_BASE_URL, timeout: 240 * 1000 }
  );
};

// ==================== 附加费 API（/ams/api/v1/additional/fee） ====================

const ADDITIONAL_FEE = "/additional/fee";

/**
 * 获取启用状态的附加费列表
 */
export const getAdditionalFeeListApi = () => {
  const params = {
    size: 500,
    filters: [new BQSearchFilter("status", "eq", "1")],
    orders: [new BQSearchOrder("createTime", true)]
  };
  return http.request<BqAdditionalFeeListResultType>(
    "get",
    `${ADDITIONAL_FEE}/list`,
    { params }
  );
};
