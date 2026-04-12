import type { BQFieldAliasEntityType } from "@/api/system/alias";

interface FormItemProps extends BQFieldAliasEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
