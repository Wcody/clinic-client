/**
 * 就诊记录相关API（基于挂号记录）
 */
import { http } from "@/utils/http";
import type { BQResultType, BQSearchListResultType } from "../api";

const BASE = "/registration";

// ==================== 类型定义 ====================

/**
 * 就诊记录实体（基于挂号记录）
 */
export interface BQVisitRecordEntityType {
  id?: number;
  patientId?: number; // 患者姓名
  patient: string; // 患者姓名
  gender?: string; // 性别
  firstAge?: number; // 初诊年龄
  lastAge?: number; // 末次年龄
  ageType?: number; // 年龄类型：1=岁 2=月 3=天
  registrationNo?: string; // 挂号号
  department?: string; // 科室
  doctor?: string; // 医生
  clinic?: number; // 诊所ID
  registrationType?: number; // 挂号类型ID
  outpatientType?: string; // 门诊类型
  isFirstVisit?: boolean; // 是否初诊
  orderTime?: string; // 下单时间（挂号时间）
  status?: string; // 状态：待接诊/已接诊/已退号
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

/**
 * 就诊记录搜索参数
 */
export interface BQVisitRecordSearchParams {
  patientName?: string; // 患者姓名（模糊查询）
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  status?: string; // 状态：待接诊/已接诊
  currentPage?: number; // 当前页
  pageSize?: number; // 每页大小
}

/**
 * 返回类型
 */
export type BQVisitRecordListResultType = BQResultType<
  BQSearchListResultType<BQVisitRecordEntityType>
>;

// ==================== API ====================

/**
 * 查询就诊记录列表（基于挂号记录）
 * GET /registration/visit/list
 */
export const getVisitRecordListApi = (params: BQVisitRecordSearchParams) => {
  return http.request<BQVisitRecordListResultType>(
    "get",
    `${BASE}/visit/list`,
    {
      params
    }
  );
};

/**
 * 根据ID获取就诊记录详情
 * GET /registration/get/{id}
 */
export const getVisitRecordByIdApi = (id: number) => {
  return http.request<BQResultType<BQVisitRecordEntityType>>(
    "get",
    `${BASE}/get/${id}`
  );
};

/**
 * 更新就诊记录（接诊操作）
 * POST /registration/update
 */
export const updateVisitRecordApi = (data: BQVisitRecordEntityType) => {
  return http.request<BQResultType<BQVisitRecordEntityType>>(
    "post",
    `${BASE}/update`,
    { data }
  );
};
