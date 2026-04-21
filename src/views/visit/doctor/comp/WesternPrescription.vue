<!--
  - 西/成药处方组件
  - typeData 为父组件 reactive 对象引用，子组件直接操作其内部属性
  -->
<script setup lang="ts">
import { computed } from "vue";
import { Close, Plus } from "@element-plus/icons-vue";
import {
  BqMedicineSelector,
  type MedicineItem
} from "@/components/BqMedicineSelector";
import type { BQMedicalDictionaryEntityType } from "@/api/cm/medicalDictionary";
import type {
  PrescriptionItem,
  PrescriptionTypeData
} from "../prescriptionTypes";
import { extractNumber } from "@/utils/common";
import { el } from "element-plus/es/locale/index.mjs";

defineOptions({ name: "WesternPrescription" });

const props = defineProps<{
  typeData: PrescriptionTypeData;
  usageOptions: BQMedicalDictionaryEntityType[];
  frequencyOptions: BQMedicalDictionaryEntityType[];
  unitOptions: BQMedicalDictionaryEntityType[];
}>();

const PRESC_TYPE = 1;

const currentGroup = computed(
  () => props.typeData.groups[props.typeData.currentGroup]
);

const prescriptionAmount = computed(
  () =>
    currentGroup.value?.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    ) ?? 0
);

// 根据默认值，完善现在处方明细的数据
const completeItem = (item: PrescriptionItem, medicine: MedicineItem) => {
  // 有整散比的药品，强制按整卖单位计价（与 calculateTotalNum 换算逻辑对齐）
  const hasConversion = parseFloat(medicine.conversionValue || "0") > 0;
  const saleType = Number(medicine.defaultSaleType);

  if (saleType === 0) {
    // 整卖：用大单位
    item.price = extractNumber(medicine.wholesalePrice);
    let uObj = props.unitOptions.find(o => o.name === medicine.wholesaleUnit);
    if (uObj) {
      item.priceUnit = uObj.name;
      item.priceUnitId = uObj.id;
      item.unit = uObj.name;
      item.unitId = uObj.id;
    } else {
      // 同时也是计量单位
      uObj = props.unitOptions.find(o => o.id + "" === medicine.wholesaleUnit);
      if (uObj) {
        item.priceUnit = uObj.name;
        item.priceUnitId = uObj.id;
        item.unit = uObj.name;
        item.unitId = uObj.id;
      }
    }
  } else {
    // 散卖：用小单位
    item.price = extractNumber(medicine.prescriptionPrice);
    let uObj = props.unitOptions.find(
      o => o.name === medicine.prescriptionUnit
    );
    if (uObj) {
      item.priceUnit = uObj.name;
      item.priceUnitId = uObj.id;
      item.unit = uObj.name;
      item.unitId = uObj.id;
    } else {
      // 同时也是计量单位
      uObj = props.unitOptions.find(
        o => o.id + "" === medicine.prescriptionUnit
      );
      if (uObj) {
        item.priceUnit = uObj.name;
        item.priceUnitId = uObj.id;
        item.unit = uObj.name;
        item.unitId = uObj.id;
      }
    }
  }

  console.log("completeItem", item);
};

