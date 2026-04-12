<script setup lang="tsx">
import {
  NodeMouseEvent,
  useVueFlow,
  VueFlow,
  MarkerType
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import SaveRestoreControls from "./Controls.vue";
import NodeStart from "./NodeStart.vue";
import NodeEnd from "./NodeEnd.vue";
import NodeRole from "./NodeRole.vue";
import NodeAnd from "./NodeAnd.vue";
import NodeOr from "./NodeOr.vue";
import {
  BQFlowEntityType,
  getFlowById,
  updateFlowApi
} from "@/api/system/flow";
import { onMounted, ref } from "vue";
import { nextTick } from "process";
import { fi } from "element-plus/es/locales.mjs";
import { status } from "nprogress";
import { message } from "@/utils/message";
import { useSelectRole } from "@/views/system/conf/flow/utils/hook";

defineOptions({
  name: "BqFlowConf"
});

const props = withDefaults(
  defineProps<{
    eid: string;
  }>(),
  { eid: "" }
);

const defaultNodes = [
  {
    id: "start",
    type: "start",
    data: { label: "开始" },
    position: { x: 100, y: 100 }
  },
  {
    id: "end",
    type: "end",
    data: { label: "结束" },
    position: { x: 100, y: 200 }
  },
  {
    id: "and",
    type: "and",
    data: { label: "并且" },
    position: { x: 100, y: 300 }
  },
  {
    id: "or",
    type: "or",
    data: { label: "或者" },
    position: { x: 100, y: 400 }
  },
  {
    id: "role",
    type: "role",
    data: { label: "未设置角色", roleId: 0 },
    position: { x: 100, y: 500 }
  }
];

const defaultEdges = [
  {
    id: "start-end",
    source: "start",
    target: "end",
    animated: true,
    markerEnd: MarkerType.ArrowClosed
  }
];

const flowDataRef = ref<BQFlowEntityType>({
  nodes: defaultNodes,
  edges: defaultEdges,
  status: true,
  name: "",
  version: 0,
  eid: "",
  createdTime: "",
  updatedTime: "",
  createdBy: "",
  updatedBy: "",
  viewport: undefined,
  zoom: 0,
  position: undefined
});

const {
  onInit,
  onNodeDragStop,
  onConnect,
  addEdges,
  addNodes,
  setViewport,
  fitView,
  toObject
} = useVueFlow();

const { handleRole } = useSelectRole();

onInit(vueFlowInstance => {
  //vueFlowInstance.fitView();
});

const onFlowLoad = vueFlowInstance => {
  vueFlowInstance.fitView();
};

onNodeDragStop(({ event, nodes, node }) => {
  //console.log("Node Drag Stop", { event, nodes, node });
});

onConnect(connection => {
  addEdges({
    id: "edge-" + Math.random(),
    source: connection.source,
    target: connection.target,
    animated: true,
    markerEnd: MarkerType.ArrowClosed
  });
});

const handleNodeDoubleClick = (event: NodeMouseEvent) => {
  const node = event.node;
  if (node.type == "role") {
    handleRole(node.data);
  }
};

const addNodeRole = () => {
  addNodes({
    id: "node-" + Math.random(),
    type: "role",
    data: { label: "未设置角色" },
    position: { x: 100, y: 100 }
  });
};

const addNodeAnd = () => {
  addNodes({
    id: "node-" + Math.random(),
    type: "and",
    data: { label: "并且" },
    position: { x: 100, y: 100 }
  });
};

const addNodeOr = () => {
  addNodes({
    id: "node-" + Math.random(),
    type: "or",
    data: { label: "或者" },
    position: { x: 100, y: 100 }
  });
};

const onSave = async () => {
  let tempData = {};
  if (flowDataRef.value.status) {
    tempData = toObject();
  }
  const res = await updateFlowApi({
    ...tempData,
    eid: props.eid,
    status: flowDataRef.value.status
  });
  console.log("res", res);
  if (res.code == 0) {
    message("保存成功", {
      type: "success"
    });
  } else {
    message("保存失败：" + res.message, {
      type: "error"
    });
  }
};

const onDeleteNodes = nodes => {
  console.log("onDeleteNodes", nodes);
};

const onDeleteEdges = edges => {
  console.log("onDeleteEdges", edges);
};

const onNodeClick = (event: NodeMouseEvent) => {
  //console.log("Node Click", event.node);
};

(async () => {
  const { code, data } = await getFlowById(props.eid);
  // console.log("data", data);
  if (!data.nodes || data.nodes.length == 0) {
    data.nodes = defaultNodes;
  }
  if (!data.edges || data.edges.length == 0) {
    data.edges = defaultEdges;
  }
  flowDataRef.value = data;
  // setViewport(flowDataRef.value.viewport);
  nextTick(() => {
    fitView();
  });
})();
</script>

<template>
  <el-card
    class="ml-[12px] mt-[8px] mb-[8px] w-[calc(100%-16px)]"
    body-class="h-[calc(100vh-380px)] !p-0"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <el-switch
            v-model="flowDataRef.status"
            size="small"
            active-text="使用自定义流程审批"
            inactive-text="不使用流程审批"
          />
        </div>
        <div class="flex items-center justify-end">
          <el-button type="primary" size="small" plain @click="onSave">
            保存
          </el-button>
        </div>
      </div>
    </template>
    <template #footer>
      <div v-if="flowDataRef.status" class="flex items-center">
        <el-space>
          <el-button type="primary" size="small" plain @click="addNodeRole">
            新增审批角色
          </el-button>
          <el-button type="primary" size="small" plain @click="addNodeAnd">
            新增并网关
          </el-button>
          <el-button type="primary" size="small" plain @click="addNodeOr">
            新增或网关
          </el-button>
        </el-space>
      </div>
    </template>
    <VueFlow
      v-if="flowDataRef.status"
      :nodes="flowDataRef.nodes"
      :edges="flowDataRef.edges"
      fit-view-on-init
      @node-double-click="handleNodeDoubleClick"
      @load="onFlowLoad"
      @delete-nodes="onDeleteNodes"
      @delete-edges="onDeleteEdges"
      @node-click="onNodeClick"
    >
      <SaveRestoreControls />
      <Background pattern-color="#aaa" :gap="16" />
      <MiniMap />
      <template #node-start="props">
        <NodeStart :id="props.id" :data="props.data" />
      </template>
      <template #node-end="props">
        <NodeEnd :id="props.id" :data="props.data" />
      </template>
      <template #node-and="props">
        <NodeAnd :id="props.id" :data="props.data" />
      </template>
      <template #node-or="props">
        <NodeOr :id="props.id" :data="props.data" />
      </template>
      <template #node-role="props">
        <NodeRole :id="props.id" :data="props.data" />
      </template>
    </VueFlow>
  </el-card>
</template>

<style lang="scss" scoped></style>
