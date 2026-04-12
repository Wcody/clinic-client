import type { BQCollectorEntityType } from "@/api/cm/collector";

interface FormItemProps extends BQCollectorEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