const handleAddDrug = (medicine: MedicineItem) => {
  if (!currentGroup.value) return;

  console.log("handleAddDrug medicine:", medicine);
  console.log("defaultSaleType:", medicine.defaultSaleType, "type:", typeof medicine.defaultSaleType);

  // 根据 defaultSaleType 设置默认单位和单价
  let resolvedUnit = "";
  let resolvedUnitId: number | undefined = undefined;
  let resolvedPrice = 0;
  let resolvedPriceUnit = "";
  let resolvedPriceUnitId: number | undefined = undefined;

  const hasConversion = parseFloat(medicine.conversionValue || "0") > 0;
  const saleType = Number(medicine.defaultSaleType);

  if (saleType === 0) {
    // 整卖：用大单位
    resolvedPrice = extractNumber(medicine.wholesalePrice);
    const uObj = props.unitOptions.find(o => o.name === medicine.wholesaleUnit);
    if (uObj) {
      resolvedPriceUnit = uObj.name;
      resolvedPriceUnitId = uObj.id;
      resolvedUnit = uObj.name;
      resolvedUnitId = uObj.id;
    } else {
      const uObj2 = props.unitOptions.find(o => o.id + "" === medicine.wholesaleUnit);
      if (uObj2) {
        resolvedPriceUnit = uObj2.name;
        resolvedPriceUnitId = uObj2.id;
        resolvedUnit = uObj2.name;
        resolvedUnitId = uObj2.id;
      }
    }
  } else {
    // 散卖：用小单位
    resolvedPrice = extractNumber(medicine.prescriptionPrice);
    const uObj = props.unitOptions.find(o => o.name === medicine.prescriptionUnit);
    if (uObj) {
      resolvedPriceUnit = uObj.name;
      resolvedPriceUnitId = uObj.id;
      resolvedUnit = uObj.name;
      resolvedUnitId = uObj.id;
    } else {
      const uObj2 = props.unitOptions.find(o => o.id + "" === medicine.prescriptionUnit);
      if (uObj2) {
        resolvedPriceUnit = uObj2.name;
        resolvedPriceUnitId = uObj2.id;
        resolvedUnit = uObj2.name;
        resolvedUnitId = uObj2.id;
      }
    }
  }

  const newItem: PrescriptionItem = {
    itemId: medicine.id ? Number(medicine.id) : undefined,
    itemType: medicine.type, //项目类型:1西药,2中药,3中成药,101检查检验,102处置项目,103附加费
    itemName: medicine.name,
    spec: medicine.spec,
    price: resolvedPrice, // 加价单价
    priceUnit: resolvedPriceUnit, // 计价单位名称
    priceUnitId: resolvedPriceUnitId, //计价单位id
    singleDosage: medicine.singleDosage ?? "", //单次用量
    unit: resolvedUnit, //单次用量单位名称
    unitId: resolvedUnitId, //单次用量单位id
    useWay: medicine.useWay ?? "",
    frequency: medicine.frequency ?? "",
    time: 1,
    days: 7,
    totalNum: 0,
    entrust: "",
    totalPrice: 0,
    prescriptionPrice: medicine.prescriptionPrice, //散卖价格
    prescriptionUnit: medicine.prescriptionUnit, //散卖单位
    wholesalePrice: medicine.wholesalePrice, //整卖价格
    wholesaleUnit: medicine.wholesaleUnit, //整卖单位
    conversionValue: medicine.conversionValue, //整散比
    decoWay: medicine.decoWay, //煎药方式
    defaultSaleType: medicine.defaultSaleType //默认售卖方式
  };
  calculateTotalNum(newItem);
  currentGroup.value.items.push(newItem);
};

const removeItem = (itemIdx: number) => {
  currentGroup.value?.items.splice(itemIdx, 1);
};

const recalcItemPrice = (item: PrescriptionItem) => {
  item.totalPrice = parseFloat(
    ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
  );
};

const freqPatterns: [RegExp, number][] = [
  [/q4h|每4小时|每四小时/i, 6],
  [/q6h|每6小时|每六小时/i, 4],
  [/q8h|每8小时|每八小时/i, 3],
  [/q12h|每12小时|每十二小时/i, 2],
  [/qid|每日四次|4次.?日|四次.?日/i, 4],
  [/tid|每日三次|3次.?日|三次.?日/i, 3],
  [/bid|每日两次|每日二次|2次.?日|两次.?日/i, 2],
  [/tiw|每周三次|3次.?周|三次.?周/i, 3 / 7],
  [/biw|每周两次|每周二次|2次.?周|两次.?周/i, 2 / 7],
  [/qw|每周一次|1次.?周|一次.?周/i, 1 / 7],
  [/qod|隔日|隔天|每隔一日/i, 0.5],
  [/qn|每晚|每夜|睡前/i, 1],
  [/qd|每日一次|每天一次|1次.?日|一次.?日|st|立即/i, 1]
];

