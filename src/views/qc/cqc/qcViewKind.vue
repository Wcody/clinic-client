<script setup lang="ts">
import { h, onMounted, ref, toRaw, watch } from "vue";
import { FormProps, KindTree } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import SearchIcon from "@iconify-icons/ri/search-line";
import DeleteIcon from "@iconify-icons/ri/delete-bin-line";
import RenameIcon from "@iconify-icons/ri/edit-2-line";
import ReCollectIcon from "@iconify-icons/ri/edit-box-line";
import MoreIcon from "@iconify-icons/ep/more-filled";
import AbolishIcon from "@iconify-icons/ri/forbid-2-line";
import FileIcon from "@iconify-icons/ri/file-4-line";
import ReUseIcon from "@iconify-icons/ri/recycle-line";
import ViewIcon from "@iconify-icons/ri/eye-line";
import ViewOffIcon from "@iconify-icons/ri/eye-off-line";
import EditPenIcon from "@iconify-icons/ep/edit-pen";
import RefreshIcon from "@iconify-icons/ep/refresh";
import AddIcon from "@iconify-icons/ri/add-circle-line";
import { on } from "events";
import {
  abolishByAttachmentIdApi,
  abolishByKindIdApi,
  abolishByRecordIdApi,
  deleteApi,
  deleteByKindIdApi,
  deleteByRecordIdApi,
  getAttachmentListRecordIdApi,
  updateAttachmentApi,
  updateAttachmentOrderValueApi
} from "@/api/cm/attachment";
import { getKindByKindListApi } from "@/api/cm/kind";
import Node from "element-plus/es/components/tree/src/model/node";
import type { DragEvents } from "element-plus/es/components/tree/src/model/useDragNode";
import type {
  AllowDropType,
  NodeDropType
} from "element-plus/es/components/tree/src/tree.type";
import { message } from "@/utils/message";
import { ElInput, ElMessageBox, ElOption, ElSelect } from "element-plus";
import _ from "lodash";
import { func } from "vue-types";
import { da, tr } from "element-plus/es/locales.mjs";
import { addDialog } from "@/components/ReDialog";
import { nextTick } from "process";
import { number } from "echarts";
import { getCountByRecordIdApi } from "@/api/cm/annotation";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});

const viewType = props.otherInfo?.type || "view";
const isQc = viewType === "qc";

const abolishCaption = ["全部废止", "该分类的全部废止", "废止"];
const unAbolishCaption = ["全部启用", "该分类的全部启用", "启用"];
const deleteCaption = ["全部删除", "该分类的全部删除", "删除"];
const rootCaption = [
  "未知视图",
  "分类视图",
  "批注视图",
  "上传视图",
  "页码视图"
];
const newFormInline = ref(props.formInline);
const selectValueRef = ref(1);
const searchKeyRef = ref("");
const treeRef = ref();
const treeDataRef = ref<KindTree[]>();
const treeDataCloneRef = ref<KindTree[]>();
const dragOverNodeIdRef = ref();
const showAbolishRef = ref(false);
const showEmptyRef = ref(false);
const kindOptions = ref([]);

//映射树节点id与页码
const attachmentIdMapRef = ref({});
const attachmentPageMapRef = ref({});
const attachmentListRef = ref([]);

const nodeDropTypeName = {
  before: "之前",
  after: "之后",
  inner: "里面",
  none: ""
};

const handleDragStart = (node: Node, ev: DragEvents) => {
  treeDataCloneRef.value = _.cloneDeep(treeDataRef.value);
  //console.log("drag start", node);
};

const handleDragEnter = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  //console.log("tree drag enter:", dropNode.label);
};

const handleDragLeave = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  //console.log("tree drag leave:", dropNode.label);
};

const handleDragOver = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  dragOverNodeIdRef.value = dropNode.data.eid;
  //console.log("tree drag over:", dropNode.label);
};

