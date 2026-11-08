import { createWildlifeDraw } from "./inletWildlife";
import wildlifeAtlas from "../../../public/assets/water/inlet-motion.webp";

const atlasSize = "vec2(512., 1024.)";

const vertexSource = `
attribute vec2 position;
varying vec2 screenUV;
varying vec2 printUV;
uniform mediump vec2 crop;
uniform mediump int spriteKind;
uniform vec4 spriteRegion, spritePose;
uniform vec2 spriteBend;
void main() {
  screenUV = vec2(position.x, -position.y) * 0.5 + 0.5;
  printUV = vec2(0.);
  gl_Position = vec4(position, 0.0, 1.0);
  if (spriteKind == 0) return;
  vec2 local = screenUV * spriteRegion.zw;
  screenUV = (spriteRegion.xy + clamp(local, vec2(.5), spriteRegion.zw - .5)) / ${atlasSize};
  if (spriteKind == 1) {
    // A bending wave runs down the spine. The head leads and the flexible
    // tail swings farther, shortening in projection when it turns away.
    float spine = smoothstep(0.22, 0.96, local.x / spriteRegion.z);
    float beat = sin(spriteBend.x - spine * 2.1);
    local.y += spine * spine * beat * 5.2;
    local.x -= spine * beat * beat * 6.;
  }
  vec2 pixel = spritePose.xy + (local - spriteRegion.zw * 0.5) * spritePose.zw;
  printUV = pixel / vec2(1600., 640.);
  vec2 clip = (printUV - 0.5) * 2. / crop;
  gl_Position = vec4(clip.x, -clip.y, 0., 1.);
}`;

const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D scene;
uniform sampler2D wildlife;
uniform mediump int spriteKind;
uniform mediump vec2 crop;
uniform float time;
uniform vec4 ripples[8];
varying vec2 screenUV;
varying vec2 printUV;

float kelpSway(vec2 uv) {
  float edges = smoothstep(.16, .38, abs(uv.x - .5));
  float fronds = edges * smoothstep(.49, .56, uv.y) * (1. - smoothstep(.61, .91, uv.y));
  return fronds * .0045 * sin(time * .72 + uv.y * 8. + uv.x * 6.);
}

// Bend from the root in the direction of a passing gust. The top and the
// outer branches respond later than the trunk, then settle after the gust.
vec2 pineBend(vec2 p, vec2 root, vec2 crown, float crownRadius, float gustFront) {
  float height = clamp((root.y - p.y) / (root.y - crown.y), 0., 1.);
  float axis = mix(root.x, crown.x, height);
  float radius = mix(6., crownRadius, smoothstep(0., .55, height));
  float branch = clamp((p.x - axis) / radius, -1., 1.);
  float mask = (1. - smoothstep(radius * .82, radius + 8., abs(p.x - axis)))
    * smoothstep(crown.y - 13., crown.y, p.y);
  float lag = gustFront - root.x - 24. * height - 16. * branch;
  float push = smoothstep(-60., 58., lag) * (1. - smoothstep(75., 305., lag));
  float rebound = smoothstep(180., 290., lag) * (1. - smoothstep(290., 460., lag));
  float flex = height * height * mask;
  float tip = abs(branch) * flex;
  float twigs = sin(time * 4.1 - height * 8. - branch * 2.) * push * tip;
  float bend = (.085 * push - .018 * rebound + .009 * sin(time * .63 - height))
    * (root.y - crown.y) * flex;
  return vec2(bend + 1.7 * twigs, bend * (.12 + .20 * branch) + .7 * twigs);
}

// A short section of a fixed path is visible at a time. Both the straight
// route and the loop measure distance from the same origin.
float windTrail(float distanceBehind, float lengthPx, float edgeDistance) {
  float taper = smoothstep(0., 7., distanceBehind)
    * (1. - smoothstep(lengthPx * .45, lengthPx, distanceBehind));
  return taper * (1. - smoothstep(.35 * taper, .6 + 1.3 * taper, edgeDistance));
}

float windPath(vec2 p, float head, float altitude, float curlX, float radius, float trail) {
  if (abs(p.y - altitude) > 2. * abs(radius) + 13.) return 0.;
  float turnLength = 6.2831853 * abs(radius);
  float baseline = altitude + 7. * sin(p.x * .009) + 3. * sin(p.x * .016);
  float y = p.y - baseline;
  float along = p.x + (p.x > curlX ? turnLength : 0.);
  float line = windTrail(head - along, trail, abs(y));
  if (abs(p.x - curlX) > abs(radius) + 3.) return line;

  // Start and finish tangent to the line. Signed radius sets the curl direction.
  vec2 radial = vec2(p.x - curlX, (y + radius) * sign(radius));
  float edge = abs(length(radial) - abs(radius));
  if (edge > 3.) return line;
  float angle = mod(atan(radial.x, radial.y) + 6.2831853, 6.2831853);
  float arc = curlX + abs(radius) * angle;
  return max(line, windTrail(head - arc, trail, edge));
}

