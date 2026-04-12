import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  recordCode: [{ required: true, message: "必填项", trigger: "blur" }],
  patientName: [{ required: true, message: "必填项", trigger: "blur" }],
  patientCode: [{ required: true, message: "必填项", trigger: "blur" }],
  idCard: [{ required: true, message: "必填项", trigger: "blur" }]
});
