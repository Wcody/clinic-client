<script setup lang="ts">
import editForm from "@/views/cm/manual/form.vue";
import editMZForm from "@/views/cm/manual/mzForm.vue";
import editDAForm from "@/views/cm/manual/daForm.vue";
import QcViewAnnotation from "./qcViewAnnotation.vue";
import QcViewKind from "./qcViewKind.vue";
import QcUpload from "./qcUpload.vue";
import BqImgViewer from "@/components/BqImgViewer";
import {
  computed,
  h,
  markRaw,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import { FormProps, UploadFormProps } from "./utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SignLogo from "/images/sign.png";

import ArrowRight from "@iconify-icons/ri/arrow-right-double-line";
import ArrowLeft from "@iconify-icons/ri/arrow-left-double-line";
import Add from "@iconify-icons/ri/add-line";
import TreeIcon from "@iconify-icons/ri/flow-chart";
import AnnoIcon from "@iconify-icons/ri/anchor-line";
import UploadIcon from "@iconify-icons/ri/upload-line";
import PageIcon from "@iconify-icons/ri/pages-line";
import PrevIcon from "@iconify-icons/ri/skip-left-line";
import NextIcon from "@iconify-icons/ri/skip-right-line";
import ZoomInIcon from "@iconify-icons/ri/zoom-in-line";
import ZoomOutIcon from "@iconify-icons/ri/zoom-out-line";
import SearchIcon from "@iconify-icons/ri/search-line";
import DeleteIcon from "@iconify-icons/ri/delete-bin-line";
import RenameIcon from "@iconify-icons/ri/edit-2-line";
import ReCollectIcon from "@iconify-icons/ri/edit-box-line";
import MoreIcon from "@iconify-icons/ep/more-filled";
import AbolishIcon from "@iconify-icons/ri/forbid-2-line";
import FileIcon from "@iconify-icons/ri/file-4-line";
import ReUseIcon from "@iconify-icons/ri/recycle-line";
import ViewIcon from "@iconify-icons/ri/eye-line";
import ViewOffIcon from "@iconify-icons/ri/eye-off-line";
import EditPenIcon from "@iconify-icons/ep/edit-pen";
import RefreshIcon from "@iconify-icons/ep/refresh";
import AddIcon from "@iconify-icons/ri/add-circle-line";
import TurnLeftIcon from "@iconify-icons/ri/arrow-turn-back-line";
import TurnRightIcon from "@iconify-icons/ri/arrow-turn-forward-line";
import PrinterIcon from "@iconify-icons/ri/printer-line";
import PostIcon from "@iconify-icons/ep/check";
import BackIcon from "@iconify-icons/ep/close";
import { addDialog } from "@/components/ReDialog";
import { uploadAttachmentApi } from "@/api/cm/attachment";
import { message } from "@/utils/message";
import { downloadFile } from "@/api/api";
import ViewerPrint from "@/utils/viewerPrint";
import { sign } from "crypto";
import { ElInput } from "element-plus";
import {
  getRecordApi,
  getRecordEntityDefault,
  getWzRecordListByApi,
  qcApi,
  updateRecordApi
} from "@/api/cm/record";
import {
  getActionKind,
  getInitKind,
  getNextActionTitle,
  getPrevActionTitle
} from "@/utils/qc";
import { useRoute } from "vue-router";
import { getQtKindByKindListApi } from "@/api/cm/kind";
import { ruleKindLables, limitKindLables } from "@/utils/dataconst";

const props = defineProps<FormProps>();
const viewType = props.otherInfo?.type || "view";
const qcKind = props.otherInfo?.qcKind || "";
const isQc = viewType === "qc";
const route = useRoute();
const initKind = getInitKind();
const actionKind = getActionKind();

const newFormInlineRef = ref(props.formInline);
const leftTreeRef = ref();
const annotationRef = ref();
const imgViewerRef = ref();
const divLeftRef = ref<HTMLDivElement>();
const divRightRef = ref<HTMLDivElement>();
const defaulSidetWidth = 320;
const spliterWidth = 4;
const leftSideWidthRef = ref(defaulSidetWidth);
const rightSideWidthRef = ref(defaulSidetWidth);
const totalPointsRef = ref(100);
const imageSrcRef = ref("");
const drawRectRef = ref([0, 0, 0, 0]);
const leftSelectValue = ref(1);
const isMoving = ref({ left: false, right: false });
const currentPageRef = ref(1);
const zoomRef = ref(100);
const handleIsOk = ref(false);
const wzDataRef = ref({
  title: "完整性校验通过",
  icon: PostIcon,
  type: "success",
  list: []
});
const qtDataRef = ref({
  title: "齐套性校验不通过",
  icon: PostIcon,
  type: "success",
  list: []
});
const leftSideCssWidthRef = computed(() => {
  return `${leftSideWidthRef.value}px`;
});
const rightSideCssWidthRef = computed(() => {
  return `${rightSideWidthRef.value}px`;
});
const leftSideCssDisplayRef = computed(() => {
  return leftSideWidthRef.value < 50 ? "none" : "block";
});
const rightSideCssDisplayRef = computed(() => {
  return rightSideWidthRef.value < 50 ? "none" : "block";
});
const leftBarStyleRef = computed(() => {
  return {
    left:
      (leftSideCssDisplayRef.value == "none" ? 0 : leftSideWidthRef.value) +
      spliterWidth +
      "px"
  };
});
const rightBarStyleRef = computed(() => {
  return {
    right:
      (rightSideCssDisplayRef.value == "none" ? 0 : rightSideWidthRef.value) +
      spliterWidth +
      "px"
  };
});
const leftIconRef = computed(() => {
  return markRaw(
    useRenderIcon(
      leftSideCssDisplayRef.value == "none" ? ArrowRight : ArrowLeft
    )
  );
});
const rightIconRef = computed(() => {
  return markRaw(
    useRenderIcon(
      rightSideCssDisplayRef.value == "none" ? ArrowLeft : ArrowRight
    )
  );
});
const departmentKindNames = ["所属", "住院", "就诊"];
const clientHeightRef = ref("calc(100vh - 85px)");
const clientWidthRef = computed(() => {
  return `calc(100% - ${(leftSideCssDisplayRef.value == "none" ? 0 : leftSideWidthRef.value) + (rightSideCssDisplayRef.value == "none" ? 0 : rightSideWidthRef.value) + spliterWidth * 2}px)`;
});

const resizeObserver = new ResizeObserver(() => {
  if (props.headerRef.value) {
    clientHeightRef.value = `calc(100vh - ${props.headerRef.value.getHeaderRef().value.clientHeight + 53}px)`;
  }
});

const onLeftSplitterMouseDown = (e: MouseEvent) => {
  const oldX = e.clientX;
  const oldWidth = divLeftRef.value?.offsetWidth || 0;
  const oldCursor = document.body.style.cursor;
  document.body.style.cursor = "col-resize";
  document.onmousemove = e => {
    isMoving.value.left = true;
    leftSideWidthRef.value = Math.min(
      Math.max(oldWidth + (e.clientX - oldX), defaulSidetWidth),
      defaulSidetWidth * 2
    );
    e.preventDefault();
    e.stopPropagation();
  };
  document.onmouseup = () => {
    isMoving.value.left = false;
    document.onmousemove = null;
    document.onmouseup = null;
    document.body.style.cursor = oldCursor;
    e.preventDefault();
    e.stopPropagation();
  };
  e.preventDefault();
  e.stopPropagation();
};

const onRightSplitterMouseDown = (e: MouseEvent) => {
  const oldX = e.clientX;
  const oldWidth = divRightRef.value?.offsetWidth || 0;
  const oldCursor = document.body.style.cursor;
  document.body.style.cursor = "col-resize";
  document.onmousemove = e => {
    isMoving.value.right = true;
    rightSideWidthRef.value = Math.min(
      Math.max(oldWidth - (e.clientX - oldX), defaulSidetWidth),
      defaulSidetWidth * 2
    );
    e.preventDefault();
    e.stopPropagation();
  };
  document.onmouseup = () => {
    isMoving.value.right = false;
    document.onmousemove = null;
    document.onmouseup = null;
    document.body.style.cursor = oldCursor;
    e.preventDefault();
    e.stopPropagation();
  };
  e.preventDefault();
  e.stopPropagation();
};

const leftButtons = [
  {
    label: "分类视图",
    icon: useRenderIcon(TreeIcon),
    value: 1
  },
  {
    label: "批注视图",
    icon: useRenderIcon(AnnoIcon),
    value: 2
  },
  {
    label: "上传视图",
    icon: useRenderIcon(UploadIcon),
    value: 3
  },
  {
    label: "页码视图",
    icon: useRenderIcon(PageIcon),
    value: 4
  }
];

const imgListRef = computed(() => {
  if (leftTreeRef.value) {
    return leftTreeRef.value.attachmentListRef;
  } else {
    return [];
  }
});

const totalPagesRef = computed(() => {
  return leftTreeRef.value?.attachmentListRef.length || 99;
});

const currentNodeRef = computed(() => {
  return leftTreeRef.value?.getCurrentNode() || {};
});

async function downloadImage(attachmentId: string) {
  if (attachmentId) {
    const url = `/download/medical/${attachmentId}`;
    downloadFile(url)
      .then(res => {
        imageSrcRef.value = URL.createObjectURL(res);
      })
      .catch(err => {
        console.log("err", err);
      });
  }
}

async function refreshWz() {
  // 获取完整性检验结果
  const resWz = await getWzRecordListByApi({
    recordKind: initKind,
    recordId: newFormInlineRef.value.eid
  });
  if (resWz.data) {
    wzDataRef.value.list = resWz.data;
    if (resWz.data.length > 0) {
      wzDataRef.value.title = "完整性规则校验不通过";
      wzDataRef.value.icon = BackIcon;
      wzDataRef.value.type = "danger";
    } else {
      wzDataRef.value.title = "完整性规则校验已通过";
      wzDataRef.value.icon = PostIcon;
      wzDataRef.value.type = "success";
    }
  }
}

async function handleEditRecord() {
  const recordRes = await getRecordApi(newFormInlineRef.value.eid);
  if (recordRes.code != 0) {
    message(recordRes.message, {
      type: "error"
    });
    return;
  }
  const formRef = ref();
  function getFrom() {
    if (initKind == 2) {
      return editMZForm;
    } else if (initKind == 0) {
      return editDAForm;
    } else {
      return editForm;
    }
  }
  const title = "编辑";
  const caption = "病案";
  addDialog({
    title,
    props: {
      formInline: {
        title,
        initKind,
        caption,
        ...getRecordEntityDefault(recordRes.data)
      }
    },
    width: "90%",
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    contentRenderer: () => h(getFrom(), { ref: formRef }),
    beforeSure: (done, { options }) => {
      const FormRef = formRef.value.getRef();
      const curData = formRef.value.getData();
      function chores() {
        message(`修改成功`, {
          type: "success"
        });
        done(); // 关闭弹框
      }
      FormRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          // 表单规则校验通过
          await updateRecordApi(curData);
          chores();
          refreshWz();
        }
      });
    }
  });
}

