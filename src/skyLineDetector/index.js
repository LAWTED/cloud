
const kSize = new cv.Size(9, 3);

const calSkyLine = (src, dst, h, w, callback) => {
  const skyView = [];
  for (let j = 0; j < w; j++) {
    for (let i = 0; i < h; i++) {
      skyView.push(...src.ucharPtr(i, j));
      if (dst.ucharPtr(i, j)[0] === 0) break;
    }
  }
  callback(skyView);
};

const getSkyRegionGradient = (src, mask) => {
  let imgGray = new cv.Mat();
  cv.cvtColor(src, imgGray, cv.COLOR_RGBA2GRAY, 0);
  cv.blur(imgGray, imgGray, kSize);
  cv.medianBlur(imgGray, imgGray, 5);
  let lap = new cv.Mat();
  cv.Laplacian(imgGray, lap, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
  let gradient_mask = new cv.Mat();
  cv.threshold(lap, gradient_mask, 6, 255, cv.THRESH_BINARY_INV);
  let M = cv.Mat.ones(9, 3, cv.CV_8U);
  cv.erode(gradient_mask, mask, M);
  imgGray.delete();
  lap.delete();
};

export const skyLineDetect = (src, dst, h, w, callback) => {
  getSkyRegionGradient(src, dst);
  calSkyLine(src, dst, h, w, callback);
};
