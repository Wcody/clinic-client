<template>
  <div ref="selectorRef" class="med-selector">
    <!-- 触发输入框 -->
    <div
      class="ms-trigger"
      :class="{ 'ms-trigger--active': visible, 'ms-trigger--disabled': props.disabled }"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        v-model="keyword"
        :placeholder="placeholder"
        class="ms-input"
        :disabled="props.disabled"
        clearable
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
        <!-- 过滤复选框 + 关闭按钮 -->
        <div class="ms-filters" @mousedown.stop="startDrag">
          <el-checkbox v-model="filters.ownOnly" @change="handleFilterChange">
            仅显示自有药品
          </el-checkbox>
          <el-checkbox v-model="filters.western" @change="handleFilterChange">
            西/成药
          </el-checkbox>
          <el-checkbox v-model="filters.chinese" @change="handleFilterChange">
            中药
          </el-checkbox>
          <el-checkbox
            v-model="filters.exam"
            style="display: none"
            @change="handleFilterChange"
          >
            检查检验项目
          </el-checkbox>
          <el-checkbox
            v-model="filters.treatment"
            style="display: none"
            @change="handleFilterChange"
          >
            处置项目
          </el-checkbox>
          <el-checkbox
            v-model="filters.extra"
            style="display: none"
            @change="handleFilterChange"
          >
            附加费
          </el-checkbox>
          <div class="ms-filters-right">
            <el-icon class="ms-dropdown-close" @click.stop="closeDropdown">
              <Close />
            </el-icon>
          </div>
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
            <el-table-column label="价格" width="100">
              <template #default="{ row }">
                {{ row.price }}{{ row.prescriptionUnit ? '/' + row.prescriptionUnit : '' }}
              </template>
            </el-table-column>
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
import { ArrowDown, Close } from "@element-plus/icons-vue";
import { getDrugListApi } from "@/api/pharmacy/drug";
import { getExamineItemListApi } from "@/api/pharmacy/examine";
import { getTreatmentItemListApi } from "@/api/pharmacy/treatment";
import { http } from "@/utils/http";
import {
  BQSearchFilter,
  BQSearchOrder,
  type BQResultType,
  type BQSearchListResultType
} from "@/api/api";
import { key } from "localforage";

// ---- 药品统一类型 ----
export interface MedicineItem {
  id: string;
  name: string;
  pinyin?: string;
  spec: string;
  manufacturer: string;
  stock: string;
  price: string;
  source: string;
  type?: number;
  defaultSaleType?: number;
  specification?: string;
  singleDosage?: string;
  unitId?: number;
  useWay?: string;
  frequency?: string;
  prescriptionPrice?: string; //散卖价格
  prescriptionUnit?: string; //散卖单位
  wholesalePrice?: string; //整卖价格
  wholesaleUnit?: string; //整卖单位
  conversionValue?: string; //整散比
  decoWay?: string; //煎药方式
}

// ---- Props & Emits ----
interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 默认过滤类型：western 西/成药，chinese 中药，不传则显示全部 */
  filterType?: "western" | "chinese";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请输入药品名称搜索",
  disabled: false,
  filterType: undefined
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

// ---- 拖拽状态 ----
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
// 保存用户拖动后的位置
const customPosition = ref<{ top: number; left: number } | null>(null);

// ---- 数据层 ----
const loading = ref(false);
const dataLoaded = ref(false);

const allDrugs = ref<MedicineItem[]>([]);
const allExamItems = ref<MedicineItem[]>([]);
const allTreatItems = ref<MedicineItem[]>([]);
const allExtraItems = ref<MedicineItem[]>([]);

const loadAllData = async () => {
  loading.value = true;
  try {
    await loadDrugs();
    // await loadExamItems();
    // await loadTreatItems();
    // await loadExtraItems();
  } finally {
    loading.value = false;
  }
};

