<!--
  - 中药处方组件
  - 顶部批量设置行（用法/频率/天数/总剂数/嘱托），改变时批量更新所有明细
  - 明细表隐藏用法/频率/天数/嘱托列
  - 计价总量 = 单次用量 × 总剂数
  -->
<script setup lang="ts">
import { reactive, computed } from "vue";
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

defineOptions({ name: "ChinesePrescription" });

const props = defineProps<{
  typeData: PrescriptionTypeData;
  usageOptions: BQMedicalDictionaryEntityType[];
  frequencyOptions: BQMedicalDictionaryEntityType[];
  unitOptions: BQMedicalDictionaryEntityType[];
  decoOptions: BQMedicalDictionaryEntityType[];
}>();

const PRESC_TYPE = 2;

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

// 批量设置（作用于当前处方组所有中药明细）
const batch = reactive({
  useWay: "",
  frequency: "",
  days: 7,
  totalDoses: 7,
  entrust: "",
  wholesaleUnit: "",
  prescriptionUnit: ""
});

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

const getTimesPerDay = (frequency: string): number => {
  const matched = freqPatterns.find(([re]) => re.test(frequency));
  return matched ? matched[1] : 1;
};

// 频率或天数变化 → 重算总剂数 → 批量应用
const onFrequencyOrDaysChange = () => {
  const timesPerDay = getTimesPerDay(batch.frequency);
  batch.totalDoses = Number((timesPerDay * batch.days).toFixed(2));
  applyBatchToItems();
};

// 直接修改总剂数 → 批量应用
const onTotalDosesChange = () => {
  applyBatchToItems();
};

// 将批量设置写入当前组所有明细
const applyBatchToItems = () => {
  if (!currentGroup.value) return;
  currentGroup.value.items.forEach(item => {
    item.useWay = batch.useWay;
    item.frequency = batch.frequency;
    item.days = batch.days;
    item.entrust = batch.entrust;
    // 单位设置：如果两个都设置了，用设置的；如果没设置或只设置了一个，用item的药库值填充所有单位
    if (batch.wholesaleUnit && batch.prescriptionUnit) {
      // 两个都设置了
      item.wholesaleUnit = batch.wholesaleUnit;
      item.prescriptionUnit = batch.prescriptionUnit;
      item.unit = batch.wholesaleUnit;
    } else {
      // 没设置或只设置了一个，用item的药库值填充所有单位
      item.wholesaleUnit = item.wholesaleUnit || "";
      item.prescriptionUnit = item.prescriptionUnit || "";
      item.unit = item.wholesaleUnit || item.prescriptionUnit || "";
    }
    recalcItemTotalNum(item);
  });
};

const recalcItemPrice = (item: PrescriptionItem) => {
  item.totalPrice = parseFloat(
    ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
  );
};

// 中药：计价总量 = 单次用量 × 总剂数
const recalcItemTotalNum = (item: PrescriptionItem) => {
  const sd = parseFloat(item.singleDosage);
  item.totalNum = isNaN(sd)
    ? 0
    : Number((sd * batch.totalDoses).toFixed(2));
  recalcItemPrice(item);
};

