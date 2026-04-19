<template>
  <div class="basic-info">
    <!-- 标题栏 -->
    <div class="section-title-bar" @click="collapsed = !collapsed">
      <span class="title-accent" />
      <span class="title-text">基本信息</span>
      <span v-if="collapsed && form.name" class="patient-hint">
        {{ form.name }}&nbsp;·&nbsp;{{ form.gender }}
      </span>
      <div v-if="hasSelected && !collapsed" class="toolbar" @click.stop>
        <template v-if="mode === 'locked'">
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button size="small" type="primary" @click="handleEdit"
            >修改</el-button
          >
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="handleSave"
            >保存</el-button
          >
          <el-button size="small" @click="handleCancel">取消</el-button>
        </template>
      </div>
      <span class="collapse-arrow" :class="{ collapsed }" />
    </div>

    <div v-show="!collapsed" class="form-body">
      <!-- 初诊 / 复诊 -->
      <div class="form-row indent">
        <el-radio-group v-model="form.isFirstVisit" :disabled="isLocked">
          <el-radio :value="true">初诊</el-radio>
          <el-radio :value="false">复诊</el-radio>
        </el-radio-group>
      </div>

      <!-- 姓名 + 性别 -->
      <div class="form-row">
        <div class="form-field">
          <label class="field-label required">*姓名</label>
          <UserSelector
            v-model="form.name"
            placeholder="姓名、联系方式"
            style="width: 200px"
            :class="{ 'is-error': validationErrors.name }"
            :disabled="isLocked"
            @select="onUserSelect"
            @blur="validateName"
          />
        </div>
        <div class="form-field">
          <label class="field-label required">*性别</label>
          <el-radio-group
            v-model="form.gender"
            :class="{ 'is-error': validationErrors.gender }"
            :disabled="isLocked"
            @change="validateGender"
          >
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 年龄 -->
      <div class="form-row">
        <div class="form-field">
          <label class="field-label required">*年龄</label>
          <el-input
            v-model.number="form.firstAge"
            class="age-year-input"
            :class="{ 'is-error': ageYearError }"
            type="number"
            min="0"
            max="150"
            :disabled="isLocked"
            @blur="validateFirstAge"
          />
          <el-select
            v-model="form.ageType"
            class="age-unit-select"
            :disabled="isLocked"
          >
            <el-option label="岁" :value="1" />
            <el-option label="月" :value="2" />
            <el-option label="天" :value="3" />
          </el-select>
          <el-input
            v-model.number="form.lastAge"
            class="age-month-input"
            type="number"
            min="0"
            max="11"
            :disabled="isLocked"
          />
          <span class="unit-text">{{ form.ageType === 1 ? "月" : "天" }}</span>
        </div>
      </div>

      <!-- 身份证 + 联系方式 -->
      <div class="form-row">
        <div class="form-field">
          <label class="field-label">身份证</label>
          <el-input
            v-model="form.idCard"
            class="medium-input"
            :disabled="isLocked"
          />
        </div>
        <div class="form-field">
          <label class="field-label">联系方式</label>
          <el-input
            v-model="form.mobile"
            class="phone-input"
            placeholder="输入手机号或者固号"
            :disabled="isLocked"
          />
        </div>
      </div>

      <!-- 地址 -->
      <div class="form-row">
        <div class="form-field address-field">
          <label class="field-label">地址</label>
          <el-select
            v-model="form.province"
            class="addr-select"
            :disabled="isLocked"
            @change="onProvinceChange"
          >
            <el-option
              v-for="p in provinceList"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
          <el-select
            v-model="form.city"
            class="addr-select"
            :disabled="isLocked"
            @change="onCityChange"
          >
            <el-option
              v-for="c in cityList"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
          <el-select
            v-model="form.district"
            class="addr-select"
            :disabled="isLocked"
          >
            <el-option
              v-for="d in districtList"
              :key="d.id"
              :label="d.name"
              :value="d.id"
            />
          </el-select>
          <span class="addr-detail-label">详细地址</span>
          <el-input
            v-model="form.address"
            class="addr-detail-input"
            placeholder="请输入详细地址"
            :disabled="isLocked"
            clearable
          />
        </div>
      </div>

      <!-- 过敏史 -->
      <div v-if="showAllergy" class="form-row">
        <div class="form-field allergy-field">
          <label class="field-label">过敏史</label>
          <el-radio-group v-model="form.isAllergy" :disabled="isLocked">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否认</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 过敏史备注文本框 -->
      <div v-if="showAllergy" class="form-row allergy-textarea-row">
        <el-input
          v-model="form.allergicHistory"
          type="textarea"
          :rows="2"
          class="allergy-textarea"
          :disabled="isLocked || !form.isAllergy"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserSelector from "../../BqUserSelector/";
