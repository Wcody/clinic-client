import { http } from "@/utils/http";
import {
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault
} from "../api";

/**
 * 挂号费实体类型定义
 */
export type BQRegistrationFeeEntityType = {
  id?: string;
  clinic?: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  status: boolean;
  common?: boolean;
  isDefault: boolean;
} & BQBaseEntityType;

/**
 * 附加费实体类型定义
 */
export type BQSurchargeFeeEntityType = {
  id?: string;
  clinic?: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  status: boolean;
  common?: boolean;
  defaultAdd: boolean;
} & BQBaseEntityType;

/**
 * 基础设置实体类型定义 (医疗字典)
 */
export type BQBasicSettingEntityType = {
  id?: string;
  dictType: number; // 1用法 2频率 3单位 4剂型 5煎药方式 6过敏史
  typeName?: string;
  name: string;
  seq: number;
  common?: boolean;
  deleted?: boolean;
  medicineType?: boolean; // 1西药 2中药 (Boolean类型)
  executionProject?: boolean;
  day?: number;
  time?: number;
} & BQBaseEntityType;

/**
 * 获取挂号费实体缺省值
 */
export const getRegistrationFeeEntityDefault: (
  row?: BQRegistrationFeeEntityType
) => BQRegistrationFeeEntityType = (row?: BQRegistrationFeeEntityType) => {
  return {
    id: row?.id,
    clinic: row?.clinic,
    name: row?.name ?? "",
    costPrice: row?.costPrice ?? 10,
    sellingPrice: row?.sellingPrice ?? 10,
    status: row?.status ?? true,
    common: row?.common ?? false,
    isDefault: row?.isDefault ?? false,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 获取附加费实体缺省值
 */
export const getSurchargeFeeEntityDefault: (
  row?: BQSurchargeFeeEntityType
) => BQSurchargeFeeEntityType = (row?: BQSurchargeFeeEntityType) => {
  return {
    id: row?.id,
    clinic: row?.clinic,
    name: row?.name ?? "",
    costPrice: row?.costPrice ?? 10,
    sellingPrice: row?.sellingPrice ?? 10,
    status: row?.status ?? true,
    common: row?.common ?? false,
    defaultAdd: row?.defaultAdd ?? false,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 获取基础设置实体缺省值 (医疗字典)
 */
export const getBasicSettingEntityDefault: (
  row?: BQBasicSettingEntityType
) => BQBasicSettingEntityType = (row?: BQBasicSettingEntityType) => {
  return {
    id: row?.id,
    dictType: row?.dictType ?? 1,
    typeName: row?.typeName ?? "",
    name: row?.name ?? "",
    seq: row?.seq ?? 1,
    common: row?.common ?? false,
    deleted: row?.deleted ?? false,
    medicineType: row?.medicineType,
    executionProject: row?.executionProject ?? false,
    day: row?.day ?? 1,
    time: row?.time ?? 3,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 挂号费实体结果定义
 */
export type BQRegistrationFeeEntityResultType =
  BQResultType<BQRegistrationFeeEntityType>;

/**
 * 挂号费实体分页结果定义
 */
export type BQRegistrationFeeSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQRegistrationFeeEntityType>
>;

/**
 * 附加费实体结果定义
 */
export type BQSurchargeFeeEntityResultType =
  BQResultType<BQSurchargeFeeEntityType>;

/**
 * 附加费实体分页结果定义
 */
export type BQSurchargeFeeSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQSurchargeFeeEntityType>
>;

/**
 * 基础设置实体结果定义
 */
export type BQBasicSettingEntityResultType =
  BQResultType<BQBasicSettingEntityType>;

/**
 * 基础设置实体分页结果定义
 */
export type BQBasicSettingSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQBasicSettingEntityType>
>;

// ==================== 挂号费管理 API ====================

/**
 * 新增挂号费API
 */
export const addRegistrationFeeApi = (data?: object) => {
  return http.request<BQRegistrationFeeEntityResultType>(
    "post",
    "/registration/fee/save",
    {
      data
    }
  );
};

/**
 * 更新挂号费API
 */
export const updateRegistrationFeeApi = (data?: object) => {
  return http.request<BQRegistrationFeeEntityResultType>(
    "post",
    "/registration/fee/update",
    {
      data
    }
  );
};

/**
 * 获取挂号费分页API
 */
export const getRegistrationFeePageApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime", false)]
  };
  return http.request<BQRegistrationFeeSearchPageResultType>(
    "get",
    "/registration/fee/page",
    {
      params
    }
  );
};

/**
 * 删除挂号费API (逻辑删除)
 */
export const deleteRegistrationFeeApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/registration/fee/deleteLogic/${eid}`
  );
};

// ==================== 附加费管理 API ====================

/**
 * 新增附加费API
 */
export const addSurchargeFeeApi = (data?: object) => {
  return http.request<BQSurchargeFeeEntityResultType>(
    "post",
    "/additional/fee/save",
    {
      data
    }
  );
};

/**
 * 更新附加费API
 */
export const updateSurchargeFeeApi = (data?: object) => {
  return http.request<BQSurchargeFeeEntityResultType>(
    "post",
    "/additional/fee/update",
    {
      data
    }
  );
};

/**
 * 获取附加费分页API
 */
export const getSurchargeFeePageApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime", false)]
  };
  return http.request<BQSurchargeFeeSearchPageResultType>(
    "get",
    "/additional/fee/page",
    {
      params
    }
  );
};

/**
 * 删除附加费API (逻辑删除)
 */
export const deleteSurchargeFeeApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `/additional/fee/deleteLogic/${eid}`
  );
};

// ==================== 基础设置 API (医疗字典) ====================

/**
 * 新增基础设置API
 */
export const addBasicSettingApi = (data?: object) => {
  return http.request<BQBasicSettingEntityResultType>(
    "post",
    "/medical/dictionary/save",
    {
      data
    }
  );
};

/**
 * 更新基础设置API
 */
export const updateBasicSettingApi = (data?: object) => {
  return http.request<BQBasicSettingEntityResultType>(
    "post",
    "/medical/dictionary/update",
    {
      data
    }
  );
};

/**
 * 获取基础设置分页API
 */
export const getBasicSettingPageApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("createdTime", false)]
  };
  return http.request<BQBasicSettingSearchPageResultType>(
    "get",
    "/medical/dictionary/page",
    {
      params
    }
  );
};
