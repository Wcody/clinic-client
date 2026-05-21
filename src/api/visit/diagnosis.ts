import { http } from "@/utils/http";
import type {
  BQSearchListResultType,
  BQResultType,
  BQSearchPageResultType,
  BQSearchParamsType
} from "../api";

const BASE = "/diagnosis/dict";

// ==================== 实体类型 ====================

/**
 * 诊断字典实体（后端返回）
 *
 * ⚠️ 字段严格对齐后端 BqDiagnosisDictEntity
 */
export type BQDiagnosisDictEntityType = {
  id: string; // 继承自 BQIdBaseEntity
  diagnosisCode: string; // ICD编码
  diagnosisName: string; // 诊断名称
  pinyin: string; // 拼音码
  status: boolean; // 状态：true启用，false禁用
  version: number; // 行乐观锁
  deleted: boolean; // 逻辑删除标记
  deletedTime: string | null; // 删除时间
  deletedBy: string; // 删除人名称
  createdBy: string; // 创建人（继承自基类）
  createdTime: string; // 创建时间（继承自基类）
  updatedBy: string; // 更新人（继承自基类）
  updatedTime: string; // 更新时间（继承自基类）
  tenantId: string; // 租户ID（继承自基类）
  tenantInitData: boolean; // 租户初始化数据
};

// ==================== 返回类型 ====================

export type BQDiagnosisDictResultType = BQResultType<BQDiagnosisDictEntityType>;

export type BQDiagnosisDictListResultType = BQResultType<
  BQSearchListResultType<BQDiagnosisDictEntityType>
>;

export type BQDiagnosisDictPageResultType = BQResultType<
  BQSearchPageResultType<BQDiagnosisDictEntityType>
>;

// ==================== API ====================

/**
 * 根据ID获取单条诊断记录
 * GET /get/{id}
 */
export const getDiagnosisDictByIdApi = (id: string) => {
  return http.request<BQDiagnosisDictResultType>("get", `${BASE}/get/${id}`);
};

/**
 * 新增诊断记录
 * POST /save
 */
export const saveDiagnosisDictApi = (
  data: Partial<BQDiagnosisDictEntityType>
) => {
  return http.request<BQDiagnosisDictResultType>("post", `${BASE}/save`, {
    data
  });
};

/**
 * 批量新增诊断记录
 * POST /saveBatch（单次最多 1000 条）
 */
export const saveDiagnosisDictBatchApi = (
  data: Partial<BQDiagnosisDictEntityType>[]
) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/saveBatch`, {
    data
  });
};

/**
 * 更新诊断记录
 * POST /update
 */
export const updateDiagnosisDictApi = (data: BQDiagnosisDictEntityType) => {
  return http.request<BQDiagnosisDictResultType>("post", `${BASE}/update`, {
    data
  });
};

/**
 * 批量更新诊断记录
 * POST /updateBatch（单次最多 1000 条）
 */
export const updateDiagnosisDictBatchApi = (
  data: BQDiagnosisDictEntityType[]
) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/updateBatch`, {
    data
  });
};

/**
 * 物理删除诊断记录
 * GET /delete/{id}
 */
export const deleteDiagnosisDictApi = (id: string) => {
  return http.request<BQResultType<Boolean>>("get", `${BASE}/delete/${id}`);
};

/**
 * 批量物理删除诊断记录
 * POST /deleteBatch（单次最多 1000 条）
 */
export const deleteDiagnosisDictBatchApi = (ids: string[]) => {
  return http.request<BQResultType<Boolean>>("post", `${BASE}/deleteBatch`, {
    data: ids
  });
};

/**
 * 逻辑删除诊断记录
 * GET /deleteLogic/{id}
 */
export const deleteDiagnosisDictLogicApi = (id: string) => {
  return http.request<BQResultType<Boolean>>(
    "get",
    `${BASE}/deleteLogic/${id}`
  );
};

/**
 * 批量逻辑删除诊断记录
 * POST /deleteLogicBatch（单次最多 1000 条）
 */
export const deleteDiagnosisDictLogicBatchApi = (ids: string[]) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `${BASE}/deleteLogicBatch`,
    { data: ids }
  );
};

/**
 * 列表查询（支持排序和过滤）
 * GET /list
 *
 * ⚠️ filters 字段名用实体实际字段：diagnosisCode / diagnosisName / pinyin / status
 */
export const getDiagnosisDictListApi = (
  params?: Partial<BQSearchParamsType>
) => {
  return http.request<BQDiagnosisDictListResultType>("get", `${BASE}/list`, {
    params
  });
};

/**
 * 分页查询（支持排序和过滤）
 * GET /page
 *
 * ⚠️ filters 字段名用实体实际字段：diagnosisCode / diagnosisName / pinyin / status
 */
export const getDiagnosisDictPageApi = (
  params?: Partial<BQSearchParamsType> & {
    pageNum?: number;
    pageSize?: number;
  }
) => {
  return http.request<BQDiagnosisDictPageResultType>("get", `${BASE}/page`, {
    params
  });
};

/**
 * 关键字查询诊断列表 ⭐
 * GET /search?keyword=
 *
 * 同时模糊匹配 diagnosisCode / diagnosisName / pinyin 三个字段（OR 逻辑）
 * keyword 为空时返回全部启用记录
 */
export const searchDiagnosisDictApi = (keyword: string) => {
  return http.request<BQDiagnosisDictListResultType>("get", `${BASE}/search`, {
    params: { keyword }
  });
};
