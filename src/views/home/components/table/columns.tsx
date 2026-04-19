import { tableData } from "../../data";
import { delay } from "@pureadmin/utils";
import { ref, onMounted, reactive } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import Empty from "./empty.svg?component";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      sortable: false,
      label: "序号",
      prop: "id",
      width: 60
    },
    {
      sortable: false,
      label: "患者姓名",
      prop: "name"
    },
    {
      sortable: false,
      label: "科室",
      prop: "department"
    },
    {
      sortable: false,
      label: "接诊医生",
      prop: "doctor"
    },
    {
      sortable: false,
      label: "就诊时间",
      prop: "date"
    },
    {
      sortable: false,
      label: "状态",
      prop: "status",
      cellRenderer: ({ row }) => {
        const colorMap = {
          已完成: "#26ce83",
          待接诊: "#e85f33",
          已接诊: "#38bdf8"
        };
        const color = colorMap[row.status] ?? "#909399";
        return <span style={{ color, fontWeight: 500 }}>{row.status}</span>;
      }
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    layout: "prev, pager, next",
    total: 0,
    align: "center"
  });

  function onCurrentChange(page: number) {
    loading.value = true;
    delay(300).then(() => {
      loading.value = false;
    });
  }

  onMounted(() => {
    dataList.value = tableData;
    pagination.total = dataList.value.length;
    loading.value = false;
  });

  return {
    Empty,
    loading,
    columns,
    dataList,
    pagination,
    onCurrentChange
  };
}
