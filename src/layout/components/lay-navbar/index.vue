<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNotice from "../lay-notice/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";
import GlobalizationIcon from "@/assets/svg/globalization.svg?component";
import AccountSettingsIcon from "@iconify-icons/ri/user-settings-line";
import LogoutCircleRLineIcon from "@iconify-icons/ri/logout-circle-r-line";
import ResetPassIcon from "@iconify-icons/ri/lock-password-line";
import AbountIcon from "@iconify-icons/ri/information-line";
import SettingIcon from "@iconify-icons/ri/settings-3-line";
import CheckIcon from "@iconify-icons/ep/check";
import { onMounted, ref } from "vue";
import { getTenantInfoApi } from "@/api/system/tenant";

const {
  layout,
  device,
  setAccountInfo,
  changePassword,
  aboutSystem,
  logout,
  onPanel,
  pureApp,
  account,
  userAvatar,
  avatarsStyle,
  toggleSideBar,
  getDropdownItemStyle,
  getDropdownItemClass
} = useNav();

const { t, locale, translationCh, translationEn } = useTranslationLang();

const tenantLogo = ref("");
const tenantName = ref("");

onMounted(async () => {
  const res = await getTenantInfoApi();
  console.log("res", res);
  if (res.code === 0) {
    tenantLogo.value = "/ams/mvc/v1/download/images" + res.data.tenantLogo;
    tenantName.value = res.data.tenantName;
  }
});
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <img
        :src="tenantLogo"
        :title="tenantName"
        style="height: 32px; margin-right: 12px"
      />
      <span style="color: gray">{{ tenantName }}</span>
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 国际化 -->
      <el-dropdown v-if="false" id="header-translation" trigger="click">
        <GlobalizationIcon
          class="navbar-bg-hover w-[40px] h-[48px] p-[11px] cursor-pointer outline-none"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="CheckIcon"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="CheckIcon" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 消息通知 -->
      <!-- <LayNotice id="header-notice"/> -->
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="account" class="dark:text-white">{{ account }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="setAccountInfo">
              <IconifyIconOffline
                :icon="AccountSettingsIcon"
                style="margin: 5px"
              />
              个人信息
            </el-dropdown-item>
            <el-dropdown-item @click="changePassword">
              <IconifyIconOffline :icon="ResetPassIcon" style="margin: 5px" />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item @click="aboutSystem">
              <IconifyIconOffline :icon="AbountIcon" style="margin: 5px" />
              关于系统
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <IconifyIconOffline
                :icon="LogoutCircleRLineIcon"
                style="margin: 5px"
              />
              {{ t("buttons.pureLoginOut") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        v-if="false"
        class="set-icon navbar-bg-hover"
        :title="t('buttons.pureOpenSystemSet')"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="SettingIcon" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.logout {
  width: 160px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
