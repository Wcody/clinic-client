import { http } from "@/utils/http";

/**
 * @description: 统一接口返回数据格式
 */
export type BQResultType<T> = {
  code: number;
  message: string;
  exception: string;
  data: T;
};

export type BQAnyResultType = BQResultType<any>;

/**
 * @description: 业务类基础属性
 */
export type BQBaseEntityType = {
  version: number;
  eid: string;
  createdTime: string;
  updatedTime: string;
  createdBy: string;
  updatedBy: string;
};

/**
 * @description: 枚举键值对
 */
export type BQOptionType = {
  label: string;
  value: string;
};

export type BQOptionsType = Array<BQOptionType>;

export const getBaseEntityDefault: (
  row?: BQBaseEntityType
) => BQBaseEntityType = (row?: BQBaseEntityType) => {
  return {
    version: row?.version ?? 0,
    eid: row?.eid,
    createdTime: undefined,
    updatedTime: undefined,
    createdBy: undefined,
    updatedBy: undefined
  };
};

/**
 * @description: 分页接口返回数据格式
 */
export type BQSearchPageResultType<T> = {
  /**
   * 分页大小
   */
  size: number;
  /**
   * 当前页
   */
  current: number;
  /**
   * 总页数
   */
  total: number;
  /**
   * 当前页的记录列表
   */
  records: T[];
};

/**
 * @description: 分页接口返回数据格式
 */
export type BQSearchListResultType<T> = Array<T>;

/**
 * @description: 分页接口请求参数格式
 */
export type BQSearchParamsType = {
  size: number;
  current: number;
  orders: Record<string, any>[];
  filters: Record<string, any>[];
};

/**
 * @description: 请求排序字段格式
 */
export type BQSearchOrderType = {
  column: string;
  asc: boolean;
};

/**
 * @description: 请求筛选字段
 */
export class BQSearchOrder implements BQSearchOrderType {
  column: string;
  asc: boolean;

  constructor(column: string, asc: boolean = true) {
    this.column = column;
    this.asc = asc;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

/**
 * @description: 请求筛选字段格式
 */
export type BQSearchFilterType = {
  field: string;
  operator: any;
  value: string;
};

/**
 * @description: 请求筛选字段
 */
export class BQSearchFilter implements BQSearchFilterType {
  field: string;
  operator: any;
  value: string;
  value2: string;

  constructor(field: string, operator: any, value: string, value2?: string) {
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.value2 = value2;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

export function BQParamsSerializer(params) {
  const serializedParams = [];
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      let value = params[key];
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      serializedParams.push(`${key}=${value}`);
    }
  }

  return serializedParams.join("&");
}

export function downloadFile(url: string, params?: object) {
  return http.download(url, params);
}
