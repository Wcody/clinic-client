import { message } from "@/utils/message";
import { reactive, ref, onMounted, toRaw } from "vue";
import { getOnlineUsersApi, kickOutOnlineUsersApi } from "@/api/system/user";
import { useUserStoreHook } from "@/store/modules/user";

export function useUserOnline() {
  const form = reactive({
    account: ""
  });
  const userInfo = useUserStoreHook().getUserInfo();
  const dataList = ref([]);
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "用户名",
      prop: "account",
      minWidth: 100,
      cellRenderer: scope => {
        if (scope.row.redisId === userInfo.lid) {
          return (
            <span style="color: #409EFF;">
              {scope.row.account + "(当前用户)"}
            </span>
          );
        } else {
          return scope.row.account;
        }
      }
    },
    {
      label: "登录 IP",
      prop: "ip",
      minWidth: 140
    },
    {
      label: "登录时间",
      prop: "loginTime",
      minWidth: 180
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function handleOffline(row) {
    await kickOutOnlineUsersApi({
      account: row.account,
      redisId: row.redisId,
      platform: row.platform
    });
    message(`${row.username}已被强制下线`, { type: "success" });
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const list: Array<any> = (await getOnlineUsersApi(toRaw(form))).data;
      //list进行排序
      list.sort((a, b) => {
        return a.loginTime < b.loginTime ? 1 : -1;
      });
      dataList.value = list;
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
    onSearch,
    resetForm,
    handleOffline,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