const calculateTotalNum = (item: PrescriptionItem) => {
  if (!item.singleDosage || !item.days) {
    item.totalNum = 0;
    recalcItemPrice(item);
    return;
  }
  const singleDosage = parseFloat(item.singleDosage);
  if (isNaN(singleDosage)) {
    item.totalNum = 0;
    recalcItemPrice(item);
    return;
  }
  const matched = freqPatterns.find(([re]) => re.test(item.frequency));
  const timesPerDay = matched ? matched[1] : 1;
  item.time = timesPerDay;

  // 小单位总量 = 单次用量 × 频次 × 天数
  const smallUnitTotal = singleDosage * timesPerDay * item.days;

  // 整散比换算：如果有 conversionValue，换算成大单位数量，向上取整（医院不能拆盒发药）
  const conversion = parseFloat(item.conversionValue || "0");
  if (conversion > 0) {
    item.totalNum = Math.ceil(smallUnitTotal / conversion);
  } else {
    item.totalNum = Math.ceil(smallUnitTotal);
  }
  recalcItemPrice(item);
};

// 小单位总量 = 单次用量 × 频次 × 天数
const calculateSmallUnitTotal = (item: PrescriptionItem): number => {
  const singleDosage = parseFloat(item.singleDosage) || 0;
  const timesPerDay = item.time || 1;
  return singleDosage * timesPerDay * (item.days || 0);
};

const handleUnitChange = (item: PrescriptionItem) => {
  const opt = props.unitOptions.find(o => o.id === item.unitId);
  item.unit = opt?.name ?? "";

  // 根据选择的单位设置对应的单价和单价单位
  if (item.wholesaleUnit && item.unit === item.wholesaleUnit) {
    // 选择大单位，使用整卖价格，计价总量向上取整
    item.price = extractNumber(item.wholesalePrice);
    item.priceUnit = item.wholesaleUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.wholesaleUnit)?.id;
    const conversion = parseFloat(item.conversionValue || "0");
    if (conversion > 0) {
      const smallUnitTotal = calculateSmallUnitTotal(item);
      item.totalNum = Math.ceil(smallUnitTotal / conversion);
    }
  } else if (item.prescriptionUnit && item.unit === item.prescriptionUnit) {
    // 选择小单位，使用散卖价格，计价总量按原逻辑计算
    item.price = extractNumber(item.prescriptionPrice);
    item.priceUnit = item.prescriptionUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.prescriptionUnit)?.id;
    item.totalNum = calculateSmallUnitTotal(item);
  }
  recalcItemPrice(item);
};

const handlePriceUnitChange = (item: PrescriptionItem) => {
  const opt = props.unitOptions.find(o => o.id === item.priceUnitId);
  item.priceUnit = opt?.name ?? "";

  // 切换计价单位时，重新换算总量
  const conversion = parseFloat(item.conversionValue || "0");
  if (conversion <= 0) return;

  const singleDosage = parseFloat(item.singleDosage) || 0;
  const timesPerDay = item.time || 1;
  const smallUnitTotal = singleDosage * timesPerDay * (item.days || 0);

  const isLargeUnit =
    item.priceUnit === item.wholesaleUnit ||
    item.priceUnitId === props.unitOptions.find(o => o.name === item.wholesaleUnit)?.id;

  if (isLargeUnit) {
    item.totalNum = Math.ceil(smallUnitTotal / conversion);
  } else {
    item.totalNum = Math.ceil(smallUnitTotal);
  }
  recalcItemPrice(item);
};

const getItemPriceUnit = (item: PrescriptionItem): string => {
  const ret = item.priceUnit || item.unit || "";
  return ret ? "/" + ret : "";
};

// 获取每个药品的单位选项
const getItemUnitOptions = (item: PrescriptionItem) => {
  // 如果同时设置了大单位和小单位，则只填充大单位和小单位
  if (item.wholesaleUnit && item.prescriptionUnit) {
    const options: BQMedicalDictionaryEntityType[] = [];
    const wholesaleOpt = props.unitOptions.find(o => o.name === item.wholesaleUnit);
    if (wholesaleOpt) options.push({ ...wholesaleOpt });
    // 只有不同时才加入小单位
    if (item.prescriptionUnit !== item.wholesaleUnit) {
      const prescriptionOpt = props.unitOptions.find(o => o.name === item.prescriptionUnit);
      if (prescriptionOpt) options.push({ ...prescriptionOpt });
    }
    return options;
  }
  // 其它情况填充所有单位
  return props.unitOptions;
};

