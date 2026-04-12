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
 * 客户实体类型定义
 */
export type BQCustomerEntityType = {
  parentId: string;
  name: string;
  authType: number;
  principal: string;
  phone: string;
  email: string;
  address: string;
  maxTenantCount: number;
  maxUserCount: number;
  status: boolean;
  deviceCode: string;
  expireDate: Date;
  remark: string;
  lastUpdatedTime: Date;
} & BQBaseEntityType;

/**
 * 获取客户缺省值
 */
export const getCustomerEntityDefault: (
  row?: BQCustomerEntityType
) => BQCustomerEntityType = (row?: BQCustomerEntityType) => {
  return {
    parentId: row?.parentId ?? "0",
    name: row?.name ?? "",
    authType: row?.authType ?? 0,
    principal: row?.principal ?? "",
    phone: row?.phone ?? "",
    email: row?.email ?? "",
    address: row?.address ?? "",
    remark: row?.remark ?? "",
    maxTenantCount: row?.maxTenantCount ?? 1,
    maxUserCount: row?.maxUserCount ?? 5,
    status: row?.status ?? true,
    deviceCode: row?.deviceCode ?? "",
    expireDate: row?.expireDate ?? undefined,
    lastUpdatedTime: row?.lastUpdatedTime ?? undefined,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 客户实体结果定义
 */
export type BQCustomerEntityResultType = BQResultType<BQCustomerEntityType>;

/**
 * 客户实体分页结果定义
 */
export type BQCustomerSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQCustomerEntityType>
>;

/**
 * 客户实体列表结果定义
 */
export type BQCustomerSearchListResultType = BQResultType<
  BQSearchListResultType<BQCustomerEntityType>
>;

/**
 * 增加客户API
 */
export const addCustomerApi = (data?: object) => {
  return http.request<BQCustomerEntityResultType>("post", "/customer/save", {
    data
  });
};

/**
 * 更新客户API
 */
export const updateCustomerApi = (data?: object) => {
  return http.request<BQCustomerEntityResultType>("post", "/customer/update", {
    data
  });
};

/**
 * 获取所有客户API
 */
export const getCustomerListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQCustomerSearchListResultType>("get", "/customer/list", {
    params
  });
};

/**
 * 获取所有客户分页API
 */
export const getCustomerPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQCustomerSearchPageResultType>("get", "/customer/page", {
    params
  });
};

/**
 * 删除客户API
 */
export const deleteCustomerApi = (eid: string) => {
  return http.request<Boolean>("get", `/customer/delete/${eid}`);
};

/**
 * 批量删除客户API
 */
export const deleteBatchCustomerApi = (data: Array<String>) => {
  return http.request<Boolean>("post", `/customer/deleteBatch`, {
    data
  });
};

/**
 * 根据客户ID获取客户管理员ID列表
 */
export const getUserIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/customer/getUserIdsBy/${eid}`
  );
};

/** 保存客户管理员列表 */
export const saveUserIdsApi = (eid: string, data?: object) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `/customer/saveUserIds/${eid}`,
    {
      data
    }
  );
};

/**
 * 根据客户ID获取菜单ID
 */
export const getMenuIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/customer/getMenuIdsBy/${eid}`
  );
};

/**
 * 根据客户ID保存菜单ID
 */
export const saveMenuIdsByApi = (eid: string, menuIds: Array<String>) => {
  return http.request<BQResultType<Array<String>>>(
    "post",
    `/customer/saveMenuIds/${eid}`,
    {
      data: menuIds
    }
  );
};

/**
 * 客户启用禁用API
 */
export const setStatusCustomerApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/customer/setStatus/${eid}/${status}`);
};
