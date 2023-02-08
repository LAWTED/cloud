import { ImgMainColor } from "./main-color.js";
import { skyLineDetect } from "./skyLineDetector/index.js";
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => initCanvas(), 1000);
  setTimeout(() => initTrack(), 2000);
});

const log = (msg) => {
  document.getElementById("log").innerHTML += `<br/> ${msg}`;
};

const initCanvas = () => {
  log("initCanvas...");
  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  let video = document.getElementsByTagName("video")[0];
  const { width, height } = video.style;
  canvas.width = width.replace("px", "");
  canvas.height = height.replace("px", "");
  video.width = width.replace("px", "");
  video.height = height.replace("px", "");
  canvas.style.cssText = video.style.cssText;
  canvas.style.zIndex = 100;
  document.body.insertBefore(canvas, document.body.firstChild);
  log(`canvas: ${canvas.width} x ${canvas.height}`);
};

// 计算主色调
const calColor = (img) => {
  // 当前页面中的颜色
  const currentColor = document.getElementById("current-color");
  new ImgMainColor(
    {
      imageData: img,
    },
    function (color) {
      const { hex } = color;
      currentColor.style.backgroundColor = hex;
      currentColor.innerHTML = hex;
      setModalLightColor(hex);
    }
  );
};

const setModalLightColor = (color) => {
  // 当前model
  const model = document.getElementById("model");
  model.attributes["light"].value = `type: ambient; color: ${color}`;
};

const initTrack = () => {
  log("initTrack...");
  let video = document.getElementById("arjs-video");
  let canvas = document.getElementById("canvas");
  let cap = new cv.VideoCapture(video);

  let src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
  let dst = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
  const FPS = 30;
  const processVideo = () => {
    try {
      let begin = Date.now();

      // 读取摄像头数据
      cap.read(src);

      // 过滤出天空区域,并执行callback
      skyLineDetect(src, dst, video.height, video.width, calColor);

      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    } catch (err) {
      log(`发生异常请重新进入`);
    }
  };

  // schedule the first one.
  setTimeout(processVideo, 1000);
};
