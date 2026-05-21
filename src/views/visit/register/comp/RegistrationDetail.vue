<!--
  - 挂号详情组件
  - 在挂号列表页签内以覆盖层形式展示挂号记录详情，支持修改患者信息并保存
  -->

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProvincesApi,
  getCitiesApi,
  getDistrictsApi,
  refundRegistrationApi,
  getRegistrationByIdApi,
  type BQRegistrationEntityType,
  type BQRegionItem
} from "@/api/visit/register";
import {
  updateVisitPatientApi,
  getVisitPatientByIdApi,
  type BQVisitPatientEntityType
} from "@/api/visit/patient";
import { getDeptListApi, type BQDeptEntityType } from "@/api/system/dept";
import { getUserListApi, type BQUserEntityType } from "@/api/system/user";

defineOptions({ name: "RegistrationDetail" });

const props = defineProps<{
  registration: BQRegistrationEntityType;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "refresh"): void; // 新增：用于通知父组件刷新列表
}>();

// ==================== 数据加载状态 ====================

const loading = ref(false);

// ==================== 编辑状态 ====================

const editing = ref(false);
const saveLoading = ref(false);

// 患者表单（仅包含基本信息字段）
const patientForm = reactive({
  id: 0,
  name: "",
  gender: "男",
  age: "",
  mobile: "",
  idCard: "",
  archiveNo: "",
  province: null as number | null,
  city: null as number | null,
  district: null as number | null,
  address: "",
  firstAge: 0,
  lastAge: 0,
  ageType: 1,
  height: null as number | null,
  weight: null as number | null
});

// 保存完整的患者信息（包含时间戳等元数据）
const patientDetail = ref<BQVisitPatientEntityType | null>(null);

// 保存一份原始快照，用于取消编辑时还原
let snapshot: typeof patientForm = { ...patientForm };

const initForm = () => {
  patientForm.id = 0;
  patientForm.name = "";
  patientForm.gender = "男";
  patientForm.age = "";
  patientForm.mobile = "";
  patientForm.idCard = "";
  patientForm.archiveNo = "";
  patientForm.province = null;
  patientForm.city = null;
  patientForm.district = null;
  patientForm.address = "";
  patientForm.firstAge = 0;
  patientForm.lastAge = 0;
  patientForm.ageType = 1;
  patientForm.height = null;
  patientForm.weight = null;
  snapshot = { ...patientForm };
};

// ==================== 地址级联 ====================

const provinceOptions = ref<BQRegionItem[]>([]);
const cityOptions = ref<BQRegionItem[]>([]);
const districtOptions = ref<BQRegionItem[]>([]);

const loadProvinces = async () => {
  try {
    const res = await getProvincesApi();
    provinceOptions.value = res.data ?? [];
  } catch {}
};

const handleProvinceChange = async (provinceId: number | null) => {
  patientForm.city = null;
  patientForm.district = null;
  cityOptions.value = [];
  districtOptions.value = [];
  if (!provinceId) return;
  try {
    const res = await getCitiesApi(provinceId);
    cityOptions.value = res.data ?? [];
  } catch {}
};

const handleCityChange = async (cityId: number | null) => {
  patientForm.district = null;
  districtOptions.value = [];
  if (!cityId) return;
  try {
    const res = await getDistrictsApi(cityId);
    districtOptions.value = res.data ?? [];
  } catch {}
};

// ==================== 下拉选项数据 ====================

const departmentOptions = ref<{ label: string; value: string }[]>([]);
const doctorOptions = ref<{ label: string; value: string }[]>([]);

const loadDropdownOptions = async () => {
  try {
    const [deptRes, userRes] = await Promise.all([
      getDeptListApi(),
      getUserListApi()
    ]);

    departmentOptions.value = (deptRes.data ?? [])
      .filter(d => d.status !== false)
      .map(d => ({ label: d.name, value: d.eid }));

    doctorOptions.value = (userRes.data ?? [])
      .filter(u => u.status !== false)
      .map(u => ({ label: u.name, value: u.eid }));
  } catch {
    // 加载失败时选项保持空，不影响页面渲染
  }
};

// ==================== 退号功能 ====================

const refundLoading = ref(false);

/**
 * 处理退号操作
 */
