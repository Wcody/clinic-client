<template>
  <div ref="selectorRef" class="bq-diagnosis-selector">
    <!-- 触发输入框 -->
    <div
      class="bq-ds-trigger"
      :class="{
        'bq-ds-trigger--active': visible,
        'bq-ds-trigger--disabled': disabled
      }"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        v-model="keyword"
        :placeholder="placeholder"
        :disabled="disabled"
        class="bq-ds-input"
        autocomplete="off"
        @focus="handleInputFocus"
        @input="handleSearch"
        @keydown.esc="closeDropdown"
        @keydown.tab="closeDropdown"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.down.prevent="moveActive(1)"
        @keydown.enter.prevent="confirmActive"
      />
      <el-icon v-if="loading" class="bq-ds-arrow"><Loading /></el-icon>
      <el-icon
        v-else
        class="bq-ds-arrow"
        :class="{ 'bq-ds-arrow--up': visible }"
      >
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <div
        v-show="visible"
        ref="dropdownRef"
        class="bq-ds-dropdown"
        :style="dropdownStyle"
        @mousedown.stop.prevent
      >
        <!-- 结果表格 -->
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="pagedData"
          :height="300"
          highlight-current-row
          size="small"
          class="bq-ds-table"
          :current-row-key="activeRowKey"
          row-key="id"
          @mousedown="handleTableMouseDown"
          @row-click="handleSelect"
        >
          <el-table-column prop="id" label="ID" width="90" />
          <el-table-column prop="diagnosisCode" label="ICD编码" width="120" />
          <el-table-column
            prop="diagnosisName"
            label="诊断名称"
            min-width="200"
          />
          <el-table-column prop="pinyin" label="拼音码" width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status ? 'success' : 'info'" size="small">
                {{ row.status ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="!loading && filteredData.length === 0" class="bq-ds-empty">
          {{ keyword ? "未找到匹配诊断" : "暂无诊断数据" }}
        </div>

        <!-- 分页区域 -->
        <div v-if="filteredData.length > 0" class="bq-ds-pagination">
          <div class="bq-ds-pg-left">
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
              class="bq-ds-jump-input"
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
          <div class="bq-ds-pg-right">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { ArrowDown, Loading } from "@element-plus/icons-vue";
import {
  searchDiagnosisDictApi,
  getDiagnosisDictListApi,
  type BQDiagnosisDictEntityType
} from "@/api/visit/diagnosis";

// ---- Props & Emits ----
interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请输入诊断编码/名称/拼音搜索",
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [diagnosis: BQDiagnosisDictEntityType];
}>();

// ---- Refs ----
const selectorRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const tableRef = ref<InstanceType<any>>();

// ---- State ----
const visible = ref(false);
const loading = ref(false);
const keyword = ref(props.modelValue);
const rawData = ref<BQDiagnosisDictEntityType[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const jumpInput = ref<number>(1);
const dropdownStyle = ref<Record<string, string>>({});
const activeIndex = ref(-1);
const shouldIgnoreClickOutside = ref(false);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const customPosition = ref<{ top: number; left: number } | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

// ---- 同步外部 modelValue ----
watch(
  () => props.modelValue,
  val => {
    keyword.value = val;
  }
);

// ---- API 搜索 ----
// 有关键字：searchDiagnosisDictApi（OR 匹配 diagnosisCode/diagnosisName/pinyin）
// 无关键字：getDiagnosisDictListApi 加载初始列表（仅启用状态）
async function fetchDiagnoses(kw: string) {
  loading.value = true;
  try {
    const res = kw
      ? await searchDiagnosisDictApi(kw)
      : await getDiagnosisDictListApi({
          filters: [{ field: "status", operator: "eq", value: "1" }]
        });
    if (res?.data) {
      rawData.value = res.data as BQDiagnosisDictEntityType[];
    }
  } catch {
    rawData.value = [];
  } finally {
    loading.value = false;
  }
}

// ---- Computed ----
// 本地即时过滤（让用户输入后立即看到反馈），服务端搜索完成后再更新为完整结果
const filteredData = computed<BQDiagnosisDictEntityType[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return rawData.value;
  return rawData.value.filter(
    d =>
      d.diagnosisCode.toLowerCase().includes(kw) ||
      d.diagnosisName.toLowerCase().includes(kw) ||
      d.pinyin.toLowerCase().includes(kw)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
);

const pagedData = computed<BQDiagnosisDictEntityType[]>(() => {
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
  if (customPosition.value) {
    dropdownStyle.value = {
      ...dropdownStyle.value,
      left: `${customPosition.value.left}px`,
      top: `${customPosition.value.top}px`
    };
    return;
  }
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
  } else if (keyword.value.trim().length > 0) {
    // 没有匹配结果，回车返回当前输入框关键字组成的诊断数据
    handleSelect({
      diagnosisCode: "0",
      diagnosisName: keyword.value.trim(),
      pinyin: null,
      status: true,
      version: null,
      deleted: null,
      deletedTime: null,
      deletedBy: null,
      createdBy: null,
      createdTime: null,
      updatedBy: null,
      updatedTime: null,
      tenantId: null,
      id: null
    });
  }
}

// ---- Dropdown Controls ----
function handleInputFocus() {
  if (props.disabled) return;
  if (!visible.value) openDropdown();
}

function openDropdown() {
  visible.value = true;
  activeIndex.value = -1;
  shouldIgnoreClickOutside.value = true;
  customPosition.value = null;
  // 无关键字时每次打开都拉全量列表（避免上次过滤结果残留）；有关键字时首次打开才拉
  if (!loading.value && (!keyword.value.trim() || rawData.value.length === 0)) {
    fetchDiagnoses(keyword.value.trim());
  }
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

function handleTableMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest(".el-table__header-wrapper")) {
    startDrag(e);
  }
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
  emit("update:modelValue", keyword.value);
  currentPage.value = 1;
  jumpInput.value = 1;
  activeIndex.value = -1;
  if (!visible.value) openDropdown();

  // 防抖：300ms 后发起 API 请求（按关键字搜索）
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchDiagnoses(keyword.value.trim());
  }, 300);
}

