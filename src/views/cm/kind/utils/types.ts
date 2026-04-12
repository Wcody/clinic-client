import type { BQKindEntityType } from "@/api/cm/kind";

interface FormItemProps extends BQKindEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
