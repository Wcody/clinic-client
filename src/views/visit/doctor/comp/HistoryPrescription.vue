<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Document } from "@element-plus/icons-vue";
import {
  getPrescriptionListWithDiagnosisByPatientIdApi,
  getPrescriptionItemListByPrescIdApi,
  type BqPrescriptionEntityType,
  type BqPrescriptionItemEntityType
} from "@/api/visit/clinic";

const props = defineProps<{
  patientId?: number;
}>();

const visible = ref(false);
const loading = ref(false);
const list = ref<BqPrescriptionEntityType[]>([]);
const selectedIndex = ref(0);
const itemsLoading = ref(false);
const items = ref<BqPrescriptionItemEntityType[]>([]);
const importDiagnosis = ref(false);

const getDatePart = (datetime?: string) => (datetime ?? "").slice(0, 10);

const showDateAtIndex = computed(() =>
  list.value.map((item, idx) =>
    idx === 0 || getDatePart(item.createdTime) !== getDatePart(list.value[idx - 1].createdTime)
  )
);

const prescTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    1: "西/成药处方",
    2: "中药处方",
    3: "检查检验",
    4: "处置项目",
    5: "附加费"
  };
  return type != null ? (map[type] ?? "处方") : "处方";
};

const prescStatusLabel = (status?: number) => {
  const map: Record<number, string> = {
    1: "已开",
    2: "已缴费",
    3: "已发药",
    4: "作废"
  };
  return status != null ? (map[status] ?? "") : "";
};

const loadItems = async (prescId: number) => {
  itemsLoading.value = true;
  items.value = [];
  try {
    const res = await getPrescriptionItemListByPrescIdApi(prescId);
    items.value = (res?.data as any)?.records ?? res?.data ?? [];
  } finally {
    itemsLoading.value = false;
  }
};

watch(selectedIndex, idx => {
  const presc = list.value[idx];
  if (presc?.id) loadItems(presc.id);
});

const load = async () => {
  if (!props.patientId) return;
  loading.value = true;
  list.value = [];
  items.value = [];
  selectedIndex.value = 0;
  try {
    const res = await getPrescriptionListWithDiagnosisByPatientIdApi(props.patientId);
    const raw = (res?.data as any)?.records ?? res?.data ?? [];
    list.value = [...raw].sort((a, b) => {
      const ta = a.createdTime ?? "";
      const tb = b.createdTime ?? "";
      return tb < ta ? -1 : tb > ta ? 1 : 0;
    });
    if (list.value.length > 0 && list.value[0].id) {
      loadItems(list.value[0].id);
    }
  } finally {
    loading.value = false;
  }
};

const open = async () => {
  visible.value = true;
  load();
};

const emit = defineEmits<{
  confirm: [prescription: BqPrescriptionEntityType, items: BqPrescriptionItemEntityType[], importDiagnosis: boolean];
}>();

