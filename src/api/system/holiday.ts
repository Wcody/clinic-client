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
 * 节假日实体类型定义
 */
export type BQHolidayEntityType = {
  holidayName: string;
  holidayDate: string;
  recurring: boolean;
  workday: boolean;
  status: boolean;
  remark?: string;
} & BQBaseEntityType;

/**
 * 获取节假日缺省值
 */
export const getHolidayEntityDefault: (
  row?: BQHolidayEntityType
) => BQHolidayEntityType = (row?: BQHolidayEntityType) => {
  console.log("row", row);
  return {
    holidayName: row?.holidayName ?? "",
    holidayDate: row?.holidayDate ?? undefined,
    recurring: row?.recurring ?? false,
    workday: row?.workday ?? false,
    status: row?.status ?? false,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 节假日实体结果定义
 */
export type BQHolidayEntityResultType = BQResultType<BQHolidayEntityType>;

/**
 * 节假日实体分页结果定义
 */
export type BQHolidaySearchPageResultType = BQResultType<
  BQSearchPageResultType<BQHolidayEntityType>
>;

/**
 * 节假日实体列表结果定义
 */
export type BQHolidaySearchListResultType = BQResultType<
  BQSearchListResultType<BQHolidayEntityType>
>;

/**
 * 增加节假日API
 */
export const addHolidayApi = (data?: object) => {
  return http.request<BQHolidayEntityResultType>("post", "/holiday/save", {
    data
  });
};

/**
 * 更新节假日API
 */
export const updateHolidayApi = (data?: object) => {
  return http.request<BQHolidayEntityResultType>("post", "/holiday/update", {
    data
  });
};

/**
 * 获取所有节假日API
 */
export const getHolidayListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQHolidaySearchListResultType>("get", "/holiday/list", {
    params
  });
};

/**
 * 获取所有节假日分页API
 */
export const getHolidayPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQHolidaySearchPageResultType>("get", "/holiday/page", {
    params
  });
};

/**
 * 删除节假日API
 */
export const deleteHolidayApi = (eid: string) => {
  return http.request<Boolean>("get", `/holiday/delete/${eid}`);
};

/**
 * 角色启用禁用API
 */
export const setStatusHolidayApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/holiday/setStatus/${eid}/${status}`);
};
