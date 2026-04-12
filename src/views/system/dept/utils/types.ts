import type { BQDeptEntityType } from "@/api/system/dept";

interface FormItemProps extends BQDeptEntityType {
  title: string;
  higherDeptOptions: Record<string, unknown>[];
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
