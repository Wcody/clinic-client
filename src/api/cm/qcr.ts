import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  BQSearchFilter
} from "../api";

/**
 * 病案实体类型定义
 */
export type BQViewQcrEntityType = {
  recordKind: number;
  recordCode: string;
  patientId: string;
  patientKind: number;
  patientCode: string;
  patientName: string;
  idCard: string;
  gender: number;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  nationality: string;
  ethnicity: string;
  maritalStatus: number;
  hasAllergy: boolean;
  allergicDrug: string;
  contactPerson: string;
  contactRelation: string;
  contactPhoneNumber: string;
  recordSource: string;
  admissionCount: number;
  hasArchived: boolean;
  admissionDate: string;
  dischargeDate: string;
  department: string;
  dischargeDepartment: string;
  lengthOfStay: number;
  attendingDoctor: string;
  mainDiagnosisCode: string;
  mainDiagnosisName: string;
  mainSurgeryCode: string;
  mainSurgeryName: string;
  hasDeceased: boolean;
  shelfNumber: string;
  wardCode: string;
  wardName: string;
  hasPrinted: boolean;
  hasQualityChecked: boolean;
  hasCompleted: boolean;
  status: boolean;
  remark: string;
  account: string;
  content: string;
  trackTime: string;
} & BQBaseEntityType;

/**
 * 病案实体结果定义
 */
export type BQViewQcrEntityResultType = BQResultType<BQViewQcrEntityType>;

/**
 * 病案实体分页结果定义
 */
export type BQViewQcrSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQViewQcrEntityType>
>;

/**
 * 病案实体列表结果定义
 */
export type BQViewQcrSearchListResultType = BQResultType<
  BQSearchListResultType<BQViewQcrEntityType>
>;

/**
 * 获取所有病案API
 */
export const getViewQcrListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQViewQcrSearchListResultType>(
    "get",
    "/record/qcr/list",
    {
      params
    }
  );
};

/**
 * 获取所有病案分页API
 */
export const getViewQcrPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQViewQcrSearchPageResultType>(
    "get",
    "/record/qcr/page",
    {
      params
    }
  );
};