// ---- Selection ----
function handleSelect(row: BQDiagnosisDictEntityType) {
  keyword.value = row.diagnosisName;
  emit("update:modelValue", row.diagnosisName);
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
  if (searchTimer) clearTimeout(searchTimer);
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("scroll", handleScrollOrResize, true);
  window.removeEventListener("resize", handleScrollOrResize);
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
/* 容器 */
.bq-diagnosis-selector {
  display: inline-block;
  position: relative;
  min-width: 200px;
  width: 100%;
}

/* 触发输入框 */
.bq-ds-trigger {
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

.bq-ds-trigger:hover {
  border-color: #c0c4cc;
}

.bq-ds-trigger--active {
  border-color: #409eff;
}

.bq-ds-trigger--disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}

.bq-ds-trigger--disabled .bq-ds-input {
  color: #c0c4cc;
  cursor: not-allowed;
}

.bq-ds-input {
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

.bq-ds-input::placeholder {
  color: #c0c4cc;
}

.bq-ds-arrow {
  color: #c0c4cc;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  font-size: 12px;
}

.bq-ds-arrow--up {
  transform: rotate(180deg);
}

/* 下拉面板 */
.bq-ds-dropdown {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 空状态 */
.bq-ds-empty {
  padding: 24px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 表格悬停行 */
.bq-ds-table :deep(.el-table__row) {
  cursor: pointer;
}

.bq-ds-table :deep(.el-table__header-wrapper) {
  cursor: move;
}

.bq-ds-table :deep(.el-table__row:hover > td) {
  background-color: #ecf5ff !important;
}

.bq-ds-table :deep(.el-table__row.current-row > td) {
  background-color: #d9ecff !important;
}

/* 表头样式 */
.bq-ds-table :deep(.el-table__header) {
  background: linear-gradient(to bottom, #f0f5ff, #e6eeff);
}

.bq-ds-table :deep(.el-table__header th) {
  background: transparent !important;
  border-bottom: 2px solid #409eff;
  font-weight: 600;
  color: #000 !important;
  padding: 10px 0 !important;
}

.bq-ds-table :deep(.el-table__header .cell) {
  font-weight: 600;
  color: #1f2d3d;
}

/* 分页 */
.bq-ds-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  background: #f5f7fa;
  flex-wrap: wrap;
  gap: 6px;
}

.bq-ds-pg-left {
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

.bq-ds-pg-right {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  margin-left: auto;
}

/* 跳转输入框 */
.bq-ds-jump-input {
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

.bq-ds-jump-input::-webkit-outer-spin-button,
.bq-ds-jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.bq-ds-jump-input:focus {
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