const handleImport = () => {
  if (list.value.length > 0 && list.value[selectedIndex.value]) {
    emit("confirm", list.value[selectedIndex.value], items.value, importDiagnosis.value);
    visible.value = false;
  }
};

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="历史处方"
    align-center
    class="history-prescription-dialog"
  >
    <div v-if="loading" class="dialog-body" style="justify-content: center; align-items: center">加载中...</div>
    <div v-else class="dialog-body">
      <div class="presc-list">
        <div
          v-if="list.length === 0"
          class="empty-text"
          style="padding: 20px"
        >
          暂无历史处方
        </div>
        <div
          v-for="(presc, idx) in list"
          :key="presc.id"
          class="list-item"
          :class="{ active: selectedIndex === idx }"
          @click="selectedIndex = idx"
        >
          <el-icon class="item-icon"><Document /></el-icon>
          <span class="item-text">
            <span v-if="showDateAtIndex[idx]" class="item-date">{{ getDatePart(presc.createdTime) }}</span>
            <span class="item-type">{{ prescTypeLabel(presc.prescType) }}</span>
          </span>
        </div>
      </div>
      <div v-if="list.length > 0" class="presc-detail">
        <template v-if="list[selectedIndex]">
          <div class="detail-row">
            <span class="detail-label">处方单号</span>
            <span class="detail-value">{{ list[selectedIndex].prescNo || "—" }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">处方类型</span>
            <span class="detail-value">{{ prescTypeLabel(list[selectedIndex].prescType) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">开方时间</span>
            <span class="detail-value">{{ list[selectedIndex].createdTime || "—" }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">处方状态</span>
            <span class="detail-value">{{ prescStatusLabel(list[selectedIndex].status) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">处方总价</span>
            <span class="detail-value price-red">
              ¥{{ (list[selectedIndex].totalPrice ?? 0).toFixed(2) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">诊断</span>
            <span class="detail-value diagnosis-red">
              {{ list[selectedIndex]?.diagnosis || '—' }}
            </span>
          </div>
          <div style="margin-top: 12px">
            <div
              v-if="itemsLoading"
              style="text-align: center; padding: 20px; color: #999"
            >
              加载明细中...
            </div>
            <div
              v-else-if="items.length === 0"
              style="padding: 12px; color: #999"
            >
              暂无处方明细
            </div>
            <table v-else class="items-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>单次用量</th>
                  <th>用法</th>
                  <th>频次</th>
                  <th>天数</th>
                  <th>总量</th>
                  <th>单价</th>
                  <th>金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td>{{ item.itemName }}</td>
                  <td>{{ item.spec || "—" }}</td>
                  <td>{{ item.unit || "—" }}</td>
                  <td>{{ item.singleDosage || "—" }}</td>
                  <td>{{ item.useWay || "—" }}</td>
                  <td>{{ item.frequency || "—" }}</td>
                  <td>{{ item.days != null ? item.days + "天" : "—" }}</td>
                  <td>{{ item.totalNum != null ? item.totalNum : "—" }}</td>
                  <td>{{ item.price != null ? "¥" + item.price.toFixed(2) : "—" }}</td>
                  <td>{{ item.totalPrice != null ? "¥" + item.totalPrice.toFixed(2) : "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <div style="display: flex; width: 100%; justify-content: space-between; align-items: center">
        <div style="display: flex; align-items: center; gap: 8px">
          <el-switch v-model="importDiagnosis" inline-prompt />
          <span :style="{ fontSize: '16px', fontWeight: 'bold', marginLeft: '8px', color: importDiagnosis ? '#409eff' : '#c0c4cc' }">
            {{ importDiagnosis ? '同时导入诊断信息' : '不导入诊断信息' }}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" :disabled="list.length === 0" @click="handleImport">
            导入当前处方
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.history-prescription-dialog {
  :deep(.el-dialog) {
    --el-dialog-width: 80vw;
    width: var(--el-dialog-width);
    height: 70vh;
    max-width: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    height: 70vh;
    min-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__footer) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.dialog-body {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 70vh;
  overflow: hidden;
}

.presc-list {
  width: 220px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  background: #fafafa;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #ecf5ff;
  }

  &.active {
    background: #ecf5ff;
    color: #409eff;
  }

  .item-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: #909399;
  }

  .item-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;

    .item-date {
      color: #606266;
    }

    .item-type {
      color: #909399;
      margin-top: 2px;
    }
  }
}

.presc-detail {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;

  .detail-label {
    width: 80px;
    flex-shrink: 0;
    color: #909399;
  }

  .detail-value {
    flex: 1;
    color: #303133;
    word-break: break-all;

    &.price-red {
      color: #f56c6c;
      font-weight: 500;
    }

    &.diagnosis-red {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    border: 1px solid #ebeef5;
    padding: 6px 8px;
    text-align: left;
  }

  th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
  }

  td {
    color: #303133;
  }
}

.empty-text {
  color: #909399;
  font-size: 13px;
}
</style>
