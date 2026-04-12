<!--
  - 版权声明 Copyright (c) 2026。
  - 版权所有者： [缩微存储管理系统]
  - 首创日期： 2026年4月11日
  -->

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { useWindowSize } from "@vueuse/core";
import { ArrowDown, Search, Close, Plus } from "@element-plus/icons-vue";

defineOptions({
  name: "DoctorWorkbench"
});

const activeTab = ref("medical-record");
const tableRef = ref();
const contentRef = ref();
const basicFormRef = ref();

// 动态计算表格底部偏移量
const { height: windowHeight } = useWindowSize();
const tableOffsetBottom = ref(110);

// ==================== 基本信息表单 ====================
const basicForm = reactive({
  visitType: 1,
  patientId: "",
  patientName: "",
  gender: 1,
  ageYears: "",
  ageMonths: "",
  ageUnit: "岁",
  idCard: "",
  weight: "",
  contact: "",
  province: "",
  city: "",
  district: "",
  address: "",
  allergyHistory: 1,
  allergyDetail: ""
});

const patientOptions = ref([
  { label: "张三 - 13800138000", value: "1" },
  { label: "李四 - 13900139000", value: "2" },
  { label: "王五 - 13700137000", value: "3" }
]);

const ageUnitOptions = ref([
  { label: "岁", value: "岁" },
  { label: "月", value: "月" },
  { label: "天", value: "天" }
]);

const provinceOptions = ref([
  { label: "广东省", value: "440000" },
  { label: "北京市", value: "110000" },
  { label: "上海市", value: "310000" }
]);

const cityOptions = ref([
  { label: "茂名市", value: "440900" },
  { label: "广州市", value: "440100" },
  { label: "深圳市", value: "440300" }
]);

const districtOptions = ref([
  { label: "高州市", value: "440981" },
  { label: "茂南区", value: "440902" },
  { label: "电白区", value: "440904" }
]);

const handlePatientChange = (value: string) => {
  const patient = patientOptions.value.find(p => p.value === value);
  if (patient) {
    // TODO: 从后端获取患者详细信息并填充
  }
};

// 患者选择弹出框
const patientPopoverVisible = ref(false);
const patientSearchText = ref("");
const patientTableData = ref([
  { id: "2420153", name: "阿婆", gender: "女", age: "93岁0月", contact: "", idCard: "" },
  { id: "2419824", name: "车梦儿", gender: "女", age: "31岁0月", contact: "13532665174", idCard: "" },
  { id: "2419655", name: "李化", gender: "男", age: "43岁0月", contact: "18212635054", idCard: "" },
  { id: "2419627", name: "王翠花", gender: "女", age: "47岁0月", contact: "", idCard: "" }
]);

const patientPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 6857
});

// 打开患者选择弹出框
const openPatientDialog = () => {
  patientSearchText.value = basicForm.patientName || "";
  // TODO: 根据 patientSearchText 触发查询
  patientPopoverVisible.value = true;
};
const handleSelectPatient = (row: any) => {
  basicForm.patientId = row.id;
  basicForm.patientName = row.name;
  basicForm.gender = row.gender === "男" ? 1 : 0;
  // TODO: 填充其他字段
  patientPopoverVisible.value = false;
  ElMessage.success(`已选择患者: ${row.name}`);
};

// 患者分页
const handlePatientPageChange = (page: number) => {
  patientPagination.currentPage = page;
  // TODO: 加载对应页数据
};

const handlePatientSizeChange = (size: number) => {
  patientPagination.pageSize = size;
  // TODO: 重新加载数据
};

// ==================== 病历信息表单 ====================
const medicalRecordFormRef = ref();
const medicalRecordForm = reactive({
  chiefComplaint: "",
  presentIllness: "",
  pastHistory: "",
  allergyHistory: 1,
  allergyDetail: "",
  personalHistory: "",
  marriageHistory: "",
  familyHistory: "",
  travelHistory: "",
  contactHistory: "",
  temperature: "",
  heartRate: "",
  respiration: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  otherExamination: "",
  diagnosis: "",
  diagnoses: [],
  treatmentAdvice: ""
});

// ==================== 医嘱信息表单 ====================
const medicalOrderFormRef = ref();
const medicalOrderForm = reactive({
  diagnosis: "",
  diagnoses: [],
  prescriptionType: "western",
  prescriptionGroups: [
    {
      name: "处方1",
      items: []
    }
  ],
  currentGroup: 0,
  newItem: "",
  additionalFees: [
    { name: "诊疗费", amount: 5 }
  ]
});

const prescriptionTabs = ref([
  { label: "西/成药处方", value: "western" },
  { label: "中药处方", value: "chinese" },
  { label: "检查检验项目", value: "exam" },
  { label: "处置项目", value: "treatment" }
]);

// 监听容器高度变化，动态计算 offsetBottom
const updateOffsetBottom = () => {
  const viewportHeight = windowHeight.value;
  tableOffsetBottom.value = 110;
};

// 监听标签页切换
const handleTabChange = () => {
  setTimeout(() => {
    updateOffsetBottom();
  }, 200);
};

// BMJ临床实践指导
const handleBMJGuide = () => {
  ElMessage.info("打开BMJ临床实践指导");
};

// 保存
const handleSave = () => {
  ElMessage.success("保存成功");
};

// 打印病历
const handlePrint = () => {
  ElMessage.info("打印病历");
};

// 另存为病历模板
const handleSaveAsTemplate = () => {
  ElMessage.info("另存为病历模板");
};

