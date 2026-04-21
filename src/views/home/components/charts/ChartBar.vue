<script setup lang="ts">
import { useDark, useECharts } from "@pureadmin/utils";
import { type PropType, ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  thisWeekData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  lastWeekData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  daysData: {
    type: Array as PropType<Array<string>>,
    default: () => ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  }
});

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
});

watch(
  () => props,
  async () => {
    await nextTick();
    setOptions({
      container: ".bar-card",
      color: ["#2dd4bf", "#38bdf8"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "none"
        }
      },
      grid: {
        top: "20px",
        left: "50px",
        right: 0
      },
      legend: {
        data: ["本周就诊", "上周就诊"],
        textStyle: {
          color: "#606266",
          fontSize: "0.875rem"
        },
        bottom: 0
      },
      xAxis: [
        {
          type: "category",
          data: props.daysData,
          axisLabel: {
            fontSize: "0.875rem"
          },
          axisPointer: {
            type: "shadow"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          name: "人次",
          axisLabel: {
            fontSize: "0.875rem"
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: "本周就诊",
          type: "bar",
          barWidth: 14,
          itemStyle: {
            color: "#2dd4bf",
            borderRadius: [10, 10, 0, 0]
          },
          data: props.thisWeekData
        },
        {
          name: "上周就诊",
          type: "bar",
          barWidth: 14,
          itemStyle: {
            color: "#38bdf8aa",
            borderRadius: [10, 10, 0, 0]
          },
          data: props.lastWeekData
        }
      ]
    });
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 365px" />
</template>
