// Both bodies follow the banner's existing clock and arc. The sky also receives
// scattered sunlight before the disc clears a ridge and after it sets.
const lightVaryings = `
varying mediump vec4 sunLight, moonLight; // xy position, elevation, exposed fraction
varying mediump float skyDay, skyTwilight, evening;
varying mediump vec3 fishDetail; // Original atlas coordinates within the fish, plus its marking.
`;

const vertex = `${lightVaryings}
vec4 lightTrack(float progress, float radius) {
  vec2 pos = skyPath(clamp(progress, 0., 1.));
  float x = pos.x * 1600.;
  float ridge = progress < .5 ? mix(112., 207., smoothstep(135., 270., x))
    : mix(202., 173., smoothstep(1190., 1400., x)) + 18. * smoothstep(1400., 1600., x);
  float clear = smoothstep(-radius, radius, ridge - pos.y * 640.);
  return vec4(pos, sin(clamp(progress, 0., 1.) * 3.14159265), clear);
}

void placeLights(float hour) {
  sunLight = lightTrack((hour - 6.) / 12., 19.);
  moonLight = lightTrack(mod(hour + 6., 24.) / 12., 15.);
  float aboveRidge = min(hour - 6.23, 17.63 - hour);
  skyDay = smoothstep(-.90, 1.45, aboveRidge);
  skyTwilight = smoothstep(-1.28, -.12, aboveRidge) * (1. - smoothstep(.10, 2.05, aboveRidge));
  evening = smoothstep(12., 15., hour);
}
`;

