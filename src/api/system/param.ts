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
 * 参数实体组定义
 */
export type BQParamGroupEntityType = {
  id: number;
  pid: number;
  name: string;
  seq: number;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 参数实体类型定义
 */
export type BQParamItemEntityType = {
  id: number;
  pid: number;
  paramName: string;
  paramType: number;
  paramConfig: Recordable;
  paramValue: Recordable;
  seq: number;
  status: boolean;
  paramDesc: string;
} & BQBaseEntityType;

/**
 * 获取参数缺省值
 */
export const getParamGroupEntityDefault: (
  row?: BQParamGroupEntityType
) => BQParamGroupEntityType = (row?: BQParamGroupEntityType) => {
  return {
    id: row?.id ?? undefined,
    pid: row?.pid ?? 0,
    name: row?.name ?? "",
    seq: row?.seq ?? 10,
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 获取参数缺省值
 */
export const getParamItemEntityDefault: (
  row?: BQParamItemEntityType
) => BQParamItemEntityType = (row?: BQParamItemEntityType) => {
  return {
    id: row?.id ?? 0,
    pid: row?.pid ?? 0,
    paramName: row?.paramName ?? "",
    paramType: row?.paramType ?? 1,
    paramConfig: row?.paramConfig ?? {},
    paramValue: row?.paramValue ?? {},
    seq: row?.seq ?? 10,
    status: row?.status ?? true,
    paramDesc: row?.paramDesc ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 参数组实体结果定义
 */
export type BQParamGroupEntityResultType = BQResultType<BQParamGroupEntityType>;

/**
 * 参数实体分页结果定义
 */
export type BQParamGroupSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQParamGroupEntityType>
>;

/**
 * 参数实体列表结果定义
 */
export type BQParamGroupSearchListResultType = BQResultType<
  BQSearchListResultType<BQParamGroupEntityType>
>;

/**
 * 参数实体结果定义
 */
export type BQParamItemEntityResultType = BQResultType<BQParamItemEntityType>;

/**
 * 参数实体分页结果定义
 */
export type BQParamItemSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQParamItemEntityType>
>;

/**
 * 参数实体列表结果定义
 */
export type BQParamItemSearchListResultType = BQResultType<
  BQSearchListResultType<BQParamItemEntityType>
>;

/**
 * 增加参数API
 */
export const addParamGroupApi = (data?: object) => {
  return http.request<BQParamGroupEntityResultType>(
    "post",
    "/param/group/save",
    {
      data
    }
  );
};

/**
 * 增加参数API
 */
export const addParamItemApi = (data?: object) => {
  return http.request<BQParamItemEntityResultType>("post", "/param/item/save", {
    data
  });
};

/**
 * 更新参数API
 */
export const updateParamGroupApi = (data?: object) => {
  return http.request<BQParamGroupEntityResultType>(
    "post",
    "/param/group/update",
    {
      data
    }
  );
};

/**
 * 更新参数API
 */
export const updateParamItemApi = (data?: object) => {
  return http.request<BQParamItemEntityResultType>(
    "post",
    "/param/item/update",
    {
      data
    }
  );
};

/**
 * 获取所有参数API
 */
export const getParamGroupListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQParamGroupSearchListResultType>(
    "get",
    "/param/group/list",
    {
      params
    }
  );
};

/**
 * 获取所有参数分页API
 */
export const getParamItemPageApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQParamItemSearchPageResultType>(
    "get",
    "/param/item/page",
    {
      params
    }
  );
};

/**
 * 删除参数API
 */
export const deleteParamGroupApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/param/group/delete/${eid}`
  );
};

/**
 * 删除参数API
 */
export const deleteParamItemApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/param/item/delete/${eid}`
  );
};

/**
 * 修改图片参数API
 */
export const updateImageParamItemApi = (data?: object) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    "/param/item/update/image",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};
