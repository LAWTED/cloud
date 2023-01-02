// import tracking.js
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => initCanvas(), 1000)
  setTimeout(() => initTrack(), 2000)
});

const initCanvas = () => {
  let canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.width= document.body.clientWidth
  canvas.height = document.body.clientHeight + parseInt(document.body.style.marginTop.replace('px', ' '))
  canvas.style = 'position: fixed'
  document.body.insertBefore(canvas, document.body.firstChild);
}

const initTrack = () => {
  console.log('initTracking...')
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext("2d");
  let tracker = new tracking.ColorTracker(["yellow"]);
  // let observer =new MutationObserver(function (mutations,observe) {
  //   console.log(document.body.offsetHeight, document.body.offsetWidth)
  //   canvas.height = document.body.clientHeight;
  //   canvas.width = document.body.clientWidth;
  // });
  // observer.observe(document.body,{attributes:true,attributeFilter:['style'],attributeOldValue:true});

  tracking.track('#arjs-video', tracker, { camera: true });
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

}