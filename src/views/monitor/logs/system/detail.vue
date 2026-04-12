<script setup lang="tsx">
import { ref } from "vue";
import "vue-json-pretty/lib/styles.css";
import VueJsonPretty from "vue-json-pretty";

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const columns = [
  {
    label: "IP 地址",
    prop: "requestIp"
  },
  {
    label: "地点",
    prop: "requestAddress"
  },
  {
    label: "操作系统",
    prop: "os"
  },
  {
    label: "浏览器类型",
    prop: "browser"
  },
  {
    label: "所属模块",
    prop: "module"
  },
  {
    label: "请求时间",
    prop: "createdTime"
  },
  {
    label: "请求方法",
    prop: "method"
  },
  {
    label: "请求耗时",
    prop: "costTime"
  },
  {
    label: "请求接口",
    prop: "requestUri",
    copy: true
  },
  {
    label: "TraceId",
    prop: "id",
    copy: true
  }
];

const dataList = ref([
  {
    title: "响应头",
    name: "responseHeader",
    data: (props.data[0] as any).responseHeader
  },
  {
    title: "响应体",
    name: "responseBody",
    data: (props.data[0] as any).responseBody
  },
  {
    title: "请求头",
    name: "requestHeader",
    data: (props.data[0] as any).requestHeader
  },
  {
    title: "请求体",
    name: "requestBody",
    data: (props.data[0] as any).requestBody
  }
]);
</script>

<template>
  <div>
    <el-scrollbar>
      <PureDescriptions border :data="data" :columns="columns" :column="5" />
    </el-scrollbar>
    <el-tabs :modelValue="'responseBody'" type="border-card" class="mt-4">
      <el-tab-pane
        v-for="(item, index) in dataList"
        :key="index"
        :name="item.name"
        :label="item.title"
      >
        <el-scrollbar max-height="calc(100vh - 240px)">
          <vue-json-pretty v-model:data="item.data" />
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
