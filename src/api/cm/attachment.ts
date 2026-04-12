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
 * 案件附件实体类型定义
 */
export type BQAttachmentEntityType = {
  name: string;
  kindId: string;
  imgPath: string;
  nineType: string;
  remark: string;
  imgWidth: number;
  imgHeight: number;
  regKeys: Array<Record<string, any>>;
  dataFields: Array<Record<string, any>>;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取案件附件缺省值
 */
export const getAttachmentEntityDefault: (
  row?: BQAttachmentEntityType
) => BQAttachmentEntityType = (row?: BQAttachmentEntityType) => {
  console.log("row", row);
  return {
    name: row?.name ?? "",
    kindId: row?.kindId ?? "",
    imgPath: row?.imgPath ?? "",
    nineType: row?.nineType ?? "",
    remark: row?.remark ?? "",
    imgWidth: row?.imgWidth ?? 0,
    imgHeight: row?.imgHeight ?? 0,
    regKeys: row?.regKeys ?? [],
    dataFields: row?.dataFields ?? [],
    status: row?.status ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 案件附件实体结果定义
 */
export type BQAttachmentEntityResultType = BQResultType<BQAttachmentEntityType>;

/**
 * 案件附件实体分页结果定义
 */
export type BQAttachmentSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQAttachmentEntityType>
>;

/**
 * 案件附件实体列表结果定义
 */
export type BQAttachmentSearchListResultType = BQResultType<
  BQSearchListResultType<BQAttachmentEntityType>
>;

/**
 * 增加案件附件API
 */
export const addAttachmentApi = (data?: object) => {
  return http.request<BQAttachmentEntityResultType>(
    "post",
    "/attachment/save",
    {
      data
    }
  );
};

/**
 * 上传案件附件API
 */
export const uploadAttachmentApi = (data?: object) => {
  return http.request<BQAttachmentEntityResultType>(
    "post",
    "/attachment/upload",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 上传案件附件API
 */
export const uploadAttachment4OcrApi = (data?: object) => {
  return http.request<BQAttachmentEntityResultType>(
    "post",
    "/attachment/upload4ocr",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 更新案件附件API
 */
export const updateAttachmentApi = (data?: object) => {
  return http.request<BQAttachmentEntityResultType>(
    "post",
    "/attachment/update",
    {
      data
    }
  );
};

/**
 * 更新案件附件API
 */
export const updateAttachmentOrderValueApi = (data?: object) => {
  return http.request<BQAttachmentEntityResultType>(
    "post",
    "/attachment/updateOrderValue",
    {
      data
    }
  );
};

/**
 * 获取所有案件附件API
 */
export const getAttachmentListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("name")]
  };
  return http.request<BQAttachmentSearchListResultType>(
    "get",
    "/attachment/list",
    {
      params
    }
  );
};

/**
 * 获取所有案件附件API
 */
export const getAttachmentListRecordIdApi = (
  recordId: string,
  includeDrop: boolean = false,
  hasManual: boolean = true
) => {
  const params = {
    filters: [new BQSearchFilter("recordId", "eq", recordId)],
    orders: [new BQSearchOrder("orderValue")]
  };
  if (!includeDrop) {
    params.filters.push(new BQSearchFilter("status", "eq", "1"));
  }
  if (hasManual) {
    params.filters.push(new BQSearchFilter("hasManual", "eq", "1"));
  }
  return http.request<BQAttachmentSearchListResultType>(
    "get",
    "/attachment/list",
    {
      params
    }
  );
};

/**
 * 获取所有案件附件分页API
 */
export const getAttachmentPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQAttachmentSearchPageResultType>(
    "get",
    "/attachment/page",
    {
      params
    }
  );
};

/**
 * 删除案件附件API
 */
export const deleteAttachmentApi = (eid: string) => {
  return http.request<Boolean>("get", `/attachment/delete/${eid}`);
};

/**
 * 案件附件启用禁用API
 */
export const setStatusAttachmentApi = (eid: string, status: boolean) => {
  return http.request<Boolean>(
    "post",
    `/attachment/setStatus/${eid}/${status}`
  );
};

/**
 * 根据recordId废止所有关联附件
 */
export const abolishByRecordIdApi = (eid: string, val: boolean) => {
  return http.request<Boolean>(
    "post",
    `/attachment/abolishByRecordId/${eid}/${val}`
  );
};

/**
 * 根据recordId删除所有关联附件
 */
export const deleteByRecordIdApi = (eid: string) => {
  return http.request<Boolean>("post", `/attachment/deleteByRecordId/${eid}`);
};

/**
 * 根据recordId和kindId删除关联附件
 */
export const deleteByKindIdApi = (eid: string, kindId: string) => {
  return http.request<Boolean>(
    "post",
    `/attachment/deleteByKindId/${eid}/${kindId}`
  );
};

/**
 * 根据recordId和kindId废止关联附件
 */
export const abolishByKindIdApi = (
  eid: string,
  kindId: string,
  val: boolean
) => {
  return http.request<Boolean>(
    "post",
    `/attachment/abolishByKindId/${eid}/${kindId}/${val}`
  );
};

/**
 * 废止文件对象
 */
export const abolishByAttachmentIdApi = (eid: string, val: boolean) => {
  return http.request<Boolean>(
    "post",
    `/attachment/abolishByAttachmentId/${eid}/${val}`
  );
};

/**
 * 根据ID删除单条记录
 */
export const deleteApi = (eid: string) => {
  return http.request<Boolean>("get", `/attachment/delete/${eid}`);
};