const fragment = `${lightVaryings}
float inkValue(vec3 ink) { return dot(ink, vec3(.299, .587, .114)); }
// The unlit print has green-grey sky and cream clouds. Account for the
// changing paper colour towards the horizon before separating the cloud ink.
vec2 clearPaper(float y) {
  float upper = smoothstep(-.22, .015, y);
  float lower = smoothstep(.12, .30, y);
  return vec2(.60 + .135 * upper + .16 * lower, -.070 + .043 * upper + .057 * lower);
}

float cloudInk(vec3 ink, float y) {
  vec2 paper = clearPaper(y);
  float excess = ink.r - paper.x + .75 * (ink.r - ink.g - paper.y);
  return smoothstep(.018, .118, excess);
}

uniform sampler2D skyMask;
float skyCoverage(vec2 p) {
  // The mask covers the top 400 rows of the 1600 x 900 extended print.
  // Sample the wind-displaced print coordinates so the mask follows the pines.
  return texture2D(skyMask, clamp(vec2(p.x, (p.y * 640. + 130.) / 400.), 0., 1.)).r;
}

float reach(float x, float lightX) {
  float dx = x - lightX;
  return 1. / (1. + 6.5 * dx * dx);
}

vec3 sunlightColor() {
  return mix(vec3(1., .97, .84), mix(vec3(1., .76, .54), vec3(1., .63, .38), evening), skyTwilight);
}

vec3 fishInk(vec4 fish, vec3 detail) {
  float silver = max(0., -detail.z);
  float gold = max(0., detail.z);
  float value = inkValue(fish.rgb);
  vec3 pigment = mix(fish.rgb, value * vec3(.89, 1.04, 1.13), silver * .84);
  pigment = mix(pigment, value * vec3(1.17, 1.025, .74), gold * .78);
  // Four curved parr marks stay on the upper flank as the body bends.
  vec2 uv = detail.xy;
  float flank = smoothstep(.20, .33, uv.x) * (1. - smoothstep(.65, .76, uv.x))
    * smoothstep(.13, .31, uv.y) * (1. - smoothstep(.47, .61, uv.y));
  float bar = .5 + .5 * cos((uv.x + .11 * (uv.y - .45) * (uv.y - .45)) * 56.);
  return pigment * (1. - gold * flank * smoothstep(.32, .9, bar) * .26);
}

vec3 wildlifeLight(vec2 p, bool submerged) {
  float solar = reach(p.x, sunLight.x) * sunLight.w;
  float lunar = reach(p.x, moonLight.x) * moonLight.w;
  vec3 shade = submerged ? vec3(.17, .31, .40) : vec3(.26, .34, .46);
  vec3 lit = mix(shade, vec3(.83, .90, .90), skyDay);
  lit += solar * sunlightColor() * mix(.10, .20, skyTwilight);
  lit += lunar * (1. - skyDay) * vec3(.07, .10, .13);
  return lit;
}

vec3 inletSky(vec3 ink, vec2 p, vec2 uv) {
  float horizon = smoothstep(-.20, .40, p.y);
  float sunward = reach(p.x, sunLight.x);
  float moonward = reach(p.x, moonLight.x);
  vec3 night = mix(vec3(.038, .069, .125), vec3(.14, .215, .28), horizon);
  vec3 noon = mix(vec3(.47, .64, .73), vec3(.88, .87, .75), horizon);
  vec3 air = mix(night, noon, skyDay);
  float duskBand = sunward * exp(-3.7 * abs(p.y - sunLight.y));
  vec3 farSky = mix(vec3(.36, .45, .58), vec3(.75, .63, .68), horizon);
  vec3 warmSky = mix(farSky, sunlightColor(), duskBand);
  air = mix(air, warmSky, skyTwilight * .96);
  vec2 deltaSun = (uv - sunLight.xy) * vec2(2.5, 1.);
  vec2 deltaMoon = (uv - moonLight.xy) * vec2(2.5, 1.);
  float ds = length(deltaSun);
  float dm = length(deltaMoon);
  air += vec3(.14, .135, .09) * exp(-ds * 5.2) * sunLight.w;
  air += vec3(.14, .19, .225) * exp(-dm * 8.5) * moonLight.w * (1. - skyDay);
  // Retain the original paper variation in the clear sky and the cloud bodies.
  float paper = clearPaper(p.y).x;
  air += (ink.r - paper) * mix(.16, .37, skyDay);
  float cloud = cloudInk(ink, p.y);
  if (cloud > 0.) {
    vec2 emitter = skyDay + skyTwilight > moonLight.w ? sunLight.xy : moonLight.xy;
    vec2 ray = normalize(vec2((emitter.x - p.x) * 2.5, emitter.y - p.y) + vec2(.0001, 0.));
    vec2 edge = p + vec2(ray.x * .004, mix(ray.y, 1., skyTwilight) * .010);
    float rim = max(0., cloud - cloudInk(sceneInk(edge), edge.y));
    vec3 nightCloud = vec3(.115, .161, .214) + vec3(.12, .16, .19) * moonward * moonLight.w * (.34 + rim);
    vec3 dayCloud = mix(vec3(.66, .72, .74), vec3(.99, .95, .82), .38 + .47 * sunward + .15 * rim);
    vec3 bank = mix(nightCloud, dayCloud, skyDay);
    vec3 rose = mix(vec3(.96, .69, .64), vec3(.98, .56, .47), evening);
    vec3 twilightCloud = mix(vec3(.47, .46, .56), rose, .20 + .75 * sunward);
    twilightCloud = mix(twilightCloud, vec3(1., .85, .65), sunward * (.21 + .78 * rim));
    bank = mix(bank, twilightCloud, skyTwilight);
    air = mix(air, bank * (.57 + .53 * inkValue(ink)), cloud);
  }
  float starsVisible = (1. - skyDay) * (1. - skyTwilight) * (1. - cloud) * (1. - smoothstep(.15, .24, p.y));
  if (starsVisible > .025) {
    float starlight = 0.;
    for (int i = 0; i < 11; i++) {
      starlight += starPoint(uv * vec2(1600., 640.), stars[i].xy, mix(1.3, 2.1, stars[i].z)) * mix(.36, .72, stars[i].z);
    }
    air = mix(air, vec3(.89, .93, .95), min(starlight, 1.) * starsVisible);
  }
  float discTransmission = 1. - smoothstep(.10, .98, cloud) * .79;
  if (sunHour >= 6. && sunHour < 18.) {
    float disc = 1. - smoothstep(.027, .0305, ds);
    vec3 rimSun = mix(vec3(1., .965, .80), vec3(1., .77, .48), 1. - sunLight.w);
    air = mix(air, rimSun, disc * discTransmission);
  } else {
    float disc = 1. - smoothstep(.0215, .0245, dm);
    float detail = .025 * sin(uv.x * 303.) * sin(uv.y * 91.);
    air = mix(air, vec3(.92, .94, .91) - detail, disc * discTransmission);
  }
  return air;
}

vec3 shoreLight(vec3 ink, vec2 p) {
  float solar = sunLight.w * reach(p.x, sunLight.x);
  float lunar = moonLight.w * (1. - skyDay) * reach(p.x, moonLight.x);
  vec3 ambient = mix(vec3(.17, .235, .31), vec3(.77, .82, .85), skyDay);
  ambient += skyTwilight * vec3(.17, .103, .076);
  vec2 emitter = solar > lunar ? sunLight.xy : moonLight.xy;
  vec2 direction = normalize((emitter - p) * vec2(2.5, 1.) + vec2(.0001, 0.));
  // A short sample across the printed rock and bark picks out sunward facets.
  float relief = inkValue(ink) - inkValue(sceneInk(p - direction * vec2(.0028, .007), .6));
  float face = smoothstep(-.12, .13, relief);
  vec3 direct = solar * sunlightColor() * (.09 + .23 * face)
    + lunar * vec3(.12, .17, .22) * (.22 + .78 * face);
  return ink * (ambient + direct);
}

float waterAccess(vec2 lightPos, float entryX) {
  vec2 entry = vec2(entryX, .50);
  float tower = blocksSun(lightPos, entry, vec2(.589, .27), .013);
  float canopy = blocksSun(lightPos, entry, vec2(.72, .145), .071);
  float trunk = blocksSun(lightPos, entry, vec2(.69, .27), .012);
  return 1. - .80 * max(tower, max(.82 * canopy, trunk));
}

vec3 inletWater(vec3 ink, vec2 p) {
  bool solar = sunHour >= 6. && sunHour < 18.;
  vec4 body = solar ? sunLight : moonLight;
  float direct = solar ? body.w : body.w * (1. - skyDay);
  vec3 beamColor = solar ? sunlightColor() : vec3(.66, .81, .98);
  float d = max(0., p.y - .505);
  float depth = smoothstep(0., .57, d);
  float facing = reach(p.x, body.x);
  vec3 night = mix(vec3(.125, .24, .31), vec3(.14, .235, .295), depth);
  vec3 daylight = mix(vec3(.81, .91, .935), vec3(.66, .845, .91), depth);
  vec3 water = ink * mix(night, daylight, skyDay);
  // The sky can still colour the surface after the sun itself is hidden.
  water += ink * skyTwilight * reach(p.x, sunLight.x) * vec3(.27, .165, .108) * (1. - .84 * depth);
  if (direct <= 0.) return water;

  if (p.y < .536) {
    float surface = smoothstep(.424, .449, p.y) * (1. - smoothstep(.504, .536, p.y));
    float nearWave = smoothstep(.43, .516, p.y);
    float width = mix(.024, .089, nearWave) * mix(.81, 1.30, body.z);
    float crossTrack = (p.x - body.x) / width;
    float path = 1. / (1. + crossTrack * crossTrack);
    // The moving print determines which individual wave faces reflect light.
    float crest = smoothstep(.51, .90, inkValue(ink));
    float glint = surface * path * crest * direct * waterAccess(body.xy, p.x);
    water = mix(water, beamColor, glint * (solar ? .80 : .54));
    water += surface * crest * facing * direct * (solar ? .075 : .022);
  }

  if (d > 0.) {
    // Trace back along the refracted direction and read the actual animated
    // crest texture at entry. Broad swells focus wider shafts at greater depth.
    float bend = .47 * d / max(.505 - body.y, .10);
    float entry = (p.x + bend * body.x) / (1. + bend);
    float drift = .004 * sin(time * .37 + entry * 9.);
    float crestY = .477 + .006 * sin(entry * 11. - time * .95);
    float a = inkValue(sceneInk(vec2(entry + drift, crestY), 2.8 + depth));
    float b = inkValue(sceneInk(vec2(entry - .012, crestY + .017), 3.4 + depth));
    float focus = smoothstep(.46, .76, .65 * a + .35 * b);
    float access = waterAccess(body.xy, entry);
    float transmitted = direct * access * facing * smoothstep(0., .037, d) * exp(-d * (solar ? 3.3 : 8.));
    vec3 filtered = mix(beamColor, vec3(.34, .76, .83), .34 + .60 * depth);
    float open = smoothstep(.015, .105, min(ink.b, ink.g) - ink.r);
    water += filtered * transmitted * (.17 + .83 * focus) * (.23 + .77 * open) * (solar ? .205 : .057);
    // Pale sand and the ink highlights on the rocks receive a little focused light.
    water += ink * filtered * transmitted * focus * (1. - open) * (solar ? .23 : .062);
  }
  return water;
}

vec3 lightInlet(vec3 ink, vec2 p, vec2 uv) {
  float wet = smoothstep(.423, .45, p.y);
  if (wet >= 1.) return inletWater(ink, p);
  float sky = skyCoverage(p);
  if (sky >= 1.) return inletSky(ink, p, uv);
  vec3 land = shoreLight(ink, p);
  if (sky > 0.) land = mix(land, inletSky(ink, p, uv), sky);
  if (wet > 0.) land = mix(land, inletWater(ink, p), wet);
  return land;
}
`;

export const inletLighting = { vertex, fragment };
