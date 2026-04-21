<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";
import { watch } from "vue";
import type { BQPrescriptionTemplateDetailEntityType } from "@/api/cm/prescriptionTemplate";
import type { BQMedicalDictionaryEntityType } from "@/api/cm/medicalDictionary";

defineOptions({ name: "ChineseTemplateItems" });

const props = defineProps<{
  items: BQPrescriptionTemplateDetailEntityType[];
  disabled: boolean;
  unitOptions: BQMedicalDictionaryEntityType[];
  decoOptions: BQMedicalDictionaryEntityType[];
  doseAmount?: number;
  days?: number;
  frequenceOptions: BQMedicalDictionaryEntityType[];
  frequence?: number;
}>();

const emit = defineEmits<{
  "update:items": [items: BQPrescriptionTemplateDetailEntityType[]];
  remove: [index: number];
  add: [medicine: any];
}>();

const getDecoName = (id?: number) => {
  if (id == null) return "";
  return props.decoOptions.find(o => o.id === id)?.name ?? "";
};

// 频率转数字的匹配模式（参照 clinic.vue 的 ChinesePrescription）
const freqPatterns: [RegExp, number][] = [
  [/qd|每日一次|每天一次|1次.?日|一次.?日|st|立即/i, 1],
  [/bid|每日两次|每天两次|2次.?日|两次.?日/i, 2],
  [/tid|每日三次|每天三次|3次.?日|三次.?日/i, 3],
  [/qid|每日四次|每天四次|4次.?日|四次.?日/i, 4],
];

// 获取频率数值（从名称中匹配）
const getFrequencyNum = (id?: number): number => {
  if (id == null) return 0;
  const option = props.frequenceOptions.find(o => o.id === id);
  if (!option?.name) return 0;
  const matched = freqPatterns.find(([re]) => re.test(option.name));
  return matched ? matched[1] : 1;
};

// 重新计算计价总量 = 剂数 × 频率转换值 × 天数 × 行内单次用量
const recalculateQuantity = (item: BQPrescriptionTemplateDetailEntityType) => {
  const doseAmt = props.doseAmount ?? 1;
  const frequenceNum = getFrequencyNum(props.frequence);
  const daysVal = props.days ?? 1;
  const singleUsage = item.singleUsageAmount ?? 0;
  item.quantity = doseAmt * frequenceNum * daysVal * singleUsage;
};

// 监听单次用量变化
const handleSingleUsageChange = (item: BQPrescriptionTemplateDetailEntityType) => {
  recalculateQuantity(item);
};

// 暴露给父组件的重新计算方法
const recalculateAll = () => {
  props.items.forEach(item => {
    recalculateQuantity(item);
  });
};

defineExpose({ recalculateAll });

// 监听外部传入的剂数、天数或频率变化，重新计算所有行
watch(
  () => [props.doseAmount, props.days, props.frequence],
  () => {
    props.items.forEach(item => {
      recalculateQuantity(item);
    });
  }
);
</script>

<template>
  <div class="template-items-wrapper">
    <table class="template-table">
      <thead>
        <tr>
          <th style="width: 50px">操作</th>
          <th style="width: 50px">序号</th>
          <th style="min-width: 100px">药品名称</th>
          <th style="width: 120px">煎药方式</th>
          <th style="width: 80px">单次用量</th>
          <th style="width: 80px">单位</th>
          <th style="width: 100px">计价总量</th>
          <th style="width: 80px">计价单位</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td colspan="8" class="empty-row">
            暂无药品明细
          </td>
        </tr>
        <tr v-for="(item, index) in items" :key="item.id || index">
          <td class="action-cell">
            <el-button
              type="danger"
              link
              :icon="Delete"
              :disabled="disabled"
              @click="emit('remove', index)"
            />
          </td>
          <td class="index-cell">{{ index + 1 }}</td>
          <td class="name-cell">{{ item.drugName }}</td>
          <td class="deco-cell">
            <el-select
              v-model="item.cookingType"
              size="small"
              style="width: 100%"
              clearable
              placeholder="请选择"
              :disabled="disabled"
            >
              <el-option
                v-for="opt in decoOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </td>
          <td class="dosage-cell">
            <el-input
              v-model.number="item.singleUsageAmount"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              :disabled="disabled"
              @change="handleSingleUsageChange(item)"
            />
          </td>
          <td class="unit-cell">
            <el-select
              v-model="item.singleUsageUnit"
              size="small"
              style="width: 100%"
              placeholder="单位"
              clearable
              :disabled="disabled"
            >
              <el-option
                v-for="opt in unitOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </td>
          <td class="total-cell">
            <el-input
              v-model.number="item.quantity"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              :disabled="disabled"
            />
          </td>
          <td class="price-unit-cell">
            <el-select
              v-model="item.quantityUnit"
              size="small"
              style="width: 100%"
              placeholder="单位"
              clearable
              :disabled="disabled"
            >
              <el-option
                v-for="opt in unitOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.template-items-wrapper {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background-color: var(--el-fill-color-light);

    th {
      padding: 10px 8px;
      text-align: center;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);

      &:nth-child(3) {
        text-align: left;
        padding-left: 20px;
      }
    }
  }

  tbody {
    tr {
      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        vertical-align: middle;
        text-align: center;

        &:last-child {
          border-bottom-color: transparent;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }

  .empty-row {
    text-align: center;
    color: var(--el-text-color-placeholder);
    padding: 20px;
  }

  .action-cell,
  .index-cell,
  .unit-cell,
  .deco-cell,
  .dosage-cell,
  .total-cell,
  .price-unit-cell {
    text-align: center;
  }

  .name-cell {
    text-align: left;
    padding-left: 12px;
    color: var(--el-text-color-regular);
  }

  .deco-cell,
  .unit-cell,
  .price-unit-cell {
    :deep(.el-select) {
      width: 100%;
    }
  }

  .dosage-cell,
  .total-cell {
    :deep(.el-input__inner) {
      text-align: center;
    }
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
</style>