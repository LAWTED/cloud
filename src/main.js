import { ImgMainColor } from "./mainColor";
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

// 生成灰色和白色的近似颜色
const generateColor = () => {
  const colors = [];
  for (let i = 0; i < 256; i++) {
    colors.push(`rgb(${i},${i},${i})`);
  }
  return colors;
}


// 计算主色调
const calColor = (img) => {
  // 当前页面中的颜色
  const currentColor = document.getElementById("current-color");
  new ImgMainColor(
    {
      imageData: img,
      exclude: ["#ffffff", "#000000", ...generateColor()],
    },
    function (color) {
      const { hex } = color;
      currentColor.style.backgroundColor = hex;
      currentColor.innerHTML = hex;
      setModalColor(hex);
    }
  );
};

const setModalColor = (color) => {
  // 当前model
  const model = document.getElementById("model");
  model.attributes["color"].value = `${color}`;
};

const filterBlackAndWhite = (src, h, w, callback) => {
  const filteredImg = [];
  for (let j = 0; j < w; j++) {
    for (let i = 0; i < h; i++) {
      const [r, g, b, a] = src.ucharPtr(i, j);
      if (r > 200 && g > 200 && b > 200) continue;
      if (r < 50 && g < 50 && b < 50) continue;
      filteredImg.push(...src.ucharPtr(i, j));
    }
  }
  callback(filteredImg);
};

const initTrack = () => {
  log("initTrack...");
  let MyTracker = function () {
    MyTracker(this, "constructor");
  };
  MyTracker = function () {
    MyTracker.prototype.track = (pixels) => calColor(pixels);
  };

  tracking.inherits(MyTracker, tracking.Tracker);

  var myTracker = new MyTracker();

  tracking.track("#arjs-video", myTracker);
};
