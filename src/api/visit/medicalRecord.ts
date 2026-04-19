import { http } from "@/utils/http";
import {
  BQSearchFilter,
  BQSearchOrder,
  type BQResultType,
  type BQSearchListResultType
} from "../api";

export interface BQMedicalRecordEntityType {
  id?: number;
  regId?: number;
  patientId?: number;
  doctorId?: number;
  chiefComplaint?: string;
  presentIllness?: string;
  pastHistory?: string;
  physicalExam?: string;
  diagnosis?: string;
  diagnosisIds?: string;
  advice?: string;
  seeTime?: string;
  version?: number;
}

export type BQMedicalRecordListResultType = BQResultType<
  BQSearchListResultType<BQMedicalRecordEntityType>
>;

export type BQMedicalRecordResultType = BQResultType<BQMedicalRecordEntityType>;

export const getMedicalRecordListApi = (
  patientId: number,
  startTime?: string,
  endTime?: string
) => {
  const filters: BQSearchFilter[] = [
    new BQSearchFilter("patientId", "eq", String(patientId))
  ];
  if (startTime) filters.push(new BQSearchFilter("seeTime", "gte", startTime));
  if (endTime) filters.push(new BQSearchFilter("seeTime", "lte", endTime));
  const params = {
    filters,
    orders: [new BQSearchOrder("seeTime", false)]
  };
  return http.request<BQMedicalRecordListResultType>(
    "get",
    "/medical/record/list",
    { params }
  );
};

export const getMedicalRecordByIdApi = (id: number) => {
  return http.request<BQMedicalRecordResultType>(
    "get",
    `/medical/record/get/${id}`
  );
};
