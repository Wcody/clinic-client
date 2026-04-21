<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
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
import WesternTemplateItems from "./comp/WesternTemplateItems.vue";
import ChineseTemplateItems from "./comp/ChineseTemplateItems.vue";

defineOptions({
  name: "TemplatePrescriptionIndex"
});

// 前端使用的药品明细列表（用于编辑）
const drugItems = ref<BQPrescriptionTemplateDetailEntityType[]>([]);

// 医疗字典数据（用法、频率、单位、煎药方式）
const usageOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const frequenceOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const unitOptions = ref<BQMedicalDictionaryEntityType[]>([]);
const decoctionOptions = ref<BQMedicalDictionaryEntityType[]>([]);

// 状态变量
const listLoading = ref(false);
const formLoading = ref(false);
const treeData = ref<any[]>([]);
const selectedId = ref("");
const isNew = ref(false);
const isCategoryNode = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const searchKeyword = ref("");
const isDirty = ref(false);
const addDrugInputText = ref("");
const firstLevelCustomName = ref("");
const secondLevelCustomName = ref("");
const chineseTemplateRef = ref<InstanceType<typeof ChineseTemplateItems> | null>(null);

const form = reactive<BQPrescriptionTemplateEntityType>(
  getPrescriptionTemplateEntityDefault()
);
const metaInfo = reactive({ updatedTime: "", updatedBy: "" });

// ─── 计算属性 ─────────────────────────────────────────────────
const hasSelected = computed(() => !!selectedId.value || isNew.value);
const canEdit = computed(() => !!selectedId.value && !isNew.value && !isCategoryNode.value);
const canDelete = computed(() => !!selectedId.value && !isNew.value && !isCategoryNode.value);
const formDisabled = computed(() => !isNew.value && !isEditing.value);

// 当前选中节点是否为目录且无子节点（可删除）
const canDeleteCategory = computed(() => {
  if (!isCategoryNode.value || !selectedId.value) return false;
  const node = findNodeById(treeData.value, selectedId.value);
  return node && (!node.children || node.children.length === 0);
});

