import { ImgMainColor } from "./main-color.js";
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

const currentColor = document.getElementById("current-color");

const initTrack = () => {
  log("initTrack...");
  let video = document.getElementById("arjs-video");
  let canvas = document.getElementById("canvas");
  let cap = new cv.VideoCapture(video);

  const kSize = new cv.Size(9, 3);
  const calSkyLine = (dst, h, w) => {
    let skyline = cv.Mat.zeros(h, w, cv.CV_8UC1);
    let skyView = [];
    for (let j = 0; j < w; j++) {
      for (let i = 0; i < h; i++) {
        skyline.ucharPtr(i, j)[0] = 1;
        skyView.push(...src.ucharPtr(i, j));
        if (dst.ucharPtr(i, j)[0] === 0) break;
      }
    }
    src.copyTo(dst, skyline)
    new ImgMainColor(
      {
        imageData: skyView,
      },
      function (color) {
        currentColor.style.backgroundColor = color.hex;
        currentColor.innerHTML = color.hex;
      }
    );
  };

  const getSkyRegionGradient = (src, mask, h, w) => {
    let imgGray = new cv.Mat();
    cv.cvtColor(src, imgGray, cv.COLOR_RGBA2GRAY, 0);

    cv.blur(imgGray, imgGray, kSize);
    cv.medianBlur(imgGray, imgGray, 5);
    let lap = new cv.Mat();
    cv.Laplacian(imgGray, lap, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
    // gradient_mask = (lap < 6).astype(np.uint8)
    let gradient_mask = new cv.Mat();
    cv.threshold(lap, gradient_mask, 6, 255, cv.THRESH_BINARY_INV);
    let M = cv.Mat.ones(9, 3, cv.CV_8U);
    cv.erode(gradient_mask, mask, M);
    imgGray.delete();
    lap.delete();
    calSkyLine(mask, h, w);
  };

  let src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
  let dst = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);

  const FPS = 30;
  const processVideo = () => {
    try {
      let begin = Date.now();
      cap.read(src);
      getSkyRegionGradient(src, dst, video.height, video.width);
      cv.imshow("canvas", dst);
      // schedule next one.
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    } catch (err) {
      console.log(err);
    }
  };

  // schedule the first one.
  setTimeout(processVideo, 1000);
};
