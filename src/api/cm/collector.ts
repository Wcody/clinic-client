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
 * 采集器实体类型定义
 */
export type BQCollectorEntityType = {
  collectorName: string;
  computerName: string;
  deviceId: string;
  remoteIp: string;
  remotePort: number;
  processedDocs: number;
  successDocs: number;
  lastTime: string;
  remark: string;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取采集器缺省值
 */
export const getCollectorEntityDefault: (
  row?: BQCollectorEntityType
) => BQCollectorEntityType = (row?: BQCollectorEntityType) => {
  console.log("row", row);
  return {
    collectorName: row?.collectorName ?? "",
    computerName: row?.computerName ?? "",
    deviceId: row?.deviceId ?? "",
    remoteIp: row?.remoteIp ?? "",
    remotePort: row?.remotePort ?? 0,
    processedDocs: row?.processedDocs ?? 0,
    successDocs: row?.successDocs ?? 0,
    lastTime: row?.lastTime ?? "",
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 采集器实体结果定义
 */
export type BQCollectorEntityResultType = BQResultType<BQCollectorEntityType>;

/**
 * 采集器实体分页结果定义
 */
export type BQCollectorSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQCollectorEntityType>
>;

/**
 * 采集器实体列表结果定义
 */
export type BQCollectorSearchListResultType = BQResultType<
  BQSearchListResultType<BQCollectorEntityType>
>;

/**
 * 增加采集器API
 */
export const addCollectorApi = (data?: object) => {
  return http.request<BQCollectorEntityResultType>("post", "/collector/save", {
    data
  });
};

/**
 * 更新采集器API
 */
export const updateCollectorApi = (data?: object) => {
  return http.request<BQCollectorEntityResultType>(
    "post",
    "/collector/update",
    {
      data
    }
  );
};

/**
 * 获取所有采集器API
 */
export const getCollectorListApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQCollectorSearchListResultType>(
    "get",
    "/collector/list",
    {
      params
    }
  );
};

/**
 * 获取所有采集器分页API
 */
export const getCollectorPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQCollectorSearchPageResultType>(
    "get",
    "/collector/page",
    {
      params
    }
  );
};

/**
 * 删除采集器API
 */
export const deleteCollectorApi = (eid: string) => {
  return http.request<Boolean>("get", `/collector/delete/${eid}`);
};

/**
 * 采集器启用禁用API
 */
export const setStatusCollectorApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/collector/setStatus/${eid}/${status}`);
};
