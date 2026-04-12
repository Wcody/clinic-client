<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getRecordEntityDefault } from "@/api/cm/record";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    initKind: 0,
    caption: "档案",
    ...getRecordEntityDefault()
  })
});
</script>

<template>
  <div>列表视图</div>
</template>

<style lang="scss" scoped></style>
