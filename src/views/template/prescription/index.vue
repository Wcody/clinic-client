<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Delete } from "@element-plus/icons-vue";
import BqMedicineSelector from "@/components/BqMedicineSelector";
import {
  type BQPrescriptionTemplateEntityType,
  type BQPrescriptionTemplateDetailEntityType,
  getPrescriptionTemplateEntityDefault,
  getPrescriptionTemplateDetailEntityDefault,
  getPrescriptionTemplateTreeApi,
  getPrescriptionTemplateApi,
  addPrescriptionTemplateApi,
  updatePrescriptionTemplateApi,
  deletePrescriptionTemplateApi,
  getPrescriptionTemplateDetailByTemplateIdApi,
  addPrescriptionTemplateDetailApi,
  updatePrescriptionTemplateDetailApi,
  deletePrescriptionTemplateDetailApi
} from "@/api/cm/prescriptionTemplate";
import {
  getMedicalDictionaryListApi,
  type BQMedicalDictionaryEntityType
} from "@/api/cm/medicalDictionary";
import { BQSearchFilter } from "@/api/api";

defineOptions({
  name: "TemplatePrescriptionIndex"
});

// ─── Types ─────────────────────────────────────────────────────
type DrugItem = {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  unit: string;
  decoctionMethod: string;
};

const listLoading = ref(false);
const formLoading = ref(false);
const treeData = ref<any[]>([]);
const selectedId = ref("");
const isNew = ref(false);
const isCategoryNode = ref(false); // 标记当前选中的是否为目录节点
const searchKeyword = ref("");
const addDrugInputText = ref("");

const form = reactive<BQPrescriptionTemplateEntityType>(
  getPrescriptionTemplateEntityDefault()
);
const metaInfo = reactive({ updatedTime: "", updatedBy: "" });

// 前端使用的药品列表（用于编辑）
const drugItems = ref<DrugItem[]>([]);

// 医疗字典数据（单位、煎药方式）
const unitOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const decoctionOptions = ref<BQMedicalDictionaryEntityType[]>([]);

// ─── 计算属性 ─────────────────────────────────────────────────
const hasSelected = computed(() => !!selectedId.value || isNew.value);

// 过滤后的树形数据（本地搜索）
const filteredTreeData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return treeData.value;
  }

  const keyword = searchKeyword.value.toLowerCase().trim();

  // 递归过滤树形节点
  const filterNodes = (nodes: any[]): any[] => {
    return nodes
      .map(node => {
        // 深拷贝节点，避免修改原数据
        const newNode = { ...node };

        // 如果有子节点，先递归过滤子节点
        if (node.children && node.children.length > 0) {
          newNode.children = filterNodes(node.children);
        }

        // 判断当前节点是否匹配
        const nameMatch = node.name?.toLowerCase().includes(keyword);

        // 如果当前节点匹配，或者有匹配的子节点，则保留
        if (nameMatch || (newNode.children && newNode.children.length > 0)) {
          return newNode;
        }

        return null;
      })
      .filter(node => node !== null);
  };

  return filterNodes(treeData.value);
});

// 高亮关键字的辅助函数（使用 render 函数方式）
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || !text) {
    return text;
  }

  const regex = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, '<span class="highlight-keyword">$1</span>');
};

// 自定义树节点渲染函数
const renderTreeNode = (h: any, { node, data }: any) => {
  const keyword = searchKeyword.value.trim();
  let labelContent = node.label;

  // 如果有搜索关键字，进行高亮处理
  if (keyword && labelContent) {
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = labelContent.split(regex);

    return h(
      "span",
      {
        class: [
          "text-[13px] select-none truncate w-full",
          data.hasCategory
            ? "font-medium text-[var(--el-text-color-primary)]"
            : "text-[var(--el-text-color-regular)]"
        ],
        title: node.label
      },
      parts.map((part: string, index: number) => {
        if (part.toLowerCase() === keyword.toLowerCase()) {
          return h(
            "span",
            {
              key: index,
              style: {
                color: "#409eff",
                fontWeight: "bold",
                backgroundColor: "#ecf5ff",
                padding: "0 2px",
                borderRadius: "2px"
              }
            },
            part
          );
        }
        return part;
      })
    );
  }

  // 无搜索关键字时正常显示
  return h(
    "span",
    {
      class: [
        "text-[13px] select-none truncate w-full",
        data.hasCategory
          ? "font-medium text-[var(--el-text-color-primary)]"
          : "text-[var(--el-text-color-regular)]"
      ],
      title: node.label
    },
    labelContent
  );
};

