<template>
  <div ref="selectorRef" class="med-selector">
    <!-- 触发输入框 -->
    <div
      class="ms-trigger"
      :class="{ 'ms-trigger--active': visible }"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        v-model="keyword"
        :placeholder="placeholder"
        class="ms-input"
        autocomplete="off"
        @focus="handleInputFocus"
        @input="handleSearch"
        @keydown.esc="closeDropdown"
        @keydown.tab="closeDropdown"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.down.prevent="moveActive(1)"
        @keydown.enter.prevent="confirmActive"
      />
      <el-icon class="ms-arrow" :class="{ 'ms-arrow--up': visible }">
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <div
        v-show="visible"
        ref="dropdownRef"
        class="ms-dropdown"
        :style="dropdownStyle"
        @mousedown.stop
      >
        <!-- 过滤复选框 -->
        <div class="ms-filters">
          <el-checkbox v-model="filters.ownOnly" @change="handleFilterChange">
            仅显示自有药品
          </el-checkbox>
          <el-checkbox v-model="filters.western" @change="handleFilterChange">
            西/成药
          </el-checkbox>
          <el-checkbox v-model="filters.chinese" @change="handleFilterChange">
            中药
          </el-checkbox>
          <el-checkbox v-model="filters.exam" style="display:none" @change="handleFilterChange">
            检查检验项目
          </el-checkbox>
          <el-checkbox v-model="filters.treatment" style="display:none" @change="handleFilterChange">
            处置项目
          </el-checkbox>
          <el-checkbox v-model="filters.extra" style="display:none" @change="handleFilterChange">
            附加费
          </el-checkbox>
        </div>

        <!-- 结果表格 -->
        <div v-loading="loading" element-loading-text="加载中...">
          <el-table
            ref="tableRef"
            :data="pagedData"
            :height="260"
            highlight-current-row
            size="small"
            class="ms-table"
            :current-row-key="activeRowKey"
            row-key="id"
            @row-click="handleSelect"
          >
            <el-table-column prop="name" label="名字" min-width="180" />
            <el-table-column prop="spec" label="规格" width="130" />
            <el-table-column
              prop="manufacturer"
              label="生产厂家"
              min-width="190"
            />
            <el-table-column prop="stock" label="库存" width="110" />
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="source" label="来源" width="90" />
          </el-table>
        </div>

        <!-- 分页区域 -->
        <div class="ms-pagination">
          <div class="ms-pg-left">
            <span class="pg-label">每页显示</span>
            <el-input-number
              v-model="pageSize"
              :min="5"
              :max="100"
              :step="5"
              size="small"
              controls-position="right"
              style="width: 78px"
              @change="handlePageSizeChange"
            />
            <span class="pg-label">共 {{ totalPages }} 页，跳转至</span>
            <input
              v-model.number="jumpInput"
              type="number"
              class="ms-jump-input"
              :min="1"
              :max="totalPages"
              @keydown.enter="doJump"
            />
            <el-button size="small" type="primary" @click="doJump"
              >确定</el-button
            >
            <el-button size="small" :disabled="currentPage <= 1" @click="goPrev"
              >上一页</el-button
            >
            <div class="page-btns">
              <button
                v-for="p in visiblePages"
                :key="p"
                class="page-btn"
                :class="{ 'page-btn--active': p === currentPage }"
                @click="goPage(p)"
              >
                {{ p }}
              </button>
            </div>
            <el-button
              size="small"
              :disabled="currentPage >= totalPages"
              @click="goNext"
              >下一页</el-button
            >
          </div>
          <div class="ms-pg-right">
            显示{{ startItem }}到{{ endItem }}，共{{
              filteredData.length
            }}条记录
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick
} from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { getDrugListApi } from "@/api/pharmacy/drug";
import { getExamineItemListApi } from "@/api/pharmacy/examine";
import { getTreatmentItemListApi } from "@/api/pharmacy/treatment";
import { http } from "@/utils/http";
import { BQSearchFilter, BQSearchOrder, type BQResultType, type BQSearchListResultType } from "@/api/api";

