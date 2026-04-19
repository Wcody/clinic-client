<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Loading, ArrowLeft } from "@element-plus/icons-vue";
import {
  getDrugSalesItemsApi,
  type BQDrugSalesEntityType,
  type BQDrugSalesItemType
} from "@/api/pharmacy/sales";

defineOptions({
  name: "RetailDetailPanel"
});

interface Props {
  visible: boolean;
  detailData?: BQDrugSalesEntityType | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  detailData: null
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
}>();

const detailLoading = ref(false);
const currentDetailItems = ref<BQDrugSalesItemType[]>([]);

// 监听面板显示，加载明细数据
const handlePanelShow = async () => {
  if (!props.detailData) return;

  detailLoading.value = true;
  currentDetailItems.value = [];

  try {
    const salesId = Number(props.detailData.eid);
    if (salesId) {
      const itemsRes = await getDrugSalesItemsApi(salesId);
      if (itemsRes.code === 0 && itemsRes.data) {
        currentDetailItems.value = itemsRes.data;
      }
    }
  } catch (error) {
    console.error("加载零售记录详情失败:", error);
    ElMessage.error("加载详情失败");
  } finally {
    detailLoading.value = false;
  }
};

// 关闭面板
const handleClose = () => {
  emit("update:visible", false);
  emit("close");
  currentDetailItems.value = [];
};

// 监听 visible 变化
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      handlePanelShow();
    }
  }
);

// 计算年龄显示文本
const getAgeText = (detail: BQDrugSalesEntityType) => {
  if (!detail.firstAge && detail.firstAge !== 0) return "";

  let ageText = "";
  if (detail.ageType === 1) {
    // 岁
    ageText = `${detail.firstAge}岁`;
    if (detail.lastAge && detail.lastAge > 0) {
      ageText += `${detail.lastAge}月`;
    }
  } else if (detail.ageType === 2) {
    // 月
    ageText = `${detail.firstAge}月`;
    if (detail.lastAge && detail.lastAge > 0) {
      ageText += `${detail.lastAge}天`;
    }
  } else if (detail.ageType === 3) {
    // 天
    ageText = `${detail.firstAge}天`;
  }

  return ageText;
};

// 格式化金额
const formatAmount = (amount: string | number | undefined) => {
  if (!amount && amount !== 0) return "0.00";
  return Number(amount).toFixed(2);
};
</script>

