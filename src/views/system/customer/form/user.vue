<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { UserFormProps } from "../utils/types";

const props = withDefaults(defineProps<UserFormProps>(), {
  formInline: () => ({
    name: "",
    userOptions: [],
    ids: []
  })
});

const newFormInline = ref(props.formInline);
</script>

<template>
  <el-form
    :model="newFormInline"
    label-position="top"
    style="max-height: 80vh; overflow-y: auto"
  >
    <el-row>
      <re-col>
        <el-form-item label="诊所名称" prop="name">
          <el-input v-model="newFormInline.name" disabled />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="管理员列表" prop="ids">
          <el-select
            v-model="newFormInline.ids"
            placeholder="请选择"
            class="w-full"
            clearable
            multiple
          >
            <el-option
              v-for="(item, index) in newFormInline.roleOptions"
              :key="index"
              :value="item.eid"
              :label="item.name"
            >
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
.el-row .el-col {
  padding-right: 30px;
}

.el-row {
  padding-left: 24px;
}
</style>
