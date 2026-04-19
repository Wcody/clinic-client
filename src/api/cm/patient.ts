import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault,
  BQSearchFilter
} from "../api";

/**
 * 患者实体类型定义
 */
export type BQPatientEntityType = {
  id?: number; // 患者ID（数字类型，来自BQIdBaseEntity）
  name: string; // 患者姓名
  gender: string; // 性别
  age?: string; // 年龄（字符串格式，如"5岁3月"）
  mobile: string; // 手机号
  idCard: string; // 身份证号
  archiveNo?: string; // 档案号
  province?: number; // 省份ID
  city?: number; // 城市ID
  district?: number; // 区县ID
  address?: string; // 详细地址
  firstAge?: number; // 初诊年龄
  lastAge?: number; // 末次年龄
  ageType?: number; // 年龄类型：1=岁, 2=月, 3=天
  isAllergy?: boolean; // 是否过敏
  allergicHistory?: string; // 过敏史
  pastHistory?: string; // 既往史
  personalHistory?: string; // 个人史
  familyHistory?: string; // 家族史
  obstericalHistory?: string; // 婚育史
  travelHistory?: string; // 旅行史
  contactHistory?: string; // 接触史
} & BQBaseEntityType;

/**
 * 获取患者缺省值
 */
export const getPatientEntityDefault: (
  row?: BQPatientEntityType
) => BQPatientEntityType = (row?: BQPatientEntityType) => {
  return {
    name: row?.name ?? "",
    gender: row?.gender ?? "男",
    age: row?.age ?? "",
    mobile: row?.mobile ?? "",
    idCard: row?.idCard ?? "",
    archiveNo: row?.archiveNo ?? "",
    province: row?.province ?? undefined,
    city: row?.city ?? undefined,
    district: row?.district ?? undefined,
    address: row?.address ?? "",
    firstAge: row?.firstAge ?? 0,
    lastAge: row?.lastAge ?? 0,
    ageType: row?.ageType ?? 1,
    isAllergy: row?.isAllergy ?? false,
    allergicHistory: row?.allergicHistory ?? "",
    pastHistory: row?.pastHistory ?? "",
    personalHistory: row?.personalHistory ?? "",
    familyHistory: row?.familyHistory ?? "",
    obstericalHistory: row?.obstericalHistory ?? "",
    travelHistory: row?.travelHistory ?? "",
    contactHistory: row?.contactHistory ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 患者实体结果定义
 */
export type BQPatientEntityResultType = BQResultType<BQPatientEntityType>;

/**
 * 患者实体分页结果定义
 */
export type BQPatientSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQPatientEntityType>
>;

/**
 * 患者实体列表结果定义
 */
export type BQPatientSearchListResultType = BQResultType<
  BQSearchListResultType<BQPatientEntityType>
>;

/**
 * 根据ID获取单个患者API
 */
export const getPatientByIdApi = (id: number) => {
  return http.request<BQPatientEntityResultType>("get", `/patient/get/${id}`);
};

/**
 * 增加患者API
 */
export const addPatientApi = (data?: object) => {
  return http.request<BQPatientEntityResultType>("post", "/patient/save", {
    data
  });
};

/**
 * 更新患者API
 */
export const updatePatientApi = (data?: object) => {
  return http.request<BQPatientEntityResultType>("post", "/patient/update", {
    data
  });
};

/**
 * 获取所有患者API
 */
export const getPatientListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQPatientSearchListResultType>("get", "/patient/list", {
    params
  });
};

/**
 * 获取所有患者API
 */
export const getPatientKind0ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("patientKind", "eq", "0")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQPatientSearchListResultType>("get", "/patient/list", {
    params
  });
};

/**
 * 获取所有患者API
 */
export const getPatientKind1ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("patientKind", "eq", "1")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQPatientSearchListResultType>("get", "/patient/list", {
    params
  });
};

/**
 * 获取所有患者分页API
 */
export const getPatientPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQPatientSearchPageResultType>("get", "/patient/page", {
    params
  });
};

/**
 * 删除患者API
 */
export const deletePatientApi = (eid: string) => {
  return http.request<Boolean>("get", `/patient/delete/${eid}`);
};

/**
 * 患者启用禁用API
 */
export const setStatusPatientApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/patient/setStatus/${eid}/${status}`);
};
