import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../../hooks";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import {
  addCollectorApi,
  deleteCollectorApi,
  getCollectorEntityDefault,
  getCollectorPageApi,
  setStatusCollectorApi,
  updateCollectorApi
} from "@/api/cm/collector";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { hasAuth } from "@/router/utils";

export function useCollector() {
  //搜索条件
  const form = reactive({
    collectorName: "",
    remoteIp: "",
    computerName: "",
    deviceId: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle, tagStyle } = usePublicHooks();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "采集器名称",
      prop: "collectorName"
    },
    {
      label: "IP地址",
      prop: "remoteIp"
    },
    {
      label: "电脑名称",
      prop: "computerName"
    },
    {
      label: "最后访问时间",
      prop: "lastTime"
    },
    {
      label: "设备ID",
      prop: "deviceId"
    },
    {
      label: "状态",
      cellRenderer: scope => {
        if (hasAuth("kind:setStatus")) {
          return (
            <el-switch
              size={scope.props.size === "small" ? "small" : "default"}
              loading={switchLoadMap.value[scope.index]?.loading}
              v-model={scope.row.status}
              active-value={true}
              inactive-value={false}
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              style={switchStyle.value}
              onChange={() => onChange(scope as any)}
            />
          );
        } else {
          return (
            <el-tag
              size={scope.props.size}
              style={tagStyle.value(scope.row.status)}
            >
              {scope.row.status ? "启用" : "停用"}
            </el-tag>
          );
        }
      },
      minWidth: 90
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
  ];

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status ? "启用" : "禁用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.collectorName
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        try {
          await setStatusCollectorApi(row.eid, row.status);
          message("已成功修改状态", {
            type: "success"
          });
        } finally {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
        }
      })
      .catch(() => {
        row.status = !row.status;
      });
  }

  async function handleDelete(row) {
    await deleteCollectorApi(row.eid);
    message(`您删除了名称为${row.collectorName}的这条数据`, {
      type: "success"
    });
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
    if (params?.collectorName) {
      ret.push(
        new BQSearchFilter("collectorName", "like", params.collectorName)
      );
    }
    if (params?.remoteIp) {
      ret.push(new BQSearchFilter("remoteIp", "like", params.remoteIp));
    }
    if (params?.computerName) {
      ret.push(new BQSearchFilter("computerName", "like", params.computerName));
    }
    if (params?.deviceId) {
      ret.push(new BQSearchFilter("deviceId", "like", params.deviceId));
    }
    if (params?.status === true || params?.status === false) {
      ret.push(new BQSearchFilter("status", "eq", params.status));
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
      const { data } = await getCollectorPageApi(getSearchParams(toRaw(form)));
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
      title: "采集器列表",
      props: {
        formInline: {
          title,
          ...getCollectorEntityDefault(row)
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
          message(`您${title}了名称为${curData.collectorName}的这条数据`, {
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
              await addCollectorApi(curData);
              chores();
            } else {
              await updateCollectorApi(curData);
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
