<template>
  <div ref="selectorRef" class="item-selector">
    <div
      class="is-trigger"
      :class="{
        'is-trigger--active': visible,
        'is-trigger--disabled': disabled
      }"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        v-model="keyword"
        :placeholder="placeholder"
        :disabled="disabled"
        class="is-input"
        autocomplete="off"
        @focus="handleInputFocus"
        @input="handleSearch"
        @keydown.esc="closeDropdown"
        @keydown.tab="closeDropdown"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.down.prevent="moveActive(1)"
        @keydown.enter.prevent="confirmActive"
      />
      <el-icon v-if="loading" class="is-arrow"><Loading /></el-icon>
      <el-icon v-else class="is-arrow" :class="{ 'is-arrow--up': visible }">
        <ArrowDown />
      </el-icon>
    </div>

    <Teleport to="body">
      <div
        v-show="visible"
        ref="dropdownRef"
        class="is-dropdown"
        :style="dropdownStyle"
        @mousedown.stop.prevent
      >
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="pagedData"
          :height="300"
          highlight-current-row
          size="small"
          class="is-table"
          :current-row-key="activeRowKey"
          row-key="id"
          @row-click="handleSelect"
        >
          <el-table-column prop="name" label="项目名称" min-width="150" />
          <el-table-column prop="seq" label="序号" width="70" />
          <el-table-column prop="projectCode" label="项目编码" width="120" />
          <el-table-column prop="sellingPrice" label="售价" width="90" />
          <el-table-column prop="costPrice" label="成本价" width="90" />
          <el-table-column prop="status" label="状态" width="70" />
        </el-table>

        <div v-if="!loading && filteredData.length === 0" class="is-empty">
          {{ keyword ? "未找到匹配项目" : "暂无治疗项目" }}
        </div>

        <div v-if="filteredData.length > 0" class="is-pagination">
          <div class="is-pg-left">
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
              class="is-jump-input"
              :min="1"
              :max="totalPages"
              @keydown.enter="doJump"
            />
            <el-button size="small" type="primary" @click="doJump">确定</el-button>
            <el-button size="small" :disabled="currentPage <= 1" @click="goPrev">上一页</el-button>
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
            <el-button size="small" :disabled="currentPage >= totalPages" @click="goNext">下一页</el-button>
          </div>
          <div class="is-pg-right">
            显示{{ startItem }}到{{ endItem }}，共{{ filteredData.length }}条记录
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
  getTreatmentItemListApi,
  type BQTreatmentItemEntityType
} from "@/api/pharmacy/treatment";

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请输入项目名称 / 编码搜索",
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [item: BQTreatmentItemEntityType];
}>();

const selectorRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const tableRef = ref<InstanceType<any>>();

const visible = ref(false);
const loading = ref(false);
const keyword = ref(props.modelValue);
const rawData = ref<BQTreatmentItemEntityType[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const jumpInput = ref<number>(1);
const dropdownStyle = ref<Record<string, string>>({});
const activeIndex = ref(-1);
const shouldIgnoreClickOutside = ref(false);
const dataLoaded = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.modelValue,
  val => {
    keyword.value = val;
  }
);

async function fetchItems() {
  loading.value = true;
  try {
    const res = await getTreatmentItemListApi();
    if (res?.data) {
      rawData.value = res.data as unknown as BQTreatmentItemEntityType[];
    }
    dataLoaded.value = true;
  } catch {
    rawData.value = [];
  } finally {
    loading.value = false;
  }
}

