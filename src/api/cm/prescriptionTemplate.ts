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
 * 处方模板明细实体类型定义
 */
export type BQPrescriptionTemplateDetailEntityType = {
  /** 主键ID（后端返回） */
  id?: number;
  /** 模板ID */
  templateId?: number;
  /** 药品ID */
  drugId?: number;
  /** 药品名称 */
  drugName: string;
  /** 规格 */
  specification?: string;
  /** 数量（总量） */
  quantity?: number;
  /** 单位ID */
  quantityUnit?: number;
  /** 单次用量 */
  singleUsageAmount?: number;
  /** 单次用量单位ID */
  singleUsageUnit?: number;
  /** 天数 */
  days?: number;
  /** 煎煮类型ID */
  cookingType?: number;
  /** 组号 */
  groupNo?: number;
  /** 排序 */
  sort?: number;
  /** 单价（从药品库实时获取，不持久化到模板） */
  price?: number;
} & BQBaseEntityType;

/**
 * 处方模板实体类型定义
 */
export type BQPrescriptionTemplateEntityType = {
  /** 主键ID（后端返回） */
  id?: number;
  /** 模板名称 */
  name?: string;
  /** 处方类型 */
  prescriptionType?: number;
  /** 模板类型 */
  templateType?: number;
  /** 用法类型ID */
  usageType?: number;
  /** 频率ID */
  frequence?: number;
  /** 剂数 */
  doseAmount?: number;
  /** 医嘱/建议 */
  recommendation?: string;
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
  /** 是否为目录 */
  hasCategory?: boolean;
  /** 父级目录ID */
  parentId?: number | null;
  /** 明细列表（前端使用，后端不直接存储） */
  details?: BQPrescriptionTemplateDetailEntityType[];
} & BQBaseEntityType;

/**
 * 获取处方模板缺省值
 */
export const getPrescriptionTemplateEntityDefault: (
  row?: BQPrescriptionTemplateEntityType
) => BQPrescriptionTemplateEntityType = (
  row?: BQPrescriptionTemplateEntityType
) => {
  return {
    name: row?.name ?? "",
    prescriptionType: row?.prescriptionType ?? true,
    templateType: row?.templateType ?? true,
    usageType: row?.usageType ?? undefined,
    frequence: row?.frequence ?? undefined,
    doseAmount: row?.doseAmount ?? 1,
    recommendation: row?.recommendation ?? "",
    operator: row?.operator ?? "",
    operatorTime: row?.operatorTime ?? "",
    status: row?.status ?? true,
    hasCategory: row?.hasCategory ?? false,
    parentId: row?.parentId ?? null,
    details: row?.details ?? [],

    ...getBaseEntityDefault(row)
  };
};

/**
 * 获取处方模板明细缺省值
 */
