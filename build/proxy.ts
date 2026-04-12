/**
 * Used to parse the .env.development proxy configuration
 */
import type { ProxyOptions } from "vite";

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyTargetList = Record<string, ProxyOptions>;

const httpsRE = /^https:\/\//;

/**
 * Generate proxy
 * @param list
 */
export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target);
    // https://github.com/http-party/node-http-proxy#options
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), ""),
      // https is require secure=false
      ...(isHttps ? { secure: false } : {}),
      configure: proxy => {
        // 配置代理服务器的额外行为，将真实的IP进行转发
        proxy.on("proxyReq", (proxyReq, req) => {
          // 将真实 IP 添加到请求头中
          const realIp =
            req.headers["x-forwarded-for"] || req.socket.remoteAddress;
          proxyReq.setHeader("X-Real-IP", realIp); // 传递真实 IP
        });
      }
    };
  }
  return ret;
}
