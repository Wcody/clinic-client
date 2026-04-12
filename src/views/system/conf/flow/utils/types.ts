interface RoleFormItemProps {
  label: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的 */
  eid: string;
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

export type { RoleFormItemProps, RoleFormProps };
