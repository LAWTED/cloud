// import tracking.js
window.addEventListener("arjs-video-loaded", (e) => {
  let video = document.getElementById("arjs-video");
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  let tracker = new tracking.ColorTracker(["yellow"]);
  let observer =new MutationObserver(function (mutations,observe) {
    console.log('body size changed', document.body.clientWidth, document.body.clientHeight);
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['style'],attributeOldValue:true});

  console.log("arjs-video-loaded", e.detail);
  tracking.track("#arjs-video", tracker, { camera: true });
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
});