void main() {
  if (spriteKind != 0) {
    vec4 animal = texture2D(wildlife, screenUV, -0.25);
    if (spriteKind == 1) {
      // The foreground kelp and rocks interrupt the open-water channel.
      vec3 ink = texture2D(scene, printUV + vec2(kelpSway(printUV), 0.)).rgb;
      float openWater = smoothstep(.015, .09, ink.b - ink.r) * smoothstep(.26, .42, ink.g);
      float banks = smoothstep(.20, .36, abs(printUV.x - .5));
      animal *= mix(1., openWater, banks);
    }
    gl_FragColor = animal;
    return;
  }
  vec2 uv = (screenUV - 0.5) * crop + 0.5;
  // In the print, the island ends near 44% and the crest crosses at 50%.
  float water = smoothstep(0.445, 0.475, uv.y);
  float crest = water * (1.0 - smoothstep(0.515, 0.61, uv.y));
  float tide = sin(uv.x * 11.0 - time * 0.95) + 0.32 * sin(uv.x * 22.0 + time * 0.7);
  vec2 swell = vec2(0.0018 * cos(uv.x * 11.0 - time * 0.95), 0.012 * tide) * crest;

  vec2 printSize = vec2(1600., 640.);
  vec2 printPoint = uv * printSize;
  const float mainCurlX = 750.;
  const float mainRadius = 24.;
  const float loopLength = 6.2831853 * mainRadius;
  float windHead = mix(-240., 2180. + loopLength, fract(time / 8.4 + .29));
  // The pressure front continues past the curl with the leading stroke.
  float gustFront = windHead - clamp(windHead - mainCurlX, 0., loopLength);
  vec2 slope = vec2(0.0);
  vec2 offset = clamp(slope, vec2(-1.5), vec2(1.5)) * vec2(0.009, 0.004) * water;
  vec2 source = clamp(uv + swell + offset, 0.001, 0.999);
  vec3 color = texture2D(scene, source, -0.35).rgb;
  color += clamp(slope.y * 0.025, -0.035, 0.035) * water;
  gl_FragColor = vec4(color, 1.0);
}`;

/** Animates the water and marine life in the split-view illustration. */
export function attachWaterRipples(still: HTMLImageElement, canvas: HTMLCanvasElement, onState: (playing: boolean, available: boolean) => void) {
  const surface = canvas.parentElement;
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: false });
  if (!surface || !gl) { onState(false, false); return; }

  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const atlasTexture = gl.createTexture();
  const release = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteTexture(atlasTexture);
  };
  const fail = () => { release(); onState(false, false); };
  if (!program || !buffer || !texture || !atlasTexture) { fail(); return; }
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type);
    if (!shader) { fail(); return; }
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { fail(); return; }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { fail(); return; }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // The scenery and gull frames use the first quad. Fish use the subdivided
  // mesh to bend smoothly along the spine.
  const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 16; col++) {
      const x = col / 8 - 1;
      const y = row / 2.5 - 1;
      const right = (col + 1) / 8 - 1;
      const top = (row + 1) / 2.5 - 1;
      vertices.push(x, y, right, y, x, top, x, top, right, y, right, top);
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  for (const [unit, target] of [[gl.TEXTURE0, texture], [gl.TEXTURE1, atlasTexture]] as const) {
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.uniform1i(gl.getUniformLocation(program, "scene"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "wildlife"), 1);
  const wildlife = createWildlifeDraw(gl, program, vertices.length / 2 - 6);
  const atlasImage = new Image();
  const cropLocation = gl.getUniformLocation(program, "crop");
  const timeLocation = gl.getUniformLocation(program, "time");
  const rippleLocation = gl.getUniformLocation(program, "ripples[0]");
  const waves = new Float32Array(32);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let elapsed = 0;
  let lastTime = 0;
  let ready = false;
  let disposed = false;
  let next = 0;
  let frame = 0;
  const interval = 1000 / 30;
  let nextDraw = 0;
  let lastTouch = -Infinity;
  let visible = false;
  let unavailable = false;
  let cropX = 1;
  let cropY = 1;
  let cursor: { x: number; y: number } | null = null;

  function leaveBanner() {
    cursor = null;
    wildlife.leaveGulls();
  }

  function resize() {
    const width = surface!.clientWidth;
    const height = surface!.clientHeight;
    const sourceAspect = still.naturalWidth && still.naturalHeight ? still.naturalWidth / still.naturalHeight : 2.5;
    const aspect = width / Math.max(height, 1);
    cropX = Math.min(1, aspect / sourceAspect);
    cropY = Math.min(1, sourceAspect / aspect);
    const scale = Math.min(devicePixelRatio || 1, 2, 1600 / Math.max(width, 1));
    // Reuse the backing buffer across nearby sizes during the CSS transition.
    const bufferWidth = Math.max(64, Math.ceil(width * scale / 64) * 64);
    const bufferHeight = Math.max(32, Math.ceil(height * scale / 32) * 32);
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth;
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    if (ready && !unavailable) render();
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    nextDraw = 0;
    leaveBanner();
  }
  function allowed() {
    return visible && !document.hidden && !motion.matches && !connection?.saveData && !unavailable && ready;
  }
  function render() {
    gl!.uniform2f(cropLocation, cropX, cropY);
    gl!.uniform1f(timeLocation, elapsed);
    gl!.uniform4fv(rippleLocation, waves);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    wildlife.draw(elapsed, cropX);
    if (cursor) {
      const rect = surface!.getBoundingClientRect();
      const screenX = (cursor.x - rect.left) / rect.width;
      const screenY = (cursor.y - rect.top) / rect.height;
      if (screenX >= 0 && screenX <= 1 && screenY >= 0 && screenY <= 1) {
        const reach = 24; // CSS pixels beyond the wings, at either banner size.
        wildlife.approachGulls(
          ((screenX - 0.5) * cropX + 0.5) * 1600,
          ((screenY - 0.5) * cropY + 0.5) * 640,
          reach * cropX * 1600 / rect.width,
          reach * cropY * 640 / rect.height,
        );
      } else {
        leaveBanner();
      }
    }
    canvas.style.opacity = "1";
  }
  function draw(now: number) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    if (lastTime) elapsed += Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (now >= nextDraw - 0.5) {
      // Keep the original cadence when a refresh arrives fractionally late.
      nextDraw = nextDraw && now - nextDraw < interval ? nextDraw + interval : now + interval;
      render();
    }
    frame = requestAnimationFrame(draw);
  }
  function disturb(event: PointerEvent) {
    if (!allowed()) return;
    if ((event.target as Element).closest("button")) { leaveBanner(); return; }
    const now = performance.now();
    const pressed = event.type === "pointerdown";
    if (!pressed && event.pointerType !== "touch") cursor = { x: event.clientX, y: event.clientY };
    if (pressed && event.button !== 0) return;
    if (!pressed && (event.pointerType === "touch" || now - lastTouch < 100)) return;
    const rect = surface!.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * cropX + 0.5;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * cropY + 0.5;
    if (pressed) {
      const padding = event.pointerType === "touch" ? 7 : 2;
      if (wildlife.startle(x * 1600, y * 640, padding * cropX * 1600 / rect.width, padding * cropY * 640 / rect.height, event.pointerType === "touch")) return;
    }
    if (x < 0 || x > 1 || y < 0.455 || y > 1) return;
    lastTouch = now;
    waves.set([x, y, elapsed, pressed ? 1 : 0.45], next * 4);
    next = (next + 1) % 8;
  }
  function sync() {
    const active = allowed();
    if (active && !frame) frame = requestAnimationFrame(draw);
    else if (!active) stop();
    onState(active, !unavailable);
  }
  function contextLost() {
    unavailable = true;
    canvas.style.opacity = "0";
    sync();
  }
  function upload(image: HTMLImageElement, unit: number, target: WebGLTexture) {
    // WebGL 1 needs power-of-two textures to filter the fine ink marks
    // across multiple texels when the banner or a sprite is drawn small.
    const staging = document.createElement("canvas");
    staging.width = 2 ** Math.ceil(Math.log2(image.naturalWidth));
    staging.height = 2 ** Math.ceil(Math.log2(image.naturalHeight));
    const painter = staging.getContext("2d");
    if (!painter) throw new Error("Could not prepare banner texture");
    painter.drawImage(image, 0, 0, staging.width, staging.height);
    gl!.activeTexture(unit);
    gl!.bindTexture(gl!.TEXTURE_2D, target);
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, staging);
    gl!.generateMipmap(gl!.TEXTURE_2D);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    staging.width = staging.height = 1;
  }
  async function load() {
    try {
      // Dimensions can be available before the pixels on a cached reload.
      await Promise.all([still.decode(), atlasImage.decode()]);
      if (disposed || unavailable) return;
      upload(still, gl!.TEXTURE0, texture!);
      upload(atlasImage, gl!.TEXTURE1, atlasTexture!);
      if (gl!.getError() !== gl!.NO_ERROR) {
        contextLost();
        return;
      }
      ready = true;
      resize();
      sync();
    } catch {
      if (!disposed) contextLost();
    }
  }
  const sizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  resize();
  sizeObserver.observe(surface);
  visibilityObserver.observe(surface);
  surface.addEventListener("pointermove", disturb, { passive: true });
  surface.addEventListener("pointerdown", disturb, { passive: true });
  surface.addEventListener("pointerleave", leaveBanner);
  surface.addEventListener("pointercancel", leaveBanner);
  still.addEventListener("error", contextLost);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  canvas.addEventListener("webglcontextlost", contextLost);
  atlasImage.addEventListener("error", contextLost);
  atlasImage.src = wildlifeAtlas.src;
  void load();
  return {
    dispose() {
      disposed = true;
      stop();
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      surface.removeEventListener("pointermove", disturb);
      surface.removeEventListener("pointerdown", disturb);
      surface.removeEventListener("pointerleave", leaveBanner);
      surface.removeEventListener("pointercancel", leaveBanner);
      still.removeEventListener("error", contextLost);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", contextLost);
      atlasImage.removeEventListener("error", contextLost);
      release();
    },
  };
}
