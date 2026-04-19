import { http } from "@/utils/http";
import type { BQResultType } from "../api";

export type RegionItem = {
  id: number;
  name: string;
};

/**
 * 获取所有省份列表
 */
export const getProvincesApi = () => {
  return http.request<BQResultType<RegionItem[]>>("get", "/region/provinces");
};

/**
 * 根据省份ID获取城市列表
 */
export const getCitiesApi = (provinceId: number) => {
  return http.request<BQResultType<RegionItem[]>>("get", "/region/cities", {
    params: { provinceId }
  });
};

/**
 * 根据城市ID获取区县列表
 */
export const getDistrictsApi = (cityId: number) => {
  return http.request<BQResultType<RegionItem[]>>("get", "/region/districts", {
    params: { cityId }
  });
};
