将 - 版权声明 Copyright (c) 2026。 - 版权所有者： [缩微存储管理系统] -
首创日期： 2026年4月11日 -->

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import { ref, reactive, onMounted, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import { useWindowSize } from "@vueuse/core";
import { deviceDetection } from "@pureadmin/utils";
import BqPatientBasicInfo from "@/components/BqPatientBasicInfo/src/BqPatientBasicInfo.vue";
import RegistrationDetail from "./comp/RegistrationDetail.vue";
import {
  type BQRegistrationSaveDto,
  type BQRegistrationEntityType,
  type BQRegistrationSearchParams,
  saveRegistrationApi,
  searchRegistrationApi,
  refundRegistrationApi,
  getRegistrationFeeListApi
} from "@/api/visit/register";
import { getDeptListApi } from "@/api/system/dept";
import { getUserListApi } from "@/api/system/user";
import { useUserStoreHook } from "@/store/modules/user";
import {
  saveVisitPatientApi,
  updateVisitPatientApi
} from "@/api/visit/patient";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "@iconify-icons/ep/refresh";
import { lo } from "element-plus/es/locale/index.mjs";

const localUser = useUserStoreHook();

// 标签页状态
const activeTab = ref("new");
const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const registrationFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 是否已选中患者（选中后患者信息字段锁定，重置后解锁）
const patientSelected = ref(false);

// 动态计算表格底部偏移量
const { height: windowHeight } = useWindowSize();
const tableOffsetBottom = ref(110);

// 监听容器高度变化，动态计算 offsetBottom
const updateOffsetBottom = () => {
  // 获取当前浏览器视窗高度
  const viewportHeight = windowHeight.value;

  if (activeTab.value !== "list") {
    // 新增挂号页：固定偏移量
    tableOffsetBottom.value = 110;
    return;
  }

  // 挂号列表页：动态计算偏移量
  nextTick(() => {
    const headerHeight = 55; // 标签头高度
    const searchFormEl = queryFormRef.value?.$el;
    const searchHeight = searchFormEl?.offsetHeight || 60;
    const paginationHeight = 50; // 分页高度
    const spacing = 24; // 间距

    const currentOffset =
      headerHeight + searchHeight + paginationHeight + spacing;
    tableOffsetBottom.value = currentOffset;
  });
};

// 监听标签页切换
const handleTabChange = (tab: any) => {
  // 延迟触发，确保 DOM 已渲染
  setTimeout(() => {
    updateOffsetBottom();
  }, 200);
  // 切换到挂号列表时自动加载数据
  if (tab.paneName === "list" || activeTab.value === "list") {
    handleQuery();
  }
};

// ==================== 新增挂号 ====================
// 表单引用
const patientBasicInfoRef = ref();

// 挂号表单数据
const registrationForm = reactive({
  patientId: 0, // 患者ID（用于下拉选择）
  patientName: "", // 患者姓名
  idCard: "", // 身份证号码
  gender: 1, // 性别：1-男，0-女
  firstAge: 0, // 第一个年龄值
  lastAge: 0, // 第二个年龄值
  ageType: 1, // 年龄单位类型：1=岁, 2=月, 3=天
  age: "", // 年龄字符串,如：3岁2月
  phone: "", // 手机号
  contact: "", // 联系方式
  department: "", // 科室（从API加载后设置默认值）
  doctor: localUser.eid, // 医生（从API加载后设置默认值）
  item: "", // 项目（从API加载后设置默认值）
  receivable: 0, // 应收费用（与默认项目同步）
  actual: 0, // 实收
  paymentMethod: "cash", // 支付方式：cash-现金，card-刷卡，wechat-微信，alipay-支付宝
  visitType: 1 // 就诊类型：1-初诊，2-复诊
});

// 表单验证规则
const registrationRules = reactive<FormRules>({
  patientName: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  firstAge: [{ required: true, message: "请输入年龄", trigger: "blur" }],
  department: [{ required: true, message: "请选择科室", trigger: "change" }],
  doctor: [{ required: true, message: "请选择医生", trigger: "change" }],
  item: [{ required: true, message: "请选择项目", trigger: "change" }]
});

// 科室选项（从API加载）
const departmentOptions = ref<{ label: string; value: string }[]>([]);

// 医生选项（从API加载）
const doctorOptions = ref<{ label: string; value: string }[]>([]);

// 项目选项（从API加载）
const itemOptions = ref<{ label: string; value: string; price: number }[]>([]);

// 加载科室、医生、项目选项
const loadFormOptions = async () => {
  try {
    const [deptRes, userRes, feeRes] = await Promise.all([
      getDeptListApi(),
      getUserListApi(),
      getRegistrationFeeListApi()
    ]);

    departmentOptions.value = (deptRes.data ?? [])
      .filter(d => d.status !== false)
      .map(d => ({ label: d.name, value: d.eid }));

    doctorOptions.value = (userRes.data ?? [])
      .filter(u => u.status !== false)
      .map(u => ({ label: u.name, value: u.eid }));

    itemOptions.value = (feeRes.data ?? [])
      .filter(f => f.status !== false)
      .map(f => ({
        label: f.name,
        value: String(f.id),
        price: Number(f.sellingPrice ?? 0)
      }));

    // 设置默认值
    if (departmentOptions.value.length > 0) {
      registrationForm.department = departmentOptions.value[0].value;
    }
    const currentEid = useUserStoreHook().eid;
    const matchCurrent = doctorOptions.value.find(d => d.value === currentEid);
    registrationForm.doctor =
      matchCurrent?.value ?? doctorOptions.value[0]?.value ?? "";
    const fees = feeRes.data ?? [];
    const defaultFee =
      fees.find(f => f.status && f.isDefault) ?? fees.find(f => f.status);
    if (defaultFee) {
      registrationForm.item = String(defaultFee.id);
      registrationForm.receivable = Number(defaultFee.sellingPrice ?? 0);
      registrationForm.actual = Number(defaultFee.sellingPrice ?? 0);
    } else if (itemOptions.value.length > 0) {
      registrationForm.item = itemOptions.value[0].value;
      registrationForm.receivable = itemOptions.value[0].price;
      registrationForm.actual = itemOptions.value[0].price;
    }
  } catch {
    // 加载失败时选项保持空，不影响页面渲染
  }
};

// 支付方式选项
const paymentOptions = ref([
  { label: "现金", value: "cash" },
  { label: "刷卡", value: "card" },
  { label: "微信", value: "wechat" },
  { label: "支付宝", value: "alipay" }
]);

// 年龄单位选项
const ageUnitOptions = ref([
  { label: "岁", value: 1 },
  { label: "月", value: 2 }
]);

// 根据ageType计算第二个单位的文本
const getSecondUnitText = (ageType: number) => {
  return ageType === 1 ? "月" : "天";
};

const normalizeOptionalNumber = (value: unknown) => {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const buildAgeText = (
  firstAge: number | null,
  lastAge: number | null,
  ageType: number
) => {
  const firstAgeVal = firstAge ?? 0;
  const lastAgeVal = lastAge ?? 0;
  if (ageType === 1) {
    return lastAgeVal > 0
      ? `${firstAgeVal}岁${lastAgeVal}月`
      : `${firstAgeVal}岁`;
  }
  if (ageType === 2) {
    return lastAgeVal > 0
      ? `${firstAgeVal}月${lastAgeVal}天`
      : `${firstAgeVal}月`;
  }
  return `${firstAgeVal}天`;
};

const buildPatientPayload = (formData: any) => {
  const firstAge = formData.firstAge != null ? Number(formData.firstAge) : null;
  const lastAge = formData.lastAge != null ? Number(formData.lastAge) : null;
  const ageType =
    formData.ageType != null
      ? Number(formData.ageType)
      : registrationForm.ageType;

  return {
    id:
      formData.id ??
      patientBasicInfoRef.value?.form?.id ??
      Number(registrationForm.patientId),
    name: formData.name || "",
    gender: formData.gender || "",
    mobile: formData.mobile || "",
    idCard: formData.idCard || "",
    age: buildAgeText(firstAge, lastAge, ageType),
    firstAge,
    lastAge,
    ageType,
    province: formData.province ?? null,
    city: formData.city ?? null,
    district: formData.district ?? null,
    address: formData.address || "",
    height: normalizeOptionalNumber(formData.height),
    weight: normalizeOptionalNumber(formData.weight),
    isAllergy: formData.isAllergy === true,
    allergicHistory: formData.allergicHistory || ""
  };
};

// 选择患者时自动填充信息并锁定患者信息字段
const handlePatientChange = (value: any) => {
  // 注意：patientName 已通过 v-model 自动更新，无需在此重复设置
  registrationForm.patientId = value.id ?? value.patientId ?? 0;
  registrationForm.patientName = value.name;
  registrationForm.idCard = value.idCard || "";
  registrationForm.gender = value.gender === "男" ? 1 : 0;
  registrationForm.contact = value.mobile || "";
  registrationForm.age = value.age || "";

  // 直接使用后端的三个字段
  registrationForm.firstAge = value.firstAge ?? 0;
  registrationForm.lastAge = value.lastAge ?? 0;
  registrationForm.ageType = value.ageType ?? 1;

  patientSelected.value = true;
};

// 处理患者基本信息保存
const handlePatientSave = async (formData: any) => {
  // 同步到挂号表单
  registrationForm.patientName = formData.name || "";
  registrationForm.gender = formData.gender === "男" ? 1 : 0;
  registrationForm.contact = formData.mobile || "";
  registrationForm.idCard = formData.idCard || "";
  registrationForm.firstAge =
    formData.firstAge != null ? Number(formData.firstAge) : 0;
  registrationForm.lastAge =
    formData.lastAge != null ? Number(formData.lastAge) : 0;
  registrationForm.ageType =
    formData.ageType != null ? Number(formData.ageType) : 1;

  loading.value = true;
  try {
    await updateVisitPatientApi(buildPatientPayload(formData) as any);
    ElMessage.success("患者信息已保存");
  } catch (e: any) {
    ElMessage.error(e?.message ?? "保存失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 选择项目时更新应收费用
const handleItemChange = (value: string) => {
  const item = itemOptions.value.find(i => i.value === value);
  if (item) {
    registrationForm.receivable = item.price;
    registrationForm.actual = item.price;
  }
};

// 挂号收费
const handleRegistration = async () => {
  if (loading.value) return;
  if (!registrationFormRef.value || !patientBasicInfoRef.value) return;

  // 1. 先验证左侧基本信息表单
  const basicInfoValid = patientBasicInfoRef.value.validate();
  if (!basicInfoValid) {
    ElMessage.error("请完善患者基本信息！");
    // 滚动到左侧表单区域
    document.querySelector(".form-left")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  // 2. 再验证右侧挂号信息表单
  const registrationValid = await registrationFormRef.value
    .validate()
    .catch(() => false);
  if (!registrationValid) {
    ElMessage.error("请完善挂号信息！");
    // 滚动到右侧表单区域
    document.querySelector(".form-right")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  // 3. 两个表单都通过验证，继续提交
  // 科室/医生/项目当前存的是 value，取对应 label 发给后端
  const deptLabel =
    departmentOptions.value.find(d => d.value === registrationForm.department)
      ?.label ?? registrationForm.department;
  const doctorLabel =
    doctorOptions.value.find(d => d.value === registrationForm.doctor)?.label ??
    registrationForm.doctor;
  const itemLabel =
    itemOptions.value.find(i => i.value === registrationForm.item)?.label ??
    registrationForm.item;

  // 以 BasicInfo 表单的当前值为准（用户填写的实际值），registrationForm 作为兜底
  const basicInfoForm = patientBasicInfoRef.value?.form;
  const firstAge =
    basicInfoForm?.firstAge != null
      ? Number(basicInfoForm.firstAge)
      : Number(registrationForm.firstAge);
  const lastAge =
    basicInfoForm?.lastAge != null
      ? Number(basicInfoForm.lastAge)
      : Number(registrationForm.lastAge);
  const ageType = basicInfoForm?.ageType ?? registrationForm.ageType;

  loading.value = true;
  try {
    let patientId = registrationForm.patientId;
    if (!patientId) {
      // 如果患者Id不存在，则创建患者
      const res = await saveVisitPatientApi(patientBasicInfoRef.value.form);
      if (res.code == 0) {
        handlePatientChange(res.data);
        patientId = res.data.id;
      } else {
        ElMessage.error("创建患者失败，请重试");
        return;
      }
    } else {
      const patientPayload = buildPatientPayload({
        ...basicInfoForm,
        id: patientId,
        firstAge,
        lastAge,
        ageType
      });
      await updateVisitPatientApi(patientPayload as any);
    }

    const dto: BQRegistrationSaveDto = {
      registration: {
        patientId: patientId,
        patient: registrationForm.patientName,
        gender: registrationForm.gender === 1 ? "男" : "女",
        firstAge,
        lastAge,
        ageType,
        age: buildAgeText(firstAge, lastAge, ageType),
        height: normalizeOptionalNumber(basicInfoForm?.height),
        weight: normalizeOptionalNumber(basicInfoForm?.weight),
        department: deptLabel,
        doctor: doctorLabel,
        outpatientType: itemLabel,
        status: "待接诊",
        isFirstVisit: registrationForm.visitType === 1
      }
    };

    await saveRegistrationApi(dto);
    ElMessage.success("挂号收费成功！");
    handleReset();
    activeTab.value = "list";
    handleQuery();
  } catch (e: any) {
    ElMessage.error(e?.message ?? "挂号失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  if (!registrationFormRef.value) return;

  registrationFormRef.value.resetFields();

  if (patientBasicInfoRef.value) {
    patientBasicInfoRef.value.reset();
  }

  // 重置后恢复API加载的默认值
  if (departmentOptions.value.length > 0) {
    registrationForm.department = departmentOptions.value[0].value;
  }
  if (doctorOptions.value.length > 0) {
    registrationForm.doctor = doctorOptions.value[0].value;
  }
  const defaultItem = itemOptions.value[0];
  if (defaultItem) {
    registrationForm.item = defaultItem.value;
    registrationForm.receivable = defaultItem.price;
    registrationForm.actual = defaultItem.price;
  }
  patientSelected.value = false;
};

// ==================== 挂号列表 ====================

// 查询表单
const queryForm = reactive({
  patientName: "",
  dateRange: [
    new Date().toISOString().split("T")[0],
    new Date().toISOString().split("T")[0]
  ],
  status: ""
});

// 挂号列表数据
const registrationList = ref<BQRegistrationEntityType[]>([]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 表格列定义
const columns = ref<any>([
  { label: "状态", prop: "status", minWidth: 100 },
  {
    label: "门诊类型",
    prop: "isFirstVisit",
    minWidth: 100,
    formatter: (row: BQRegistrationEntityType) =>
      row.isFirstVisit ? "初诊" : "复诊"
  },
  { label: "姓名", prop: "patient", minWidth: 120 },
  { label: "挂号号码", prop: "registrationNo", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "科室", prop: "department", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "挂号时间", prop: "orderTime", minWidth: 180 },
  { label: "操作", fixed: "right", width: 160, slot: "operation" }
]);

// 查询挂号列表
const handleQuery = async () => {
  loading.value = true;
  try {
    const params: BQRegistrationSearchParams = {};
    if (queryForm.patientName) params.patientName = queryForm.patientName;
    if (queryForm.dateRange?.[0])
      params.startTime = queryForm.dateRange[0] + "T00:00:00";
    if (queryForm.dateRange?.[1])
      params.endTime = queryForm.dateRange[1] + "T23:59:59";
    if (queryForm.status) params.status = queryForm.status;

    const res = await searchRegistrationApi(params);
    registrationList.value = res.data ?? [];

    // 调试：打印第一条数据，检查patientId字段
    if (registrationList.value.length > 0) {
      console.log("挂号列表第一条数据:", registrationList.value[0]);
      console.log("患者ID:", registrationList.value[0].patientId);
    }

    pagination.total = registrationList.value.length;
  } catch (e: any) {
    ElMessage.error(e?.message ?? "查询失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const handleResetQuery = () => {
  queryForm.patientName = "";
  queryForm.dateRange = [
    new Date().toISOString().split("T")[0],
    new Date().toISOString().split("T")[0]
  ];
  queryForm.status = "";
  handleQuery();
};

// 分页改变
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleQuery();
};

// 每页显示数量改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  handleQuery();
};

// 详情展示
const showDetail = ref(false);
const currentRegistration = ref<BQRegistrationEntityType | null>(null);

// 操作按钮
const handleView = (row: BQRegistrationEntityType) => {
  currentRegistration.value = row;
  showDetail.value = true;
};

// 列表中的退号功能
const handleCancel = async (row: BQRegistrationEntityType) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要为患者"${row.patient}"办理退号吗？退号后将无法恢复。`,
      "退号确认",
      {
        confirmButtonText: "确认退号",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true
      }
    );

    // 用户确认后，调用退号接口
    loading.value = true;
    const res = await refundRegistrationApi(row.id);

    if (res.code === 0) {
      ElMessage.success("退号成功");
      // 重置状态筛选为全部，确保显示完整的挂号列表
      queryForm.status = "";
      // 刷新列表
      handleQuery();
    } else {
      ElMessage.error(res.errMsg || "退号失败");
    }
  } catch (error: any) {
    // 用户取消操作或接口异常
    if (error !== "cancel") {
      ElMessage.error(error?.message || "退号操作失败");
    }
  } finally {
    loading.value = false;
  }
};

const handleDetailBack = () => {
  showDetail.value = false;
};

// 处理详情页退号后的刷新（重置状态筛选为全部）
const handleDetailRefresh = () => {
  // 重置状态筛选为全部，确保显示完整的挂号列表
  queryForm.status = "";
  // 刷新列表
  handleQuery();
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    updateOffsetBottom();
  });
  loadFormOptions();
});
</script>

<template>
  <div class="registration-container">
    <!-- 标签页 -->
    <el-tabs
      v-model="activeTab"
      class="registration-tabs"
      @tab-click="handleTabChange"
    >
      <!-- 新增挂号 -->
      <el-tab-pane label="新增挂号" name="new">
        <div class="tab-content">
          <el-form
            ref="registrationFormRef"
            :model="registrationForm"
            :rules="registrationRules"
            label-width="100px"
            class="registration-form"
          >
            <div class="form-layout">
              <!-- 左侧：患者信息 -->
              <div class="form-left">
                <BqPatientBasicInfo
                  ref="patientBasicInfoRef"
                  :show-allergy="false"
                  :collapse-on-select="false"
                  :show-toolbar="true"
                  @user-select="handlePatientChange"
                  @save="handlePatientSave"
                />
              </div>
              <!-- 右侧：挂号信息 -->
              <div class="form-right">
                <div class="section-title-bar">
                  <span class="title-accent" />
                  <span class="title-text">挂号信息</span>
                </div>

                <div class="form-body">
                  <el-form-item label="科室" prop="department">
                    <el-select
                      v-model="registrationForm.department"
                      placeholder="请选择科室"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in departmentOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="医生" prop="doctor">
                    <el-select
                      v-model="registrationForm.doctor"
                      placeholder="请选择医生"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in doctorOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="项目" prop="item">
                    <el-select
                      v-model="registrationForm.item"
                      placeholder="请选择项目"
                      class="full-width"
                      @change="handleItemChange"
                    >
                      <el-option
                        v-for="item in itemOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="应收费用">
                    <span class="fee-text"
                      >{{ registrationForm.receivable.toFixed(2) }}元</span
                    >
                  </el-form-item>

                  <el-form-item label="实收" prop="actual">
                    <div class="actual-input-group">
                      <el-input
                        v-model="registrationForm.actual"
                        type="number"
                        placeholder=""
                        class="actual-input"
                      />
                      <span class="unit-label">元</span>
                    </div>
                  </el-form-item>

                  <el-form-item label="支付方式" prop="paymentMethod">
                    <el-select
                      v-model="registrationForm.paymentMethod"
                      placeholder="请选择支付方式"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in paymentOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>

                  <!-- 底部按钮 -->
                  <div class="form-actions">
                    <el-button type="primary" @click="handleRegistration">
                      挂号收费
                    </el-button>
                    <!-- <el-button @click="handleReset">重置</el-button> -->
                  </div>
                </div>
              </div>
            </div>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 挂号列表 -->
      <el-tab-pane label="挂号列表" name="list" lazy>
        <div class="tab-content">
          <!-- 详情覆盖层 -->
          <RegistrationDetail
            v-if="showDetail && currentRegistration"
            :registration="currentRegistration"
            class="tab-detail-overlay"
            @back="handleDetailBack"
            @refresh="handleDetailRefresh"
          />

          <!-- 列表（详情展示时隐藏） -->
          <template v-if="!showDetail">
            <el-form
              ref="queryFormRef"
              :inline="true"
              :model="queryForm"
              class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
            >
              <el-form-item label="患者姓名" prop="patientName">
                <el-input
                  v-model="queryForm.patientName"
                  placeholder="输入姓名模糊搜索"
                  clearable
                  class="!w-[180px]"
                />
              </el-form-item>

              <el-form-item label="时间" prop="dateRange">
                <el-date-picker
                  v-model="queryForm.dateRange"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="!w-[280px]"
                />
              </el-form-item>

              <el-form-item label="挂号状态" prop="status">
                <el-select
                  v-model="queryForm.status"
                  placeholder="全部"
                  clearable
                  class="!w-[120px]"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待接诊" value="待接诊" />
                  <el-option label="已接诊" value="已接诊" />
                  <el-option label="已退号" value="已退号" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :icon="useRenderIcon('ri:search-line')"
                  :loading="loading"
                  @click="handleQuery"
                >
                  查询
                </el-button>
                <el-button
                  :icon="useRenderIcon('ri:refresh-line')"
                  @click="handleResetQuery"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>

            <div
              ref="contentRef"
              class="w-full"
              :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
            >
              <PureTableBar
                :class="['w-full']"
                style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                title="挂号列表"
                :columns="columns"
                @refresh="handleQuery"
              >
                <template #buttons>
                  <el-button
                    type="primary"
                    :icon="useRenderIcon('ri:export-line')"
                  >
                    导出
                  </el-button>
                </template>
                <template #default="slotProps">
                  <pure-table
                    ref="tableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="loading"
                    :size="slotProps?.size ?? 'default'"
                    adaptive
                    border
                    stripe
                    :data="registrationList"
                    row-key="id"
                    :columns="slotProps?.dynamicColumns ?? columns"
                    :pagination="pagination"
                    :paginationSmall="slotProps?.size === 'small'"
                    :header-cell-style="{
                      color: 'var(--el-text-color-primary)'
                    }"
                    @page-size-change="handleSizeChange"
                    @page-current-change="handlePageChange"
                  >
                    <template #operation="{ row }">
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="slotProps?.size ?? 'default'"
                        @click="handleView(row)"
                      >
                        查看
                      </el-button>
                      <el-button
                        v-if="row.status !== '已退号'"
                        class="reset-margin"
                        link
                        type="danger"
                        :size="slotProps?.size ?? 'default'"
                        @click="handleCancel(row)"
                      >
                        退号
                      </el-button>
                    </template>
                  </pure-table>
                </template>
              </PureTableBar>
            </div>
          </template>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 8px 8px 0 8px !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.registration-container {
  height: 100%;
  padding: 0;

  .registration-tabs {
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
    height: calc(100vh - 166px);
    padding: 20px;
    background-color: white;
    overflow: hidden;
    position: relative;

    .tab-detail-overlay {
      position: absolute;
      inset: 0;
      z-index: 10;
      background-color: #fff;
    }

    .registration-form {
      background-color: #fff;
      padding: 0;
      .form-layout {
        display: flex;
        gap: 0;

        .form-left,
        .form-right {
          flex: 1;
        }

        .form-right {
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          margin-left: 20px;
          display: flex;
          flex-direction: column;

          .section-title-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-bottom: 1px solid #e4e7ed;
            background: #fafafa;

            .title-accent {
              width: 4px;
              height: 16px;
              background-color: #409eff;
              border-radius: 2px;
            }

            .title-text {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
            }
          }

          .form-body {
            padding: 16px 24px 20px;
            display: flex;
            flex-direction: column;
            flex: 1;

            .form-actions {
              margin-top: auto;
              padding: 20px 0 0;
              border-top: 1px solid #e4e7ed;
              text-align: center;

              .el-button {
                width: 150px;
              }
            }
          }
        }
      }

      .full-width {
        width: 100%;
      }

      .age-input-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .age-input {
          width: 80px;
        }

        .age-unit {
          width: 70px;
        }

        .age-label {
          color: #606266;
        }
      }

      .fee-text {
        color: #f56c6c;
        font-size: 16px;
        font-weight: 600;
      }

      .actual-input-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .actual-input {
          width: 200px;
        }

        .unit-label {
          color: #606266;
        }
      }
    }
  }

  .main {
    height: 100%;
    display: flex;
    flex-direction: column;

    .search-form {
      flex-shrink: 0;
    }

    > div:last-child {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
