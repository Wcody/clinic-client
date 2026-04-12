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
 * 分类实体类型定义
 */
export type BQKindEntityType = {
  name: string;
  code: string;
  kind: number;
  status: boolean;
  remark: string;
  orderValue: number;
} & BQBaseEntityType;

/**
 * 获取分类缺省值
 */
export const getKindEntityDefault: (
  row?: BQKindEntityType
) => BQKindEntityType = (row?: BQKindEntityType) => {
  console.log("row", row);
  return {
    name: row?.name ?? "",
    code: row?.code ?? "",
    kind: row?.kind ?? 0,
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    orderValue: row?.orderValue ?? 9999,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 分类实体结果定义
 */
export type BQKindEntityResultType = BQResultType<BQKindEntityType>;

/**
 * 分类实体分页结果定义
 */
export type BQKindSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQKindEntityType>
>;

/**
 * 分类实体列表结果定义
 */
export type BQKindSearchListResultType = BQResultType<
  BQSearchListResultType<BQKindEntityType>
>;

/**
 * 增加分类API
 */
export const addKindApi = (data?: object) => {
  return http.request<BQKindEntityResultType>("post", "/kind/save", {
    data
  });
};

/**
 * 更新分类API
 */
export const updateKindApi = (data?: object) => {
  return http.request<BQKindEntityResultType>("post", "/kind/update", {
    data
  });
};

/**
 * 获取所有分类API
 */
export const getKindListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindSearchListResultType>("get", "/kind/list", {
    params
  });
};

/**
 * 获取所有分类API
 */
export const getKind0ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("kind", "eq", "0")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindSearchListResultType>("get", "/kind/list", {
    params
  });
};

/**
 * 获取所有分类API
 */
export const getKind1ListApi = () => {
  const params = {
    filters: [new BQSearchFilter("kind", "eq", "1")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindSearchListResultType>("get", "/kind/list", {
    params
  });
};

/**
 * 获取所有分类API
 */
export const getKindByKindListApi = (initKind: number) => {
  const params = {
    filters: [new BQSearchFilter("kind", "eq", initKind + "")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindSearchListResultType>("get", "/kind/list", {
    params
  });
};

/**
 * 获取所有分类分页API
 */
export const getKindPageApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindSearchPageResultType>("get", "/kind/page", {
    params
  });
};

/**
 * 删除分类API
 */
export const deleteKindApi = (eid: string) => {
  return http.request<Boolean>("get", `/kind/delete/${eid}`);
};

/**
 * 分类启用禁用API
 */
export const setStatusKindApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/kind/setStatus/${eid}/${status}`);
};

/**
 * 获取齐套性检验列表API
 */
export const getQtKindByKindListApi = data => {
  return http.request<BQKindSearchListResultType>("post", "/kind/listQt", {
    data
  });
};