const handleAddDrug = (medicine: MedicineItem) => {
  if (!currentGroup.value) return;

  // 根据大单位和小单位设置默认单位和单价
  let resolvedUnit = "";
  let resolvedUnitId: number | undefined = undefined;
  let resolvedPrice = 0;
  let resolvedPriceUnit = "";
  let resolvedPriceUnitId: number | undefined = undefined;

  if (medicine.wholesaleUnit && medicine.prescriptionUnit) {
    // 两个都设置了，根据默认售卖方式决定
    if (medicine.defaultSaleType === 0) {
      // 整卖：用大单位
      resolvedUnit = medicine.wholesaleUnit;
      resolvedUnitId = props.unitOptions.find(o => o.name === medicine.wholesaleUnit)?.id;
      resolvedPrice = parseFloat(medicine.wholesalePrice || "0") || 0;
      resolvedPriceUnit = medicine.wholesaleUnit;
      resolvedPriceUnitId = resolvedUnitId;
    } else {
      // 散卖：用小单位
      resolvedUnit = medicine.prescriptionUnit;
      resolvedUnitId = props.unitOptions.find(o => o.name === medicine.prescriptionUnit)?.id;
      resolvedPrice = parseFloat(medicine.prescriptionPrice || "0") || 0;
      resolvedPriceUnit = medicine.prescriptionUnit;
      resolvedPriceUnitId = resolvedUnitId;
    }
  } else {
    // 其它情况用药库原始值
    resolvedUnit = props.unitOptions.find(o => o.id === medicine.unitId)?.name ?? "";
    resolvedUnitId = medicine.unitId;
    resolvedPrice = parseFloat(medicine.price || "0") || 0;
    resolvedPriceUnit = resolvedUnit;
    resolvedPriceUnitId = resolvedUnitId;
  }

  currentGroup.value.items.push({
    itemId: medicine.id ? Number(medicine.id) : undefined,
    itemType: 1,
    itemName: medicine.name,
    spec: medicine.spec,
    unit: resolvedUnit,
    unitId: resolvedUnitId,
    priceUnit: resolvedPriceUnit,
    priceUnitId: resolvedPriceUnitId,
    singleDosage: medicine.singleDosage ?? "",
    useWay: batch.useWay,
    frequency: batch.frequency,
    time: 1,
    days: batch.days,
    totalNum: 0,
    entrust: batch.entrust,
    price: resolvedPrice,
    totalPrice: 0,
    prescriptionPrice: medicine.prescriptionPrice, //散卖价格
    prescriptionUnit: medicine.prescriptionUnit, //散卖单位
    wholesalePrice: medicine.wholesalePrice, //整卖价格
    wholesaleUnit: medicine.wholesaleUnit, //整卖单位
    conversionValue: medicine.conversionValue, //整散比
    decoWay: medicine.decoWay //煎药方式
  });
  recalcItemTotalNum(currentGroup.value.items[currentGroup.value.items.length - 1]);
};

const removeItem = (itemIdx: number) => {
  currentGroup.value?.items.splice(itemIdx, 1);
};

const handleUnitChange = (item: PrescriptionItem) => {
  const opt = props.unitOptions.find(o => o.id === item.unitId);
  item.unit = opt?.name ?? "";

  const oldTotalNum = item.totalNum || 0;
  const conversionValue = parseFloat(item.conversionValue || "0") || 1;

  // 根据选择的单位设置对应的单价和单价单位，并按整散比重算计价总量
  if (item.wholesaleUnit && item.unit === item.wholesaleUnit) {
    // 选择大单位（整卖），使用整卖价格，计价总量换算
    item.price = parseFloat(item.wholesalePrice || "0") || 0;
    item.priceUnit = item.wholesaleUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.wholesaleUnit)?.id;
    // 从小单位切换到大单位：总量减少（除以整散比）
    if (item.prescriptionUnit && oldTotalNum > 0) {
      item.totalNum = Number((oldTotalNum / conversionValue).toFixed(2));
    }
  } else if (item.prescriptionUnit && item.unit === item.prescriptionUnit) {
    // 选择小单位（散卖），使用散卖价格，计价总量换算
    item.price = parseFloat(item.prescriptionPrice || "0") || 0;
    item.priceUnit = item.prescriptionUnit;
    item.priceUnitId = props.unitOptions.find(o => o.name === item.prescriptionUnit)?.id;
    // 从大单位切换到小单位：总量增加（乘以整散比）
    if (item.wholesaleUnit && oldTotalNum > 0) {
      item.totalNum = Number((oldTotalNum * conversionValue).toFixed(2));
    }
  }
  recalcItemPrice(item);
};

