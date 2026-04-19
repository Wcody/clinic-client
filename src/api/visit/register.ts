import { http } from "@/utils/http";
import type {
  BQSearchListResultType,
  BQResultType,
  BQSearchPageResultType,
  BQSearchParamsType
} from "../api";

const BASE = "/registration";

// ==================== 枚举 ====================

/** 挂号状态 */
export enum RegistrationStatus {
  WAITING = "待接诊",
  RECEIVED = "已接诊",
  REFUNDED = "已退号"
}

/** 收费状态 */
export enum FeeStatus {
  UNPAID = "未缴费",
  PAID = "已缴费"
}

/** 门诊类型 */
export enum OutpatientType {
  SELF_PAY = "自费门诊",
  MEDICAL_INSURANCE = "医保门诊",
  OTHER = "其他"
}

// ==================== 实体类型 ====================

/**
 * 挂号记录实体
 */
export type BQRegistrationEntityType = {
  id: number;
  patientId: number; // 患者Id
  patient: string; // 患者姓名
  gender: string; // "男" | "女"
  firstAge: number; // 挂号时年龄
  lastAge: number; // 当前年龄
  registrationNo: string; // 挂号号码
  department: string; // 科室名称
  doctor: string; // 医生姓名
  clinic: number;
  registrationType: number;
  outpatientType: string; // 门诊类型：自费门诊 / 医保门诊 / 其他
  isFirstVisit: boolean; // true-初诊，false-复诊
  orderTime: string; // 挂号时间（ISO 8601）
  status: string; // 待接诊 / 已接诊 / 已完成 / 已取消
  statusFee: string; // 未缴费 / 已缴费
  age: string; // 年龄字符串：3年2月
  createTime: string;
  updateTime: string;
};

/**
 * 新增挂号时 registration 子对象
 */
export type BQRegistrationDto = {
  patientId: number; // 患者Id
  patient: string; // 患者姓名
  gender: string; // "男" | "女"
  firstAge: number; // 年龄（数值）
  lastAge?: number; // 当前年龄（数值）
  ageType?: number; // 年龄类型：1-岁，2-月，3-天
  registrationNo?: string; // 挂号号码（可由后端自动生成）
  department: string; // 科室名称
  doctor: string; // 医生姓名
  orderTime?: string; // 挂号时间（ISO 8601，不传由后端自动填充）
  status?: string; // 默认"待接诊"
  clinic?: number;
  registrationType?: number;
  outpatientType?: string; // 门诊类型（普通门诊/专家门诊/急诊等）
  isFirstVisit?: boolean;
};

/**
 * POST /save 请求体
 */
export type BQRegistrationSaveDto = {
  registration: BQRegistrationDto;
};

/**
 * 条件查询参数（GET /search）
 */
export type BQRegistrationSearchParams = {
  patientName?: string; // 患者姓名（模糊查询）
  startTime?: string; // 开始时间（ISO 8601，如 2024-01-01T00:00:00）
  endTime?: string; // 结束时间（ISO 8601，如 2024-12-31T23:59:59）
  status?: string; // 挂号状态（精确匹配）
};

/**
 * 地区条目
 */
export type BQRegionItem = {
  id: number;
  name: string;
};

/**
 * 挂号费项目实体
 */
export type BQRegistrationFeeEntityType = {
  id: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  status: boolean;
  isDefault: boolean;
};

// ==================== 返回类型 ====================

export type BQRegistrationResultType = BQResultType<BQRegistrationEntityType>;
export type BQRegistrationListResultType = BQResultType<
  BQSearchListResultType<BQRegistrationEntityType>
>;
export type BQRegistrationPageResultType = BQResultType<
  BQSearchPageResultType<BQRegistrationEntityType>
>;
export type BQRegionListResultType = BQResultType<BQRegionItem[]>;
export type BQRegistrationFeeListResultType = BQResultType<
  BQSearchListResultType<BQRegistrationFeeEntityType>
>;

export type BQChargeListData = {
  list: BQRegistrationEntityType[];
  total: number;
  currentPage: number;
  pageSize: number;
};
export type BQChargeListResultType = BQResultType<BQChargeListData>;

export type BQChargeListParams = {
  patientName?: string;
  startTime?: string;
  endTime?: string;
  statusFee?: string;
  status?: string;
  currentPage?: number;
  pageSize?: number;
};

// ==================== API ====================

