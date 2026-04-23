<!--
  - 检查检验/处置项目处方组件（检查和处置复用同一个组件）
  - type='exam' 显示检查检验选择器，type='treatment' 显示处置项目选择器
  -->
<script setup lang="ts">
import { computed } from "vue";
import { Close, Plus } from "@element-plus/icons-vue";
import { BqExamineItemSelector } from "@/components/BqExamineItemSelector";
import { BqTreatmentItemSelector } from "@/components/BqTreatmentItemSelector";
import type { BQExamineItemEntityType } from "@/api/pharmacy/examine";
import type { BQTreatmentItemEntityType } from "@/api/pharmacy/treatment";
import type {
  PrescriptionItem,
  PrescriptionTypeData
} from "../prescriptionTypes";

defineOptions({ name: "ExamTreatmentPrescription" });

const props = defineProps<{
  type: "exam" | "treatment";
  typeData: PrescriptionTypeData;
}>();

const prescType = computed(() => (props.type === "exam" ? 3 : 4));
const groupPrefix = "项目";
const searchPlaceholder = computed(() =>
  props.type === "exam"
    ? "输入检查检验项目名称搜索并选择"
    : "输入处置项目名称搜索并选择"
);

const currentGroup = computed(
  () => props.typeData.groups[props.typeData.currentGroup]
);

// 按组号排序的列表
const sortedItems = computed(() => {
  if (!currentGroup.value?.items) return [];
  return [...currentGroup.value.items].sort((a, b) => (a.groupNo ?? 0) - (b.groupNo ?? 0));
});

// 获取最大组号
const getMaxGroupNo = (): number => {
  if (!currentGroup.value?.items?.length) return 0;
  return Math.max(...currentGroup.value.items.map(item => item.groupNo ?? 0));
};

// 新增时默认组号
const getNextGroupNo = (): number => {
  return getMaxGroupNo() + 1;
};

const prescriptionAmount = computed(
  () =>
    currentGroup.value?.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    ) ?? 0
);

const recalcItemPrice = (item: PrescriptionItem) => {
  item.totalPrice = parseFloat(
    ((item.price || 0) * (item.totalNum || 0)).toFixed(2)
  );
};

const handleAddExamItem = (item: BQExamineItemEntityType) => {
  if (!currentGroup.value) return;
  const price = parseFloat(item.sellingPrice || "0") || 0;
  currentGroup.value.items.push({
    itemType: 2,
    itemName: item.name ?? "",
    spec: "1次",
    unit: "",
    unitId: undefined,
    priceUnit: "",
    priceUnitId: undefined,
    singleDosage: "",
    useWay: "",
    frequency: "",
    time: 1,
    days: 1,
    totalNum: 1,
    entrust: "",
    price,
    totalPrice: price,
    groupNo: getNextGroupNo()
  });
};

const handleAddTreatmentItem = (item: BQTreatmentItemEntityType) => {
  if (!currentGroup.value) return;
  const price = parseFloat(item.sellingPrice || "0") || 0;
  currentGroup.value.items.push({
    itemType: 3,
    itemName: item.name ?? "",
    spec: "1次",
    unit: "",
    unitId: undefined,
    priceUnit: "",
    priceUnitId: undefined,
    singleDosage: "",
    useWay: "",
    frequency: "",
    time: 1,
    days: 1,
    totalNum: 1,
    entrust: "",
    price,
    totalPrice: price,
    groupNo: getNextGroupNo()
  });
};

const removeItem = (itemIdx: number) => {
  currentGroup.value?.items.splice(itemIdx, 1);
};

const addGroup = () => {
  props.typeData.groups.push({
    name: `${groupPrefix}${props.typeData.groups.length + 1}`,
    prescType: prescType.value,
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
    <!-- 项目组标签 -->
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

    <!-- 项目明细表格 -->
    <div class="prescription-table">
      <div class="table-header">
        <div class="col-operation">操作</div>
        <div class="col-group">序号</div>
        <div class="col-name">项目名称</div>
        <div class="col-spec">规格</div>
        <div class="col-total">数量</div>
        <div class="col-price">单价(元)</div>
        <div class="col-amount">金额(元)</div>
      </div>
      <div class="table-body">
        <div v-if="!sortedItems.length" class="empty-text">
          暂无项目，请搜索添加
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
              type="number"
              min="0"
              @input="recalcItemPrice(item)"
            />
          </div>
          <div class="col-amount">{{ (item.totalPrice || 0).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 项目选择 + 金额（同一行） -->
    <div class="drug-search-row">
      <BqExamineItemSelector
        v-if="props.type === 'exam'"
        :placeholder="searchPlaceholder"
        class="drug-search-select"
        @select="handleAddExamItem"
      />
      <BqTreatmentItemSelector
        v-else
        :placeholder="searchPlaceholder"
        class="drug-search-select"
        @select="handleAddTreatmentItem"
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
        min-width: 200px;
      }

      .col-spec {
        width: 88px;
        flex-shrink: 0;
      }

      .col-total {
        width: 80px;
        flex-shrink: 0;
      }

      .col-price {
        width: 120px;
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

      .col-amount {
        width: 90px;
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