import {
  getProvincesApi,
  getCitiesApi,
  getDistrictsApi,
  type RegionItem
} from "@/api/system/region";

// ---- props ----
interface Props {
  showAllergy?: boolean;
  collapseOnSelect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAllergy: true,
  collapseOnSelect: true
});

// ---- emits ----
const emit = defineEmits<{
  (e: "update:modelValue", val: FormData): void;
  (e: "userSelect", user: any): void;
  (e: "save", val: FormData): void;
}>();

// ---- 表单数据（字段与后端 BqPatientEntity 对齐）----
interface FormData {
  id?: number; // 患者ID（从搜索选中时设置）
  isFirstVisit: boolean; // 是否初诊
  name: string; // 患者姓名
  gender: string; // 性别
  firstAge: number; // 主年龄值
  ageType: number; // 年龄类型：1=岁 2=月 3=天
  lastAge: number; // 次年龄值（月数/天数）
  idCard: string; // 身份证号
  mobile: string; // 手机号
  province: number | null; // 省份ID
  city: number | null; // 城市ID
  district: number | null; // 区县ID
  address: string; // 详细地址
  isAllergy: boolean; // 是否过敏
  allergicHistory: string; // 过敏史
}

const defaultForm = (): FormData => ({
  id: undefined,
  isFirstVisit: true,
  name: "",
  gender: "男",
  firstAge: 0,
  ageType: 1,
  lastAge: 0,
  idCard: "",
  mobile: "",
  province: null,
  city: null,
  district: null,
  address: "",
  isAllergy: false,
  allergicHistory: ""
});

const form = ref<FormData>(defaultForm());

const formRef = ref();

const validationErrors = ref({
  name: false,
  firstAge: false,
  gender: false
});

// ---- 模式状态机 ----
type Mode = "editing" | "locked" | "saving";
const mode = ref<Mode>("editing");
const collapsed = ref(false);

const hasSelected = computed(
  () => mode.value === "locked" || mode.value === "saving"
);
const isLocked = computed(() => mode.value === "locked");

let snapshot: FormData | null = null;

function handleReset() {
  form.value = defaultForm();
  mode.value = "editing";
  collapsed.value = false;
  snapshot = null;
  cityList.value = [];
  districtList.value = [];
}

function handleEdit() {
  snapshot = JSON.parse(JSON.stringify(form.value));
  mode.value = "saving";
}

function handleSave() {
  emit("save", JSON.parse(JSON.stringify(form.value)));
  snapshot = null;
  mode.value = "locked";
}

function handleCancel() {
  if (snapshot) {
    form.value = snapshot;
    snapshot = null;
  }
  mode.value = "locked";
}

const ageYearError = ref(false);

function validateFirstAge() {
  const value = form.value.firstAge;
  ageYearError.value = (!value && value !== 0) || value < 0;
  validationErrors.value.firstAge = ageYearError.value;
  return !ageYearError.value;
}

function validateName() {
  validationErrors.value.name = !form.value.name?.trim();
  return !validationErrors.value.name;
}

function validateGender() {
  validationErrors.value.gender = !form.value.gender;
  return !validationErrors.value.gender;
}

function validateAllFields(): boolean {
  return validateName() && validateFirstAge() && validateGender();
}

function clearValidate() {
  validationErrors.value = { name: false, firstAge: false, gender: false };
  ageYearError.value = false;
}

// ---- 选中用户后自动填充并锁定 ----
function onUserSelect(user: any) {
  form.value.id = user.id ?? user.patientId ?? undefined;
  form.value.name = user.name ?? "";
  form.value.gender = user.gender === "女" ? "女" : "男";
  // 解析年龄字符串，如 "5岁3月" / "10月2天"
  const ageStr = user.age ?? "";
  const matchYear = ageStr.match(/^(\d+)岁(?:(\d+)月)?$/);
  const matchMonth = ageStr.match(/^(\d+)月(?:(\d+)天)?$/);
  if (matchYear) {
    form.value.ageType = 1;
    form.value.firstAge = Number(matchYear[1]);
    form.value.lastAge = Number(matchYear[2] ?? 0);
  } else if (matchMonth) {
    form.value.ageType = 2;
    form.value.firstAge = Number(matchMonth[1]);
    form.value.lastAge = Number(matchMonth[2] ?? 0);
  }
  form.value.mobile = user.mobile ?? user.phone ?? "";
  form.value.idCard = user.idCard ?? "";
  form.value.isFirstVisit = user.isFirstVisit ?? true;
  form.value.isAllergy = user.isAllergy ?? false;
  form.value.allergicHistory = user.allergicHistory ?? "";
  form.value.address = user.address ?? "";
  if (user.province) {
    form.value.province = user.province;
    onProvinceChange(user.province).then(() => {
      if (user.city) {
        form.value.city = user.city;
        onCityChange(user.city).then(() => {
          if (user.district) form.value.district = user.district;
        });
      }
    });
  }
  mode.value = "locked";
  if (props.collapseOnSelect) collapsed.value = true;
  emit("userSelect", user);
}

