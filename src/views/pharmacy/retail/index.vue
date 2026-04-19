<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import PureTable from "@pureadmin/table";
import BqMedicineSelector from "@/components/BqMedicineSelector";
import BqPatientBasicInfo from "@/components/BqPatientBasicInfo";
import RetailDetailDialog from "./comp/RetailDetailDialog.vue";
import { retailSaveApi, getDrugSalesPageApi } from "@/api/pharmacy/sales";
import { addPatientApi } from "@/api/cm/patient";

defineOptions({
  name: "PharmacyRetail"
});

const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const activeTab = ref("pending");

// 药品选择器 ref
const medicineSelectorRef = ref<{ focus: () => void }>();
// 数量输入框 ref 列表（与 retailForm.items 索引对应）
const quantityInputRefs = ref<any[]>([]);
const setQuantityRef = (el: any, index: number) => {
  if (el) quantityInputRefs.value[index] = el;
};

// 动态计算表格底部偏移量
const tableOffsetBottom = ref(110);

const updateOffsetBottom = () => {
  if (activeTab.value !== "diagnosed") {
    tableOffsetBottom.value = 110;
    return;
  }
  nextTick(() => {
    const headerHeight = 55;
    const searchFormEl = queryFormRef.value?.$el;
    const searchHeight = searchFormEl?.offsetHeight || 60;
    const paginationHeight = 50;
    const spacing = 24;
    tableOffsetBottom.value =
      headerHeight + searchHeight + paginationHeight + spacing;
  });
};

const handleTabChange = () => {
  setTimeout(() => updateOffsetBottom(), 200);
  handleQuery();
};

// ==================== 患者信息 ====================
const patientBasicInfoRef = ref();
const isPatientInfoCollapsed = ref(false);

// 选中患者的数据库 ID（Integer），提交时写入 patientId 字段
const selectedPatientId = ref<number | null>(null);

const togglePatientInfo = () => {
  isPatientInfoCollapsed.value = !isPatientInfoCollapsed.value;
};

const handlePatientSelect = (user: any) => {
  selectedPatientId.value = user.id ? Number(user.id) : null;
  ElMessage.success(`已选择患者：${user.name}`);
};

const handlePatientSave = (formData: any) => {
  // 保存患者信息时，更新选中的患者ID
  if (formData.id) {
    selectedPatientId.value = Number(formData.id);
  }
  ElMessage.success("患者信息已保存");
};

// ==================== 新增零售 ====================
const retailForm = reactive({
  patientId: "",
  patientName: "",
  items: [] as Array<{
    drugId: string;
    drugName: string;
    specification: string;
    manufacturer: string;
    unitPrice: number;
    quantity: string;
    unit: string;
    amount: number;
  }>
});

const addDrugInputText = ref("");

const handleAddDrugSelect = (medicine: any) => {
  retailForm.items.push({
    drugId: medicine.id ?? "",
    drugName: medicine.name ?? "",
    specification: medicine.spec ?? medicine.specification ?? "",
    manufacturer: medicine.manufacturer ?? "",
    unitPrice: parseFloat(medicine.price ?? medicine.prescriptionPrice) || 0,
    quantity: "",
    unit: "片",
    amount: 0
  });

  // 清空药品选择器输入框
  nextTick(() => {
    addDrugInputText.value = "";
  });

  // 跳转到新增行的数量输入框
  const newIndex = retailForm.items.length - 1;
  nextTick(() => {
    quantityInputRefs.value[newIndex]?.focus();
  });
};

// 数量框回车：焦点回到药品选择器
const handleQuantityEnter = () => {
  nextTick(() => {
    medicineSelectorRef.value?.focus();
  });
};

const getTotalAmount = () =>
  retailForm.items.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (item.unitPrice || 0);
  }, 0);

const removeDrugItem = (index: number) => {
  if (retailForm.items.length > 1) {
    retailForm.items.splice(index, 1);
  } else {
    ElMessage.warning("至少保留一行");
  }
};