// ─── 数据加载 ─────────────────────────────────────────────────
const loadTreeData = async () => {
  listLoading.value = true;
  try {
    const res = await getPrescriptionTemplateTreeApi();
    if (res.code === 0 && res.data) {
      treeData.value = res.data;
    } else {
      ElMessage.error(res.errMsg || res.message || "加载树形数据失败");
    }
  } catch (error) {
    console.error("加载树形数据失败:", error);
    ElMessage.error("加载树形数据失败");
  } finally {
    listLoading.value = false;
  }
};

// 加载医疗字典数据（单位、煎药方式）
const loadMedicalDictionaries = async () => {
  console.log("开始加载医疗字典数据...");
  try {
    // 加载单位列表 (dictType=3)
    console.log("请求单位列表, dictType=3");
    const unitRes = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "3")]
    });
    console.log("单位列表响应:", unitRes);
    if (unitRes.code === 0 && unitRes.data) {
      unitOptions.value = unitRes.data.filter(
        (item: any) => item.status !== false
      );
      console.log("单位列表加载成功，数量:", unitOptions.value.length);
    } else {
      console.warn("单位列表加载失败:", unitRes);
    }

    // 加载煎药方式列表 (dictType=5)
    console.log("请求煎药方式列表, dictType=5");
    const decoctionRes = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "5")]
    });
    console.log("煎药方式列表响应:", decoctionRes);
    if (decoctionRes.code === 0 && decoctionRes.data) {
      decoctionOptions.value = decoctionRes.data.filter(
        (item: any) => item.status !== false
      );
      console.log("煎药方式列表加载成功，数量:", decoctionOptions.value.length);
    } else {
      console.warn("煎药方式列表加载失败:", decoctionRes);
    }
  } catch (error) {
    console.error("加载医疗字典数据失败:", error);
  }
};

// 加载模板明细
const loadTemplateDetails = async (templateId: string) => {
  console.log("=== 开始加载模板明细 ===");
  console.log("模板ID:", templateId);

  try {
    const res = await getPrescriptionTemplateDetailByTemplateIdApi(templateId);
    console.log("明细API响应:", res);

    if (res.code === 0 && res.data) {
      const details = res.data || [];
      console.log("明细数据条数:", details.length);

      // 转换为前端使用的格式
      drugItems.value = details.map(
        (detail: BQPrescriptionTemplateDetailEntityType) => {
          console.log("处理明细项:", detail);

          // 根据单位ID查找单位名称
          const unitName =
            detail.quantityUnit !== undefined && detail.quantityUnit !== null
              ? unitOptions.value.find(u => u.id === detail.quantityUnit)
                  ?.name || "g"
              : "g";

          // 根据煎药方式ID查找名称
          const decoctionName =
            detail.cookingType !== undefined && detail.cookingType !== null
              ? decoctionOptions.value.find(d => d.id === detail.cookingType)
                  ?.name || ""
              : "";

          return {
            id: detail.id
              ? String(detail.id)
              : `item-${Date.now()}-${Math.random()}`,
            drugId: detail.drugId || "",
            drugName: detail.drugName || "",
            quantity: detail.quantity || 0,
            unit: unitName,
            decoctionMethod: decoctionName
          };
        }
      );

      console.log("转换后的drugItems:", drugItems.value);
      console.log("=== 模板明细加载成功 ===");
    } else {
      drugItems.value = [];
      console.warn("明细数据为空或请求失败");
    }
  } catch (error) {
    console.error("加载模板明细失败:", error);
    drugItems.value = [];
  }
};

// ─── 操作 ─────────────────────────────────────────────────────
const handleNodeClick = async (data: any) => {
  selectedId.value = String(data.id);

  if (data.hasCategory) {
    // 点击的是目录节点
    isCategoryNode.value = true;
    isNew.value = false;
    // 清空表单，显示目录属性编辑界面
    Object.assign(
      form,
      getPrescriptionTemplateEntityDefault({
        eid: String(data.id), // 将Integer转换为string
        name: data.name,
        hasCategory: true,
        parentId: data.parentId
      } as any)
    );
    drugItems.value = [];
    metaInfo.updatedTime = "";
    metaInfo.updatedBy = "";
  } else {
    // 点击的是叶子节点（模板）
    isCategoryNode.value = false;
    await selectTemplate(String(data.id)); // 确保传递string类型
  }
};

