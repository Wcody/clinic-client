<script setup lang="tsx">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import _ from "lodash";

defineOptions({
  name: "BqPdfViewer"
});

const font = reactive({
  color: "rgba(0, 0, 0, .25)",
  fontSize: 20
});

const props = withDefaults(
  defineProps<{
    pdfUrl: string;
    currentPage: number;
  }>(),
  { pdfUrl: "", currentPage: 1 }
);

const emit = defineEmits(["changePage", "update:currentPage"]);

const iframeRef = ref<HTMLIFrameElement>();
const pdfUrlRef = ref("/pdfjs/web/viewer.html?file=" + props.pdfUrl);

const onIfameLoaded = () => {
  const contentWindow = iframeRef.value.contentWindow as any;
  //监控页码变化
  contentWindow._afterPageChange = val => {
    emit("update:currentPage", val);
    emit("changePage", val);
  };
};

const loadAndModifyPdf = async (url: string) => {
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const imgUrl = "/images/sign.png";
  const jpgImageBytes = await fetch(imgUrl).then(res => res.arrayBuffer());

  const jpgImage = await pdfDoc.embedPng(jpgImageBytes);
  const jpgDims = jpgImage.scale(0.5);

  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const text = "admin\n2024-01-01 00:00:00";
    const size = 16;
    const opacity = 0.15;
    const angle = degrees(30);
    const spacing = [100, 200]; // Adjust spacing between texts

    for (let y = -height; y < height * 2; y += spacing[0]) {
      for (let x = -width; x < width * 2; x += spacing[1]) {
        page.drawText(text, {
          x: x,
          y: y,
          size: size,
          opacity: opacity,
          rotate: angle,
          color: rgb(0.5, 0.5, 0.5) // Light gray color
        });
      }
    }

    // 添加图章
    page.drawImage(jpgImage, {
      x: 100,
      y: 100,
      width: jpgDims.width,
      height: jpgDims.height,
      rotate: degrees(0),
      opacity: 0.3
    });
  }
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  pdfUrlRef.value =
    "/pdfjs/web/viewer.html?file=" + URL.createObjectURL(blob);
};

function goToPage(page: number) {
  const contentWindow = iframeRef.value.contentWindow as any;
  contentWindow.PDFViewerApplication.page = page;
}

defineExpose({ goToPage });

onMounted(() => {
  watch(
    () => props.currentPage,
    val => {
      //const contentWindow = iframeRef.value.contentWindow as any;
      //contentWindow.PDFViewerApplication.page = val;
    }
  );
});

loadAndModifyPdf(props.pdfUrl);
</script>

<template>
  <div class="bq-pdf-viewer" element-loading-background="transparent">
    <iframe
      ref="iframeRef"
      :src="pdfUrlRef"
      width="100%"
      height="100%"
      @load="onIfameLoaded"
    />
  </div>
</template>

<style lang="scss" scoped>
.bq-pdf-viewer {
  height: 100%;
}
</style>
