<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { getConfig } from "@/config";
import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from "vue";

import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";

defineOptions({ name: "Login" });

const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { t } = useI18n();
const { title } = useNav();
const appVersion = getConfig("Version") || "2.0.1";
const copyright =
  getConfig("Copyright") ||
  "Copyright © 2025-2026 全科医生系统 All Rights Reserved.";

// const ruleForm = reactive({
//   account: "super",
//   password: "123@abc",
//   tenantId: ""
// });

const ruleForm = reactive({
  account: "",
  password: "",
  tenantId: ""
});

const showSelectTenant = ref(false);
const selectTenantOptions = ref<Array<{ label: string; value: string }>>([]);

watch(
  () => ruleForm.account,
  () => {
    ruleForm.tenantId = "";
    showSelectTenant.value = false;
    selectTenantOptions.value = [];
  }
);

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      const tenantId = showSelectTenant.value ? ruleForm.tenantId : "";
      useUserStoreHook()
        .loginByAccount({
          account: ruleForm.account,
          password: ruleForm.password,
          tenantId
        })
        .then(async res => {
          if (res.code === 10001) {
            showSelectTenant.value = true;
            selectTenantOptions.value = JSON.parse(res.message || "[]");
            if (
              !selectTenantOptions.value.some(
                item => item.value === ruleForm.tenantId
              )
            ) {
              ruleForm.tenantId = "";
            }
            nextTick(() => formEl.validate());
          } else {
            await initRouter();
            router.push(getTopMenu(true).path).then(() => {
              message(t("login.pureLoginSuccess"), { type: "success" });
            });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

function onKeydown({ key }: KeyboardEvent) {
  if (key === "Enter") onLogin(ruleFormRef.value);
}

function handleForgotPassword() {
  message("请联系诊所管理员或系统服务人员重置密码", { type: "info" });
}

function openSupportPage() {
  window.open("/pricing.html", "_blank", "noopener,noreferrer");
}

onMounted(() => window.document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() =>
  window.document.removeEventListener("keydown", onKeydown)
);
</script>

<template>
  <div class="neon-wrap">
    <!-- 背景网格 -->
    <div class="bg-grid" />

    <!-- 左侧霓虹场景 -->
    <div class="neon-scene">
      <!-- 标题文字 -->
      <div class="scene-text">
        <div class="scene-kicker">
          <span class="kicker-dot" />
          中小诊所经营管理系统
        </div>
        <div class="scene-title">{{ title }}</div>
        <div class="scene-subtitle">挂号 · 接诊 · 处方 · 收费 · 药房库存</div>
        <div class="scene-points">
          <span>数据按诊所独立管理</span>
          <span>支持单体诊所与小型连锁</span>
          <span>支持私有化部署</span>
        </div>
        <div class="scene-summary">
          <div class="summary-item">
            <strong>完整闭环</strong>
            <span>门诊业务从挂号到收费发药一体化</span>
          </div>
          <div class="summary-item">
            <strong>轻量上线</strong>
            <span>支持远程配置、模板复用和数据导入</span>
          </div>
          <div class="summary-item">
            <strong>经营可看</strong>
            <span>首页概览、药品、项目和财务统计</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="login-panel">
      <div class="login-card">
        <!-- 卡片顶部高光条 -->
        <div class="card-top-glow" />

        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-icon">🏥</div>
          <h1 class="card-title">诊所工作台登录</h1>
          <p class="card-desc">{{ title }} · 日常业务入口</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="loginRules"
          size="large"
          class="neon-form"
        >
          <!-- 诊所选择（多租户） -->
          <Motion v-if="showSelectTenant" :delay="80">
            <el-form-item
              prop="tenantId"
              :rules="[
                { required: true, message: '请选择登录诊所', trigger: 'blur' }
              ]"
            >
              <el-select
                v-model="ruleForm.tenantId"
                clearable
                filterable
                placeholder="请选择诊所"
                class="w-full"
              >
                <el-option
                  v-for="item in selectTenantOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </Motion>

          <!-- 账号 -->
          <Motion :delay="100">
            <el-form-item
              prop="account"
              :rules="[
                {
                  required: true,
                  message: transformI18n($t('login.pureAccountReg')),
                  trigger: 'blur'
                }
              ]"
            >
              <el-input
                v-model="ruleForm.account"
                clearable
                :placeholder="t('login.pureAccount')"
                :prefix-icon="useRenderIcon(User)"
              />
            </el-form-item>
          </Motion>

          <!-- 密码 -->
          <Motion :delay="160">
            <el-form-item prop="password">
              <el-input
                v-model="ruleForm.password"
                clearable
                show-password
                :placeholder="t('login.purePassword')"
                :prefix-icon="useRenderIcon(Lock)"
              />
            </el-form-item>
          </Motion>

          <!-- 登录按钮 -->
          <Motion :delay="240">
            <el-button
              class="neon-btn w-full mt-4"
              size="large"
              type="primary"
              :loading="loading"
              @click="onLogin(ruleFormRef)"
            >
              {{ t("login.pureLogin") }}
            </el-button>
          </Motion>
        </el-form>

        <div class="support-entry">
          <button type="button" @click="handleForgotPassword">忘记密码</button>
          <span />
          <button type="button" @click="openSupportPage">联系支持</button>
        </div>

        <Motion :delay="320">
          <div class="pricing-entry">
            <span class="promo-tip">限时首年 5 折</span>
            <a href="/pricing.html" target="_blank" rel="noopener noreferrer">
              产品与服务方案
            </a>
          </div>
        </Motion>

        <div class="version-info">V{{ appVersion }}</div>
      </div>
    </div>

    <div class="login-copyright">{{ copyright }}</div>
  </div>
</template>

<style scoped lang="scss">
// ── 清新色板 ──────────────────────────────────────────────
// 主色：薄荷青   #2dd4bf
// 辅色：天蓝     #38bdf8
// 点缀：浅紫     #a78bfa
// 背景：渐变蓝绿  #0f2744 → #0d3347 → #0b3d3f
// ─────────────────────────────────────────────────────────

/* ===== 根容器 ===== */
.neon-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: linear-gradient(145deg, #0f2744 0%, #0d3347 50%, #0b3d3f 100%);
  overflow: hidden;
  position: relative;
}

/* ===== 背景网格 ===== */
.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(45, 212, 191, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 212, 191, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* ===== 左侧场景 ===== */
.neon-scene {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 旋转轨道环 */
.orbit {
  position: absolute;
  border-radius: 50%;
  animation: orbit-spin linear infinite;
}

.orbit-1 {
  width: 280px;
  height: 280px;
  border: 1px solid rgba(45, 212, 191, 0.3);
  animation:
    orbit-spin 18s linear infinite,
    orbit-breathe-1 4s ease-in-out infinite;
}

.orbit-2 {
  width: 400px;
  height: 400px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  animation:
    orbit-spin 28s linear infinite reverse,
    orbit-breathe-2 5s ease-in-out infinite;
}

.orbit-3 {
  width: 520px;
  height: 520px;
  border: 1px solid rgba(45, 212, 191, 0.12);
  animation:
    orbit-spin 42s linear infinite,
    orbit-breathe-3 6s ease-in-out infinite;
}

/* 轨道上的发光小球 */
.orbit::after {
  content: "";
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  top: -3.5px;
  left: 50%;
  transform: translateX(-50%);
}

.orbit-1::after {
  background: #2dd4bf;
  box-shadow:
    0 0 6px #2dd4bf,
    0 0 12px rgba(45, 212, 191, 0.5);
}

.orbit-2::after {
  background: #38bdf8;
  box-shadow:
    0 0 6px #38bdf8,
    0 0 12px rgba(56, 189, 248, 0.5);
}

.orbit-3::after {
  background: #a78bfa;
  box-shadow:
    0 0 6px #a78bfa,
    0 0 12px rgba(167, 139, 250, 0.5);
}

/* 医疗十字 */
.cross-wrap {
  position: relative;
  z-index: 2;
}

.neon-cross {
  font-size: 96px;
  line-height: 1;
  color: #e0fdf8;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.55),
    0 0 12px rgba(45, 212, 191, 0.78),
    0 0 24px rgba(45, 212, 191, 0.24);
  animation: cross-breathe 6s ease-in-out infinite;
  user-select: none;
}

/* 文字 */
.scene-text {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 28px;
}

.scene-title {
  font-size: 38px;
  font-weight: 700;
  color: #e0fdf8;
  letter-spacing: 4px;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.4),
    0 0 14px rgba(45, 212, 191, 0.58);
  animation: title-breathe 7s ease-in-out infinite;
}

.scene-subtitle {
  font-size: 14px;
  letter-spacing: 1px;
  color: rgba(45, 212, 191, 0.7);
  margin-top: 10px;
}

.scene-points {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 520px;
  margin: 22px auto 0;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 4px 12px;
    border: 1px solid rgba(45, 212, 191, 0.22);
    border-radius: 999px;
    background: rgba(10, 30, 50, 0.28);
    color: rgba(209, 250, 245, 0.78);
    font-size: 13px;
  }
}

/* 装饰分隔线 */
.deco-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;

  .seg {
    display: block;
    width: 72px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #2dd4bf, transparent);
    box-shadow: 0 0 5px rgba(45, 212, 191, 0.5);
  }

  .dot {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2dd4bf;
    box-shadow:
      0 0 4px rgba(45, 212, 191, 0.72),
      0 0 9px rgba(45, 212, 191, 0.28);
    animation: dot-breathe 7s ease-in-out infinite;
  }
}

