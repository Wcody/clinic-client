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
 * 药品库存实体类型定义
 */
export type BQDrugStockEntityType = {
  name: string;
  type?: number; // 1西药 2中药 3中成药
  typeString?: string;
  specification?: string;
  manufacturer?: string;
  stock?: string;
  minimumStock?: string;
} & BQBaseEntityType;

/**
 * 获取药品库存缺省值
 */
export const getDrugStockEntityDefault: (
  row?: BQDrugStockEntityType
) => BQDrugStockEntityType = (row?: BQDrugStockEntityType) => {
  return {
    name: row?.name ?? "",
    type: row?.type,
    typeString: row?.typeString ?? "",
    specification: row?.specification ?? "",
    manufacturer: row?.manufacturer ?? "",
    stock: row?.stock ?? "",
    minimumStock: row?.minimumStock ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 药品库存实体结果定义
 */
export type BQDrugStockEntityResultType = BQResultType<BQDrugStockEntityType>;

/**
 * 药品库存实体分页结果定义
 */
export type BQDrugStockSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQDrugStockEntityType>
>;

/**
 * 药品库存实体列表结果定义
 */
export type BQDrugStockSearchListResultType = BQResultType<
  BQSearchListResultType<BQDrugStockEntityType>
>;

/**
 * 增加药品库存API
 */
export const addDrugStockApi = (data?: object) => {
  return http.request<BQDrugStockEntityResultType>("post", "/drug/stock/save", {
    data
  });
};

/**
 * 更新药品库存API
 */
export const updateDrugStockApi = (data?: object) => {
  return http.request<BQDrugStockEntityResultType>("post", "/drug/stock/update", {
    data
  });
};

/**
 * 获取所有药品库存列表API
 */
export const getDrugStockListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQDrugStockSearchListResultType>("get", "/drug/stock/list", {
    params
  });
};

/**
 * 获取药品库存分页API
 */
export const getDrugStockPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQDrugStockSearchPageResultType>("get", "/drug/stock/page", {
    params
  });
};

/**
 * 删除药品库存API
 */
export const deleteDrugStockApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/stock/delete/${eid}`);
};

/**
 * 逻辑删除药品库存API
 */
export const deleteLogicDrugStockApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/stock/deleteLogic/${eid}`);
};
