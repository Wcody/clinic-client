import { http } from "@/utils/http";
import {
  type BQSearchListResultType,
  BQSearchOrder,
  type BQResultType,
  type BQSearchPageResultType,
  type BQBaseEntityType,
  getBaseEntityDefault
} from "../api";

/**
 * 菜单实体类型定义
 */
export type BQMenuEntityType = {
  /** 菜单类型（0代表菜单、1代表iframe、2代表外链、3代表按钮）*/
  menuType: number;
  parentId: string;
  title: string;
  name: string;
  path: string;
  component: string;
  orderValue: number;
  redirect: string;
  icon: string;
  extraIcon: string;
  enterTransition: string;
  leaveTransition: string;
  activePath: string;
  frameSrc: string;
  auths: string;
  frameLoading: boolean;
  keepAlive: boolean;
  hiddenTag: boolean;
  fixedTag: boolean;
  showLink: boolean;
  showParent: boolean;
  status: boolean;
} & BQBaseEntityType;

/**
 * 获取菜单缺省值
 */
export const getMenuEntityDefault: (
  row?: BQMenuEntityType
) => BQMenuEntityType = (row?: BQMenuEntityType) => {
  return {
    menuType: row?.menuType ?? 0,
    parentId: row?.parentId ?? "0",
    title: row?.title ?? "",
    name: row?.name ?? "",
    path: row?.path ?? "",
    component: row?.component ?? "",
    orderValue: row?.orderValue ?? 99,
    redirect: row?.redirect ?? "",
    icon: row?.icon ?? "",
    extraIcon: row?.extraIcon ?? "",
    enterTransition: row?.enterTransition ?? "bounce",
    leaveTransition: row?.leaveTransition ?? "bounce",
    activePath: row?.activePath ?? "",
    frameSrc: row?.frameSrc ?? "",
    auths: row?.auths ?? "",
    frameLoading: row?.frameLoading ?? true,
    keepAlive: row?.keepAlive ?? false,
    hiddenTag: row?.hiddenTag ?? false,
    fixedTag: row?.fixedTag ?? false,
    showLink: row?.showLink ?? true,
    showParent: row?.showParent ?? false,
    status: row?.status ?? true,
    ...getBaseEntityDefault(row)
  };
};

/**
 * 菜单实体结果定义
 */
export type BQMenuEntityResultType = BQResultType<BQMenuEntityType>;

/**
 * 菜单实体分页结果定义
 */
export type BQMenuSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQMenuEntityType>
>;

/**
 * 菜单实体列表结果定义
 */
export type BQMenuSearchListResultType = BQResultType<
  BQSearchListResultType<BQMenuEntityType>
>;

/**
 * 增加菜单API
 */
export const addMenuApi = (data?: object) => {
  return http.request<BQMenuEntityResultType>("post", "/menu/save", {
    data
  });
};

/**
 * 更新菜单API
 */
export const updateMenuApi = (data?: object) => {
  return http.request<BQMenuEntityResultType>("post", "/menu/update", {
    data
  });
};

/**
 * 获取所有菜单API
 */
export const getMenuListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQMenuSearchListResultType>("get", "/menu/list", {
    params
  });
};

/**
 * 删除菜单API
 */
export const deleteMenuApi = (eid: string) => {
  return http.request<Boolean>("get", `/menu/delete/${eid}`);
};

/**
 * 获取当前所有菜单列表
 */
export const getRoleMenusApi = () => {
  return http.request<BQMenuSearchListResultType>("get", `/menu/getRoleMenus`);
};

/**
 * 根据角色ID获取菜单ID
 */
export const getMenuIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/menu/getMenuIdsBy/${eid}`
  );
};

/**
 * 根据角色I保存菜单ID
 */
export const saveMenuIdsByApi = (eid: string, menuIds: Array<String>) => {
  return http.request<BQResultType<Array<String>>>(
    "post",
    `/menu/saveMenuIdsBy/${eid}`,
    {
      data: menuIds
    }
  );
};

/**
 * 菜单启用禁用API
 */
export const setStatusMenuApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/menu/setStatus/${eid}/${status}`);
};

/**
 * 重新加载菜单资源
 */
export const reloadResourceApi = () => {
  return http.request<Boolean>("post", `/menu/reloadResource`);
};