async function refreshQt() {
  const resQt = await getQtKindByKindListApi({
    kind: initKind,
    recordId: newFormInlineRef.value.eid
  });
  if (resQt.data) {
    qtDataRef.value.list = resQt.data;
    if (resQt.data.length > 0) {
      qtDataRef.value.title = "齐套性规则校验不通过";
      qtDataRef.value.icon = BackIcon;
      qtDataRef.value.type = "danger";
    } else {
      qtDataRef.value.title = "齐套性规则校验已通过";
      qtDataRef.value.icon = PostIcon;
      qtDataRef.value.type = "success";
    }
  }
}

onMounted(async () => {
  resizeObserver.observe(props.headerRef.value.getHeaderRef().value);

  watch(
    () => newFormInlineRef.value.selectNodeId,
    val => {
      const item = leftTreeRef.value.attachmentIdMapRef[val];
      currentPageRef.value = item?.page || 1;
    }
  );

  watch(currentPageRef, val => {
    const item = leftTreeRef.value.attachmentPageMapRef[val];
    leftTreeRef.value.selectNodeById(item.eid);
  });

  // 获取完整性检验结果
  refreshWz();

  //获取齐套性检验结果
  refreshQt();
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});

function leftBarClick() {
  if (leftSideCssDisplayRef.value == "none") {
    leftSideWidthRef.value = defaulSidetWidth;
  } else {
    leftSideWidthRef.value = 0;
  }
}