// 根据ID查找树节点
const findNodeById = (nodes: any[], id: string): any => {
  for (const node of nodes) {
    if (String(node.id) === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 一级目录选项
const firstLevelOptions = computed(() => {
  return treeData.value
    .filter(node => node.hasCategory)
    .map(node => ({
      id: node.id,
      name: node.name
    }));
});

// 二级目录选项
const secondLevelOptions = computed(() => {
  if (!form.oneLevel) return [];
  const parentNode = treeData.value.find(node => node.id === form.oneLevel);
  if (!parentNode || !parentNode.children) return [];
  return parentNode.children
    .filter((child: any) => child.hasCategory)
    .map((child: any) => ({
      id: child.id,
      name: child.name
    }));
});

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

// 监听表单变化，标记脏值
watch(
  () => ({ ...form }),
  () => {
    if (hasSelected.value && !isCategoryNode.value && !isLoading.value) {
      isDirty.value = true;
    }
  },
  { deep: true }
);

// 监听一级目录变化
watch(
  () => form.oneLevel,
  (newVal) => {
    // 当切换一级目录时，清空二级目录选择
    if (!isLoading.value) {
      form.twoLevel = null;
    }
    // 如果是字符串（自由录入），保存自定义名称
    if (typeof newVal === "string" && newVal) {
      firstLevelCustomName.value = newVal;
    } else {
      firstLevelCustomName.value = "";
    }
  }
);

// 监听二级目录变化
watch(
  () => form.twoLevel,
  (newVal) => {
    // 如果是字符串（自由录入），保存自定义名称
    if (typeof newVal === "string" && newVal) {
      secondLevelCustomName.value = newVal;
    } else {
      secondLevelCustomName.value = "";
    }
  }
);

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

// ─── 数据加载 ─────────────────────────────────────────────────
const loadTreeData = async () => {
  listLoading.value = true;
  try {
    const res = await getPrescriptionTemplateTreeApi();
    if (res.code === 0 && res.data) {
      treeData.value = res.data;
      console.log("树形数据:", JSON.stringify(res.data, null, 2));
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
    // 加载用法列表 (dictType=1)
    console.log("请求用法列表, dictType=1");
    const usageRes = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "1")]
    });
    console.log("用法列表响应:", usageRes);
    if (usageRes.code === 0 && usageRes.data) {
      usageOptions.value = usageRes.data.filter(
        (item: any) => item.status !== false
      );
      console.log("用法列表加载成功，数量:", usageOptions.value.length);
    } else {
      console.warn("用法列表加载失败:", usageRes);
    }

    // 加载频率列表 (dictType=2)
    console.log("请求频率列表, dictType=2");
    const frequenceRes = await getMedicalDictionaryListApi({
      filters: [new BQSearchFilter("dictType", "eq", "2")]
    });
    console.log("频率列表响应:", frequenceRes);
    if (frequenceRes.code === 0 && frequenceRes.data) {
      frequenceOptions.value = frequenceRes.data.filter(
        (item: any) => item.status !== false
      );
      console.log("频率列表加载成功，数量:", frequenceOptions.value.length);
    } else {
      console.warn("频率列表加载失败:", frequenceRes);
    }

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

          return {
            ...detail,
            id: detail.id ?? `item-${Date.now()}-${Math.random()}`
          } as BQPrescriptionTemplateDetailEntityType;
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
  const targetId = String(data.id);

  // 如果点击的是当前选中节点，不做处理
  if (targetId === selectedId.value && !isNew.value) return;

  selectedId.value = targetId;
  isEditing.value = false;
  isDirty.value = false;
  // 清空自定义目录名称
  firstLevelCustomName.value = "";
  secondLevelCustomName.value = "";
  form.twoLevel = null;

  if (data.hasCategory) {
    isCategoryNode.value = true;
    isNew.value = false;
    Object.assign(
      form,
      getPrescriptionTemplateEntityDefault({
        eid: String(data.id),
        name: data.name,
        hasCategory: true,
        parentId: data.parentId
      } as any)
    );
    drugItems.value = [];
    metaInfo.updatedTime = "";
    metaInfo.updatedBy = "";
  } else {
    isCategoryNode.value = false;
    isNew.value = false;
    await selectTemplate(String(data.id));
  }
};

const selectTemplate = async (templateId: string) => {
  isLoading.value = true;
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
      isDirty.value = false;

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
  } finally {
    isLoading.value = false;
  }
};

