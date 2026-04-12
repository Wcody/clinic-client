import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  collectorName: [
    { required: true, message: "采集器名称为必填项", trigger: "blur" }
  ],
  deviceId: [{ required: true, message: "设备ID为必填项", trigger: "blur" }]
});
