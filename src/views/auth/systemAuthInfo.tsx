import { getConfig } from "@/config";
import { authTypeLables } from "@/utils/dataconst";
import { isPlatformTenant } from "@/utils/tenantInitData";
import { PRODUCT_NAME } from "@/utils/product";
import { useUserStoreHook } from "@/store/modules/user";

export function useSystemAuthinfo(info) {
  const data = info?.data || {};
  const userStore = useUserStoreHook();
  const platform = isPlatformTenant();
  const systemInfo = [
    {
      label: "系统名称",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {PRODUCT_NAME}
          </el-tag>
        );
      }
    },
    {
      label: "系统版本",
      className: "w-[30%]",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {getConfig("Version")}
          </el-tag>
        );
      }
    },
    // {
    //   label: "用户协议",
    //   minWidth: 140,
    //   cellRenderer: () => {
    //     return (
    //       <el-tag size="large" class="!text-base">
    //         {getConfig("Version")}
    //       </el-tag>
    //     );
    //   }
    // },
    // {
    //   label: "隐私协议",
    //   minWidth: 140,
    //   cellRenderer: () => {
    //     return (
    //       <el-tag size="large" class="!text-base">
    //         {getConfig("Version")}
    //       </el-tag>
    //     );
    //   }
    // },
    {
      label: "版权声明",
      labelClassName: "label-fixed-width",
      span: 2,
      cellRenderer: () => {
        return <div style="color: gray;">{getConfig("Copyright")}</div>;
      }
    },
    {
      label: "系统简介",
      labelClassName: "label-fixed-width",
      span: 2,
      cellRenderer: () => {
        return (
          <div style="color: gray;">
            全科医生系统是一个集成了患者诊疗信息、支持电子病历评价、提高医护工作效率、实现病案质控、解决病案存储难题、支持病案录入与审核、自动生成病案号以及病案检索等功能的高效、低成本病案管理解决方案。
          </div>
        );
      }
    }
  ];

  const platformAuthInfo = [
    {
      label: "主体名称",
      span: 2,
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {data.clientName}
          </el-tag>
        );
      }
    },
    {
      label: "授权类别",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {authTypeLables[data.authType]}
          </el-tag>
        );
      }
    },
    {
      label: "截止日期",
      className: "w-[30%]",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" type="success" class="!text-base">
            {data.authType == 2 ? "无" : data.expireDate.substring(0, 10)}
          </el-tag>
        );
      }
    },
    {
      label: "诊所数量",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {data.maxTenantCount}
          </el-tag>
        );
      }
    },
    {
      label: "诊所用户数",
      className: "w-[30%]",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {data.maxUserCount}
          </el-tag>
        );
      }
    },
    {
      label: "设备码",
      labelClassName: "label-fixed-width",
      span: 2,
      cellRenderer: () => {
        return <div style="color: gray;">{data.deviceCode}</div>;
      }
    },
    {
      label: "注册码",
      labelClassName: "label-fixed-width",
      span: 2,
      cellRenderer: () => {
        return <div style="color: yellowgreen;">{data.regCode}</div>;
      }
    }
  ];

  const tenantInfo = [
    {
      label: "诊所名称",
      span: 2,
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {userStore.tenantName || "当前诊所"}
          </el-tag>
        );
      }
    },
    {
      label: "授权类别",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {authTypeLables[data.authType] || "-"}
          </el-tag>
        );
      }
    },
    {
      label: "截止日期",
      className: "w-[30%]",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        const expireDate = data.expireDate?.substring?.(0, 10) || "-";
        return (
          <el-tag size="large" type="success" class="!text-base">
            {data.authType == 2 ? "无" : expireDate}
          </el-tag>
        );
      }
    },
    {
      label: "用户额度",
      labelClassName: "label-fixed-width",
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {data.maxUserCount ?? "-"}
          </el-tag>
        );
      }
    }
  ];

  return {
    systemInfo,
    authInfo: platform ? platformAuthInfo : tenantInfo,
    isPlatform: platform
  };
}
