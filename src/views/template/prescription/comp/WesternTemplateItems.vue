<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";
import type { BQPrescriptionTemplateDetailEntityType } from "@/api/cm/prescriptionTemplate";
import type { BQMedicalDictionaryEntityType } from "@/api/cm/medicalDictionary";

defineOptions({ name: "WesternTemplateItems" });

const props = defineProps<{
  items: BQPrescriptionTemplateDetailEntityType[];
  disabled: boolean;
  unitOptions: BQMedicalDictionaryEntityType[];
  usageOptions: BQMedicalDictionaryEntityType[];
  frequencyOptions: BQMedicalDictionaryEntityType[];
}>();

const emit = defineEmits<{
  "update:items": [items: BQPrescriptionTemplateDetailEntityType[]];
  remove: [index: number];
  add: [medicine: any];
}>();

const handleQuantityChange = (item: BQPrescriptionTemplateDetailEntityType) => {
  // 同步更新 items
};

const getUnitName = (id?: number) => {
  if (id == null) return "";
  return props.unitOptions.find(o => o.id === id)?.name ?? "";
};

const getUsageName = (id?: number) => {
  if (id == null) return "";
  return props.usageOptions.find(o => o.id === id)?.name ?? "";
};

const getFrequencyName = (id?: number) => {
  if (id == null) return "";
  return props.frequencyOptions.find(o => o.id === id)?.name ?? "";
};
</script>

<template>
  <div class="template-items-wrapper">
    <table class="template-table">
      <thead>
        <tr>
          <th style="width: 50px">操作</th>
          <th style="width: 50px">序号</th>
          <th style="min-width: 120px">药品名称</th>
          <th style="width: 80px">单次用量</th>
          <th style="width: 100px">单位</th>
          <th style="width: 100px">用法</th>
          <th style="width: 100px">频率</th>
          <th style="width: 80px">天数</th>
          <th style="width: 80px">计价总量</th>
          <th style="width: 100px">单位</th>
          <th style="width: 120px">嘱托</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td colspan="11" class="empty-row">
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
          <td class="dosage-cell">
            <el-input
              v-model.number="item.singleUsageAmount"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              :disabled="disabled"
              @change="handleQuantityChange(item)"
            />
          </td>
          <td class="unit-cell">
            <el-select
              v-model="item.singleUsageUnit"
              size="small"
              style="width: 100%"
              clearable
              placeholder="单位"
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
          <td class="usage-cell">
            <el-select
              v-model="item.usageType"
              size="small"
              style="width: 100%"
              clearable
              placeholder="用法"
              :disabled="disabled"
            >
              <el-option
                v-for="opt in usageOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </td>
          <td class="frequency-cell">
            <el-select
              v-model="item.frequence"
              size="small"
              style="width: 100%"
              clearable
              placeholder="频率"
              :disabled="disabled"
            >
              <el-option
                v-for="opt in frequencyOptions"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </td>
          <td class="days-cell">
            <el-input
              v-model.number="item.days"
              size="small"
              style="width: 100%"
              type="number"
              min="0"
              :disabled="disabled"
            />
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
              clearable
              placeholder="单位"
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
          <td class="note-cell">
            <el-input
              v-model="item.recommendation"
              size="small"
              style="width: 100%"
              :disabled="disabled"
              placeholder="嘱托"
            />
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
  .usage-cell,
  .frequency-cell,
  .days-cell,
  .total-cell,
  .price-unit-cell,
  .note-cell {
    text-align: center;
  }

  .name-cell {
    text-align: left;
    padding-left: 12px;
    color: var(--el-text-color-regular);
  }

  .dosage-cell,
  .days-cell,
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