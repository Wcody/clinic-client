import { transformI18n } from "@/plugins/i18n";
import { ref, onMounted, watch, type Ref } from "vue";
import { getKind0ListApi, getKind1ListApi } from "@/api/cm/kind";
import {
  deleteKindTemplateApi,
  getKindTemplateListByKindIdApi,
  updateKindTemplateApi,
  uploadKindTemplateApi
} from "@/api/cm/kindTemplate";
import { downloadFile } from "@/api/api";
import { message } from "@/utils/message";
import _ from "lodash";
import { nextTick } from "process";

export function useKindRule(initKind: number, treeRef: Ref, treeTempRef: Ref) {
  const kindList = ref([]);
  const tempList = ref([]);
  const keysList = ref([]);
  const loading = ref(true);
  const isEditing = ref(false);
  const selectKindNodeId = ref(null);
  const selectTempNodeId = ref(null);
  const selectKeyNodeIndex = ref(null);
  const imageSrc = ref("");
  const drawRect = ref([0, 0, 0, 0]);
  const oldEditValue = ref(null);
  let listWatch = null;

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await (initKind == 0
        ? getKind0ListApi()
        : getKind1ListApi());
      kindList.value = data || [];
      if (kindList.value.length > 0) {
        onKindNodeClick(kindList.value[0]);
      }
    } finally {
      loading.value = false;
    }
  }

  async function onKindNodeClick(value) {
    if (value.eid == "0") {
      return;
    }

    if (isEditing.value) {
      message(`修改数据未保存`, {
        type: "warning"
      });
      treeRef.value.setCurrentKey(selectKindNodeId.value);
      return;
    }
    selectKindNodeId.value = value.eid;
    nextTick(() => {
      treeRef.value.setCurrentKey(value.eid);
    });
    tempList.value =
      (await getKindTemplateListByKindIdApi(value.eid)).data || [];
    if (tempList.value.length > 0) {
      onTempNodeClick(tempList.value[0]);
    } else {
      onTempNodeClick(null);
    }
  }

  async function downloadImage(imgPath: string) {
    if (imgPath) {
      const url = `/download/template${imgPath}`;
      downloadFile(url)
        .then(res => {
          imageSrc.value = URL.createObjectURL(res);
        })
        .catch(err => {
          console.log("err", err);
        });
    }
  }

  function onTempNodeClick(value) {
    if (isEditing.value) {
      message(`修改数据未保存`, {
        type: "info"
      });
      treeTempRef.value.setCurrentKey(selectTempNodeId.value);
      return;
    }
    if (listWatch) {
      listWatch();
    }
    if (value) {
      selectTempNodeId.value = value.eid;
      oldEditValue.value = value;
      keysList.value = _.cloneDeep(oldEditValue.value.regKeys || []);
      nextTick(() => {
        treeTempRef.value.setCurrentKey(value.eid);
      });
      if (keysList.value.length > 0) {
        //默认选中第一行
        onNewKeyNodeClick(0);
      } else {
        selectKeyNodeIndex.value = null;
        drawRect.value = [0, 0, 0, 0];
      }
      //监听keysList变化
      listWatch = watch(
        keysList,
        () => {
          isEditing.value = true;
        },
        {
          deep: true
        }
      );
      downloadImage(value.imgPath);
    } else {
      selectTempNodeId.value = null;
      keysList.value = [];
      oldEditValue.value = [];
      drawRect.value = [0, 0, 0, 0];
      selectKeyNodeIndex.value = null;
      imageSrc.value = null;
    }
  }

  function onNewTempClick(e) {
    e.stopPropagation();
    const input = e.target.querySelector("input");
    if (input) {
      input.value = "";
      input.click();
    }
  }

  async function onDeleteTempClick(e) {
    await deleteKindTemplateApi(selectTempNodeId.value);
    message(`删除成功`, {
      type: "success"
    });
    onKindNodeClick({ eid: selectKindNodeId.value });
  }

  function oDeleteTempKeysClick(e) {
    keysList.value.splice(selectKeyNodeIndex.value, 1);
  }

  function onNewTempKeysClick(e) {
    keysList.value.push({ keys: [""], x: 100, y: 100, w: 200, h: 200 });
    onNewKeyNodeClick(keysList.value.length - 1);
  }

  function onNewKeyNodeClick(index) {
    selectKeyNodeIndex.value = index;
    const { x, y, w, h } = keysList.value[index];
    drawRect.value = [x, y, w, h];
  }

  function onDeleteKeyNodeClick(index, subIndex) {
    if (selectKeyNodeIndex.value == index) selectKeyNodeIndex.value = null;
    keysList.value[index].keys.splice(subIndex, 1);
  }

  function onAddKeyNodeClick(index) {
    keysList.value[index].keys.push("");
  }

  async function onHandleUpload(e) {
    //新建表单对象
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("kindId", selectKindNodeId.value);
    await uploadKindTemplateApi(formData);
    onKindNodeClick({ eid: selectKindNodeId.value });
  }

  function onUpdateRect(value) {
    const item = keysList.value[selectKeyNodeIndex.value];
    if (item) {
      item.x = value[0];
      item.y = value[1];
      item.w = value[2];
      item.h = value[3];
    }
  }

  async function onSave() {
    if (isEditing.value) {
      await updateKindTemplateApi({
        eid: selectTempNodeId.value,
        regKeys: keysList.value
      });
      oldEditValue.value.regKeys = keysList.value;
      message(`保存成功`, {
        type: "success"
      });
      isEditing.value = false;
    } else {
      message(`没有改动任何数据`, {
        type: "info"
      });
    }
  }

  function onCancel() {
    if (isEditing.value) {
      isEditing.value = false;
      onTempNodeClick(oldEditValue.value);
    } else {
      message(`没有改动任何数据`, {
        type: "info"
      });
    }
  }

  onMounted(async () => {
    onSearch();
  });

  return {
    loading,
    isEditing,
    kindList,
    tempList,
    keysList,
    selectKindNodeId,
    selectTempNodeId,
    selectKeyNodeIndex,
    imageSrc,
    drawRect,
    onSearch,
    onKindNodeClick,
    onTempNodeClick,
    onNewTempClick,
    onDeleteTempClick,
    onNewTempKeysClick,
    oDeleteTempKeysClick,
    onNewKeyNodeClick,
    onDeleteKeyNodeClick,
    onAddKeyNodeClick,
    onHandleUpload,
    onUpdateRect,
    onSave,
    onCancel,
    transformI18n
  };
}
