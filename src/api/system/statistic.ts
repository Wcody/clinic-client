import { http } from "@/utils/http";
import type { BQAnyResultType } from "../api";

/**
 * 获取排行榜数据
 */
export const getRankList = () => {
  return http.request<BQAnyResultType>("get", "/record/listRank");
};
