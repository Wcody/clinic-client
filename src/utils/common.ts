import { ElMessageBox } from "element-plus";

export const confirmBox = (message: string, _type: string = "warning") => {
  return new Promise(resolve => {
    ElMessageBox.confirm(message, _type, {
      title: "确认提示",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

export const saveBlobToFile = (blob: Blob, fileName: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  document.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const isDev = () => {
  return import.meta.env.DEV;
};

export const isProd = () => {
  return import.meta.env.PROD;
};

export const extractNumber = (text: string) => {
  if (!text) return 0;
  const numStr = text.replace(/[^0-9.]/g, "");
  return parseFloat(numStr) || 0;
};
