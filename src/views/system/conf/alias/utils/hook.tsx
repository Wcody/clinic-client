import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import {
  addFieldAliasApi,
  deleteFieldAliasApi,
  getFieldAliasEntityDefault,
  getFieldAliasPageApi,
  updateFieldAliasApi
} from "@/api/system/alias";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";

export function useFieldAlias() {
  //搜索条件
  const form = reactive({
    sourceSystem: "",
    name: "",
    sysValue: "",
    aliasType: "",
    aliasValue: ""
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
      prop: "name"
    },
    {
      label: "来源系统",
      prop: "sourceSystem"
    },
    {
      label: "别名类型",
      prop: "aliasType"
    },
    {
      label: "字段名",
      prop: "aliasValue"
    },
    {
      label: "系统字段名",
      prop: "sysValue"
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
    await deleteFieldAliasApi(row.eid);
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
    if (params?.name) {
      ret.push(new BQSearchFilter("name", "like", params.name));
    }
    if (params?.code) {
      ret.push(new BQSearchFilter("code", "like", params.code));
    }
    if (params?.status === true || params?.status === false) {
      ret.push(new BQSearchFilter("status", "eq", params.status));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("seq", true)];
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
      const { data } = await getFieldAliasPageApi(getSearchParams(toRaw(form)));
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
      title: `${title}字段别名`,
      props: {
        formInline: {
          title,
          ...getFieldAliasEntityDefault(row)
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
          message(`您${title}了字段别名名称为${curData.name}的这条数据`, {
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
              await addFieldAliasApi(curData);
              chores();
            } else {
              await updateFieldAliasApi(curData);
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
