import type { BQTenantEntityType } from "@/api/system/tenant";

interface FormItemProps extends BQTenantEntityType {
  title: string;
  higherGroupOptions: Record<string, unknown>[];
}
interface FormProps {
  formInline: FormItemProps;
}

interface FormProps {
  formInline: FormItemProps;
}

interface UserFormItemProps {
  name: string;
  /** 用户列表 */
  userOptions: any[];
  /** 选中的角色列表 */
  ids: Record<string, unknown>[];
}
interface UserFormProps {
  formInline: UserFormItemProps;
}

export type { FormItemProps, FormProps, UserFormItemProps, UserFormProps };
