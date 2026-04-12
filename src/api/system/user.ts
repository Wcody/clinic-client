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
 * 用户实体类型定义
 */
export type BQUserEntityType = {
  parentId: string;
  account: string;
  password: string;
  name: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  sex: number;
  status: boolean;
  remark: string;
} & BQBaseEntityType;

/**
 * 获取用户缺省值
 */
export const getUserEntityDefault: (
  row?: BQUserEntityType
) => BQUserEntityType = (row?: BQUserEntityType) => {
  return {
    parentId: row?.parentId ?? "0",
    account: row?.account ?? "",
    password: row?.password ?? undefined,
    name: row?.name ?? "",
    nickname: row?.nickname ?? "",
    avatar: row?.avatar ?? "",
    email: row?.email ?? "",
    phone: row?.phone ?? "",
    sex: row?.sex ?? 0,
    status: row?.status ?? true,
    remark: row?.remark ?? "",
    ...getBaseEntityDefault(row)
  };
};

export type BQLoginUserEntityType = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  account: string;
  /** 昵称 */
  nickname: string;
  /** 当前登录用户的角色 */
  roles: Array<string>;
  /** 系统唯一标识 */
  eid: string;
  /** 登录唯一标识 */
  lid: string;
  /** token */
  accessToken: string;
  /** 用于调用刷新`accessToken`的接口时所需的`token` */
  refreshToken: string;
  /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
  expires: Date;
  /** 诊所logo */
  tenantLogo: string;
  /** 诊所名称 */
  tenantName: string;
};

/**
 * 用户实体结果定义
 */
export type BQUserEntityResultType = BQResultType<BQUserEntityType>;

/**
 * 用户实体分页结果定义
 */
export type BQUserSearchPageResultType = BQResultType<
  BQSearchPageResultType<BQUserEntityType>
>;

/**
 * 用户实体列表结果定义
 */
export type BQUserSearchListResultType = BQResultType<
  BQSearchListResultType<BQUserEntityType>
>;

/**
 * 增加用户API
 */
export const addUserApi = (data?: object) => {
  return http.request<BQUserEntityResultType>("post", "/user/save", {
    data
  });
};

/**
 * 更新用户API
 */
export const updateUserApi = (data?: object) => {
  return http.request<BQUserEntityResultType>("post", "/user/update", {
    data
  });
};

/**
 * 更新当前用户信息
 */
export const updateMineApi = (data?: object) => {
  return http.request<BQUserEntityResultType>("post", "/user/updateMine", {
    data
  });
};

/**
 * 获取所有用户API
 */
export const getUserListApi = (data?: object) => {
  const params = {
    ...data,
    //filters: [new BQSearchFilter("title", "like", "系统")],
    orders: [new BQSearchOrder("createdTime")]
  };
  return http.request<BQUserSearchListResultType>("get", "/user/list", {
    params
  });
};

/**
 * 获取所有用户分页API
 */
export const getUserPageApi = (data?: object) => {
  const params = {
    ...data
    //filters: [new BQSearchFilter("title", "like", "系统")],
    //orders: [new BQSearchOrder("orderValue")]
  };
  return http.request<BQUserSearchPageResultType>("get", "/user/page", {
    params
  });
};

/**
 * 查询用户API
 */
export const getUserApi = (eid: string) => {
  return http.request<BQUserEntityResultType>("get", `/user/get/${eid}`);
};

/**
 * 查询当前用户API
 */
export const getMineApi = () => {
  return http.request<BQUserEntityResultType>("get", `/user/getMine`);
};

/**
 * 删除用户API
 */
export const deleteUserApi = (eid: string) => {
  return http.request<BQResultType<Boolean>>("get", `/user/delete/${eid}`);
};

/** 登录 */
export const loginApi = (data?: object) => {
  return http.request<BQResultType<BQLoginUserEntityType>>(
    "post",
    "/user/login",
    { data }
  );
};

/** 注销 */
export const logoffApi = () => {
  return http.request<BQResultType<String>>("post", "/user/logoff");
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<BQResultType<BQLoginUserEntityType>>(
    "post",
    "/user/refreshToken",
    {
      data
    }
  );
};

/** 重置密码 */
export const resetPasswordApi = (data?: object) => {
  return http.request<BQResultType<Boolean>>("post", "/user/resetPassword", {
    data
  });
};

/** 修改密码 */
export const changePasswordApi = (data?: object) => {
  return http.request<BQResultType<Boolean>>("post", "/user/changePassword", {
    data
  });
};

/**
 * 根据角色ID获取菜单ID
 */
export const getRoleIdsByApi = (eid: string) => {
  return http.request<BQResultType<Array<String>>>(
    "get",
    `/user/getRoleIdsBy/${eid}`
  );
};

/** 保存用户角色列表 */
export const saveRoleIdsApi = (eid: string, data?: object) => {
  return http.request<BQResultType<Boolean>>(
    "post",
    `/user/saveRoleIds/${eid}`,
    {
      data
    }
  );
};

/**
 * 用户启用禁用API
 */
export const setStatusUserApi = (eid: string, status: boolean) => {
  return http.request<Boolean>("post", `/user/setStatus/${eid}/${status}`);
};

/**
 * 获取用户在线列表
 */
export const getOnlineUsersApi = (params?: object) => {
  return http.request<BQResultType<any>>("get", `/user/onlineList`, {
    params
  });
};

/**
 * 强退在线用户
 */
export const kickOutOnlineUsersApi = (params?: object) => {
  return http.request<BQResultType<any>>("get", `/user/kickOut`, {
    params
  });
};

/** 获取授权信息 */
export const getAuthInfoApi = () => {
  return http.request<BQResultType<Recordable>>("post", "/user/sysInfo");
};
