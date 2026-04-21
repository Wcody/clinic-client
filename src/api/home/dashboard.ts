import { http } from "@/utils/http";
import type { BQResultType } from "../api";

const BASE = "/home/dashboard";

/** 首页汇总数据（诊所维度） */
export interface DashboardSummary {
  todayRegistrationTotal: number;
  myReceivedCount: number;
  myPendingCount: number;
  myTodayFee: number;
}

/** 我的数据（个人维度） */
export interface MySummary {
  myReceivedCount: number;
  myPendingCount: number;
  myTodayFee: number;
}

/** 就诊趋势数据 */
export interface VisitTrend {
  days: string[];
  thisWeek: number[];
  lastWeek: number[];
}

/** 排行项 */
export interface RankItem {
  rank: number;
  doctor: string;
  department: string;
  count?: number;
  fee?: number;
  trend?: string;
}

/** 最新动态项 */
export interface EventItem {
  doctor: string;
  patient: string;
  department: string;
  eventDate: string;
}

/** 获取首页汇总数据 */
export const getDashboardSummaryApi = () =>
  http.request<BQResultType<DashboardSummary>>("get", `${BASE}/summary`);

/** 获取我的数据 */
export const getMySummaryApi = () =>
  http.request<BQResultType<MySummary>>("get", `${BASE}/my`);

/** 获取就诊趋势数据 */
export const getVisitTrendApi = () =>
  http.request<BQResultType<VisitTrend>>("get", `${BASE}/visit/trend`);

/** 获取接诊数量排行 */
export const getVisitRankApi = () =>
  http.request<BQResultType<{ list: RankItem[] }>>("get", `${BASE}/rank/visits`);

/** 获取收费金额排行 */
export const getFeeRankApi = () =>
  http.request<BQResultType<{ list: RankItem[] }>>("get", `${BASE}/rank/fees`);

/** 获取最新动态 */
export const getRecentEventsApi = () =>
  http.request<BQResultType<{ list: EventItem[] }>>("get", `${BASE}/events`);
