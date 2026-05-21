/**
 * 医疗基础数据字典API
 */

import { http } from "@/utils/http";
import { BQSearchFilter, type BQResultType } from "@/api/api";

/**
 * 医疗字典实体类型定义
 */
export interface BQMedicalDictionaryEntityType {
  id?: number;
  dictType?: number; // 1用法 2频率 3单位 4剂型 5煎药方式 6过敏史
  typeName?: string; // 类型名称
  name: string; // 字典名称/值
  seq?: number; // 排序
  common?: boolean; // 是否常用
  tenantId?: string; // 租户ID
  tenantInitData?: boolean; // 租户初始化数据
  medicineType?: boolean; // 药品类型 true西药 false中药
  executionProject?: boolean; // 是否执行项目
  day?: number; // 天数（频率专用）
  time?: number; // 次数（频率专用）
  status?: boolean; // 状态 true启用 false停用
  createdTime?: string;
  updatedTime?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 获取医疗字典列表
 */
export const getMedicalDictionaryListApi = (params?: {
  filters?: BQSearchFilter[];
}) => {
  return http.request<BQResultType<BQMedicalDictionaryEntityType[]>>(
    "get",
    "/medical/dictionary/list",
    { params }
  );
};

/**
 * 获取医疗字典分页列表
 */
export const getMedicalDictionaryPageApi = (params?: {
  current?: number;
  size?: number;
  filters?: BQSearchFilter[];
}) => {
  return http.request("get", "/medical/dictionary/page", {
    params
  });
};

/**
 * 根据ID获取医疗字典详情
 */
export const getMedicalDictionaryApi = (id: number) => {
  return http.request("get", `/medical/dictionary/get/${id}`);
};

/**
 * 新增医疗字典
 */
export const addMedicalDictionaryApi = (
  data: BQMedicalDictionaryEntityType
) => {
  return http.request("post", "/medical/dictionary/save", {
    data
  });
};

/**
 * 更新医疗字典
 */
export const updateMedicalDictionaryApi = (
  data: BQMedicalDictionaryEntityType
) => {
  return http.request("post", "/medical/dictionary/update", {
    data
  });
};

/**
 * 删除医疗字典（逻辑删除）
 */
export const deleteMedicalDictionaryApi = (id: number) => {
  return http.request("get", `/medical/dictionary/deleteLogic/${id}`);
};
