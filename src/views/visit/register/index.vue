<!--
  - 版权声明 Copyright (c) 2026。
  - 版权所有者： [缩微存储管理系统]
  - 首创日期： 2026年4月11日
  -->

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import Refresh from "@iconify-icons/ep/refresh";
import type { FormInstance, FormRules } from "element-plus";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";
import { useEventListener, useWindowSize } from "@vueuse/core";
import PureTable from "@pureadmin/table";

// 标签页状态
const activeTab = ref("new");
const tableRef = ref();
const contentRef = ref();
const queryFormRef = ref();
const registrationFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

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
const handleTabChange = () => {
  // 延迟触发，确保 DOM 已渲染
  setTimeout(() => {
    updateOffsetBottom();
  }, 200);
};

// ==================== 新增挂号 ====================
// 表单引用

// 挂号表单数据
const registrationForm = reactive({
  patientId: "", // 患者ID（用于下拉选择）
  patientName: "", // 患者姓名
  idCard: "", // 身份证号码
  gender: 1, // 性别：1-男，0-女
  ageYears: 0, // 年龄-岁
  ageMonths: 0, // 年龄-月
  contact: "", // 联系方式
  department: "", // 科室
  doctor: "", // 医生
  item: "", // 项目
  receivable: 5.0, // 应收费用
  actual: 5.0, // 实收
  paymentMethod: "cash", // 支付方式：cash-现金，card-刷卡，wechat-微信，alipay-支付宝
  visitType: 1 // 就诊类型：1-初诊，2-复诊
});

// 表单验证规则
const registrationRules = reactive<FormRules>({
  patientName: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  ageYears: [{ required: true, message: "请输入年龄", trigger: "blur" }],
  department: [{ required: true, message: "请选择科室", trigger: "change" }],
  doctor: [{ required: true, message: "请选择医生", trigger: "change" }],
  item: [{ required: true, message: "请选择项目", trigger: "change" }]
});

// 患者下拉选项
const patientOptions = ref([
  { label: "张三 - 13800138000", value: "1" },
  { label: "李四 - 13900139000", value: "2" },
  { label: "王五 - 13700137000", value: "3" }
]);

// 科室选项
const departmentOptions = ref([
  { label: "全科", value: "general" },
  { label: "内科", value: "internal" },
  { label: "外科", value: "surgery" },
  { label: "儿科", value: "pediatrics" },
  { label: "妇科", value: "gynecology" }
]);

// 医生选项
const doctorOptions = ref([
  { label: "曾俊华", value: "zengjh" },
  { label: "李明", value: "liming" },
  { label: "王芳", value: "wangfang" }
]);

// 项目选项
const itemOptions = ref([
  { label: "普通门诊", value: "normal", price: 5.0 },
  { label: "专家门诊", value: "expert", price: 15.0 },
  { label: "急诊", value: "emergency", price: 10.0 }
]);

// 支付方式选项
const paymentOptions = ref([
  { label: "现金", value: "cash" },
  { label: "刷卡", value: "card" },
  { label: "微信", value: "wechat" },
  { label: "支付宝", value: "alipay" }
]);

