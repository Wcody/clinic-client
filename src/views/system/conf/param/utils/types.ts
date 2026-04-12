import type { BQParamItemEntityType } from "@/api/system/param";

interface FormItemProps extends BQParamItemEntityType {
  title: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
