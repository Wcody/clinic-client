const initKind0Paths = [
  "/fmgr/qcn/index",
  "/fmgr/qcd/index",
  "/fmgr/fqc/index"
];

const initKind1Paths = [
  "/mrqc/cqcn/index",
  "/mrqc/cqcd/index",
  "/mrqc/cfqc/index"
];

const initKind2Paths = [
  "/mrqc/oeqcn/index",
  "/mrqc/oeqcd/index",
  "/mrqc/oefqc/index"
];

const titles = ["档案列表", "临床病案列表", "门急诊病案列表"];
const actionKindTitles = [
  "护士质控",
  "医生质控",
  "终末质控",
  "一级质控",
  "二级质控",
  "终末质控"
];
const actions = ["nurse", "doctor", "final", "nurse", "doctor", "final"];

export function getInitKind() {
  const path = getCurrentRouterPath();
  if (initKind0Paths.indexOf(path) !== -1) {
    return 0;
  } else if (initKind1Paths.indexOf(path) !== -1) {
    return 1;
  } else if (initKind2Paths.indexOf(path) !== -1) {
    return 2;
  } else {
    console.warn("未定义的页面路径", path);
    return -1;
  }
}

export function getActionKind() {
  let ret = -1;
  const path = getCurrentRouterPath();
  const initKind = getInitKind();
  if (path.endsWith("cn/index")) {
    // 护士质控
    ret = 0;
  } else if (path.endsWith("cd/index")) {
    // 医生质控
    ret = 1;
  } else if (path.endsWith("fqc/index")) {
    // 终末质控
    ret = 2;
  } else {
    console.warn("未定义的页面路径", path);
  }

  if (initKind === 0 && ret !== -1) {
    ret += 3;
  }

  return ret;
}

export function getTitles() {
  return titles;
}

export function getActionKindTitles() {
  return actionKindTitles;
}

export function getActions() {
  return actions;
}

export function getPrevActionTitle(actionKind) {
  if (actionKind === 0 || actionKind === 3) {
    return "无法处理";
  } else {
    return actionKindTitles[actionKind - 1] || "非法参数";
  }
}

export function getNextActionTitle(actionKind) {
  if (actionKind === 2 || actionKind === 5) {
    return "质控完成";
  } else {
    return actionKindTitles[actionKind + 1] || "非法参数";
  }
}

export function getCurrentRouterPath() {
  return window.location.href.split("#")[1];
}
