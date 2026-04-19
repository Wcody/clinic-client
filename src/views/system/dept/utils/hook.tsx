import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { FormItemProps } from "../utils/types";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import {
  addDeptApi,
  deleteDeptApi,
  getDeptEntityDefault,
  getDeptPageApi,
  setStatusDeptApi,
  updateDeptApi
} from "@/api/system/dept";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { hasAuth } from "@/router/utils";
import { ElMessageBox } from "element-plus";

export function useDept() {
  const form = reactive({
    name: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle, tagStyle } = usePublicHooks();

  // 分页配置
  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: "科室名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "排序",
      prop: "orderValue",
      minWidth: 70
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: scope => {
        if (hasAuth("dept:setStatus")) {
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
      }
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createdTime"
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 320
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
        row.name
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
          await setStatusDeptApi(row.eid, row.status);
          message("已成功修科室状态", {
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

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.name) {
      ret.push(new BQSearchFilter("name", "like", params.name));
    }
    if (params?.status === true || params?.status === false) {
      ret.push(new BQSearchFilter("status", "eq", params.status));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("orderValue", true)];
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
      const { data } = await getDeptPageApi(getSearchParams(toRaw(form)));
      if (data) {
        dataList.value = data.records || [];
        pagination.total = data.total || 0;
      }
    } finally {
      loading.value = false;
    }
  }

  // 分页改变
  function handlePageChange(page: number) {
    pagination.currentPage = page;
    onSearch();
  }

  // 每页显示数量改变
  function handleSizeChange(size: number) {
    pagination.pageSize = size;
    pagination.currentPage = 1;
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}科室`,
      props: {
        formInline: {
          title,
          ...getDeptEntityDefault(row),
          higherDeptOptions: formatHigherDeptOptions(cloneDeep(dataList.value))
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
          message(`您${title}了科室名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              await addDeptApi(curData);
              chores();
            } else {
              await updateDeptApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    await deleteDeptApi(row.eid);
    message(`您删除了科室名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改科室 */
    openDialog,
    /** 删除科室 */
    handleDelete,
    handleSelectionChange,
    /** 分页改变 */
    handlePageChange,
    /** 每页显示数量改变 */
    handleSizeChange
  };
}
