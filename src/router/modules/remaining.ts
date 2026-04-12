import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: $t("menus.pureLogin"),
      showLink: false,
      orderValue: 101
    }
  },
  {
    path: "/img",
    name: "Img",
    component: () => import("@/views/img/index.vue"),
    meta: {
      title: "图片预览",
      showLink: false,
      orderValue: 101
    }
  },
  {
    path: "/pdf",
    name: "Pdf",
    component: () => import("@/views/pdf/index.vue"),
    meta: {
      title: "PDF预览",
      showLink: false,
      orderValue: 101
    }
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("@/views/auth/index.vue"),
    meta: {
      title: "系统授权信息",
      showLink: false,
      orderValue: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: $t("status.pureLoad"),
      showLink: false,
      orderValue: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
