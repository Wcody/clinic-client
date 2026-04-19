<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Disease List View -->
    <div v-if="!selectedDisease">
      <!-- Header -->
      <header class="bg-white text-white py-4 shadow-md">
        <h1 class="text-2xl font-bold text-center text-primary">
          中医知识库
        </h1>
      </header>

      <!-- Search Bar -->
      <div
        class="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200"
      >
        <input
          v-model="searchQuery"
          type="text"
          placeholder="输入中医疾病名称"
          class="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
        />
        <button
          class="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
          @click="handleSearch"
        >
          查 询
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white border-b border-gray-200">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'w-44 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary'
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex bg-white min-h-[calc(100vh-180px)]">
        <!-- Left Sidebar - Categories or Alphabet -->
        <div class="w-44 border-r border-gray-200 overflow-y-auto">
          <div
            v-for="category in currentCategories"
            :key="category.id"
            :class="[
              'px-4 py-3 text-sm cursor-pointer transition-colors text-center border-b border-gray-100',
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>

        <!-- Right Content - Disease List -->
        <div ref="contentRef" class="flex-1 overflow-y-auto">
          <div
            v-for="disease in filteredDiseases"
            :key="disease.id"
            class="px-6 py-3 border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="viewDiseaseDetail(disease)"
          >
            {{ disease.name }}
          </div>
          <div
            v-if="filteredDiseases.length === 0"
            class="px-6 py-8 text-center text-gray-400"
          >
            暂无相关疾病数据
          </div>
        </div>
      </div>

      <!-- Back to Top Button -->
      <button
        v-show="showBackToTop"
        class="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
        @click="scrollToTop"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>

    <!-- Disease Detail View -->
    <DiseaseDetail v-else :disease="selectedDisease" @back="backToList" />
  </div>
</template>

<script setup lang="ts">
import DiseaseDetail from "./DiseaseDetail.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getDictListApi } from "@/api/wiki/fmgr";
import type {
  DiseaseEntityType,
  AlphabetEntityType,
  CategoryEntityType
} from "@/api/wiki/fmgr";
import { message } from "@/utils/message";

const searchQuery = ref("");
const activeTab = ref("specialty");
const selectedCategory = ref<number | string>("all");
const showBackToTop = ref(false);
const contentRef = ref(null);
const selectedDisease = ref(null);

const tabs = [
  { id: "specialty", name: "按专科" },
  { id: "alphabet", name: "按首字母" }
];

const categories = ref<Array<CategoryEntityType | { id: string; name: string }>>(
  [{ id: "all", name: "全部" }]
);
const alphabets = ref<Array<AlphabetEntityType | { id: string; name: string }>>(
  [{ id: "all", name: "全部" }]
);
const diseases = ref<Array<DiseaseEntityType>>([]);

const currentCategories = computed(() => {
  return activeTab.value === "specialty" ? categories.value : alphabets.value;
});

const filteredDiseases = computed(() => {
  let filtered = diseases.value;

  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      disease =>
        disease.name.toLowerCase().includes(keyword) ||
        disease.pinyin.toLowerCase().includes(keyword) ||
        disease.pinyinInitial.toLowerCase().includes(keyword)
    );
  }

  if (selectedCategory.value !== "all") {
    if (activeTab.value === "specialty") {
      filtered = filtered.filter(
        disease => disease.category === selectedCategory.value
      );
    } else {
      filtered = filtered.filter(
        disease => disease.alphabet === selectedCategory.value
      );
    }
  }

  return filtered;
});

const loadDictData = async () => {
  try {
    const res = await getDictListApi();
    if (res.code === 0 && res.data) {
      categories.value = [
        { id: "all", name: "全部" },
        ...res.data.categories
      ];
      alphabets.value = [
        { id: "all", name: "全部" },
        ...res.data.alphabets
      ];
      diseases.value = res.data.diseases || [];
    } else {
      message(res.message || "获取疾病字典失败", { type: "error" });
    }
  } catch (error) {
    console.error("获取疾病字典失败:", error);
    message("获取疾病字典失败，请稍后重试", { type: "error" });
  }
};

const selectCategory = (categoryId: number | string) => {
  selectedCategory.value = categoryId;
};

const viewDiseaseDetail = (disease: DiseaseEntityType) => {
  selectedDisease.value = disease;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const backToList = () => {
  selectedDisease.value = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleSearch = () => {};

const scrollToTop = () => {
  if (contentRef.value) {
    contentRef.value.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 200;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  loadDictData();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