function rightBarClick() {
  if (rightSideCssDisplayRef.value == "none") {
    rightSideWidthRef.value = defaulSidetWidth;
  } else {
    rightSideWidthRef.value = 0;
  }
}

function addAnotation() {
  annotationRef.value.addAnotation();
}

function showDetail() {
  console.log("showDetail");
}

function onUpdateDrawRect(rect: number[]) {
  drawRectRef.value = rect;
}

function uploadFile() {
  const uploadRef = ref();
  addDialog({
    title: "上传文件",
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () =>
      h(QcUpload, {
        ref: uploadRef,
        formInline: {
          uploadType: 1,
          initKind: newFormInlineRef.value.initKind,
          recordId: newFormInlineRef.value.eid
        }
      }),
    beforeSure: (done, { options, index }) => {
      const formRef = uploadRef.value.getRef();
      const curData =
        uploadRef.value.getData() as UploadFormProps["formInline"];
      formRef.validate(async valid => {
        if (valid) {
          console.log("curData", curData);
          //新建表单对象
          const formData = new FormData();
          for (let e of curData.fileList) {
            formData.append("fileList", e.raw);
          }
          formData.append("recordId", curData.recordId);
          formData.append("uploadType", curData.uploadType + "");
          formData.append("initKind", curData.initKind + "");
          formData.append("kindId", curData.kindId);
          await uploadAttachmentApi(formData);
          message("上传成功", { type: "success" });
          leftTreeRef.value.refreshTree();
          done(options, index);
        }
      });
    }
  });
}

