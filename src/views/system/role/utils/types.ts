import type { BQRoleEntityType } from "@/api/system/role";

interface FormItemProps extends BQRoleEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
