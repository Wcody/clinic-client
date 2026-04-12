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
 * 分类映射实体类型定义
 */
export type BQCategoryMappingEntityType = {
  mappingName: string;
  otherCode: string;
  otherName: string;
  sysCode: string;
  sysName: string;
  sourceSystem: string;
  remark?: string;
  status?: boolean;
} & BQBaseEntityType;

/**
 * 获取分类映射缺省值
 */
export const getCategoryMappingEntityDefault: (
  row?: BQCategoryMappingEntityType
) => BQCategoryMappingEntityType = (row?: BQCategoryMappingEntityType) => {
  console.log("row", row);
  return {
    mappingName: row?.mappingName ?? "",
    otherCode: row?.otherCode ?? "",
    otherName: row?.otherName ?? "",
    sysCode: row?.sysCode ?? "",
    sysName: row?.sysName ?? "",
    sourceSystem: row?.sourceSystem ?? "",
    remark: row?.remark ?? "",
    status: row?.status ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 分类映射实体结果定义
 */
export type BQCategoryMappingEntityResultType =
  BQResultType<BQCategoryMappingEntityType>;

/**
 * 分类映射实体分页结果定义
 */
export type BQCategoryMappingSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQCategoryMappingEntityType>
>;

/**
 * 分类映射实体列表结果定义
 */
export type BQCategoryMappingSearchListResultType = BQResultType<
  BQSearchListResultType<BQCategoryMappingEntityType>
>;

/**
 * 增加分类映射API
 */
export const addCategoryMappingApi = (data?: object) => {
  return http.request<BQCategoryMappingEntityResultType>(
    "post",
    "/category/mapping/save",
    {
      data
    }
  );
};

/**
 * 更新分类映射API
 */
export const updateCategoryMappingApi = (data?: object) => {
  return http.request<BQCategoryMappingEntityResultType>(
    "post",
    "/category/mapping/update",
    {
      data
    }
  );
};

/**
 * 获取所有分类映射API
 */
export const getCategoryMappingListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQCategoryMappingSearchListResultType>(
    "get",
    "/category/mapping/list",
    {
      params
    }
  );
};

/**
 * 获取所有分类映射分页API
 */
export const getCategoryMappingPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQCategoryMappingSearchPageResultType>(
    "get",
    "/category/mapping/page",
    {
      params
    }
  );
};

/**
 * 删除分类映射API
 */
export const deleteCategoryMappingApi = (eid: string) => {
  return http.request<Boolean>("get", `/category/mapping/delete/${eid}`);
};
