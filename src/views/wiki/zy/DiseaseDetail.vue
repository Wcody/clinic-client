<template>
  <div class="min-h-screen">
    <!-- Header with Back Button -->
    <header
      class="bg-primary text-white py-4 shadow-md flex items-center justify-between px-4"
    >
      <h1 class="text-xl font-medium flex-1 text-left">
        {{ diseaseDetail?.name || disease.name }}
      </h1>
      <button
        class="bg-white text-primary px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
        @click="$emit('back')"
      >
        返回
      </button>
    </header>

    <!-- Sticky Navigation Bar -->
    <div class="sticky top-0 z-40 bg-primary shadow-md">
      <!-- Main Navigation Header - 4列布局与下拉内容对齐 -->
      <div class="grid grid-cols-4">
        <button
          class="col-span-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 transition-colors flex items-center justify-center gap-2 border-r border-blue-600"
          @click="toggleNavPanel"
        >
          <span>概述</span>
          <svg
            v-if="!showNavPanel"
            :class="[
              'w-4 h-4 transition-transform',
              isPageNavVisible ? '' : 'rotate-180'
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <button
          class="col-span-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 transition-colors flex items-center justify-center gap-2 border-r border-blue-600"
          @click="toggleNavPanel"
        >
          <span>辨证治疗</span>
          <svg
            v-if="!showNavPanel"
            :class="[
              'w-4 h-4 transition-transform',
              isPageNavVisible ? '' : 'rotate-180'
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <button
          class="col-span-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 transition-colors flex items-center justify-center gap-2"
          @click="toggleNavPanel"
        >
          <span>名医名家经验方</span>
          <svg
            v-if="!showNavPanel"
            :class="[
              'w-4 h-4 transition-transform',
              isPageNavVisible ? '' : 'rotate-180'
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Dropdown Navigation Panel (same content as page navigation) -->
      <div
        v-show="showNavPanel"
        class="bg-white border-b border-gray-200 shadow-lg"
      >
        <div class="grid grid-cols-4 text-sm">
          <!-- 概述列 -->
          <div class="border-r border-gray-200">
            <a
              href="#overview-summary"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor('overview-summary')"
            >
              小结
            </a>
          </div>
          <!-- 辨证治疗列 -->
          <div class="border-r border-gray-200">
            <a
              v-for="item in treatmentNavItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
          <!-- 名医名家经验方列 (分两列) -->
          <div class="border-r border-gray-200">
            <a
              v-for="item in prescriptionNavItems.slice(0, 3)"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
          <div>
            <a
              v-for="item in prescriptionNavItems.slice(3)"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Content - All sections in one page -->
    <div class="bg-gray-50 pb-10">
      <!-- 页面内完整导航区域 -->
      <div ref="pageNavRef" class="bg-white border-b border-gray-200">
        <div class="grid grid-cols-4 text-sm">
          <!-- 概述列 -->
          <div class="border-r border-gray-200">
            <a
              href="#overview-summary"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor('overview-summary')"
            >
              小结
            </a>
          </div>
          <!-- 辨证治疗列 -->
          <div class="border-r border-gray-200">
            <a
              v-for="item in treatmentNavItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
          <!-- 名医名家经验方列 (分两列) -->
          <div class="border-r border-gray-200">
            <a
              v-for="item in prescriptionNavItems.slice(0, 3)"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
          <div>
            <a
              v-for="item in prescriptionNavItems.slice(3)"
              :key="item.id"
              :href="`#${item.id}`"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click.prevent="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- 概述部分 -->
      <section id="section-overview" class="scroll-mt-24">
        <div class="p-6 space-y-4">
          <!-- 小结 - Collapsible -->
          <h2
            id="overview-summary"
            class="text-2xl font-medium text-primary scroll-mt-32"
          >
            小结
          </h2>
          <div class="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div class="text-sm text-gray-700 leading-relaxed space-y-3">
              <p v-if="diseaseDetail?.summary">
                {{ diseaseDetail.summary }}
              </p>
              <p v-else>
                抗结核化学治疗对结核性肋部疾病起着控制、决定性作用，合理的抗结核治疗可使病灶全部灭菌，痊愈。而传统的中医治疗则可起到非常好的辅助疗效。
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 辨证治疗部分 -->
      <section id="section-treatment" class="scroll-mt-24">
        <h2
          class="text-2xl font-medium text-primary border-b-2 border-primary pb-2 mb-6 bg-white px-6 py-4"
        >
          辨证治疗
        </h2>

        <div class="px-6 space-y-4">
          <!-- 动态渲染证型列表 -->
          <div
            v-for="(treatment, index) in diseaseDetail?.data?.cure?.data || []"
            :id="`treatment-${treatment.id}`"
            :key="treatment.id"
            class="bg-white rounded shadow-sm border border-gray-200 scroll-mt-32"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              @click="toggleSection(`treatment-${treatment.id}`)"
            >
              <h3 class="text-lg font-medium text-gray-800">
                {{ treatment.name }}
              </h3>
              <svg
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.includes(`treatment-${index + 1}`)
                    ? 'rotate-180'
                    : ''
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="expandedSections.includes(`treatment-${treatment.id}`)"
              class="px-6 pb-4 space-y-4"
            >
              <!-- 证候特点 -->
              <div>
                <h4 class="text-sm font-medium text-red-600 mb-2">
                  证候特点：
                </h4>
                <p class="text-sm text-gray-700 leading-relaxed">
                  {{ treatment.spec }}
                </p>
              </div>

              <!-- 治法 -->
              <div>
                <h4 class="text-sm font-medium text-red-600 mb-2">治法：</h4>
                <p class="text-sm text-gray-700">{{ treatment.solution }}</p>
              </div>

              <!-- 推荐方剂 -->
              <div v-if="treatment.recommend">
                <h4 class="text-sm font-medium text-red-600 mb-2">推荐方剂</h4>

                <div class="mb-4">
                  <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-300 text-sm">
                      <tbody>
                        <tr
                          v-for="(row, rIndex) in getIngredientRows(
                            treatment.recommend.base
                          )"
                          :key="rIndex"
                          class="border-b border-gray-300"
                        >
                          <td
                            v-if="rIndex === 0"
                            class="border-r border-gray-300 px-3 py-2 bg-gray-50 font-medium"
                            :rowspan="
                              getIngredientRows(treatment.recommend.base).length
                            "
                          >
                            {{ treatment.recommend.name }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[0]?.name || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[0]?.remark || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[1]?.name || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[1]?.remark || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[2]?.name || "" }}
                          </td>
                          <td class="px-3 py-2">
                            {{ row[2]?.remark || "" }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 加减法 -->
                  <div
                    v-if="treatment.additional && treatment.additional.length"
                    class="mt-3 text-sm text-gray-700 space-y-2"
                  >
                    <div
                      v-for="(item, aIndex) in treatment.additional.filter(
                        x => x !== null
                      )"
                      :key="aIndex"
                    >
                      {{ item }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 名医名家经验方部分 -->
      <section id="section-prescriptions" class="scroll-mt-24">
        <h2
          class="text-2xl font-medium text-primary border-b-2 border-primary pb-2 mb-6 bg-white px-6 py-4"
        >
          名医名家经验方
        </h2>

        <div class="px-6 space-y-4">
          <!-- 动态渲染名医经验方列表 -->
          <div
            v-for="(expert, index) in diseaseDetail?.data?.exp?.data || []"
            :id="`prescription-${expert.id}`"
            :key="expert.id"
            class="bg-white rounded shadow-sm border border-gray-200 scroll-mt-32"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              @click="toggleSection(`prescription-${expert.id}`)"
            >
              <h3 class="text-lg font-medium text-gray-800">
                {{ expert.name }}
              </h3>
              <svg
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.includes(`prescription-${index + 1}`)
                    ? 'rotate-180'
                    : ''
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="expandedSections.includes(`prescription-${expert.id}`)"
              class="px-6 pb-4 space-y-4"
            >
              <!-- 名医简介 -->
              <p
                v-if="expert.authorIntro"
                class="text-sm text-gray-600 leading-relaxed"
              >
                {{ expert.authorIntro }}
              </p>

              <!-- 经验方详情 -->
              <div v-if="expert.recommend" class="space-y-3">
                <div>
                  <h4 class="text-sm font-medium text-red-600 mb-2">
                    经验方名称：
                  </h4>
                  <p class="text-sm text-gray-700">
                    {{ expert.experience }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-medium text-red-600 mb-2">
                    主治功能：
                  </h4>
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {{ expert.majorFunction }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-medium text-red-600 mb-2">
                    详细说明：
                  </h4>
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {{ expert.explain }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-medium text-red-600 mb-2">
                    推荐方剂：{{ expert.recommend.name }}
                  </h4>

                  <!-- 药材表格 -->
                  <div class="overflow-x-auto mt-2">
                    <table class="min-w-full border border-gray-300 text-sm">
                      <tbody>
                        <tr
                          v-for="(row, rIndex) in getIngredientRows(
                            expert.recommend.base
                          )"
                          :key="rIndex"
                          class="border-b border-gray-300"
                        >
                          <td
                            v-if="rIndex === 0"
                            class="border-r border-gray-300 px-3 py-2 bg-gray-50 font-medium"
                            :rowspan="
                              getIngredientRows(expert.recommend.base).length
                            "
                          >
                            {{ expert.recommend.name }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[0]?.name || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[0]?.remark || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[1]?.name || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[1]?.remark || "" }}
                          </td>
                          <td class="border-r border-gray-300 px-3 py-2">
                            {{ row[2]?.name || "" }}
                          </td>
                          <td class="px-3 py-2">
                            {{ row[2]?.remark || "" }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 加减法 -->
                <div
                  v-if="expert.additional && expert.additional.length"
                  class="mt-3 text-sm text-gray-700 space-y-2"
                >
                  <h4 class="text-sm font-medium text-red-600 mb-2">
                    加减法：
                  </h4>
                  <div
                    v-for="(item, aIndex) in expert.additional.filter(
                      x => x !== null
                    )"
                    :key="aIndex"
                  >
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getDiseaseDetailApi } from "@/api/wiki/zy";
import type {
  DiseaseDetailEntityType,
  TreatmentEntityType,
  ExpertPrescriptionEntityType
} from "@/api/wiki/zy";
import { message } from "@/utils/message";

// Props
const props = defineProps<{
  disease: {
    id: number;
    name: string;
    category?: number | null;
    alphabet?: string;
  };
}>();

// Emits
defineEmits(["back"]);

// State
const expandedSections = ref(["treatment-1"]);
const showNavPanel = ref(false);
const pageNavRef = ref(null);
const isPageNavVisible = ref(true);
const diseaseDetail = ref<DiseaseDetailEntityType | null>(null);
const loading = ref(false);

// Navigation items - 动态生成
const treatmentNavItems = ref<Array<{ id: string; label: string }>>([]);
const prescriptionNavItems = ref<Array<{ id: string; label: string }>>([]);

/**
 * 加载疾病详情数据
 */
const loadDiseaseDetail = async () => {
  if (!props.disease?.id) return;

  loading.value = true;
  try {
    const res = await getDiseaseDetailApi(props.disease.id);
    if (res.success && res.data) {
      diseaseDetail.value = res.data;

      // 动态生成辨证治疗导航项
      treatmentNavItems.value = res.data.data.cure.data.map(item => ({
        id: `treatment-${item.id}`,
        label: item.name
      }));

      // 动态生成名医经验方导航项
      prescriptionNavItems.value = res.data.data.exp.data.map(item => ({
        id: `prescription-${item.id}`,
        label: item.name
      }));
    } else {
      message("获取疾病详情失败", { type: "error" });
    }
  } catch (error) {
    console.error("获取疾病详情失败:", error);
    message("获取疾病详情失败，请稍后重试", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// Methods
/**
 * 将药材列表按每行3个分组，用于表格显示
 */
const getIngredientRows = (
  ingredients: Array<{
    name: string;
    amount?: number;
    unit: string;
    remark?: string;
    cook?: string;
  }>
) => {
  const rows = [];
  for (let i = 0; i < ingredients.length; i += 3) {
    rows.push(ingredients.slice(i, i + 3));
  }
  return rows;
};

const toggleSection = sectionId => {
  const index = expandedSections.value.indexOf(sectionId);
  if (index > -1) {
    expandedSections.value.splice(index, 1);
  } else {
    expandedSections.value.push(sectionId);
  }
};

const checkPageNavVisibility = () => {
  if (!pageNavRef.value) return;
  const rect = pageNavRef.value.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  isPageNavVisible.value = rect.top >= 0 && rect.bottom <= windowHeight;
};

const toggleNavPanel = () => {
  if (isPageNavVisible.value) {
    return;
  }
  showNavPanel.value = !showNavPanel.value;
};

const scrollToAnchor = anchorId => {
  const element = document.getElementById(anchorId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    // 根据锚点ID提取sectionId
    let sectionId = "";
    if (anchorId.startsWith("treatment-")) {
      sectionId = anchorId;
    } else if (anchorId.startsWith("prescription-")) {
      sectionId = anchorId;
    } else if (anchorId === "overview-summary") {
      sectionId = "overview-summary";
    }

    if (sectionId && !expandedSections.value.includes(sectionId)) {
      expandedSections.value.push(sectionId);
    }
    showNavPanel.value = false;
  }
};

const handleScroll = () => {
  checkPageNavVisibility();
  if (isPageNavVisible.value && showNavPanel.value) {
    showNavPanel.value = false;
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  // 页面加载时获取疾病详情数据
  loadDiseaseDetail();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