const handleDragEnd = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  dragOverNodeIdRef.value = "";
  if (dropNode && dropType !== "none") {
    ElMessageBox.confirm(
      `确认要将<strong>${draggingNode.label}</strong>移动到<strong style='color:var(--el-color-primary)'>${dropNode.label}</strong><strong>${nodeDropTypeName[dropType]}</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        if (dropType == "inner") {
          //修改分类
          const res = await updateAttachmentApi({
            eid: draggingNode.data.eid,
            kindId: dropNode.data.eid
          });
          if (res.code === 0) {
            message("移动成功", { type: "success" });
            //刷新数据
            refreshTree();
          } else {
            message("移动失败：" + res.message, { type: "error" });
            treeDataRef.value = treeDataCloneRef.value;
          }
        } else {
          const list = [];
          //修改分类和排序
          dropNode.parent.data.children.forEach(item => {
            list.push(item.eid);
          });
          const res = await updateAttachmentOrderValueApi({
            kindId: dropNode.parent.data.eid,
            list
          });
          message("移动成功", { type: "success" });
          //刷新数据
          refreshTree();
        }
      })
      .catch(() => {
        treeDataRef.value = treeDataCloneRef.value;
      });
  }
};

const handleDrop = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  //console.log("tree drop:", dropNode.label, dropType);
};

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
  //console.log("allowDrop:", draggingNode.data.type, dropNode.data.type, type);
  return (
    ((draggingNode.data.type === 2 &&
      dropNode.data.type === 2 &&
      type != "inner") ||
      (draggingNode.data.type === 2 &&
        dropNode.data.type === 1 &&
        type == "inner")) &&
    draggingNode.data.eid !== dropNode.data.eid
  );
};

const allowDrag = (draggingNode: Node) => {
  return draggingNode.data.type === 2;
};

watch(searchKeyRef, val => {
  treeRef.value!.filter(val);
});

const filterNode = (value: string, data: KindTree) => {
  if (!value) return true;
  return data.label.includes(value);
};

function currentChange(data, node) {
  if (data.type !== 2) {
    treeRef.value.setCurrentKey(newFormInline.value.selectNodeId);
    return;
  }
  newFormInline.value.selectNodeId = data.eid;
}

function switchShowAbolish() {
  showAbolishRef.value = !showAbolishRef.value;
  refreshTree();
}

function switchShowEmpty() {
  showEmptyRef.value = !showEmptyRef.value;
  refreshTree();
}

function getCurrentNode() {
  return treeRef.value.getCurrentNode();
}

async function abolishNode(data, val: boolean) {
  function doAbolish(val) {
    if (data.type == 0) {
      return abolishByRecordIdApi(newFormInline.value.eid, val);
    } else if (data.type == 1) {
      return abolishByKindIdApi(newFormInline.value.eid, data.eid, val);
    } else {
      return abolishByAttachmentIdApi(data.eid, val);
    }
  }

  ElMessageBox.confirm(
    `确认要将${data.type === 2 ? "文件" : ""}<strong style='color:var(--el-color-primary)'>${data.label}</strong>${data.type !== 2 ? "下的所有文件" : ""}进行<strong>${(val ? "取消" : "") + "废止"}</strong>吗?`,
    "操作确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(async () => {
      const res = doAbolish(val);
      if (res) {
        message("操作成功", { type: "success" });
        refreshTree();
      }
    })
    .catch(() => {});
}

function deleteNode(data) {
  function doDelete() {
    if (data.type == 0) {
      return deleteByRecordIdApi(newFormInline.value.eid);
    } else if (data.type == 1) {
      return deleteByKindIdApi(newFormInline.value.eid, data.eid);
    } else {
      return deleteApi(data.eid);
    }
  }

  ElMessageBox.confirm(
    `确认要将${data.type === 2 ? "文件" : ""}<strong style='color:var(--el-color-primary)'>${data.label}</strong>${data.type !== 2 ? "下的所有文件" : ""}进行<strong>删除</strong>吗?`,
    "操作确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(async () => {
      const res = doDelete();
      if (res) {
        message("删除成功", { type: "success" });
        refreshTree();
      }
    })
    .catch(() => {});
}

function reName(data) {
  const inputValueRef = ref(data.label);
  addDialog({
    title: "重命名",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () => {
      return h(ElInput, {
        modelValue: inputValueRef.value,
        "onUpdate:modelValue": val => (inputValueRef.value = val),
        autofocus: true,
        placeholder: "请输入文件名",
        clearable: true,
        style: {
          marginBottom: "20px"
        }
      });
    },
    beforeSure: async (done, { options, index }) => {
      if (!inputValueRef.value) {
        return message("文件名不能为空", { type: "error" });
      }
      const curData = {
        eid: data.eid,
        fileName: inputValueRef.value
      };
      const res = await updateAttachmentApi(curData);
      if (res) {
        message("重命名成功", { type: "success" });
        refreshTree();
        done(options, index);
      }
    }
  });
}

function reKind(data) {
  const inputValueRef = ref(data.kindId);
  addDialog({
    title: "重新设置分类",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () => {
      return h(
        ElSelect,
        {
          modelValue: inputValueRef.value,
          "onUpdate:modelValue": val => (inputValueRef.value = val),
          placeholder: "请选择一个分类",
          filterable: true,
          style: {
            marginBottom: "20px"
          }
        },
        () => {
          const children = [];
          for (const item of kindOptions.value) {
            item.disabled = item.value == data.kindId;
            children.push(h(ElOption, item));
          }
          return children;
        }
      );
    },
    beforeSure: async (done, { options, index }) => {
      if (!inputValueRef.value) {
        return message("必须要选择一个分类", { type: "error" });
      }
      if (inputValueRef.value == data.kindId) {
        return message("不能设置成相同的分类", { type: "error" });
      }
      const curData = {
        eid: data.eid,
        kindId: inputValueRef.value
      };
      const res = await updateAttachmentApi(curData);
      if (res) {
        message("设置分类成功", { type: "success" });
        refreshTree();
        done(options, index);
      }
    }
  });
}

function buildTreeData(kindList, data, countMap) {
  newFormInline.value.selectNodeId = "";
  const roots = [];
  const kindMap = {};
  for (const kind of kindList) {
    const item: KindTree = {
      eid: kind.eid,
      label: kind.name,
      hasManual: true,
      status: true,
      type: 1
    };
    roots.push(item);
    kindMap[kind.eid] = item;
  }

  for (const dataItem of data) {
    const kindItem = kindMap[dataItem.kindId];
    if (
      kindItem &&
      (props.leftSelectValue != 2 ||
        (props.leftSelectValue == 2 && countMap[dataItem.eid] > 0))
    ) {
      const item: KindTree = {
        eid: dataItem.eid,
        label: dataItem.fileName,
        status: dataItem.status,
        kindId: dataItem.kindId,
        hasManual: dataItem.hasManual,
        url: `/ams/mvc/v1/download/medical/${dataItem.eid}`,
        type: 2
      };
      kindItem.children = kindItem.children || [];
      kindItem.children.push(item);
    }
  }

  let children = roots;
  //过滤空的分类
  if (!showEmptyRef.value) {
    children = [];
    for (const kind of roots) {
      if (kind.children?.length) {
        children.push(kind);
      }
    }
  }

  // 构建idMap和pageMap
  let page = 1;
  const idMap = {};
  const pageMap = {};
  const list = [];
  for (const kind of children) {
    if (kind.children?.length && !newFormInline.value.selectNodeId) {
      //设置默认选中的第一项
      newFormInline.value.selectNodeId = kind.children[0].eid;
    }
    if (kind.children?.length) {
      for (const child of kind.children) {
        idMap[child.eid] = child;
        pageMap[page] = child;
        child.page = page;
        list.push(child);
        page++;
      }
    }
  }
  attachmentIdMapRef.value = idMap;
  attachmentPageMapRef.value = pageMap;
  attachmentListRef.value = list;

  // 根节点
  return [
    {
      eid: "111",
      label: rootCaption[props.leftSelectValue || 0],
      type: 0,
      status: true,
      hasManual: false,
      url: "",
      children: props.leftSelectValue == 4 ? list : children
    }
  ];
}

async function getAttachmentList(recordId, includeDrop: boolean) {
  const countMap = {} as Record<string, number>;
  let data =
    (
      await getAttachmentListRecordIdApi(
        recordId,
        includeDrop,
        props.leftSelectValue == 3
      )
    ).data || [];
  if (props.leftSelectValue == 2 && data.length > 0) {
    //获取附件批注数量
    let countData = (await getCountByRecordIdApi(recordId)).data || [];
    //数组转对象
    countData.reduce((acc, { attachmentId, count }) => {
      acc[attachmentId] = count;
      return acc;
    }, countMap);
    //批注数量大于0的列表
  }
  return { data, countMap };
}

async function refreshTree() {
  //获取档案分类
  const kindList =
    (await getKindByKindListApi(newFormInline.value.initKind)).data || [];

  //获取分类下拉列表
  kindOptions.value = [];
  for (const kind of kindList) {
    kindOptions.value.push({
      label: kind.name,
      value: kind.eid
    });
  }

  //获取附件列表
  const { data, countMap } = await getAttachmentList(
    newFormInline.value.eid,
    showAbolishRef.value
  );

  treeDataRef.value = buildTreeData(kindList, data, countMap);

  nextTick(() => {
    treeRef.value.setCurrentKey(newFormInline.value.selectNodeId);
  });
}

function selectNodeById(eid) {
  treeRef.value.setCurrentKey(eid);
}

onMounted(async () => {
  await refreshTree();

  //标题类别改变则刷新列表
  watch(
    () => props.leftSelectValue,
    () => {
      refreshTree();
    }
  );
});

defineExpose({
  refreshTree,
  selectNodeById,
  getCurrentNode,
  attachmentIdMapRef,
  attachmentPageMapRef,
  attachmentListRef,
  abolishNode,
  reName,
  reKind,
  deleteNode
});
</script>

<template>
  <div class="qc-view-kind">
    <div class="header">
      <el-input
        v-model="searchKeyRef"
        style="max-width: 600px"
        placeholder="名称过滤"
        clearable
        :prefix-icon="useRenderIcon(SearchIcon)"
      />
    </div>
    <div class="content">
      <el-tree
        ref="treeRef"
        :draggable="isQc"
        node-key="eid"
        default-expand-all
        highlight-current
        :data="treeDataRef"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @current-change="currentChange"
        @node-drag-start="handleDragStart"
        @node-drag-enter="handleDragEnter"
        @node-drag-leave="handleDragLeave"
        @node-drag-over="handleDragOver"
        @node-drag-end="handleDragEnd"
        @node-drop="handleDrop"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span
              class="item"
              :title="node.label"
              :class="{
                'is-current': newFormInline.selectNodeId == data.eid,
                'is-dragover': dragOverNodeIdRef == data.eid,
                'has-bold': data.type == 1
              }"
              ><span v-if="data.type == 2" style="color: gray"
                >[第{{ data.page }}页]</span
              ><span
                v-if="data.type == 2 && data.status == false"
                style="color: red"
                >[已废止]</span
              ><span class="font-bold"
                >{{ node.label
                }}{{
                  data.type == 1 ? `(${data.children?.length || 0})` : ""
                }}</span
              ></span
            >
            <el-dropdown>
              <el-button
                class="ml-3 mt-[2px]"
                link
                type="primary"
                :icon="useRenderIcon(MoreIcon)"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="data.type === 0"
                    @click="switchShowEmpty"
                  >
                    <el-button
                      link
                      type="primary"
                      :icon="
                        showEmptyRef
                          ? useRenderIcon(ViewOffIcon)
                          : useRenderIcon(ViewIcon)
                      "
                    >
                      {{ showEmptyRef ? "隐藏" : "显示" }}分类空的
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="data.type === 0"
                    @click="switchShowAbolish"
                  >
                    <el-button
                      link
                      type="primary"
                      :icon="
                        showAbolishRef
                          ? useRenderIcon(ViewOffIcon)
                          : useRenderIcon(ViewIcon)
                      "
                    >
                      {{ showAbolishRef ? "隐藏" : "显示" }}废止的
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="data.type === 0" @click="refreshTree">
                    <el-button
                      link
                      type="primary"
                      :icon="useRenderIcon(RefreshIcon)"
                    >
                      重新加载
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="data.type == 2 && isQc"
                    @click="reKind(data)"
                  >
                    <el-button
                      link
                      type="primary"
                      :icon="useRenderIcon(ReCollectIcon)"
                    >
                      重新分类
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="data.type == 2 && isQc"
                    @click="reName(data)"
                  >
                    <el-button
                      link
                      type="primary"
                      :icon="useRenderIcon(RenameIcon)"
                    >
                      重命名
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="
                      (data.type !== 2 || (data.type == 2 && data.status)) &&
                      isQc
                    "
                    @click="abolishNode(data, false)"
                  >
                    <el-button
                      v-auth="'user:resetPassword'"
                      link
                      type="primary"
                      :icon="useRenderIcon(AbolishIcon)"
                    >
                      {{ abolishCaption[data.type] }}
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="
                      (data.type !== 2 || (data.type == 2 && !data.status)) &&
                      isQc
                    "
                    @click="abolishNode(data, true)"
                  >
                    <el-button
                      v-auth="'user:resetPassword'"
                      link
                      type="primary"
                      :icon="useRenderIcon(ReUseIcon)"
                    >
                      {{ unAbolishCaption[data.type] }}
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="isQc" @click="deleteNode(data)">
                    <el-button
                      v-auth="'user:getRoleIdsBy'"
                      link
                      type="primary"
                      :icon="useRenderIcon(DeleteIcon)"
                    >
                      {{ deleteCaption[data.type] }}
                    </el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.qc-view-kind {
  padding: 0 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.qc-view-kind .header {
  height: 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
}

.qc-view-kind .content {
  height: calc(100% - 40px);
  overflow-y: auto;
}

.qc-view-kind .custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: calc(100% - 24px);
}

.qc-view-kind .custom-tree-node .item {
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏超出部分的文本 */
  text-overflow: ellipsis; /* 当文本超出时显示省略号 */
  /* 你可能还需要设置一个固定宽度或最小宽度 */
  /* width: 100%; 或 width: auto; */
}

.qc-view-kind .is-current {
  color: #409eff;
}

.qc-view-kind .is-dragover {
  background-color: yellow;
}

.qc-view-kind .has-bold {
  font-weight: bold;
}
</style>
