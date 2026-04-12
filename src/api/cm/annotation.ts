import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault,
  BQSearchFilter
} from "../api";

/**
 * 批注实体类型定义
 */
export type BQAnnotationEntityType = {
  recordId: string;
  attachmentId: string;
  qualityControlId: string;
  annotationKind: string;
  annotationItem: string;
  annotationContent: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fixer: string;
  fixTime: string;
  deductionPoints: number;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取批注缺省值
 */
export const getAnnotationEntityDefault: (
  row?: BQAnnotationEntityType
) => BQAnnotationEntityType = (row?: BQAnnotationEntityType) => {
  return {
    recordId: row?.recordId ?? "",
    attachmentId: row?.attachmentId ?? "",
    qualityControlId: row?.qualityControlId ?? "",
    annotationKind: row?.annotationKind ?? "",
    annotationItem: row?.annotationItem ?? "",
    annotationContent: row?.annotationContent ?? "",
    x: row?.x ?? 0,
    y: row?.y ?? 0,
    w: row?.w ?? 0,
    h: row?.h ?? 0,
    fixer: row?.fixer ?? "",
    fixTime: row?.fixTime ?? "",
    deductionPoints: row?.deductionPoints ?? 1,
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 批注实体结果定义
 */
export type BQAnnotationEntityResultType = BQResultType<BQAnnotationEntityType>;

/**
 * 批注实体分页结果定义
 */
export type BQAnnotationSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQAnnotationEntityType>
>;

/**
 * 批注实体列表结果定义
 */
export type BQAnnotationSearchListResultType = BQResultType<
  BQSearchListResultType<BQAnnotationEntityType>
>;

/**
 * 增加批注API
 */
export const addAnnotationApi = (data?: object) => {
  return http.request<BQAnnotationEntityResultType>(
    "post",
    "/annotation/save",
    {
      data
    }
  );
};

/**
 * 上传批注API
 */
export const uploadAnnotationApi = (data?: object) => {
  return http.request<BQAnnotationEntityResultType>(
    "post",
    "/annotation/upload",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 更新批注API
 */
export const updateAnnotationApi = (data?: object) => {
  return http.request<BQAnnotationEntityResultType>(
    "post",
    "/annotation/update",
    {
      data
    }
  );
};

/**
 * 更新批注API
 */
export const updateAnnotationOrderValueApi = (data?: object) => {
  return http.request<BQAnnotationEntityResultType>(
    "post",
    "/annotation/updateOrderValue",
    {
      data
    }
  );
};

/**
 * 获取所有批注API
 */
export const getAnnotationListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQAnnotationSearchListResultType>(
    "get",
    "/annotation/list",
    {
      params
    }
  );
};

/**
 * 获取所有批注API
 */
export const getAnnotationListAttachmentIdApi = (attachmentId: string) => {
  const params = {
    filters: [new BQSearchFilter("attachmentId", "eq", attachmentId)],
    orders: [new BQSearchOrder("createdTime", false)]
  };
  return http.request<BQAnnotationSearchListResultType>(
    "get",
    "/annotation/list",
    {
      params
    }
  );
};

/**
 * 获取所有批注分页API
 */
export const getAnnotationPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQAnnotationSearchPageResultType>(
    "get",
    "/annotation/page",
    {
      params
    }
  );
};

/**
 * 删除批注API
 */
export const deleteAnnotationApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/annotation/delete/${eid}`
  );
};

/**
 * 批注启用禁用API
 */
export const setStatusAnnotationApi = (eid: string, status: boolean) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `/annotation/setStatus/${eid}/${status}`
  );
};

/**
 * 根据ID删除单条记录
 */
export const deleteApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/annotation/delete/${eid}`
  );
};

/**
 * 修复批注对象
 */
export const fixByAnnotationIdApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>("post", `/annotation/fix/${eid}`);
};

/**
 * 获取总扣分值
 */
export const getTotalPointsApi = (eid: string) => {
  return http.request<BQResultType<Number>>(
    "get",
    `/annotation/getTotalPoints/${eid}`
  );
};

/**
 * 获取所有案件附件API
 */
export const getCountByRecordIdApi = (recordId: string) => {
  return http.request<BQResultType<Recordable[]>>(
    "get",
    `/annotation/getCountByRecordId/${recordId}`
  );
};
