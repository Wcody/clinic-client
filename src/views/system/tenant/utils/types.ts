import type { BQTenantEntityType } from "@/api/system/tenant";

interface FormItemProps extends BQTenantEntityType {
  title: string;
  higherGroupOptions: Record<string, unknown>[];
  menuOptions: Record<string, unknown>[];
  menuIds: string[];
}
interface FormProps {
  formInline: FormItemProps;
}

interface UserFormItemProps {
  name: string;
  /** 管理员候选用户列表 */
  roleOptions: any[];
  /** 选中的管理员用户ID */
  ids: string[];
}
interface UserFormProps {
  formInline: UserFormItemProps;
}

export type { FormItemProps, FormProps, UserFormItemProps, UserFormProps };
