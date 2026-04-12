import {
  type BQRecordEntityType,
  getRecordEntityDefault
} from "@/api/cm/record";
import viewWindow from "../view.vue";
import traceWindow from "../trace.vue";
import qcHeaderWindow from "../qcHeader.vue";
import { addDialog } from "@/components/ReDialog";
import { genderLables } from "@/utils/dataconst";
import { calculateAgeString, toDate } from "@/utils/date";
import { h, ref } from "vue";

export function traceDialogPublic(
  row: BQRecordEntityType,
  caption: string,
  initKind
) {
  const headerRef = ref(null);
  addDialog({
    title: caption,
    props: {
      formInline: {
        title: caption,
        initKind,
        caption,
        ...getRecordEntityDefault(row)
      }
    },
    showClose: false,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: true,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: true,
    headerRenderer: ({ close, titleId, titleClass }) => (
      // jsx 语法
      <div ref={headerRef} class="flex flex-row justify-between items-end">
        <h4 id={titleId} class={titleClass}>
          {caption}示踪
        </h4>
        <span>
          <span style="color: gray">病案号：</span>
          <span class="content">{row.recordCode}</span>
        </span>
        <span>
          <span style="color: gray">患者：</span>
          <span class="content">{row.patientName}</span>
        </span>
        <span>
          <span style="color: gray">性别：</span>
          <span class="content">{genderLables[row.gender]}</span>
        </span>
        <span>
          <span style="color: gray">年龄：</span>
          <span class="content">
            {calculateAgeString(
              toDate(row.dateOfBirth),
              toDate(row.admissionDate)
            )}
          </span>
        </span>
        <span>
          <span style="color: gray">科室：</span>
          <span class="content">{row.department}</span>
        </span>
        <span>
          <span style="color: gray">出院日期：</span>
          <span class="content">{row.dischargeDate}</span>
        </span>
        <span>
          <span style="color: gray">住院次数：</span>
          <span class="content">{row.admissionCount}</span>
        </span>
        <el-button type="danger" onClick={close}>
          关闭
        </el-button>
      </div>
    ),
    contentRenderer: () => h(traceWindow, { headerRef })
  });
}

export function viewDialogPublic(
  row: BQRecordEntityType,
  caption: string,
  initKind
) {
  const headerRef = ref();
  const contentRef = ref();
  const props = {
    formInline: {
      title: caption,
      initKind,
      caption,
      selectNodeId: 1,
      ...getRecordEntityDefault(row)
    }
  };
  addDialog({
    title: caption,
    showClose: false,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    fullscreen: true,
    fullscreenIcon: false,
    closeOnClickModal: false,
    hideFooter: true,
    headerRenderer: ({ close, titleId, titleClass }) =>
      h(qcHeaderWindow, {
        ref: headerRef,
        contentRef,
        headerInfo: { close, titleId, titleClass },
        ...props
      }),
    contentRenderer: () =>
      h(viewWindow, { ref: contentRef, headerRef, ...props })
  });
}
