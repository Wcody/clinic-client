import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/analysis/project";

// ==================== 类型定义 ====================

export interface ProjectSalesDetailRow {
  saleTime: string;
  patientName: string;
  gender: string;
  doctor: string;
  projectName: string;
  projectType: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  chargeStatus: string;
}

export interface ProjectSalesStatRow {
  projectName: string;
  saleTimes: number;
  totalQuantity: number;
  totalAmount: number;
}

export interface ProjectSalesSummary {
  projectTypeCount: number;
  totalTimes: number;
  totalAmount: number;
}

export interface ProjectSalesQueryParams {
  projectName?: string;
  doctor?: string;
  startTime?: string;
  endTime?: string;
  currentPage?: number;
  pageSize?: number;
}

// ==================== API ====================

export const getProjectSalesDetailListApi = (params: ProjectSalesQueryParams) =>
  http.request<BQResultType<{ list: ProjectSalesDetailRow[]; total: number; currentPage: number; pageSize: number }>>(
    "get",
    `${BASE}/detail/list`,
    { params }
  );

export const getProjectSalesStatListApi = (params: ProjectSalesQueryParams) =>
  http.request<BQResultType<{ list: ProjectSalesStatRow[]; total: number; currentPage: number; pageSize: number }>>(
    "get",
    `${BASE}/stat/list`,
    { params }
  );

export const getProjectSalesStatSummaryApi = (params: Omit<ProjectSalesQueryParams, "currentPage" | "pageSize">) =>
  http.request<BQResultType<ProjectSalesSummary>>("get", `${BASE}/stat/summary`, { params });