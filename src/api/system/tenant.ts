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
 * 诊所实体类型定义
 */
export type BQTenantEntityType = {
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
 * 获取诊所缺省值
 */
export const getTenantEntityDefault: (
  row?: BQTenantEntityType
) => BQTenantEntityType = (row?: BQTenantEntityType) => {
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

export type BQTenantInfoType = {
  tenantId: string;
  tenantName: string;
  tenantLogo: string;
};

/**
 * 诊所实体结果定义
 */
export type BQTenantEntityResultType = BQResultType<BQTenantEntityType>;

/**
 * 诊所信息结果定义
 */
export type BQTenantInfoResultType = BQResultType<BQTenantInfoType>;

/**
 * 诊所实体分页结果定义
 */
export type BQTenantSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQTenantEntityType>
>;

/**
 * 诊所实体列表结果定义
 */
export type BQTenantSearchListResultType = BQResultType<
  BQSearchListResultType<BQTenantEntityType>
>;

/**
 * 获取诊所API
 */
export const getTenantInfoApi = () => {
  return http.request<BQTenantInfoResultType>("get", "/tenant/getInfo");
};

/**
 * 增加诊所API
 */
export const addTenantApi = (data?: object) => {
  return http.request<BQTenantEntityResultType>("post", "/tenant/save", {
    data
  });
};

/**
 * 更新诊所API
 */
export const updateTenantApi = (data?: object) => {
  return http.request<BQTenantEntityResultType>("post", "/tenant/update", {
    data
  });
};

/**
 * 获取所有诊所API
 */
export const getTenantListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQTenantSearchListResultType>("get", "/tenant/list", {
    params
  });
};

/**
 * 获取所有诊所分页API
 */
export const getTenantPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQTenantSearchPageResultType>("get", "/tenant/page", {
    params
  });
};

/**
 * 删除诊所API
 */
export const deleteTenantApi = (eid: string) => {
  return http.request<Boolean>("get", `/tenant/delete/${eid}`);
};

/**
 * 批量删除诊所API
 */
export const deleteBatchTenantApi = (data: Array<String>) => {
  return http.request<Boolean>("post", `/tenant/deleteBatch`, {
    data
  });
};

/**
 * 根据角色ID获取诊所管理员ID列表
 */
export const getUserIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/tenant/getUserIdsBy/${eid}`
  );
};

/** 保存诊所管理员列表 */
export const saveUserIdsApi = (eid: string, data?: object) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `/tenant/saveUserIds/${eid}`,
    {
      data
    }
  );
};

/**
 * 根据角色ID获取菜单ID
 */
export const getMenuIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/tenant/getMenuIdsBy/${eid}`
  );
};

/**
 * 根据角色I保存菜单ID
 */
export const saveMenuIdsByApi = (eid: string, menuIds: Array<String>) => {
  return http.request<BQResultType<Array<String>>>(
    "post",
    `/tenant/saveMenuIds/${eid}`,
    {
      data: menuIds
    }
  );
};

/**
 * 诊所启用禁用API
 */
export const setStatusTenantApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/tenant/setStatus/${eid}/${status}`);
};
