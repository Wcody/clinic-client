/*
 * 版权声明 Copyright (c) 2026。
 * 版权所有者： [全科医生系统]
 * 首创日期： 2026年4月19日
 */

import { http } from "@/utils/http";
import type { BQResultType } from "../api";

export type DiseaseEntityType = {
  id: number;
  name: string;
  category: number | null;
  alphabet: string;
  pinyin: string;
  pinyinInitial: string;
};

export type AlphabetEntityType = {
  id: string;
  name: string;
};

export type CategoryEntityType = {
  id: number;
  name: string;
};

export type DictDataEntityType = {
  diseases: Array<DiseaseEntityType>;
  alphabets: Array<AlphabetEntityType>;
  categories: Array<CategoryEntityType>;
};

export type DictDataResultType = BQResultType<DictDataEntityType>;

export type IngredientEntityType = {
  name: string;
  amount?: number;
  unit: string;
  remark?: string;
  cook?: string;
  prescriptionType: number;
};

export type PrescriptionEntityType = {
  name: string;
  base: Array<IngredientEntityType>;
};

export type TreatmentEntityType = {
  id: number;
  name: string;
  spec: string;
  solution: string;
  recommend: PrescriptionEntityType;
  additional: Array<string | null>;
};

export type ExpertPrescriptionEntityType = {
  id: number;
  name: string;
  authorIntro: string;
  experience: string;
  explain: string;
  majorFunction: string;
  spec: string;
  solution: string;
  preExplain: string;
  recommend: PrescriptionEntityType;
  additional: Array<string | null>;
};

export type TreatmentDataEntityType = {
  cure: {
    data: Array<TreatmentEntityType>;
    desc: string;
  };
  exp: {
    data: Array<ExpertPrescriptionEntityType>;
  };
};

export type DiseaseDetailEntityType = {
  name: string;
  summary: string;
  data: TreatmentDataEntityType;
};

export type DiseaseDetailResultType = BQResultType<DiseaseDetailEntityType>;

export const getDictListApi = () => {
  return http.request<DictDataResultType>("get", "/sys/tcm/dict/getDictList");
};

export const getDiseaseDetailApi = (id: number) => {
  return http.request<DiseaseDetailResultType>(
    "get",
    `/sys/tcm/dict/getDetail/${id}`
  );
};
