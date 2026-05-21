import "./reset.css";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import { getKeyList, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  watch,
  computed,
  reactive,
  onMounted,
  toRaw
} from "vue";
import { getDeptListApi } from "@/api/system/dept";
import { BQSearchFilter, BQSearchOrder } from "@/api/api";
import {
  addUserApi,
  changePasswordApi,
  deleteUserApi,
  getRoleIdsByApi,
  getUserEntityDefault,
  getUserPageApi,
  resetPasswordApi,
  saveRoleIdsApi,
  setStatusUserApi,
  updateUserApi
} from "@/api/system/user";
import { getRoleListApi } from "@/api/system/role";
import { hasAuth } from "@/router/utils";
import { nextTick } from "process";
import {
  applyTenantInitDataGuard,
  withTenantInitDataColumn
} from "@/utils/tenantInitData";

const pwdProgress = [
  { color: "#e74242", text: "非常弱" },
  { color: "#EFBD47", text: "弱" },
  { color: "#ffa500", text: "一般" },
  { color: "#1bbf1b", text: "强" },
  { color: "#008000", text: "非常强" }
];

/** 重置密码 */
export function handleChangePassword(eid) {
  const ruleFormRef = ref();
  // 重置的新密码
  const pwdForm = reactive({
    newPassword: "",
    oldPassword: "",
    confirmPassword: ""
  });

  watch(
    pwdForm,
    ({ newPassword: newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  // 当前密码强度（0-4）
  const curScore = ref();
  addDialog({
    title: `修改密码`,
    alignCenter: true,
    lockScroll: false,
    draggable: true,
    closeOnClickModal: false,
    fullscreen: deviceDetection(),
    contentRenderer: () => (
      <>
        <ElForm ref={ruleFormRef} model={pwdForm}>
          <ElFormItem
            prop="oldPassword"
            rules={[
              {
                required: true,
                message: "请输入旧密码",
                trigger: "blur"
              }
            ]}
          >
            <ElInput
              clearable
              show-password
              type="password"
              v-model={pwdForm.oldPassword}
              placeholder="请输入旧密码"
            />
          </ElFormItem>
          <ElFormItem
            prop="newPassword"
            rules={[
              {
                required: true,
                message: "请输入新密码",
                trigger: "blur"
              }
            ]}
          >
            <ElInput
              clearable
              show-password
              type="password"
              v-model={pwdForm.newPassword}
              placeholder="请输入新密码"
            />
          </ElFormItem>
          <ElFormItem
            prop="confirmPassword"
            rules={[
              {
                required: true,
                message: "请输入确认密码",
                trigger: "blur"
              }
            ]}
          >
            <ElInput
              clearable
              show-password
              type="password"
              v-model={pwdForm.confirmPassword}
              placeholder="请输入确认密码"
            />
          </ElFormItem>
        </ElForm>
        <div class="mt-4 flex">
          {pwdProgress.map(({ color, text }, idx) => (
            <div class="w-[19vw]" style={{ marginLeft: idx !== 0 ? "4px" : 0 }}>
              <ElProgress
                striped
                striped-flow
                duration={curScore.value === idx ? 6 : 0}
                percentage={curScore.value >= idx ? 100 : 0}
                color={color}
                stroke-width={10}
                show-text={false}
              />
              <p
                class="text-center"
                style={{ color: curScore.value === idx ? color : "" }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
    closeCallBack: () => (pwdForm.newPassword = ""),
    beforeSure: done => {
      ruleFormRef.value.validate(async valid => {
        if (valid) {
          if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            message(`新密码与确认密码不一致`, {
              type: "error"
            });
            return;
          }
          const res = await changePasswordApi([
            pwdForm.oldPassword,
            pwdForm.newPassword
          ]);
          if (res.code == 0) {
            message(`修改密码成功`, {
              type: "success"
            });
            // 关闭弹框
            done();
          } else {
            message(`修改密码失败： ${res.message}`, {
              type: "error"
            });
          }
        }
      });
    }
  });
}

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    parentId: "",
    parentName: "全部",
    name: "",
    phone: "",
    status: ""
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle, tagStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = withTenantInitDataColumn([
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    // {
    //   label: "用户头像",
    //   prop: "avatar",
    //   cellRenderer: ({ row }) => (
    //     <el-image
    //       fit="cover"
    //       preview-teleported={true}
    //       src={row.avatar || userAvatar}
    //       preview-src-list={Array.of(row.avatar || userAvatar)}
    //       class="w-[24px] h-[24px] rounded-full align-middle"
    //     />
    //   ),
    //   width: 90
    // },
    {
      label: "登录账号",
      prop: "account",
      minWidth: 130
    },
    {
      label: "用户名称",
      prop: "name",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "sex",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex == 1 ? "primary" : row.sex == 2 ? "success" : "danger"}
          effect="plain"
        >
          {row.sex == 1 ? "男" : row.sex == 2 ? "女" : "未知"}
        </el-tag>
      )
    },
    {
      label: "科室",
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
        if (hasAuth("user:setStatus")) {
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
  ]);
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPassword: ""
  });
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);

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
          await setStatusUserApi(row.eid, row.status);
          message("已成功修改用户状态", {
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
    await deleteUserApi(row.eid);
    message(`您删除了用户编号为${row.id}的这条数据`, { type: "success" });
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
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "eid")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
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
      const { data } = await getUserPageApi(getSearchParams(toRaw(form)));
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

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级科室级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
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
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          ...getUserEntityDefault(row)
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
          message(`您${title}了用户名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            delete curData.higherDeptOptions;
            delete curData.title;
            applyTenantInitDataGuard(curData);
            // 表单规则校验通过
            if (title === "新增") {
              await addUserApi(curData);
              chores();
            } else {
              await updateUserApi(curData);
              chores();
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传头像 */
  function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      alignCenter: true,
      lockScroll: false,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: done => {
        console.log("裁剪后的图片信息：", avatarInfo.value);
        // 根据实际业务使用avatarInfo.value和row里的某些字段去调用上传头像接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPassword: newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.name} 用户的密码`,
      alignCenter: true,
      lockScroll: false,
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPassword"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPassword}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="mt-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPassword = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(async valid => {
          if (valid) {
            await resetPasswordApi([row.eid, pwdForm.newPassword]);
            message(`已成功重置 ${row.name} 用户的密码`, {
              type: "success"
            });
            // 关闭弹框
            done();
            // 刷新表格数据
            onSearch();
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const ids = (await getRoleIdsByApi(row.eid)).data || [];
    addDialog({
      title: `分配 ${row.name} 用户的角色`,
      props: {
        formInline: {
          name: row?.name ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
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
        const curData = options.props.formInline as RoleFormItemProps;
        console.log("curIds", curData.ids);
        await saveRoleIdsApi(row.eid, curData.ids);
        // 根据实际业务使用curData.ids和row里的某些字段去调用修改角色接口即可
        done(); // 关闭弹框
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    try {
      onSearch();

      // 归属科室
      const curData = (await getDeptListApi()).data || [];
      higherDeptOptions.value = handleTree(curData);
      treeData.value = handleTree(curData);
      treeLoading.value = false;

      // 角色列表
      roleOptions.value = (await getRoleListApi()).data;
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
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
