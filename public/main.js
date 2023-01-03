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
  const { width, height, marginLeft, marginRight, margin } = video.style;
  canvas.width = width.replace("px", "");
  canvas.height = height.replace("px", "");
  log(`marginLeft: ${marginLeft}`)
  const marginLeftNum = parseInt(marginLeft.replace("px", ""));
  log(`marginLeftNum:${marginLeftNum}`);
  canvas.style = `position: fixed; margin-left: ${
    marginLeftNum > 0 ? -marginLeftNum : marginLeftNum
  }px;`;
  document.body.insertBefore(canvas, document.body.firstChild);
  log(`canvas: ${canvas.width} x ${canvas.height}`);
};

const initTrack = () => {
  log("initTrack...");
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  let tracker = new tracking.ColorTracker(["yellow"]);
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