/* 浮动粒子 */
.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0;
  left: calc(var(--n) * 4.1%);
  top: calc(var(--n) * 3.7% + 5%);
  animation: float-up calc(var(--n) * 0.35s + 3.5s) ease-in-out infinite;
  animation-delay: calc(var(--n) * 0.28s);
  background: #2dd4bf;
  box-shadow: 0 0 4px rgba(45, 212, 191, 0.6);

  &:nth-child(3n) {
    background: #38bdf8;
    box-shadow: 0 0 4px rgba(56, 189, 248, 0.6);
  }

  &:nth-child(5n) {
    background: #a78bfa;
    box-shadow: 0 0 4px rgba(167, 139, 250, 0.6);
  }
}

/* ===== 右侧登录面板 ===== */
.login-panel {
  width: 460px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 12%;
    height: 76%;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(45, 212, 191, 0.4),
      transparent
    );
    box-shadow: 0 0 6px rgba(45, 212, 191, 0.14);
    animation: divider-breathe 8s ease-in-out infinite;
  }
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 370px;
  background: rgba(10, 30, 50, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(45, 212, 191, 0.25);
  border-radius: 18px;
  padding: 42px 36px 36px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 18px rgba(45, 212, 191, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 18px rgba(45, 212, 191, 0.018);
}

/* 卡片顶部光条 */
.card-top-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 55%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2dd4bf, transparent);
  box-shadow:
    0 0 8px rgba(45, 212, 191, 0.45),
    0 0 16px rgba(45, 212, 191, 0.12);
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 30px;

  .card-icon {
    font-size: 42px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 6px rgba(45, 212, 191, 0.46));
  }

  .card-title {
    font-size: 20px;
    font-weight: 700;
    color: #e0fdf8;
    letter-spacing: 2px;
    margin: 0 0 6px;
    text-shadow: 0 0 6px rgba(45, 212, 191, 0.25);
  }

  .card-desc {
    font-size: 12px;
    color: rgba(45, 212, 191, 0.5);
    margin: 0;
    letter-spacing: 1px;
  }
}

