
import { ImgMainColor } from "/src/mainColor";
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => initTrack(), 1000);
});

const log = (msg) => {
  document.getElementById("log").innerHTML += `<br/> ${msg}`;
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
      setModalColor(hex);
    }
  );
};

const setModalColor = (color) => {
  // 当前model
  const model = document.getElementById("model");
  model.attributes["light"].value = `type: ambient; color: ${color}`;
};

const initTrack = () => {
  log("init track color...");
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