<template>
  <transition name="panel-fade">
    <div v-if="visible" class="retail-detail-panel">
      <!-- 顶部工具栏 -->
      <div class="panel-header">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          @click="handleClose"
          class="back-btn"
          size="small"
        >
          返回列表
        </el-button>
        <span class="panel-title">零售记录详情</span>
      </div>

      <!-- 内容区域 -->
      <div class="panel-body">
        <div v-if="detailLoading" class="detail-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="detailData" class="detail-content">
          <!-- 基本信息区域 -->
          <div class="detail-section">
            <div class="section-title">
              <span class="title-bar" />
              <span class="title-text">患者信息</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">患者姓名：</span>
                <span class="info-value">{{
                  detailData.patientName || "-"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">性别：</span>
                <span class="info-value">{{ detailData.gender || "-" }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">年龄：</span>
                <span class="info-value">{{
                  getAgeText(detailData) || "-"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">身份证号：</span>
                <span class="info-value">{{ detailData.idCard || "-" }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">手机号：</span>
                <span class="info-value">{{ detailData.mobile || "-" }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">是否初诊：</span>
                <span class="info-value">{{
                  detailData.isFirstVisit ? "是" : "否"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">是否过敏：</span>
                <span class="info-value">{{
                  detailData.isAllergy ? "是" : "否"
                }}</span>
              </div>
              <div
                class="info-item full-width"
                v-if="
                  detailData.province ||
                  detailData.city ||
                  detailData.district ||
                  detailData.address
                "
              >
                <span class="info-label">地址：</span>
                <span class="info-value">
                  {{ detailData.province }}{{ detailData.city
                  }}{{ detailData.district }}{{ detailData.address }}
                </span>
              </div>
            </div>
          </div>

          <!-- 订单信息区域 -->
          <div class="detail-section">
            <div class="section-title">
              <span class="title-bar" />
              <span class="title-text">订单信息</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">销售单号：</span>
                <span class="info-value">{{ detailData.eid }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总金额：</span>
                <span class="info-value amount-highlight"
                  >¥{{ formatAmount(detailData.amount) }}</span
                >
              </div>
              <div class="info-item">
                <span class="info-label">实收金额：</span>
                <span class="info-value amount-highlight"
                  >¥{{ formatAmount(detailData.actualAmount) }}</span
                >
              </div>
              <div class="info-item">
                <span class="info-label">状态：</span>
                <span
                  class="info-value"
                  :class="
                    detailData.status === 1 ? 'status-paid' : 'status-unpaid'
                  "
                >
                  {{ detailData.status === 1 ? "已收费" : "未收费" }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">操作人：</span>
                <span class="info-value">{{
                  detailData.createdBy || "-"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{
                  detailData.createdTime || "-"
                }}</span>
              </div>
            </div>
          </div>

          <!-- 药品明细区域 -->
          <div class="detail-section">
            <div class="section-title">
              <span class="title-bar" />
              <span class="title-text">药品明细</span>
            </div>
            <div
              v-if="currentDetailItems.length > 0"
              class="items-table-wrapper"
            >
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 60px">序号</th>
                    <th style="min-width: 150px">药品名称</th>
                    <th style="min-width: 120px">规格</th>
                    <th style="min-width: 150px">生产厂家</th>
                    <th style="width: 100px">单价（元）</th>
                    <th style="width: 80px">数量</th>
                    <th style="width: 80px">单位</th>
                    <th style="width: 120px">金额（元）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in currentDetailItems"
                    :key="item.eid || index"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.drugName || "-" }}</td>
                    <td>{{ item.specification || "-" }}</td>
                    <td>{{ item.manufacturer || "-" }}</td>
                    <td>{{ formatAmount(item.unitPrice) }}</td>
                    <td>{{ item.quantity || "0" }}</td>
                    <td>{{ item.unit || "-" }}</td>
                    <td class="amount-cell">{{ formatAmount(item.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-items">暂无药品明细</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.retail-detail-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 4px;

  .panel-header {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
    flex-shrink: 0;

    .back-btn {
      margin-right: 12px;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f5f7fa;

    .detail-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: #909399;
      font-size: 14px;

      .el-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
    }

    .detail-content {
      background-color: #fff;
      border-radius: 6px;
      padding: 24px;

      .detail-section {
        margin-bottom: 28px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e4e7ed;

          .title-bar {
            width: 4px;
            height: 16px;
            background-color: #409eff;
            border-radius: 2px;
            margin-right: 8px;
          }

          .title-text {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
          }
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px 28px;

          .info-item {
            display: flex;
            align-items: flex-start;
            font-size: 14px;
            line-height: 1.7;

            &.full-width {
              grid-column: 1 / -1;
            }

            .info-label {
              flex-shrink: 0;
              color: #606266;
              min-width: 90px;
              font-weight: 500;
            }

            .info-value {
              flex: 1;
              color: #303133;
              word-break: break-all;

              &.amount-highlight {
                color: #f56c6c;
                font-weight: 600;
                font-size: 17px;
              }

              &.status-paid {
                color: #67c23a;
                font-weight: 500;
              }

              &.status-unpaid {
                color: #e6a23c;
                font-weight: 500;
              }
            }
          }
        }

        .items-table-wrapper {
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          overflow-x: auto;

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;

            thead {
              background-color: #f5f7fa;

              th {
                padding: 12px 8px;
                text-align: center;
                font-weight: 600;
                color: #606266;
                border-bottom: 2px solid #e4e7ed;
                white-space: nowrap;
              }
            }

            tbody {
              tr {
                &:hover {
                  background-color: #f5f7fa;
                }

                td {
                  padding: 10px 8px;
                  border-bottom: 1px solid #ebeef5;
                  text-align: center;
                  color: #606266;

                  &:first-child {
                    text-align: center;
                  }

                  &.amount-cell {
                    text-align: right;
                    font-weight: 500;
                    color: #303133;
                  }
                }

                &:last-child td {
                  border-bottom: none;
                }
              }
            }
          }
        }

        .empty-items {
          padding: 50px 0;
          text-align: center;
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
}

// 面板淡入淡出动画
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.25s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
</style>
