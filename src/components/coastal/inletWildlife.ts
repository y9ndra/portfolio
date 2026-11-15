// Positions and sizes use the print's 1600 × 640 coordinate system.
const fish = [
  [0, 14, 0.91], [90, -14, 0.78], [135, 5, 0.80], [190, -24, 0.68],
  [248, 8, 0.53], [279, -36, 0.58], [332, -4, 0.43], [348, -13, 0.35],
  [430, 16, 0.72], [550, -15, 0.62],
];
const deeperFishLanes = [0, 0, 0, 0, 0, 0, 0, 0, 180, 220];
const foregroundFishCount = 2;

const respawnDelay = 2;
const escapeWingSpeed = 2.7;
const escapeWingbeats = 4;
const escapeDuration = 3.1 / escapeWingSpeed;
const escapePeakSpeed = 3.5; // Additional speed, in multiples of cruising speed.
const escapeDistance = escapePeakSpeed * escapeDuration / 2;
const wingSettleDuration = 0.8;

// Ease each burst at both ends so the wings leave and return smoothly.
function gullStroke(time: number, beats = 3) {
  const progress = Math.min((time % 6.4) / 3.1, 1);
  const ramp = 0.12;
  let distance = progress - ramp / 2;
  if (progress < ramp) distance = progress * progress / (2 * ramp);
  if (progress > 1 - ramp) distance = 1 - ramp - (1 - progress) ** 2 / (2 * ramp);
  return beats * distance / (1 - ramp);
}

