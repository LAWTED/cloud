import { ImgMainColor } from "/src/mainColor";
import * as THREE from 'three'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
const log = (msg) => {
  document.getElementById("log").innerHTML += `<br/> ${msg}`;
};

let mainColor;

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
      mainColor = hex
    }
  );
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
  tracking.track("video", myTracker);
};


var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1, markerRoot2;

var mesh1;
let mesh, light;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

initialize();
animate();
setTimeout(initTrack, 1000)

function initTexture(time) {
  const size = 128;
  const data = new Uint8Array(size * size * size);

  let i = 0;
  const scale = 0.05;
  const perlin = new ImprovedNoise();
  const vector = new THREE.Vector3();

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d =
          1.0 -
          vector
            .set(x, y, z)
            .subScalar(size / 2)
            .divideScalar(size)
            .length();
        data[i] = (128 + 128 * perlin.noise(x * scale / (Math.sin(time) * 0.25 + 1.25), y * scale / (Math.sin(time) * 0.15 + 1), z * scale / (Math.cos(time) * 0.25 + 1.25))) * d * d;
        i++;
      }
    }
  }

  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

function initialize() {
  scene = new THREE.Scene();

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  ////////////////////////////////////////////////////////////
  // setup arToolkitSource
  ////////////////////////////////////////////////////////////

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  arToolkitSource.init(function onReady() {
    onResize();
  });

  // handle resize event
  window.addEventListener("resize", function () {
    onResize();
  });

  ////////////////////////////////////////////////////////////
  // setup arToolkitContext
  ////////////////////////////////////////////////////////////

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "data/camera_para.dat",
    detectionMode: "mono",
  });

  // copy projection matrix to camera when initialization complete
  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  ////////////////////////////////////////////////////////////
  // setup markerRoots
  ////////////////////////////////////////////////////////////

  // build markerControls
  markerRoot1 = new THREE.Group();
  scene.add(markerRoot1);
  let markerControls1 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot1,
    {
      type: "pattern",
      patternUrl: "data/hiro.patt",
    }
  );

  let geometry1 = new THREE.BoxGeometry(1, 1, 1);
  let material1 = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });

  mesh1 = new THREE.Mesh(geometry1, material1);
  mesh1.position.y = 0.5;

  // Texture

  const texture = initTexture(totalTime)

  // Material

  const vertexShader = /* glsl */ `
					uniform vec3 cameraPos;

					out vec3 vOrigin;
					out vec3 vDirection;

					void main() {
						vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

						vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
						vDirection = position - vOrigin;

						gl_Position = projectionMatrix * mvPosition;
					}
				`;

  const fragmentShader = /* glsl */`
					precision highp float;
					precision highp sampler3D;

					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;

					in vec3 vOrigin;
					in vec3 vDirection;

					out vec4 color;

					uniform vec3 base;
					uniform sampler3D map;

					uniform float threshold;
					uniform float range;
					uniform float opacity;
					uniform float steps;
					uniform float frame;
					uniform vec3 ambientLightColor;

					uint wang_hash(uint seed)
					{
							seed = (seed ^ 61u) ^ (seed >> 16u);
							seed *= 9u;
							seed = seed ^ (seed >> 4u);
							seed *= 0x27d4eb2du;
							seed = seed ^ (seed >> 15u);
							return seed;
					}

					float randomFloat(inout uint seed)
					{
							return float(wang_hash(seed)) / 4294967296.;
					}

					vec2 hitBox( vec3 orig, vec3 dir ) {
						const vec3 box_min = vec3( - 0.5 );
						const vec3 box_max = vec3( 0.5 );
						vec3 inv_dir = 1.0 / dir;
						vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
						vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
						vec3 tmin = min( tmin_tmp, tmax_tmp );
						vec3 tmax = max( tmin_tmp, tmax_tmp );
						float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
						float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
						return vec2( t0, t1 );
					}

					float sample1( vec3 p ) {
						return texture( map, p ).r;
					}

					float shading( vec3 coord ) {
						float step = 0.01;
						return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
					}

					void main(){
						vec3 rayDir = normalize( vDirection );
						vec2 bounds = hitBox( vOrigin, rayDir );

						if ( bounds.x > bounds.y ) discard;

						bounds.x = max( bounds.x, 0.0 );

						vec3 p = vOrigin + bounds.x * rayDir;
						vec3 inc = 1.0 / abs( rayDir );
						float delta = min( inc.x, min( inc.y, inc.z ) );
						delta /= steps;

						// Jitter

						// Nice little seed from
						// https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
						uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
						vec3 size = vec3( textureSize( map, 0 ) );
						float randNum = randomFloat( seed ) * 2.0 - 1.0;
						p += rayDir * randNum * ( 1.0 / size );

						//

						vec4 ac = vec4( base, 0.0 );

						for ( float t = bounds.x; t < bounds.y; t += delta ) {

							float d = sample1( p + 0.5 );

							d = smoothstep( threshold - range, threshold + range, d ) * opacity;

							float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;

							ac.rgb += ( 1.0 - ac.a ) * d * col * ambientLightColor;

							ac.a += ( 1.0 - ac.a ) * d;

							if ( ac.a >= 0.95 ) break;

							p += rayDir * delta;

						}

						color = ac;

						if ( color.a == 0.0 ) discard;

					}
				`;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib['lights'],
      {
        // base: { value: new THREE.Color(0x798aa0) },
        base: { value: new THREE.Color(0xaaaaaa) },
        map: { value: texture },
        cameraPos: { value: new THREE.Vector3() },
        threshold: { value: 0.25 },
        opacity: { value: 0.25 },
        range: { value: 0.1 },
        steps: { value: 100 },
        frame: { value: 0 }
      }
    ]),
    lights: true,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 1, 0);
  markerRoot1.add(mesh);
  markerRoot1.add(ambientLight)
}

function update() {
  // turn hex(mainColor) into THREE.Color
  let color = new THREE.Color(mainColor);
  if (markerRoot1.visible) {
    // 修改ambientLight的颜色

    ambientLight.color = color;
    // mesh.material.uniforms.base.value = color;
    // 修改material.uniforms.opacity.value的值，可以改变透明度在0.25 - 0.75之间
    // mesh.material.uniforms.opacity.value = 0.25 + Math.sin(totalTime) * 0.25;
    // 修复mesh.scale的值，可以改变大小
    // mesh.scale.set(1 + Math.sin(totalTime) * 0.25, 1 + Math.sin(totalTime) * 0.15, 1 + Math.sin(totalTime) * 0.35);
    // mesh.material.uniforms.opacity.value = 0.25 + Math.sin(totalTime) * 0.25;
    // mesh 旋转
    // mesh.rotation.y += 0.01;
    // mesh.material.uniforms.map.value = initTexture(totalTime);
  }

  // update artoolkit on every frame
  if (arToolkitSource.ready !== false)
    arToolkitContext.update(arToolkitSource.domElement);
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;
  update();
  render();
}
