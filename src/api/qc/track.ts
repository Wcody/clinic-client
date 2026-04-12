import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  BQSearchFilter
} from "../api";

/**
 * 日志实体分页结果定义
 */
export type BQRecordTrackSearchPageResultType = BQResultType<
  BQSearchPageResultType<object>
>;

/**
 * 日志实体列表结果定义
 */
export type BQRecordTrackSearchListResultType = BQResultType<
  BQSearchListResultType<object>
>;

/**
 * 获取所有日志API
 */
export const getRecordTrackListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQRecordTrackSearchListResultType>(
    "get",
    "/record/track/list",
    {
      params
    }
  );
};

/**
 * 获取所有日志API
 */
export const getRecordTrackListApiBy = (recordId: string) => {
  const params = {
    filters: [new BQSearchFilter("recordId", "eq", recordId)],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQRecordTrackSearchListResultType>(
    "get",
    "/record/track/list",
    {
      params
    }
  );
};

/**
 * 获取所有日志分页API
 */
export const getRecordTrackPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQRecordTrackSearchPageResultType>(
    "get",
    "/record/track/page",
    {
      params
    }
  );
};
