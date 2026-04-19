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
 * 药品销售明细实体类型（对应 bq_drug_sales_item 表）
 */
export type BQDrugSalesItemType = {
  salesId?: number;
  drugId?: string;
  drugName?: string;
  specification?: string;
  manufacturer?: string;
  unitPrice?: string;
  quantity?: string;
  unit?: string;
  amount?: string;
} & BQBaseEntityType;

/**
 * 药品销售主表实体类型（对应 bq_drug_sales 表）
 */
export type BQDrugSalesEntityType = {
  patientId?: number; // 关联 bq_patient.id，可为空
  patientName?: string; // 患者姓名
  gender?: string; // 性别
  firstAge?: number; // 主年龄值
  lastAge?: number; // 次年龄值（月数/天数）
  ageType?: number; // 年龄类型：1=岁 2=月 3=天
  idCard?: string; // 身份证号
  mobile?: string; // 手机号
  province?: number; // 省份ID
  city?: number; // 城市ID
  district?: number; // 区县ID
  address?: string; // 详细地址
  isFirstVisit?: boolean; // 是否初诊
  isAllergy?: boolean; // 是否过敏
  allergicHistory?: string; // 过敏史
  amount?: string; // 总金额
  actualAmount?: string; // 实收金额
  operatorPerson?: string; // 操作人
  created?: string; // 创建时间
  status?: number; // 1已收费 0未收费
  statusRemark?: string; // 状态备注
} & BQBaseEntityType;

/**
 * 零售保存 DTO（主记录 + 明细列表）
 * sales 只需传业务字段，审计字段由后端填充
 */
export type RetailSaveDtoType = {
  sales: Partial<BQDrugSalesEntityType>;
  items: Partial<BQDrugSalesItemType>[];
};

/**
 * 获取药品销售缺省值
 */
export const getDrugSalesEntityDefault: (
  row?: BQDrugSalesEntityType
) => BQDrugSalesEntityType = (row?: BQDrugSalesEntityType) => {
  return {
    amount: row?.amount ?? "",
    actualAmount: row?.actualAmount ?? "",
    operatorPerson: row?.operatorPerson ?? "",
    created: row?.created ?? "",
    status: row?.status ?? 0,
    statusRemark: row?.statusRemark ?? "",
    ...getBaseEntityDefault(row)
  };
};

/**
 * 药品销售实体结果定义
 */
export type BQDrugSalesEntityResultType = BQResultType<BQDrugSalesEntityType>;

/**
 * 药品销售实体分页结果定义
 */
export type BQDrugSalesSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQDrugSalesEntityType>
>;

/**
 * 药品销售实体列表结果定义
 */
export type BQDrugSalesSearchListResultType = BQResultType<
  BQSearchListResultType<BQDrugSalesEntityType>
>;

/**
 * 增加药品销售API
 */
export const addDrugSalesApi = (data?: object) => {
  return http.request<BQDrugSalesEntityResultType>("post", "/drug/sales/save", {
    data
  });
};

/**
 * 更新药品销售API
 */
export const updateDrugSalesApi = (data?: object) => {
  return http.request<BQDrugSalesEntityResultType>("post", "/drug/sales/update", {
    data
  });
};

/**
 * 获取所有药品销售列表API
 */
export const getDrugSalesListApi = (data?: object) => {
  const params = {
    ...data,
    orders: [new BQSearchOrder("created", false)]
  };
  return http.request<BQDrugSalesSearchListResultType>("get", "/drug/sales/list", {
    params
  });
};

/**
 * 获取药品销售分页API
 */
export const getDrugSalesPageApi = (data?: object) => {
  const params = {
    ...data
  };
  return http.request<BQDrugSalesSearchPageResultType>("get", "/drug/sales/page", {
    params
  });
};

/**
 * 删除药品销售API
 */
export const deleteDrugSalesApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/sales/delete/${eid}`);
};

/**
 * 逻辑删除药品销售API
 */
export const deleteLogicDrugSalesApi = (eid: string) => {
  return http.request<Boolean>("get", `/drug/sales/deleteLogic/${eid}`);
};

/**
 * 零售保存API（主记录 + 明细，事务原子保存）
 * status=false 保存未收费；status=true 直接收费
 */
export const retailSaveApi = (data: RetailSaveDtoType) => {
  return http.request<BQDrugSalesEntityResultType>("post", "/drug/sales/retail/save", {
    data
  });
};

/**
 * 根据销售主表ID查询明细列表
 */
export const getDrugSalesItemsApi = (salesId: number) => {
  return http.request<BQResultType<BQDrugSalesItemType[]>>(
    "get",
    `/drug/sales/item/bySalesId/${salesId}`
  );
};
