import { message } from "@/utils/message";
import { getKeyList } from "@pureadmin/utils";
import { usePublicHooks } from "@/views/hooks";
import type { PaginationProps } from "@pureadmin/table";
import { type Ref, reactive, ref, onMounted, toRaw } from "vue";
import {
  clearLogoffLogApi,
  deleteBatchLogApi,
  getLogPageLogoffApi
} from "@/api/system/log";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";

export function useRole(tableRef: Ref) {
  const form = reactive({
    account: "",
    status: "",
    createdTime: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);
  const { tagStyle } = usePublicHooks();

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "序号",
      prop: "id",
      minWidth: 90
    },
    {
      label: "用户名",
      prop: "account",
      minWidth: 100
    },
    {
      label: "登录 IP",
      prop: "requestIp",
      minWidth: 140
    },
    {
      label: "登录地点",
      prop: "requestAddress",
      minWidth: 140
    },
    {
      label: "操作系统",
      prop: "os",
      minWidth: 100
    },
    {
      label: "浏览器",
      prop: "browser",
      minWidth: 100
    },
    {
      label: "登录状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status ? "成功" : "失败"}
        </el-tag>
      )
    },
    {
      label: "登录平台",
      prop: "platform",
      minWidth: 100
    },
    {
      label: "登录时间",
      prop: "createdTime",
      minWidth: 180
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  async function onbatchDel() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const ids: string[] = getKeyList(curSelected, "id");
    await deleteBatchLogApi(ids);
    message(`已删除序号为 ${ids} 的数据`, {
      type: "success"
    });
    onSearch();
  }

  /** 清空日志 */
  async function clearAll() {
    await clearLogoffLogApi();
    message("已删除所有日志数据", {
      type: "success"
    });
    onSearch();
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.account) {
      ret.push(new BQSearchFilter("account", "like", params.account));
    }
    if (params?.status === true || params?.status === false) {
      ret.push(new BQSearchFilter("status", "eq", params.status));
    }
    if (params?.createdTime) {
      ret.push(
        new BQSearchFilter(
          "createdTime",
          "between",
          params.createdTime[0],
          params.createdTime[1]
        )
      );
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("createdTime", false)];
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
      const { data } = await getLogPageLogoffApi(getSearchParams(toRaw(form)));
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

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    selectedNum,
    onSearch,
    clearAll,
    resetForm,
    onbatchDel,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