const selectTemplate = async (templateId: string) => {
  console.log("=== 开始加载模板详情 ===");
  console.log("模板ID:", templateId);

  try {
    const res = await getPrescriptionTemplateApi(templateId);
    console.log("API响应:", res);

    if (res.code === 0 && res.data) {
      const item = res.data;
      console.log("模板数据:", item);

      // 关键修复：使用后端返回的 id 字段（Integer类型）
      const id = item.id || Number(templateId);
      console.log("使用的id:", id);

      selectedId.value = String(id);
      isNew.value = false;
      Object.assign(form, getPrescriptionTemplateEntityDefault(item));
      // 确保 id 被正确设置到 form 中
      (form as any).id = id;

      metaInfo.updatedTime = item.updateTime ?? item.createdTime ?? "";
      metaInfo.updatedBy = item.updatedBy ?? item.createdBy ?? "";

      // 加载明细 - 使用正确的 id
      console.log("准备加载明细，templateId:", id);
      await loadTemplateDetails(String(id));

      console.log("=== 模板详情加载成功 ===");
    } else {
      console.error("API返回错误:", res);
      ElMessage.error(res.errMsg || res.message || "加载模板详情失败");
    }
  } catch (error) {
    console.error("加载模板详情失败:", error);
    ElMessage.error("加载模板详情失败");
  }
};

