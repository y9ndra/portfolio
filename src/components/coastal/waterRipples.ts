import { createWildlifeDraw } from "./inletWildlife";
import wildlifeAtlas from "../../../public/assets/water/inlet-motion.webp";

const atlasSize = "vec2(512., 1024.)";

const vertexSource = `
attribute vec2 position;
varying vec2 screenUV;
varying vec2 printUV;
uniform mediump vec2 crop;
uniform mediump float viewHeight;
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
  vec2 clip = (printUV - 0.5) * 2. / (crop * vec2(1., viewHeight));
  gl_Position = vec4(clip.x, -clip.y, 0., 1.);
}`;

const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D scene;
uniform sampler2D extension;
uniform sampler2D wildlife;
uniform mediump int spriteKind;
uniform mediump vec2 crop;
uniform mediump float viewHeight;
uniform mediump float fishForeground;
uniform float time;
uniform float sunHour;
uniform vec3 stars[11];
uniform vec4 ripples[8];
varying vec2 screenUV;
varying vec2 printUV;

vec3 sceneInk(vec2 point) {
  vec3 original = texture2D(scene, clamp(point, .001, .999), -0.35).rgb;
  if (viewHeight < 1.01 || (point.y >= .06 && point.y <= .94)) return original;
  vec2 extended = vec2(point.x, (point.y - .5) / viewHeight + .5);
  vec3 extra = texture2D(extension, clamp(extended, .001, .999), -0.35).rgb;
  float originalWeight = smoothstep(0., .06, point.y) * (1. - smoothstep(.94, 1., point.y));
  return mix(extra, original, originalWeight);
}

float daytime(float hour) {
  return smoothstep(5.1, 7.5, hour) * (1. - smoothstep(16.9, 19.3, hour));
}

float twilight(float hour) {
  float dawn = smoothstep(5.1, 6.15, hour) * (1. - smoothstep(6.4, 7.8, hour));
  float dusk = smoothstep(16.6, 17.8, hour) * (1. - smoothstep(18.4, 19.5, hour));
  return max(dawn, dusk);
}

vec2 skyPath(float progress) {
  float risingY = mix(.23, .32, progress) - .22 * sin(progress * 3.14159265);
  // Descend smoothly towards the right ridge during the second half.
  float settingY = mix(.055, .32, pow(max(0., progress * 2. - 1.), 3.3));
  return vec2(mix(.10, .90, progress), mix(risingY, settingY, smoothstep(.48, .58, progress)));
}

// Trace a ray from the sun to the water surface through a simplified object silhouette.
float blocksSun(vec2 sun, vec2 entry, vec2 objectCenter, float halfWidth) {
  float verticalSpan = entry.y - sun.y;
  float crossesObject = smoothstep(.0, .02, objectCenter.y - sun.y)
    * smoothstep(.0, .02, entry.y - objectCenter.y);
  float rayX = mix(sun.x, entry.x, clamp((objectCenter.y - sun.y) / max(verticalSpan, .001), 0., 1.));
  return crossesObject * (1. - smoothstep(halfWidth * .82, halfWidth * 1.15, abs(rayX - objectCenter.x)));
}

float lightShaft(float entryX, float center, float width) {
  float distance = (entryX - center) / width;
  return exp(-distance * distance);
}

float surfaceGlint(vec2 point, vec2 center, vec2 radius) {
  vec2 delta = (point - center) / radius;
  return exp(-dot(delta, delta) * 2.);
}

float starPoint(vec2 point, vec2 center, float radius) {
  float size = radius * 1.7;
  return 1. - smoothstep(size * .45, size, length(point - center));
}

