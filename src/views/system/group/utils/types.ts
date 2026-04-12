import type { BQGroupEntityType } from "@/api/system/group";

interface FormItemProps extends BQGroupEntityType {
  title: string;
  higherGroupOptions: Record<string, unknown>[];
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
