import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import {
  addHolidayApi,
  deleteHolidayApi,
  getHolidayEntityDefault,
  getHolidayPageApi,
  updateHolidayApi
} from "@/api/system/holiday";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";

export function useHoliday() {
  //搜索条件
  const form = reactive({
    holidayName: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const isSelectAll = ref(false);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "holidayName"
    },
    {
      label: "日期",
      prop: "holidayDate"
    },
    {
      label: "每年循环",
      prop: "recurring"
    },
    {
      label: "工作日",
      prop: "aliasValue"
    },
    {
      label: "备注",
      prop: "remark"
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
  ];

  async function handleDelete(row) {
    await deleteHolidayApi(row.eid);
    message(`您删除了字段别名名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.holidayName) {
      ret.push(new BQSearchFilter("holidayName", "like", params.holidayName));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("holidayDate", true)];
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
      const { data } = await getHolidayPageApi(getSearchParams(toRaw(form)));
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

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}节假日`,
      props: {
        formInline: {
          title,
          ...getHolidayEntityDefault(row)
        }
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了名称为${curData.holidayName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              await addHolidayApi(curData);
              chores();
            } else {
              await updateHolidayApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  /** 高亮当前选中行 */
  function rowStyle({ row: { eid } }) {
    return {
      cursor: "pointer",
      background: eid === curRow.value?.eid ? "var(--el-fill-color-light)" : ""
    };
  }

  onMounted(async () => {
    onSearch();
  });

  return {
    form,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    pagination,
    isSelectAll,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
