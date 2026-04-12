<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref } from "vue";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { useRenderFlicker } from "@/components/ReFlicker";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Iphone from "@iconify-icons/ep/iphone";
import { randomGradient } from "@pureadmin/utils";
import { getRecordTrackListApiBy } from "@/api/qc/track";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "追踪",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  }),
  headerRef: () => ref()
});

console.log("props", props);

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const departmentKindNames = ["所属", "住院", "就诊"];
const clientHeightRef = ref("calc(100vh - 85px)");

const lastBuildTime = "2024-10-12 12:23:00";
console.log("markRaw", markRaw(useRenderFlicker()));
const activities = [
  {
    content: "支持圆点发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker())
  },
  {
    content: "支持方形发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker({ borderRadius: 0, background: "#67C23A" }))
  },
  {
    content: "支持渐变发光",
    timestamp: lastBuildTime,
    icon: markRaw(
      useRenderFlicker({
        background: randomGradient({
          randomizeHue: true
        })
      })
    )
  },
  {
    content: "支持默认颜色",
    timestamp: lastBuildTime
  },
  {
    content: "支持自定义颜色",
    timestamp: lastBuildTime,
    color: "#F56C6C"
  },
  {
    content:
      "支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标",
    timestamp: lastBuildTime,
    color: "transparent",
    icon: useRenderIcon(Iphone, {
      color: "#0bbd87"
    })
  },
  {
    content: "支持圆点发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker())
  },
  {
    content: "支持方形发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker({ borderRadius: 0, background: "#67C23A" }))
  },
  {
    content: "支持渐变发光",
    timestamp: lastBuildTime,
    icon: markRaw(
      useRenderFlicker({
        background: randomGradient({
          randomizeHue: true
        })
      })
    )
  },
  {
    content: "支持默认颜色",
    timestamp: lastBuildTime
  },
  {
    content: "支持自定义颜色",
    timestamp: lastBuildTime,
    color: "#F56C6C"
  },
  {
    content:
      "支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标",
    timestamp: lastBuildTime,
    color: "transparent",
    icon: useRenderIcon(Iphone, {
      color: "#0bbd87"
    })
  },
  {
    content: "支持圆点发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker())
  },
  {
    content: "支持方形发光",
    timestamp: lastBuildTime,
    icon: markRaw(useRenderFlicker({ borderRadius: 0, background: "#67C23A" }))
  },
  {
    content: "支持渐变发光",
    timestamp: lastBuildTime,
    icon: markRaw(
      useRenderFlicker({
        background: randomGradient({
          randomizeHue: true
        })
      })
    )
  },
  {
    content: "支持默认颜色",
    timestamp: lastBuildTime
  },
  {
    content: "支持自定义颜色",
    timestamp: lastBuildTime,
    color: "#F56C6C"
  },
  {
    content:
      "支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标支持自定义图标",
    timestamp: lastBuildTime,
    color: "transparent",
    icon: useRenderIcon(Iphone, {
      color: "#0bbd87"
    })
  }
];

const resizeObserver = new ResizeObserver(() => {
  if (props.headerRef.value) {
    clientHeightRef.value = `calc(100vh - ${props.headerRef.value.clientHeight + 53}px)`;
  }
});

const activitiesRef = ref([]);

onMounted(async () => {
  resizeObserver.observe(props.headerRef.value);
  const res = await getRecordTrackListApiBy(props.formInline.eid);
  console.log("res", res);
  activitiesRef.value = res.data || [];
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});
</script>

<template>
  <div class="full-main">
    <el-timeline v-if="activitiesRef.length > 0" class="pt-10">
      <el-timeline-item
        v-for="(activity, index) in activitiesRef"
        :key="index"
        :icon="
          index === activitiesRef.length - 1
            ? markRaw(useRenderFlicker())
            : null
        "
        color="#0bbd87"
        :timestamp="`${activity.createdBy}  ${activity.createdTime}`"
        placement="top"
      >
        <div class="message">
          <el-card>
            <p>{{ activity.content }}</p>
          </el-card>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else description="暂无信息" />
  </div>
</template>

<style lang="scss" scoped>
.full-main {
  border-top: 1px solid #ebeef5;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  margin: auto;
  width: 100%;
  height: v-bind(clientHeightRef);
}

.message {
  position: relative;
  box-sizing: border-box;
  max-width: 40vw;
  padding: 5px 12px;
  line-height: 18px;
  color: #fff;
  word-break: break-all;
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-8);
  border-radius: 6px;
}

.message::after {
  position: absolute;
  top: 8px;
  left: -10px;
  width: 0;
  height: 0;
  overflow: hidden;
  content: "";
  border-color: var(--el-color-primary-light-8) transparent transparent;
  border-style: solid dashed dashed;
  border-width: 10px;
}
</style>
