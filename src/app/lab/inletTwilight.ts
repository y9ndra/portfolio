// Operates in the illustration's coordinates so the light follows the same
// clouds and wave crests when the mobile extension or a ripple moves them.
export const inletTwilight = `
#define INLET_ATMOSPHERE

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

float skyCoverage(vec3 ink, vec2 p) {
  // Use the ridge as a broad envelope and the ink to resolve individual needles.
  float ridge = .17 + .13 * smoothstep(.04, .21, p.x) + .10 * smoothstep(.33, .51, p.x)
    - .115 * smoothstep(.60, .87, p.x) + .03 * smoothstep(.89, 1., p.x);
  float skyline = 1. - smoothstep(ridge + .012, ridge + .035, p.y);
  vec2 paper = clearPaper(p.y);
  float skyInk = smoothstep(-.11, -.035, ink.r - paper.x + .65 * (ink.r - ink.g - paper.y));
  vec2 tower = p * vec2(1600., 640.);
  float towerWidth = mix(12., 23., smoothstep(145., 225., tower.y));
  float masonry = (1. - smoothstep(towerWidth - 1., towerWidth + 1., abs(tower.x - 943.)))
    * smoothstep(130., 138., tower.y);
  return skyline * skyInk * (1. - masonry);
}

float twilightStrength(float daylightHours) {
  return smoothstep(-1.35, -.18, daylightHours) * (1. - smoothstep(.16, 1.80, daylightHours));
}

void lightInletSun(inout float disc, inout vec3 tint, vec3 ink, vec2 p, float distanceToSun, float crossing) {
  float strength = twilightStrength(min(sunHour - 6.23, 17.63 - sunHour));
  if (strength <= 0. || distanceToSun > 20.) return;
  float edge = 1. - smoothstep(17.5, 19.5, distanceToSun);
  float transmission = 1. - .82 * cloudInk(ink, p.y);
  disc = mix(disc, edge * skyCoverage(ink, p) * transmission, strength);
  tint = mix(tint, mix(vec3(1., .97, .83), vec3(1., .88, .63), crossing), strength);
}

vec3 lightInlet(vec3 base, vec3 ink, vec3 surfaceMotion, vec2 p, float hour) {
  // The disc crosses the two painted ridges at different points on its arc.
  float daylightHours = min(hour - 6.23, 17.63 - hour);
  float strength = twilightStrength(daylightHours);
  if (strength <= 0.) return base;

  float progress = clamp((hour - 6.) / 12., 0., 1.);
  vec2 sun = skyPath(progress);
  float dx = p.x - sun.x;
  float facing = 1. / (1. + 5.8 * dx * dx);
  float afterglow = smoothstep(-1.12, -.12, daylightHours);
  float direct = smoothstep(-.14, .18, daylightHours);
  float luma = dot(ink, vec3(.299, .587, .114));
  float evening = step(12., hour);
  vec3 amber = mix(vec3(1., .78, .56), vec3(1., .68, .40), evening);

  // In the shade, retain the detail of the rocks, pines and kelp. Low-angle
  // skylight reaches the waterline first and loses its warmth with depth.
  float water = smoothstep(.425, .45, p.y);
  vec3 shade = mix(vec3(.48, .52, .64), vec3(.43, .66, .78), water);
  vec3 terrain = ink * mix(shade * .75, shade + .16, afterglow);
  float shallows = 1. - smoothstep(.48, .81, p.y);
  terrain += vec3(.17, .066, .019) * facing * afterglow * shallows * luma;

  if (p.y < .43) {
    float sky = skyCoverage(ink, p);
    if (sky > 0.) {
      float horizon = smoothstep(-.24, .41, p.y);
      vec3 zenith = mix(vec3(.31, .44, .57), vec3(.29, .34, .52), evening);
      vec3 farHaze = mix(vec3(.69, .66, .72), vec3(.70, .55, .63), evening);
      vec3 air = mix(zenith, farHaze, horizon);
      float airlight = facing * exp(-3.4 * abs(p.y - sun.y));
      air = mix(air, amber, airlight * (.54 + .42 * afterglow));
      vec2 haloOffset = (p - sun) * vec2(2.5, 1.);
      float aureole = exp(-length(haloOffset) * 9.);
      air = mix(air, mix(amber, vec3(1., .93, .74), direct), aureole * afterglow * .80);
      air *= .66 + .34 * afterglow;
      vec2 paper = clearPaper(p.y);
      air += (ink.r - paper.x) * .24;

      float density = cloudInk(ink, p.y);
      if (density > 0.) {
        // Sample towards the low sun. Its light catches the lower, sunward
        // edge of each cloud while the thicker bank retains a violet shadow.
        vec2 edge = p + vec2(sign(sun.x - p.x) * .004, .010);
        float rim = max(0., density - cloudInk(sceneInk(edge), edge.y));
        vec3 coolCloud = mix(vec3(.52, .54, .64), vec3(.53, .45, .56), evening);
        vec3 rose = mix(vec3(.94, .66, .62), vec3(.94, .54, .48), evening);
        vec3 bank = mix(coolCloud, rose, (.22 + .70 * facing) * afterglow);
        bank = mix(bank, mix(amber, vec3(1., .88, .70), .38), min(1., facing * (.27 + 1.15 * rim) * afterglow));
        bank *= (.70 + .30 * afterglow) * (.52 + .62 * luma);
        air = mix(air, bank, density);
      }
      terrain = mix(terrain, air, sky);
    }
  } else if (p.y < .54) {
    // Read highlights from the animated wave texture. Only facets under
    // the visible sun catch direct light, with gaps between successive crests.
    float depth = smoothstep(.432, .514, p.y);
    float surface = smoothstep(.429, .448, p.y) * (1. - smoothstep(.501, .529, p.y));
    float width = mix(.019, .088, depth);
    float path = exp(-dx * dx / (width * width));
    float crest = smoothstep(.48, .85, luma);
    terrain = mix(terrain, amber, surface * crest * facing * afterglow * .35);
    terrain = mix(terrain, vec3(1., .86, .62), surface * crest * path * direct * .90);
  }
  return mix(base, terrain + surfaceMotion * (.48 + .32 * afterglow), strength * .95);
}
`;
