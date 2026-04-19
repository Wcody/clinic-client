import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { createProxy } from "./build/proxy";
import {
  type UserConfigExport,
  type ConfigEnv,
  loadEnv,
  defineConfig
} from "vite";
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__
} from "./build/utils";

export default ({ mode }: ConfigEnv): UserConfigExport => {
  console.log(mode);
  const {
    VITE_CDN,
    VITE_PORT,
    VITE_COMPRESSION,
    VITE_PUBLIC_PATH,
    VITE_PROXY
  } = wrapperEnv(loadEnv(mode, root));
  return defineConfig({
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler", // 修改api调用方式
          quietDeps: true,// 禁用废弃依赖警告
          additionalData: `
        $subMenuActiveText: #e0fdf8 !default;
        $menuBg: #0d2a3a !default;
        $menuHover: rgba(45, 212, 191, 0.10) !default;
        $subMenuBg: #091e2e !default;
        $subMenuActiveBg: rgba(45, 212, 191, 0.14) !default;
        $menuText: rgba(224, 253, 248, 0.58) !default;
        $sidebarLogo: #0d2a3a !default;
        $menuTitleHover: #e0fdf8 !default;
        $menuActiveBefore: #2dd4bf !default;
      `
        }
      }
    },
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: "0.0.0.0",
      https: false,
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: createProxy(VITE_PROXY),
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      },
      allowedHosts: ["77qc340868sd.vicp.fun"]
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: "es2015",
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve("./index.html", import.meta.url)
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  });
};
