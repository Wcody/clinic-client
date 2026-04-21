<script setup lang="ts">
import { ref, markRaw, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { useDark, randomGradient } from "./utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRenderFlicker } from "@/components/ReFlicker";
import { ChartBar, ChartLine, ChartRound } from "./components/charts";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import GroupLine from "@iconify-icons/ri/group-line";
import Question from "@iconify-icons/ri/question-answer-line";
import CheckLine from "@iconify-icons/ri/chat-check-line";
import {
  getDashboardSummaryApi,
  getMySummaryApi,
  getVisitTrendApi,
  getVisitRankApi,
  getFeeRankApi,
  getRecentEventsApi
} from "@/api/home/dashboard";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();

let curWeek = ref(1); // 0上周、1本周
const optionsBasis: Array<OptionsType> = [{ label: "上周" }, { label: "本周" }];

const chartDataRef = ref([
  {
    icon: GroupLine,
    bgColor: "#e6faf8",
    color: "#2dd4bf",
    duration: 2200,
    name: "今日挂号总量",
    value: 0,
    percent: "",
    data: [] as number[]
  },
  {
    icon: Question,
    bgColor: "#eff6ff",
    color: "#38bdf8",
    duration: 1600,
    name: "待接诊人数",
    value: 0,
    percent: "实时更新",
    data: [] as number[]
  },
  {
    icon: CheckLine,
    bgColor: "#eff8f4",
    color: "#26ce83",
    duration: 1500,
    name: "今日收费总额(元)",
    value: 0,
    percent: "",
    data: [] as number[]
  }
]);

const barChartDataRef = ref([
  { thisWeekData: [] as number[], lastWeekData: [] as number[] },
  { thisWeekData: [] as number[], lastWeekData: [] as number[] }
]);
const daysDataRef = ref<string[]>([]);

const visitRankDataRef = ref<Array<{ rank: number; doctor: string; department: string; count: number; trend: string }>>([]);
const feeRankDataRef = ref<Array<{ rank: number; doctor: string; department: string; fee: number; trend: string }>>([]);
const latestNewsDataRef = ref<Array<{ doctor: string; patient: string; department: string; eventDate: string }>>([]);

const summaryData = ref({
  myReceivedCount: 0,
  myPendingCount: 0,
  myTodayFee: 0
});

const today = new Date().toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long"
});

const loading = ref(true);