const calculateItemAmount = (item: any) => {
  item.amount =
    (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
};

const saving = ref(false);

// 构建零售保存参数（主记录 + 明细列表）
const buildRetailPayload = (charged: boolean) => {
  const total = getTotalAmount();
  // 获取患者基本信息
  const patientForm = patientBasicInfoRef.value?.form;

  const sales = {
    patientId: selectedPatientId.value || undefined,
    patientName: patientForm?.name || undefined,
    gender: patientForm?.gender || undefined,
    firstAge: patientForm?.firstAge || undefined,
    lastAge: patientForm?.lastAge || undefined,
    ageType: patientForm?.ageType || undefined,
    idCard: patientForm?.idCard || undefined,
    mobile: patientForm?.mobile || undefined,
    province: patientForm?.province || undefined,
    city: patientForm?.city || undefined,
    district: patientForm?.district || undefined,
    address: patientForm?.address || undefined,
    isFirstVisit: patientForm?.isFirstVisit || undefined,
    isAllergy: patientForm?.isAllergy || undefined,
    allergicHistory: patientForm?.allergicHistory || undefined,
    amount: total.toFixed(2),
    actualAmount: charged ? total.toFixed(2) : "0.00",
    status: charged ? 1 : 0,
    statusRemark: charged ? "已收费" : "未收费"
  };

  const items = retailForm.items.map(i => ({
    drugId: i.drugId || undefined,
    drugName: i.drugName,
    specification: i.specification || undefined,
    manufacturer: i.manufacturer || undefined,
    unitPrice: String(i.unitPrice),
    quantity: String(i.quantity),
    unit: i.unit,
    amount: i.amount.toFixed(2)
  }));

  return { sales, items };
};

// 构建患者保存参数（从基本信息组件表单转换）
const buildPatientPayload = () => {
  const patientForm = patientBasicInfoRef.value?.form;
  if (!patientForm) return null;

  // 计算年龄字符串（根据年龄三段式组合）
  let ageStr = "";
  if (patientForm.ageType === 1) {
    // 岁
    ageStr = `${patientForm.firstAge}岁`;
    if (patientForm.lastAge > 0) {
      ageStr += `${patientForm.lastAge}月`;
    }
  } else if (patientForm.ageType === 2) {
    // 月
    ageStr = `${patientForm.firstAge}月`;
    if (patientForm.lastAge > 0) {
      ageStr += `${patientForm.lastAge}天`;
    }
  } else if (patientForm.ageType === 3) {
    // 天
    ageStr = `${patientForm.firstAge}天`;
  }

  return {
    name: patientForm.name || "",
    gender: patientForm.gender || "男",
    age: ageStr,
    mobile: patientForm.mobile || "",
    idCard: patientForm.idCard || "",
    province: patientForm.province || undefined,
    city: patientForm.city || undefined,
    district: patientForm.district || undefined,
    address: patientForm.address || "",
    firstAge: patientForm.firstAge || 0,
    lastAge: patientForm.lastAge || 0,
    ageType: patientForm.ageType || 1,
    isAllergy: patientForm.isAllergy || false,
    allergicHistory: patientForm.allergicHistory || ""
  };
};

// 保存零售记录
const handleSaveRetail = async () => {
  // 校验患者信息
  const patientValid = patientBasicInfoRef.value?.validate();
  if (!patientValid) {
    ElMessage.error("请先完善患者基本信息");
    // 如果面板是折叠状态，自动展开以便用户看到错误
    if (isPatientInfoCollapsed.value) {
      isPatientInfoCollapsed.value = false;
    }
    return;
  }

  // 校验药品信息
  if (retailForm.items.length === 0) {
    ElMessage.warning("请至少添加一种药品");
    return;
  }
  const hasEmpty = retailForm.items.some(i => !i.drugName || !i.quantity);
  if (hasEmpty) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }

  saving.value = true;
  try {
    // 如果患者ID为空，先保存患者信息
    if (!selectedPatientId.value) {
      const patientPayload = buildPatientPayload();
      if (patientPayload) {
        const patientRes = await addPatientApi(patientPayload);
        if (patientRes.code === 0) {
          // 更新选中的患者ID（后端可能返回id或eid）
          const newPatientId = patientRes.data.id;
          selectedPatientId.value = newPatientId;
          // 更新基本信息组件中的患者ID
          if (patientBasicInfoRef.value && newPatientId) {
            patientBasicInfoRef.value.form.id = newPatientId;
          }
          ElMessage.success("患者信息已保存");
        } else {
          ElMessage.error("保存患者信息失败：" + patientRes.errMsg);
          return;
        }
      }
    }

    // 保存零售记录
    await retailSaveApi(buildRetailPayload(false));
    ElMessage.success("保存成功");
    resetRetailForm();
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

// 收费
const handleChargeRetail = async () => {
  // 校验患者信息
  const patientValid = patientBasicInfoRef.value?.validate();
  if (!patientValid) {
    ElMessage.error("请先完善患者基本信息");
    // 如果面板是折叠状态，自动展开以便用户看到错误
    if (isPatientInfoCollapsed.value) {
      isPatientInfoCollapsed.value = false;
    }
    return;
  }

  // 校验药品信息
  if (retailForm.items.length === 0) {
    ElMessage.warning("请至少添加一种药品");
    return;
  }
  const hasEmpty = retailForm.items.some(i => !i.drugName || !i.quantity);
  if (hasEmpty) {
    ElMessage.warning("请填写完整的药品信息");
    return;
  }

  saving.value = true;
  try {
    // 如果患者ID为空，先保存患者信息
    if (!selectedPatientId.value) {
      const patientPayload = buildPatientPayload();
      if (patientPayload) {
        const patientRes = await addPatientApi(patientPayload);
        // 更新选中的患者ID（后端可能返回id或eid）
        const newPatientId =
          (patientRes.data as any)?.id ??
          (patientRes.data as any)?.patientId ??
          null;
        selectedPatientId.value = newPatientId;
        // 更新基本信息组件中的患者ID
        if (patientBasicInfoRef.value && newPatientId) {
          patientBasicInfoRef.value.form.id = newPatientId;
        }
        ElMessage.success("患者信息已保存");
      }
    }

    // 保存零售记录（直接收费）
    await retailSaveApi(buildRetailPayload(true));
    ElMessage.success("收费成功");
    resetRetailForm();
  } catch (error) {
    console.error("收费失败:", error);
    ElMessage.error("收费失败，请重试");
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetRetailForm = () => {
  retailForm.items = [];
  addDrugInputText.value = "";
  selectedPatientId.value = null;
  // 重置患者基本信息组件
  patientBasicInfoRef.value?.reset();
};

// ==================== 零售记录 ====================
const retailRecordQueryForm = reactive({
  status: "",
  keyword: "",
  startTime: "",
  endTime: ""
});

const retailRecordColumns = ref<any[]>([
  { label: "患者姓名", prop: "patientName", minWidth: 100 },
  { label: "金额", prop: "amount", minWidth: 100 },
  { label: "实收金额", prop: "actualAmount", minWidth: 100 },
  { label: "操作人", prop: "createdBy", minWidth: 100 },
  { label: "创建时间", prop: "createdTime", minWidth: 170 },
  { label: "状态", prop: "status", minWidth: 90, slot: "status" },
  { label: "操作", fixed: "right", width: 80, slot: "retailRecordOperation" }
]);

const retailRecordList = ref<any[]>([]);
const retailRecordLoading = ref(false);

const retailRecordPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 方法 ====================
const handleQuery = () => {
  if (activeTab.value === "diagnosed") {
    loadRetailRecords();
  }
};

const loadRetailRecords = async () => {
  retailRecordLoading.value = true;
  try {
    const res = await getDrugSalesPageApi({
      current: retailRecordPagination.currentPage,
      size: retailRecordPagination.pageSize,
      status:
        retailRecordQueryForm.status !== ""
          ? retailRecordQueryForm.status
          : undefined,
      patientName: retailRecordQueryForm.keyword || undefined,
      startTime: retailRecordQueryForm.startTime || undefined,
      endTime: retailRecordQueryForm.endTime || undefined
    });
    retailRecordList.value = res.data?.records ?? [];
    retailRecordPagination.total = Number(res.data?.total ?? 0);
  } catch {
    ElMessage.error("加载零售记录失败");
  } finally {
    retailRecordLoading.value = false;
  }
};

const handleSearch = () => {
  retailRecordPagination.currentPage = 1;
  loadRetailRecords();
};

const handleResetQuery = () => {
  retailRecordQueryForm.status = "";
  retailRecordQueryForm.keyword = "";
  retailRecordQueryForm.startTime = "";
  retailRecordQueryForm.endTime = "";
  retailRecordPagination.currentPage = 1;
  loadRetailRecords();
};

const handleRetailRecordPageChange = (page: number) => {
  retailRecordPagination.currentPage = page;
  loadRetailRecords();
};

const handleRetailRecordSizeChange = (size: number) => {
  retailRecordPagination.pageSize = size;
  loadRetailRecords();
};

// ==================== 详情面板 ====================
const detailPanelVisible = ref(false);
const currentDetailData = ref<any>(null);

const handleViewRetailDetail = (row: any) => {
  currentDetailData.value = row;
  detailPanelVisible.value = true;
};

// ==================== 详情对话框 ====================
const detailDialogVisible = ref(false);

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="visit-container">
    <!-- 标签页 -->
    <el-tabs
      v-model="activeTab"
      class="visit-tabs"
      @tab-click="handleTabChange"
    >
      <!-- 新增零售 -->
      <el-tab-pane label="新增零售" name="pending">
        <div class="tab-content">
          <div class="retail-form-container">
            <!-- 患者基本信息组件（可折叠） -->
            <div class="patient-info-wrapper">
              <transition name="collapse-transition">
                <div
                  v-show="!isPatientInfoCollapsed"
                  class="patient-info-content"
                >
                  <BqPatientBasicInfo
                    ref="patientBasicInfoRef"
                    :show-allergy="false"
                    @user-select="handlePatientSelect"
                    @save="handlePatientSave"
                  />
                </div>
              </transition>
            </div>

            <!-- 药品表格 -->
            <div class="retail-table-wrapper">
              <table class="retail-table">
                <thead>
                  <tr>
                    <th style="width: 200px">药品名称</th>
                    <th style="width: 180px">药品规格</th>
                    <th style="width: 180px">生产厂家</th>
                    <th style="width: 120px">单价（元）</th>
                    <th style="width: 100px">数量</th>
                    <th style="width: 120px">单位</th>
                    <th style="width: 120px">金额（元）</th>
                    <th style="width: 80px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in retailForm.items" :key="index">
                    <td>
                      <span class="drug-name-text">{{
                        item.drugName || "请选择药品"
                      }}</span>
                    </td>
                    <td>
                      <span class="text-cell">{{ item.specification }}</span>
                    </td>
                    <td>
                      <span class="text-cell">{{ item.manufacturer }}</span>
                    </td>
                    <td>
                      <el-input-number
                        v-model="item.unitPrice"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        class="price-input"
                      />
                    </td>
                    <td>
                      <el-input
                        :ref="(el: any) => setQuantityRef(el, index)"
                        v-model="item.quantity"
                        type="number"
                        placeholder=""
                        class="quantity-input"
                        @input="calculateItemAmount(item)"
                        @keydown.enter.prevent="handleQuantityEnter"
                      />
                    </td>
                    <td>
                      <el-select v-model="item.unit" class="unit-select">
                        <el-option label="片" value="片" />
                        <el-option label="盒" value="盒" />
                        <el-option label="瓶" value="瓶" />
                        <el-option label="支" value="支" />
                        <el-option label="袋" value="袋" />
                      </el-select>
                    </td>
                    <td>
                      <span class="amount-cell">{{
                        item.amount.toFixed(2)
                      }}</span>
                    </td>
                    <td>
                      <el-button
                        type="danger"
                        link
                        @click="removeDrugItem(index)"
                      >
                        <IconifyIconOffline :icon="Delete" />
                      </el-button>
                    </td>
                  </tr>
                  <!-- 添加药品行 -->
                  <tr>
                    <td colspan="8">
                      <BqMedicineSelector
                        ref="medicineSelectorRef"
                        v-model="addDrugInputText"
                        class="add-drug-selector"
                        @select="handleAddDrugSelect"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 底部操作区 -->
            <div class="retail-footer">
              <div class="total-amount">
                总金额：<span class="amount-value">{{
                  getTotalAmount().toFixed(2)
                }}</span
                >元
              </div>
              <div class="action-buttons">
                <el-button
                  type="primary"
                  class="btn-save"
                  :loading="saving"
                  @click="handleSaveRetail"
                >
                  保存
                </el-button>
                <el-button
                  type="warning"
                  class="btn-charge"
                  :loading="saving"
                  @click="handleChargeRetail"
                >
                  收费
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 零售记录 -->
      <el-tab-pane label="零售记录" name="diagnosed" lazy>
        <div class="tab-content">
          <!-- 详情面板（覆盖显示） -->
          <RetailDetailDialog
            v-if="detailPanelVisible"
            v-model:visible="detailPanelVisible"
            :detail-data="currentDetailData"
          />

          <!-- 列表视图 -->
          <div v-show="!detailPanelVisible" class="main">
            <!-- 查询表单 -->
            <el-form
              ref="queryFormRef"
              :model="retailRecordQueryForm"
              :inline="true"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item>
                <el-select
                  v-model="retailRecordQueryForm.status"
                  placeholder="全部"
                  class="!w-[120px]"
                >
                  <el-option label="全部" value="" />
                  <el-option label="已收费" :value="1" />
                  <el-option label="未收费" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="retailRecordQueryForm.keyword"
                  placeholder="输入单号/姓名查询"
                  clearable
                  class="!w-[220px]"
                />
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker
                  v-model="retailRecordQueryForm.startTime"
                  type="date"
                  placeholder="起始时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[160px]"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="retailRecordQueryForm.endTime"
                  type="date"
                  placeholder="结束时间"
                  value-format="YYYY-MM-DD"
                  class="!w-[160px]"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  @click="handleSearch"
                >
                  查询
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 表格 -->
            <div
              ref="contentRef"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="零售记录"
                :columns="retailRecordColumns"
                @refresh="handleQuery"
              >
                <template v-slot="{ size, dynamicColumns }">
                  <pure-table
                    ref="tableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    adaptive
                    border
                    stripe
                    :loading="retailRecordLoading"
                    :data="retailRecordList"
                    row-key="eid"
                    :columns="dynamicColumns"
                    :pagination="retailRecordPagination"
                    :paginationSmall="size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleRetailRecordSizeChange"
                    @page-current-change="handleRetailRecordPageChange"
                  >
                    <!-- 状态列 -->
                    <template #status="{ row }">
                      <span>{{ row.status === 1 ? "已收费" : "未收费" }}</span>
                    </template>

                    <!-- 操作列 -->
                    <template #retailRecordOperation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        @click="handleViewRetailDetail(row)"
                      >
                        查看
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.visit-container {
  height: 100%;
  padding: 0;

  .visit-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      flex-shrink: 0;
      margin-bottom: 0;
      background-color: #fff;
      padding-left: 20px;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
    }
  }

  .tab-content {
    height: calc(100vh - 169px);
    padding: 0;
    background-color: white;
    overflow: hidden;

    // 患者信息折叠面板
    .patient-info-wrapper {
      margin-bottom: 12px;
      border-radius: 4px;
      background-color: #fff;

      .patient-info-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }

        .header-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .collapse-icon {
          font-size: 16px;
          color: #909399;
          transition: transform 0.3s;
        }
      }
    }

    // 折叠动画
    .collapse-transition-enter-active,
    .collapse-transition-leave-active {
      transition: all 0.3s ease-in-out;
      max-height: 500px;
      overflow: hidden;
    }

    .collapse-transition-enter-from,
    .collapse-transition-leave-to {
      max-height: 0;
      opacity: 0;
    }

    // 新增零售表单容器
    .retail-form-container {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .retail-table-wrapper {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-radius: 4px;

        .retail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;

          thead {
            background-color: #f5f7fa;
            position: sticky;
            top: 0;
            z-index: 1;

            th {
              padding: 12px 8px;
              text-align: center;
              font-weight: 600;
              color: #606266;
              border-bottom: 1px solid #e4e7ed;
            }
          }

          tbody {
            tr {
              &:hover {
                background-color: #f5f7fa;
              }

              td {
                padding: 8px;
                border-bottom: 1px solid #ebeef5;
                vertical-align: middle;

                .text-cell {
                  color: #606266;
                  font-size: 14px;
                }

                .price-input {
                  width: 100%;
                }

                .quantity-input {
                  width: 100%;
                  input {
                    text-align: center;
                  }
                }

                .unit-select {
                  width: 100%;
                }

                .amount-cell {
                  text-align: right;
                  color: #606266;
                  font-size: 14px;
                }

                .add-drug-select {
                  width: 250px;
                }

                // BqMedicineSelector 样式
                .add-drug-selector {
                  width: 100%;
                  max-width: 400px;
                }

                // 药品选择输入框
                .drug-select-input {
                  width: 200px;
                }

                // 删除按钮样式
                .el-button {
                  font-size: 18px;
                  padding: 4px 8px;
                }
              }
            }
          }
        }
      }

      .retail-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e4e7ed;

        .total-amount {
          font-size: 16px;
          color: #606266;

          .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #f56c6c;
            margin: 0 4px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 12px;

          .btn-save {
            min-width: 100px;
            height: 40px;
            font-size: 16px;
          }

          .btn-charge {
            min-width: 100px;
            height: 40px;
            font-size: 16px;
            background-color: #e6a23c;
            border-color: #e6a23c;
            color: #fff;

            &:hover {
              background-color: #ebb563;
              border-color: #ebb563;
            }
          }
        }
      }
    }
  }
}
</style>
