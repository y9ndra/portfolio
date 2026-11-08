// Positions and sizes use the print's 1600 × 640 coordinate system.
const fish = [
  [0, 14, 0.91], [90, -14, 0.78], [135, 5, 0.80], [190, -24, 0.68],
  [248, 8, 0.53], [279, -36, 0.58], [332, -4, 0.43], [348, -13, 0.35],
];

const respawnDelay = 2;
const wingbeatLead = 0.56;
const escapeDuration = 1.45;
const escapePeakSpeed = 3.5; // Additional speed, in multiples of cruising speed.
const escapeDistance = escapePeakSpeed * escapeDuration / 2;

// Each burst contains three strokes followed by a glide. Ease the phase at
// both ends so the wings settle into (and leave) the extended pose smoothly.
function gullStroke(time: number) {
  const progress = Math.min((time % 6.4) / 3.1, 1);
  const ramp = 0.12;
  let distance = progress - ramp / 2;
  if (progress < ramp) distance = progress * progress / (2 * ramp);
  if (progress > 1 - ramp) distance = 1 - ramp - (1 - progress) ** 2 / (2 * ramp);
  return 3 * distance / (1 - ramp);
}

export function createWildlifeDraw(gl: WebGLRenderingContext, program: WebGLProgram, vertexCount: number) {
  const kind = gl.getUniformLocation(program, "spriteKind");
  const region = gl.getUniformLocation(program, "spriteRegion");
  const pose = gl.getUniformLocation(program, "spritePose");
  const bend = gl.getUniformLocation(program, "spriteBend");

  const firstGull = Math.floor(Math.random() * 2);
  const animals = Array.from({ length: fish.length + 2 }, (_, i) => ({
    x: 0, y: 0, radiusX: 0, radiusY: 0, extraTime: 0, boost: 0, routeX: 0, facing: 1,
    enterAt: i < fish.length || i === fish.length + firstGull ? 0 : 1.5 + Math.random() * 2,
  }));
  const flights = Array.from({ length: 2 }, () => ({
    started: -Infinity, extraTravel: 0, direction: 1, speed: 35, altitude: 80,
  }));
  let lastDraw = 0;
  let hoveredGull = -1;

  function nearestAnimal(x: number, y: number, paddingX: number, paddingY: number, first: number, end: number) {
    let nearest = -1;
    let best = 1;
    for (let i = first; i < end; i++) {
      const animal = animals[i];
      if (!animal.radiusX) continue;
      const dx = (x - animal.x) / (animal.radiusX + paddingX);
      const dy = (y - animal.y) / (animal.radiusY + paddingY);
      const distance = dx * dx + dy * dy;
      if (distance <= best) {
        best = distance;
        nearest = i;
      }
    }
    return nearest;
  }

  function startleGull(index: number) {
    const flight = flights[index - fish.length];
    if (flight.started === -Infinity) flight.started = lastDraw;
  }

  function approachGulls(x: number, y: number, paddingX: number, paddingY: number) {
    const nearest = nearestAnimal(x, y, paddingX, paddingY, fish.length, animals.length);
    if (nearest >= 0 && nearest !== hoveredGull) startleGull(nearest);
    hoveredGull = nearest;
  }

  function startle(x: number, y: number, paddingX: number, paddingY: number, includeGulls: boolean) {
    const nearest = nearestAnimal(x, y, paddingX, paddingY, 0, includeGulls ? animals.length : fish.length);
    if (nearest < 0) return false;
    if (nearest < fish.length) {
      animals[nearest].boost = 5;
    } else {
      startleGull(nearest);
    }
    return true;
  }

  function draw(sceneTime: number, cropX: number) {
    const decayTime = 0.7;
    const dt = sceneTime - lastDraw;
    const decay = Math.exp(-dt / decayTime);
    lastDraw = sceneTime;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(kind, 1);
    gl.uniform4f(region, 0, 216, 140, 49);
    for (let i = 0; i < fish.length; i++) {
      const animal = animals[i];
      if (sceneTime < animal.enterAt) continue;
      const [spacing, lane, size] = fish[i];
      const extraStep = animal.boost * decayTime * (1 - decay);
      animal.boost *= decay;
      animal.extraTime += extraStep;
      const time = sceneTime + animal.extraTime;
      // Choose the next entrance only once the entire sprite clears the visible crop.
      const margin = 70 * size * 1.05 + 9;
      const left = 800 * (1 - cropX) - margin;
      const right = 1600 - left;
      if (!animal.radiusX) {
        animal.routeX = animal.enterAt === 0
          ? 800 + (90 + spacing) * cropX
          : (animal.facing < 0 ? left : right);
      }
      animal.routeX -= animal.facing * 40 * (dt + extraStep);
      if (animal.routeX < left || animal.routeX > right) {
        animal.enterAt = sceneTime + respawnDelay;
        animal.facing = Math.random() < 0.5 ? -1 : 1;
        animal.radiusX = 0;
        animal.boost = 0;
        continue;
      }
      const facing = animal.facing; // The fish in the print faces left.
      const x = animal.routeX + 7 * Math.sin(time * 0.59 + i);
      const y = 414 + lane + 7 * facing + 4 * Math.sin(time * 0.68 + i * 1.2);
      const scale = size * (1 + facing * 0.05);
      animal.x = x;
      animal.y = y;
      animal.radiusX = 68 * scale;
      animal.radiusY = 20 * scale;
      gl.uniform4f(pose, x, y, scale * facing, scale);
      gl.uniform2f(bend, time * (8.1 + i * 0.42) + i * 1.7, 0);
      gl.drawArrays(gl.TRIANGLES, 6, vertexCount);
    }

    gl.disable(gl.BLEND);
    gl.uniform1i(kind, 0);
  }
  return { draw, startle, approachGulls, leaveGulls() { hoveredGull = -1; } };
}