onMounted(async () => {
  try {
    const [summaryRes, mySummaryRes, trendRes, visitRankRes, feeRankRes, eventsRes] = await Promise.all([
      getDashboardSummaryApi(),
      getMySummaryApi(),
      getVisitTrendApi(),
      getVisitRankApi(),
      getFeeRankApi(),
      getRecentEventsApi()
    ]);

    const summary = summaryRes.data;
    if (summary) {
      chartDataRef.value[0].value = summary.todayRegistrationTotal || 0;
      chartDataRef.value[0].percent = "";
      chartDataRef.value[1].value = summary.myPendingCount || 0;
      chartDataRef.value[2].value = summary.myTodayFee || 0;
    }

    const mySummary = mySummaryRes.data;
    if (mySummary) {
      summaryData.value = {
        myReceivedCount: mySummary.myReceivedCount || 0,
        myPendingCount: mySummary.myPendingCount || 0,
        myTodayFee: mySummary.myTodayFee || 0
      };
    }

    const trend = trendRes.data;
    if (trend) {
      daysDataRef.value = trend.days || [];
      barChartDataRef.value = [
        { thisWeekData: trend.thisWeek || [], lastWeekData: trend.lastWeek || [] },
        { thisWeekData: trend.thisWeek || [], lastWeekData: trend.lastWeek || [] }
      ];
      chartDataRef.value[0].data = trend.thisWeek || [];
      chartDataRef.value[1].data = trend.thisWeek || [];
      chartDataRef.value[2].data = trend.thisWeek || [];
    }

    const visitRank = visitRankRes.data;
    if (visitRank?.list) {
      visitRankDataRef.value = visitRank.list.map((item: any) => ({
        rank: item.rank,
        doctor: item.doctor,
        department: item.department,
        count: item.count || 0,
        trend: item.trend || "0"
      }));
    }

    const feeRank = feeRankRes.data;
    if (feeRank?.list) {
      feeRankDataRef.value = feeRank.list.map((item: any) => ({
        rank: item.rank,
        doctor: item.doctor,
        department: item.department,
        fee: item.fee || 0,
        trend: item.trend || "0%"
      }));
    }

    const events = eventsRes.data;
    if (events?.list) {
      latestNewsDataRef.value = events.list;
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- 欢迎横幅 -->
    <el-row :gutter="24" class="mb-[18px]">
      <re-col :value="24">
        <el-card
          v-motion
          shadow="never"
          class="welcome-banner"
          :initial="{ opacity: 0, y: -16 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 60 } }"
        >
          <div class="banner-inner">
            <div>
              <div class="banner-title">你好，医生 👋</div>
              <div class="banner-sub">
                {{ today }}，祝您工作顺利，诊治顺利。
              </div>
            </div>
            <div class="banner-stats">
              <div class="banner-stats-row">
                <div class="banner-stat-item">
                  <span class="stat-num teal">{{ summaryData.myReceivedCount }}</span>
                  <span class="stat-label">我的已接诊</span>
                </div>
                <div class="banner-stat-divider" />
                <div class="banner-stat-item">
                  <span class="stat-num blue">{{ summaryData.myPendingCount }}</span>
                  <span class="stat-label">我的待接诊</span>
                </div>
                <div class="banner-stat-divider" />
                <div class="banner-stat-item">
                  <span class="stat-num green">{{ summaryData.myTodayFee }}</span>
                  <span class="stat-label">我的收费(元)</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </re-col>
    </el-row>

    <!-- ── 诊所概览 ── -->
    <div
      v-motion
      class="section-header"
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 200 } }"
    >
      <span class="section-tag clinic">诊所概览</span>
    </div>

    <el-row :gutter="24" justify="space-around">
      <!-- 三个指标卡 -->
      <re-col
        v-for="(item, index) in chartDataRef"
        :key="index"
        v-motion
        class="mb-[18px]"
        :value="8"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 80 * (index + 1) } }"
      >
        <el-card class="line-card stat-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ item.name }}</span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : item.bgColor
              }"
            >
              <IconifyIconOffline
                :icon="item.icon"
                :color="item.color"
                width="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="item.duration"
                :fontSize="'1.6em'"
                :startVal="0"
                :endVal="item.value"
              />
              <p
                class="font-medium text-sm mt-1"
                :style="{ color: item.color }"
              >
                {{ item.percent }}
              </p>
            </div>
            <ChartLine
              v-if="item.data.length > 1"
              class="!w-1/2"
              :color="item.color"
              :data="item.data"
            />
            <ChartRound v-else class="!w-1/2" />
          </div>
        </el-card>
      </re-col>

      <!-- 就诊趋势 -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="18"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">就诊趋势</span>
            <Segmented v-model="curWeek" :options="optionsBasis" />
          </div>
          <div class="mt-3">
            <ChartBar
              :thisWeekData="barChartDataRef[curWeek].thisWeekData"
              :lastWeekData="barChartDataRef[curWeek].lastWeekData"
              :daysData="daysDataRef"
            />
          </div>
        </el-card>
      </re-col>

      <!-- 最新动态 -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 480 } }"
      >
        <el-card class="news-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">最新动态</span>
          </div>
          <el-scrollbar class="mt-3 news-scrollbar">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in latestNewsDataRef"
                :key="index"
                center
                placement="top"
                :icon="
                  markRaw(
                    useRenderFlicker({
                      background: randomGradient({ randomizeHue: true })
                    })
                  )
                "
                :timestamp="item.eventDate"
              >
              e<p class="text-text_color_regular text-sm">
                  {{
                    `${item.doctor} 接诊了 ${item.patient}（${item.department}）`
                  }}
                </p>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </re-col>

      <!-- 接诊数量排行 -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="12"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 560 } }"
      >
        <el-card shadow="never">
          <div class="flex justify-between mb-4">
            <span class="text-md font-medium">接诊数量排行</span>
            <span class="text-sm text-text_color_regular">今日</span>
          </div>
          <el-table
            :data="visitRankDataRef"
            :show-header="true"
            stripe
            size="small"
          >
            <el-table-column label="排名" width="56" align="center">
              <template #default="{ row }">
                <span
                  class="rank-badge"
                  :class="row.rank <= 3 ? `rank-top${row.rank}` : 'rank-normal'"
                  >{{ row.rank }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="doctor" label="医生" />
            <el-table-column prop="department" label="科室" />
            <el-table-column prop="count" label="接诊数" align="right">
              <template #default="{ row }">
                <span class="font-semibold" style="color: #2dd4bf">{{
                  row.count
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="环比" width="64" align="right">
              <template #default="{ row }">
                <span
                  :class="
                    row.trend.startsWith('+')
                      ? 'trend-up'
                      : row.trend === '0'
                        ? 'trend-flat'
                        : 'trend-down'
                  "
                >
                  {{ row.trend }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </re-col>

      <!-- 收费金额排行 -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="12"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 640 } }"
      >
        <el-card shadow="never">
          <div class="flex justify-between mb-4">
            <span class="text-md font-medium">收费金额排行</span>
            <span class="text-sm text-text_color_regular">今日</span>
          </div>
          <el-table :data="feeRankDataRef" :show-header="true" stripe size="small">
            <el-table-column label="排名" width="56" align="center">
              <template #default="{ row }">
                <span
                  class="rank-badge"
                  :class="row.rank <= 3 ? `rank-top${row.rank}` : 'rank-normal'"
                  >{{ row.rank }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="doctor" label="医生" />
            <el-table-column prop="department" label="科室" />
            <el-table-column prop="fee" label="金额(元)" align="right">
              <template #default="{ row }">
                <span class="font-semibold" style="color: #26ce83">{{
                  row.fee.toLocaleString()
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="环比" width="70" align="right">
              <template #default="{ row }">
                <span
                  :class="
                    row.trend.startsWith('+')
                      ? 'trend-up'
                      : row.trend === '0%'
                        ? 'trend-flat'
                        : 'trend-down'
                  "
                >
                  {{ row.trend }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  .el-scrollbar__bar {
    display: none;
  }

  .el-timeline-item {
    margin: 0 6px;
  }
}

.main-content {
  margin: 20px 20px 0 !important;
}

/* 最新动态与就诊趋势等高 */
.news-card {
  height: 445px;

  :deep(.el-card__body) {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .news-scrollbar {
    flex: 1;
    min-height: 0;
  }
}

/* 分区标题 */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 3px 12px 3px 8px;
  border-radius: 0 20px 20px 0;

  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 14px;
    border-radius: 2px;
  }

  &.clinic {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);

    &::before {
      background: #38bdf8;
    }
  }
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #f0fdfb 0%, #e8f8ff 60%, #f0fdfb 100%);
  border: 1px solid rgba(45, 212, 191, 0.25) !important;

  :deep(.el-card__body) {
    padding: 20px 24px;
  }
}

.banner-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #134e4a;
  margin-bottom: 4px;
}

.banner-sub {
  font-size: 0.875rem;
  color: #64748b;
}

.banner-stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.banner-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;

  &.teal {
    color: #0d9488;
  }
  &.blue {
    color: #0284c7;
  }
  &.green {
    color: #16a34a;
  }
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.banner-stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(45, 212, 191, 0.3);
}

/* 指标卡 */
.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(45, 212, 191, 0.12) !important;
  }
}

/* 排行榜 */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;

  &.rank-top1 {
    background: #f5a623;
    color: #fff;
  }
  &.rank-top2 {
    background: #9aa0a6;
    color: #fff;
  }
  &.rank-top3 {
    background: #cd7f32;
    color: #fff;
  }
  &.rank-normal {
    background: #f0f2f5;
    color: #606266;
  }
}

.trend-up {
  color: #26ce83;
  font-size: 12px;
}
.trend-down {
  color: #e85f33;
  font-size: 12px;
}
.trend-flat {
  color: #909399;
  font-size: 12px;
}
</style>
