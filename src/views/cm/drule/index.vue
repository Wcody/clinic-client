<script lang="ts" setup>
import { useKindRule } from "./utils/hook";
import BqImgDrawer from "@/components/BqImgDrawer";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useRoute } from "vue-router";

import Delete from "@iconify-icons/ep/delete";
import { onMounted, ref } from "vue";
import { getRecordFieldOptionsApi } from "@/api/cm/record";
import { fa } from "element-plus/es/locales.mjs";

//获取路由路径
const route = useRoute();
const initKind = route.fullPath == "/mcmgr/drule/index" ? 1 : 0;

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
} = useKindRule(initKind);

const optionsRef = ref([]);

onMounted(async () => {
  const res = await getRecordFieldOptionsApi(initKind);
  if (res.code === 0) {
    // 按照名称顺序排序
    res.data.sort((a, b) => a.label.localeCompare(b.label));
    optionsRef.value = res.data;
  }
  console.log("res", res);
});

function onChangeEnFieldName(item, value) {
  const selectedOption = optionsRef.value.find(
    option => option.value === value
  );
  // 如果找到对应的 label，则赋值
  if (selectedOption) {
    item.cnFieldName = selectedOption.label;
  } else {
    item.cnFieldName = ""; // 如果未找到，清空
  }
}
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
          :data="kindList"
          :props="{
            label: 'name',
            children: 'children'
          }"
          node-key="eid"
          default-expand-all
          :expand-on-click-node="false"
          @node-click="onKindNodeClick"
        >
          <template #default="{ node, data }">
            <span
              :title="node.label"
              :class="[
                'w-[calc(100%-24px))]',
                '!inline',
                '!text-ellipsis',
                '!overflow-hidden',
                'pl-1',
                'pr-1',
                'rounded',
                'flex',
                'items-center',
                'select-none',
                'hover:text-primary'
              ]"
              :style="{
                color:
                  data.eid === selectKindNodeId
                    ? 'var(--el-color-primary)'
                    : '',
                background:
                  data.eid === selectKindNodeId
                    ? 'var(--el-color-primary-light-7)'
                    : 'transparent'
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
          v-if="selectKindNodeId && false"
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
          :data="tempList"
          :props="{
            label: 'name',
            children: 'children'
          }"
          node-key="eid"
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
                'items-center',
                'select-none',
                'hover:text-primary'
              ]"
              :style="{
                color:
                  data.eid === selectTempNodeId
                    ? 'var(--el-color-primary)'
                    : '',
                background:
                  data.eid === selectTempNodeId
                    ? 'var(--el-color-primary-light-7)'
                    : 'transparent'
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
        <div class="text-[16px] font-bold">字段预览区域</div>
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
        <div class="text-[16px] font-bold">字段列表</div>
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
            >新增字段</el-button
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
                  ? 'var(--el-color-primary-light-7)'
                  : ''
            }"
            @click="onNewKeyNodeClick(index)"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <span>采集字段{{ index + 1 }}</span>
                <el-space>
                  <el-button
                    v-if="false"
                    type="primary"
                    link
                    @click="onAddKeyNodeClick(index)"
                    >新增关键字</el-button
                  >
                  <el-popconfirm
                    title="确认删除当字段吗?"
                    @confirm="oDeleteTempKeysClick"
                  >
                    <template #reference>
                      <el-button
                        type="danger"
                        link
                        title="删除字段"
                        :icon="useRenderIcon(Delete)"
                      />
                    </template>
                  </el-popconfirm>
                </el-space>
              </div>
            </template>
            <div v-if="false" class="flex items-center justify-between mb-1">
              <span>自定义字段</span>
              <el-switch v-model="item.c" />
            </div>

            <div class="flex items-center justify-between mb-1">
              <span>系统字段</span>
              <el-select
                v-model="item.enFieldName"
                class="!w-[200px]"
                filterable
                clearable
                placeholder="选择系统字段"
                @change="value => onChangeEnFieldName(item, value)"
              >
                <el-option
                  v-for="item in optionsRef"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="flex items-center justify-between mb-1">
              <span>唯一性校验字段</span>
              <el-switch v-model="item.u" />
            </div>
            <el-space direction="vertical">
              <el-space v-if="false">
                <span>中文字段名称</span>
                <el-input
                  v-model="item.cnFieldName"
                  placeholder="字段的显示名称"
                />
              </el-space>
              <el-space v-if="false">
                <span>英文字段名称</span>
                <el-input v-model="item.enFieldName" placeholder="首字母小写" />
              </el-space>
              <el-space v-if="false">
                <span>内容采纳概率</span>
                <el-input v-model="item.percentage" placeholder="0-1的小数" />
              </el-space>
              <el-space>
                <el-input v-model="item.x" placeholder="x" />
                <el-input v-model="item.y" placeholder="x" />
                <el-input v-model="item.w" placeholder="x" />
                <el-input v-model="item.h" placeholder="x" />
              </el-space>
            </el-space>
            <p />
          </el-card>
        </el-space>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
