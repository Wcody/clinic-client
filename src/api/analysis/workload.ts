import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/workload/stats";

export interface WorkloadRow {
  doctor: string;
  patientCount: number;
  visitCount: number;
  prescriptionCount: number;
  prescriptionFee: number;
  actualAmount: number;
  totalCost: number;
  totalProfit: number;
  westernDrugFee: number;
  chineseHerbalFee: number;
  chinesePatentFee: number;
  treatmentFee: number;
  consultFee: number;
  materialFee: number;
  otherFee: number;
  additionalFee: number;
}

export interface WorkloadSummary {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
}

export interface WorkloadQueryParams {
  startTime?: string;
  endTime?: string;
  doctor?: string;
}

export const getWorkloadListApi = (params: WorkloadQueryParams) =>
  http.request<BQResultType<{ list: WorkloadRow[]; total: number }>>(
    "get",
    `${BASE}/list`,
    { params }
  );

export const getWorkloadSummaryApi = (params: WorkloadQueryParams) =>
  http.request<BQResultType<WorkloadSummary>>("get", `${BASE}/summary`, {
    params
  });
