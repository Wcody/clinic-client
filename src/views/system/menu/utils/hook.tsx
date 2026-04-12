import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { FormItemProps } from "../utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import {
  getMenuListApi,
  addMenuApi,
  updateMenuApi,
  getMenuEntityDefault,
  deleteMenuApi,
  reloadResourceApi,
  setStatusMenuApi
} from "@/api/system/menu";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { confirmBox } from "@/utils/common";
import { hasAuth } from "@/router/utils";
import { usePublicHooks } from "../../../hooks";
import { ElMessageBox } from "element-plus";

export function useMenu() {
  const form = reactive({
    title: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(false);
  const resLoading = ref(false);
  const switchLoadMap = ref({});
  const { switchStyle, tagStyle } = usePublicHooks();

  const getMenuType = (type, text = false) => {
    switch (type) {
      case 0:
        return text ? "菜单" : "primary";
      case 1:
        return text ? "iframe" : "warning";
      case 2:
        return text ? "外链" : "danger";
      case 3:
        return text ? "按钮" : "info";
    }
  };

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "title",
      width: 300,
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.title)}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "menuType",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.menuType)}
          effect="plain"
        >
          {getMenuType(row.menuType, true)}
        </el-tag>
      )
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: scope => {
        if (hasAuth("menu:setStatus")) {
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
      label: "操作权限",
      prop: "auths"
    },
    {
      label: "路由路径",
      prop: "path"
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "排序",
      prop: "orderValue",
      width: 100
    },
    {
      label: "隐藏",
      prop: "showLink",
      formatter: ({ showLink }) => (showLink ? "否" : "是"),
      width: 100
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
        row.title
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
          await setStatusMenuApi(row.eid, row.status);
          message("已成功修改角色状态", {
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
    if (params?.title) {
      ret.push(new BQSearchFilter("title", "like", params.title));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("orderValue", true)];
  }

  function getSearchParams(params?: any) {
    return {
      filters: getSearchFilter(params),
      orders: getSearchOrder()
    };
  }

  async function onSearch() {
    loading.value = true;
    // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    const { data } = await getMenuListApi(getSearchParams(toRaw(form)));
    // 处理成树结构
    dataList.value = handleTree(data || []);
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = transformI18n(treeList[i].title);
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  async function reloadResource() {
    resLoading.value = true;
    try {
      await reloadResourceApi();
      message("重新加载资源成功！", {
        type: "success"
      });
      onSearch();
    } finally {
      resLoading.value = false;
    }
    await reloadResourceApi();
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    function getPropsDefault() {
      return {
        ...getMenuEntityDefault(row),
        higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value))
      };
    }
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: getPropsDefault()
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
        const curData = cloneDeep(options.props.formInline) as FormItemProps;
        async function chores() {
          const msg = `您${title}了菜单名称为${transformI18n(curData.title)}的这条数据`;
          if (title === "新增") {
            const isOK = await confirmBox(msg + "，是否继续新增？");
            if (isOK) {
              //重置数据
              //options.props.formInline = getPropsDefault();
              return;
            }
          } else {
            message(msg, {
              type: "success"
            });
          }
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            delete curData.higherMenuOptions;
            // 表单规则校验通过
            if (title === "新增") {
              await addMenuApi(curData);
              chores();
            } else {
              await updateMenuApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    await deleteMenuApi(row.eid);
    message(`您删除了菜单名称为${transformI18n(row.title)}的这条数据`, {
      type: "success"
    });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    resLoading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    reloadResource,
    handleSelectionChange
  };
}
