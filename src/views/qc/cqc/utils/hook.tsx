import { traceDialogPublic, viewDialogPublic } from "./qcLib";
import viewWindow from "../view.vue";
import qcHeaderWindow from "../qcHeader.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import {
  type BQRecordEntityType,
  deleteRecordApi,
  getRecordEntityDefault,
  getRecordPageApi
} from "@/api/cm/record";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { getActionKind } from "@/utils/qc";

export function useRecord(initKind: number, caption: string) {
  //搜索条件
  const form = reactive({
    patientName: "",
    recordCode: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: `${caption}编码`,
      prop: "recordCode"
    },
    {
      label: `${initKind ? "患者" : "档案"}名称`,
      prop: "patientName"
    }
  ];

  if (initKind) {
    columns.push(
      {
        label: `${caption}分类`,
        prop: "recordKind"
      },
      {
        label: "身份证",
        prop: "idCard"
      },
      {
        label: "性别",
        prop: "gender",
        minWidth: 90,
        cellRenderer: ({ row, props }) => (
          <el-tag
            size={props.size}
            type={
              row.gender == 1
                ? "primary"
                : row.gender == 2
                  ? "success"
                  : "danger"
            }
            effect="plain"
          >
            {row.gender == 1 ? "男" : row.gender == 2 ? "女" : "未知"}
          </el-tag>
        )
      }
    );
  }
  columns.push(
    {
      label: "科室",
      prop: "department"
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建者",
      prop: "createdBy",
      minWidth: 120
    },
    {
      label: "创建时间",
      prop: "createdTime",
      minWidth: 160
    },
    {
      label: "操作",
      fixed: "right",
      width: 320,
      slot: "operation"
    }
  );

  async function handleDelete(row) {
    await deleteRecordApi(row.eid);
    message(`您删除了名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    ret.push(new BQSearchFilter("recordKind", "eq", initKind + ""));
    if (params?.recordCode) {
      ret.push(new BQSearchFilter("recordCode", "like", params.recordCode));
    }
    if (params?.patientName) {
      ret.push(new BQSearchFilter("patientName", "like", params.patientName));
    }
    const actionKind = getActionKind();
    if ([0, 3].includes(actionKind)) {
      ret.push(new BQSearchFilter("hasNurse", "eq", "0"));
    } else if ([1, 4].includes(actionKind)) {
      ret.push(new BQSearchFilter("hasNurse", "eq", "1"));
      ret.push(new BQSearchFilter("hasDoctor", "eq", "0"));
    } else {
      ret.push(new BQSearchFilter("hasNurse", "eq", "1"));
      ret.push(new BQSearchFilter("hasDoctor", "eq", "1"));
      ret.push(new BQSearchFilter("hasFinal", "eq", "0"));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("createdTime", true)];
  }

  function getSearchParams(params?: any) {
    return {
      page: pagination.currentPage,
      size: pagination.pageSize,
      filters: getSearchFilter(params),
      orders: getSearchOrder()
    };
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getRecordPageApi(getSearchParams(toRaw(form)));
      dataList.value = data.records;
      pagination.total = data.total;
      pagination.pageSize = data.size;
      pagination.currentPage = data.current;
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function qcDialog(row: BQRecordEntityType, qcKind) {
    const headerRef = ref();
    const contentRef = ref();
    const props = {
      formInline: {
        title: caption,
        initKind,
        caption,
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
          ...props,
          otherInfo: { type: "qc", qcKind }
        }),
      contentRenderer: () =>
        h(viewWindow, {
          ref: contentRef,
          headerRef,
          ...props,
          otherInfo: { type: "qc", qcKind }
        }),
      closeCallBack() {
        //确认提交后，关闭窗口
        if (headerRef.value.getHeaderInfo().needFreshList) {
          onSearch();
        }
      }
    });
  }

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  function traceDialog(row) {
    traceDialogPublic(row, caption, initKind);
  }

  function viewDialog(row) {
    viewDialogPublic(row, caption, initKind);
  }

  onMounted(async () => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    traceDialog,
    qcDialog,
    viewDialog,
    handleDelete,
    filterMethod,
    transformI18n,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
