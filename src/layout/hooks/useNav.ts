import { storeToRefs } from "pinia";
import { getConfig } from "@/config";
import { useRouter } from "vue-router";
import { emitter } from "@/utils/mitt";
import Avatar from "@/assets/user.jpg";
import { getTopMenu } from "@/router/utils";
import { useFullscreen } from "@vueuse/core";
import type { routeMetaType } from "../types";
import { transformI18n } from "@/plugins/i18n";
import { router, remainingPaths } from "@/router";
import { computed, h, onMounted, ref, type CSSProperties } from "vue";
import { useAppStoreHook } from "@/store/modules/app";
import { useUserStoreHook } from "@/store/modules/user";
import { useGlobal, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import { useEpThemeStoreHook } from "@/store/modules/epTheme";
import { usePermissionStoreHook } from "@/store/modules/permission";
import ExitFullscreen from "@iconify-icons/ri/fullscreen-exit-fill";
import Fullscreen from "@iconify-icons/ri/fullscreen-fill";
import { getMineApi, logoffApi, updateMineApi } from "@/api/system/user";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "@/views/system/user/utils/types";
import { message } from "@/utils/message";
import editForm from "@/views/system/user/form/index.vue";
import aboutForm from "@/views/about/index.vue";
import { handleChangePassword } from "@/views/system/user/utils/hook";
import TenantLogo from "/images/default.webp";

const errorInfo =
  "The current routing configuration is incorrect, please check the configuration";

export function useNav() {
  const pureApp = useAppStoreHook();
  const routers = useRouter().options.routes;
  const { isFullscreen, toggle } = useFullscreen();
  const { wholeMenus } = storeToRefs(usePermissionStoreHook());
  /** 平台`layout`中所有`el-tooltip`的`effect`配置，默认`light` */
  const tooltipEffect = getConfig()?.TooltipEffect ?? "light";

  const getDivStyle = computed((): CSSProperties => {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden"
    };
  });

  /** 头像（如果头像为空则使用 src/assets/user.jpg ） */
  const userAvatar = computed(() => {
    return isAllEmpty(useUserStoreHook()?.avatar)
      ? Avatar
      : useUserStoreHook()?.avatar;
  });

  /** 诊所logo */
  const tenantLogo = computed(() => {
    return isAllEmpty(useUserStoreHook()?.tenantLogo)
      ? TenantLogo
      : useUserStoreHook()?.tenantLogo;
  });

  /** 诊所名称 */
  const tenantName = computed(() => {
    return isAllEmpty(useUserStoreHook()?.tenantName)
      ? "九维无纸化病案系统"
      : useUserStoreHook()?.tenantName;
  });

  /** 昵称（如果昵称为空则显示用户名） */
  const account = computed(() => {
    return isAllEmpty(useUserStoreHook()?.nickname)
      ? useUserStoreHook()?.account
      : useUserStoreHook()?.nickname;
  });

  /** 设置国际化选中后的样式 */
  const getDropdownItemStyle = computed(() => {
    return (locale, t) => {
      return {
        background: locale === t ? useEpThemeStoreHook().epThemeColor : "",
        color: locale === t ? "#f4f4f5" : "#000"
      };
    };
  });

  const getDropdownItemClass = computed(() => {
    return (locale, t) => {
      return locale === t ? "" : "dark:hover:!text-primary";
    };
  });

  const avatarsStyle = computed(() => {
    return account.value ? { marginRight: "10px" } : "";
  });

  const isCollapse = computed(() => {
    return !pureApp.getSidebarStatus;
  });

  const device = computed(() => {
    return pureApp.getDevice;
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();
  const layout = computed(() => {
    return $storage?.layout?.layout;
  });

  const title = computed(() => {
    return $config.Title;
  });

  /** 动态title */
  function changeTitle(meta: routeMetaType) {
    const Title = getConfig().Title;
    if (Title) document.title = `${transformI18n(meta.title)} | ${Title}`;
    else document.title = transformI18n(meta.title);
  }

  /** 修改个人信息 */
  async function setAccountInfo() {
    const currentUser = (await getMineApi()).data;
    const editFormRef = ref();
    addDialog({
      title: `用户信息`,
      props: {
        formInline: {
          title,
          higherDeptOptions: [],
          eid: currentUser.eid,
          nickname: currentUser.nickname,
          avatar: currentUser.avatar,
          email: currentUser.email,
          phone: currentUser.phone,
          sex: currentUser.sex,
          remark: currentUser.remark
        }
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: false,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: editFormRef }),
      beforeSure: (done, { options }) => {
        const formRef = editFormRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        formRef.validate(async valid => {
          if (valid) {
            delete curData.title;
            delete curData.higherDeptOptions;
            const res = await updateMineApi(curData);
            if (res) {
              message(`修改个人信息成功`, {
                type: "success"
              });
              done(); // 关闭弹框
            } else {
              message(`修改个人信息失败`, {
                type: "error"
              });
            }
          }
        });
      }
    });
  }

  /** 修改密码 */
  async function changePassword() {
    handleChangePassword(useUserStoreHook().getUserInfo().eid);
  }

  /** 关于系统 */
  async function aboutSystem() {
    //const currentUser = (await getMineApi()).data;
    const aboutFormRef = ref();
    addDialog({
      title: `关于系统`,
      props: {
        version: $config.Version
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: true,
      showClose: true,
      footerRenderer: () => h("span"),
      contentRenderer: () => h(aboutForm, { ref: aboutFormRef }),
      beforeSure: done => {
        done(); // 关闭弹框
      }
    });
  }

  /** 退出登录 */
  async function logout() {
    await logoffApi();
    useUserStoreHook().logOut();
  }

  function backTopMenu() {
    router.push(getTopMenu()?.path);
  }

  function onPanel() {
    emitter.emit("openPanel");
  }

  function toggleSideBar() {
    pureApp.toggleSideBar();
  }

  function handleResize(menuRef) {
    menuRef?.handleResize();
  }

  function resolvePath(route) {
    if (!route.children) return console.error(errorInfo);
    const httpReg = /^http(s?):\/\//;
    const routeChildPath = route.children[0]?.path;
    if (httpReg.test(routeChildPath)) {
      return route.path + "/" + routeChildPath;
    } else {
      return routeChildPath;
    }
  }

  function menuSelect(indexPath: string) {
    if (wholeMenus.value.length === 0 || isRemaining(indexPath)) return;
    emitter.emit("changLayoutRoute", indexPath);
  }

  /** 判断路径是否参与菜单 */
  function isRemaining(path: string) {
    return remainingPaths.includes(path);
  }

  /** 获取`logo` */
  function getLogo() {
    return new URL("/logo.svg", import.meta.url).href;
  }

  return {
    title,
    device,
    layout,
    setAccountInfo,
    changePassword,
    aboutSystem,
    logout,
    routers,
    $storage,
    isFullscreen,
    Fullscreen,
    ExitFullscreen,
    toggle,
    backTopMenu,
    onPanel,
    getDivStyle,
    changeTitle,
    toggleSideBar,
    menuSelect,
    handleResize,
    resolvePath,
    getLogo,
    isCollapse,
    pureApp,
    account,
    userAvatar,
    tenantLogo,
    tenantName,
    avatarsStyle,
    tooltipEffect,
    getDropdownItemStyle,
    getDropdownItemClass
  };
}