export const getPrescriptionTemplateDetailEntityDefault: (
  row?: BQPrescriptionTemplateDetailEntityType
) => BQPrescriptionTemplateDetailEntityType = (
  row?: BQPrescriptionTemplateDetailEntityType
) => {
  return {
    id: row?.id,
    templateId: row?.templateId,
    drugId: row?.drugId ?? undefined,
    drugName: row?.drugName ?? "",
    quantity: row?.quantity ?? 0,
    quantityUnit: row?.quantityUnit ?? undefined,
    cookingType: row?.cookingType ?? undefined,
    sort: row?.sort ?? 0,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 处方模板实体结果定义
 */
export type BQPrescriptionTemplateEntityResultType =
  BQResultType<BQPrescriptionTemplateEntityType>;

/**
 * 处方模板分页结果定义
 */
export type BQPrescriptionTemplateSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQPrescriptionTemplateEntityType>
>;

/**
 * 处方模板列表结果定义
 */
export type BQPrescriptionTemplateSearchListResultType = BQResultType<
  BQSearchListResultType<BQPrescriptionTemplateEntityType>
>;

/**
 * 处方模板明细实体结果定义
 */
export type BQPrescriptionTemplateDetailEntityResultType =
  BQResultType<BQPrescriptionTemplateDetailEntityType>;

/**
 * 处方模板明细列表结果定义
 */
export type BQPrescriptionTemplateDetailSearchListResultType = BQResultType<
  BQSearchListResultType<BQPrescriptionTemplateDetailEntityType>
>;

// ==================== 处方模板主表 API ====================

/**
 * 新增处方模板API
 */
export const addPrescriptionTemplateApi = (data?: object) => {
  return http.request<BQPrescriptionTemplateEntityResultType>(
    "post",
    "/prescription/template/save",
    { data }
  );
};

/**
 * 更新处方模板API
 */
export const updatePrescriptionTemplateApi = (data?: object) => {
  return http.request<BQPrescriptionTemplateEntityResultType>(
    "post",
    "/prescription/template/update",
    { data }
  );
};

/**
 * 获取处方模板列表API
 */
export const getPrescriptionTemplateListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQPrescriptionTemplateSearchListResultType>(
    "get",
    "/prescription/template/list",
    { params }
  );
};

/**
 * 获取处方模板分页API
 */
export const getPrescriptionTemplatePageApi = (data?: object) => {
  const params = { ...data };
  return http.request<BQPrescriptionTemplateSearchPageResultType>(
    "get",
    "/prescription/template/page",
    { params }
  );
};

/**
 * 获取处方模板树形结构API
 */
export const getPrescriptionTemplateTreeApi = () => {
  return http.request<BQResultType<Array<any>>>(
    "get",
    "/prescription/template/tree"
  );
};

/**
 * 根据ID获取处方模板API
 */
export const getPrescriptionTemplateApi = (id: string) => {
  return http.request<BQPrescriptionTemplateEntityResultType>(
    "get",
    `/prescription/template/get/${id}`
  );
};

/**
 * 删除处方模板API（逻辑删除）
 */
export const deletePrescriptionTemplateApi = (id: string) => {
  return http.request<Boolean>(
    "get",
    `/prescription/template/deleteLogic/${id}`
  );
};

/**
 * 批量删除处方模板API（逻辑删除）
 */
export const deletePrescriptionTemplateBatchApi = (ids: string[]) => {
  return http.request<Boolean>(
    "post",
    "/prescription/template/deleteLogicBatch",
    { data: ids }
  );
};

// ==================== 处方模板明细 API ====================

/**
 * 新增处方模板明细API
 */
export const addPrescriptionTemplateDetailApi = (data?: object) => {
  return http.request<BQPrescriptionTemplateDetailEntityResultType>(
    "post",
    "/prescription/template/detail/save",
    { data }
  );
};

/**
 * 更新处方模板明细API
 */
export const updatePrescriptionTemplateDetailApi = (data?: object) => {
  return http.request<BQPrescriptionTemplateDetailEntityResultType>(
    "post",
    "/prescription/template/detail/update",
    { data }
  );
};

/**
 * 获取处方模板明细列表API
 */
export const getPrescriptionTemplateDetailListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("sort")]
  };
  return http.request<BQPrescriptionTemplateDetailSearchListResultType>(
    "get",
    "/prescription/template/detail/list",
    { params }
  );
};

/**
 * 根据模板ID获取明细列表API
 */
export const getPrescriptionTemplateDetailByTemplateIdApi = (
  templateId: string
) => {
  const params = {
    filters: [new BQSearchFilter("templateId", "eq", templateId)]
  };
  return http.request<BQPrescriptionTemplateDetailSearchListResultType>(
    "get",
    "/prescription/template/detail/list",
    { params }
  );
};

/**
 * 删除处方模板明细API（逻辑删除）
 */
export const deletePrescriptionTemplateDetailApi = (id: string) => {
  return http.request<Boolean>(
    "get",
    `/prescription/template/detail/deleteLogic/${id}`
  );
};

/**
 * 批量删除处方模板明细API（逻辑删除）
 */
export const deletePrescriptionTemplateDetailBatchApi = (ids: string[]) => {
  return http.request<Boolean>(
    "post",
    "/prescription/template/detail/deleteLogicBatch",
    { data: ids }
  );
};
