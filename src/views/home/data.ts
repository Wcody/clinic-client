import { dayjs, cloneDeep } from "./utils";
import GroupLine from "@iconify-icons/ri/group-line";
import Question from "@iconify-icons/ri/question-answer-line";
import CheckLine from "@iconify-icons/ri/chat-check-line";

const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** 今日挂号、待接诊患者、今日收费 */
const chartData = [
  {
    icon: GroupLine,
    bgColor: "#e6faf8",
    color: "#2dd4bf",
    duration: 2200,
    name: "今日挂号总量",
    value: 0,
    percent: "+12%",
    data: [0, 0, 0, 0, 0, 0, 0]
  },
  {
    icon: Question,
    bgColor: "#eff6ff",
    color: "#38bdf8",
    duration: 1600,
    name: "待接诊人数",
    value: 8,
    percent: "实时更新",
    data: [5, 7, 9, 6, 8, 11, 8]
  },
  {
    icon: CheckLine,
    bgColor: "#eff8f4",
    color: "#26ce83",
    duration: 1500,
    name: "今日收费总额(元)",
    value: 3860,
    percent: "+8%",
    data: [1200, 2800, 3100, 2600, 3500, 2900, 3860]
  }
];

/** 本周和上周的就诊数量（按星期） */
const barChartData = [
  {
    thisWeekData: [18, 25, 30, 22, 28, 15, 10],
    lastWeekData: [15, 20, 27, 19, 24, 12, 8]
  },
  {
    thisWeekData: [22, 31, 28, 35, 40, 18, 12],
    lastWeekData: [18, 25, 30, 22, 28, 15, 10]
  }
];

/** 接诊数量排行 */
const visitRankData = [
  { rank: 1, doctor: "曾建华", department: "内科", count: 42, trend: "+5" },
  { rank: 2, doctor: "李明霞", department: "妇科", count: 38, trend: "+3" },
  { rank: 3, doctor: "张德志", department: "外科", count: 35, trend: "-2" },
  { rank: 4, doctor: "陈晓燕", department: "儿科", count: 31, trend: "+1" },
  { rank: 5, doctor: "刘海波", department: "中医科", count: 28, trend: "+4" },
  { rank: 6, doctor: "赵静怡", department: "皮肤科", count: 24, trend: "0" },
  { rank: 7, doctor: "王芳", department: "口腔科", count: 19, trend: "-1" }
];

/** 收费金额排行 */
const feeRankData = [
  { rank: 1, doctor: "张德志", department: "外科", fee: 12480, trend: "+8%" },
  { rank: 2, doctor: "曾建华", department: "内科", fee: 9640, trend: "+5%" },
  { rank: 3, doctor: "李明霞", department: "妇科", fee: 8320, trend: "+3%" },
  { rank: 4, doctor: "刘海波", department: "中医科", fee: 6750, trend: "+6%" },
  { rank: 5, doctor: "陈晓燕", department: "儿科", fee: 5280, trend: "+2%" },
  { rank: 6, doctor: "赵静怡", department: "皮肤科", fee: 4160, trend: "-1%" },
  { rank: 7, doctor: "王芳", department: "口腔科", fee: 3590, trend: "+4%" }
];

/** 最新动态（就诊事件） */
const eventDoctors = [
  "曾建华",
  "李明霞",
  "张德志",
  "陈晓燕",
  "刘海波",
  "赵静怡",
  "王芳"
];
const eventPatients = [
  "张三",
  "李四",
  "王五",
  "赵六",
  "钱七",
  "孙八",
  "周九",
  "吴十",
  "郑一",
  "冯二",
  "陈三",
  "楚四",
  "魏五",
  "蒋六"
];
const eventDepts = [
  "内科",
  "妇科",
  "外科",
  "儿科",
  "中医科",
  "皮肤科",
  "口腔科"
];

const latestNewsData = Array.from({ length: 14 }).map((_, index) => {
  const deptIdx = index % eventDepts.length;
  return {
    doctor: eventDoctors[deptIdx],
    patient: eventPatients[index % eventPatients.length],
    department: eventDepts[deptIdx],
    eventDate: `${dayjs()
      .subtract(Math.floor(index / 3), "day")
      .format("YYYY-MM-DD")} ${
      days[
        dayjs()
          .subtract(Math.floor(index / 3), "day")
          .day()
      ]
    }`
  };
});

export { chartData, barChartData, visitRankData, feeRankData, latestNewsData };