const handleAdd = (isCategory: boolean = false) => {
  selectedId.value = "";
  isNew.value = true;
  isCategoryNode.value = isCategory;
  isEditing.value = false;
  isDirty.value = false;
  // 清空自定义目录名称
  firstLevelCustomName.value = "";
  secondLevelCustomName.value = "";
  form.twoLevel = null;

  if (isCategory) {
    Object.assign(
      form,
      getPrescriptionTemplateEntityDefault({
        hasCategory: true,
        parentId: null
      } as any)
    );
  } else {
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
          isNew.value = false;
          isEditing.value = false;
          ElMessage.success("目录保存成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      } else {
        const res = await updatePrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          isEditing.value = false;
          ElMessage.success("目录更新成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      }
    } else {
      // 保存模板节点
      // 处理目录层级的逻辑
      let finalOneLevel: number | null = null;
      let finalTwoLevel: number | null = null;
      let finalParentId: number | null = null;

      // 检查一级目录是否是自由录入
      const isFirstLevelCustom = typeof form.oneLevel === "string" && form.oneLevel;
      // 检查二级目录是否是自由录入
      const isSecondLevelCustom = typeof form.twoLevel === "string" && form.twoLevel;

      if (isFirstLevelCustom) {
        // 一级目录是自由录入，需要先创建
        let firstLevelId: number | null = null;

        if (isSecondLevelCustom) {
          // 同时有自由录入的一级和二级目录
          // 先创建一级目录
          const firstLevelData = {
            name: form.oneLevel,
            hasCategory: true,
            parentId: 0,
            status: true,
            createdTime: now,
            updatedTime: now
          };
          const firstRes = await addPrescriptionTemplateApi(firstLevelData);
          if (firstRes.code === 0 && firstRes.data) {
            firstLevelId = firstRes.data.id;
            finalOneLevel = firstLevelId;
          } else {
            ElMessage.error("一级目录保存失败");
            return;
          }

          // 创建二级目录，parentId指向一级目录
          const secondLevelData = {
            name: form.twoLevel,
            hasCategory: true,
            parentId: firstLevelId,
            status: true,
            createdTime: now,
            updatedTime: now
          };
          const secondRes = await addPrescriptionTemplateApi(secondLevelData);
          if (secondRes.code === 0 && secondRes.data) {
            finalTwoLevel = secondRes.data.id;
            finalParentId = secondRes.data.id;
          } else {
            ElMessage.error("二级目录保存失败");
            return;
          }
        } else if (form.twoLevel) {
          // 一级自由录入，二级选择现有目录
          // 先创建一级目录
          const firstLevelData = {
            name: form.oneLevel,
            hasCategory: true,
            parentId: 0,
            status: true,
            createdTime: now,
            updatedTime: now
          };
          const firstRes = await addPrescriptionTemplateApi(firstLevelData);
          if (firstRes.code === 0 && firstRes.data) {
            firstLevelId = firstRes.data.id;
            finalOneLevel = firstLevelId;
            finalParentId = firstLevelId;
          } else {
            ElMessage.error("一级目录保存失败");
            return;
          }
          // 二级目录使用选择的现有目录
          finalTwoLevel = Number(form.twoLevel);
        } else {
          // 只有一级自由录入，没有二级目录
          const firstLevelData = {
            name: form.oneLevel,
            hasCategory: true,
            parentId: 0,
            status: true,
            createdTime: now,
            updatedTime: now
          };
          const firstRes = await addPrescriptionTemplateApi(firstLevelData);
          if (firstRes.code === 0 && firstRes.data) {
            finalOneLevel = firstRes.data.id;
            finalParentId = firstRes.data.id;
          } else {
            ElMessage.error("一级目录保存失败");
            return;
          }
        }
      } else if (isSecondLevelCustom) {
        // 一级选择现有目录，二级自由录入
        // 先创建二级目录
        const secondLevelData = {
          name: form.twoLevel,
          hasCategory: true,
          parentId: Number(form.oneLevel),
          status: true,
          createdTime: now,
          updatedTime: now
        };
        const secondRes = await addPrescriptionTemplateApi(secondLevelData);
        if (secondRes.code === 0 && secondRes.data) {
          finalTwoLevel = secondRes.data.id;
          finalOneLevel = Number(form.oneLevel);
          finalParentId = secondRes.data.id;
        } else {
          ElMessage.error("二级目录保存失败");
          return;
        }
      } else {
        // 都选择现有目录，直接使用
        // 如果oneLevel为0或空，则twoLevel和parentId都为0
        if (!form.oneLevel) {
          finalOneLevel = 0;
          finalTwoLevel = 0;
          finalParentId = 0;
        } else if (form.twoLevel) {
          finalTwoLevel = Number(form.twoLevel);
          finalOneLevel = Number(form.oneLevel);
          finalParentId = Number(form.twoLevel);
        } else if (form.oneLevel) {
          finalOneLevel = Number(form.oneLevel);
          finalParentId = Number(form.oneLevel);
        }
      }

      // 清空自由录入的临时变量
      firstLevelCustomName.value = "";
      secondLevelCustomName.value = "";

      // 构建保存数据
      const submitData = {
        ...form,
        hasCategory: false,
        oneLevel: finalOneLevel,
        twoLevel: finalTwoLevel,
        parentId: finalParentId,
        updatedTime: now
      };

      if (isNew.value) {
        submitData.createdTime = now;

        const res = await addPrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          templateId = res.data.id;
          isNew.value = false;
          isEditing.value = false;
          ElMessage.success("模板保存成功");
        } else {
          ElMessage.error(res.errMsg || res.message || "保存失败");
          return;
        }
      } else {
        const res = await updatePrescriptionTemplateApi(submitData);
        if (res.code === 0 && res.data) {
          isEditing.value = false;
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
                specification: item.specification || "",
                quantity: item.quantity,
                quantityUnit: item.quantityUnit,
                singleUsageAmount: item.singleUsageAmount,
                singleUsageUnit: item.singleUsageUnit,
                cookingType: item.cookingType,
                days: item.days,
                groupNo: item.groupNo,
                sort: item.sort ?? 0
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
    isDirty.value = false;
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
    isCategoryNode.value = false;
    Object.assign(form, getPrescriptionTemplateEntityDefault());
    metaInfo.updatedTime = "";
    metaInfo.updatedBy = "";
  } else if (selectedId.value) {
    selectTemplate(selectedId.value);
  }
  isEditing.value = false;
  isDirty.value = false;
  // 清空自定义目录名称
  firstLevelCustomName.value = "";
  secondLevelCustomName.value = "";
  form.twoLevel = null;
};

const handleEdit = () => {
  if (!canEdit.value) return;
  isEditing.value = true;
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

// 获取单位ID（可能是id数字，也可能是名称字符串）
const resolveUnitId = (value: any): number | undefined => {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return findUnitIdByName(value);
  return undefined;
};

// 获取煎药方式ID（可能是id数字，也可能是名称字符串）
const resolveDecoctionId = (value: any): number | undefined => {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return findDecoctionIdByName(value);
  return undefined;
};

const handleDelete = async () => {
  if (!selectedId.value) return;

  // 目录节点且有子节点，不允许删除
  if (isCategoryNode.value) {
    const node = findNodeById(treeData.value, selectedId.value);
    if (node && node.children && node.children.length > 0) {
      ElMessage.warning("该目录下存在子节点，无法删除");
      return;
    }
  }

  const confirmMsg = isCategoryNode.value
    ? "确认删除该目录？删除后不可恢复。"
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
      isEditing.value = false;
      isDirty.value = false;
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
  const isWestern = form.prescriptionType === 1;
  const singleUsage = isWestern ? (medicine.singleDosage ?? 0) : 1;
  drugItems.value.push({
    id: `item-${Date.now()}`,
    drugId: String(medicine.id ?? ""),
    drugName: medicine.name,
    specification: medicine.spec ?? "",
    singleUsageAmount: singleUsage,
    singleUsageUnit: isWestern ? resolveUnitId(medicine.unitId) : resolveUnitId(medicine.unitId),
    quantityUnit: isWestern ? undefined : resolveUnitId(medicine.unitId),
    quantity: 0,
    cookingType: isWestern ? undefined : resolveDecoctionId(medicine.decoWay),
    days: form.days ?? (isWestern ? 7 : 7),
    groupNo: 1,
    sort: 0,
    price: parseFloat(medicine.price || "0") || 0
  } as BQPrescriptionTemplateDetailEntityType);
  addDrugInputText.value = "";
  // 中药处方添加后重新计算所有行的计价总量
  if (!isWestern) {
    chineseTemplateRef.value?.recalculateAll();
  }
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
          :disabled="isNew || isEditing"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 树形列表 -->
      <div v-loading="listLoading" class="flex-1 overflow-y-auto py-1" :class="{ 'pointer-events-none opacity-60': isNew || isEditing }">
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
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node-content">
              <span class="node-label" v-html="highlightKeyword(node.label, searchKeyword)"></span>
              <span
                v-if="!data.hasCategory && data.prescriptionType"
                :style="{ color: data.prescriptionType === 1 ? '#409eff' : '#67c23a' }"
                class="node-type"
              >
                [{{ data.prescriptionType === 1 ? '西药' : '中药' }}]
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 h-full bg-bg_color flex flex-col overflow-hidden">
      <!-- 操作栏 -->
      <div
        class="h-[44px] shrink-0 flex items-center justify-between px-4 border-b border-[var(--el-border-color-light)]"
      >
        <div class="flex items-center gap-2">
          <el-button type="primary" size="small" @click="handleAdd(false)">+ 新增模板</el-button>
        </div>
        <div class="flex items-center gap-2">
          <!-- 修改模式/新增模式：显示保存和取消 -->
          <template v-if="isEditing || isNew">
            <el-button type="primary" size="small" :loading="formLoading" @click="handleSave">
              保存
            </el-button>
            <el-button size="small" @click="handleCancel">
              取消
            </el-button>
          </template>
          <!-- 默认模式：显示修改和删除 -->
          <template v-else>
            <el-button type="primary" size="small" :disabled="!canEdit" @click="handleEdit">
              修改
            </el-button>
            <el-button type="danger" size="small" :disabled="!canDelete && !canDeleteCategory" @click="handleDelete">
              删除
            </el-button>
          </template>
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
              :disabled="formDisabled"
            />
          </el-form-item>

          <!-- 模板类别 + 处方类型 + 一级目录 + 二级目录 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="模板类别">
                <el-select
                  v-model="form.templateType"
                  style="width: 100%"
                  :disabled="formDisabled"
                >
                  <el-option label="个人" :value="1" />
                  <el-option label="诊所" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="处方类型">
                <el-select
                  v-model="form.prescriptionType"
                  style="width: 100%"
                  :disabled="formDisabled"
                >
                  <el-option label="西药" :value="1" />
                  <el-option label="中药" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="一级目录">
                <el-select
                  v-model="form.oneLevel"
                  style="width: 100%"
                  :disabled="formDisabled"
                  clearable
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入"
                >
                  <el-option
                    v-for="item in firstLevelOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="二级目录">
                <el-select
                  v-model="form.twoLevel"
                  style="width: 100%"
                  :disabled="formDisabled"
                  clearable
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入"
                >
                  <el-option
                    v-for="item in secondLevelOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
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
              :disabled="formDisabled"
            />
          </el-form-item>

          <!-- 剂数 + 频率 + 用法 + 天数（仅中药处方显示） -->
          <div v-if="form.prescriptionType === 2" class="flex items-center gap-4 mb-4 pl-[90px]">
            <div class="flex items-center gap-2">
              <span class="field-label">剂数</span>
              <el-input-number
                v-model="form.doseAmount"
                :min="1"
                :max="999"
                :controls="false"
                style="width: 72px"
                :disabled="formDisabled"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">频率</span>
              <el-select v-model="form.frequence" style="width: 160px" :disabled="formDisabled">
                <el-option
                  v-for="item in frequenceOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">用法</span>
              <el-select v-model="form.usageType" style="width: 120px" :disabled="formDisabled">
                <el-option
                  v-for="item in usageOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">天数</span>
              <el-input-number
                v-model="form.days"
                :min="1"
                :max="999"
                :controls="false"
                style="width: 72px"
                :disabled="formDisabled"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="field-label">医嘱</span>
              <el-input
                v-model="form.recommendation"
                style="width: 200px"
                placeholder="医嘱"
                :disabled="formDisabled"
              />
            </div>
          </div>

          <!-- 药品明细表 - 根据处方类型切换 -->
          <div class="drug-table-wrapper">
            <!-- 西药模板明细 -->
            <WesternTemplateItems
              v-if="form.prescriptionType === 1"
              :items="drugItems"
              :disabled="formDisabled"
              :unit-options="unitOptions"
              :usage-options="usageOptions"
              :frequency-options="frequenceOptions"
              @remove="removeDrugItem"
            />

            <!-- 中药模板明细 -->
            <ChineseTemplateItems
              ref="chineseTemplateRef"
              v-else-if="form.prescriptionType === 2"
              :items="drugItems"
              :disabled="formDisabled"
              :unit-options="unitOptions"
              :deco-options="decoctionOptions"
              :dose-amount="form.doseAmount"
              :days="form.days"
              :frequence-options="frequenceOptions"
              :frequence="form.frequence"
              @remove="removeDrugItem"
            />
          </div>

          <!-- 底部状态栏 -->
          <div
            class="flex items-center justify-between gap-6 mt-3 text-[12px] text-[var(--el-text-color-secondary)]"
          >
            <!-- 左侧：选择药品组件 -->
            <BqMedicineSelector
              v-model="addDrugInputText"
              placeholder="输入药品名称搜索添加"
              style="width: 280px"
              :disabled="formDisabled"
              @select="handleDrugSelect"
            />

            <!-- 右侧：状态信息 -->
            <div class="flex items-center gap-6">
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

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-type {
  color: #409eff;
  font-size: 12px;
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
}

// 搜索关键字高亮样式（放在 scoped 样式外面）
:deep(.highlight-keyword) {
  color: #000;
  font-weight: bold;
  background-color: #ffff00;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