// ---- 药品统一类型 ----
export interface MedicineItem {
  id: string;
  name: string;
  spec: string;
  manufacturer: string;
  stock: string;
  price: string;
  source: string;
  category: "western" | "chinese" | "exam" | "treatment" | "extra";
  prescriptionPrice?: string;
  specification?: string;
}

// ---- Props & Emits ----
interface Props {
  modelValue?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请输入药品名称搜索"
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [medicine: MedicineItem];
}>();

// ---- Refs ----
const selectorRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const tableRef = ref<InstanceType<any>>();

// ---- State ----
const visible = ref(false);
const keyword = ref(props.modelValue);
const currentPage = ref(1);
const pageSize = ref(20);
const jumpInput = ref<number>(1);
const dropdownStyle = ref<Record<string, string>>({});
const activeIndex = ref(-1);
const shouldIgnoreClickOutside = ref(false);

// ---- 数据层 ----
const loading = ref(false);
const dataLoaded = ref(false);

const allDrugs = ref<MedicineItem[]>([]);
const allExamItems = ref<MedicineItem[]>([]);
const allTreatItems = ref<MedicineItem[]>([]);
const allExtraItems = ref<MedicineItem[]>([]);

const loadAllData = async () => {
  if (dataLoaded.value) return;
  loading.value = true;
  try {
    await Promise.all([loadDrugs(), loadExamItems(), loadTreatItems(), loadExtraItems()]);
    dataLoaded.value = true;
  } finally {
    loading.value = false;
  }
};

const loadDrugs = async () => {
  try {
    const res = await getDrugListApi({
      filters: [new BQSearchFilter("status", "eq", "启用")],
      orders: [new BQSearchOrder("name")]
    });
    allDrugs.value = (res.data ?? []).map(d => ({
      id: d.eid ?? "",
      name: d.name ?? "",
      spec: d.specification ?? "",
      manufacturer: d.manufacturer ?? "",
      stock: d.stock ?? "",
      price: d.prescriptionPrice ?? "",
      source: "我的药库",
      category: (d.typeString === "中药" ? "chinese" : "western") as MedicineItem["category"],
      prescriptionPrice: d.prescriptionPrice,
      specification: d.specification
    }));
  } catch {
    allDrugs.value = [];
  }
};

const loadExamItems = async () => {
  try {
    const res = await getExamineItemListApi({
      filters: [new BQSearchFilter("status", "eq", "启用")],
      orders: [new BQSearchOrder("seq")]
    });
    allExamItems.value = (res.data ?? []).map(e => ({
      id: e.eid ?? "",
      name: e.name ?? "",
      spec: "1次",
      manufacturer: "",
      stock: "",
      price: e.sellingPrice ?? "",
      source: "检验项目",
      category: "exam" as MedicineItem["category"],
      prescriptionPrice: e.sellingPrice
    }));
  } catch {
    allExamItems.value = [];
  }
};

const loadTreatItems = async () => {
  try {
    const res = await getTreatmentItemListApi({
      filters: [new BQSearchFilter("status", "eq", "启用")],
      orders: [new BQSearchOrder("seq")]
    });
    allTreatItems.value = (res.data ?? []).map(t => ({
      id: t.eid ?? "",
      name: t.name ?? "",
      spec: "1次",
      manufacturer: "",
      stock: "",
      price: t.sellingPrice ?? "",
      source: "处置项目",
      category: "treatment" as MedicineItem["category"],
      prescriptionPrice: t.sellingPrice
    }));
  } catch {
    allTreatItems.value = [];
  }
};

const loadExtraItems = async () => {
  try {
    const res = await http.request<BQResultType<BQSearchListResultType<any>>>(
      "get",
      "/additional/fee/list",
      {
        params: {
          filters: [new BQSearchFilter("status", "eq", "启用")],
          orders: [new BQSearchOrder("name")]
        }
      }
    );
    allExtraItems.value = (res.data ?? []).map((a: any) => ({
      id: a.eid ?? "",
      name: a.name ?? "",
      spec: "1次",
      manufacturer: "",
      stock: "",
      price: a.sellingPrice ?? a.price ?? "",
      source: "附加费",
      category: "extra" as MedicineItem["category"],
      prescriptionPrice: a.sellingPrice ?? a.price
    }));
  } catch {
    allExtraItems.value = [];
  }
};