// 选择患者时自动填充信息
const handlePatientChange = (value: string) => {
  const patient = patientOptions.value.find(p => p.value === value);
  if (patient) {
    registrationForm.patientName = patient.label.split(" - ")[0];
    // TODO: 从后端获取患者详细信息并填充
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
  if (!registrationFormRef.value) return;

  await registrationFormRef.value.validate(valid => {
    if (valid) {
      // TODO: 调用后端接口
      console.log("挂号数据:", registrationForm);
      ElMessage.success("挂号收费成功！");
      // 重置表单
      handleReset();
    } else {
      ElMessage.error("请填写完整信息！");
    }
  });
};

// 重置表单
const handleReset = () => {
  if (!registrationFormRef.value) return;
  registrationFormRef.value.resetFields();
  registrationForm.receivable = 5.0;
  registrationForm.actual = 5.0;
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
const registrationList = ref([]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 表格列定义
const columns = ref([
  { label: "状态", prop: "status", minWidth: 100 },
  { label: "门诊类型", prop: "visitType", minWidth: 120 },
  { label: "姓名", prop: "name", minWidth: 120 },
  { label: "就诊序号", prop: "sequence", minWidth: 120 },
  { label: "性别", prop: "gender", minWidth: 80 },
  { label: "科室", prop: "department", minWidth: 120 },
  { label: "医生", prop: "doctor", minWidth: 120 },
  { label: "挂号时间", prop: "registrationTime", minWidth: 180 },
  { label: "操作", fixed: "right", width: 160, slot: "operation" }
]);

// 查询挂号列表
const handleQuery = () => {
  loading.value = true;
  // TODO: 调用后端接口查询数据
  setTimeout(() => {
    loading.value = false;
  }, 500);
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

// 操作按钮
const handleView = (row: any) => {
  ElMessage.info(`查看挂号详情: ${row.name}`);
};

const handleCancel = (row: any) => {
  ElMessage.warning(`退号: ${row.name}`);
};

// Lifecycle
onMounted(() => {
  // 初始化时计算 offsetBottom
  nextTick(() => {
    updateOffsetBottom();
  });
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
                <el-form-item label="*姓名" prop="patientName">
                  <el-select
                    v-model="registrationForm.patientId"
                    placeholder="姓名、联系方式"
                    filterable
                    allow-create
                    class="full-width"
                    @change="handlePatientChange"
                  >
                    <el-option
                      v-for="item in patientOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="身份证号码" prop="idCard">
                  <el-input
                    v-model="registrationForm.idCard"
                    placeholder="请输入身份证号码"
                  />
                </el-form-item>

                <el-form-item label="*性别" prop="gender">
                  <el-radio-group v-model="registrationForm.gender">
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="0">女</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="*年龄" prop="ageYears">
                  <div class="age-input-group">
                    <el-input
                      v-model="registrationForm.ageYears"
                      type="number"
                      placeholder=""
                      class="age-input"
                    />
                    <el-select
                      v-model="registrationForm.ageYears"
                      class="age-unit"
                    >
                      <el-option
                        label="岁"
                        :value="registrationForm.ageYears"
                      />
                    </el-select>
                    <el-input
                      v-model="registrationForm.ageMonths"
                      type="number"
                      placeholder="0"
                      class="age-input"
                    />
                    <span class="age-label">月</span>
                  </div>
                </el-form-item>

                <el-form-item label="联系方式" prop="contact">
                  <el-input
                    v-model="registrationForm.contact"
                    placeholder="输入手机号或者固号"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" link>+增减字段</el-button>
                </el-form-item>
              </div>

              <!-- 右侧：挂号信息 -->
              <div class="form-right">
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

                <el-form-item label="" prop="visitType">
                  <el-radio-group v-model="registrationForm.visitType">
                    <el-radio :value="1">初诊</el-radio>
                    <el-radio :value="2">复诊</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="form-actions">
              <el-button type="primary" @click="handleRegistration">
                挂号收费
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 挂号列表 -->
      <el-tab-pane label="挂号列表" name="list" lazy>
        <div class="tab-content">
          <el-form
            ref="queryFormRef"
            :inline="true"
            :model="queryForm"
            class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
          >
            <el-form-item label="患者姓名" prop="patientName">
              <el-select
                v-model="queryForm.patientName"
                placeholder="请选择患者"
                filterable
                clearable
                class="!w-[180px]"
              >
                <el-option
                  v-for="item in patientOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
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
                <el-option label="已挂号" value="1" />
                <el-option label="已退号" value="2" />
                <el-option label="已完成" value="3" />
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
                :icon="useRenderIcon(Refresh)"
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
              <template v-slot="{ size, dynamicColumns }">
                <pure-table
                  ref="tableRef"
                  align-whole="center"
                  showOverflowTooltip
                  table-layout="auto"
                  :loading="loading"
                  :size="size"
                  adaptive
                  border
                  stripe
                  :data="registrationList"
                  row-key="id"
                  :columns="dynamicColumns"
                  :pagination="pagination"
                  :paginationSmall="size === 'small'"
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
                      :size="size"
                      @click="handleView(row)"
                    >
                      查看
                    </el-button>
                    <el-button
                      class="reset-margin"
                      link
                      type="danger"
                      :size="size"
                      @click="handleCancel(row)"
                    >
                      退号
                    </el-button>
                  </template>
                </pure-table>
              </template>
            </PureTableBar>
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
    padding: 0;
    background-color: white;
    overflow: hidden;

    .registration-form {
      background-color: #fff;
      padding: 20px;
      .form-layout {
        display: flex;
        gap: 60px;

        .form-left,
        .form-right {
          flex: 1;
        }

        .form-right {
          border-left: 1px solid #e4e7ed;
          padding-left: 40px;
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

      .form-actions {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;
        text-align: center;

        .el-button {
          width: 150px;
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
