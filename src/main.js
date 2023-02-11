import { ImgMainColor } from "./mainColor";
import { skyLineDetect } from "./skyLineDetector/index.js";
import { createAudioMeter } from "./volumeMeter";
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => initCanvas(), 1000);
  setTimeout(() => initTrack(), 2000);
  setTimeout(() => startMeter(), 1000);
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
};

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
      // setModalColor(hex);
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

// volume meter part

let meter = null;
let rafID = null;
let idle = true;
const canvasContext = document.getElementById("meter").getContext("2d");
const startMeter = () => {
  // grab an audio context
  const audioContext = new AudioContext();

  // Attempt to get audio input
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        mandatory: {
          googEchoCancellation: "false",
          googAutoGainControl: "false",
          googNoiseSuppression: "false",
          googHighpassFilter: "false",
        },
        optional: [],
      },
    })
    .then((stream) => {
      // Create an AudioNode from the stream.
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Create a new volume meter and connect it.
      meter = createAudioMeter(audioContext);
      mediaStreamSource.connect(meter);

      // kick off the visual updating
      // setAnimation()
      drawLoop();
    })
    .catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
      alert("Stream generation failed.");
    });
};

// const setAnimation = () => {
//   setInterval(() => {
//     console.log(meter.volume);
//   }, 100);
// }

function drawLoop(time) {
  // clear the background
  const WIDTH = 100;
  const HEIGHT = 15;
  canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  // check if we're currently clipping
  if (meter.checkClipping()) canvasContext.fillStyle = "#F87171";
  else canvasContext.fillStyle = "#4ADE80";

  // draw a bar based on the current volume
  canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

  // set animation
  const transferVolume = meter.volume * WIDTH * 1.4;
  if (!idle) {
    rafID = window.requestAnimationFrame(drawLoop);
    return
  }
  if (transferVolume < 30) {
    document
      .getElementById("fox")
      .setAttribute("animation-mixer", { clip: "Survey" });
  } else if (transferVolume < 60) {
    document
      .getElementById("fox")
      .setAttribute("animation-mixer", { clip: "Walk" });
    idle = false;
    setTimeout(() => {
      idle = true;
    }, 3000);
  } else {
    document
      .getElementById("fox")
      .setAttribute("animation-mixer", { clip: "Run" });
    idle = false;
    setTimeout(() => {
      idle = true;
    }, 3000);
  }

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);
}
