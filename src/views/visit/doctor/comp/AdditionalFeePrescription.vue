<!--
  - 附加费处方组件
  -->
<script setup lang="ts">
import { computed } from "vue";
import { Close, Plus } from "@element-plus/icons-vue";

defineOptions({ name: "AdditionalFeePrescription" });

export interface FeeItem {
  id?: number;
  name: string;
  amount: number;
}

const props = defineProps<{
  fees: FeeItem[];
}>();

const emit = defineEmits<{
  (e: "add"): void;
  (e: "remove", index: number): void;
  (e: "update", index: number, amount: number): void;
}>();

const totalAmount = computed(() =>
  props.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0)
);

const removeItem = (index: number) => {
  emit("remove", index);
};

const updateAmount = (index: number, amount: number) => {
  emit("update", index, amount);
};
</script>

<template>
  <div class="prescription-content">
    <div class="prescription-table">
      <div class="table-header">
        <div class="col-operation">操作</div>
        <div class="col-name">附加费名称</div>
        <div class="col-amount">金额(元)</div>
      </div>
      <div class="table-body">
        <div v-if="!props.fees.length" class="empty-text">
          暂无附加费，请点击添加
        </div>
        <div
          v-for="(fee, index) in props.fees"
          :key="index"
          class="prescription-item-row"
        >
          <div class="col-operation">
            <el-button
              type="danger"
              link
              size="small"
              @click="removeItem(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="col-name">{{ fee.name }}</div>
          <div class="col-amount">
            <el-input
              v-model.number="fee.amount"
              size="small"
              type="number"
              min="0"
              style="width: 100%"
              @input="updateAmount(index, fee.amount)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="fee-footer">
      <el-button type="primary" @click="emit('add')">
        <el-icon><Plus /></el-icon>
        添加附加费
      </el-button>
      <div class="total-amount">
        合计：¥{{ totalAmount.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.prescription-content {
  background-color: #fff;
  padding: 16px;

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

      .col-name {
        flex: 1;
        min-width: 200px;
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

        .col-amount {
          color: #f56c6c;
          font-weight: 700;
        }
      }
    }
  }

  .fee-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .total-amount {
      font-size: 14px;
      color: #606266;
      padding: 8px 0;
    }
  }
}
</style>
