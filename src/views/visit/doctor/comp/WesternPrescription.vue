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

// 按组号排序的药品列表
const sortedItems = computed(() => {
  if (!currentGroup.value?.items) return [];
  return [...currentGroup.value.items].sort((a, b) => (a.groupNo ?? 0) - (b.groupNo ?? 0));
});

// 获取最大组号
const getMaxGroupNo = (): number => {
  if (!currentGroup.value?.items?.length) return 0;
  return Math.max(...currentGroup.value.items.map(item => item.groupNo ?? 0));
};

// 新增药品时默认组号
const getNextGroupNo = (): number => {
  return getMaxGroupNo() + 1;
};

// 判断是否为同组第一行（用于控制频率和天数是否可编辑）
// 第一行的定义：在 sortedItems 中，同组内排在最前面的那个（即视觉上左上角位置）
const isGroupFirstRow = (item: PrescriptionItem): boolean => {
  if (!currentGroup.value?.items?.length) return false;
  const sameGroupItems = sortedItems.value.filter(i => i.groupNo === item.groupNo);
  if (!sameGroupItems.length) return false;
  return sameGroupItems[0] === item;
};

// 同步同组其他药品的频率、天数和用法
const syncGroupFrequencyAndDays = (leaderItem: PrescriptionItem) => {
  if (!currentGroup.value?.items?.length) return;
  currentGroup.value.items.forEach(item => {
    if (item.groupNo === leaderItem.groupNo && item !== leaderItem) {
      item.frequency = leaderItem.frequency;
      item.days = leaderItem.days;
      item.useWay = leaderItem.useWay;
      calculateTotalNum(item);
    }
  });
  calculateTotalNum(leaderItem);
};

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
    defaultSaleType: medicine.defaultSaleType, //默认售卖方式
    groupNo: getNextGroupNo()
  };
  calculateTotalNum(newItem);
  // 如果同组已有其他药品，同步该组第一行的频率、天数和用法
  // 第一行按 sortedItems（视觉顺序）确定，与 isGroupFirstRow 保持一致
  const sameGroupItems = sortedItems.value.filter(i => i.groupNo === newItem.groupNo && i !== newItem);
  if (sameGroupItems.length > 0) {
    const leader = sameGroupItems[0];
    newItem.frequency = leader.frequency;
    newItem.days = leader.days;
    newItem.useWay = leader.useWay;
    calculateTotalNum(newItem);
  }
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

  // 总量 = 单次用量 × 频次 × 天数（单位是 unit）
  const total = singleDosage * timesPerDay * item.days;
  const conversion = parseFloat(item.conversionValue || "0");

  // 根据 unit 和 priceUnit 的关系决定是否换算
  // unit = 大单位，priceUnit = 小单位 → totalNum = total × 整散比
  // unit = 小单位，priceUnit = 大单位 → totalNum = total ÷ 整散比
  // unit = priceUnit（相同）→ totalNum = total
  if (conversion > 0) {
    if (item.unit === item.wholesaleUnit && item.priceUnit === item.prescriptionUnit) {
      // unit=大，priceUnit=小，乘以整散比
      item.totalNum = Math.ceil(total * conversion);
    } else if (item.unit === item.prescriptionUnit && item.priceUnit === item.wholesaleUnit) {
      // unit=小，priceUnit=大，除以整散比
      item.totalNum = Math.ceil(total / conversion);
    } else {
      // 相同单位，不换算
      item.totalNum = Math.ceil(total);
    }
  } else {
    // 没有整散比，不换算
    item.totalNum = Math.ceil(total);
  }
  recalcItemPrice(item);
};

const handleUnitChange = (item: PrescriptionItem) => {
  const opt = props.unitOptions.find(o => o.id === item.unitId);
  item.unit = opt?.name ?? "";

  // 根据选择的单位设置对应的单价和单价单位
  if (item.unit === item.prescriptionUnit) {
    // 选择小单位，使用散卖价格
    item.price = extractNumber(item.prescriptionPrice);
    item.priceUnit = item.prescriptionUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.prescriptionUnit)?.id;
  } else {
    // 选择大单位（包括 wholesaleUnit 或其他单位），使用整卖价格
    item.price = extractNumber(item.wholesalePrice);
    item.priceUnit = item.wholesaleUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.wholesaleUnit)?.id;
  }
  // 由 calculateTotalNum 统一处理换算逻辑
  calculateTotalNum(item);
};

const handlePriceUnitChange = (item: PrescriptionItem) => {
  const opt = props.unitOptions.find(o => o.id === item.priceUnitId);
  item.priceUnit = opt?.name ?? "";

  // 根据选择的计价单位设置对应的单价
  if (item.priceUnit === item.wholesaleUnit) {
    // 计价单位是大单位，使用整卖价格
    item.price = extractNumber(item.wholesalePrice);
  } else if (item.priceUnit === item.prescriptionUnit) {
    // 计价单位是小单位，使用散卖价格
    item.price = extractNumber(item.prescriptionPrice);
  }
  // 由 calculateTotalNum 统一处理换算逻辑
  calculateTotalNum(item);
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
        <div v-if="!sortedItems.length" class="empty-text">
          暂无药品，请搜索添加
        </div>
        <div
          v-for="(item, itemIdx) in sortedItems"
          :key="itemIdx"
          class="prescription-item-row"
        >
          <div class="col-operation">
            <el-button
              type="danger"
              link
              size="small"
              @click="removeItem(currentGroup.items.indexOf(item))"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="col-group">
            <el-input
              v-model.number="item.groupNo"
              size="small"
              type="number"
              style="width: 100%"
              min="1"
            />
          </div>
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
              :disabled="!isGroupFirstRow(item)"
              @change="isGroupFirstRow(item) ? syncGroupFrequencyAndDays(item) : null"
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
              :disabled="!isGroupFirstRow(item)"
              @change="isGroupFirstRow(item) ? syncGroupFrequencyAndDays(item) : null"
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
              :disabled="!isGroupFirstRow(item)"
              style="width: 100%"
              @input="isGroupFirstRow(item) ? syncGroupFrequencyAndDays(item) : null"
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