// 提交医嘱
const handleSubmit = () => {
  ElMessage.success("提交成功");
};

// 打印处方
const handlePrintPrescription = () => {
  ElMessage.info("打印处方");
};

// 另存为处方模板
const handleSaveAsPrescriptionTemplate = () => {
  ElMessage.info("另存为处方模板");
};

// 收费
const handleCharge = () => {
  ElMessage.info("收费");
};

// 结束就诊
const handleEndVisit = () => {
  ElMessage.warning("结束就诊");
};

// 查看历史病历
const handleViewHistory = () => {
  ElMessage.info("查看历史病历");
};

// 调用病历模板
const handleCallTemplate = () => {
  ElMessage.info("调用病历模板");
};

// 查看历史处方
const handleViewHistoryPrescription = () => {
  ElMessage.info("查看历史处方");
};

// 调用处方模板
const handleCallPrescriptionTemplate = () => {
  ElMessage.info("调用处方模板");
};

// 添加处方组
const addPrescriptionGroup = () => {
  medicalOrderForm.prescriptionGroups.push({
    name: `处方${medicalOrderForm.prescriptionGroups.length + 1}`,
    items: []
  });
  medicalOrderForm.currentGroup = medicalOrderForm.prescriptionGroups.length - 1;
};

// 删除处方组
const removePrescriptionGroup = (index: number) => {
  if (medicalOrderForm.prescriptionGroups.length > 1) {
    medicalOrderForm.prescriptionGroups.splice(index, 1);
    if (medicalOrderForm.currentGroup >= medicalOrderForm.prescriptionGroups.length) {
      medicalOrderForm.currentGroup = medicalOrderForm.prescriptionGroups.length - 1;
    }
  }
};

// 获取处方金额
const getPrescriptionAmount = () => {
  return 0.00;
};

// 添加费用
const handleAddFee = () => {
  ElMessage.info("添加费用");
};

// 删除费用
const removeFee = (index: number) => {
  medicalOrderForm.additionalFees.splice(index, 1);
};

// 获取总金额
const getTotalAmount = () => {
  const feeTotal = medicalOrderForm.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  return feeTotal;
};

// ==================== 病历信息 ====================
const medicalRecordColumns = ref([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "就诊时间", prop: "visitTime", minWidth: 180 },
  { label: "主诉", prop: "complaint", minWidth: 200 },
  { label: "诊断", prop: "diagnosis", minWidth: 200 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "操作", fixed: "right", width: 150, slot: "medicalRecordOperation" }
]);

const medicalRecordList = ref([]);

const medicalRecordPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 医嘱信息 ====================
const medicalOrderColumns = ref([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "医嘱类型", prop: "orderType", minWidth: 120 },
  { label: "医嘱内容", prop: "orderContent", minWidth: 200 },
  { label: "剂量", prop: "dosage", minWidth: 100 },
  { label: "用法", prop: "usage", minWidth: 120 },
  { label: "频次", prop: "frequency", minWidth: 100 },
  { label: "开嘱医生", prop: "doctor", minWidth: 120 },
  { label: "开嘱时间", prop: "orderTime", minWidth: 180 },
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 150, slot: "medicalOrderOperation" }
]);

const medicalOrderList = ref([]);

const medicalOrderPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 附件管理 ====================
const attachmentColumns = ref([
  { label: "序号", prop: "index", minWidth: 80, slot: "index" },
  { label: "附件名称", prop: "fileName", minWidth: 200 },
  { label: "附件类型", prop: "fileType", minWidth: 120 },
  { label: "文件大小", prop: "fileSize", minWidth: 120 },
  { label: "上传时间", prop: "uploadTime", minWidth: 180 },
  { label: "上传人", prop: "uploader", minWidth: 120 },
  { label: "操作", fixed: "right", width: 200, slot: "attachmentOperation" }
]);

const attachmentList = ref([]);

const attachmentPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// ==================== 方法 ====================
// 查询数据
const handleQuery = () => {
  // TODO: 根据不同页签查询对应数据
};

// 分页改变
const handleMedicalRecordPageChange = (page: number) => {
  medicalRecordPagination.currentPage = page;
  handleQuery();
};

const handleMedicalRecordSizeChange = (size: number) => {
  medicalRecordPagination.pageSize = size;
  handleQuery();
};

const handleMedicalOrderPageChange = (page: number) => {
  medicalOrderPagination.currentPage = page;
  handleQuery();
};

const handleMedicalOrderSizeChange = (size: number) => {
  medicalOrderPagination.pageSize = size;
  handleQuery();
};

const handleAttachmentPageChange = (page: number) => {
  attachmentPagination.currentPage = page;
  handleQuery();
};

const handleAttachmentSizeChange = (size: number) => {
  attachmentPagination.pageSize = size;
  handleQuery();
};

// 查看病历详情
const handleViewMedicalRecord = (row: any) => {
  ElMessage.info(`查看病历详情`);
};

// 查看医嘱详情
const handleViewMedicalOrder = (row: any) => {
  ElMessage.info(`查看医嘱详情`);
};

// 停止医嘱
const handleStopOrder = (row: any) => {
  ElMessage.warning(`停止医嘱`);
};

// 预览附件
const handlePreviewAttachment = (row: any) => {
  ElMessage.info(`预览附件: ${row.fileName}`);
};

// 下载附件
const handleDownloadAttachment = (row: any) => {
  ElMessage.info(`下载附件: ${row.fileName}`);
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    updateOffsetBottom();
  });
  handleQuery();
});
</script>

