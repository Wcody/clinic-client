import { http } from "@/utils/http";
import type { BQBaseEntityType, BQResultType } from "../api";

/**
 * 工作量实体类型定义
 */
export type BQFlowEntityType = {
  name: string;
  nodes: any;
  edges: any;
  viewport: any;
  zoom: number;
  position: any;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取工作流API
 */
export const getFlowById = (eid: string) => {
  return http.request<BQResultType<BQFlowEntityType>>(
    "get",
    `/flow/get/${eid}`
  );
};

/**
 * 增加工作流API
 */
export const addFlowApi = (data?: object) => {
  return http.request<BQResultType<BQFlowEntityType>>("post", "/flow/save", {
    data
  });
};

/**
 * 更新工作流API
 */
export const updateFlowApi = (data?: object) => {
  return http.request<BQResultType<BQFlowEntityType>>("post", "/flow/update", {
    data
  });
};
