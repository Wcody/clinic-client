# BqDiagnosisSelector 诊断选择器组件

## 组件说明

诊断选择器组件用于在表单中选择医疗诊断信息，支持关键字搜索、键盘导航和分页功能。

## 特性

- ✅ **多字段搜索**：同时匹配 ICD编码（diagnosisCode）、诊断名称（diagnosisName）、拼音码（pinyin）
- ✅ **懒加载机制**：首次打开时才加载数据，避免不必要的请求
- ✅ **防抖搜索**：输入后300ms触发API请求，减少服务器压力
- ✅ **键盘导航**：支持 ↑/↓ 方向键选择、Enter 确认、Esc 关闭
- ✅ **分页功能**：支持自定义每页显示数量、页码跳转
- ✅ **视觉反馈**：当前选中行高亮、悬停效果、加载状态
- ✅ **点击外部关闭**：自动检测并关闭下拉框
- ✅ **样式一致**：严格参照 BqUserSelector 的视觉风格

## 基础用法

```vue
<template>
  <BqDiagnosisSelector 
    v-model="diagnosisName" 
    @select="handleDiagnosisSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BqDiagnosisSelector } from '@/components/BqDiagnosisSelector';
import type { BQDiagnosisDictEntityType } from '@/api/visit/diagnosis';

const diagnosisName = ref('');

function handleDiagnosisSelect(diagnosis: BQDiagnosisDictEntityType) {
  console.log('选中的诊断ID:', diagnosis.id);
  console.log('ICD编码:', diagnosis.diagnosisCode);
  console.log('诊断名称:', diagnosis.diagnosisName);
  console.log('拼音码:', diagnosis.pinyin);
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | string | '' | 双向绑定的诊断名称 |
| placeholder | string | '请输入诊断编码/名称/拼音搜索' | 输入框占位符 |
| disabled | boolean | false | 是否禁用选择器 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | value: string | 诊断名称变化时触发 |
| select | diagnosis: BQDiagnosisDictEntityType | 选中诊断时触发，返回完整实体对象 |

## 完整示例

```vue
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="主要诊断">
      <BqDiagnosisSelector 
        v-model="form.diagnosisName" 
        :disabled="form.isReadonly"
        @select="handleMainDiagnosisSelect"
      />
    </el-form-item>
    
    <el-form-item label="次要诊断">
      <BqDiagnosisSelector 
        v-model="form.secondaryDiagnosisName" 
        placeholder="请输入次要诊断"
        @select="handleSecondaryDiagnosisSelect"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { BqDiagnosisSelector } from '@/components/BqDiagnosisSelector';
import type { BQDiagnosisDictEntityType } from '@/api/visit/diagnosis';

const form = reactive({
  diagnosisName: '',
  secondaryDiagnosisName: '',
  isReadonly: false,
  // 存储完整的诊断信息
  mainDiagnosis: null as BQDiagnosisDictEntityType | null,
  secondaryDiagnosis: null as BQDiagnosisDictEntityType | null
});

function handleMainDiagnosisSelect(diagnosis: BQDiagnosisDictEntityType) {
  form.mainDiagnosis = diagnosis;
  console.log('主要诊断已选择:', diagnosis);
  // 可以在这里执行其他业务逻辑，如加载相关数据
}

function handleSecondaryDiagnosisSelect(diagnosis: BQDiagnosisDictEntityType) {
  form.secondaryDiagnosis = diagnosis;
  console.log('次要诊断已选择:', diagnosis);
}
</script>
```

## 注意事项

1. **字段对齐**：组件内部字段严格与后端 `BqDiagnosisDictEntity` 对齐
2. **搜索逻辑**：后端 `/search` 接口会同时匹配 `diagnosisCode`、`diagnosisName`、`pinyin` 三个字段（OR 逻辑）
3. **启用状态过滤**：无关键字时仅加载启用状态（status=true）的诊断
4. **v-model 同步**：`v-model` 绑定的是诊断名称（diagnosisName），完整信息通过 `@select` 事件获取
5. **避免重复赋值**：不要在 `@select` 回调中再次修改 `v-model` 绑定的字段，防止触发意外的 watch

## API 参考

### 导入类型

```typescript
import type { 
  BQDiagnosisDictEntityType,
  BQDiagnosisDictResultType,
  BQDiagnosisDictListResultType,
  BQDiagnosisDictPageResultType
} from '@/api/visit/diagnosis';
```

### 可用API函数

```typescript
import {
  getDiagnosisDictByIdApi,      // 根据ID获取单条记录
  saveDiagnosisDictApi,         // 新增诊断记录
  updateDiagnosisDictApi,       // 更新诊断记录
  deleteDiagnosisDictApi,       // 物理删除诊断记录
  deleteDiagnosisDictLogicApi,  // 逻辑删除诊断记录
  getDiagnosisDictListApi,      // 列表查询
  getDiagnosisDictPageApi,      // 分页查询
  searchDiagnosisDictApi        // 关键字搜索
} from '@/api/visit/diagnosis';
```

## 样式定制

如需自定义样式，可以通过以下CSS类进行覆盖：

- `.diagnosis-selector` - 容器
- `.ds-trigger` - 触发输入框
- `.ds-dropdown` - 下拉面板
- `.ds-table` - 结果表格
- `.ds-pagination` - 分页区域

## 技术实现细节

### 后端接口

```java
@RequestMapping(value = "/search", method = RequestMethod.GET)
public Iterable<BqDiagnosisDictEntity> search(@RequestParam(required = false) String keyword) {
    if (keyword == null || keyword.trim().isEmpty()) {
        return Collections.emptyList();
    }
    
    String trimmedKeyword = keyword.trim();
    return diagnosisDictService.lambdaQuery()
        .and(wrapper -> wrapper
            .like(BqDiagnosisDictEntity::getDiagnosisCode, trimmedKeyword)
            .or()
            .like(BqDiagnosisDictEntity::getDiagnosisName, trimmedKeyword)
            .or()
            .like(BqDiagnosisDictEntity::getPinyin, trimmedKeyword)
        )
        .eq(BqDiagnosisDictEntity::getStatus, true)
        .orderByAsc(BqDiagnosisDictEntity::getDiagnosisCode)
        .list();
}
```

### 前端数据流

1. 用户输入关键字 → 触发 `handleSearch`
2. 防抖300ms → 调用 `fetchDiagnoses(keyword)`
3. API返回数据 → 更新 `rawData`
4. 本地过滤 → 计算 `filteredData`
5. 分页切片 → 渲染 `pagedData`

## 常见问题

### Q: 为什么搜索不到某些诊断？
A: 请确认该诊断的 `status` 字段为 `true`（启用状态）。禁用状态的诊断不会出现在搜索结果中。

### Q: 如何获取选中诊断的完整信息？
A: 通过 `@select` 事件回调获取，参数类型为 `BQDiagnosisDictEntityType`，包含所有字段。

### Q: 可以自定义每页显示数量吗？
A: 可以，组件内置了分页控件，用户可以自行调整每页显示数量（5-100条）。

### Q: 支持键盘操作吗？
A: 支持！可以使用 ↑/↓ 方向键导航、Enter 确认选择、Esc 关闭下拉框。