const handleRefund = async () => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要为患者"${props.registration.patient}"办理退号吗？退号后将无法恢复。`,
      "退号确认",
      {
        confirmButtonText: "确认退号",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true
      }
    );

    // 用户确认后，调用退号接口
    refundLoading.value = true;
    const res = await refundRegistrationApi(props.registration.id);

    if (res.code === 0) {
      ElMessage.success("退号成功");
      // 通知父组件刷新列表
      emit("refresh");
      // 返回上一页
      emit("back");
    } else {
      ElMessage.error(res.errMsg || "退号失败");
    }
  } catch (error: any) {
    // 用户取消操作或接口异常
    if (error !== "cancel") {
      ElMessage.error(error?.message || "退号操作失败");
    }
  } finally {
    refundLoading.value = false;
  }
};

// ==================== 操作 ====================

const handleEdit = () => {
  snapshot = { ...patientForm };
  editing.value = true;
};

const handleCancelEdit = () => {
  Object.assign(patientForm, snapshot);
  editing.value = false;
};

const normalizeOptionalNumber = (value: unknown) => {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const handleSave = async () => {
  saveLoading.value = true;
  try {
    await updateVisitPatientApi({
      id: patientForm.id,
      name: patientForm.name,
      gender: patientForm.gender,
      age: patientForm.age,
      mobile: patientForm.mobile || undefined,
      idCard: patientForm.idCard || undefined,
      archiveNo: patientForm.archiveNo || undefined,
      province: patientForm.province ?? undefined,
      city: patientForm.city ?? undefined,
      district: patientForm.district ?? undefined,
      address: patientForm.address || undefined,
      firstAge: patientForm.firstAge,
      lastAge: patientForm.lastAge,
      ageType: patientForm.ageType,
      height: normalizeOptionalNumber(patientForm.height),
      weight: normalizeOptionalNumber(patientForm.weight)
    } as any);
    ElMessage.success("患者信息保存成功");
    snapshot = { ...patientForm };
    editing.value = false;
  } catch (e: any) {
    ElMessage.error(e?.message ?? "保存失败，请重试");
  } finally {
    saveLoading.value = false;
  }
};

/** 格式化 ISO 日期时间 */
const formatDateTime = (dt: string) => {
  if (!dt) return "";
  return dt.replace("T", " ").replace(/\.\d+$/, "");
};

// ==================== 数据加载 ====================

// 右侧挂号详情数据
const registrationDetail = ref<BQRegistrationEntityType | null>(null);

const loadData = async () => {
  loading.value = true;
  try {
    // 调试：打印传入的挂号记录
    console.log("=== RegistrationDetail 数据加载 ===");
    console.log("props.registration:", props.registration);
    console.log("患者ID (patientId):", props.registration.patientId);
    console.log("挂号ID (id):", props.registration.id);

    // 如果patientId为0，尝试通过其他方式获取
    let targetPatientId = props.registration.patientId;

    if (!targetPatientId || targetPatientId === 0) {
      console.warn("⚠️ 患者ID为0，可能需要从其他途径获取");
      // TODO: 这里可以添加备用逻辑，比如通过患者姓名查询
      // 但最好的方式是修复后端数据
    }

    // 并行加载患者信息和挂号信息
    const [patientRes, registrationRes] = await Promise.all([
      getVisitPatientByIdApi(targetPatientId),
      getRegistrationByIdApi(props.registration.id)
    ]);

    // 填充患者信息到左侧表单
    if (patientRes.code === 0 && patientRes.data) {
      const patient = patientRes.data;
      // 保存完整的患者信息
      patientDetail.value = patient;

      // 简化赋值：直接映射基本信息字段
      Object.assign(patientForm, {
        id: patient.id,
        name: patient.name || "",
        gender: patient.gender || "男",
        age: patient.age || "",
        mobile: patient.mobile || "",
        idCard: patient.idCard || "",
        archiveNo: patient.archiveNo || "",
        province: patient.province || null,
        city: patient.city || null,
        district: patient.district || null,
        address: patient.address || "",
        firstAge: patient.firstAge || 0,
        lastAge: patient.lastAge || 0,
        ageType: patient.ageType || 1,
        height: patient.height != null ? Number(patient.height) : null,
        weight: patient.weight != null ? Number(patient.weight) : null
      });

      // 如果有省份，加载城市列表
      if (patientForm.province) {
        const cityRes = await getCitiesApi(patientForm.province);
        cityOptions.value = cityRes.data ?? [];

        // 如果有城市，加载区县列表
        if (patientForm.city) {
          const districtRes = await getDistrictsApi(patientForm.city);
          districtOptions.value = districtRes.data ?? [];
        }
      }
    }

    // 填充挂号信息到右侧
    if (registrationRes.code === 0 && registrationRes.data) {
      registrationDetail.value = registrationRes.data;
    }

    // 保存快照
    snapshot = { ...patientForm };
  } catch (e: any) {
    ElMessage.error(e?.message ?? "加载数据失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  initForm();
  await Promise.all([loadProvinces(), loadDropdownOptions()]);
  await loadData();
});
</script>

<template>
  <div class="rd-container">
    <!-- 标题 -->
    <div class="rd-title">挂号详情</div>

    <!-- 主体：左右两列 -->
    <div class="rd-body">
      <!-- 左侧：患者信息 -->
      <div class="rd-panel rd-left">
        <div class="rd-section-heading">患者信息</div>

        <el-form label-width="90px" class="rd-form">
          <!-- 姓名 / 性别 -->
          <div class="rd-row">
            <el-form-item label="* 姓名">
              <el-input
                v-model="patientForm.name"
                :disabled="!editing"
                class="rd-input"
              />
            </el-form-item>
            <el-form-item label="* 性别">
              <el-radio-group v-model="patientForm.gender" :disabled="!editing">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- 年龄 -->
          <div class="rd-row">
            <el-form-item label="* 年龄" class="rd-age-item">
              <el-input
                v-model.number="patientForm.firstAge"
                :disabled="!editing"
                class="rd-age-num"
              />
              <el-select
                v-model="patientForm.ageType"
                :disabled="!editing"
                class="rd-age-unit"
              >
                <el-option label="岁" :value="1" />
                <el-option label="月" :value="2" />
                <el-option label="天" :value="3" />
              </el-select>
              <el-input
                v-model.number="patientForm.lastAge"
                :disabled="!editing"
                class="rd-age-num"
              />
              <span class="rd-unit-text">{{
                patientForm.ageType === 1
                  ? "月"
                  : patientForm.ageType === 2
                    ? "天"
                    : ""
              }}</span>
            </el-form-item>
          </div>

          <!-- 联系方式 / 身份证 -->
          <div class="rd-row">
            <el-form-item label="联系方式">
              <el-input
                v-model="patientForm.mobile"
                :disabled="!editing"
                class="rd-input"
              />
            </el-form-item>
            <el-form-item label="身份证">
              <el-input
                v-model="patientForm.idCard"
                :disabled="!editing"
                class="rd-input"
              />
            </el-form-item>
          </div>

          <!-- 身高 / 体重 -->
          <div class="rd-row">
            <el-form-item label="身高">
              <el-input
                v-model.number="patientForm.height"
                :disabled="!editing"
                type="number"
                min="0"
                step="0.01"
                class="rd-input"
              >
                <template #append>cm</template>
              </el-input>
            </el-form-item>
            <el-form-item label="体重">
              <el-input
                v-model.number="patientForm.weight"
                :disabled="!editing"
                type="number"
                min="0"
                step="0.01"
                class="rd-input"
              >
                <template #append>kg</template>
              </el-input>
            </el-form-item>
          </div>

          <!-- 地址 -->
          <div class="rd-row">
            <el-form-item label="地址" class="rd-address-item">
              <el-select
                v-model="patientForm.province"
                :disabled="!editing"
                class="rd-addr-select"
                @change="handleProvinceChange"
              >
                <el-option
                  v-for="p in provinceOptions"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                />
              </el-select>
              <el-select
                v-model="patientForm.city"
                :disabled="!editing"
                class="rd-addr-select"
                @change="handleCityChange"
              >
                <el-option
                  v-for="c in cityOptions"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
              <el-select
                v-model="patientForm.district"
                :disabled="!editing"
                class="rd-addr-select"
              >
                <el-option
                  v-for="d in districtOptions"
                  :key="d.id"
                  :label="d.name"
                  :value="d.id"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 详细住址 -->
          <div class="rd-row">
            <el-form-item label="详细住址">
              <el-input
                v-model="patientForm.address"
                :disabled="!editing"
                class="rd-input-wide"
              />
            </el-form-item>
          </div>
        </el-form>

        <!-- 档案时间 -->
        <div class="rd-timestamps">
          <span
            >档案生成时间：{{
              formatDateTime(patientDetail?.createdTime || "")
            }}</span
          >
          <span
            >最后修改时间：{{
              formatDateTime(patientDetail?.updatedTime || "")
            }}</span
          >
        </div>
      </div>

      <!-- 右侧：挂号信息 -->
      <div class="rd-panel rd-right">
        <div class="rd-section-heading">挂号信息</div>

        <el-form label-width="80px" class="rd-form rd-reg-form">
          <el-form-item label="就诊序号">
            <el-input
              :value="registrationDetail?.registrationNo || '-'"
              disabled
              class="rd-reg-input"
            />
          </el-form-item>

          <el-form-item label="状态">
            <el-input
              :value="registrationDetail?.status || '-'"
              disabled
              class="rd-reg-input"
            />
          </el-form-item>

          <el-form-item label="科室">
            <el-select
              :model-value="registrationDetail?.department || ''"
              disabled
              class="rd-reg-input"
            >
              <el-option
                v-for="item in departmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="医生">
            <el-select
              :model-value="registrationDetail?.doctor || ''"
              disabled
              class="rd-reg-input"
            >
              <el-option
                v-for="item in doctorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="门诊类型">
            <el-input
              :value="registrationDetail?.outpatientType || '-'"
              disabled
              class="rd-reg-input"
            />
          </el-form-item>

          <el-form-item label="">
            <el-radio-group
              :model-value="registrationDetail?.isFirstVisit ? '初诊' : '复诊'"
              disabled
            >
              <el-radio value="初诊">初诊</el-radio>
              <el-radio value="复诊">复诊</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="身高">
            <el-input
              :value="
                registrationDetail?.height != null
                  ? `${registrationDetail.height} cm`
                  : '-'
              "
              disabled
              class="rd-reg-input"
            />
          </el-form-item>

          <el-form-item label="体重">
            <el-input
              :value="
                registrationDetail?.weight != null
                  ? `${registrationDetail.weight} kg`
                  : '-'
              "
              disabled
              class="rd-reg-input"
            />
          </el-form-item>

          <el-form-item label="挂号时间">
            <el-input
              :value="formatDateTime(registrationDetail?.orderTime || '')"
              disabled
              class="rd-reg-input"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="rd-actions">
      <el-button type="primary" @click="emit('back')">返回</el-button>

      <!-- 查看态 -->
      <template v-if="!editing">
        <!-- <el-button type="primary" plain @click="handleEdit">
          修改患者信息
        </el-button> -->
        <el-button
          v-if="registrationDetail?.status !== '已退号'"
          type="danger"
          plain
          :loading="refundLoading"
          @click="handleRefund"
        >
          退号
        </el-button>
      </template>

      <!-- 编辑态 (由于隐藏了修改按钮，此状态理论上不会触发) -->
      <template v-else>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">
          保存
        </el-button>
        <el-button @click="handleCancelEdit">取消</el-button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rd-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
}

/* 标题 */
.rd-title {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding: 14px 0 10px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

/* 主体两列 */
.rd-body {
  flex: 1;
  display: flex;
  overflow: auto;
  padding: 20px 24px;
  gap: 0;
}

/* 通用面板 */
.rd-panel {
  flex: 1;
  overflow: visible;
}

/* 左侧 */
.rd-left {
  padding-right: 40px;
  border-right: 1px solid #e4e7ed;
}

/* 右侧 */
.rd-right {
  padding-left: 40px;
}

/* 节标题（带蓝色左边框） */
.rd-section-heading {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  margin-bottom: 16px;
  line-height: 1.4;
}

/* 子标题（用于分组） */
.rd-section-subheading {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  padding: 8px 0 12px;
  margin-top: 8px;
  border-bottom: 1px dashed #dcdfe6;
}

/* 表单 */
.rd-form {
  :deep(.el-form-item) {
    margin-bottom: 10px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #606266;
  }
}

/* 行 */
.rd-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  :deep(.el-form-item) {
    margin-right: 12px;
  }
}

/* 输入框尺寸 */
.rd-input {
  width: 160px;
}

.rd-input-sm {
  width: 100px;
}

.rd-input-wide {
  width: 380px;
}

/* 年龄行 */
.rd-age-item {
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rd-age-num {
    width: 58px;
  }

  .rd-age-unit {
    width: 66px;
  }

  .rd-unit-text {
    font-size: 13px;
    color: #606266;
    white-space: nowrap;
  }
}

/* 地址行 */
.rd-address-item {
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .rd-addr-select {
    width: 120px;
  }
}

/* 全文本框 */
.rd-textarea {
  width: 100%;
}

/* 全宽表单项 */
.rd-full-width-item {
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
  }
}

/* 档案时间 */
.rd-timestamps {
  display: flex;
  gap: 32px;
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}

/* 右侧挂号表单 */
.rd-reg-form {
  .rd-reg-input {
    width: 260px;
  }

  .rd-fee-text {
    font-size: 15px;
    font-weight: 600;
    color: #f56c6c;
  }

  .rd-plain-text {
    font-size: 13px;
    color: #303133;
  }
}

/* 底部按钮 */
.rd-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
