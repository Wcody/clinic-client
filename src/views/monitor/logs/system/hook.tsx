import Detail from "./detail.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { type Ref, reactive, ref, onMounted, toRaw } from "vue";
import { getKeyList, useCopyToClipboard } from "@pureadmin/utils";
import Info from "@iconify-icons/ri/question-line";
import {
  clearSystemLogApi,
  deleteBatchLogApi,
  getLogPageSystemApi
} from "@/api/system/log";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";

export function useRole(tableRef: Ref) {
  const form = reactive({
    module: "",
    createdTime: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);
  const { copied, update } = useCopyToClipboard();

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
      label: "ID",
      prop: "id",
      minWidth: 90
    },
    {
      label: "所属模块",
      prop: "module",
      minWidth: 100
    },
    {
      label: "所属模块",
      prop: "operation",
      minWidth: 100
    },
    {
      headerRenderer: () => (
        <span class="flex-c">
          请求接口
          <iconifyIconOffline
            icon={Info}
            class="ml-1 cursor-help"
            v-tippy={{
              content: "双击下面请求接口进行拷贝"
            }}
          />
        </span>
      ),
      prop: "requestUri",
      minWidth: 140
    },
    {
      label: "请求方法",
      prop: "method",
      minWidth: 140
    },
    {
      label: "IP 地址",
      prop: "requestIp",
      minWidth: 100
    },
    {
      label: "地点",
      prop: "requestAddress",
      minWidth: 140
    },
    {
      label: "操作系统",
      prop: "os",
      minWidth: 100
    },
    {
      label: "浏览器类型",
      prop: "browser",
      minWidth: 100
    },
    {
      label: "请求耗时",
      prop: "costTime",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.costTime < 1000 ? "success" : "warning"}
          effect="plain"
        >
          {row.costTime} ms
        </el-tag>
      )
    },
    {
      label: "请求时间",
      prop: "createdTime",
      minWidth: 180
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
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

  /** 拷贝请求接口，表格单元格被双击时触发 */
  function handleCellDblclick({ requestUri }, { property }) {
    if (property !== "requestUri") return;
    update(requestUri);
    copied.value
      ? message(`${requestUri} 已拷贝`, { type: "success" })
      : message("拷贝失败", { type: "warning" });
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
    await clearSystemLogApi();
    message("已删除所有日志数据", {
      type: "success"
    });
    onSearch();
  }

  function onDetail(row: any) {
    addDialog({
      title: "系统日志详情",
      fullscreen: true,
      hideFooter: true,
      contentRenderer: () => Detail,
      props: {
        data: [row]
      }
    });
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.module) {
      ret.push(new BQSearchFilter("module", "like", params.module));
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
      const { data } = await getLogPageSystemApi(getSearchParams(toRaw(form)));
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
    onDetail,
    clearAll,
    resetForm,
    onbatchDel,
    handleSizeChange,
    onSelectionCancel,
    handleCellDblclick,
    handleCurrentChange,
    handleSelectionChange
  };
}
