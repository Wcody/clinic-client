import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  paramValue: [{ required: true, message: "参数值必填", trigger: "blur" }]
});