function switchViewMode() {
  console.log("switchViewMode");
}

function reCollect() {
  console.log("reCollect");
}

function doCollect() {
  console.log("doCollect");
}

function prevPage() {
  currentPageRef.value -= 1;
}

function nextPage() {
  currentPageRef.value += 1;
}

function zoomIn() {
  zoomRef.value += 20;
}

function zoomOut() {
  zoomRef.value -= 20;
}

function handleRekind() {
  if (currentNodeRef.value) {
    leftTreeRef.value.reKind(currentNodeRef.value);
  }
}

function handleDelete() {
  if (currentNodeRef.value) {
    leftTreeRef.value.deleteNode(currentNodeRef.value);
  }
}

function handlePrint() {
  ViewerPrint(leftTreeRef.value.attachmentListRef, {
    appendHtml: imgViewerRef.value.getSignDivHtml(),
    sign: {
      width: "20%",
      opacity: 0.3,
      right: "10%",
      bottom: "10%",
      src: SignLogo
    }
  }).toPrint;
}

function handleAbolish() {
  if (currentNodeRef.value) {
    leftTreeRef.value.abolishNode(
      currentNodeRef.value,
      !currentNodeRef.value.status
    );
  }
}

function handleRename() {
  if (currentNodeRef.value) {
    leftTreeRef.value.reName(currentNodeRef.value);
  }
}

function qcRecord(act) {
  const inputValueRef = ref("");
  addDialog({
    title: `质控${act == "qc" ? "提交到" : "退回到"}  ${act == "qc" ? getNextActionTitle(actionKind) : getPrevActionTitle(actionKind)}`,
    showClose: true,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: false,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: false,
    contentRenderer: () => {
      return h(ElInput, {
        modelValue: inputValueRef.value,
        "onUpdate:modelValue": val => (inputValueRef.value = val),
        autofocus: true,
        placeholder: "请输入理由",
        clearable: true,
        type: "textarea",
        showWordLimit: true,
        maxlength: 250,
        autosize: true,
        style: {
          marginBottom: "20px"
        }
      });
    },
    beforeSure: async (done, { options, index }) => {
      if (!inputValueRef.value) {
        return message("理由不能为空", { type: "error" });
      }
      const res = await qcApi(
        qcKind,
        act,
        newFormInlineRef.value.eid,
        inputValueRef.value
      );
      if (res) {
        handleIsOk.value = true;
        message("操作成功", { type: "success" });
        //关闭宿主窗口
        props.headerRef.value.getHeaderInfo().needFreshList = true;
        props.headerRef.value.getHeaderInfo().close("54354353535");
        //关闭对话框
        done(options, index);
      }
    }
  });
}

