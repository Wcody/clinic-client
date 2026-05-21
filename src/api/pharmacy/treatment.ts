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
 * 治疗项目实体类型定义
 */
export type BQTreatmentItemEntityType = {
  id?: number;
  name: string;
  pinyin?: string;
  seq?: string;
  projectCode?: string;
  sellingPrice?: string;
  costPrice?: string;
  status?: string;
  isExecProject?: boolean;
  tenantInitData?: boolean;
} & BQBaseEntityType;

/**
 * 获取治疗项目缺省值
 */
export const getTreatmentItemEntityDefault: (
  row?: BQTreatmentItemEntityType
) => BQTreatmentItemEntityType = (row?: BQTreatmentItemEntityType) => {
  return {
    name: row?.name ?? "",
    pinyin: row?.pinyin ?? "",
    seq: row?.seq ?? "",
    projectCode: row?.projectCode ?? "",
    sellingPrice: row?.sellingPrice ?? "",
    costPrice: row?.costPrice ?? "",
    status: row?.status ?? "启用",
    isExecProject: row?.isExecProject ?? false,
    tenantInitData: row?.tenantInitData ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 治疗项目实体结果定义
 */
export type BQTreatmentItemEntityResultType = BQResultType<BQTreatmentItemEntityType>;

/**
 * 治疗项目实体分页结果定义
 */
export type BQTreatmentItemSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQTreatmentItemEntityType>
>;

/**
 * 治疗项目实体列表结果定义
 */
export type BQTreatmentItemSearchListResultType = BQResultType<
  BQSearchListResultType<BQTreatmentItemEntityType>
>;

/**
 * 增加治疗项目API
 */
export const addTreatmentItemApi = (data?: object) => {
  return http.request<BQTreatmentItemEntityResultType>("post", "/treatment/item/save", {
    data
  });
};

/**
 * 更新治疗项目API
 */
export const updateTreatmentItemApi = (data?: object) => {
  return http.request<BQTreatmentItemEntityResultType>("post", "/treatment/item/update", {
    data
  });
};

/**
 * 获取所有治疗项目列表API
 */
export const getTreatmentItemListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQTreatmentItemSearchListResultType>("get", "/treatment/item/list", {
    params
  });
};

/**
 * 关键字搜索治疗项目（匹配项目名称 / 拼音码）
 */
export const searchTreatmentItemApi = (keyword?: string) => {
  return http.request<BQTreatmentItemSearchListResultType>("get", "/treatment/item/search", {
    params: { keyword }
  });
};

/**
 * 获取治疗项目分页API
 */
export const getTreatmentItemPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQTreatmentItemSearchPageResultType>("get", "/treatment/item/page", {
    params
  });
};

/**
 * 删除治疗项目API
 */
export const deleteTreatmentItemApi = (eid: string) => {
  return http.request<Boolean>("get", `/treatment/item/delete/${eid}`);
};

/**
 * 逻辑删除治疗项目API
 */
export const deleteLogicTreatmentItemApi = (eid: string) => {
  return http.request<Boolean>("get", `/treatment/item/deleteLogic/${eid}`);
};
