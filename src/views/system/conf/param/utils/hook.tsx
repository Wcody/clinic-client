import editForm from "../form/index.vue";
import editForm4 from "../form/index4.vue";
import editForm5 from "../form/index5.vue";
import editForm6 from "../form/index6.vue";
import { handleTree } from "@/utils/tree";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { type Ref, ref, reactive, onMounted, toRaw, h } from "vue";
import {
  getParamGroupListApi,
  getParamItemEntityDefault,
  getParamItemPageApi,
  updateImageParamItemApi,
  updateParamItemApi
} from "@/api/system/param";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import { message } from "@/utils/message";
import _ from "lodash";
import { paramTypeLables } from "@/utils/dataconst";

export function useParam(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    pid: "",
    parentName: "全部",
    paramName: "",
    paramDesc: "",
    userId: 0
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "参数名称",
      align: "left",
      prop: "paramName",
      minWidth: 130
    },
    {
      label: "参数值",
      prop: "paramValue",
      minWidth: 130,
      cellRenderer: ({ row, props }) => {
        if (row.paramType == 3) {
          return (
            <img
              class="h-[24px]"
              src={"ams/mvc/v1/download/images" + row.paramValue?.fileList[0]}
            />
          );
        } else if ([4, 5, 6, 7].includes(row.paramType)) {
          return <el-tag size={props.size}>数据集合</el-tag>;
        } else {
          return (
            <el-tag size={props.size} type="primary" effect="plain">
              {row.paramValue?.value || ""}
            </el-tag>
          );
        }
      }
    },
    {
      label: "类型",
      prop: "paramType",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} type="success" effect="plain">
          {paramTypeLables[row.paramType] || "未知"}
        </el-tag>
      )
    },
    {
      label: "参数描述",
      prop: "paramDesc",
      align: "left",
      minWidth: 130
    },
    {
      label: "修改者",
      minWidth: 90,
      prop: "updatedBy"
    },
    {
      label: "修改时间",
      minWidth: 90,
      prop: "updatedTime"
    },
    {
      label: "操作",
      fixed: "right",
      width: 80,
      slot: "operation"
    }
  ];

  function handleUpdate(row) {
    function getEditForm() {
      if (row.paramType == 4) {
        return editForm4;
      } else if (row.paramType == 5) {
        return editForm5;
      } else if (row.paramType == 6) {
        return editForm6;
      } else {
        return editForm;
      }
    }
    const title = `修改${row.paramName}`;
    addDialog({
      title,
      props: {
        formInline: {
          title,
          ...getParamItemEntityDefault(_.cloneDeep(row))
        }
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      style: { width: "70vw", maxHeight: "80vh" },
      //fullscreen: true,
      fullscreenIcon: false,
      closeOnClickModal: false,
      contentRenderer: () => h(getEditForm(), { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`${title}${curData.paramName}成功`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            delete curData.title;
            if (curData.paramType == 3) {
              const fileList = formRef.value.getFileList();
              //新建表单对象
              const formData = new FormData();
              for (let e of fileList) {
                formData.append("fileList", e.raw);
              }
              formData.append("id", curData.id + "");
              await updateImageParamItemApi(formData);
            } else {
              //常规字段处理
              await updateParamItemApi(curData);
            }
            chores();
          }
        });
      }
    });
  }

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

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.pid) {
      ret.push(new BQSearchFilter("pid", "eq", params.pid));
    }
    if (params?.paramName) {
      ret.push(new BQSearchFilter("paramName", "like", params.paramName));
    }
    if (params?.paramDesc) {
      ret.push(new BQSearchFilter("paramDesc", "like", params.paramDesc));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("paramName", true)];
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
      const { data } = await getParamItemPageApi(getSearchParams(toRaw(form)));
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
    form.pid = undefined;
    form.parentName = "全部";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, name, selected }) {
    form.pid = selected ? id : "";
    form.parentName = selected ? name : "全部";
    onSearch();
  }

  onMounted(async () => {
    treeLoading.value = true;
    try {
      onSearch();

      // 归属科室
      const curData = (await getParamGroupListApi()).data || [];
      treeData.value = handleTree(curData, "id", "pid");
      treeLoading.value = false;
    } finally {
      treeLoading.value = false;
    }
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    deviceDetection,
    onSearch,
    resetForm,
    onTreeSelect,
    handleUpdate,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