export function createWildlifeDraw(gl: WebGLRenderingContext, program: WebGLProgram, vertexCount: number) {
  const kind = gl.getUniformLocation(program, "spriteKind");
  const region = gl.getUniformLocation(program, "spriteRegion");
  const pose = gl.getUniformLocation(program, "spritePose");
  const bend = gl.getUniformLocation(program, "spriteBend");
  const foreground = gl.getUniformLocation(program, "fishForeground");

  const firstGull = Math.floor(Math.random() * 2);
  const animals = Array.from({ length: fish.length + 2 }, (_, i) => ({
    x: 0, y: 0, radiusX: 0, radiusY: 0, extraTime: 0, boost: 0, routeX: 0, facing: 1,
    tailCycle: null as number | null, tailSoundsRemaining: 0,
    enterAt: i < fish.length || i === fish.length + firstGull ? 0 : 1.5 + Math.random() * 2,
  }));
  const flights = Array.from({ length: 2 }, () => ({
    started: -Infinity, extraTravel: 0, direction: 1, speed: 35, altitude: 80, wingPhase: -1,
    phaseOffset: 0, startBasePhase: 0, settleStarted: -Infinity, settleFrom: 0, settleTo: 0,
  }));
  let lastDraw = 0;
  let hoveredGull = -1;
  let pendingTouchFish = -1;

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
    const bird = index - fish.length;
    const flight = flights[bird];
    if (flight.started !== -Infinity) return false;
    flight.started = lastDraw;
    flight.settleStarted = -Infinity;
    flight.startBasePhase = gullStroke(lastDraw * (1 + bird * 0.06) + bird * 2.3);
    return true;
  }

  function approachGulls(x: number, y: number, paddingX: number, paddingY: number) {
    const nearest = nearestAnimal(x, y, paddingX, paddingY, fish.length, animals.length);
    const started = nearest >= 0 && nearest !== hoveredGull && startleGull(nearest);
    hoveredGull = nearest;
    return started;
  }

  function startle(x: number, y: number, paddingX: number, paddingY: number, includeGulls: boolean, deferFishSound = false) {
    const nearest = nearestAnimal(x, y, paddingX, paddingY, 0, includeGulls ? animals.length : fish.length);
    if (nearest < 0) return null;
    if (nearest < fish.length) {
      animals[nearest].boost = 5;
      animals[nearest].tailSoundsRemaining = deferFishSound ? 0 : 4;
      if (deferFishSound) pendingTouchFish = nearest;
      return "fish" as const;
    }
    return startleGull(nearest) ? "gull" as const : null;
  }

  function finishTouchFish(playSound: boolean) {
    if (pendingTouchFish >= 0 && playSound && animals[pendingTouchFish].boost > .1) {
      animals[pendingTouchFish].tailSoundsRemaining = 4;
    }
    pendingTouchFish = -1;
  }

  function draw(sceneTime: number, cropX: number, mobile: boolean, onGullFlap?: () => void, onFishTail?: () => void) {
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
      // Keep smaller fish farther away while making the foreground easier to see on phones.
      const mobileScale = mobile ? 1.2 + 0.25 * (size - 0.35) / (0.91 - 0.35) : 1;
      const depth = deeperFishLanes[i];
      const foregroundScale = 1 + 0.35 * depth / 245;
      const extraStep = animal.boost * decayTime * (1 - decay);
      animal.boost *= decay;
      animal.extraTime += extraStep;
      const time = sceneTime + animal.extraTime;
      // Choose the next entrance only once the entire sprite clears the visible crop.
      const margin = 70 * size * mobileScale * foregroundScale * 1.05 + 9;
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
        animal.tailCycle = null;
        animal.tailSoundsRemaining = 0;
        continue;
      }
      const facing = animal.facing; // The fish in the print faces left.
      const x = animal.routeX + 7 * Math.sin(time * 0.59 + i);
      const y = 414 + lane + depth + 7 * facing + 4 * Math.sin(time * 0.68 + i * 1.2);
      const scale = size * mobileScale * foregroundScale * (1 + facing * 0.05);
      animal.x = x;
      animal.y = y;
      animal.radiusX = 68 * scale;
      animal.radiusY = 20 * scale;
      gl.uniform4f(pose, x, y, scale * facing, scale);
      const tailBend = time * (8.1 + i * 0.42) + i * 1.7;
      const tailCycle = Math.floor((tailBend - 2.1) / (Math.PI * 2));
      if (animal.tailSoundsRemaining > 0 && animal.tailCycle !== null && tailCycle > animal.tailCycle) {
        animal.tailSoundsRemaining--;
        onFishTail?.();
      }
      animal.tailCycle = tailCycle;
      gl.uniform2f(bend, tailBend, 0);
      gl.uniform1f(foreground, i >= fish.length - foregroundFishCount ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 6, vertexCount);
    }

    gl.uniform1i(kind, 2);
    for (let i = 0; i < 2; i++) {
      const animal = animals[fish.length + i];
      const flight = flights[i];
      const scale = (i === 0 ? 1.12 : 0.84) * (mobile ? (i === 0 ? 1.4 : 1.3) : 1);
      const left = 800 * (1 - cropX) - 42 * scale;
      const right = 1600 - left;
      if (sceneTime < animal.enterAt) continue;
      if (!animal.radiusX) {
        flight.direction = Math.random() < 0.5 ? 1 : -1;
        flight.speed = 30 + Math.random() * 10;
        flight.altitude = 65 + Math.random() * 50;
        animal.x = flight.direction === 1 ? left : right;
      }
      let step = dt;
      const baseStroke = gullStroke(sceneTime * (1 + i * 0.06) + i * 2.3);
      const startled = flight.started !== -Infinity;
      if (!startled && flight.settleStarted !== -Infinity) {
        const progress = Math.min((sceneTime - flight.settleStarted) / wingSettleDuration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        const settlingStroke = flight.settleFrom + (flight.settleTo - flight.settleFrom) * eased;
        flight.phaseOffset = settlingStroke - baseStroke;
        if (progress === 1) {
          // Whole rotations do not change the pose, but keep the phase bounded.
          flight.phaseOffset = 0;
          flight.settleStarted = -Infinity;
        }
      }
      let stroke = baseStroke + flight.phaseOffset;
      if (startled) {
        const age = sceneTime - flight.started;
        // Keep the normal motion gentle enough for four or five total downstrokes.
        const baseAdvance = (baseStroke - flight.startBasePhase + 3) % 3;
        stroke = flight.startBasePhase + flight.phaseOffset + baseAdvance * .7 +
          gullStroke(Math.min(age * escapeWingSpeed, 3.1), escapeWingbeats);
        const progress = Math.min(1, Math.max(0, age / escapeDuration));
        // The speed pulse begins and ends with the wingbeat burst.
        const extraTravel = escapeDistance * (progress - Math.sin(2 * Math.PI * progress) / (2 * Math.PI));
        step += extraTravel - flight.extraTravel;
        flight.extraTravel = extraTravel;
        if (progress === 1) {
          // Finish in the forward direction at the pose the normal flight will use.
          const target = gullStroke((sceneTime + wingSettleDuration) * (1 + i * 0.06) + i * 2.3);
          flight.settleFrom = stroke;
          flight.settleTo = stroke + ((target - stroke) % 1 + 1) % 1;
          flight.phaseOffset = stroke - baseStroke;
          flight.settleStarted = sceneTime;
          flight.extraTravel = 0;
          flight.started = -Infinity;
        }
      }
      animal.x += flight.direction * flight.speed * step;
      if ((flight.direction === 1 && animal.x > right) || (flight.direction === -1 && animal.x < left)) {
        animal.enterAt = sceneTime + respawnDelay;
        flight.started = -Infinity;
        flight.extraTravel = 0;
        animal.radiusX = 0;
        flight.wingPhase = -1;
        flight.phaseOffset = 0;
        flight.settleStarted = -Infinity;
        if (hoveredGull === fish.length + i) hoveredGull = -1;
        continue;
      }
      // A narrowing crop can move the entry edge past an incoming bird.
      animal.x = Math.max(left, Math.min(right, animal.x));
      const wingPhase = ((stroke % 1) + 1) % 1;
      if (startled && flight.wingPhase >= 0) {
        const advance = (wingPhase - flight.wingPhase + 1) % 1;
        const sinceDownstroke = (wingPhase - 0.31 + 1) % 1;
        if (advance > 0 && advance < .5 && sinceDownstroke < advance) onGullFlap?.();
      }
      flight.wingPhase = wingPhase;
      const frame = Math.round(wingPhase * 48) % 48;
      const lift = Math.sin(stroke * Math.PI * 2);
      const y = flight.altitude + 12 * Math.sin(animal.x / 184 + i) - 1.35 * lift;
      animal.y = y;
      animal.radiusX = 39 * scale;
      animal.radiusY = 31 * scale;
      gl.uniform4f(pose, animal.x, y, flight.direction * scale, scale);
      gl.uniform4f(region, (frame % 6) * 84, 272 + Math.floor(frame / 6) * 72, 84, 72);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.disable(gl.BLEND);
    gl.uniform1i(kind, 0);
  }
  return { draw, startle, finishTouchFish, approachGulls, leaveGulls() { hoveredGull = -1; } };
}
