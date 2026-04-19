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
 * 门诊病历模板实体类型定义
 */
export type BQWzTemplateEntityType = {
  name: string;
  category: string;
  kind1Id: string;
  kind2Id: string;
  chiefComplaint: string;
  presentIllness: string;
  pastHistory: string;
  personalHistory: string;
  marriageHistory: string;
  familyHistory: string;
  temperature: string;
  heartRate: string;
  respRate: string;
  bloodPressureH: string;
  bloodPressureL: string;
  otherExams: string;
  treatment: string;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取门诊病历模板缺省值
 */
export const getWzTemplateEntityDefault: (
  row?: BQWzTemplateEntityType
) => BQWzTemplateEntityType = (row?: BQWzTemplateEntityType) => {
  return {
    name: row?.name ?? "",
    category: row?.category ?? "personal",
    kind1Id: row?.kind1Id ?? "",
    kind2Id: row?.kind2Id ?? "",
    chiefComplaint: row?.chiefComplaint ?? "",
    presentIllness: row?.presentIllness ?? "",
    pastHistory: row?.pastHistory ?? "",
    personalHistory: row?.personalHistory ?? "",
    marriageHistory: row?.marriageHistory ?? "",
    familyHistory: row?.familyHistory ?? "",
    temperature: row?.temperature ?? "",
    heartRate: row?.heartRate ?? "",
    respRate: row?.respRate ?? "",
    bloodPressureH: row?.bloodPressureH ?? "",
    bloodPressureL: row?.bloodPressureL ?? "",
    otherExams: row?.otherExams ?? "",
    treatment: row?.treatment ?? "",
    status: row?.status ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 门诊病历模板实体结果定义
 */
export type BQWzTemplateEntityResultType = BQResultType<BQWzTemplateEntityType>;

/**
 * 门诊病历模板分页结果定义
 */
export type BQWzTemplateSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQWzTemplateEntityType>
>;

/**
 * 门诊病历模板列表结果定义
 */
export type BQWzTemplateSearchListResultType = BQResultType<
  BQSearchListResultType<BQWzTemplateEntityType>
>;

/**
 * 新增门诊病历模板API
 */
export const addWzTemplateApi = (data?: object) => {
  return http.request<BQWzTemplateEntityResultType>(
    "post",
    "/wz/template/save",
    { data }
  );
};

/**
 * 更新门诊病历模板API
 */
export const updateWzTemplateApi = (data?: object) => {
  return http.request<BQWzTemplateEntityResultType>(
    "post",
    "/wz/template/update",
    { data }
  );
};

/**
 * 获取门诊病历模板列表API
 */
export const getWzTemplateListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQWzTemplateSearchListResultType>(
    "get",
    "/wz/template/list",
    { params }
  );
};

/**
 * 获取门诊病历模板分页API
 */
export const getWzTemplatePageApi = (data?: object) => {
  const params = { ...data };
  return http.request<BQWzTemplateSearchPageResultType>(
    "get",
    "/wz/template/page",
    { params }
  );
};

/**
 * 删除门诊病历模板API
 */
export const deleteWzTemplateApi = (eid: string) => {
  return http.request<Boolean>("get", `/wz/template/delete/${eid}`);
};

/**
 * 门诊病历模板启用禁用API
 */
export const setStatusWzTemplateApi = (eid: string, status: boolean) => {
  return http.request<Boolean>(
    "post",
    `/wz/template/setStatus/${eid}/${status}`
  );
};
