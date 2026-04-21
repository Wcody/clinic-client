import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/registration";

// ==================== 类型定义 ====================

export interface BQDiaryRecordType {
  id: string;
  orderTime: string;
  patient: string;
  gender: string;
  ageFirst: number;
  ageType: number;
  idCard: string;
  mobile: string;
  address: string;
  doctor: string;
  isFirstVisit: boolean;
  status: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

export interface BQDiarySearchParams {
  patientName?: string;
  doctor?: string;
  startTime?: string;
  endTime?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface BQDiaryListResult {
  list: BQDiaryRecordType[];
  total: number;
  currentPage: number;
  pageSize: number;
}

// ==================== API ====================

/**
 * 门诊日志分页查询
 * GET /registration/diary/list
 */
export const getDiaryListApi = (params: BQDiarySearchParams) => {
  return http.request<BQResultType<BQDiaryListResult>>("get", `${BASE}/diary/list`, {
    params
  });
};

/**
 * 获取医生列表（clinic/staff/listDoctors）
 */
export const getDoctorListApi = () => {
  return http.request<BQResultType<{ list: { id: string; name: string }[] }>>(
    "get",
    "/clinic/staff/listDoctors"
  );
};
