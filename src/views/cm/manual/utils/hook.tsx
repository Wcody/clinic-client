import editForm from "../form.vue";
import editMZForm from "../mzForm.vue";
import editDAForm from "../daForm.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import {
  addRecordApi,
  type BQRecordEntityType,
  deleteRecordApi,
  getRecordEntityDefault,
  getRecordPageApi,
  updateRecordApi
} from "@/api/cm/record";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";

export function useRecord(initKind: number, caption: string) {
  //搜索条件
  const form = reactive({
    patientName: "",
    recordCode: ""
  });
  const formRef = ref();
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
      prop: "recordCode",
      resizable: true
    },
    {
      label: `${initKind ? "患者" : "档案"}名称`,
      prop: "patientName",
      resizable: true
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
        prop: "sex",
        minWidth: 90,
        cellRenderer: ({ row, props }) => (
          <el-tag
            size={props.size}
            type={
              row.sex == 1 ? "primary" : row.sex == 2 ? "success" : "danger"
            }
            effect="plain"
          >
            {row.sex == 1 ? "男" : row.sex == 2 ? "女" : "未知"}
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
      width: 210,
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

  function openDialog(title = "新建", row?: BQRecordEntityType) {
    function getFrom() {
      if (initKind == 2) {
        return editMZForm;
      } else if (initKind == 0) {
        return editDAForm;
      } else {
        return editForm;
      }
    }
    addDialog({
      title: `${title + caption}`,
      props: {
        formInline: {
          title,
          initKind,
          caption,
          ...getRecordEntityDefault(row)
        }
      },
      width: "90%",
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: false,
      closeOnClickModal: false,
      contentRenderer: () => h(getFrom(), { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了名称为${curData.patientName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新建") {
              await addRecordApi(curData);
              chores();
            } else {
              await updateRecordApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

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
    openDialog,
    handleDelete,
    filterMethod,
    transformI18n,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
