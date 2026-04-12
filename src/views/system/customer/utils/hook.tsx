import roleForm from "../form/user.vue";
import editForm from "../form/index.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../../hooks";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import type { FormItemProps, UserFormItemProps } from "../utils/types";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import { ElMessageBox, dayjs } from "element-plus";
import {
  type Ref,
  h,
  ref,
  computed,
  reactive,
  onMounted,
  toRaw,
  watch
} from "vue";
import { getGroupKind1ListApi } from "@/api/system/group";
import { BQSearchFilter, BQSearchOrder, downloadFile } from "@/api/api";
import {
  addCustomerApi,
  deleteCustomerApi,
  getUserIdsByApi,
  getCustomerEntityDefault,
  getCustomerPageApi,
  saveUserIdsApi,
  setStatusCustomerApi,
  updateCustomerApi,
  type BQCustomerEntityType,
  deleteBatchCustomerApi
} from "@/api/system/customer";
import { getUserListApi } from "@/api/system/user";
import { hasAuth } from "@/router/utils";
import { getRoleMenusApi } from "@/api/system/menu";
import { getMenuIdsByApi, saveMenuIdsByApi } from "@/api/system/customer";
import { saveBlobToFile } from "@/utils/common";

export function useCustomer(tableRef: Ref, treeRef: Ref, menuTreeRef: Ref) {
  const form = reactive({
    parentId: "",
    parentName: "全部",
    name: "",
    phone: "",
    status: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const treeProps = {
    value: "eid",
    label: "title",
    children: "children"
  };
  const { switchStyle, tagStyle } = usePublicHooks();
  const higherGroupOptions = ref();
  const treeData = ref([]);
  const menuTreeData = ref([]);
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
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "客户名称",
      prop: "name",
      minWidth: 130
    },
    {
      label: "失效日期",
      prop: "expireDate",
      minWidth: 130,
      formatter: (row: BQCustomerEntityType) => {
        return row.expireDate ? dayjs(row.expireDate).format("YYYY-MM-DD") : "";
      }
    },
    {
      label: "负责人",
      prop: "principal",
      minWidth: 130
    },
    {
      label: "客户组",
      prop: "parentName",
      minWidth: 90
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => {
        if (hasAuth("customer:setStatus")) {
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
      minWidth: 90,
      prop: "createdTime"
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });

  const userOptions = ref([]);

  function onChange({ row, index }) {
    console.log(row, index);
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
          await setStatusCustomerApi(row.eid, row.status);
          message("已成功修改客户状态", {
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

  function handleUpdate(row) {
    console.log(row);
  }

  async function handleDelete(row) {
    await deleteCustomerApi(row.eid);
    message(`您删除了客户编号为${row.id}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
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
    // 用于多选表格，清空客户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  async function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const data = getKeyList(curSelected, "eid");
    await deleteBatchCustomerApi(data);
    message(`已删除客户编号为 ${data} 的数据`, {
      type: "success"
    });
    onSearch();
  }

  function getSearchFilter(params?: any) {
    let ret = [];
    if (params?.parentId) {
      ret.push(new BQSearchFilter("parentId", "eq", params.parentId));
    }
    if (params?.name) {
      ret.push(new BQSearchFilter("name", "like", params.name));
    }
    if (params?.phone) {
      ret.push(new BQSearchFilter("phone", "like", params.phone));
    }
    if (params?.status) {
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
      const { data } = await getCustomerPageApi(getSearchParams(toRaw(form)));
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
    form.parentId = "";
    form.parentName = "全部";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ eid, name, selected }) {
    form.parentId = selected ? eid : "";
    form.parentName = selected ? name : "全部";
    onSearch();
  }

  function formatHigherGroupOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherGroupOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}客户`,
      props: {
        formInline: {
          title,
          higherGroupOptions: formatHigherGroupOptions(
            higherGroupOptions.value
          ),
          ...getCustomerEntityDefault(row)
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
          message(`您${title}了客户名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            delete curData.higherGroupOptions;
            delete curData.title;
            // 表单规则校验通过
            if (title === "新增") {
              await addCustomerApi(curData);
              chores();
            } else {
              await updateCustomerApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  /** 下载授权文件 */
  async function downloadAuth(row?: any) {
    const { eid } = row;
    if (eid) {
      const url = `/download/auth/${eid}`;
      downloadFile(url)
        .then(res => {
          saveBlobToFile(res, "index.bqa");
        })
        .catch(err => {
          err.response.data.text().then(ret => {
            message(ret, { type: "error" });
          });
        });
    }
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { eid } = row;
    if (eid) {
      curRow.value = row;
      isShow.value = true;
      const { data } = await getMenuIdsByApi(eid);
      menuTreeRef.value.setCheckedKeys(data || []);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { eid } }) {
    return {
      cursor: "pointer",
      background: eid === curRow.value?.eid ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  async function handleSave() {
    const { eid, name } = curRow.value;
    // 根据客户 id 调用实际项目中菜单权限修改接口
    await saveMenuIdsByApi(eid, menuTreeRef.value.getCheckedKeys());
    message(`角色名称为${name}的菜单权限修改成功`, {
      type: "success"
    });
  }

  const onQueryChanged = (query: string) => {
    menuTreeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  /** 指定客户管理员 */
  async function handleUser(row) {
    // 选中的客户列表
    const ids = (await getUserIdsByApi(row.eid)).data || [];
    addDialog({
      title: `指定 ${row.name} 客户的管理员`,
      props: {
        formInline: {
          name: row?.name ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: userOptions.value ?? [],
          ids
        }
      },
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as UserFormItemProps;
        console.log("curIds", curData.ids);
        await saveUserIdsApi(row.eid, curData.ids);
        done(); // 关闭弹框
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    try {
      onSearch();

      // 归属科室
      const curData = (await getGroupKind1ListApi()).data || [];
      higherGroupOptions.value = handleTree(curData);
      treeData.value = handleTree(curData);

      // 客户列表
      userOptions.value = (await getUserListApi()).data;

      //菜单权限
      const { data } = await getRoleMenusApi();
      treeIds.value = getKeyList(data, "eid");
      menuTreeData.value = handleTree(data);
    } finally {
      treeLoading.value = false;
    }
  });

  watch(isExpandAll, val => {
    val
      ? menuTreeRef.value.setExpandedKeys(treeIds.value)
      : menuTreeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? menuTreeRef.value.setCheckedKeys(treeIds.value)
      : menuTreeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    curRow,
    loading,
    isLinkage,
    treeSearchValue,
    isShow,
    columns,
    rowStyle,
    treeIds,
    dataList,
    treeData,
    menuTreeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    isExpandAll,
    isSelectAll,
    treeProps,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleMenu,
    downloadAuth,
    handleSave,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUser,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange,
    onQueryChanged,
    filterMethod,
    transformI18n
  };
}
