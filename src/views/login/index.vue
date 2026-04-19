<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";

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

// const ruleForm = reactive({
//   account: "super",
//   password: "123@abc",
//   tenantId: ""
// });

const ruleForm = reactive({
  account: "曾俊华",
  password: "123456",
  tenantId: ""
});

const showSelectTenant = ref(false);
const selectTenantOptions = ref([]);

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByAccount({
          account: ruleForm.account,
          password: ruleForm.password,
          tenantId: ruleForm.tenantId
        })
        .then(async res => {
          if (res.code === 10001) {
            showSelectTenant.value = true;
            selectTenantOptions.value = JSON.parse(res.message);
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
      <!-- 旋转轨道环 -->
      <div class="orbit orbit-1" />
      <div class="orbit orbit-2" />
      <div class="orbit orbit-3" />

      <!-- 医疗十字 -->
      <div class="cross-wrap">
        <div class="neon-cross">✚</div>
      </div>

      <!-- 标题文字 -->
      <div class="scene-text">
        <div class="scene-title">智慧医疗</div>
        <div class="scene-subtitle">全科医生系统</div>
        <div class="deco-line">
          <span class="seg" />
          <span class="dot" />
          <span class="seg" />
        </div>
      </div>

      <!-- 浮动粒子 -->
      <i v-for="n in 24" :key="n" class="particle" :style="`--n:${n}`" />
    </div>

    <!-- 右侧登录卡片 -->
    <div class="login-panel">
      <div class="login-card">
        <!-- 卡片顶部高光条 -->
        <div class="card-top-glow" />

        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-icon">🏥</div>
          <h1 class="card-title">{{ title }}</h1>
          <p class="card-desc">欢迎回来，请登录您的账户</p>
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
      </div>
    </div>
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
    0 0 6px rgba(255, 255, 255, 0.8),
    0 0 16px #2dd4bf,
    0 0 32px rgba(45, 212, 191, 0.5);
  animation: cross-breathe 3s ease-in-out infinite;
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
  font-size: 40px;
  font-weight: 700;
  color: #e0fdf8;
  letter-spacing: 10px;
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.6),
    0 0 18px #2dd4bf,
    0 0 36px rgba(45, 212, 191, 0.4);
  animation: title-breathe 4s ease-in-out infinite;
}

.scene-subtitle {
  font-size: 14px;
  letter-spacing: 5px;
  color: rgba(45, 212, 191, 0.7);
  margin-top: 8px;
  animation: subtitle-breathe 5s ease-in-out infinite;
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
      0 0 6px #2dd4bf,
      0 0 12px rgba(45, 212, 191, 0.4);
    animation: dot-breathe 3.5s ease-in-out infinite;
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
    box-shadow: 0 0 8px rgba(45, 212, 191, 0.2);
    animation: divider-breathe 5s ease-in-out infinite;
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
    0 0 24px rgba(45, 212, 191, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 24px rgba(45, 212, 191, 0.02);
  animation: card-breathe 6s ease-in-out infinite;
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
    0 0 10px rgba(45, 212, 191, 0.6),
    0 0 20px rgba(45, 212, 191, 0.2);
  animation: top-glow-breathe 4s ease-in-out infinite;
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 30px;

  .card-icon {
    font-size: 42px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.6));
    animation: icon-breathe 3.5s ease-in-out infinite;
  }

  .card-title {
    font-size: 20px;
    font-weight: 700;
    color: #e0fdf8;
    letter-spacing: 2px;
    margin: 0 0 6px;
    text-shadow: 0 0 8px rgba(45, 212, 191, 0.35);
    animation: card-title-breathe 4.5s ease-in-out infinite;
  }

  .card-desc {
    font-size: 12px;
    color: rgba(45, 212, 191, 0.5);
    margin: 0;
    letter-spacing: 1px;
    animation: subtitle-breathe 5.5s ease-in-out infinite;
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

  animation: btn-breathe 4s ease-in-out infinite;

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
</style>