const handleAdd = (isCategory: boolean = false) => {
  selectedId.value = "";
  isNew.value = true;
  isCategoryNode.value = isCategory;

  if (isCategory) {
    // 新增目录
    Object.assign(
      form,
      getPrescriptionTemplateEntityDefault({
        hasCategory: true,
        parentId: null
      } as any)
    );
  } else {
    // 新增模板
    Object.assign(
      form,
      getPrescriptionTemplateEntityDefault({
        hasCategory: false
      } as any)
    );
  }

  drugItems.value = [];
  metaInfo.updatedTime = "";
  metaInfo.updatedBy = "";
};

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning("请输入名称");
    return;
  }

  formLoading.value = true;
  try {
    const now = new Date().toISOString();
    let templateId = (form as any).id;

    if (isCategoryNode.value) {
      // 保存目录节点
      const submitData = {
        ...form,
        hasCategory: true,
        updatedTime: now
      };

      if (isNew.value) {
        submitData.createdTime = now;
        const res = await addPrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          templateId = res.data.id;
          ElMessage.success("目录保存成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      } else {
        const res = await updatePrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          ElMessage.success("目录更新成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      }
    } else {
      // 保存模板节点
      if (isNew.value) {
        // 新增主表
        const submitData = {
          ...form,
          hasCategory: false,
          createdTime: now,
          updatedTime: now
        };

        const res = await addPrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          templateId = res.data.id;
          ElMessage.success("模板保存成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      } else {
        // 更新主表
        const submitData = {
          ...form,
          hasCategory: false,
          updatedTime: now
        };

        const res = await updatePrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          ElMessage.success("模板更新成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      }

      // 保存明细（先删除旧的，再新增新的）
      if (templateId) {
        try {
          // 1. 删除旧明细（如果是更新模式）
          if (!isNew.value) {
            const oldDetails =
              await getPrescriptionTemplateDetailByTemplateIdApi(
                String(templateId)
              );
            if (
              oldDetails.code === 0 &&
              oldDetails.data &&
              oldDetails.data.length > 0
            ) {
              const deleteIds = oldDetails.data
                .map((d: any) => d.id)
                .filter(Boolean);
              if (deleteIds.length > 0) {
                // 批量删除旧明细
                await Promise.all(
                  deleteIds.map((id: number) =>
                    deletePrescriptionTemplateDetailApi(String(id))
                  )
                );
              }
            }
          }

          // 2. 新增新明细
          if (drugItems.value.length > 0) {
            // 逐条新增明细
            for (const item of drugItems.value) {
              const detailData = {
                templateId: Number(templateId),
                drugId: item.drugId,
                drugName: item.drugName,
                quantity: item.quantity,
                quantityUnit: findUnitIdByName(item.unit), // 将名称转换为ID
                cookingType: findDecoctionIdByName(item.decoctionMethod), // 将名称转换为ID
                sort: 0
              };

              await addPrescriptionTemplateDetailApi(detailData);
            }
          }
        } catch (detailError) {
          console.error("保存明细失败:", detailError);
          ElMessage.warning("模板保存成功，但明细保存失败");
        }
      }
    }

    // 重新加载树形数据
    await loadTreeData();
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  } finally {
    formLoading.value = false;
  }
};

const handleCancel = () => {
  if (isNew.value) {
    isNew.value = false;
    // 取消新增时，如果有选中的节点，重新加载该节点详情（如果需要恢复原状）
    // 由于树形结构数据可能在 loadTreeData 中获取，这里简单处理：
    // 如果之前有选中 ID，尝试在 treeData 中查找并重新 select
    if (selectedId.value) {
      // 简单递归查找或直接依赖用户重新点击
      // 为了体验，最好能恢复之前的状态。
      // 这里暂时不做复杂恢复，仅重置状态
    }
  } else {
    // 编辑模式下取消，重新加载当前选中模板的详情
    if (selectedId.value) {
      // 需要在 treeData 中找到对应的 template 对象
      // 由于 treeData 结构可能嵌套，这里简化处理：
      // 实际上 selectTemplate 需要完整的 entity 对象。
      // 如果我们在 handleNodeClick 中保存了当前选中的完整对象会更好。
      // 暂时假设用户会重新点击或我们只重置表单脏数据
      // 更好的做法：在 selectTemplate 时备份原始数据
    }
  }
};

// 停用/启用状态变化处理
const handleStatusChange = async (value: boolean) => {
  if (isNew.value || !selectedId.value) {
    return;
  }

  try {
    const now = new Date().toISOString();
    const submitData = {
      ...(form as any),
      status: value,
      updatedTime: now
    };

    const res = await updatePrescriptionTemplateApi(submitData);
    if (res.code === 0) {
      ElMessage.success(value ? "已启用" : "已停用");
      // 重新加载树形数据以更新显示
      await loadTreeData();
    } else {
      ElMessage.error(res.errMsg || res.message || "状态更新失败");
      // 恢复原状态
      form.status = !value;
    }
  } catch (error) {
    console.error("状态更新失败:", error);
    ElMessage.error("状态更新失败");
    // 恢复原状态
    form.status = !value;
  }
};

// 根据单位名称查找ID
const findUnitIdByName = (unitName: string): number | undefined => {
  const unit = unitOptions.value.find(u => u.name === unitName);
  return unit?.id;
};

// 根据煎药方式名称查找ID
const findDecoctionIdByName = (decoctionName: string): number | undefined => {
  const decoction = decoctionOptions.value.find(d => d.name === decoctionName);
  return decoction?.id;
};

const handleDelete = async () => {
  if (!selectedId.value) return;

  const confirmMsg = isCategoryNode.value
    ? "确认删除该目录？如果目录下有子节点，将无法删除。"
    : "确认删除该模板？删除后不可恢复。";

  await ElMessageBox.confirm(confirmMsg, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  });

  try {
    const res = await deletePrescriptionTemplateApi(selectedId.value);
    if (res) {
      ElMessage.success("删除成功");
      selectedId.value = "";
      isNew.value = false;
      isCategoryNode.value = false;
      drugItems.value = [];
      metaInfo.updatedTime = "";
      metaInfo.updatedBy = "";
      // 重新加载树形数据
      await loadTreeData();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败");
  }
};

// ─── 药品操作 ─────────────────────────────────────────────────
const handleDrugSelect = (medicine: any) => {
  drugItems.value.push({
    id: `item-${Date.now()}`,
    drugId: String(medicine.id ?? ""),
    drugName: medicine.name,
    quantity: 10,
    unit: "g",
    decoctionMethod: ""
  });
  addDrugInputText.value = "";
};

const removeDrugItem = (index: number) => {
  drugItems.value.splice(index, 1);
};

onMounted(() => {
  loadTreeData();
  loadMedicalDictionaries();
});
</script>

<template>
  <div
    class="w-full h-[calc(100vh-131px)] flex gap-[6px] p-[6px] bg-[var(--el-bg-color-page)]"
  >
    <!-- 左侧：400px，树形列表 -->
    <div
      class="w-[400px] shrink-0 h-full bg-bg_color flex flex-col overflow-hidden"
    >
      <!-- 搜索栏 (移除了状态筛选) -->
      <div
        class="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-[var(--el-border-color-light)]"
      >
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称"
          clearable
          size="small"
          class="flex-1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 树形列表 -->
      <div v-loading="listLoading" class="flex-1 overflow-y-auto py-1">
        <el-empty
          v-if="filteredTreeData.length === 0"
          description="暂无数据"
          :image-size="50"
          class="mt-10"
        />
        <el-tree
          v-else
          :data="filteredTreeData"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          :current-node-key="selectedId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :render-content="renderTreeNode"
          @node-click="handleNodeClick"
        />
      </div>
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 h-full bg-bg_color flex flex-col overflow-hidden">
      <!-- 操作栏 -->
      <div
        class="h-[44px] shrink-0 flex items-center justify-between px-4 border-b border-[var(--el-border-color-light)]"
      >
        <div class="flex items-center gap-2">
          <!-- <el-button type="primary" size="small" @click="handleAdd(false)"
            >+ 新增模板</el-button
          >
          <el-button type="success" size="small" @click="handleAdd(true)"
            >+ 新增目录</el-button
          > -->
        </div>
        <div class="flex items-center gap-2">
          <!-- <el-button
            type="primary"
            size="small"
            :loading="formLoading"
            :disabled="!hasSelected"
            @click="handleSave"
          >
            保存
          </el-button>
          <el-button
            size="small"
            :disabled="!hasSelected"
            @click="handleCancel"
          >
            取消
          </el-button>
          <el-button
            type="danger"
            size="small"
            :disabled="isNew || !selectedId"
            @click="handleDelete"
          >
            删除
          </el-button> -->
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 目录属性编辑 -->
        <el-form
          v-if="hasSelected && isCategoryNode"
          :model="form"
          label-width="90px"
          size="small"
          class="px-4 pt-3 pb-4"
        >
          <el-alert
            title="当前为目录节点"
            type="info"
            :closable="false"
            show-icon
            class="mb-4"
          />

          <!-- 目录名称 -->
          <el-form-item label="目录名称">
            <el-input
              v-model="form.name"
              placeholder="请输入目录名称"
              disabled
            />
          </el-form-item>

          <!-- 父级目录 -->
          <el-form-item label="父级目录">
            <el-input
              :value="form.parentId ? '已设置' : '根目录'"
              disabled
              placeholder="父级目录ID"
            />
          </el-form-item>

          <!-- 状态 -->
          <el-form-item label="状态">
            <el-switch
              v-model="form.status"
              active-text="启用"
              inactive-text="停用"
              :disabled="isNew"
              @change="handleStatusChange"
            />
          </el-form-item>
        </el-form>

        <!-- 模板详情编辑 -->
        <el-form
          v-else-if="hasSelected && !isCategoryNode"
          :model="form"
          label-width="90px"
          size="small"
          class="px-4 pt-3 pb-4"
        >
          <!-- 模板名称 -->
          <el-form-item label="模板名称">
            <el-input
              v-model="form.name"
              placeholder="请输入模板名称"
              disabled
            />
          </el-form-item>

          <!-- 模板类别 + 处方类型 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="模板类别">
                <el-select
                  v-model="form.templateType"
                  style="width: 100%"
                  disabled
                >
                  <el-option label="个人" :value="false" />
                  <el-option label="公共" :value="true" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处方类型">
                <el-select
                  v-model="form.prescriptionType"
                  style="width: 100%"
                  disabled
                >
                  <el-option label="中药" :value="true" />
                  <el-option label="西药" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 处方描述 -->
          <el-form-item label="处方描述">
            <el-input
              v-model="form.recommendation"
              type="textarea"
              :rows="5"
              placeholder="请输入处方描述/医嘱"
              disabled
            />
          </el-form-item>

          <!-- 剂数 + 频率 + 用法 -->
          <div class="flex items-center gap-4 mb-4 pl-[90px]">
            <div class="flex items-center gap-2">
              <span class="field-label">剂数</span>
              <el-input-number
                v-model="form.doseAmount"
                :min="1"
                :max="999"
                :controls="false"
                style="width: 72px"
                disabled
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">频率</span>
              <el-select v-model="form.frequence" style="width: 160px" disabled>
                <el-option label="每日一次" :value="1" />
                <el-option label="每日两次" :value="2" />
                <el-option label="每日三次" :value="3" />
                <el-option label="每日四次" :value="4" />
              </el-select>
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">用法</span>
              <el-select v-model="form.usageType" style="width: 120px" disabled>
                <el-option label="口服" :value="1" />
                <el-option label="外用" :value="2" />
                <el-option label="注射" :value="3" />
              </el-select>
            </div>
          </div>

          <!-- 药品明细表 -->
          <div class="drug-table-wrapper">
            <table class="drug-table">
              <thead>
                <tr>
                  <th style="width: 200px">药品名称</th>
                  <th style="width: 180px">数量</th>
                  <th style="width: 160px">煎药方式</th>
                  <th style="width: 80px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="drugItems.length === 0">
                  <td colspan="4" class="empty-row">
                    暂无药品，请在下方搜索添加
                  </td>
                </tr>
                <tr v-for="(item, index) in drugItems" :key="item.id">
                  <td class="drug-name-cell">
                    {{ index + 1 }}. {{ item.drugName }}
                  </td>
                  <td>
                    <div class="qty-cell">
                      <el-input-number
                        v-model="item.quantity"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        class="qty-input"
                        disabled
                      />
                      <el-select
                        v-model="item.unit"
                        class="unit-select"
                        disabled
                        placeholder="请选择单位"
                      >
                        <el-option
                          v-for="unit in unitOptions"
                          :key="unit.id"
                          :label="unit.name"
                          :value="unit.name"
                        />
                      </el-select>
                    </div>
                  </td>
                  <td>
                    <el-select
                      v-model="item.decoctionMethod"
                      clearable
                      placeholder="请选择煎药方式"
                      class="decoction-select"
                      disabled
                    >
                      <el-option
                        v-for="decoction in decoctionOptions"
                        :key="decoction.id"
                        :label="decoction.name"
                        :value="decoction.name"
                      />
                    </el-select>
                  </td>
                  <td class="action-cell">
                    <!-- 暂时隐藏删除按钮 -->
                    <!-- <el-button
                      type="danger"
                      link
                      :icon="Delete"
                      @click="removeDrugItem(index)"
                    /> -->
                  </td>
                </tr>
                <!-- 底部药品选择行 - 暂时隐藏 -->
                <!-- <tr>
                  <td colspan="4" class="selector-row">
                    <BqMedicineSelector
                      v-model="addDrugInputText"
                      placeholder="请输入药品名称搜索并添加"
                      @select="handleDrugSelect"
                    />
                  </td>
                </tr> -->
              </tbody>
            </table>
          </div>

          <!-- 底部状态栏 -->
          <div
            class="flex items-center justify-end gap-6 mt-3 text-[12px] text-[var(--el-text-color-secondary)]"
          >
            <div class="flex items-center gap-2">
              <span>状态：</span>
              <el-switch
                v-model="form.status"
                active-text="启用"
                inactive-text="停用"
                :disabled="isNew"
                @change="handleStatusChange"
              />
            </div>
            <span
              >操作时间：{{
                metaInfo.updatedTime
                  ? new Date(metaInfo.updatedTime).toLocaleString("zh-CN")
                  : "-"
              }}</span
            >
            <span>操作人：{{ metaInfo.updatedBy || "-" }}</span>
          </div>
        </el-form>

        <el-empty
          v-else
          description="请从左侧选择模板或点击新增"
          class="mt-20"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

.field-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.drug-table-wrapper {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.drug-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background-color: var(--el-fill-color-light);

    th {
      padding: 10px 8px;
      text-align: center;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }

  tbody {
    tr {
      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        vertical-align: middle;

        &:last-child {
          border-bottom-color: transparent;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }

  .drug-name-cell {
    color: var(--el-text-color-regular);
    padding-left: 12px;
  }

  .qty-cell {
    display: flex;
    align-items: center;
    gap: 4px;

    .qty-input {
      width: 80px;
    }

    .unit-select {
      width: 72px;
    }
  }

  .decoction-select {
    width: 100%;
  }

  .action-cell {
    text-align: center;

    .el-button {
      font-size: 16px;
    }
  }

  .empty-row {
    text-align: center;
    color: var(--el-text-color-placeholder);
    padding: 20px;
    font-size: 13px;
  }

  .selector-row {
    padding: 6px 8px;
    background-color: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-light);
  }

  // 搜索关键字高亮样式
  :deep(.highlight-keyword) {
    color: #409eff;
    font-weight: bold;
    background-color: #ecf5ff;
    padding: 0 2px;
    border-radius: 2px;
  }
}
</style>