/* ===== 输入框 ===== */
.neon-form {
  :deep(.el-input__wrapper) {
    background: rgba(45, 212, 191, 0.04);
    border: 1px solid rgba(45, 212, 191, 0.2);
    box-shadow: none !important;
    border-radius: 10px;
    transition:
      border-color 0.3s,
      box-shadow 0.3s;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: rgba(45, 212, 191, 0.45);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: #2dd4bf !important;
    box-shadow:
      0 0 0 1px rgba(45, 212, 191, 0.15) !important,
      0 0 10px rgba(45, 212, 191, 0.2) !important;
  }

  :deep(.el-input__inner) {
    color: #d1faf5;
    background: transparent;
  }

  :deep(.el-input__inner::placeholder) {
    color: rgba(45, 212, 191, 0.3);
  }

  :deep(.el-input__prefix-icon svg) {
    color: rgba(45, 212, 191, 0.6);
  }

  :deep(.el-input__suffix-inner svg) {
    color: rgba(45, 212, 191, 0.5);
  }

  :deep(.el-select .el-input__wrapper) {
    background: rgba(45, 212, 191, 0.04);
    border: 1px solid rgba(45, 212, 191, 0.2);
    box-shadow: none !important;
    border-radius: 10px;
  }
}

/* ===== 登录按钮 ===== */
.neon-btn {
  background: linear-gradient(135deg, #0d9488, #0f766e) !important;
  border: 1px solid rgba(45, 212, 191, 0.55) !important;
  border-radius: 10px !important;
  letter-spacing: 3px;
  font-size: 15px;
  font-weight: 600;
  color: #e0fdf4 !important;
  transition: all 0.3s !important;
  box-shadow:
    0 0 12px rgba(45, 212, 191, 0.2),
    0 4px 14px rgba(0, 0, 0, 0.35) !important;

  &:hover {
    background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
    box-shadow:
      0 0 20px rgba(45, 212, 191, 0.4),
      0 4px 14px rgba(0, 0, 0, 0.3) !important;
    transform: translateY(-1px);
    animation: none;
  }

  &:active {
    transform: translateY(0);
  }
}

.support-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;

  button {
    border: 0;
    padding: 0;
    background: transparent;
    color: rgba(209, 250, 245, 0.54);
    cursor: pointer;
    font-size: 12px;
    line-height: 20px;
    transition: color 0.2s;

    &:hover {
      color: #99f6e4;
    }
  }

  span {
    width: 1px;
    height: 12px;
    background: rgba(209, 250, 245, 0.22);
  }
}

