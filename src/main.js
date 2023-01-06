import { ImgMainColor } from "../main-color.js";
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
  canvas.style.cssText = video.style.cssText;
  canvas.style.zIndex = 100;
  document.body.insertBefore(canvas, document.body.firstChild);
  log(`canvas: ${canvas.width} x ${canvas.height}`);
};

// const calSktline = (mask) => {}

// console.log(cv)

// const getSkyRegionGradient = (img, h, w) => {
//   img_gray = cv.cvtColor()
// }

const HexRGB = {
  "#5da8d0": [93, 168, 208],
  "#000000": [0, 0, 0],
};

const registerColor = (color) => {
  let registeredColor = [];
  Object.keys(HexRGB).forEach((hex) => {
    registeredColor.push(hex);
    tracking.ColorTracker.registerColor(hex, function (r, g, b) {
      const dx = r - HexRGB[hex][0];
      const dy = g - HexRGB[hex][1];
      const dz = b - HexRGB[hex][2];
      return dx * dx + dy * dy + dz * dz < 1000;
    });
  });
  return registeredColor;
};

const initTrack = () => {
  log("initTrack...");
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  let colors = registerColor();
  // let tracker = new tracking.ColorTracker(colors);
  // tracking.track("#arjs-video", tracker);
  // tracker.on("track", function (event) {
  //   context.clearRect(0, 0, canvas.width, canvas.height);

  //   event.data.forEach(function (rect) {
  //     if (rect.color === "custom") {
  //       rect.color = tracker.customColor;
  //     }

  //     context.strokeStyle = rect.color;
  //     context.strokeRect(
  //       rect.x,
  //       rect.y,
  //       rect.width,
  //       rect.height
  //     );
  //     context.font = "11px Helvetica";
  //     context.fillStyle = "#fff";
  //     context.fillText(
  //       "x: " + rect.x + "px",
  //       rect.x + rect.width + 5,
  //       rect.y + 11
  //     );
  //     context.fillText(
  //       "y: " + rect.y + "px",
  //       rect.x + rect.width + 5,
  //       rect.y + 22
  //     );
  //     context.fillText(
  //       "color: " + rect.color,
  //       rect.x + rect.width + 5,
  //       rect.y + 33
  //     );
  //   });
  // });
  var MyTracker = function () {
    MyTracker(this, "constructor");
  };

  MyTracker = function () {
    MyTracker.prototype.track = function (pixels, width, height) {
      let mainColor;
      new ImgMainColor(
        {
          imageData: pixels,
        },
        function (color) {
          mainColor = color;
        }
      );
      this.emit("track", {
        data: {
          mainColor,
        },
      });
    };
  };

  tracking.inherits(MyTracker, tracking.Tracker);

  const myTracker = new MyTracker();

  let lastColor;
  const currentColor = document.getElementById("current-color");
  const model = document.getElementById("model");
  myTracker.on("track", function (event) {
    // console log when color change
    if (event.data.mainColor.hex !== lastColor) {
      lastColor = event.data.mainColor.hex;
      currentColor.style.backgroundColor = lastColor;
      currentColor.innerHTML = lastColor;
      model.attributes['light'].value = `type: ambient; color: ${lastColor}`;
    }
  });

  tracking.track("#arjs-video", myTracker);
};
