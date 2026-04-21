import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/analysis/drug";

// ==================== 类型定义 ====================

export interface DrugSalesDetailRow {
  saleTime: string;
  patientName: string;
  ageStr: string;
  gender: string;
  doctor: string;
  drugName: string;
  specification: string;
  manufacturer: string;
  unitPrice: string;
  quantity: string;
  unit: string;
  totalAmount: string;
  chargeStatus: string;
}

export interface DrugSalesStatRow {
  drugName: string;
  specification: string;
  unit: string;
  manufacturer: string;
  saleTimes: number;
  totalQuantity: number;
  totalAmount: number;
  avgPrice: number;
}

export interface DrugSalesSummary {
  drugTypeCount: number;
  totalQuantity: number;
  totalAmount: number;
}

export interface DrugSalesQueryParams {
  drugName?: string;
  doctor?: string;
  startTime?: string;
  endTime?: string;
  currentPage?: number;
  pageSize?: number;
}

// ==================== API ====================

export const getDrugSalesDetailListApi = (params: DrugSalesQueryParams) =>
  http.request<BQResultType<{ list: DrugSalesDetailRow[]; total: number; currentPage: number; pageSize: number }>>(
    "get",
    `${BASE}/detail/list`,
    { params }
  );

export const getDrugSalesStatListApi = (params: DrugSalesQueryParams) =>
  http.request<BQResultType<{ list: DrugSalesStatRow[]; total: number; currentPage: number; pageSize: number }>>(
    "get",
    `${BASE}/stat/list`,
    { params }
  );

export const getDrugSalesStatSummaryApi = (params: Omit<DrugSalesQueryParams, "currentPage" | "pageSize">) =>
  http.request<BQResultType<DrugSalesSummary>>("get", `${BASE}/stat/summary`, { params });