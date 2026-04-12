<script setup lang="tsx">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";

defineOptions({
  name: "BqImgDrawer"
});

const font = reactive({
  color: "rgba(0, 0, 255, .15)",
  textAlign: "center",
  fontSize: 20
});

const props = withDefaults(
  defineProps<{
    rect?: Array<number>;
    src: string;
    rectImage?: Blob;
  }>(),
  { rect: () => [], src: "", rectImage: null }
);

const emit = defineEmits(["update:rect", "update:rectImage"]);

const canvasRef = ref<HTMLCanvasElement>();
const isDrawing = ref(false);
const startX = ref(0);
const startY = ref(0);
const rectWidth = ref(0);
const rectHeight = ref(0);
let initImage;

const onImageLoad = () => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  canvas.width = initImage.width;
  canvas.height = initImage.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(initImage, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#00f";
  ctx.strokeRect(props.rect[0], props.rect[1], props.rect[2], props.rect[3]);
};

const startDrawing = e => {
  // 是右键
  if (e.button === 2) return;
  isDrawing.value = true;
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  startX.value = e.clientX - rect.left;
  startY.value = e.clientY - rect.top;
};

const draw = e => {
  // 是右键
  if (e.button === 2) return;
  if (!isDrawing.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  rectWidth.value = e.clientX - rect.left - startX.value;
  rectHeight.value = e.clientY - rect.top - startY.value;
  if (Math.abs(rectWidth.value) < 5 || Math.abs(rectHeight.value) < 5) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(initImage, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#00f";
  ctx.strokeRect(startX.value, startY.value, rectWidth.value, rectHeight.value);
  // const imageData = ctx.getImageData(
  //   startX.value,
  //   startY.value,
  //   rectWidth.value,
  //   rectHeight.value
  // );
  // console.log("imageData", imageData);
  // const blob = new Blob([imageData.data], { type: "image/png" });
  // console.log("blob", blob);
  // emit("update:rectImage", blob);
  emit("update:rect", [
    startX.value,
    startY.value,
    rectWidth.value,
    rectHeight.value
  ]);
};

const stopDrawing = e => {
  isDrawing.value = false;
};

defineExpose({});

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.addEventListener("mousedown", startDrawing);
  document.addEventListener("mousemove", draw);
  document.addEventListener("mouseup", stopDrawing);

  initImage = document.createElement("img");
  initImage.onload = onImageLoad;
  initImage.src = props.src;

  watch(
    () => props.src,
    () => {
      initImage.src = props.src;
    }
  );

  watch(
    () => props.rect,
    () => {
      onImageLoad();
    }
  );
});
</script>

<template>
  <div class="w-fulld" element-loading-background="transparent">
    <canvas ref="canvasRef" class="block mx-auto my-2" />
  </div>
</template>

<style lang="scss" scoped></style>
