import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { useTenantInfoStoreHook } from "@/store/modules/tenantInfo";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  account?: string;
  /** 用户唯一ID */
  eid?: string;
  /** 登录唯一ID */
  lid?: string;
  /** 昵称 */
  nickname?: string;
  /** 昵称 */
  email?: string;
  /** 昵称 */
  phone?: string;
  /** 昵称 */
  sex?: number;
  /** 昵称 */
  remark?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 诊所logo */
  tenantLogo?: string;
  /** 诊所名称 */
  tenantName?: string;
  /** 当前租户ID */
  tenantId?: string;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`、`refreshToken`这三条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`avatar`、`account`、`nickname`、`roles`、`refreshToken`、`expires`这六条信息放在key值为`user-info`的localStorage里（利用`multipleTabsKey`当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo<Date>) {
  console.log("setToken", data);
  let expires = 0;
  const { accessToken } = data;
  const refreshToken = data.refreshToken || data.accessToken;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可
  const cookieString = JSON.stringify({ accessToken, expires, refreshToken });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: (expires - Date.now()) / 86400000
      })
    : Cookies.set(TokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay
        }
      : {}
  );

  function setUserKey({
    avatar,
    account,
    nickname,
    email,
    phone,
    sex,
    remark,
    roles
  }) {
    const tenantId =
      data?.tenantId ??
      storageLocal().getItem<DataInfo<number>>(userKey)?.tenantId ??
      "";
    const tenantLogo =
      data?.tenantLogo ??
      storageLocal().getItem<DataInfo<number>>(userKey)?.tenantLogo ??
      "";
    const tenantName =
      data?.tenantName ??
      storageLocal().getItem<DataInfo<number>>(userKey)?.tenantName ??
      "";
    useUserStoreHook().SET_AVATAR(avatar);
    useUserStoreHook().SET_ACCOUNT(account);
    useUserStoreHook().SET_NICKNAME(nickname);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_TENANT_ID(tenantId);
    useUserStoreHook().SET_TENANT_LOGO(tenantLogo);
    useUserStoreHook().SET_TENANT_NAME(tenantName);
    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      eid: data?.eid ?? "",
      lid: data?.lid ?? "",
      avatar,
      account,
      nickname,
      email,
      phone,
      sex,
      remark,
      roles,
      tenantLogo,
      tenantName,
      tenantId
    });
  }

  if (data.account && data.roles) {
    const { account, roles } = data;
    setUserKey({
      avatar: data?.avatar ?? "",
      account,
      nickname: data?.nickname ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      sex: data?.sex ?? 0,
      remark: data?.remark ?? "",
      roles
    });
    useTenantInfoStoreHook().loadTenantInfo();
  } else {
    const avatar =
      storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "";
    const account =
      storageLocal().getItem<DataInfo<number>>(userKey)?.account ?? "";
    const nickname =
      storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    setUserKey({
      avatar,
      account,
      nickname,
      email: "",
      phone: "",
      sex: 0,
      remark: "",
      roles
    });
  }
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
