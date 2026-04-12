import type { BQUserEntityType } from "@/api/system/user";

interface FormItemProps extends BQUserEntityType {
  title: string;
  higherDeptOptions: Record<string, unknown>[];
}
interface FormProps {
  formInline: FormItemProps;
}

interface FormProps {
  formInline: FormItemProps;
}

interface RoleFormItemProps {
  name: string;
  nickname: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的角色列表 */
  ids: Record<string, unknown>[];
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

export type { FormItemProps, FormProps, RoleFormItemProps, RoleFormProps };
