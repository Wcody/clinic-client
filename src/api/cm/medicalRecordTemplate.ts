import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault
} from "../api";

/**
 * 医疗记录模板实体类型定义
 */
export type BQMedicalRecordTemplateEntityType = {
  /** 主键ID（后端返回） */
  id?: number;
  /** 模板名称 */
  name: string;
  /** 模板类型：1=个人，2=诊所 */
  type?: number;
  /** 主诉 */
  complaint?: string;
  /** 现病史 */
  historyOfPresentIllness?: string;
  /** 既往史 */
  pastHistory?: string;
  /** 个人史 */
  personalHistory?: string;
  /** 家族史 */
  familyHistory?: string;
  /** 婚育史 */
  obstericalHistory?: string;
  /** 体温 */
  bodyTemperature?: number;
  /** 收缩压(高压) */
  bloodPressureHight?: number;
  /** 舒张压(低压) */
  bloodPressureLow?: number;
  /** 心率 */
  heartRate?: number;
  /** 呼吸频率 */
  breathRate?: number;
  /** 其他检查 */
  otherExamine?: string;
  /** 治疗建议 */
  treatmentRecommendation?: string;
  /** 操作人 */
  operator?: string;
  /** 操作时间 */
  operatorTime?: string;
  /** 状态:1启用 0禁用 */
  status?: boolean;
  /** 记录创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 父节点ID，用于构建树形结构 */
  parentId?: number | null;
  /** 是否为目录节点：true=目录，false=模板 */
  hasCategory?: boolean;
} & BQBaseEntityType;

/**
 * 获取医疗记录模板缺省值
 */
export const getMedicalRecordTemplateEntityDefault: (
  row?: BQMedicalRecordTemplateEntityType
) => BQMedicalRecordTemplateEntityType = (
  row?: BQMedicalRecordTemplateEntityType
) => {
  return {
    id: row?.id,
    name: row?.name ?? "",
    type: row?.type ?? 1, // 默认为个人模板（1=个人，2=诊所）
    complaint: row?.complaint ?? "",
    historyOfPresentIllness: row?.historyOfPresentIllness ?? "",
    pastHistory: row?.pastHistory ?? "",
    personalHistory: row?.personalHistory ?? "",
    familyHistory: row?.familyHistory ?? "",
    obstericalHistory: row?.obstericalHistory ?? "",
    bodyTemperature: row?.bodyTemperature ?? undefined,
    bloodPressureHight: row?.bloodPressureHight ?? undefined,
    bloodPressureLow: row?.bloodPressureLow ?? undefined,
    heartRate: row?.heartRate ?? undefined,
    breathRate: row?.breathRate ?? undefined,
    otherExamine: row?.otherExamine ?? "",
    treatmentRecommendation: row?.treatmentRecommendation ?? "",
    operator: row?.operator ?? "",
    operatorTime: row?.operatorTime ?? "",
    status: row?.status ?? true,
    parentId: row?.parentId ?? null,
    hasCategory: row?.hasCategory ?? false,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 医疗记录模板实体结果定义
 */
export type BQMedicalRecordTemplateEntityResultType =
  BQResultType<BQMedicalRecordTemplateEntityType>;

/**
 * 医疗记录模板分页结果定义
 */
export type BQMedicalRecordTemplateSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQMedicalRecordTemplateEntityType>
>;

/**
 * 医疗记录模板列表结果定义
 */
export type BQMedicalRecordTemplateSearchListResultType = BQResultType<
  BQSearchListResultType<BQMedicalRecordTemplateEntityType>
>;

/**
 * 新增医疗记录模板API
 */
export const addMedicalRecordTemplateApi = (data?: object) => {
  return http.request<BQMedicalRecordTemplateEntityResultType>(
    "post",
    "/medical/record/template/save",
    { data }
  );
};

/**
 * 更新医疗记录模板API
 */
export const updateMedicalRecordTemplateApi = (data?: object) => {
  return http.request<BQMedicalRecordTemplateEntityResultType>(
    "post",
    "/medical/record/template/update",
    { data }
  );
};

/**
 * 获取医疗记录模板列表API
 */
export const getMedicalRecordTemplateListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQMedicalRecordTemplateSearchListResultType>(
    "get",
    "/medical/record/template/list",
    { params }
  );
};

/**
 * 获取医疗记录模板分页API
 */
export const getMedicalRecordTemplatePageApi = (data?: object) => {
  const params = { ...data };
  return http.request<BQMedicalRecordTemplateSearchPageResultType>(
    "get",
    "/medical/record/template/page",
    { params }
  );
};

/**
 * 根据ID获取医疗记录模板API
 */
export const getMedicalRecordTemplateApi = (id: string) => {
  return http.request<BQMedicalRecordTemplateEntityResultType>(
    "get",
    `/medical/record/template/get/${id}`
  );
};

/**
 * 删除医疗记录模板API（逻辑删除）
 */
export const deleteMedicalRecordTemplateApi = (id: string) => {
  return http.request<Boolean>(
    "get",
    `/medical/record/template/deleteLogic/${id}`
  );
};

/**
 * 批量删除医疗记录模板API（逻辑删除）
 */
export const deleteMedicalRecordTemplateBatchApi = (ids: string[]) => {
  return http.request<Boolean>(
    "post",
    "/medical/record/template/deleteLogicBatch",
    { data: ids }
  );
};

/**
 * 获取医疗记录模板树形结构API
 */
export const getMedicalRecordTemplateTreeApi = () => {
  return http.request("get", "/medical/record/template/tree");
};