const handleDecoChange = (item: PrescriptionItem) => {
  // 煎药方式
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

const getItemPriceUnit = (item: PrescriptionItem): string => {
  if (item.priceUnit) return item.priceUnit;
  if (item.spec) {
    const m = item.spec.match(/[/／]([^/／]+)$/);
    if (m) return m[1].trim();
    const m2 = item.spec.match(/([\u4e00-\u9fa5]+)$/);
    if (m2) return m2[1];
  }
  return item.unit || "";
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

// 应用模板带入的用法/频率/剂数
const applyTemplateSettings = (settings: {
  usageTypeName?: string;
  frequenceName?: string;
  doseAmount?: number;
  decoWay?: string;
}) => {
  if (settings.usageTypeName) {
    batch.useWay = settings.usageTypeName;
  }
  if (settings.frequenceName) {
    batch.frequency = settings.frequenceName;
  }
  if (settings.doseAmount) {
    batch.totalDoses = settings.doseAmount;
    batch.days = settings.doseAmount;
  }
  if (settings.decoWay) {
    batch.entrust = settings.decoWay;
  }
  applyBatchToItems();
};

defineExpose({ applyTemplateSettings });
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

    <!-- 批量设置 -->
    <div class="batch-controls-row">
      <el-select
        v-model="batch.useWay"
        placeholder="用法"
        class="batch-select"
        clearable
        @change="applyBatchToItems"
      >
        <el-option
          v-for="opt in props.usageOptions"
          :key="opt.id"
          :label="opt.name"
          :value="opt.name"
        />
      </el-select>

      <el-select
        v-model="batch.frequency"
        placeholder="频率"
        class="batch-select-wide"
        clearable
        @change="onFrequencyOrDaysChange"
      >
        <el-option
          v-for="opt in props.frequencyOptions"
          :key="opt.id"
          :label="opt.name"
          :value="opt.name"
        />
      </el-select>

      <span class="batch-label">天数</span>
      <el-input-number
        v-model="batch.days"
        :min="1"
        :step="1"
        class="batch-num"
        controls-position="right"
        @change="onFrequencyOrDaysChange"
      />

      <span class="batch-label">总剂数</span>
      <el-input-number
        v-model="batch.totalDoses"
        :min="0"
        :step="1"
        class="batch-num"
        controls-position="right"
        @change="onTotalDosesChange"
      />

      <el-input
        v-model="batch.entrust"
        placeholder="嘱托"
        class="batch-entrust"
        clearable
        @change="applyBatchToItems"
      />
    </div>

    <!-- 处方明细表格（隐藏用法/频率/天数/嘱托列） -->
    <div class="prescription-table">
      <div class="table-header">
        <div class="col-operation">操作</div>
        <div class="col-group">序号</div>
        <div class="col-name">药品名称</div>
        <div class="col-spec">规格</div>
        <div class="col-deco">煎药方式</div>
        <div class="col-dosage">单次用量</div>
        <div class="col-unit">单位</div>
        <div class="col-total">计价总量</div>
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
          <div class="col-deco">
            <el-select
              v-model="item.decoWay"
              size="small"
              style="width: 100%"
              placeholder="请选择"
              clearable
              @change="handleDecoChange(item)"
            >
              <el-option
                v-for="opt in props.decoOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </div>
          <div class="col-dosage">
            <el-input
              v-model="item.singleDosage"
              size="small"
              style="width: 100%"
              @input="recalcItemTotalNum(item)"
            />
          </div>
          <div class="col-unit">
            <el-select
              v-model="item.unitId"
              size="small"
              style="width: 100%"
              placeholder="单位"
              clearable
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
          <div class="col-price">
            <el-input
              v-model.number="item.price"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              @input="recalcItemPrice(item)"
            />
            <span v-if="getItemPriceUnit(item)" class="price-unit-label">
              /{{ getItemPriceUnit(item) }}
            </span>
          </div>
          <div class="col-amount">{{ (item.totalPrice || 0).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 药品选择 + 金额（同一行） -->
    <div class="drug-search-row">
      <BqMedicineSelector
        placeholder="输入中药名称搜索并选择"
        filter-type="chinese"
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
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .drug-search-select {
      width: 320px;
      flex-shrink: 0;
    }
  }

  .batch-controls-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;

    .batch-label {
      font-size: 13px;
      color: #606266;
      white-space: nowrap;
    }

    .batch-select {
      width: 140px;
    }

    .batch-select-wide {
      width: 140px;
    }

    .batch-num {
      width: 100px;
    }

    .batch-entrust {
      width: 140px;
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

      .col-deco {
        width: 180px;
        flex-shrink: 0;
      }

      .col-unit {
        width: 80px;
        flex-shrink: 0;
      }

      .col-total {
        width: 80px;
        flex-shrink: 0;
        text-align: right;
        padding-right: 8px;
      }

      .col-price {
        width: 100px;
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
      padding: 8px 0;
      font-weight: 600;
      color: #606266;
      font-size: 13px;
      min-width: 640px;
      gap: 4px;
      box-sizing: border-box;

      > div {
        padding-left: 12px;
        box-sizing: border-box;
      }
    }

    .table-body {
      min-height: 60px;

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
        min-width: 640px;
        gap: 4px;
        box-sizing: border-box;

        > div {
          padding-left: 12px;
          box-sizing: border-box;
        }

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