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

// 0: #5da8d0
// 125: #4393be
// 250: #4184b4
// 375: #286ba4
// 500: #04548d
// 625: #1b233c
// 750: #1c181b

// 0: [93, 168, 208]
// 125: [67, 147, 190]
// 250: [65, 132, 180]
// 375: [40, 107, 164]
// 500: [4, 84, 141]
// 625: [27, 35, 60]
// 750: [28, 24, 27]

const initTrack = () => {
  log("initTrack...");
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  tracking.ColorTracker.registerColor("#5da8d0", function (r, g, b) {
    dx = r - 93,
    dy = g - 168,
    dz = b - 208;

    return dx * dx + dy * dy + dz * dz < 2000;
  });
  let tracker = new tracking.ColorTracker(["#5da8d0"]);
  // let observer =new MutationObserver(function (mutations,observe) {
  //   console.log(document.body.offsetHeight, document.body.offsetWidth)
  //   canvas.height = document.body.clientHeight;
  //   canvas.width = document.body.clientWidth;
  // });
  // observer.observe(document.body,{attributes:true,attributeFilter:['style'],attributeOldValue:true});

  tracking.track("#arjs-video", tracker);
  tracker.on("track", function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function (rect) {
      if (rect.color === "custom") {
        rect.color = tracker.customColor;
      }
      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = "11px Helvetica";
      context.fillStyle = "#fff";
      context.fillText(
        "x: " + rect.x + "px",
        rect.x + rect.width + 5,
        rect.y + 11
      );
      context.fillText(
        "y: " + rect.y + "px",
        rect.x + rect.width + 5,
        rect.y + 22
      );
    });
  });
};
