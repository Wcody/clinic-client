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
 * 分类模板实体类型定义
 */
export type BQKindTemplateEntityType = {
  name: string;
  kindId: string;
  imgPath: string;
  nineType: string;
  remark: string;
  imgWidth: number;
  imgHeight: number;
  regKeys: Array<Record<string, any>>;
  dataFields: Array<Record<string, any>>;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取分类模板缺省值
 */
export const getKindTemplateEntityDefault: (
  row?: BQKindTemplateEntityType
) => BQKindTemplateEntityType = (row?: BQKindTemplateEntityType) => {
  console.log("row", row);
  return {
    name: row?.name ?? "",
    kindId: row?.kindId ?? "",
    imgPath: row?.imgPath ?? "",
    nineType: row?.nineType ?? "",
    remark: row?.remark ?? "",
    imgWidth: row?.imgWidth ?? 0,
    imgHeight: row?.imgHeight ?? 0,
    regKeys: row?.regKeys ?? [],
    dataFields: row?.dataFields ?? [],
    status: row?.status ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 分类模板实体结果定义
 */
export type BQKindTemplateEntityResultType =
  BQResultType<BQKindTemplateEntityType>;

/**
 * 分类模板实体分页结果定义
 */
export type BQKindTemplateSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQKindTemplateEntityType>
>;

/**
 * 分类模板实体列表结果定义
 */
export type BQKindTemplateSearchListResultType = BQResultType<
  BQSearchListResultType<BQKindTemplateEntityType>
>;

/**
 * 增加分类模板API
 */
export const addKindTemplateApi = (data?: object) => {
  return http.request<BQKindTemplateEntityResultType>(
    "post",
    "/kind/template/save",
    {
      data
    }
  );
};

/**
 * 增加分类模板API
 */
export const uploadKindTemplateApi = (data?: object) => {
  return http.request<BQKindTemplateEntityResultType>(
    "post",
    "/kind/template/upload",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 更新分类模板API
 */
export const updateKindTemplateApi = (data?: object) => {
  return http.request<BQKindTemplateEntityResultType>(
    "post",
    "/kind/template/update",
    {
      data
    }
  );
};

/**
 * 获取所有分类模板API
 */
export const getKindTemplateListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQKindTemplateSearchListResultType>(
    "get",
    "/kind/template/list",
    {
      params
    }
  );
};

/**
 * 获取所有分类模板API
 */
export const getKindTemplateListByKindIdApi = (kindId: string) => {
  const params = {
    filters: [new BQSearchFilter("kindId", "eq", kindId)],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQKindTemplateSearchListResultType>(
    "get",
    "/kind/template/list",
    {
      params
    }
  );
};

/**
 * 获取所有分类模板分页API
 */
export const getKindTemplatePageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQKindTemplateSearchPageResultType>(
    "get",
    "/kind/template/page",
    {
      params
    }
  );
};

/**
 * 删除分类模板API
 */
export const deleteKindTemplateApi = (eid: string) => {
  return http.request<Boolean>("get", `/kind/template/delete/${eid}`);
};

/**
 * 分类模板启用禁用API
 */
export const setStatusKindTemplateApi = (eid: string, status: boolean) => {
  return http.request<Boolean>(
    "post",
    `/kind/template/setStatus/${eid}/${status}`
  );
};
