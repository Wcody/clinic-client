import { getCurrentRouterPath } from "./qc";

const initKind0Paths = ["/search/f/index"];

const initKind1Paths = ["/search/m/index"];

const initKind2Paths = ["/search/oe/index"];

const initKindAllPaths = ["/search/g/index"];

const titles = ["档案查询", "临床病案查询", "门急诊病案查询", "通用查询"];

export function getInitKind() {
  const path = getCurrentRouterPath();
  if (initKind0Paths.indexOf(path) !== -1) {
    return 0;
  } else if (initKind1Paths.indexOf(path) !== -1) {
    return 1;
  } else if (initKind2Paths.indexOf(path) !== -1) {
    return 2;
  } else if (initKindAllPaths.indexOf(path) !== -1) {
    return -1;
  } else {
    console.warn("未定义的页面路径", path);
    return -2;
  }
}

export function getActionKind() {
  const path = getCurrentRouterPath();
  if (initKind0Paths.indexOf(path) !== -1) {
    return 0;
  } else if (initKind1Paths.indexOf(path) !== -1) {
    return 1;
  } else if (initKind2Paths.indexOf(path) !== -1) {
    return 2;
  } else if (initKindAllPaths.indexOf(path) !== -1) {
    return 3;
  } else {
    console.warn("未定义的页面路径", path);
    return -1;
  }
}

export function getTitles() {
  return titles;
}
