import { createAudioMeter } from "/src/volumeMeter";
window.addEventListener("arjs-video-loaded", (e) => {
  setTimeout(() => startMeter(), 1000);
  setTimeout(() => app(), 1000);
});

const log = (msg) => {
  document.getElementById("log").innerHTML += `<br/> ${msg}`;
};

// volume meter part
let meter = null;
let rafID = null;
let idle = true;
const canvasContext = document.getElementById("meter").getContext("2d");
const startMeter = () => {
  log('start volume meter...')
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


const drawLoop = (time) => {
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
    }, 5000);
  } else {
    document
      .getElementById("fox")
      .setAttribute("animation-mixer", { clip: "Run" });
    idle = false;
    setTimeout(() => {
      idle = true;
    }, 5000);
  }

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);
}

let recognizer;

// tensorflow part
function predictWord() {
  // Array of words that the recognizer is trained to recognize.
  const words = recognizer.wordLabels();
  recognizer.listen(({ scores }) => {
    // Turn scores into a list of (score,word) pairs.
    scores = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }));
    // Find the most probable word.
    scores.sort((s1, s2) => s2.score - s1.score);
    document.getElementById("current-speech").innerHTML = scores[0].word;
  }, { probabilityThreshold: 0.75 });
}

async function app() {
  log('Loading model...');
  recognizer = speechCommands.create('BROWSER_FFT');
  await recognizer.ensureModelLoaded();
  predictWord();
}