.pricing-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
  text-align: center;

  a {
    color: rgba(45, 212, 191, 0.68);
    font-size: 13px;
    letter-spacing: 1px;
    transition:
      color 0.25s,
      text-shadow 0.25s;

    &:hover {
      color: #99f6e4;
      text-shadow: 0 0 10px rgba(45, 212, 191, 0.35);
    }
  }

  .promo-tip {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 2px 9px;
    border: 1px solid rgba(251, 191, 36, 0.36);
    border-radius: 999px;
    background: rgba(251, 191, 36, 0.12);
    color: #fde68a;
    font-size: 12px;
    font-weight: 700;
  }
}

.version-info {
  margin-top: 12px;
  color: rgba(209, 250, 245, 0.42);
  font-size: 12px;
  letter-spacing: 1px;
  text-align: center;
}

.login-copyright {
  position: fixed;
  right: 24px;
  bottom: 14px;
  left: 24px;
  z-index: 2;
  color: rgba(209, 250, 245, 0.42);
  font-size: 12px;
  text-align: center;
  pointer-events: none;
}

/* ===== 动画 ===== */

/* 十字呼吸：发光强度从弱到强 */
@keyframes cross-breathe {
  0%,
  100% {
    text-shadow:
      0 0 6px rgba(255, 255, 255, 0.7),
      0 0 16px #2dd4bf,
      0 0 30px rgba(45, 212, 191, 0.4);
  }
  50% {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 1),
      0 0 26px #2dd4bf,
      0 0 52px rgba(45, 212, 191, 0.75),
      0 0 80px rgba(45, 212, 191, 0.3);
  }
}

/* 标题呼吸：比十字慢半拍 */
@keyframes title-breathe {
  0%,
  100% {
    text-shadow:
      0 0 6px rgba(255, 255, 255, 0.5),
      0 0 16px #2dd4bf,
      0 0 32px rgba(45, 212, 191, 0.35);
  }
  50% {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.9),
      0 0 26px #2dd4bf,
      0 0 52px rgba(45, 212, 191, 0.65);
  }
}

/* 副标题呼吸：透明度渐变 */
@keyframes subtitle-breathe {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* 装饰点呼吸 */
@keyframes dot-breathe {
  0%,
  100% {
    box-shadow:
      0 0 5px #2dd4bf,
      0 0 10px rgba(45, 212, 191, 0.3);
  }
  50% {
    box-shadow:
      0 0 10px #2dd4bf,
      0 0 22px rgba(45, 212, 191, 0.7),
      0 0 36px rgba(45, 212, 191, 0.3);
  }
}

/* 轨道环呼吸 — 三档周期错开 */
@keyframes orbit-breathe-1 {
  0%,
  100% {
    box-shadow: 0 0 6px rgba(45, 212, 191, 0.08);
    border-color: rgba(45, 212, 191, 0.25);
  }
  50% {
    box-shadow: 0 0 16px rgba(45, 212, 191, 0.25);
    border-color: rgba(45, 212, 191, 0.55);
  }
}

@keyframes orbit-breathe-2 {
  0%,
  100% {
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.06);
    border-color: rgba(56, 189, 248, 0.15);
  }
  50% {
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.22);
    border-color: rgba(56, 189, 248, 0.45);
  }
}

