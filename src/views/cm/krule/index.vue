<script lang="ts" setup>
import { useKindRule } from "./utils/hook";
import BqImgDrawer from "@/components/BqImgDrawer";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useRoute } from "vue-router";

import Delete from "@iconify-icons/ep/delete";
import { ref } from "vue";
import { DragEvents } from "element-plus/es/components/tree/src/model/useDragNode.mjs";

const treeRef = ref();
const treeTempRef = ref();
const dragOverNodeIdRef = ref("");
const treeDataCloneRef = ref<any[]>();

//获取路由路径
const route = useRoute();
const initKind = route.fullPath == "/mcmgr/krule/index" ? 1 : 0;

const {
  loading,
  isEditing,
  kindList,
  tempList,
  keysList,
  imageSrc,
  drawRect,
  selectKindNodeId,
  selectTempNodeId,
  selectKeyNodeIndex,
  onKindNodeClick,
  onTempNodeClick,
  onNewTempClick,
  onDeleteTempClick,
  onNewTempKeysClick,
  oDeleteTempKeysClick,
  onNewKeyNodeClick,
  onDeleteKeyNodeClick,
  onAddKeyNodeClick,
  onUpdateRect,
  onSave,
  onCancel,
  onHandleUpload
} = useKindRule(initKind, treeRef, treeTempRef);

function filterNode(value: string, data: any) {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  return type !== "inner" && draggingNode.data.eid !== dropNode.data.eid;
};

const allowDrag = (draggingNode: any) => {
  return true;
};

const currentChange = (data: any) => {
  if (data.eid == "0") {
    treeRef.value.setCurrentKey(selectKindNodeId.value);
    return;
  }
};

const handleDragStart = (draggingNode: any) => {
  treeDataCloneRef.value = _.cloneDeep(kindList.value);
  //console.log("drag start", node);
};

const handleDragEnter = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  //console.log("tree drag enter:", dropNode.label);
};

const handleDragLeave = (draggingNode: any, dropNode: any, ev: DragEvents) => {
  //console.log("tree drag leave:", dropNode.label);
};

const handleDragOver = (draggingNode: any, dropNode: any, ev: DragEvents) => {
  dragOverNodeIdRef.value = dropNode.data.eid;
  //console.log("tree drag over:", dropNode.label);
};

const handleDragEnd = (draggingNode: any, dropNode: any, ev: DragEvents) => {
  dragOverNodeIdRef.value = "";
  treeRef.value.setCurrentKey(selectKindNodeId.value);
  //console.log("tree drag end:", dropNode.label);
};

