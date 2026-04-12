import roleForm from "../form/role.vue";
import { addDialog } from "@/components/ReDialog";
import type { RoleFormItemProps } from "../utils/types";
import { deviceDetection } from "@pureadmin/utils";
import { h, ref, onMounted } from "vue";
import { getRoleListApi } from "@/api/system/role";

export function useSelectRole() {
  const roleOptions = ref([]);
  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    addDialog({
      title: `设置节点执行角色`,
      props: {
        formInline: {
          label: row?.label ?? "",
          roleOptions: roleOptions.value ?? [],
          eid: row?.eid ?? ""
        }
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        row.label = curData.label;
        row.eid = curData.eid;
        // 根据实际业务使用curData.ids和row里的某些字段去调用修改角色接口即可
        done(); // 关闭弹框
      }
    });
  }

  onMounted(async () => {
    // 角色列表
    roleOptions.value = (await getRoleListApi()).data;
  });

  return {
    deviceDetection,
    handleRole
  };
}
