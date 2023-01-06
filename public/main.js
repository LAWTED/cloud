// import tracking.js
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

const HexRGB = {
  "#5da8d0": [93, 168, 208],
  "#1b233c": [27, 35, 60],
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
  let tracker = new tracking.ColorTracker(colors);
  let mainRect = null;
  tracking.track("#arjs-video", tracker);
  tracker.on("track", function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function (rect) {
      if (rect.color === "custom") {
        rect.color = tracker.customColor;
      }
      if (
        mainRect === null ||
        mainRect.width * mainRect.height < rect.width * rect.height
      ) {
        mainRect = rect;
      }
    });
    context.strokeStyle = mainRect.color;
    context.strokeRect(mainRect.x, mainRect.y, mainRect.width, mainRect.height);
    context.font = "11px Helvetica";
    context.fillStyle = "#fff";
    context.fillText(
      "x: " + mainRect.x + "px",
      mainRect.x + mainRect.width + 5,
      mainRect.y + 11
    );
    context.fillText(
      "y: " + mainRect.y + "px",
      mainRect.x + mainRect.width + 5,
      mainRect.y + 22
    );
    context.fillText(
      "color: " + mainRect.color,
      mainRect.x + mainRect.width + 5,
      mainRect.y + 33
    );
  });
};
