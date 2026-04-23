export type PrescriptionItem = {
  id?: number;
  itemId?: number;
  itemType: number;
  itemName: string;
  spec: string;
  unit: string;
  unitId?: number;
  priceUnit?: string;
  priceUnitId?: number;
  singleDosage: string;
  useWay: string;
  frequency: string;
  time: number;
  days: number;
  totalNum: number;
  entrust: string;
  price: number;
  totalPrice: number;
  prescriptionPrice?: string; //散卖价格
  prescriptionUnit?: string; //散卖单位
  wholesalePrice?: string; //整卖价格
  wholesaleUnit?: string; //整卖单位
  conversionValue?: string; //整散比
  decoWay?: string; //煎药方式
  defaultSaleType?: number; //默认售卖方式: 0整卖 1散卖
  groupNo?: number; //组号，用于同组行排序
};

export type PrescriptionGroup = {
  name: string;
  prescType: number;
  prescId?: number;
  items: PrescriptionItem[];
  // 中药处方主表字段
  usageType?: number;
  frequence?: number;
  doseAmount?: number;
  recommendation?: string;
};

export type PrescriptionTypeData = {
  groups: PrescriptionGroup[];
  currentGroup: number;
};
