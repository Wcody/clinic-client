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
 * 角色实体类型定义
 */
export type BQRoleEntityType = {
  name: string;
  secretLevel: number;
  code: string;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取角色缺省值
 */
export const getRoleEntityDefault: (
  row?: BQRoleEntityType
) => BQRoleEntityType = (row?: BQRoleEntityType) => {
  console.log("row", row);
  return {
    name: row?.name ?? "",
    secretLevel: row?.secretLevel ?? 0,
    code: row?.code ?? "",
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 角色实体结果定义
 */
export type BQRoleEntityResultType = BQResultType<BQRoleEntityType>;

/**
 * 角色实体分页结果定义
 */
export type BQRoleSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQRoleEntityType>
>;

/**
 * 角色实体列表结果定义
 */
export type BQRoleSearchListResultType = BQResultType<
  BQSearchListResultType<BQRoleEntityType>
>;

/**
 * 增加角色API
 */
export const addRoleApi = (data?: object) => {
  return http.request<BQRoleEntityResultType>("post", "/role/save", {
    data
  });
};

/**
 * 更新角色API
 */
export const updateRoleApi = (data?: object) => {
  return http.request<BQRoleEntityResultType>("post", "/role/update", {
    data
  });
};

/**
 * 获取所有角色API
 */
export const getRoleListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQRoleSearchListResultType>("get", "/role/list", {
    params
  });
};

/**
 * 获取所有角色分页API
 */
export const getRolePageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQRoleSearchPageResultType>("get", "/role/page", {
    params
  });
};

/**
 * 删除角色API
 */
export const deleteRoleApi = (eid: string) => {
  return http.request<Boolean>("get", `/role/delete/${eid}`);
};

/**
 * 角色启用禁用API
 */
export const setStatusRoleApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/role/setStatus/${eid}/${status}`);
};