@keyframes orbit-breathe-3 {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(45, 212, 191, 0.04);
    border-color: rgba(45, 212, 191, 0.1);
  }
  50% {
    box-shadow: 0 0 14px rgba(45, 212, 191, 0.18);
    border-color: rgba(45, 212, 191, 0.3);
  }
}

/* 分隔竖线呼吸 */
@keyframes divider-breathe {
  0%,
  100% {
    opacity: 0.6;
    box-shadow: 0 0 6px rgba(45, 212, 191, 0.15);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 14px rgba(45, 212, 191, 0.4);
  }
}

/* 顶部光条呼吸 */
@keyframes top-glow-breathe {
  0%,
  100% {
    box-shadow:
      0 0 8px rgba(45, 212, 191, 0.5),
      0 0 16px rgba(45, 212, 191, 0.15);
    opacity: 0.8;
  }
  50% {
    box-shadow:
      0 0 16px rgba(45, 212, 191, 0.9),
      0 0 32px rgba(45, 212, 191, 0.35);
    opacity: 1;
  }
}

/* 图标呼吸 */
@keyframes icon-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 6px rgba(45, 212, 191, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 14px rgba(45, 212, 191, 0.9))
      drop-shadow(0 0 28px rgba(45, 212, 191, 0.4));
  }
}

/* 卡片标题呼吸 */
@keyframes card-title-breathe {
  0%,
  100% {
    text-shadow: 0 0 6px rgba(45, 212, 191, 0.3);
  }
  50% {
    text-shadow:
      0 0 12px rgba(45, 212, 191, 0.7),
      0 0 24px rgba(45, 212, 191, 0.3);
  }
}

/* 按钮呼吸 */
@keyframes btn-breathe {
  0%,
  100% {
    box-shadow:
      0 0 10px rgba(45, 212, 191, 0.18),
      0 4px 14px rgba(0, 0, 0, 0.35);
    border-color: rgba(45, 212, 191, 0.45) !important;
  }
  50% {
    box-shadow:
      0 0 22px rgba(45, 212, 191, 0.45),
      0 4px 14px rgba(0, 0, 0, 0.3);
    border-color: rgba(45, 212, 191, 0.8) !important;
  }
}

/* 卡片外发光呼吸 */
@keyframes card-breathe {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(45, 212, 191, 0.07),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(45, 212, 191, 0.02);
  }
  50% {
    box-shadow:
      0 0 36px rgba(45, 212, 191, 0.18),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 0 28px rgba(45, 212, 191, 0.05);
  }
}

/* 轨道自转 */
@keyframes orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 粒子上浮消散 */
@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  25% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0.4);
  }
}

/* ===== 响应式 ===== */
@media screen and (max-width: 960px) {
  .neon-scene {
    display: none;
  }

  .login-panel {
    width: 100%;
    &::before {
      display: none;
    }
  }
}

/* ===== 与主界面统一的浅色工作台风格 ===== */
.neon-wrap {
  min-height: 100vh;
  height: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 28px;
  padding: 48px clamp(28px, 5vw, 72px) 56px;
  overflow: auto;
  background:
    linear-gradient(
      135deg,
      rgba(240, 253, 251, 0.96) 0%,
      rgba(232, 248, 255, 0.92) 56%,
      rgba(248, 250, 252, 0.98) 100%
    ),
    #f5f7fb;
}