// 过滤条件
const filters = reactive({
  ownOnly: true,
  western: false,
  chinese: false,
  exam: false,
  treatment: false,
  extra: false
});

// 同步外部 modelValue
watch(
  () => props.modelValue,
  val => {
    keyword.value = val;
  }
);

// ---- Computed ----
const filteredData = computed<MedicineItem[]>(() => {
  const hasTypeFilter =
    filters.western ||
    filters.chinese ||
    filters.exam ||
    filters.treatment ||
    filters.extra;

  let list: MedicineItem[] = [];

  if (!hasTypeFilter) {
    // 默认只显示药品
    list = [...allDrugs.value];
  } else {
    if (filters.western || filters.chinese) {
      list.push(
        ...allDrugs.value.filter(d => {
          if (filters.western && d.category === "western") return true;
          if (filters.chinese && d.category === "chinese") return true;
          return false;
        })
      );
    }
    if (filters.exam) list.push(...allExamItems.value);
    if (filters.treatment) list.push(...allTreatItems.value);
    if (filters.extra) list.push(...allExtraItems.value);
  }

  // 关键字过滤（客户端）
  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(
      m =>
        m.name.toLowerCase().includes(kw) ||
        m.spec.toLowerCase().includes(kw) ||
        m.manufacturer.toLowerCase().includes(kw)
    );
  }

  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
);