<template>
  <div class="doctor-container">
    <!-- 上半部分：页签头和内容区 -->
    <div class="doctor-content">
      <!-- 标签页 -->
      <el-tabs
        v-model="activeTab"
        class="doctor-tabs"
        @tab-click="handleTabChange"
      >
        <!-- 病历信息 -->
        <el-tab-pane label="病历信息" name="medical-record">
          <div class="tab-content">
            <!-- 基本信息表单 -->
            <div class="basic-info-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">基本信息</span>
              </div>

              <el-form
                ref="basicFormRef"
                :model="basicForm"
                label-width="100px"
                class="basic-form"
              >
                <!-- 就诊类型 -->
                <el-form-item>
                  <el-radio-group v-model="basicForm.visitType">
                    <el-radio :value="1">初诊</el-radio>
                    <el-radio :value="2">复诊</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 姓名和性别 -->
                <el-form-item label="姓名" class="form-row">
                  <el-popover
                    v-model:visible="patientPopoverVisible"
                    placement="bottom-start"
                    :width="1100"
                    trigger="click"
                  >
                    <template #reference>
                      <el-input
                        v-model="basicForm.patientName"
                        placeholder="姓名、联系方式"
                        class="patient-input"
                      >
                        <template #suffix>
                          <el-icon class="el-input__icon"><ArrowDown /></el-icon>
                        </template>
                      </el-input>
                    </template>

                    <!-- 患者表格 -->
                    <el-table
                      :data="patientTableData"
                      border
                      stripe
                      height="400px"
                      @row-click="handleSelectPatient"
                      style="cursor: pointer"
                    >
                      <el-table-column prop="id" label="ID" width="120" />
                      <el-table-column prop="name" label="姓名" width="120" />
                      <el-table-column prop="gender" label="性别" width="80" />
                      <el-table-column prop="age" label="年龄" width="120" />
                      <el-table-column prop="contact" label="联系方式" min-width="150" />
                      <el-table-column prop="idCard" label="身份证" min-width="200" />
                    </el-table>

                    <!-- 分页 -->
                    <div class="patient-pagination">
                      <div class="pagination-left">
                        <span>每页显示</span>
                        <el-select
                          v-model="patientPagination.pageSize"
                          size="small"
                          class="page-size-select"
                          @change="handlePatientSizeChange"
                        >
                          <el-option :value="20" label="20" />
                          <el-option :value="50" label="50" />
                          <el-option :value="100" label="100" />
                        </el-select>
                        <span>共 {{ Math.ceil(patientPagination.total / patientPagination.pageSize) }} 页，跳转至</span>
                        <el-input-number
                          v-model="patientPagination.currentPage"
                          :min="1"
                          :max="Math.ceil(patientPagination.total / patientPagination.pageSize)"
                          size="small"
                          controls-position="right"
                          class="page-jump-input"
                        />
                        <el-button type="primary" size="small" @click="handlePatientPageChange(patientPagination.currentPage)">
                          确定
                        </el-button>
                        <el-button
                          size="small"
                          :disabled="patientPagination.currentPage === 1"
                          @click="handlePatientPageChange(patientPagination.currentPage - 1)"
                        >
                          上一页
                        </el-button>
                        <el-button
                          v-for="page in Math.min(5, Math.ceil(patientPagination.total / patientPagination.pageSize))"
                          :key="page"
                          :type="page === patientPagination.currentPage ? 'primary' : 'default'"
                          size="small"
                          @click="handlePatientPageChange(page)"
                        >
                          {{ page }}
                        </el-button>
                        <el-button
                          size="small"
                          :disabled="patientPagination.currentPage >= Math.ceil(patientPagination.total / patientPagination.pageSize)"
                          @click="handlePatientPageChange(patientPagination.currentPage + 1)"
                        >
                          下一页
                        </el-button>
                      </div>
                      <div class="pagination-right">
                        显示1到{{ patientPagination.pageSize }}，共{{ patientPagination.total }}条记录
                      </div>
                    </div>
                  </el-popover>

                  <span class="form-label-inline">性别</span>
                  <el-radio-group
                    v-model="basicForm.gender"
                    class="inline-radio"
                  >
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="0">女</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 年龄 -->
                <el-form-item label="*年龄" class="form-row">
                  <el-input
                    v-model="basicForm.ageYears"
                    type="number"
                    placeholder=""
                    class="age-input"
                  />
                  <el-select
                    v-model="basicForm.ageUnit"
                    class="age-unit-select"
                  >
                    <el-option
                      v-for="item in ageUnitOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-input
                    v-model="basicForm.ageMonths"
                    type="number"
                    placeholder="0"
                    class="age-months-input"
                  />
                  <span class="age-label">月</span>
                </el-form-item>

                <!-- 身份证 -->
                <el-form-item label="身份证" class="form-row">
                  <el-input
                    v-model="basicForm.idCard"
                    placeholder=""
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 体重和联系方式 -->
                <el-form-item label="体重(kg)" class="form-row">
                  <el-input
                    v-model="basicForm.weight"
                    type="number"
                    placeholder=""
                    class="form-input-medium"
                  />
                  <span class="form-label-inline">联系方式</span>
                  <el-input
                    v-model="basicForm.contact"
                    placeholder="输入手机号或者固号"
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 地址 -->
                <el-form-item label="地址" class="form-row">
                  <el-select
                    v-model="basicForm.province"
                    placeholder="请选择省份"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in provinceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-model="basicForm.city"
                    placeholder="请选择城市"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in cityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-model="basicForm.district"
                    placeholder="请选择区县"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in districtOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <span class="form-label-inline">详细地址</span>
                  <el-input
                    v-model="basicForm.address"
                    placeholder=""
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 过敏史 -->
                <el-form-item label="过敏史" class="form-row">
                  <el-radio-group
                    v-model="basicForm.allergyHistory"
                    class="inline-radio"
                  >
                    <el-radio :value="1">是</el-radio>
                    <el-radio :value="0">否认</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 过敏详情 -->
                <el-form-item
                  v-if="basicForm.allergyHistory === 1"
                  class="form-row"
                >
                  <el-input
                    v-model="basicForm.allergyDetail"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入过敏详情"
                    class="allergy-textarea"
                  />
                </el-form-item>

                <!-- 底部分割线 -->
                <el-form-item class="form-row form-divider">
                  <div class="divider-line" />
                </el-form-item>
              </el-form>
            </div>
            <!-- 水平分割线 -->
            <div class="horizontal-divider">
              <div class="divider-line" />
            </div>
            <!-- 病历信息 -->
            <div class="medical-record-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">病历信息</span>
              </div>

              <el-form
                ref="medicalRecordFormRef"
                :model="medicalRecordForm"
                label-width="100px"
                class="medical-record-form"
              >
                <!-- 主诉 -->
                <el-form-item label="主诉" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.chiefComplaint"
                    placeholder=""
                    class="form-input-full"
                  />
                  <el-button type="primary" @click="handleViewHistory">
                    历史病历
                  </el-button>
                  <el-button type="primary" @click="handleCallTemplate">
                    调用病历模板
                  </el-button>
                </el-form-item>

                <!-- 现病史 -->
                <el-form-item label="现病史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.presentIllness"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 既往史 -->
                <el-form-item label="既往史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.pastHistory"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 过敏史 -->
                <el-form-item label="过敏史" class="form-row">
                  <el-radio-group
                    v-model="medicalRecordForm.allergyHistory"
                    class="inline-radio"
                  >
                    <el-radio :value="1">是</el-radio>
                    <el-radio :value="0">否认</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 过敏详情 -->
                <el-form-item
                  v-if="medicalRecordForm.allergyHistory === 1"
                  class="form-row"
                >
                  <el-input
                    v-model="medicalRecordForm.allergyDetail"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入过敏详情"
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 个人史 -->
                <el-form-item label="个人史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.personalHistory"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 婚育史 -->
                <el-form-item label="婚育史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.marriageHistory"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 家族史 -->
                <el-form-item label="家族史" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.familyHistory"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 旅行史 -->
                <el-form-item label="旅行史" class="form-row label-red">
                  <el-input
                    v-model="medicalRecordForm.travelHistory"
                    type="textarea"
                    :rows="2"
                    class="form-textarea"
                  />
                </el-form-item>

                <!-- 接触史 -->
                <el-form-item label="接触史" class="form-row label-red">
                  <el-input
                    v-model="medicalRecordForm.contactHistory"
                    type="textarea"
                    :rows="2"
                    class="form-textarea"
                  />
                </el-form-item>

                <!-- 体格检查 -->
                <el-form-item label="体格检查" class="form-row">
                  <span class="exam-label">体温/T</span>
                  <el-input
                    v-model="medicalRecordForm.temperature"
                    type="number"
                    class="exam-input"
                  />
                  <span class="exam-unit">°C</span>

                  <span class="exam-label">心率/P</span>
                  <el-input
                    v-model="medicalRecordForm.heartRate"
                    type="number"
                    placeholder="次/分"
                    class="exam-input"
                  />
                  <span class="exam-unit">次/分</span>

                  <span class="exam-label">呼吸/R</span>
                  <el-input
                    v-model="medicalRecordForm.respiration"
                    type="number"
                    placeholder="次/分"
                    class="exam-input"
                  />
                  <span class="exam-unit">次/分</span>

                  <span class="exam-label">血压</span>
                  <el-input
                    v-model="medicalRecordForm.bloodPressureSystolic"
                    type="number"
                    class="exam-input-small"
                  />
                  <span class="exam-divider">/</span>
                  <el-input
                    v-model="medicalRecordForm.bloodPressureDiastolic"
                    type="number"
                    class="exam-input-small"
                  />
                  <span class="exam-unit">mmHg</span>
                </el-form-item>

                <!-- 其他检查 -->
                <el-form-item label="其他检查" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.otherExamination"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>

                <!-- 输入诊断 -->
                <el-form-item label="输入诊断" class="form-row">
                  <el-select
                    v-model="medicalRecordForm.diagnosis"
                    placeholder="请选择"
                    filterable
                    class="diagnosis-select"
                  >
                    <el-option
                      label="高血压"
                      value="1"
                    />
                    <el-option
                      label="糖尿病"
                      value="2"
                    />
                    <el-option
                      label="冠心病"
                      value="3"
                    />
                  </el-select>
                </el-form-item>

                <!-- 诊断列表 -->
                <el-form-item label="诊断" class="form-row">
                  <div class="diagnosis-table">
                    <div class="table-header">
                      <div class="col-disease">疾病诊断</div>
                      <div class="col-action">操作</div>
                    </div>
                    <div class="table-body">
                      <div
                        v-if="medicalRecordForm.diagnoses.length === 0"
                        class="empty-text"
                      >
                        暂无诊断
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 治疗建议 -->
                <el-form-item label="治疗建议" class="form-row">
                  <el-input
                    v-model="medicalRecordForm.treatmentAdvice"
                    placeholder=""
                    class="form-input-full"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 医嘱信息 -->
        <el-tab-pane label="医嘱信息" name="medical-order">
          <div class="tab-content">
            <!-- 基本信息表单 -->
            <div class="basic-info-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">基本信息</span>
              </div>

              <el-form
                ref="basicFormRef"
                :model="basicForm"
                label-width="100px"
                class="basic-form"
              >
                <!-- 就诊类型 -->
                <el-form-item>
                  <el-radio-group v-model="basicForm.visitType">
                    <el-radio :value="1">初诊</el-radio>
                    <el-radio :value="2">复诊</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 姓名和性别 -->
                <el-form-item label="姓名" class="form-row">
                  <el-popover
                    v-model:visible="patientPopoverVisible"
                    placement="bottom-start"
                    :width="1100"
                    trigger="click"
                  >
                    <template #reference>
                      <el-input
                        v-model="basicForm.patientName"
                        placeholder="姓名、联系方式"
                        class="patient-input"
                      >
                        <template #suffix>
                          <el-icon class="el-input__icon"><ArrowDown /></el-icon>
                        </template>
                      </el-input>
                    </template>

                    <!-- 患者表格 -->
                    <el-table
                      :data="patientTableData"
                      border
                      stripe
                      height="400px"
                      @row-click="handleSelectPatient"
                      style="cursor: pointer"
                    >
                      <el-table-column prop="id" label="ID" width="120" />
                      <el-table-column prop="name" label="姓名" width="120" />
                      <el-table-column prop="gender" label="性别" width="80" />
                      <el-table-column prop="age" label="年龄" width="120" />
                      <el-table-column prop="contact" label="联系方式" min-width="150" />
                      <el-table-column prop="idCard" label="身份证" min-width="200" />
                    </el-table>

                    <!-- 分页 -->
                    <div class="patient-pagination">
                      <div class="pagination-left">
                        <span>每页显示</span>
                        <el-select
                          v-model="patientPagination.pageSize"
                          size="small"
                          class="page-size-select"
                          @change="handlePatientSizeChange"
                        >
                          <el-option :value="20" label="20" />
                          <el-option :value="50" label="50" />
                          <el-option :value="100" label="100" />
                        </el-select>
                        <span>共 {{ Math.ceil(patientPagination.total / patientPagination.pageSize) }} 页，跳转至</span>
                        <el-input-number
                          v-model="patientPagination.currentPage"
                          :min="1"
                          :max="Math.ceil(patientPagination.total / patientPagination.pageSize)"
                          size="small"
                          controls-position="right"
                          class="page-jump-input"
                        />
                        <el-button type="primary" size="small" @click="handlePatientPageChange(patientPagination.currentPage)">
                          确定
                        </el-button>
                        <el-button
                          size="small"
                          :disabled="patientPagination.currentPage === 1"
                          @click="handlePatientPageChange(patientPagination.currentPage - 1)"
                        >
                          上一页
                        </el-button>
                        <el-button
                          v-for="page in Math.min(5, Math.ceil(patientPagination.total / patientPagination.pageSize))"
                          :key="page"
                          :type="page === patientPagination.currentPage ? 'primary' : 'default'"
                          size="small"
                          @click="handlePatientPageChange(page)"
                        >
                          {{ page }}
                        </el-button>
                        <el-button
                          size="small"
                          :disabled="patientPagination.currentPage >= Math.ceil(patientPagination.total / patientPagination.pageSize)"
                          @click="handlePatientPageChange(patientPagination.currentPage + 1)"
                        >
                          下一页
                        </el-button>
                      </div>
                      <div class="pagination-right">
                        显示1到{{ patientPagination.pageSize }}，共{{ patientPagination.total }}条记录
                      </div>
                    </div>
                  </el-popover>

                  <span class="form-label-inline">性别</span>
                  <el-radio-group
                    v-model="basicForm.gender"
                    class="inline-radio"
                  >
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="0">女</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 年龄 -->
                <el-form-item label="*年龄" class="form-row">
                  <el-input
                    v-model="basicForm.ageYears"
                    type="number"
                    placeholder=""
                    class="age-input"
                  />
                  <el-select
                    v-model="basicForm.ageUnit"
                    class="age-unit-select"
                  >
                    <el-option
                      v-for="item in ageUnitOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-input
                    v-model="basicForm.ageMonths"
                    type="number"
                    placeholder="0"
                    class="age-months-input"
                  />
                  <span class="age-label">月</span>
                </el-form-item>

                <!-- 身份证 -->
                <el-form-item label="身份证" class="form-row">
                  <el-input
                    v-model="basicForm.idCard"
                    placeholder=""
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 体重和联系方式 -->
                <el-form-item label="体重(kg)" class="form-row">
                  <el-input
                    v-model="basicForm.weight"
                    type="number"
                    placeholder=""
                    class="form-input-medium"
                  />
                  <span class="form-label-inline">联系方式</span>
                  <el-input
                    v-model="basicForm.contact"
                    placeholder="输入手机号或者固号"
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 地址 -->
                <el-form-item label="地址" class="form-row">
                  <el-select
                    v-model="basicForm.province"
                    placeholder="请选择省份"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in provinceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-model="basicForm.city"
                    placeholder="请选择城市"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in cityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-model="basicForm.district"
                    placeholder="请选择区县"
                    class="address-select"
                  >
                    <el-option
                      v-for="item in districtOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <span class="form-label-inline">详细地址</span>
                  <el-input
                    v-model="basicForm.address"
                    placeholder=""
                    class="form-input-medium"
                  />
                </el-form-item>

                <!-- 过敏史 -->
                <el-form-item label="过敏史" class="form-row">
                  <el-radio-group
                    v-model="basicForm.allergyHistory"
                    class="inline-radio"
                  >
                    <el-radio :value="1">是</el-radio>
                    <el-radio :value="0">否认</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 过敏详情 -->
                <el-form-item
                  v-if="basicForm.allergyHistory === 1"
                  class="form-row"
                >
                  <el-input
                    v-model="basicForm.allergyDetail"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入过敏详情"
                    class="allergy-textarea"
                  />
                </el-form-item>

                <!-- 底部分割线 -->
                <el-form-item class="form-row form-divider">
                  <div class="divider-line" />
                </el-form-item>
              </el-form>
            </div>
            <!-- 水平分割线 -->
            <div class="horizontal-divider">
              <div class="divider-line" />
            </div>
            <!-- 医嘱信息 -->
            <div class="medical-order-section">
              <div class="section-title">
                <span class="title-bar" />
                <span class="title-text">医嘱信息</span>
              </div>

              <el-form
                ref="medicalOrderFormRef"
                :model="medicalOrderForm"
                label-width="100px"
                class="medical-order-form"
              >
                <!-- 输入诊断 -->
                <el-form-item label="输入诊断" class="form-row">
                  <el-select
                    v-model="medicalOrderForm.diagnosis"
                    placeholder="请选择"
                    filterable
                    class="diagnosis-select"
                  >
                    <el-option label="高血压" value="1" />
                    <el-option label="糖尿病" value="2" />
                    <el-option label="冠心病" value="3" />
                  </el-select>
                  <el-button type="primary" @click="handleViewHistoryPrescription">
                    历史处方
                  </el-button>
                  <el-button type="primary" @click="handleCallPrescriptionTemplate">
                    调用处方模板
                  </el-button>
                </el-form-item>

                <!-- 诊断列表 -->
                <el-form-item label="诊断" class="form-row">
                  <div class="diagnosis-table">
                    <div class="table-header">
                      <div class="col-disease">疾病诊断</div>
                      <div class="col-action">操作</div>
                    </div>
                    <div class="table-body">
                      <div v-if="medicalOrderForm.diagnoses.length === 0" class="empty-text">
                        暂无诊断
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 处方 -->
                <el-form-item label="处方" class="form-row prescription-row">
                  <div class="prescription-container">
                    <!-- 处方类型标签页 -->
                    <div class="prescription-tabs">
                      <div
                        v-for="tab in prescriptionTabs"
                        :key="tab.value"
                        :class="['tab-item', { active: medicalOrderForm.prescriptionType === tab.value }]"
                        @click="medicalOrderForm.prescriptionType = tab.value"
                      >
                        {{ tab.label }}
                      </div>
                    </div>

                    <!-- 处方内容 -->
                    <div class="prescription-content">
                      <!-- 处方组标签 -->
                      <div class="prescription-group-header">
                        <div class="group-tags">
                          <span
                            v-for="(group, index) in medicalOrderForm.prescriptionGroups"
                            :key="index"
                            :class="['group-tag', { active: medicalOrderForm.currentGroup === index }]"
                            @click="medicalOrderForm.currentGroup = index"
                          >
                            {{ group.name }}
                            <el-icon v-if="medicalOrderForm.prescriptionGroups.length > 1" @click.stop="removePrescriptionGroup(index)"><Close /></el-icon>
                          </span>
                          <span class="add-group-btn" @click="addPrescriptionGroup">
                            <el-icon><Plus /></el-icon>
                          </span>
                        </div>
                      </div>

                      <!-- 处方明细表格 -->
                      <div class="prescription-table">
                        <div class="table-header">
                          <div class="col-operation">操作</div>
                          <div class="col-group">组号</div>
                          <div class="col-name">药品名称</div>
                          <div class="col-spec">规格</div>
                          <div class="col-dosage">单次用量</div>
                          <div class="col-usage">用法</div>
                          <div class="col-frequency">频率</div>
                          <div class="col-days">天数</div>
                          <div class="col-total">计价总量</div>
                          <div class="col-note">嘱托</div>
                          <div class="col-price">单价</div>
                          <div class="col-amount">金额</div>
                        </div>
                        <div class="table-body">
                          <div
                            v-if="medicalOrderForm.prescriptionGroups[medicalOrderForm.currentGroup]?.items?.length === 0"
                            class="empty-text"
                          >
                            暂无药品
                          </div>
                        </div>
                      </div>

                      <!-- 处方金额 -->
                      <div class="prescription-amount">
                        处方金额：¥ {{ getPrescriptionAmount().toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 新增项目 -->
                <el-form-item label="新增项目" class="form-row">
                  <el-select
                    v-model="medicalOrderForm.newItem"
                    placeholder="请选择"
                    filterable
                    class="new-item-select"
                  >
                    <el-option label="诊疗费" value="1" />
                    <el-option label="检查费" value="2" />
                  </el-select>
                </el-form-item>

                <!-- 附加费用 -->
                <el-form-item label="附加费用" class="form-row">
                  <el-button type="primary" @click="handleAddFee">
                    <el-icon><Plus /></el-icon>
                    点击添加
                  </el-button>
                  <span
                    v-for="(fee, index) in medicalOrderForm.additionalFees"
                    :key="index"
                    class="fee-tag"
                  >
                    {{ fee.name }} {{ fee.amount }}元
                    <el-icon @click="removeFee(index)"><Close /></el-icon>
                  </span>
                </el-form-item>

                <!-- 合计总金额 -->
                <el-form-item label="合计总金额" class="form-row total-amount-row">
                  <span class="total-amount-label">¥ {{ getTotalAmount().toFixed(2) }}</span>
                  <span class="total-amount">¥{{ getTotalAmount().toFixed(2) }}</span>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 附件管理 -->
        <el-tab-pane label="附件管理" name="attachment">
          <div class="tab-content">
            <!-- 内容区域 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 下半部分：固定在底部的操作面板 - 病历信息 -->
    <div v-if="activeTab === 'medical-record'" class="doctor-footer">
      <div class="footer-actions">
        <el-button type="primary" size="large" @click="handleSave">
          保存
        </el-button>
        <el-button type="primary" size="large" @click="handlePrint">
          打印病历
        </el-button>
        <el-button type="primary" size="large" plain @click="handleSaveAsTemplate">
          另存为病历模板
        </el-button>
      </div>
    </div>

    <!-- 下半部分：固定在底部的操作面板 - 医嘱信息 -->
    <div v-if="activeTab === 'medical-order'" class="doctor-footer">
      <div class="footer-actions">
        <el-button type="primary" size="large" @click="handleSubmit">
          提交
        </el-button>
        <el-button type="primary" size="large" @click="handleSave">
          保存
        </el-button>
        <el-button type="primary" size="large" @click="handlePrintPrescription">
          打印处方
        </el-button>
        <el-button type="primary" size="large" plain @click="handleSaveAsPrescriptionTemplate">
          另存为处方模板
        </el-button>
        <el-button type="warning" size="large" @click="handleCharge">
          收费
        </el-button>
        <el-button type="warning" size="large" @click="handleEndVisit">
          结束就诊
        </el-button>
      </div>
    </div>

    <!-- 附件管理页签底部隐藏 -->
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.doctor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: white;

  // 上半部分：内容区
  .doctor-content {
    flex: 1;
    overflow: hidden;

    .doctor-tabs {
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
        padding: 0;
      }
    }

    .tab-content {
      height: calc(100vh - 242px);
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      // 基本信息区块
      .basic-info-section {
        background-color: #fff;
        padding: 20px;

        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .title-bar {
            width: 4px;
            height: 18px;
            background-color: #409eff;
            margin-right: 8px;
            border-radius: 2px;
          }

          .title-text {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .basic-form {
          :deep(.el-form-item) {
            margin-bottom: 18px;

            .el-form-item__label {
              font-size: 14px;
              color: #606266;
            }
          }

          .form-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;

            .patient-select {
              width: 220px;
            }

            .patient-input {
              width: 220px;
              cursor: pointer;
            }

            .form-label-inline {
              margin-left: 20px;
              margin-right: 8px;
              color: #606266;
              font-size: 14px;
            }

            .inline-radio {
              display: flex;
              gap: 20px;
            }

            .age-input {
              width: 80px;
            }

            .age-unit-select {
              width: 70px;
            }

            .age-months-input {
              width: 60px;
            }

            .age-label {
              color: #606266;
              font-size: 14px;
            }

            .form-input-medium {
              width: 220px;
            }

            .address-select {
              width: 150px;
            }

            .allergy-textarea {
              width: 100%;
            }

            .form-divider {
              margin-top: 20px;
              margin-bottom: 0;

              .divider-line {
                width: 100%;
                height: 1px;
                background-color: #e4e7ed;
              }
            }
          }
        }
      }

      // 水平分割线
      .horizontal-divider {
        .divider-line {
          width: 100%;
          height: 1px;

          background-color: #afc5fc;
        }
      }

      // 病历信息区块
      .medical-record-section {
        background-color: #fff;
        padding: 20px;

        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .title-bar {
            width: 4px;
            height: 18px;
            background-color: #409eff;
            margin-right: 8px;
            border-radius: 2px;
          }

          .title-text {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .medical-record-form {
          :deep(.el-form-item) {
            margin-bottom: 18px;

            .el-form-item__label {
              font-size: 14px;
              color: #606266;
              line-height: 32px;
            }

            &.label-red {
              .el-form-item__label {
                color: #f56c6c;
              }
            }
          }

          .form-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;

            .form-input-full {
              flex: 1;
              min-width: 200px;
            }

            .form-textarea {
              width: 100%;
            }

            .inline-radio {
              display: flex;
              gap: 20px;
            }

            .exam-label {
              color: #606266;
              font-size: 14px;
              margin-right: 8px;
            }

            .exam-input {
              width: 100px;
            }

            .exam-input-small {
              width: 80px;
            }

            .exam-unit {
              color: #606266;
              font-size: 14px;
              margin: 0 8px;
            }

            .exam-divider {
              color: #606266;
              font-size: 14px;
              margin: 0 4px;
            }

            .diagnosis-select {
              width: 220px;
            }

            .diagnosis-table {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;

              .table-header {
                display: flex;
                background-color: #f5f7fa;
                padding: 12px;
                font-weight: 600;
                color: #606266;

                .col-disease {
                  flex: 1;
                }

                .col-action {
                  width: 100px;
                  text-align: center;
                }
              }

              .table-body {
                min-height: 60px;
                padding: 12px;

                .empty-text {
                  color: #909399;
                  font-size: 14px;
                  text-align: center;
                }
              }
            }
          }
        }
      }

      // 医嘱信息区块
      .medical-order-section {
        background-color: #fff;
        padding: 20px;

        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .title-bar {
            width: 4px;
            height: 18px;
            background-color: #409eff;
            margin-right: 8px;
            border-radius: 2px;
          }

          .title-text {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .medical-order-form {
          :deep(.el-form-item) {
            margin-bottom: 18px;

            .el-form-item__label {
              font-size: 14px;
              color: #606266;
              line-height: 32px;
            }
          }

          .form-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;

            .diagnosis-select {
              width: 220px;
            }

            .diagnosis-table {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;

              .table-header {
                display: flex;
                background-color: #f5f7fa;
                padding: 12px;
                font-weight: 600;
                color: #606266;

                .col-disease {
                  flex: 1;
                }

                .col-action {
                  width: 100px;
                  text-align: center;
                }
              }

              .table-body {
                min-height: 60px;
                padding: 12px;

                .empty-text {
                  color: #909399;
                  font-size: 14px;
                  text-align: center;
                }
              }
            }

            &.prescription-row {
              align-items: flex-start;
            }

            .prescription-container {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;
            }

            .prescription-tabs {
              display: flex;
              background-color: #f5f7fa;
              border-bottom: 1px solid #e4e7ed;

              .tab-item {
                padding: 10px 20px;
                font-size: 14px;
                color: #606266;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                  color: #409eff;
                }

                &.active {
                  background-color: #409eff;
                  color: #fff;
                }
              }
            }

            .prescription-content {
              background-color: #fff;
              padding: 16px;
            }

            .prescription-group-header {
              margin-bottom: 12px;

              .group-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .group-tag {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  padding: 6px 12px;
                  background-color: #f5f7fa;
                  border: 1px solid #e4e7ed;
                  border-radius: 4px;
                  font-size: 14px;
                  color: #606266;
                  cursor: pointer;
                  transition: all 0.3s;

                  &:hover {
                    border-color: #409eff;
                    color: #409eff;
                  }

                  &.active {
                    background-color: #409eff;
                    border-color: #409eff;
                    color: #fff;
                  }

                  .el-icon {
                    font-size: 12px;

                    &:hover {
                      opacity: 0.8;
                    }
                  }
                }

                .add-group-btn {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 32px;
                  height: 32px;
                  border: 1px dashed #409eff;
                  border-radius: 4px;
                  color: #409eff;
                  cursor: pointer;
                  transition: all 0.3s;

                  &:hover {
                    background-color: #ecf5ff;
                  }
                }
              }
            }

            .prescription-table {
              width: 100%;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              overflow: hidden;
              margin-bottom: 12px;

              .table-header {
                display: flex;
                background-color: #f5f7fa;
                padding: 10px 12px;
                font-weight: 600;
                color: #606266;
                font-size: 13px;

                .col-operation { width: 60px; }
                .col-group { width: 60px; }
                .col-name { flex: 1; min-width: 120px; }
                .col-spec { width: 100px; }
                .col-dosage { width: 100px; }
                .col-usage { width: 80px; }
                .col-frequency { width: 80px; }
                .col-days { width: 60px; }
                .col-total { width: 100px; }
                .col-note { width: 120px; }
                .col-price { width: 80px; }
                .col-amount { width: 80px; }
              }

              .table-body {
                min-height: 60px;
                padding: 12px;

                .empty-text {
                  color: #909399;
                  font-size: 14px;
                  text-align: center;
                }
              }
            }

            .prescription-amount {
              font-size: 14px;
              color: #606266;
              padding: 8px 0;
            }

            .new-item-select {
              width: 220px;
            }

            .fee-tag {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              background-color: #ecf5ff;
              border: 1px solid #b3d8ff;
              border-radius: 4px;
              font-size: 14px;
              color: #409eff;

              .el-icon {
                font-size: 12px;
                cursor: pointer;

                &:hover {
                  opacity: 0.8;
                }
              }
            }

            &.total-amount-row {
              .total-amount-label {
                font-size: 14px;
                color: #606266;
                margin-right: 20px;
              }

              .total-amount {
                font-size: 20px;
                font-weight: 700;
                color: #f56c6c;
              }
            }
          }
        }
      }
    }
  }

  // 下半部分：固定在底部的操作面板
  .doctor-footer {
    background-color: #fff;
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);

    .footer-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        min-width: 120px;
        height: 40px;
        font-size: 16px;

        // 蓝色按钮
        &.el-button--primary {
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;

          &:hover {
            background-color: #66b1ff;
            border-color: #66b1ff;
          }

          &:active {
            background-color: #3a8ee6;
            border-color: #3a8ee6;
          }

          &.is-plain {
            background-color: #fff;
            border-color: #409eff;
            color: #409eff;

            &:hover {
              background-color: #ecf5ff;
              border-color: #66b1ff;
              color: #66b1ff;
            }
          }
        }

        // 橙色按钮
        &.el-button--warning {
          background-color: #e6a23c;
          border-color: #e6a23c;
          color: #fff;

          &:hover {
            background-color: #ebb563;
            border-color: #ebb563;
          }

          &:active {
            background-color: #cf9236;
            border-color: #cf9236;
          }
        }
      }
    }
  }
}

// 患者选择对话框样式
.patient-search-bar {
  margin-bottom: 16px;

  .search-input {
    width: 300px;
  }
}

.patient-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;

  .pagination-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;

    .page-size-select {
      width: 80px;
    }

    .page-jump-input {
      width: 80px;
    }
  }

  .pagination-right {
    font-size: 14px;
    color: #909399;
  }
}
</style>
