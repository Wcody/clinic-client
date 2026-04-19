import { http } from "@/utils/http";
import type {
  BQSearchListResultType,
  BQResultType,
  BQSearchPageResultType,
  BQSearchParamsType
} from "../api";

const BASE = "/patient";

// ==================== 枚举 ====================

/** 性别 */
export enum PatientGender {
  MALE = "男",
  FEMALE = "女",
  UNKNOWN = "未知"
}

/** 年龄类型 */
export enum AgeType {
  YEAR = 1, // 岁
  MONTH = 2, // 月
  DAY = 3 // 天
}

// ==================== 实体类型 ====================

/**
 * 患者实体（后端返回）
 *
 * ⚠️ /list 和 /page 的 filters 字段名必须使用实体实际字段名：
 *   ✅ name / mobile / idCard / gender / archiveNo
 *   ❌ patientName / phone / idCardNo
 */
export type BQVisitPatientEntityType = {
  id: number;
  patientId: number; // 患者业务ID
  name: string; // 患者姓名（filter 字段：name）
  gender: string; // 性别："男" | "女" | "未知"
  age: string; // 年龄字符串，如 "30岁"
  mobile: string; // 手机号（filter 字段：mobile）
  idCard: string; // 身份证号（filter 字段：idCard）
  archiveNo: string; // 档案号
  province: number; // 省份ID
  city: number; // 城市ID
  district: number; // 区县ID
  address: string; // 详细地址
  firstAge: number; // 首次就诊年龄
  lastAge: number; // 最近就诊年龄
  ageType: number; // 年龄类型：1-岁，2-月，3-天
  isAllergy: boolean; // 是否过敏
  allergicHistory: string; // 过敏史
  pastHistory: string; // 既往史
  personalHistory: string; // 个人史
  familyHistory: string; // 家族史
  obstericalHistory: string; // 婚育史
  travelHistory: string; // 旅行史
  contactHistory: string; // 接触史
  version: number;
  deleted: boolean;
  deletedTime: string | null;
  createdBy: string;
  createdTime: string;
  updatedBy: string;
  updatedTime: string;
  tenantId: string;
};

// ==================== 返回类型 ====================

export type BQVisitPatientResultType = BQResultType<BQVisitPatientEntityType>;

export type BQVisitPatientListResultType = BQResultType<
  BQSearchListResultType<BQVisitPatientEntityType>
>;

export type BQVisitPatientPageResultType = BQResultType<
  BQSearchPageResultType<BQVisitPatientEntityType>
>;

// ==================== API ====================

/**
 * 根据ID获取单条患者记录
 * GET /get/{id}
 */
export const getVisitPatientByIdApi = (id: number) => {
  return http.request<BQVisitPatientResultType>("get", `${BASE}/get/${id}`);
};

/**
 * 新增患者记录
 * POST /save
 */
export const saveVisitPatientApi = (
  data: Partial<BQVisitPatientEntityType>
) => {
  return http.request<BQVisitPatientResultType>("post", `${BASE}/save`, {
    data
  });
};

/**
 * 批量新增患者记录
 * POST /saveBatch（单次最多 1000 条）
 */
export const saveVisitPatientBatchApi = (
  data: Partial<BQVisitPatientEntityType>[]
) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/saveBatch`, {
    data
  });
};

/**
 * 更新患者记录
 * POST /update
 */
export const updateVisitPatientApi = (data: BQVisitPatientEntityType) => {
  return http.request<BQVisitPatientResultType>("post", `${BASE}/update`, {
    data
  });
};

/**
 * 批量更新患者记录
 * POST /updateBatch（单次最多 1000 条）
 */
export const updateVisitPatientBatchApi = (
  data: BQVisitPatientEntityType[]
) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/updateBatch`, {
    data
  });
};

/**
 * 物理删除患者记录
 * GET /delete/{id}
 */
export const deleteVisitPatientApi = (id: number) => {
  return http.request<BQResultType<Boolean>>("get", `${BASE}/delete/${id}`);
};

/**
 * 批量物理删除患者记录
 * POST /deleteBatch（单次最多 1000 条）
 */
export const deleteVisitPatientBatchApi = (ids: number[]) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/deleteBatch`, {
    data: ids
  });
};

/**
 * 逻辑删除患者记录
 * GET /deleteLogic/{id}
 */
export const deleteVisitPatientLogicApi = (id: number) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `${BASE}/deleteLogic/${id}`
  );
};

/**
 * 批量逻辑删除患者记录
 * POST /deleteLogicBatch（单次最多 1000 条）
 */
export const deleteVisitPatientLogicBatchApi = (ids: number[]) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `${BASE}/deleteLogicBatch`,
    { data: ids }
  );
};

/**
 * 列表查询（支持排序和过滤）
 * GET /list
 *
 * ⚠️ filters 字段名用实体实际字段：name / mobile / idCard / gender / archiveNo
 */
export const getVisitPatientListApi = (
  params?: Partial<BQSearchParamsType>
) => {
  return http.request<BQVisitPatientListResultType>("get", `${BASE}/list`, {
    params
  });
};

/**
 * 分页查询（支持排序和过滤）
 * GET /page
 *
 * ⚠️ filters 字段名用实体实际字段：name / mobile / idCard / gender / archiveNo
 */
export const getVisitPatientPageApi = (
  params?: Partial<BQSearchParamsType> & {
    pageNum?: number;
    pageSize?: number;
  }
) => {
  return http.request<BQVisitPatientPageResultType>("get", `${BASE}/page`, {
    params
  });
};

/**
 * 关键字查询患者列表 ⭐
 * GET /search?keyword=
 *
 * 同时模糊匹配 name / mobile / idCard 三个字段（OR 逻辑）
 * keyword 为空时返回空列表
 */
export const searchVisitPatientApi = (keyword: string) => {
  return http.request<BQVisitPatientListResultType>("get", `${BASE}/search`, {
    params: { keyword }
  });
};