// 获取每个药品的计价单位选项
const getItemPriceUnitOptions = (item: PrescriptionItem) => {
  // 如果同时设置了大单位和小单位，则只填充大单位和小单位
  if (item.wholesaleUnit && item.prescriptionUnit) {
    const options: BQMedicalDictionaryEntityType[] = [];
    const wholesaleOpt = props.unitOptions.find(o => o.name === item.wholesaleUnit);
    if (wholesaleOpt) options.push({ ...wholesaleOpt });
    // 只有不同时才加入小单位
    if (item.prescriptionUnit !== item.wholesaleUnit) {
      const prescriptionOpt = props.unitOptions.find(o => o.name === item.prescriptionUnit);
      if (prescriptionOpt) options.push({ ...prescriptionOpt });
    }
    return options;
  }
  // 其它情况填充所有单位
  return props.unitOptions;
};

const addGroup = () => {
  props.typeData.groups.push({
    name: `处方${props.typeData.groups.length + 1}`,
    prescType: PRESC_TYPE,
    items: []
  });
  props.typeData.currentGroup = props.typeData.groups.length - 1;
};

const removeGroup = (index: number) => {
  if (props.typeData.groups.length > 1) {
    props.typeData.groups.splice(index, 1);
    if (props.typeData.currentGroup >= props.typeData.groups.length) {
      props.typeData.currentGroup = props.typeData.groups.length - 1;
    }
  }
};
</script>

