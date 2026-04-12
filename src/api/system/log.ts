import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType
} from "../api";

/**
 * 日志实体分页结果定义
 */
export type BQLogSearchPageResultType = BQResultType<
  BQSearchPageResultType<object>
>;

/**
 * 日志实体列表结果定义
 */
export type BQLogSearchListResultType = BQResultType<
  BQSearchListResultType<object>
>;

/**
 * 获取所有日志API
 */
export const getLogListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQLogSearchListResultType>("get", "/log/list", {
    params
  });
};

/**
 * 获取所有日志分页API
 */
export const getLogPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQLogSearchPageResultType>("get", "/log/page", {
    params
  });
};

/**
 * 删除日志API
 */
export const deleteLogApi = (eid: string) => {
  return http.request<Boolean>("get", `/log/delete/${eid}`);
};

/**
 * 批量删除日志API
 */
export const deleteBatchLogApi = (eids: Array<string>) => {
  return http.request<Boolean>("post", `/log/deleteBatch`, {
    data: eids
  });
};

/**
 * 获取登录日志分页API
 */
export const getLogPageLoginApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQLogSearchPageResultType>("get", "/log/pageLogin", {
    params
  });
};

/**
 * 获取操作日志分页API
 */
export const getLogPageOperationApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQLogSearchPageResultType>("get", "/log/pageOperation", {
    params
  });
};

/**
 * 获取系统日志分页API
 */
export const getLogPageSystemApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQLogSearchPageResultType>("get", "/log/pageSystem", {
    params
  });
};

/**
 * 获取注销日志分页API
 */
export const getLogPageLogoffApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQLogSearchPageResultType>("get", "/log/pageLogoff", {
    params
  });
};

/**
 * 清空登录日志API
 */
export const clearLoginLogApi = () => {
  return http.request<Boolean>("post", `/log/clearLoginLog`);
};

/**
 * 清空操作日志API
 */
export const clearOperationLogApi = () => {
  return http.request<Boolean>("post", `/log/clearOperationLog`);
};

/**
 * 清空系统日志API
 */
export const clearSystemLogApi = () => {
  return http.request<Boolean>("post", `/log/clearSystemLog`);
};

/**
 * 清空注销日志API
 */
export const clearLogoffLogApi = () => {
  return http.request<Boolean>("post", `/log/clearLogoffLog`);
};
