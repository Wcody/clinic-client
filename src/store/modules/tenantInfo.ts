import { defineStore } from "pinia";
import { store } from "../utils";
import { getTenantInfoApi } from "@/api/system/tenant";

export const useTenantInfoStore = defineStore({
  id: "pure-tenant-info",
  state: () => ({
    tenantId: "",
    loadSeq: 0,
    systemName: "",
    systemLogo: ""
  }),
  actions: {
    resetTenantInfo() {
      this.loadSeq++;
      this.tenantId = "";
      this.systemName = "";
      this.systemLogo = "";
    },
    async loadTenantInfo() {
      const currentSeq = this.loadSeq + 1;
      this.loadSeq = currentSeq;
      this.tenantId = "";
      this.systemName = "";
      this.systemLogo = "";
      const res = await getTenantInfoApi();
      if (currentSeq !== this.loadSeq) return res;
      if (res.code === 0 && res.data) {
        this.tenantId = res.data.tenantId ?? "";
        this.systemName = res.data.tenantName ?? "";
        this.systemLogo = res.data.tenantLogo
          ? `/ams/mvc/v1/download/images${res.data.tenantLogo}`
          : "";
      }
      return res;
    }
  }
});

export function useTenantInfoStoreHook() {
  return useTenantInfoStore(store);
}