const pagedData = computed<MedicineItem[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const startItem = computed(() =>
  filteredData.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize.value + 1
);
const endItem = computed(() =>
  Math.min(currentPage.value * pageSize.value, filteredData.value.length)
);

const activeRowKey = computed<string | undefined>(() => {
  if (activeIndex.value < 0 || activeIndex.value >= pagedData.value.length)
    return undefined;
  return pagedData.value[activeIndex.value].id;
});

const visiblePages = computed<number[]>(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  let start = Math.max(1, cur - 2);
  const end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// ---- Positioning ----
function updateDropdownPosition() {
  if (!selectorRef.value) return;
  const rect = selectorRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${Math.max(rect.width, 760)}px`,
    zIndex: "9999"
  };
}

// ---- Keyboard Navigation ----
function moveActive(dir: 1 | -1) {
  if (!visible.value) {
    openDropdown();
    return;
  }
  const len = pagedData.value.length;
  if (len === 0) return;
  let next = activeIndex.value + dir;
  if (next < 0) next = 0;
  if (next >= len) next = len - 1;
  activeIndex.value = next;
  nextTick(() => {
    tableRef.value?.setCurrentRow(pagedData.value[next]);
    const tableEl = tableRef.value?.$el as HTMLElement | undefined;
    if (!tableEl) return;
    const rows = tableEl.querySelectorAll<HTMLElement>(
      ".el-table__body tbody tr"
    );
    rows[next]?.scrollIntoView({ block: "nearest" });
  });
}

function confirmActive() {
  if (!visible.value) return;
  if (activeIndex.value >= 0 && activeIndex.value < pagedData.value.length) {
    handleSelect(pagedData.value[activeIndex.value]);
  }
}

// ---- Dropdown Controls ----
function handleInputFocus() {
  if (!visible.value) {
    openDropdown();
  }
}

function openDropdown() {
  visible.value = true;
  activeIndex.value = -1;
  shouldIgnoreClickOutside.value = true;
  loadAllData();
  nextTick(() => {
    updateDropdownPosition();
    setTimeout(() => {
      shouldIgnoreClickOutside.value = false;
    }, 50);
  });
}

function closeDropdown() {
  visible.value = false;
  activeIndex.value = -1;
}

function handleTriggerClick(e: MouseEvent) {
  if (e.target === inputRef.value) return;
  if (visible.value) {
    closeDropdown();
  } else {
    openDropdown();
    nextTick(() => inputRef.value?.focus());
  }
}

function handleSearch() {
  currentPage.value = 1;
  jumpInput.value = 1;
  activeIndex.value = -1;
  if (!visible.value) openDropdown();
}

function handleFilterChange() {
  currentPage.value = 1;
  jumpInput.value = 1;
  activeIndex.value = -1;
}

// ---- Selection ----
function handleSelect(row: MedicineItem) {
  keyword.value = row.name;
  emit("update:modelValue", row.name);
  emit("select", row);
  closeDropdown();
}

// ---- Pagination ----
function handlePageSizeChange() {
  currentPage.value = 1;
  jumpInput.value = 1;
  activeIndex.value = -1;
}

function goPage(p: number) {
  currentPage.value = p;
  jumpInput.value = p;
  activeIndex.value = -1;
}

function goPrev() {
  if (currentPage.value > 1) {
    currentPage.value--;
    jumpInput.value = currentPage.value;
    activeIndex.value = -1;
  }
}

function goNext() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    jumpInput.value = currentPage.value;
    activeIndex.value = -1;
  }
}

function doJump() {
  const p = Number(jumpInput.value);
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
    activeIndex.value = -1;
  }
}

// ---- Click Outside ----
function handleClickOutside(e: MouseEvent) {
  if (!visible.value || shouldIgnoreClickOutside.value) return;
  const target = e.target as Node;
  const isInSelector = selectorRef.value?.contains(target);
  const isInDropdown = dropdownRef.value?.contains(target);
  if (isInSelector || isInDropdown) return;
  closeDropdown();
}

function handleScrollOrResize() {
  if (visible.value) updateDropdownPosition();
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScrollOrResize, true);
  window.addEventListener("resize", handleScrollOrResize);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("scroll", handleScrollOrResize, true);
  window.removeEventListener("resize", handleScrollOrResize);
});

defineExpose({
  /** 将焦点移到内部输入框并展开下拉 */
  focus() {
    inputRef.value?.focus();
  }
});
</script>

<style scoped>
/* 容器 */
.med-selector {
  display: inline-block;
  position: relative;
  min-width: 200px;
  width: 100%;
}

/* 触发输入框 */
.ms-trigger {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 10px 0 12px;
  height: 32px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  gap: 6px;
  width: 100%;
}

.ms-trigger:hover {
  border-color: #c0c4cc;
}

.ms-trigger--active {
  border-color: #409eff;
}

.ms-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #303133;
  background: transparent;
  min-width: 0;
  cursor: text;
  line-height: 1;
}

.ms-input::placeholder {
  color: #c0c4cc;
}

.ms-arrow {
  color: #c0c4cc;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  font-size: 12px;
}

.ms-arrow--up {
  transform: rotate(180deg);
}

/* 下拉面板 */
.ms-dropdown {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 过滤复选框区域 */
.ms-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 16px;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.ms-filters :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #606266;
}

/* 表格悬停行 */
.ms-table :deep(.el-table__row) {
  cursor: pointer;
}

.ms-table :deep(.el-table__row:hover > td) {
  background-color: #ecf5ff !important;
}

.ms-table :deep(.el-table__row.current-row > td) {
  background-color: #d9ecff !important;
}

.ms-table :deep(.el-table__header) {
  background: linear-gradient(to bottom, #f0f5ff, #e6eeff);
}

.ms-table :deep(.el-table__header th) {
  background: transparent !important;
  border-bottom: 2px solid #409eff;
  font-weight: 600;
  color: #000 !important;
  padding: 10px 0 !important;
}

.ms-table :deep(.el-table__header .cell) {
  font-weight: 600;
  color: #1f2d3d;
}

/* 分页 */
.ms-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  background: #f5f7fa;
  flex-wrap: wrap;
  gap: 6px;
}

.ms-pg-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.ms-pg-right {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  margin-left: auto;
}

/* 跳转输入框 */
.ms-jump-input {
  width: 46px;
  height: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;
  padding: 0 4px;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
  -moz-appearance: textfield;
}

.ms-jump-input::-webkit-outer-spin-button,
.ms-jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.ms-jump-input:focus {
  border-color: #409eff;
}

/* 页码按钮组 */
.page-btns {
  display: flex;
  gap: 2px;
}

.page-btn {
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.page-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.page-btn--active {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.page-btn--active:hover {
  color: #fff;
  background-color: #337ecc;
  border-color: #337ecc;
}
</style>
