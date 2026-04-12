import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  //return http.request<Result>("post", "/user/getMenus");
  return http.request<Result>("post", "/menu/getRoutes");
};
