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
 * 组别实体类型定义
 */
export type BQGroupEntityType = {
  parentId: string;
  name: string;
  principal: string;
  phone: string;
  kindId: number;
  orderValue: number;
  email: string;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取组别缺省值
 */
export const getGroupEntityDefault: (
  row?: BQGroupEntityType
) => BQGroupEntityType = (row?: BQGroupEntityType) => {
  console.log("row", row);
  return {
    parentId: row?.parentId ?? "0",
    name: row?.name ?? "",
    principal: row?.principal ?? "",
    phone: row?.phone ?? "",
    email: row?.email ?? "",
    remark: row?.remark ?? "",
    status: row?.status ?? true,
    kindId: row?.kindId ?? 0,
    orderValue: row?.orderValue ?? 99,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 组别实体结果定义
 */
export type BQGroupEntityResultType = BQResultType<BQGroupEntityType>;

/**
 * 组别实体分页结果定义
 */
export type BQGroupSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQGroupEntityType>
>;

/**
 * 组别实体列表结果定义
 */
export type BQGroupSearchListResultType = BQResultType<
  BQSearchListResultType<BQGroupEntityType>
>;

/**
 * 增加组别API
 */
export const addGroupApi = (data?: object) => {
  return http.request<BQGroupEntityResultType>("post", "/group/save", {
    data
  });
};

/**
 * 更新组别API
 */
export const updateGroupApi = (data?: object) => {
  return http.request<BQGroupEntityResultType>("post", "/group/update", {
    data
  });
};

/**
 * 获取所有组别API
 */
export const getGroupListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("kindId", "eq", "0")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQGroupSearchListResultType>("get", "/group/list", {
    params
  });
};

/**
 * 获取所有组别API
 */
export const getGroupKind0ListApi = (data?: object) => {
  const params = {
    ...data,
    filters: [new BQSearchFilter("kindId", "eq", "0")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQGroupSearchListResultType>("get", "/group/list", {
    params
  });
};

/**
 * 获取所有组别API
 */
export const getGroupKind1ListApi = (data?: object) => {
  const params = {
    ...data,
    filters: [new BQSearchFilter("kindId", "eq", "1")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQGroupSearchListResultType>("get", "/group/list", {
    params
  });
};

/**
 * 删除组别API
 */
export const deleteGroupApi = (eid: string) => {
  return http.request<Boolean>("get", `/group/delete/${eid}`);
};

/**
 * 组别启用禁用API
 */
export const setStatusGroupApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/group/setStatus/${eid}/${status}`);
};
