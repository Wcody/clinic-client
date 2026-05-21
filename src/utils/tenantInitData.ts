import { computed, h } from "vue";
import { ElTag } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";

export const tenantInitDataLabel = "租户初始化数据";
export const platformTenantId = "04bda4f00fc44642f41bfafbb5c6f280";

export function isPlatformTenant() {
  const userStore = useUserStoreHook();
  const roles = userStore.roles ?? [];
  return (
    userStore.tenantId === platformTenantId ||
    roles.includes("super") ||
    roles.includes("admin")
  );
}

export function useIsPlatformTenant() {
  return computed(() => isPlatformTenant());
}

export function applyTenantInitDataGuard<T extends Record<string, any>>(
  data: T
): T {
  const target = data as Record<string, any>;
  target.tenantInitData = isPlatformTenant()
    ? target.tenantInitData ?? true
    : false;
  return data;
}

export function createTenantInitDataColumn() {
  return {
    label: tenantInitDataLabel,
    prop: "tenantInitData",
    minWidth: 130,
    cellRenderer: ({ row, props }) =>
      h(
        ElTag,
        {
          size: props.size,
          type: row.tenantInitData ? "success" : "info",
          effect: "plain"
        },
        () => (row.tenantInitData ? "是" : "否")
      )
  };
}

export function withTenantInitDataColumn<T extends any[]>(columns: T): T {
  if (!isPlatformTenant()) return columns;

  const nextColumns = [...columns];
  const operationIndex = nextColumns.findIndex(
    column => column.slot === "operation" || column.label === "操作"
  );

  if (operationIndex >= 0) {
    nextColumns.splice(operationIndex, 0, createTenantInitDataColumn());
  } else {
    nextColumns.push(createTenantInitDataColumn());
  }

  return nextColumns as T;
}
