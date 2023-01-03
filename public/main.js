// import tracking.js
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => initCanvas(), 1000)
  setTimeout(() => initTrack(), 2000)
});


const initCanvas = () => {
  console.log('initCanvas...')
  let canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  let html = document.getElementById('html');
  canvas.width= html.offsetWidth;
  canvas.height = html.offsetHeight;
  canvas.style = 'position: fixed'
  document.body.insertBefore(canvas, document.body.firstChild);
}

const parsePx = (cssStr) => {
  return parseInt(cssStr.replace('px', ''))
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

  tracking.track('#arjs-video', tracker);
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