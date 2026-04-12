import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  recordCode: [{ required: true, message: "必填项", trigger: "blur" }],
  patientName: [{ required: true, message: "必填项", trigger: "blur" }],
  patientCode: [{ required: true, message: "必填项", trigger: "blur" }],
  idCard: [{ required: true, message: "必填项", trigger: "blur" }]
});

export const zdformRules = reactive(<FormRules>{
  C06x__C: [{ required: true, message: "必填项", trigger: "blur" }],
  C07x__N: [{ required: true, message: "必填项", trigger: "blur" }],
  C08x__C: [{ required: true, message: "必填项", trigger: "blur" }],
  F06x__: [{ required: true, message: "必填项", trigger: "blur" }]
});

export const ssformRules = reactive(<FormRules>{});