<template>
  <div class="prescription-content">
    <!-- 处方组标签 -->
    <div class="prescription-group-header">
      <div class="group-tags">
        <span
          v-for="(group, index) in props.typeData.groups"
          :key="index"
          :class="[
            'group-tag',
            { active: props.typeData.currentGroup === index }
          ]"
          @click="props.typeData.currentGroup = index"
        >
          {{ group.name }}
          <el-icon
            v-if="props.typeData.groups.length > 1"
            @click.stop="removeGroup(index)"
          >
            <Close />
          </el-icon>
        </span>
        <span class="add-group-btn" @click="addGroup">
          <el-icon><Plus /></el-icon>
        </span>
      </div>
    </div>

    <!-- 处方明细表格 -->
    <div class="prescription-table">
      <div class="table-header">
        <div class="col-operation">操作</div>
        <div class="col-group">序号</div>
        <div class="col-name">药品名称</div>
        <div class="col-spec">规格</div>
        <div class="col-dosage">单次用量</div>
        <div class="col-unit">单位</div>
        <div class="col-usage">用法</div>
        <div class="col-frequency">频率</div>
        <div class="col-days">天数</div>
        <div class="col-total">计价总量</div>
        <div class="col-unit">单位</div>
        <div class="col-note">嘱托</div>
        <div class="col-price">单价(元)</div>
        <div class="col-amount">金额(元)</div>
      </div>
      <div class="table-body">
        <div v-if="!currentGroup?.items?.length" class="empty-text">
          暂无药品，请搜索添加
        </div>
        <div
          v-for="(item, itemIdx) in currentGroup?.items"
          :key="itemIdx"
          class="prescription-item-row"
        >
          <div class="col-operation">
            <el-button
              type="danger"
              link
              size="small"
              @click="removeItem(itemIdx)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="col-group">{{ itemIdx + 1 }}</div>
          <div class="col-name">{{ item.itemName }}</div>
          <div class="col-spec">{{ item.spec }}</div>
          <div class="col-dosage">
            <el-input
              v-model="item.singleDosage"
              size="small"
              style="width: 100%"
              @input="calculateTotalNum(item)"
            />
          </div>
          <div class="col-unit">
            <el-select
              v-model="item.unitId"
              size="small"
              style="width: 100%"
              placeholder="单位"
              @change="handleUnitChange(item)"
            >
              <el-option
                v-for="opt in getItemUnitOptions(item)"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </div>
          <div class="col-usage">
            <el-select
              v-model="item.useWay"
              size="small"
              style="width: 100%"
              placeholder="用法"
              clearable
            >
              <el-option
                v-for="opt in props.usageOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.name"
              />
            </el-select>
          </div>
          <div class="col-frequency">
            <el-select
              v-model="item.frequency"
              size="small"
              style="width: 100%"
              placeholder="频率"
              clearable
              @change="calculateTotalNum(item)"
            >
              <el-option
                v-for="opt in props.frequencyOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.name"
              />
            </el-select>
          </div>
          <div class="col-days">
            <el-input
              v-model.number="item.days"
              size="small"
              type="number"
              :min="1"
              style="width: 100%"
              @change="calculateTotalNum(item)"
            />
          </div>
          <div class="col-total">
            <el-input
              v-model.number="item.totalNum"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              @input="recalcItemPrice(item)"
            />
          </div>
          <div class="col-unit">
            <el-select
              v-model="item.priceUnitId"
              size="small"
              style="width: 100%"
              placeholder="单位"
              @change="handlePriceUnitChange(item)"
            >
              <el-option
                v-for="opt in getItemPriceUnitOptions(item)"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </div>
          <div class="col-note">
            <el-input v-model="item.entrust" size="small" style="width: 100%" />
          </div>
          <div class="col-price">
            <el-input
              v-model.number="item.price"
              size="small"
              type="number"
              min="0"
              @input="recalcItemPrice(item)"
            />
            <span class="price-unit-label"> /{{ item.priceUnit }} </span>
          </div>
          <div class="col-amount">{{ (item.totalPrice || 0).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 药品选择 -->
    <div class="drug-search-row">
      <BqMedicineSelector
        placeholder="输入药品名称搜索并选择"
        filter-type="western"
        class="drug-search-select"
        @select="handleAddDrug"
      />
      <div class="prescription-amount">
        处方金额：¥ {{ prescriptionAmount.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.prescription-content {
  background-color: #fff;
  padding: 16px;

  .prescription-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .group-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .group-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background-color: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }

      .add-group-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px dashed #409eff;
        border-radius: 4px;
        color: #409eff;
        cursor: pointer;

        &:hover {
          background-color: #ecf5ff;
        }
      }
    }
  }

  .drug-search-row {
    display: flex;
    justify-content: space-between; /* 关键：左右分开 */
    align-items: center; /* 垂直居中（可选） */
    width: 100%;

    .drug-search-select {
      width: 320px;
    }
  }

  .prescription-table {
    width: 100%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
    overflow-x: auto;

    .table-header,
    .table-body .prescription-item-row {
      .col-operation {
        width: 36px;
        flex-shrink: 0;
      }

      .col-group {
        width: 44px;
        flex-shrink: 0;
      }

      .col-name {
        flex: 1;
        min-width: 130px;
      }

      .col-spec {
        width: 88px;
        flex-shrink: 0;
      }

      .col-dosage {
        width: 72px;
        flex-shrink: 0;
      }

      .col-unit {
        width: 80px;
        flex-shrink: 0;
      }

      .col-usage {
        width: 90px;
        flex-shrink: 0;
      }

      .col-frequency {
        width: 148px;
        flex-shrink: 0;
      }

      .col-days {
        width: 72px;
        flex-shrink: 0;

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      }

      .col-total {
        width: 68px;
        flex-shrink: 0;
        text-align: right;
        padding-right: 8px;
      }

      .col-note {
        width: 110px;
        flex-shrink: 0;
      }

      .col-price {
        width: 136px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 4px;
        padding-right: 4px;

        .price-unit-label {
          white-space: nowrap;
          font-size: 12px;
          color: #f56c6c;
          font-weight: 700;
          flex-shrink: 0;
        }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      }

      .col-amount {
        width: 72px;
        flex-shrink: 0;
        text-align: right;
        padding-right: 4px;
      }
    }

    .table-header {
      display: flex;
      align-items: center;
      background-color: #f5f7fa;
      padding: 8px 12px;
      font-weight: 600;
      color: #606266;
      font-size: 13px;
      min-width: 1060px;
      gap: 4px;
    }

    .table-body {
      min-height: 60px;
      padding: 4px 12px;

      .empty-text {
        color: #909399;
        font-size: 14px;
        text-align: center;
        padding: 16px 0;
      }

      .prescription-item-row {
        display: flex;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        min-width: 1060px;
        gap: 4px;

        &:last-child {
          border-bottom: none;
        }

        .col-group {
          color: #409eff;
        }

        .col-spec {
          color: #909399;
          font-size: 12px;
        }

        .col-total {
          color: #303133;
          font-weight: 500;
        }

        .col-price {
          color: #409eff;
        }

        .col-amount {
          color: #f56c6c;
          font-weight: 700;
        }
      }
    }
  }

  .prescription-amount {
    font-size: 14px;
    color: #606266;
    padding: 8px 0;
  }
}
</style>
