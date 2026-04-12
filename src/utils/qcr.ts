import { getCurrentRouterPath } from "./qc";

const initKind0Paths = ["/fmgr/mqcr/index", "/fmgr/aqcr/index"];

const initKind1Paths = ["/mrqc/mqcr/index", "/mrqc/aqcr/index"];

const titles = ["我的质控记录", "全部质控记录"];

export function getInitKind() {
  const path = getCurrentRouterPath();
  if (initKind0Paths.indexOf(path) !== -1) {
    return 0;
  } else if (initKind1Paths.indexOf(path) !== -1) {
    return 1;
  } else {
    console.warn("未定义的页面路径", path);
    return -1;
  }
}

export function getActionKind() {
  let ret = -1;
  const path = getCurrentRouterPath();
  if (path.endsWith("mqcr/index")) {
    ret = 0;
  } else if (path.endsWith("aqcr/index")) {
    ret = 1;
  } else {
    console.warn("未定义的页面路径", path);
  }

  return ret;
}

export function getTitles() {
  return titles;
}