// ---- 地址级联数据 ----
const provinceList = ref<RegionItem[]>([]);
const cityList = ref<RegionItem[]>([]);
const districtList = ref<RegionItem[]>([]);

async function onProvinceChange(provinceId: number) {
  form.value.city = null;
  form.value.district = null;
  cityList.value = [];
  districtList.value = [];
  if (provinceId) {
    const res = await getCitiesApi(provinceId);
    cityList.value = res.data ?? [];
  }
}

async function onCityChange(cityId: number) {
  form.value.district = null;
  districtList.value = [];
  if (cityId) {
    const res = await getDistrictsApi(cityId);
    districtList.value = res.data ?? [];
  }
}

onMounted(async () => {
  const res = await getProvincesApi();
  provinceList.value = res.data ?? [];

  const guangdong = provinceList.value.find(p => p.name === "广东省");
  if (guangdong) {
    form.value.province = guangdong.id;
    const cityRes = await getCitiesApi(guangdong.id);
    cityList.value = cityRes.data ?? [];
    const maoming = cityList.value.find(c => c.name === "茂名市");
    if (maoming) {
      form.value.city = maoming.id;
      const districtRes = await getDistrictsApi(maoming.id);
      districtList.value = districtRes.data ?? [];
      const gaozhou = districtList.value.find(d => d.name === "高州市");
      if (gaozhou) form.value.district = gaozhou.id;
    }
  }
});

// 根据患者实体对象直接填充表单并锁定（用于路由跳转时回填）
function selectPatient(patient: any) {
  form.value.id = patient.id ?? undefined;
  form.value.name = patient.name ?? "";
  form.value.gender = patient.gender === "女" ? "女" : "男";
  form.value.ageType = patient.ageType ?? 1;
  form.value.firstAge = patient.firstAge ?? 0;
  form.value.lastAge = patient.lastAge ?? 0;
  form.value.idCard = patient.idCard ?? "";
  form.value.mobile = patient.mobile ?? "";
  form.value.isAllergy = patient.isAllergy ?? false;
  form.value.allergicHistory = patient.allergicHistory ?? "";
  form.value.address = patient.address ?? "";
  if (patient.province) {
    form.value.province = patient.province;
    onProvinceChange(patient.province).then(() => {
      if (patient.city) {
        form.value.city = patient.city;
        onCityChange(patient.city).then(() => {
          if (patient.district) form.value.district = patient.district;
        });
      }
    });
  }
  mode.value = "locked";
  if (props.collapseOnSelect) collapsed.value = true;
  emit("userSelect", patient);
}

defineExpose({
  form,
  validate: validateAllFields,
  clearValidate,
  formRef,
  reset: handleReset,
  selectPatient
});
</script>

<style scoped>
.basic-info {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.section-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f0f5ff;
  }

  .patient-hint {
    font-size: 13px;
    color: #409eff;
    margin-left: 4px;
  }

  .collapse-arrow {
    margin-left: auto;
    flex-shrink: 0;
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #909399;
    transition: transform 0.25s ease;

    &.collapsed {
      transform: rotate(-90deg);
    }
  }
}

.toolbar {
  margin-left: auto;
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-accent {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.form-body {
  padding: 16px 24px 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 32px;
  min-height: 40px;
  margin-bottom: 12px;
}

.form-row.indent {
  padding-left: 48px;
}

.form-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  min-width: 52px;
  text-align: right;
}

.field-label.required {
  color: #f56c6c;
}

.age-year-input {
  width: 60px;
}

.age-year-input.is-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

.age-unit-select {
  width: 68px;
}

.age-month-input {
  width: 60px;
}

.unit-text {
  font-size: 13px;
  color: #606266;
}

.medium-input {
  width: 200px;
}

.phone-input {
  width: 220px;
}

.address-field {
  flex: 1;
  gap: 6px;
}

.addr-select {
  width: 90px;
}

.addr-detail-label {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  padding-left: 4px;
}

.addr-detail-input {
  flex: 1;
}

.allergy-field {
  gap: 8px;
}

.allergy-textarea-row {
  padding-left: 60px;
  margin-bottom: 0;
}

.allergy-textarea {
  width: 400px;
}

:deep(.el-radio) {
  margin-right: 16px;
}

:deep(.el-radio:last-child) {
  margin-right: 0;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
  font-size: 13px;
}

:deep(.el-select .el-input__inner) {
  height: 30px;
  font-size: 13px;
}

.is-error :deep(.el-input__wrapper),
.is-error :deep(.el-radio-group) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

.is-error :deep(.el-input__wrapper):hover,
.is-error :deep(.el-radio-group):hover {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}
</style>
