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
 * 药品实体类型定义
 */
export type BQDrugEntityType = {
  name: string;
  type?: number; // 1西药 2中药 3中成药
  typeString?: string;
  specification?: string;
  manufacturer?: string;
  supplier?: string;
  prescriptionPrice?: string;
  purchaseCostPrice?: string;
  stock?: string;
  projectCode?: string;
  productionDate?: string;
  productionBatchNumber?: string;
  expireDate?: string;
  pinyin?: string;
  status?: boolean;
  source?: string; // 来源（前端扩展字段）
  wholesaleUnit?: string;
  wholesalePrice?: string;
  conversionValue?: string;
  prescriptionUnit?: string;
  singleDosage?: string;
  unitId?: number;
  useWay?: string;
  frequency?: string;
  minStock?: string;
  initialStockUnitId?: string;
  approvalNumber?: string;
  barcode?: string;
  customCode?: string;
  defaultSaleType?: number; // 0整卖 1散卖
  decoWay?: string;
  id?: number;
} & BQBaseEntityType;

/**
 * 获取药品缺省值
 */
export const getDrugEntityDefault: (
  row?: BQDrugEntityType
) => BQDrugEntityType = (row?: BQDrugEntityType) => {
  return {
    name: row?.name ?? "",
    type: row?.type,
    typeString: row?.typeString ?? "",
    specification: row?.specification ?? "",
    manufacturer: row?.manufacturer ?? "",
    supplier: row?.supplier ?? "",
    prescriptionPrice: row?.prescriptionPrice ?? "",
    purchaseCostPrice: row?.purchaseCostPrice ?? "",
    stock: row?.stock ?? "",
    projectCode: row?.projectCode ?? "",
    productionDate: row?.productionDate ?? "",
    productionBatchNumber: row?.productionBatchNumber ?? "",
    expireDate: row?.expireDate ?? "",
    status: row?.status ?? true,
    source: row?.source ?? "",
    category: row?.category ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 药品实体结果定义
 */
export type BQDrugEntityResultType = BQResultType<BQDrugEntityType>;

/**
 * 药品实体分页结果定义
 */
export type BQDrugSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQDrugEntityType>
>;

/**
 * 药品实体列表结果定义
 */
export type BQDrugSearchListResultType = BQResultType<
  BQSearchListResultType<BQDrugEntityType>
>;

/**
 * 增加药品API
 */
export const addDrugApi = (data?: object) => {
  return http.request<BQDrugEntityResultType>("post", "/drug/save", {
    data
  });
};

/**
 * 更新药品API
 */
export const updateDrugApi = (data?: object) => {
  return http.request<BQDrugEntityResultType>("post", "/drug/update", {
    data
  });
};

/**
 * 获取所有药品列表API
 */
export const getDrugListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("updatedTime", false)]
  };
  return http.request<BQDrugSearchListResultType>("get", "/drug/list", {
    params
  });
};

/**
 * 获取药品分页API
 */
export const getDrugPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQDrugSearchPageResultType>("get", "/drug/page", {
    params
  });
};

/**
 * 删除药品API
 */
export const deleteDrugApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/delete/${eid}`);
};

/**
 * 逻辑删除药品API
 */
export const deleteLogicDrugApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/deleteLogic/${eid}`);
};

/**
 * 根据IDs批量查询药品API
 */
export const getDrugsByIdsApi = (ids: number[]) => {
  return http.request<BQResultType<BQDrugEntityType[]>>(
    "get",
    "/drug/listByIds",
    { params: { ids: ids.join(",") } }
  );
};