const filteredData = computed<BQTreatmentItemEntityType[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return rawData.value;
  return rawData.value.filter(
    item =>
      (item.name ?? "").toLowerCase().includes(kw) ||
      (item.projectCode ?? "").toLowerCase().includes(kw)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
);

const pagedData = computed<BQTreatmentItemEntityType[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const startItem = computed(() =>
  filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
);
const endItem = computed(() =>
  Math.min(currentPage.value * pageSize.value, filteredData.value.length)
);

const activeRowKey = computed<string | undefined>(() => {
  if (activeIndex.value < 0 || activeIndex.value >= pagedData.value.length) return undefined;
  return String(pagedData.value[activeIndex.value].id);
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

function updateDropdownPosition() {
  if (!selectorRef.value) return;
  const rect = selectorRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${Math.max(rect.width, 620)}px`,
    zIndex: "9999"
  };
}

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
    const rows = tableEl.querySelectorAll<HTMLElement>(".el-table__body tbody tr");
    rows[next]?.scrollIntoView({ block: "nearest" });
  });
}

function confirmActive() {
  if (!visible.value) return;
  if (activeIndex.value >= 0 && activeIndex.value < pagedData.value.length) {
    handleSelect(pagedData.value[activeIndex.value]);
  }
}

function handleInputFocus() {
  if (props.disabled) return;
  if (!visible.value) openDropdown();
}

function openDropdown() {
  visible.value = true;
  activeIndex.value = -1;
  shouldIgnoreClickOutside.value = true;
  if (!dataLoaded.value && !loading.value) {
    fetchItems();
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
  keyword.value = "";
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
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (!dataLoaded.value && !loading.value) fetchItems();
  }, 300);
}

function handleSelect(row: BQTreatmentItemEntityType) {
  keyword.value = row.name ?? "";
  emit("update:modelValue", row.name ?? "");
  emit("select", row);
  closeDropdown();
}

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

function handleClickOutside(e: MouseEvent) {
  if (!visible.value || shouldIgnoreClickOutside.value) return;
  const target = e.target as Node;
  if (selectorRef.value?.contains(target) || dropdownRef.value?.contains(target)) return;
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
});
</script>

<style scoped>
.item-selector {
  display: inline-block;
  position: relative;
  min-width: 200px;
  width: 100%;
}

.is-trigger {
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

.is-trigger:hover { border-color: #c0c4cc; }
.is-trigger--active { border-color: #409eff; }
.is-trigger--disabled { background-color: #f5f7fa; border-color: #e4e7ed; cursor: not-allowed; }
.is-trigger--disabled .is-input { color: #c0c4cc; cursor: not-allowed; }

.is-input {
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

.is-input::placeholder { color: #c0c4cc; }

.is-arrow {
  color: #c0c4cc;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  font-size: 12px;
}

.is-arrow--up { transform: rotate(180deg); }

.is-dropdown {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.is-empty {
  padding: 24px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.is-table :deep(.el-table__row) { cursor: pointer; }
.is-table :deep(.el-table__row:hover > td) { background-color: #ecf5ff !important; }
.is-table :deep(.el-table__row.current-row > td) { background-color: #d9ecff !important; }
.is-table :deep(.el-table__header) { background: linear-gradient(to bottom, #f0f5ff, #e6eeff); }
.is-table :deep(.el-table__header th) { background: transparent !important; border-bottom: 2px solid #409eff; font-weight: 600; color: #000 !important; padding: 10px 0 !important; }
.is-table :deep(.el-table__header .cell) { font-weight: 600; color: #1f2d3d; }

.is-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  background: #f5f7fa;
  flex-wrap: wrap;
  gap: 6px;
}

.is-pg-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-label { font-size: 13px; color: #606266; white-space: nowrap; }

.is-pg-right { font-size: 13px; color: #909399; white-space: nowrap; margin-left: auto; }

.is-jump-input {
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

.is-jump-input::-webkit-outer-spin-button,
.is-jump-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.is-jump-input:focus { border-color: #409eff; }

.page-btns { display: flex; gap: 2px; }

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

.page-btn:hover { color: #409eff; border-color: #c6e2ff; background-color: #ecf5ff; }
.page-btn--active { background-color: #409eff; border-color: #409eff; color: #fff; }
.page-btn--active:hover { color: #fff; background-color: #337ecc; border-color: #337ecc; }
</style>
