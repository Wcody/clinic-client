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
 * 科室实体类型定义
 */
export type BQDeptEntityType = {
  parentId: string;
  name: string;
  principal: string;
  phone: string;
  orderValue: number;
  email: string;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取科室缺省值
 */
export const getDeptEntityDefault: (
  row?: BQDeptEntityType
) => BQDeptEntityType = (row?: BQDeptEntityType) => {
  return {
    parentId: row?.parentId ?? "0",
    name: row?.name ?? "",
    principal: row?.principal ?? "",
    phone: row?.phone ?? "",
    email: row?.email ?? "",
    remark: row?.remark ?? "",
    status: row?.status ?? true,
    orderValue: row?.orderValue ?? 99,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 科室实体结果定义
 */
export type BQDeptEntityResultType = BQResultType<BQDeptEntityType>;

/**
 * 科室实体分页结果定义
 */
export type BQDeptSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQDeptEntityType>
>;

/**
 * 科室实体列表结果定义
 */
export type BQDeptSearchListResultType = BQResultType<
  BQSearchListResultType<BQDeptEntityType>
>;

/**
 * 增加科室API
 */
export const addDeptApi = (data?: object) => {
  return http.request<BQDeptEntityResultType>("post", "/dept/save", {
    data
  });
};

/**
 * 更新科室API
 */
export const updateDeptApi = (data?: object) => {
  return http.request<BQDeptEntityResultType>("post", "/dept/update", {
    data
  });
};

/**
 * 获取所有科室API
 */
export const getDeptListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQDeptSearchListResultType>("get", "/dept/list", {
    params
  });
};

/**
 * 删除科室API
 */
export const deleteDeptApi = (eid: string) => {
  return http.request<Boolean>("get", `/dept/delete/${eid}`);
};

/**
 * 科室启用禁用
 */
export const setStatusDeptApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/dept/setStatus/${eid}/${status}`);
};