function handleSubmit() {
  qcRecord("qc");
}

function handleBack() {
  qcRecord("qcb");
}

defineExpose({
  showDetail,
  uploadFile,
  switchViewMode,
  reCollect
});
</script>

<template>
  <div class="full-main">
    <div ref="divLeftRef" class="left-side">
      <div class="header-info">
        <el-segmented
          v-model="leftSelectValue"
          style="width: 100%"
          :options="leftButtons"
          block
        >
          <template #default="{ item }">
            <div class="flex flex-col items-center" :title="item.label">
              <el-icon size="20">
                <component :is="item.icon" />
              </el-icon>
            </div>
          </template>
        </el-segmented>
      </div>
      <div class="wrapper">
        <QcViewKind
          ref="leftTreeRef"
          :form-inline="newFormInlineRef"
          :left-select-value="leftSelectValue"
          :other-info="props.otherInfo"
        />
      </div>
    </div>
    <div class="left-spliter" @mousedown="onLeftSplitterMouseDown" />
    <div class="client">
      <div class="header-info">
        <el-space :size="2">
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="上一页"
            :disabled="currentPageRef <= 1"
            :icon="useRenderIcon(PrevIcon)"
            @click="prevPage"
          />
          <el-input-number
            v-model="currentPageRef"
            style="width: 70px; padding: 0"
            :min="1"
            :max="totalPagesRef"
            size="small"
            :controls="false"
          >
            <template #suffix>
              <span>/</span>
              <span style="margin-left: 8px">{{ totalPagesRef }}</span>
            </template>
          </el-input-number>
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="下一页"
            :disabled="currentPageRef >= totalPagesRef"
            :icon="useRenderIcon(NextIcon)"
            @click="nextPage"
          />
        </el-space>
        <el-space>
          <el-button
            v-if="isQc"
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="重新分类"
            :icon="useRenderIcon(ReCollectIcon)"
            @click="handleRekind"
          />
          <el-button
            v-if="isQc"
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="重命名"
            :icon="useRenderIcon(RenameIcon)"
            @click="handleRename"
          />
          <!-- <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="顺时针旋转"
            :icon="useRenderIcon(TurnLeftIcon)"
          />
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="逆时针旋转"
            :icon="useRenderIcon(TurnRightIcon)"
          />
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="废止"
            :icon="useRenderIcon(AbolishIcon)"
          />
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="删除"
            :icon="useRenderIcon(DeleteIcon)"
          /> -->
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="打印"
            :icon="useRenderIcon(PrinterIcon)"
            @click="handlePrint"
          />
          <el-button
            v-if="isQc"
            style="font-size: 20px"
            :type="currentNodeRef.status == 1 ? 'danger' : 'primary'"
            size="small"
            circle
            plain
            text
            :title="currentNodeRef.status == 1 ? '废止' : '启用'"
            :icon="
              currentNodeRef.status == 1
                ? useRenderIcon(AbolishIcon)
                : useRenderIcon(ReUseIcon)
            "
            @click="handleAbolish"
          />
          <el-button
            v-if="isQc"
            style="font-size: 20px"
            type="danger"
            size="small"
            circle
            plain
            text
            title="删除"
            :icon="useRenderIcon(DeleteIcon)"
            @click="handleDelete"
          />
        </el-space>
        <el-space :size="2">
          <el-popover placement="bottom" :width="600" trigger="click">
            <template #reference>
              <el-button
                style="margin-right: 8px"
                :type="wzDataRef.type"
                plain
                size="small"
                :title="wzDataRef.title"
                :icon="useRenderIcon(wzDataRef.icon)"
                >完验</el-button
              >
            </template>
            <div>
              <div
                v-if="wzDataRef.list.length > 0"
                class="font-bold text-red-500 text-2xl flex justify-between"
              >
                <span>以下完整性规则校验未通过：</span>
                <el-space>
                  <el-button
                    style="font-size: 20px"
                    type="primary"
                    size="small"
                    circle
                    plain
                    text
                    title="编辑"
                    :icon="useRenderIcon(EditPenIcon)"
                    @click="handleEditRecord"
                  /><el-button
                    style="font-size: 20px"
                    type="primary"
                    size="small"
                    circle
                    plain
                    text
                    title="重新检验"
                    :icon="useRenderIcon(RefreshIcon)"
                    @click="refreshWz"
                  />
                </el-space>
              </div>
              <div
                v-if="wzDataRef.list.length === 0"
                class="font-bold text-green-600 text-2xl text-center"
              >
                完整性规则已全部校验通过!
              </div>
              <el-table
                v-else
                class="w-full"
                max-height="500"
                :data="wzDataRef.list"
                border
                table-layout="auto"
              >
                <el-table-column
                  width="60"
                  type="index"
                  align="center"
                  label="序号"
                />
                <el-table-column
                  min-width="150"
                  property="ruleDesc"
                  label="规则内容"
                />
                <el-table-column
                  width="100"
                  property="ruleKind"
                  label="规则类别"
                  ><template #default="scope">
                    <el-tag>{{ ruleKindLables[scope.row.ruleKind] }}</el-tag>
                  </template></el-table-column
                >
                <el-table-column
                  width="100"
                  property="limitKind"
                  label="限制类别"
                  ><template #default="scope">
                    <el-tag>{{ limitKindLables[scope.row.ruleKind] }}</el-tag>
                  </template></el-table-column
                >
              </el-table>
            </div>
          </el-popover>
          <el-popover placement="bottom" :width="600" trigger="click">
            <template #reference>
              <el-button
                style="margin-right: 8px"
                :type="qtDataRef.type"
                plain
                size="small"
                :title="qtDataRef.title"
                :icon="useRenderIcon(qtDataRef.icon)"
                >齐验</el-button
              >
            </template>
            <div>
              <div
                v-if="qtDataRef.list.length > 0"
                class="font-bold text-red-500 text-2xl flex justify-between"
              >
                <span>以下齐套性规则校验未通过：</span>
                <el-space>
                  <el-button
                    style="font-size: 20px"
                    type="primary"
                    size="small"
                    circle
                    plain
                    text
                    title="重新校验"
                    :icon="useRenderIcon(RefreshIcon)"
                    @click="refreshQt"
                  />
                </el-space>
              </div>
              <div
                v-if="qtDataRef.list.length === 0"
                class="font-bold text-green-600 text-2xl text-center"
              >
                齐套性规则已全部校验通过!
              </div>
              <el-table
                v-else
                max-height="500"
                :data="qtDataRef.list"
                border
                table-layout="auto"
              >
                <el-table-column
                  width="60"
                  type="index"
                  align="center"
                  label="序号"
                />
                <el-table-column
                  min-width="150"
                  property="name"
                  label="分类名称"
                />
                <el-table-column
                  width="100"
                  property="limitKind"
                  label="齐套类别"
                  ><el-tag type="danger">缺失</el-tag></el-table-column
                >
              </el-table>
            </div>
          </el-popover>
          <el-button
            v-if="isQc && !handleIsOk && qcKind != 'nurse'"
            style="margin-right: 8px"
            type="danger"
            plain
            size="small"
            title="质控不通过，退回整改"
            :icon="useRenderIcon(BackIcon)"
            @click="handleBack"
            >退回</el-button
          >
          <el-button
            v-if="isQc && !handleIsOk"
            style="margin-right: 16px"
            type="success"
            plain
            size="small"
            title="质控通过，确认提交"
            :icon="useRenderIcon(PostIcon)"
            @click="handleSubmit"
            >提交</el-button
          >
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="缩小"
            :icon="useRenderIcon(ZoomOutIcon)"
            @click="zoomOut"
          />
          <el-input-number
            v-model="zoomRef"
            style="width: 40px"
            :min="10"
            :max="500"
            :step="10"
            size="small"
            :controls="false"
          />
          <el-button
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="放大"
            :icon="useRenderIcon(ZoomInIcon)"
            @click="zoomIn"
          />
        </el-space>
      </div>
      <div class="wrapper">
        <div class="h-full overflow-auto">
          <el-empty v-if="!imgListRef.length" description="暂无数据" />
          <!-- <BqImgDrawer
            v-else
            :rect="drawRectRef"
            :src="imageSrcRef"
            @update:rect="onUpdateDrawRect"
          /> -->
          <BqImgViewer
            v-else
            ref="imgViewerRef"
            v-model:current-page="currentPageRef"
            class="bq-img-viewer-print"
            :zoom-value="zoomRef"
            :img-list="leftTreeRef.attachmentListRef"
            user-name="super"
          />
        </div>
      </div>
    </div>
    <div class="right-spliter" @mousedown="onRightSplitterMouseDown" />
    <div ref="divRightRef" class="right-side">
      <div class="header-info">
        <el-space>
          <h3>批注信息</h3>
          <el-button
            v-if="isQc"
            style="font-size: 20px"
            type="primary"
            size="small"
            circle
            plain
            text
            title="新建批注"
            :icon="useRenderIcon(Add)"
            :style="leftBarStyleRef"
            @click="addAnotation"
          />
        </el-space>
        <span
          ><span style="color: gray">总分：</span
          ><span style="color: red">{{ totalPointsRef }}</span></span
        >
      </div>
      <div class="wrapper">
        <QcViewAnnotation
          ref="annotationRef"
          v-model:total-points="totalPointsRef"
          :form-inline="newFormInlineRef"
          :other-info="props.otherInfo"
        />
      </div>
    </div>
    <el-button
      class="left-bar"
      style="font-size: 20px"
      type="primary"
      size="small"
      circle
      text
      :class="{ 'is-moving': isMoving.left }"
      :icon="leftIconRef"
      :style="leftBarStyleRef"
      @click="leftBarClick"
    />
    <el-button
      class="right-bar"
      style="font-size: 20px"
      type="primary"
      size="small"
      circle
      text
      :class="{ 'is-moving': isMoving.right }"
      :icon="rightIconRef"
      :style="rightBarStyleRef"
      @click="rightBarClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.full-main {
  position: relative;
  border: 1px solid #ebeef5;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  margin: auto;
  width: 100%;
  height: v-bind(clientHeightRef);
}