const loadDrugs = async () => {
  try {
    const res = await getDrugListApi({
      filters: [new BQSearchFilter("status", "eq", "1")],
      orders: [new BQSearchOrder("updatedTime")]
    });
    allDrugs.value = (res.data ?? []).map(d => ({
      id: d.id != null ? String(d.id) : "",
      name: d.name ?? "",
      pinyin: d.pinyin ?? "",
      spec: d.specification ?? "",
      manufacturer: d.manufacturer ?? "",
      stock: d.stock ?? "",
      price: d.prescriptionPrice ?? "",
      source: "我的药库",
      type: d.type,
      prescriptionPrice: d.prescriptionPrice,
      prescriptionUnit: d.prescriptionUnit,
      wholesalePrice: d.wholesalePrice,
      wholesaleUnit: d.wholesaleUnit,
      defaultSaleType: d.defaultSaleType,
      specification: d.specification,
      singleDosage: d.singleDosage,
      unitId: d.unitId,
      useWay: d.useWay,
      frequency: d.frequency,
      conversionValue: d.conversionValue,
      decoWay: d.decoWay
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
      type: 101,
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
      type: 102,
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
      type: 103,
      prescriptionPrice: a.sellingPrice ?? a.price
    }));
  } catch {
    allExtraItems.value = [];
  }
};

// 过滤条件
const filters = reactive({
  ownOnly: true, // 自有药库
  western: false, // 西药, 中成药
  chinese: false, // 中药
  exam: false, // 检验
  treatment: false, // 处置
  extra: false // 附加费
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
          if (filters.western && [0, 1, 3].includes(d.type)) return true;
          if (filters.chinese && d.type === 2) return true;
          return false;
        })
      );
    }
    if (filters.exam) list.push(...allExamItems.value);
    if (filters.treatment) list.push(...allTreatItems.value);
    if (filters.extra) list.push(...allExtraItems.value);
  }

  // 关键字过滤（客户端，支持拼音首字母不区分大小写）
  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(
      m =>
        m.name.toLowerCase().includes(kw) ||
        m.spec.toLowerCase().includes(kw) ||
        m.manufacturer.toLowerCase().includes(kw) ||
        (m.pinyin ?? "").toLowerCase().includes(kw)
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
  // 如果有自定义位置，使用自定义位置
  if (customPosition.value) {
    dropdownStyle.value = {
      ...dropdownStyle.value,
      left: `${customPosition.value.left}px`,
      top: `${customPosition.value.top}px`
    };
    return;
  }
  const rect = selectorRef.value.getBoundingClientRect();
  const width = Math.max(rect.width, 760);
  const height = dropdownRef.value?.offsetHeight ?? 0;
  dropdownStyle.value = {
    position: "fixed",
    top: `${Math.max(0, rect.bottom - height)}px`,
    left: `${rect.right}px`,
    minWidth: `${width}px`,
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
  if (props.disabled) return;
  if (!visible.value) {
    openDropdown();
  }
}

function openDropdown() {
  visible.value = true;
  activeIndex.value = -1;
  shouldIgnoreClickOutside.value = true;
  // 恢复原始位置
  customPosition.value = null;
  // 根据 filterType 设置默认过滤
  if (props.filterType === "western") {
    filters.western = true;
    filters.chinese = false;
  } else if (props.filterType === "chinese") {
    filters.western = false;
    filters.chinese = true;
  }
  loadAllData();
  nextTick(() => {
    updateDropdownPosition();
    requestAnimationFrame(updateDropdownPosition);
    setTimeout(() => {
      shouldIgnoreClickOutside.value = false;
    }, 50);
  });
}

function closeDropdown() {
  visible.value = false;
  activeIndex.value = -1;
  keyword.value = "";
}

// ---- 拖拽功能 ----
function startDrag(e: MouseEvent) {
  if (!dropdownRef.value) return;
  isDragging.value = true;
  const rect = dropdownRef.value.getBoundingClientRect();
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !dropdownRef.value) return;
  const newLeft = e.clientX - dragOffset.value.x;
  const newTop = e.clientY - dragOffset.value.y;
  dropdownStyle.value = {
    ...dropdownStyle.value,
    left: `${newLeft}px`,
    top: `${newTop}px`
  };
  customPosition.value = { top: newTop, left: newLeft };
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

function handleTriggerClick(e: MouseEvent) {
  if (props.disabled) return;
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
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
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

.ms-trigger--disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.ms-trigger--disabled:hover {
  border-color: #dcdfe6;
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

.ms-input:disabled {
  cursor: not-allowed;
  background-color: #f5f7fa;
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
  background: linear-gradient(to bottom, #f0f5ff, #e6eeff);
  cursor: move;
  user-select: none;
}

.ms-filters-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.ms-dropdown-close {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  transition: color 0.2s;
}

.ms-dropdown-close:hover {
  color: #f56c6c;
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
