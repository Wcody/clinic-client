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
 * 检查检验项目实体类型定义
 */
export type BQExamineItemEntityType = {
  name: string;
  pinyin?: string;
  seq?: string;
  projectCode?: string;
  sellingPrice?: string;
  costPrice?: string;
  status?: string;
} & BQBaseEntityType;

/**
 * 获取检查检验项目缺省值
 */
export const getExamineItemEntityDefault: (
  row?: BQExamineItemEntityType
) => BQExamineItemEntityType = (row?: BQExamineItemEntityType) => {
  return {
    name: row?.name ?? "",
    pinyin: row?.pinyin ?? "",
    seq: row?.seq ?? "",
    projectCode: row?.projectCode ?? "",
    sellingPrice: row?.sellingPrice ?? "",
    costPrice: row?.costPrice ?? "",
    status: row?.status ?? "启用",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 检查检验项目实体结果定义
 */
export type BQExamineItemEntityResultType = BQResultType<BQExamineItemEntityType>;

/**
 * 检查检验项目实体分页结果定义
 */
export type BQExamineItemSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQExamineItemEntityType>
>;

/**
 * 检查检验项目实体列表结果定义
 */
export type BQExamineItemSearchListResultType = BQResultType<
  BQSearchListResultType<BQExamineItemEntityType>
>;

/**
 * 增加检查检验项目API
 */
export const addExamineItemApi = (data?: object) => {
  return http.request<BQExamineItemEntityResultType>("post", "/examine/item/save", {
    data
  });
};

/**
 * 更新检查检验项目API
 */
export const updateExamineItemApi = (data?: object) => {
  return http.request<BQExamineItemEntityResultType>("post", "/examine/item/update", {
    data
  });
};

/**
 * 获取所有检查检验项目列表API
 */
export const getExamineItemListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQExamineItemSearchListResultType>("get", "/examine/item/list", {
    params
  });
};

/**
 * 关键字搜索检查检验项目（匹配项目名称 / 拼音码）
 */
export const searchExamineItemApi = (keyword?: string) => {
  return http.request<BQExamineItemSearchListResultType>("get", "/examine/item/search", {
    params: { keyword }
  });
};

/**
 * 获取检查检验项目分页API
 */
export const getExamineItemPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQExamineItemSearchPageResultType>("get", "/examine/item/page", {
    params
  });
};

/**
 * 删除检查检验项目API
 */
export const deleteExamineItemApi = (eid: string) => {
  return http.request<Boolean>("get", `/examine/item/delete/${eid}`);
};

/**
 * 逻辑删除检查检验项目API
 */
export const deleteLogicExamineItemApi = (eid: string) => {
  return http.request<Boolean>("get", `/examine/item/deleteLogic/${eid}`);
};