// Recover the dark pine silhouette from the print, and keep the pale lighthouse
// in front as well. Use the warped source coordinate so the mask follows wind.
float foregroundCoverage(vec2 source, vec3 ink) {
  vec2 pixel = source * vec2(1600., 640.);
  float treeArea = smoothstep(980., 1015., pixel.x) * (1. - smoothstep(1290., 1320., pixel.x))
    * smoothstep(45., 60., pixel.y) * (1. - smoothstep(222., 245., pixel.y));
  float inkBrightness = dot(ink, vec3(.299, .587, .114));
  float pine = treeArea * (1. - smoothstep(.40, .62, inkBrightness));
  float towerWidth = mix(12., 23., smoothstep(145., 225., pixel.y));
  float tower = (1. - smoothstep(towerWidth - 1., towerWidth + 1., abs(pixel.x - 943.)))
    * smoothstep(130., 134., pixel.y) * (1. - smoothstep(229., 233., pixel.y));
  // Compare with nearby sky so the naturally brighter horizon isn't mistaken
  // for a cloud. Pale ink still softens the disc at actual cloud edges.
  vec3 skyAbove = sceneInk(vec2(source.x, source.y - .055));
  float skyBrightness = dot(skyAbove, vec3(.299, .587, .114));
  float cloud = smoothstep(.025, .09, inkBrightness - skyBrightness)
    * smoothstep(.79, .88, inkBrightness) * (1. - smoothstep(210., 240., pixel.y));
  return max(cloud, max(pine, tower));
}

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
    if (spriteKind == 1 && fishForeground < .5) {
      // The foreground kelp and rocks interrupt the open-water channel.
      vec3 ink = sceneInk(printUV + vec2(kelpSway(printUV), 0.));
      float openWater = smoothstep(.015, .09, ink.b - ink.r) * smoothstep(.26, .42, ink.g);
      float banks = smoothstep(.20, .36, abs(printUV.x - .5));
      animal *= mix(1., openWater, banks);
    }
    if (sunHour >= 0.) {
      float day = daytime(sunHour);
      vec3 nightTint = spriteKind == 1 ? vec3(.37, .54, .65) : vec3(.45, .52, .64);
      animal.rgb *= mix(nightTint, vec3(1.), day);
      animal.rgb *= mix(vec3(1.), vec3(1.06, 1.01, .95), twilight(sunHour) * .45);
    }
    gl_FragColor = animal;
    return;
  }
  vec2 uv = (screenUV - 0.5) * crop + 0.5;
  uv.y = (uv.y - .5) * viewHeight + .5;
  // In the print, the island ends near 44% and the crest crosses at 50%.
  float water = smoothstep(0.445, 0.475, uv.y);
  float crest = water * (1.0 - smoothstep(0.515, 0.61, uv.y));
  float tide = sin(uv.x * 11.0 - time * 0.95) + 0.32 * sin(uv.x * 22.0 + time * 0.7);
  vec2 swell = vec2(0.0018 * cos(uv.x * 11.0 - time * 0.95), 0.012 * tide) * crest;

  // Kelp tips sway in the current. The holdfasts stay anchored to the rocks.
  swell.x += kelpSway(uv);
  vec2 printSize = vec2(1600., 640.);
  vec2 printPoint = uv * printSize;
  const float mainCurlX = 750.;
  const float mainRadius = 24.;
  const float loopLength = 6.2831853 * mainRadius;
  float windHead = mix(-240., 2180. + loopLength, fract(time / 8.4 + .29));
  // The pressure front continues past the curl with the leading stroke.
  float gustFront = windHead - clamp(windHead - mainCurlX, 0., loopLength);
  if (printPoint.x > 785. && printPoint.x < 1310. && printPoint.y < 241.) {
    vec2 deflection = pineBend(printPoint, vec2(1080., 207.), vec2(1144., 57.), 159., gustFront)
      * smoothstep(1005., 1028., printPoint.x)
      + pineBend(printPoint, vec2(1026., 210.), vec2(1041., 147.), 55., gustFront)
      + pineBend(printPoint, vec2(867., 239.), vec2(854., 190.), 53., gustFront);
    swell -= deflection / printSize;
  }
  vec2 slope = vec2(0.0);
  for (int i = 0; i < 8; i++) {
    float age = time - ripples[i].z;
    if (ripples[i].w > 0.0 && age >= 0.0 && age < 3.0) {
      // Foreshortened rings: a travelling wave packet with damping and
      // radial spreading. Its slope refracts the existing water texture.
      float rippleDepth = smoothstep(0.49, 0.64, ripples[i].y);
      vec2 aspect = vec2(1.0, mix(1.8, 0.4, rippleDepth));
      vec2 delta = (uv - ripples[i].xy) * aspect;
      float radius = length(delta);
      float front = radius - age * mix(0.035, 0.08, rippleDepth);
      float width = 0.025 + age * 0.008;
      float phase = front * 220.0;
      float envelope = exp(-front * front / (width * width))
        * exp(-age * 1.5) / (1.0 + radius * 15.0)
        * smoothstep(0.0, 0.1, age)
        * (1.0 - smoothstep(2.4, 3.0, age));
      float derivative = cos(phase) - sin(phase) *
        (2.0 * front / (width * width) + 15.0 / (1.0 + radius * 15.0)) / 220.0;
      slope += delta / max(radius, 0.001) * derivative * envelope * ripples[i].w;
    }
  }
  vec2 offset = clamp(slope, vec2(-1.5), vec2(1.5)) * vec2(0.009, 0.004) * water;
  vec2 source = uv + swell + offset;
  vec3 color = sceneInk(source);
  float foreground = 0.;
  if (sunHour >= 0.) foreground = foregroundCoverage(source, color);
  float sunDisc = 0.;
  vec3 visibleSunColor = vec3(1., .91, .72);
  if (sunHour >= 6. && sunHour <= 18.) {
    float progress = (sunHour - 6.) / 12.;
    vec2 sunCenter = skyPath(progress);
    float distanceToSun = length((uv - sunCenter) * printSize);
    float daylight = 1.;
    float sky = smoothstep(.48, .70, dot(color, vec3(.299, .587, .114))) * (1. - smoothstep(.35, .42, uv.y));
    // Follow the distant right-hand ridge so the sun is occluded by the mountain.
    float ridge = mix(202., 173., smoothstep(1190., 1400., printPoint.x))
      + 18. * smoothstep(1400., 1600., printPoint.x);
    float mountainMask = 1. - smoothstep(ridge - 1., ridge + 1., printPoint.y);
    sky *= mix(1., mountainMask, smoothstep(1180., 1240., printPoint.x));
    // The left mountain slopes downward toward the bay.
    float leftRidge = mix(112., 207., smoothstep(135., 270., printPoint.x));
    float leftMask = 1. - smoothstep(leftRidge - 1., leftRidge + 1., printPoint.y);
    sky *= mix(leftMask, 1., smoothstep(250., 300., printPoint.x));
    float dusk = 1. - sin(progress * 3.14159265);
    float centerX = sunCenter.x * 1600.;
    float centerRidge = progress < .5
      ? mix(112., 207., smoothstep(135., 270., centerX))
      : mix(202., 173., smoothstep(1190., 1400., centerX)) + 18. * smoothstep(1400., 1600., centerX);
    // The reddish color peaks only when the ridge crosses the sun's middle.
    float horizonWarmth = smoothstep(-10., -3., sunCenter.y * 640. - centerRidge)
      * (1. - smoothstep(8., 18., sunCenter.y * 640. - centerRidge));
    horizonWarmth *= 1. - smoothstep(.06, .12, min(progress, 1. - progress));
    float glow = exp(-distanceToSun / 150.) * daylight * sky;
    float halo = exp(-distanceToSun / 350.) * dusk * sky;
    float horizonHalo = exp(-distanceToSun / 115.) * horizonWarmth * sky;
    float ridgeVisibility = mix(leftMask, 1., smoothstep(250., 300., printPoint.x))
      * mix(1., mountainMask, smoothstep(1180., 1240., printPoint.x));
    sunDisc = (1. - smoothstep(17., 20., distanceToSun)) * ridgeVisibility * (1. - foreground);
    color = mix(color, vec3(1., .68, .40), halo * .16 + glow * (.14 + .16 * dusk));
    color = mix(color, vec3(1., .36, .16), horizonHalo * .25);
    visibleSunColor = mix(visibleSunColor, vec3(1., .66, .32), horizonWarmth * .85);

    // Sunlight enters along the whole surface, with uneven, drifting shafts.
    float illumination = smoothstep(6., 6.3, sunHour) * (1. - smoothstep(17.7, 18., sunHour));
    float depth = max(uv.y - .505, 0.);
    // Project back to the point where a ray from the sun entered the water.
    // Refraction bends it towards vertical while retaining the sun's direction.
    float refraction = depth * .55 / max(.505 - sunCenter.y, .08);
    float entryX = (uv.x + refraction * sunCenter.x) / (1. + refraction);
    float drift = .0025 * sin(time * .22);
    float rayX = entryX + drift;
    float rays = lightShaft(rayX, .075, .012) * .45
      + lightShaft(rayX, .145, .029) * .68
      + lightShaft(rayX, .245, .009) * .43
      + lightShaft(rayX, .325, .022) * .74
      + lightShaft(rayX, .455, .015) * .50
      + lightShaft(rayX, .535, .035) * .72
      + lightShaft(rayX, .66, .011) * .45
      + lightShaft(rayX, .735, .026) * .63
      + lightShaft(rayX, .85, .014) * .55
      + lightShaft(rayX, .94, .031) * .52;
    vec2 entry = vec2(entryX, .49);
    float lighthouseShadow = blocksSun(sunCenter, entry, vec2(.589, .27), .012);
    float canopyShadow = blocksSun(sunCenter, entry, vec2(.72, .145), .072);
    float trunkShadow = blocksSun(sunCenter, entry, vec2(.69, .27), .013);
    float shadow = max(lighthouseShadow, max(canopyShadow * .8, trunkShadow));
    float depthFade = smoothstep(.505, .54, uv.y) * (1. - smoothstep(.66, .87, uv.y));
    float openWater = smoothstep(.015, .08, color.b - color.r) * smoothstep(.24, .42, color.g);
    float light = illumination * depthFade * openWater * min(rays, 1.) * .40 * (1. - shadow * .88);
    color = mix(color, vec3(.91, .89, .67), light);

  }
  if (printPoint.y < 200.) {
    float companion = mix(-320., 2340., fract(time / 8.4 + .76));
    float breeze = windPath(printPoint, windHead, 106., mainCurlX, mainRadius, 132.);
    breeze = max(breeze, .67 * windPath(printPoint, windHead - 215., 141., 1020., -14., 76.));
    breeze = max(breeze, .78 * windPath(printPoint, companion, 68., 560., 17., 98.));
    float skyMask = smoothstep(.54, .72, dot(color, vec3(.299, .587, .114)));
    color = mix(color, vec3(1., .98, .94), breeze * skyMask * .59);
  }
  color += clamp(slope.y * 0.025, -0.035, 0.035) * water;
  if (sunHour >= 0.) {
    float day = daytime(sunHour);
    // Cool the whole print at night while retaining the original painted detail.
    vec3 nightColor = color * vec3(.30, .42, .57);
    float skyArea = 1. - smoothstep(.20, .44, uv.y);
    nightColor = mix(nightColor, color * vec3(.24, .32, .48), skyArea * .55);
    vec3 sceneColor = mix(nightColor, color, day);
    // A gentle, time-varying warmth bridges daylight and night without
    // obscuring the original illustration's texture.
    float warm = twilight(sunHour);
    float horizon = smoothstep(.04, .20, uv.y) * (1. - smoothstep(.43, .55, uv.y));
    vec3 warmTint = mix(vec3(1.08, 1.015, .94), vec3(1.16, 1.035, .90), horizon);
    color = sceneColor * mix(vec3(1.), warmTint, warm * .55);

    // The rotating lamp casts a soft beam across the night sky.
    vec2 lampPoint = vec2(.589, .226) * printSize;
    vec2 fromLamp = printPoint - lampPoint;
    float sweep = cos(time * .22);
    float facing = .5 + .5 * sign(fromLamp.x) * sweep;
    float beamWidth = 5. + abs(fromLamp.x) * .065;
    float beamHeight = fromLamp.y + abs(fromLamp.x) * .035;
    float beam = exp(-pow(beamHeight / beamWidth, 2.))
      * exp(-abs(fromLamp.x) / 310.)
      * smoothstep(8., 32., abs(fromLamp.x))
      * (1. - foreground) * (1. - day);
    color = mix(color, vec3(.82, .75, .57), beam * facing * .32);

    float lampDistance = length(fromLamp);
    float lamp = (1. - smoothstep(3., 7., lampDistance)) * (1. - day);
    float halo = exp(-lampDistance / 22.) * (1. - day);
    color = mix(color, vec3(1., .78, .43), lamp * .85 + halo * .28);
  }
  if (sunHour >= 0. && uv.y > .44 && uv.y < .52) {
    bool sunVisible = sunHour >= 6. && sunHour < 18.;
    float elapsedHours = sunVisible ? sunHour - 6. : (sunHour >= 18. ? sunHour - 18. : sunHour + 6.);
    float progress = elapsedHours / 12.;
    float sourceX = skyPath(progress).x;
    float drift = .012 * sin(time * .28);
    float glints = surfaceGlint(uv, vec2(sourceX - .055 + drift, .474), vec2(.018, .0018)) * .55
      + surfaceGlint(uv, vec2(sourceX + .022 - drift * .7, .489), vec2(.026, .0015)) * .75
      + surfaceGlint(uv, vec2(sourceX + .085 + drift * .5, .501), vec2(.012, .0018)) * .45;
    float skyTime = smoothstep(0., .06, progress) * (1. - smoothstep(.94, 1., progress));
    float visibleWater = smoothstep(.18, .27, color.b) * smoothstep(.19, .30, color.g);
    vec3 glintColor = sunVisible ? vec3(.95, .84, .64) : vec3(.55, .66, .73);
    float strength = sunVisible ? .22 : .09;
    color = mix(color, glintColor, min(glints, 1.) * skyTime * visibleWater * strength);
  }
  if (sunHour >= 0.) {
    // A lingering glow marks where the sun is about to rise or has just set.
    float dawn = smoothstep(4.9, 5.8, sunHour) * (1. - smoothstep(6.38, 6.7, sunHour));
    float dusk = smoothstep(17.1, 17.55, sunHour) * (1. - smoothstep(18.25, 19.15, sunHour));
    // Use the same path and ridges as the sun disc: the glow peaks when
    // the mountain crosses its center and softens as the disc clears it.
    float sunProgress = clamp((sunHour - 6.) / 12., 0., 1.);
    vec2 sunPosition = skyPath(sunProgress) * printSize;
    float sunRidge = sunProgress < .5
      ? mix(112., 207., smoothstep(135., 270., sunPosition.x))
      : mix(202., 173., smoothstep(1190., 1400., sunPosition.x))
        + 18. * smoothstep(1400., 1600., sunPosition.x);
    float crossing = (sunPosition.y - sunRidge) / 20.;
    float intensity = .45 + .55 * exp(-crossing * crossing);
    vec2 glowCenter = dawn > dusk ? vec2(.10, .23) : vec2(.90, .32);
    vec2 distance = (uv - glowCenter) / vec2(.25, .16);
    float glow = exp(-dot(distance, distance) * 1.25) * max(dawn, dusk) * intensity;
    float leftRidge = mix(112., 207., smoothstep(135., 270., printPoint.x));
    float rightRidge = mix(202., 173., smoothstep(1190., 1400., printPoint.x))
      + 18. * smoothstep(1400., 1600., printPoint.x);
    float sky = mix(1. - smoothstep(leftRidge - 1., leftRidge + 1., printPoint.y), 1., smoothstep(250., 300., printPoint.x))
      * mix(1., 1. - smoothstep(rightRidge - 1., rightRidge + 1., printPoint.y), smoothstep(1180., 1240., printPoint.x))
      * (1. - smoothstep(.36, .43, uv.y)) * (1. - foreground);
    color = mix(color, vec3(.98, .48, .23), glow * sky * .64);
  }
  if (sunHour >= 0.) {
    // A few steady points of starlight fade in with the night sky.
    float night = 1. - daytime(sunHour);
    if (night > .01 && printPoint.y < 145.) {
      float starlight = 0.;
      for (int i = 0; i < 11; i++) {
        starlight += starPoint(printPoint, stars[i].xy, mix(1.3, 2.1, stars[i].z))
          * mix(.38, .70, stars[i].z);
      }
      float sky = (1. - foreground) * (1. - smoothstep(110., 145., printPoint.y));
      color = mix(color, vec3(.92, .94, .90), min(starlight, 1.) * night * sky * .95);
    }
  }
  if (sunHour >= 0. && (sunHour >= 18. || sunHour < 6.)) {
    // The illustrative moon follows a twelve-hour path on the visitor's clock.
    float nightHour = sunHour >= 18. ? sunHour - 18. : sunHour + 6.;
    float progress = nightHour / 12.;
    vec2 moonCenter = skyPath(progress);
    float distanceToMoon = length((uv - moonCenter) * printSize);
    float leftRidge = mix(112., 207., smoothstep(135., 270., printPoint.x));
    float rightRidge = mix(202., 173., smoothstep(1190., 1400., printPoint.x))
      + 18. * smoothstep(1400., 1600., printPoint.x);
    float leftMask = 1. - smoothstep(leftRidge - 1., leftRidge + 1., printPoint.y);
    float rightMask = 1. - smoothstep(rightRidge - 1., rightRidge + 1., printPoint.y);
    float ridgeVisibility = mix(leftMask, 1., smoothstep(250., 300., printPoint.x))
      * mix(1., rightMask, smoothstep(1180., 1240., printPoint.x));
    float night = 1. - daytime(sunHour);
    float moonlight = smoothstep(0., .035, progress) * (1. - smoothstep(.965, 1., progress));
    float sky = (1. - smoothstep(.36, .43, uv.y)) * ridgeVisibility * (1. - foreground);
    float halo = exp(-distanceToMoon / 100.) * sky * night * moonlight;
    color = mix(color, vec3(.53, .66, .78), halo * .22);

    float depth = max(uv.y - .505, 0.);
    float refraction = depth * .55 / max(.505 - moonCenter.y, .08);
    float entryX = (uv.x + refraction * moonCenter.x) / (1. + refraction);
    float rayX = entryX + .0025 * sin(time * .22);
    float rays = lightShaft(rayX, .145, .029) * .45
      + lightShaft(rayX, .325, .022) * .55
      + lightShaft(rayX, .535, .035) * .50
      + lightShaft(rayX, .735, .026) * .50
      + lightShaft(rayX, .94, .031) * .40;
    vec2 entry = vec2(entryX, .49);
    float shadow = max(blocksSun(moonCenter, entry, vec2(.589, .27), .012),
      max(blocksSun(moonCenter, entry, vec2(.72, .145), .072) * .8,
        blocksSun(moonCenter, entry, vec2(.69, .27), .013)));
    float depthFade = smoothstep(.505, .54, uv.y) * (1. - smoothstep(.66, .87, uv.y));
    float openWater = smoothstep(.005, .04, color.b - color.r) * smoothstep(.08, .20, color.g);
    float light = night * moonlight * depthFade * openWater * min(rays, 1.) * .16 * (1. - shadow * .88);
    color = mix(color, vec3(.49, .64, .72), light);

    float moonDisc = (1. - smoothstep(14., 16., distanceToMoon)) * ridgeVisibility * (1. - foreground);
    // A faint surface texture lets the moon remain legible at the banner's small size.
    float detail = .035 * sin(printPoint.x * .19) * sin(printPoint.y * .14);
    color = mix(color, vec3(.91, .93, .87) - detail, moonDisc * .96);
  }
  color = mix(color, visibleSunColor, sunDisc * .96);
  gl_FragColor = vec4(color, 1.0);
}`;

export function localSceneHour() {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

/** Animates the water and marine life in the split-view illustration. */
export function attachWaterRipples(still: HTMLImageElement, canvas: HTMLCanvasElement, onState: (playing: boolean, available: boolean) => void, getSunHour?: () => number) {
  const sceneSurface = canvas.parentElement;
  const surface = canvas.closest<HTMLElement>(".water-frame");
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: false });
  if (!surface || !sceneSurface || !gl) { onState(false, false); return; }

  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const atlasTexture = gl.createTexture();
  const extensionTexture = gl.createTexture();
  const release = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteTexture(atlasTexture);
    gl.deleteTexture(extensionTexture);
  };
  const fail = () => { release(); onState(false, false); };
  if (!program || !buffer || !texture || !atlasTexture || !extensionTexture) { fail(); return; }
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
  const stars = new Float32Array(11 * 3);
  for (let i = 0; i < 11; i++) {
    stars[i * 3] = 30 + Math.random() * 1540;
    stars[i * 3 + 1] = 12 + Math.random() * 110;
    stars[i * 3 + 2] = Math.random();
  }
  gl.uniform3fv(gl.getUniformLocation(program, "stars[0]"), stars);
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
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, extensionTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "extension"), 2);
  const wildlife = createWildlifeDraw(gl, program, vertices.length / 2 - 6);
  const atlasImage = new Image();
  const extensionImage = new Image();
  const cropLocation = gl.getUniformLocation(program, "crop");
  const viewHeightLocation = gl.getUniformLocation(program, "viewHeight");
  const timeLocation = gl.getUniformLocation(program, "time");
  const sunLocation = gl.getUniformLocation(program, "sunHour");
  const rippleLocation = gl.getUniformLocation(program, "ripples[0]");
  const waves = new Float32Array(32);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 600px)");
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
  let viewHeight = 1;
  let extensionReady = false;
  let extensionLoading: Promise<void> | undefined;
  let cursor: { x: number; y: number } | null = null;

  function leaveBanner() {
    cursor = null;
    wildlife.leaveGulls();
  }

  function needsExtension() {
    return mobile.matches || sceneSurface !== surface;
  }

  function resize() {
    const width = sceneSurface!.clientWidth;
    const height = sceneSurface!.clientHeight;
    const aspect = width / Math.max(height, 1);
    const originalAspect = still.naturalWidth && still.naturalHeight ? still.naturalWidth / still.naturalHeight : 2.5;
    viewHeight = extensionReady ? Math.max(1, Math.min(45 / 32, originalAspect / Math.max(aspect, 0.01))) : 1;
    const sourceAspect = originalAspect / viewHeight;
    cropX = Math.min(1, aspect / sourceAspect);
    cropY = Math.min(1, sourceAspect / aspect);
    const scale = Math.min(devicePixelRatio || 1, 2, 1600 / Math.max(width, 1));
    // Reuse the backing buffer across nearby sizes during the CSS transition.
    const bufferWidth = Math.max(64, Math.ceil(width * scale / 64) * 64);
    const bufferHeight = Math.max(32, Math.ceil(height * scale / 32) * 32);
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth;
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    if (ready && !unavailable) {
      if (needsExtension() && !extensionReady) {
        canvas.style.opacity = "0";
        stop();
        void loadExtension().catch(contextLost);
      } else {
        render();
      }
    }
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    nextDraw = 0;
    leaveBanner();
  }
  function allowed() {
    return visible && !document.hidden && !motion.matches && !connection?.saveData && !unavailable && ready && (!needsExtension() || extensionReady);
  }
  function render() {
    const rect = sceneSurface!.getBoundingClientRect();
    const frameRect = surface!.getBoundingClientRect();
    const xScale = canvas.width / Math.max(rect.width, 1);
    const yScale = canvas.height / Math.max(rect.height, 1);
    const left = Math.max(0, Math.floor((frameRect.left - rect.left) * xScale));
    const right = Math.min(canvas.width, Math.ceil((frameRect.right - rect.left) * xScale));
    const top = Math.max(0, Math.floor((frameRect.top - rect.top) * yScale));
    const bottom = Math.min(canvas.height, Math.ceil((frameRect.bottom - rect.top) * yScale));
    gl!.enable(gl!.SCISSOR_TEST);
    gl!.scissor(left, canvas.height - bottom, Math.max(0, right - left), Math.max(0, bottom - top));
    gl!.uniform2f(cropLocation, cropX, cropY);
    gl!.uniform1f(viewHeightLocation, viewHeight);
    gl!.uniform1f(timeLocation, elapsed);
    gl!.uniform1f(sunLocation, getSunHour ? getSunHour() : -1);
    gl!.uniform4fv(rippleLocation, waves);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    wildlife.draw(elapsed, cropX, mobile.matches);
    if (cursor) {
      const screenX = (cursor.x - rect.left) / rect.width;
      const screenY = (cursor.y - rect.top) / rect.height;
      if (screenX >= 0 && screenX <= 1 && screenY >= 0 && screenY <= 1) {
        const reach = 24; // CSS pixels beyond the wings, at either banner size.
        wildlife.approachGulls(
          ((screenX - 0.5) * cropX + 0.5) * 1600,
          ((screenY - 0.5) * cropY * viewHeight + 0.5) * 640,
          reach * cropX * 1600 / rect.width,
          reach * cropY * viewHeight * 640 / rect.height,
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
    const rect = sceneSurface!.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * cropX + 0.5;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * cropY * viewHeight + 0.5;
    if (pressed) {
      const padding = event.pointerType === "touch" ? (mobile.matches ? 14 : 7) : 2;
      if (wildlife.startle(x * 1600, y * 640, padding * cropX * 1600 / rect.width, padding * cropY * viewHeight * 640 / rect.height, event.pointerType === "touch")) return;
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
  }
  function loadExtension() {
    if (extensionReady) return Promise.resolve();
    if (!extensionLoading) {
      extensionImage.src = "/assets/water/inlet-mobile.webp";
      extensionLoading = extensionImage.decode().then(() => {
        if (disposed || unavailable) return;
        upload(extensionImage, gl!.TEXTURE2, extensionTexture!);
        extensionReady = true;
        resize();
        sync();
      });
    }
    return extensionLoading;
  }
  function mobileChanged() {
    if (needsExtension() && !extensionReady) {
      canvas.style.opacity = "0";
      stop();
      void loadExtension().catch(contextLost);
    } else {
      resize();
      sync();
    }
  }
  async function load() {
    try {
      // Dimensions can be available before the pixels on a cached reload.
      await Promise.all([still.decode(), atlasImage.decode()]);
      if (disposed || unavailable) return;
      upload(still, gl!.TEXTURE0, texture!);
      upload(atlasImage, gl!.TEXTURE1, atlasTexture!);
      if (needsExtension()) await loadExtension();
      if (disposed || unavailable) return;
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
  sizeObserver.observe(sceneSurface);
  visibilityObserver.observe(surface);
  surface.addEventListener("pointermove", disturb, { passive: true });
  surface.addEventListener("pointerdown", disturb, { passive: true });
  surface.addEventListener("pointerleave", leaveBanner);
  surface.addEventListener("pointercancel", leaveBanner);
  still.addEventListener("error", contextLost);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  mobile.addEventListener("change", mobileChanged);
  canvas.addEventListener("webglcontextlost", contextLost);
  atlasImage.addEventListener("error", contextLost);
  atlasImage.src = wildlifeAtlas.src;
  void load();
  return {
    refresh() { if (ready && !unavailable && (!needsExtension() || extensionReady)) render(); },
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
      mobile.removeEventListener("change", mobileChanged);
      canvas.removeEventListener("webglcontextlost", contextLost);
      atlasImage.removeEventListener("error", contextLost);
      release();
    },
  };
}
