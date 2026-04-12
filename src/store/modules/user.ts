import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import { loginApi, refreshTokenApi } from "@/api/system/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar,
    // 用户名
    account: storageLocal().getItem<DataInfo<number>>(userKey)?.account,
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname,
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles,
    // 用户唯一ID
    eid: storageLocal().getItem<DataInfo<number>>(userKey)?.eid,
    // 登录唯一ID
    lid: storageLocal().getItem<DataInfo<number>>(userKey)?.lid,
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7,
    tenantLogo: storageLocal().getItem<DataInfo<number>>(userKey)?.tenantLogo,
    tenantName: storageLocal().getItem<DataInfo<number>>(userKey)?.tenantName
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_ACCOUNT(account: string) {
      this.account = account;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByAccount(data) {
      const res = await loginApi(data);
      if (res.code !== 10001) {
        setToken(res.data);
      }
      return res;
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.account = "";
      this.roles = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(parmas) {
      const res = await refreshTokenApi(parmas);
      return res.data;
    },
    /**获取用户信息 */
    getUserInfo() {
      return storageLocal().getItem<DataInfo<number>>(userKey);
    },
    /*判断是平台管理员*/
    isAdmin() {
      return this.roles.includes("admin");
    },
    /*判断系统管理员 */
    isSuper() {
      return this.roles.includes("super");
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