.left-side {
  display: v-bind(leftSideCssDisplayRef);
  box-sizing: border-box;
  width: v-bind(leftSideCssWidthRef);
}

.right-side {
  display: v-bind(rightSideCssDisplayRef);
  box-sizing: border-box;
  width: v-bind(rightSideCssWidthRef);
}

.left-spliter {
  overflow-x: hidden;
  cursor: col-resize;
  box-sizing: border-box;
  background-color: #ebeef5;
  width: 4px;
}

.right-spliter {
  overflow-x: hidden;
  cursor: col-resize;
  box-sizing: border-box;
  background-color: #ebeef5;
  width: 4px;
}

.left-bar {
  top: 40%;
  left: 20%;
  position: absolute;
}

.right-bar {
  top: 40%;
  right: 20%;
  position: absolute;
}

.is-moving {
  display: none;
}

.client {
  box-sizing: border-box;
  width: v-bind(clientWidthRef);
}

.header-info {
  height: 40px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  padding: 0 10px;
  overflow-x: auto;
  box-sizing: border-box;
  border-bottom: 1px solid #ebeef5;
}

.wrapper {
  box-sizing: border-box;
  height: calc(100% - 40px);
}
</style>
<style>
.full-main .el-input-number.is-without-controls .el-input__wrapper {
  padding-left: 8px;
  padding-right: 8px;
}

.full-main .el-input-number.is-without-controls .el-input__suffix {
  line-height: 18px;
}
</style>
