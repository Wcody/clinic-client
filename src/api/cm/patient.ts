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
  patientKind: number;
  patientCode: string;
  patientName: string;
  idCard: string;
  gender: number;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  nationality: string;
  ethnicity: string;
  maritalStatus: number;
  hasAllergy: boolean;
  allergicDrug: string;
  contactPerson: string;
  contactRelation: string;
  contactPhoneNumber: string;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取患者缺省值
 */
export const getPatientEntityDefault: (
  row?: BQPatientEntityType
) => BQPatientEntityType = (row?: BQPatientEntityType) => {
  return {
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
    status: row?.status ?? true,
    remark: row?.remark ?? "",
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