.bg-grid {
  background-image:
    linear-gradient(rgba(45, 212, 191, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
  background-size: 42px 42px;
  opacity: 0.7;
}

.neon-scene {
  min-width: 0;
  align-items: stretch;
  justify-content: center;
}

.scene-text {
  width: min(760px, 100%);
  margin: 0;
  padding: 36px;
  border: 1px solid rgba(45, 212, 191, 0.16);
  border-radius: 18px;
  background: linear-gradient(135deg, #f0fdfb 0%, #e8f8ff 64%, #ffffff 100%);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  text-align: left;
}

.scene-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.12);
  color: #0f766e;
  font-size: 13px;
  font-weight: 700;
}

.kicker-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2dd4bf;
}

.scene-title {
  margin-top: 18px;
  color: #172033;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.12;
  letter-spacing: 0;
  text-shadow: none;
  animation: none;
}

.scene-subtitle {
  margin-top: 12px;
  color: #475467;
  font-size: 17px;
  letter-spacing: 0;
  animation: none;
}

.scene-points {
  justify-content: flex-start;
  max-width: none;
  margin: 24px 0 0;
}

.scene-points span {
  border-color: rgba(45, 212, 191, 0.18);
  background: #ffffff;
  color: #0f766e;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.scene-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.summary-item {
  min-height: 112px;
  padding: 18px;
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
}

.summary-item strong {
  display: block;
  color: #172033;
  font-size: 17px;
}

.summary-item span {
  display: block;
  margin-top: 8px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.login-panel {
  width: auto;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.login-panel::before {
  display: none;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 34px 34px 28px;
  overflow: visible;
  border: 1px solid #d9e2ec;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(12px);
}

.card-top-glow {
  display: none;
}

.card-header {
  margin-bottom: 26px;
}

.card-header .card-icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #e6faf8;
  font-size: 28px;
  filter: none;
}

.card-header .card-title {
  color: #172033;
  font-size: 22px;
  letter-spacing: 0;
  text-shadow: none;
}

.card-header .card-desc {
  color: #667085;
  font-size: 13px;
  letter-spacing: 0;
}

.neon-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.neon-form :deep(.el-input__wrapper),
.neon-form :deep(.el-select .el-input__wrapper) {
  min-height: 42px;
  border: 1px solid #d9e2ec;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: none !important;
}

.neon-form :deep(.el-input__wrapper:hover),
.neon-form :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(45, 212, 191, 0.72);
}

.neon-form :deep(.el-input__wrapper.is-focus),
.neon-form :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.12) !important;
}

.neon-form :deep(.el-input__inner) {
  color: #172033;
}

.neon-form :deep(.el-input__inner::placeholder) {
  color: #98a2b3;
}

.neon-form :deep(.el-input__prefix-icon svg),
.neon-form :deep(.el-input__suffix-inner svg) {
  color: #98a2b3;
}

.neon-btn {
  min-height: 42px;
  border: 0 !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #14b8a6, #0f766e) !important;
  color: #ffffff !important;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.22) !important;
}

.neon-btn:hover {
  background: linear-gradient(135deg, #2dd4bf, #0d9488) !important;
  box-shadow: 0 10px 22px rgba(15, 118, 110, 0.28) !important;
}

.support-entry {
  margin-top: 10px;
}

.support-entry button {
  color: #667085;
}

.support-entry button:hover {
  color: #0f766e;
}

.support-entry span {
  background: #d9e2ec;
}

.pricing-entry {
  margin-top: 18px;
}

.pricing-entry a {
  color: #0f766e;
  font-weight: 700;
  letter-spacing: 0;
}

.pricing-entry a:hover {
  color: #0d9488;
  text-shadow: none;
}

.pricing-entry .promo-tip {
  border-color: rgba(180, 83, 9, 0.18);
  background: #fffbeb;
  color: #b45309;
}

.version-info {
  color: #98a2b3;
  letter-spacing: 0;
}

.login-copyright {
  color: #667085;
}

@media screen and (max-width: 1100px) {
  .neon-wrap {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .login-panel {
    align-items: flex-start;
  }

  .login-card {
    max-width: 100%;
  }
}

@media screen and (max-width: 760px) {
  .neon-wrap {
    display: block;
    padding: 22px 14px 52px;
  }

  .neon-scene {
    display: block;
    margin-bottom: 16px;
  }

  .scene-text {
    padding: 22px;
  }

  .scene-title {
    font-size: 30px;
  }

  .scene-summary {
    grid-template-columns: 1fr;
  }

  .login-card {
    padding: 28px 22px 24px;
  }
}
</style>
