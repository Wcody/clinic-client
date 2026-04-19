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
 * 药品入库实体类型定义
 */
export type BQDrugWarehousingEntityType = {
  serialNumber: string;
  seq?: string;
  drugWarehousingType?: string; // 采购入库/其他入库
  amount?: string;
  operatorPerson?: string;
  created?: string;
} & BQBaseEntityType;

/**
 * 获取药品入库缺省值
 */
export const getDrugWarehousingEntityDefault: (
  row?: BQDrugWarehousingEntityType
) => BQDrugWarehousingEntityType = (row?: BQDrugWarehousingEntityType) => {
  return {
    serialNumber: row?.serialNumber ?? "",
    seq: row?.seq ?? "",
    drugWarehousingType: row?.drugWarehousingType ?? "",
    amount: row?.amount ?? "",
    operatorPerson: row?.operatorPerson ?? "",
    created: row?.created ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 药品入库实体结果定义
 */
export type BQDrugWarehousingEntityResultType = BQResultType<BQDrugWarehousingEntityType>;

/**
 * 药品入库实体分页结果定义
 */
export type BQDrugWarehousingSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQDrugWarehousingEntityType>
>;

/**
 * 药品入库实体列表结果定义
 */
export type BQDrugWarehousingSearchListResultType = BQResultType<
  BQSearchListResultType<BQDrugWarehousingEntityType>
>;

/**
 * 增加药品入库API
 */
export const addDrugWarehousingApi = (data?: object) => {
  return http.request<BQDrugWarehousingEntityResultType>("post", "/drug/warehousing/save", {
    data
  });
};

/**
 * 更新药品入库API
 */
export const updateDrugWarehousingApi = (data?: object) => {
  return http.request<BQDrugWarehousingEntityResultType>("post", "/drug/warehousing/update", {
    data
  });
};

/**
 * 获取所有药品入库列表API
 */
export const getDrugWarehousingListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("created", false)]
  };
  return http.request<BQDrugWarehousingSearchListResultType>("get", "/drug/warehousing/list", {
    params
  });
};

/**
 * 获取药品入库分页API
 */
export const getDrugWarehousingPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQDrugWarehousingSearchPageResultType>("get", "/drug/warehousing/page", {
    params
  });
};

/**
 * 删除药品入库API
 */
export const deleteDrugWarehousingApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/warehousing/delete/${eid}`);
};

/**
 * 逻辑删除药品入库API
 */
export const deleteLogicDrugWarehousingApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/warehousing/deleteLogic/${eid}`);
};
