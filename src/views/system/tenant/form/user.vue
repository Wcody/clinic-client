<script setup lang="ts">
import { computed, ref } from "vue";
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

const selectedCount = computed(() => newFormInline.value.ids?.length ?? 0);
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
            placeholder="搜索并选择管理员"
            class="w-full"
            clearable
            filterable
            multiple
          >
            <el-option
              v-for="(item, index) in newFormInline.roleOptions"
              :key="index"
              :value="item.eid"
              :label="`${item.name || item.account}（${item.account}）`"
            >
              <span>{{ item.name || item.account }}</span>
              <span class="ml-2 text-[var(--el-text-color-secondary)]">
                {{ item.account }}
              </span>
            </el-option>
          </el-select>
          <div class="mt-2 text-sm text-[var(--el-text-color-secondary)]">
            已绑定 {{ selectedCount }} 名管理员，解绑后该用户将不再作为本诊所管理员进入平台。
          </div>
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
