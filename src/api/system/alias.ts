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
 * 字段别名实体类型定义
 */
export type BQFieldAliasEntityType = {
  aliasType: string;
  aliasValue: string;
  sysValue: string;
  name: string;
  remark?: string;
  sourceSystem: string;
  seq: number;
} & BQBaseEntityType;

/**
 * 获取字段别名缺省值
 */
export const getFieldAliasEntityDefault: (
  row?: BQFieldAliasEntityType
) => BQFieldAliasEntityType = (row?: BQFieldAliasEntityType) => {
  console.log("row", row);
  return {
    aliasType: row?.aliasType ?? "",
    aliasValue: row?.aliasValue ?? "",
    sysValue: row?.sysValue ?? "",
    name: row?.name ?? "",
    remark: row?.remark ?? "",
    sourceSystem: row?.sourceSystem ?? "",
    seq: row?.seq ?? 10,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 字段别名实体结果定义
 */
export type BQFieldAliasEntityResultType = BQResultType<BQFieldAliasEntityType>;

/**
 * 字段别名实体分页结果定义
 */
export type BQFieldAliasSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQFieldAliasEntityType>
>;

/**
 * 字段别名实体列表结果定义
 */
export type BQFieldAliasSearchListResultType = BQResultType<
  BQSearchListResultType<BQFieldAliasEntityType>
>;

/**
 * 增加字段别名API
 */
export const addFieldAliasApi = (data?: object) => {
  return http.request<BQFieldAliasEntityResultType>(
    "post",
    "/field/alias/save",
    {
      data
    }
  );
};

/**
 * 更新字段别名API
 */
export const updateFieldAliasApi = (data?: object) => {
  return http.request<BQFieldAliasEntityResultType>(
    "post",
    "/field/alias/update",
    {
      data
    }
  );
};

/**
 * 获取所有字段别名API
 */
export const getFieldAliasListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQFieldAliasSearchListResultType>(
    "get",
    "/field/alias/list",
    {
      params
    }
  );
};

/**
 * 获取所有字段别名分页API
 */
export const getFieldAliasPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("seq")]
  };
  return http.request<BQFieldAliasSearchPageResultType>(
    "get",
    "/field/alias/page",
    {
      params
    }
  );
};

/**
 * 删除字段别名API
 */
export const deleteFieldAliasApi = (eid: string) => {
  return http.request<Boolean>("get", `/field/alias/delete/${eid}`);
};