/**
 * 根据ID获取单条挂号记录
 * GET /get/{id}
 */
export const getRegistrationByIdApi = (id: number) => {
  return http.request<BQRegistrationResultType>("get", `${BASE}/get/${id}`);
};

/**
 * 新增挂号记录（同时处理患者信息）
 * POST /save
 */
export const saveRegistrationApi = (data: BQRegistrationSaveDto) => {
  return http.request<BQRegistrationResultType>("post", `${BASE}/save`, {
    data
  });
};

/**
 * 批量新增挂号记录
 * POST /saveBatch
 */
export const saveRegistrationBatchApi = (data: BQRegistrationEntityType[]) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/saveBatch`, {
    data
  });
};

/**
 * 更新挂号记录
 * POST /update
 */
export const updateRegistrationApi = (data: BQRegistrationEntityType) => {
  return http.request<BQRegistrationResultType>("post", `${BASE}/update`, {
    data
  });
};

/**
 * 批量更新挂号记录
 * POST /updateBatch
 */
export const updateRegistrationBatchApi = (
  data: BQRegistrationEntityType[]
) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/updateBatch`, {
    data
  });
};

/**
 * 物理删除挂号记录
 * GET /delete/{id}
 */
export const deleteRegistrationApi = (id: number) => {
  return http.request<BQResultType<Boolean>>("get", `${BASE}/delete/${id}`);
};

/**
 * 批量物理删除挂号记录
 * POST /deleteBatch
 */
export const deleteRegistrationBatchApi = (ids: number[]) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/deleteBatch`, {
    data: ids
  });
};

/**
 * 逻辑删除挂号记录
 * GET /deleteLogic/{id}
 */
export const deleteRegistrationLogicApi = (id: number) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `${BASE}/deleteLogic/${id}`
  );
};

/**
 * 批量逻辑删除挂号记录
 * POST /deleteLogicBatch
 */
export const deleteRegistrationLogicBatchApi = (ids: number[]) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `${BASE}/deleteLogicBatch`,
    { data: ids }
  );
};

/**
 * 退号（更新状态为"已退号"）
 * GET /refund/{id}
 */
export const refundRegistrationApi = (id: number) => {
  return http.request<BQResultType<Boolean>>("get", `${BASE}/refund/${id}`);
};

/**
 * 列表查询（支持排序和过滤）
 * GET /list
 */
export const getRegistrationListApi = (
  params?: Partial<BQSearchParamsType>
) => {
  return http.request<BQRegistrationListResultType>("get", `${BASE}/list`, {
    params
  });
};

/**
 * 分页查询（支持排序和过滤）
 * GET /page
 */
export const getRegistrationPageApi = (
  params?: Partial<BQSearchParamsType> & { pageNum?: number; pageSize?: number }
) => {
  return http.request<BQRegistrationPageResultType>("get", `${BASE}/page`, {
    params
  });
};

/**
 * 条件查询挂号列表（患者姓名/时间范围/状态组合查询）
 * GET /search
 */
export const searchRegistrationApi = (params?: BQRegistrationSearchParams) => {
  return http.request<BQRegistrationListResultType>("get", `${BASE}/search`, {
    params
  });
};

/**
 * 获取挂号费项目列表
 * GET /registration/fee/list
 */
export const getRegistrationFeeListApi = () => {
  return http.request<BQRegistrationFeeListResultType>(
    "get",
    "/registration/fee/list"
  );
};

/**
 * 获取省份列表
 * GET /provinces
 */
export const getProvincesApi = () => {
  return http.request<BQRegionListResultType>("get", `${BASE}/provinces`);
};

/**
 * 根据省份ID获取城市列表
 * GET /cities?provinceId=
 */
export const getCitiesApi = (provinceId: number) => {
  return http.request<BQRegionListResultType>("get", `${BASE}/cities`, {
    params: { provinceId }
  });
};

/**
 * 根据城市ID获取区县列表
 * GET /districts?cityId=
 */
export const getDistrictsApi = (cityId: number) => {
  return http.request<BQRegionListResultType>("get", `${BASE}/districts`, {
    params: { cityId }
  });
};

/**
 * 药房收费列表分页查询
 * GET /charge/list
 */
export const getChargeListApi = (params: BQChargeListParams) => {
  return http.request<BQChargeListResultType>("get", `${BASE}/charge/list`, {
    params
  });
};
