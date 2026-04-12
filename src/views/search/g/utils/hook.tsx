import { transformI18n } from "@/plugins/i18n";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw } from "vue";
import { getViewQcrPageApi } from "@/api/cm/qcr";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import { getActionKind } from "@/utils/qcr";
import { useUserStore } from "@/store/modules/user";

export function useQcr(initKind: number, caption: string) {
  //搜索条件
  const form = reactive({
    patientName: "",
    recordCode: ""
  });
  const userInfo = useUserStore().getUserInfo();
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
      prop: "recordCode"
    },
    {
      label: `${initKind ? "患者" : "档案"}名称`,
      prop: "patientName"
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
      label: "质控账号",
      prop: "account"
    },
    {
      label: "质控时间",
      prop: "trackTime",
      minWidth: 160
    },
    {
      label: "质控理由",
      prop: "content"
    },
    {
      label: "是否归档",
      prop: "hasArchived",
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.hasArchived ? "success" : "primary"}
          effect="plain"
        >
          {row.hasArchived ? "是" : "否"}
        </el-tag>
      )
    },
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
      width: 160,
      slot: "operation"
    }
  );

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
    const actionKind = getActionKind();
    if (actionKind === 0) {
      // 只看自己的
      ret.push(new BQSearchFilter("account", "eq", userInfo.account));
    }
    return ret;
  }

  function getSearchOrder() {
    return [new BQSearchOrder("trackTime", false)];
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
      const { data } = await getViewQcrPageApi(getSearchParams(toRaw(form)));
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
    filterMethod,
    transformI18n,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