const handleDrop = (
  draggingNode: any,
  dropNode: any,
  dropType: string,
  ev: DragEvents
) => {
  //console.log("tree handleDrop:", dropNode.label);
};
</script>
<template>
  <div class="w-full h-[calc(100vh-131px)] flex">
    <div class="w-[200px] h-full mr-[8px] bg-bg_color px-[4px]">
      <div class="w-full h-[40px] flex items-center justify-between">
        <div class="text-[16px] font-bold">分类列表</div>
      </div>
      <div class="h-[calc(70%-80px)]">
        <el-empty
          v-if="kindList.length < 1"
          description="暂无数据"
          :image-size="60"
        />
        <el-tree
          v-else
          ref="treeRef"
          :draggable="false"
          node-key="eid"
          default-expand-all
          highlight-current
          :data="kindList"
          :props="{
            label: 'name',
            children: 'children'
          }"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          @node-click="onKindNodeClick"
          @current-change="currentChange"
          @node-drag-start="handleDragStart"
          @node-drag-enter="handleDragEnter"
          @node-drag-leave="handleDragLeave"
          @node-drag-over="handleDragOver"
          @node-drag-end="handleDragEnd"
          @node-drop="handleDrop"
        >
          <template #default="{ node, data }">
            <span
              :title="node.label"
              class="w-[calc(100%-24px))] !text-ellipsis !overflow-hidden pl-1 pr-1 rounded flex font-bold items-center select-none hover:text-primary"
              :class="{ 'is-dragover': dragOverNodeIdRef === data.eid }"
              :style="{
                color:
                  data.eid === selectKindNodeId ? 'var(--el-color-primary)' : ''
              }"
            >
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </div>
      <div class="w-full h-[40px] flex items-center justify-between">
        <div class="text-[16px] font-bold">模板列表</div>
        <el-button
          v-if="selectKindNodeId"
          type="primary"
          size="small"
          @click="onNewTempClick"
          >新增模板<input
            type="file"
            style="display: none"
            @change="onHandleUpload"
        /></el-button>
      </div>
      <div class="h-[30%]">
        <el-empty
          v-if="tempList.length < 1"
          description="暂无数据"
          :image-size="60"
        />
        <el-tree
          v-else
          ref="treeTempRef"
          :data="tempList"
          :props="{
            label: 'name',
            children: 'children'
          }"
          node-key="eid"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          @node-click="onTempNodeClick"
        >
          <template #default="{ node, data }">
            <span
              :title="node.label"
              :class="[
                '!inline',
                '!text-ellipsis',
                '!overflow-hidden',
                'pl-1',
                'pr-1',
                'rounded',
                'flex',
                'font-bold',
                'items-center',
                'select-none',
                'hover:text-primary'
              ]"
              :style="{
                color:
                  data.eid === selectTempNodeId ? 'var(--el-color-primary)' : ''
              }"
            >
              <el-popconfirm
                v-if="data.eid === selectTempNodeId"
                title="确认删除当模板吗?"
                @confirm="onDeleteTempClick"
              >
                <template #reference>
                  <el-button
                    tag="danger"
                    title="删除模板"
                    link
                    size="small"
                    :icon="useRenderIcon(Delete)"
                    class="absolute left-0"
                    @click.stop
                  />
                </template>
              </el-popconfirm>
              {{ node.label.substring(20) }}
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="w-[calc(100%-600px)] h-full bg-bg_color px-[4px]">
      <div class="w-full h-[40px] flex items-center justify-between">
        <div class="text-[16px] font-bold">规则预览区域</div>
      </div>
      <div class="h-[calc(100%-40px)] overflow-auto">
        <el-empty v-if="!imageSrc" description="暂无数据" />
        <BqImgDrawer
          v-else
          :rect="drawRect"
          :src="imageSrc"
          @update:rect="onUpdateRect"
        />
      </div>
    </div>
    <div class="w-[368px] h-full bg-bg_color mx-[8px] px-[4px]">
      <div class="w-full h-[40px] flex items-center justify-between">
        <div class="text-[16px] font-bold">规则列表</div>
        <el-space>
          <el-button v-if="isEditing" size="small" @click="onSave"
            >保存</el-button
          >
          <el-button v-if="isEditing" size="small" @click="onCancel"
            >取消</el-button
          >
          <el-button
            v-if="selectTempNodeId"
            type="primary"
            size="small"
            @click="onNewTempKeysClick"
            >新增规则</el-button
          >
        </el-space>
      </div>
      <div class="h-[calc(100%-40px)]">
        <el-empty
          v-if="keysList.length < 1"
          description="暂无数据"
          :image-size="60"
        />
        <el-space v-else direction="vertical" class="h-full overflow-auto">
          <el-card
            v-for="(item, index) in keysList"
            :key="index"
            class="w-[360px]"
            :style="{
              color: selectKeyNodeIndex == index ? 'red' : '',
              background:
                selectKeyNodeIndex == index
                  ? 'var(--el-color-primary-light-8)'
                  : ''
            }"
            @click="onNewKeyNodeClick(index)"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <span>规则{{ index + 1 }}</span>
                <el-space>
                  <el-button
                    type="primary"
                    link
                    @click="onAddKeyNodeClick(index)"
                    >新增关键字</el-button
                  >
                  <el-popconfirm
                    title="确认删除当规则吗?"
                    @confirm="oDeleteTempKeysClick"
                  >
                    <template #reference>
                      <el-button
                        type="danger"
                        link
                        title="删除规则"
                        :icon="useRenderIcon(Delete)"
                      />
                    </template>
                  </el-popconfirm>
                </el-space>
              </div>
            </template>
            <el-space direction="vertical">
              <el-space>
                <el-input v-model="item.x" placeholder="x" />
                <el-input v-model="item.y" placeholder="x" />
                <el-input v-model="item.w" placeholder="x" />
                <el-input v-model="item.h" placeholder="x" />
              </el-space>
              <el-space
                v-for="(sub, subIndex) in item.keys"
                :key="'sub_' + subIndex"
              >
                <span>关键字{{ subIndex + 1 }}</span>
                <el-input v-model="item.keys[subIndex]" placeholder="关键字" />
                <el-button
                  type="danger"
                  link
                  @click="onDeleteKeyNodeClick(index, subIndex)"
                  >删除</el-button
                >
              </el-space>
            </el-space>
            <p />
          </el-card>
        </el-space>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.is-dragover {
  background-color: yellow;
}
</style>
