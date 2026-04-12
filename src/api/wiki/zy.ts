/*
 * 版权声明 Copyright (c) 2026。
 * 版权所有者： [缩微存储管理系统]
 * 首创日期： 2026年4月11日
 */

import { http } from "@/utils/http";
import type { BQResultType } from "../api";

/**
 * 疾病实体类型定义
 */
export type DiseaseEntityType = {
  id: number; // 疾病ID (Long)
  name: string; // 疾病名称
  category: number | null; // 疾病所属科室ID (Integer, 可为null)
  alphabet: string; // 疾病名称首字母(单个字符，如"F")
  pinyin: string; // 疾病拼音全拼(如"feijiehe")
  pinyinInitial: string; // 疾病拼音首字母串(如"fjh")
};

/**
 * 首字母实体类型定义
 */
export type AlphabetEntityType = {
  id: string; // 首字母
  name: string; // 首字母显示名称
};

/**
 * 科室实体类型定义
 */
export type CategoryEntityType = {
  id: number; // 科室ID (Integer)
  name: string; // 科室名称
};

/**
 * 疾病字典数据类型定义
 */
export type DictDataEntityType = {
  diseases: Array<DiseaseEntityType>; // 所有疾病列表
  alphabets: Array<AlphabetEntityType>; // 疾病首字母集合（已去重并排序）
  categories: Array<CategoryEntityType>; // 所有专科列表（按sort升序）
};

/**
 * 疾病字典结果类型定义
 */
export type DictDataResultType = BQResultType<DictDataEntityType>;

/**
 * 药材组成类型定义
 */
export type IngredientEntityType = {
  name: string; // 药材名称
  amount?: number; // 剂量数值
  unit: string; // 单位，如 "g"
  remark?: string; // 备注，如 "10g"、"6g(后下)"
  cook?: string; // 煎煮方法，如 "后下"、"烊化"、"冲服"
  prescriptionType: number; // 处方类型（0:基础方, 1:加减方）
};

/**
 * 推荐方剂类型定义
 */
export type PrescriptionEntityType = {
  name: string; // 方剂名称
  base: Array<IngredientEntityType>; // 基础方药材组成
};

/**
 * 辨证治疗证型类型定义
 */
export type TreatmentEntityType = {
  id: number; // 证型ID
  name: string; // 证型名称，如 "急性加重期-外寒内饮"
  spec: string; // 证候特点
  solution: string; // 治法
  recommend: PrescriptionEntityType; // 推荐方剂
  additional: Array<string | null>; // 加减法说明数组
};

/**
 * 名医经验方类型定义
 */
export type ExpertPrescriptionEntityType = {
  id: number; // 经验方ID
  name: string; // 名医姓名
  authorIntro: string; // 名医简介
  experience: string; // 经验方名称/主治病症
  explain: string; // 详细说明
  majorFunction: string; // 主要功能/主治
  spec: string; // 规格/说明
  solution: string; // 治法
  preExplain: string; // 前置说明
  recommend: PrescriptionEntityType; // 推荐方剂
  additional: Array<string | null>; // 加减法说明数组
};

/**
 * 治疗方案数据类型定义（包含 cure 和 exp）
 */
export type TreatmentDataEntityType = {
  cure: {
    data: Array<TreatmentEntityType>; // 辨证治疗数据
    desc: string; // 辨证治疗说明
  };
  exp: {
    data: Array<ExpertPrescriptionEntityType>; // 名医经验方数据
  };
};

/**
 * 疾病详情数据类型定义
 */
export type DiseaseDetailEntityType = {
  name: string; // 疾病名称
  summary: string; // 疾病概述/小结
  data: TreatmentDataEntityType; // 治疗方案数据（包含 cure 和 exp）
};

/**
 * 疾病详情结果类型定义
 */
export type DiseaseDetailResultType = BQResultType<DiseaseDetailEntityType>;

/**
 * 获取疾病字典列表API
 * @description 前端初始化时调用此接口获取完整的疾病、首字母、科室数据
 * @returns 返回包含疾病列表、首字母集合、科室列表的数据
 */
export const getDictListApi = () => {
  return http.request<DictDataResultType>("get", "/diagnosis/dict/getDictList");
};

/**
 * 获取疾病详情API
 * @description 根据疾病ID获取疾病的详细信息，包括概述、辨证治疗、名医经验方等
 * @param id - 疾病ID
 * @returns 返回疾病详情数据
 */
export const getDiseaseDetailApi = (id: number) => {
  return http.request<DiseaseDetailResultType>(
    "get",
    `/diagnosis/dict/getDetail/${id}`
  );
};
