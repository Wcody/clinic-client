import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/finance/stats";

// ==================== 类型定义 ====================

export interface FinanceStatsRow {
  periodDate: string;
  typeString: string;
  chargeCount: number;
  visitCount: number;
  totalAmount: number;
  chargeTotal: number;
  chargeAvg: number;
  actualTotal: number;
  actualAvg: number;
  notChargedTotal: number;
  notChargedAvg: number;
  refundTotal: number;
  refundAvg: number;
  profitTotal: number;
  profitAvg: number;
}

export interface FinanceSummary {
  totalAmount: number;
  actualAmount: number;
  refundAmount: number;
}

export interface FinanceListResult {
  list: FinanceStatsRow[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface FinanceChartResult {
  dates: string[];
  amounts: number[];
}

export interface FinanceQueryParams {
  dimension?: string;
  startTime?: string;
  endTime?: string;
  typeString?: string;
  currentPage?: number;
  pageSize?: number;
}

// ==================== API ====================

export const getFinanceListApi = (params: FinanceQueryParams) =>
  http.request<BQResultType<FinanceListResult>>("get", `${BASE}/list`, { params });

export const getFinanceSummaryApi = (params: Omit<FinanceQueryParams, "dimension" | "currentPage" | "pageSize">) =>
  http.request<BQResultType<FinanceSummary>>("get", `${BASE}/summary`, { params });

export const getFinanceChartApi = (params: Omit<FinanceQueryParams, "currentPage" | "pageSize">) =>
  http.request<BQResultType<FinanceChartResult>>("get", `${BASE}/chart`, { params });

export const getFinanceTypesApi = () =>
  http.request<BQResultType<string[]>>("get", `${BASE}/types`);
