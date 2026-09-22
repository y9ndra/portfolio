"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { SKILLS } from "@/data/portfolio";

interface SkillItem {
  name: string;
  category: string;
}

const ALL_SKILLS: SkillItem[] = SKILLS.flatMap((cat) =>
  cat.items.map((name) => ({ name, category: cat.category }))
);

const CATEGORIES = [
  "All",
  ...SKILLS.map((cat) => cat.category),
];

export default function SkillsJar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simulation state
  const [isZeroG, setIsZeroG] = useState(false);
  const [isOrganized, setIsOrganized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const selectedCategoryRef = useRef("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // References to keep across renders
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<{ body: Matter.Body; name: string; category: string; width: number; height: number }[]>([]);
  const wallsRef = useRef<Matter.Body[]>([]);
  const draggedBodyRef = useRef<Matter.Body | null>(null);
  const hoveredBodyRef = useRef<Matter.Body | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasTriggeredDropRef = useRef(false);

  // Organize mode refs
  const isOrganizedRef = useRef(false);
  const targetPositionsRef = useRef<Map<Matter.Body, { x: number; y: number }>>(new Map());
  const setupBoundsRef = useRef<((forcedHeight?: number) => { width: number; height: number }) | null>(null);
  const isMobileRef = useRef(false);

  // Theme detection
  const isLightRef = useRef(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Sizing helper for responsive pill metrics across desktop and mobile
  const getPillDimensions = useCallback((containerWidth: number) => {
    const isMobile = containerWidth < 640;
    return {
      isMobile,
      pillHeight: isMobile ? 24 : 30,
      fontSize: isMobile ? 10.5 : 12,
      fontStr: isMobile
        ? '500 10.5px var(--font-mono, "JetBrains Mono", monospace)'
        : '500 12px var(--font-mono, "JetBrains Mono", monospace)',
      paddingX: isMobile ? 14 : 20,
      minWidth: isMobile ? 48 : 64,
      gapX: isMobile ? 5 : 6,
      gapY: isMobile ? 6 : 8,
      chamferRadius: isMobile ? 3 : 5,
      borderRadius: isMobile ? 4 : 5,
    };
  }, []);

  // Compute clean, recruiter-friendly horizontal grid positions grouped by Category
  const computeOrganizedPositions = useCallback((width: number, height: number) => {
    const targets = new Map<Matter.Body, { x: number; y: number }>();
    const dims = getPillDimensions(width);
    const sidePadding = dims.isMobile ? 10 : 16;
    const availableWidth = Math.max(260, width - sidePadding * 2);
    const gapX = dims.gapX;
    const gapY = dims.gapY;
    const pillH = dims.pillHeight;
    const rowHeight = pillH + gapY;

    // Categories in defined portfolio order
    const categories = SKILLS.map((c) => c.category);
    interface RowItem {
      body: Matter.Body;
      width: number;
    }
    const allRows: RowItem[][] = [];

    categories.forEach((cat) => {
      const catItems = bodiesRef.current.filter((b) => b.category === cat);
      let currentRow: RowItem[] = [];
      let currentRowWidth = 0;

      catItems.forEach((item) => {
        const itemW = item.width;
        const neededWidth = currentRow.length === 0 ? itemW : currentRowWidth + gapX + itemW;

        if (neededWidth <= availableWidth || currentRow.length === 0) {
          currentRow.push({ body: item.body, width: itemW });
          currentRowWidth = neededWidth;
        } else {
          allRows.push(currentRow);
          currentRow = [{ body: item.body, width: itemW }];
          currentRowWidth = itemW;
        }
      });

      if (currentRow.length > 0) {
        allRows.push(currentRow);
      }
    });

    // Center all rows vertically inside the glass chamber
    const totalContentHeight = allRows.length * rowHeight - gapY;
    const neededTotalHeight = totalContentHeight + (dims.isMobile ? 32 : 36);
    const startY = Math.max(pillH / 2 + 10, (height - totalContentHeight) / 2 + pillH / 2);

    allRows.forEach((row, rowIndex) => {
      const rowY = startY + rowIndex * rowHeight;
      const rowContentWidth = row.reduce((sum, item) => sum + item.width, 0) + (row.length - 1) * gapX;
      let startX = (width - rowContentWidth) / 2;

      row.forEach((item) => {
        const centerX = startX + item.width / 2;
        targets.set(item.body, { x: centerX, y: rowY });
        startX += item.width + gapX;
      });
    });

    return { targets, totalHeight: neededTotalHeight };
  }, [getPillDimensions]);

  // Helper to toggle organize collision mode: completely bypasses inter-body collisions
  const setOrganizeCollisionMode = useCallback((isOrganizedMode: boolean) => {
    if (engineRef.current) {
      // Clear all active collision pairs so Matter.js doesn't try to solve stale penetrations
      Matter.Pairs.clear(engineRef.current.pairs);
    }

    bodiesRef.current.forEach(({ body }) => {
      body.isSensor = isOrganizedMode;
      // Negative group (-1) in Matter.js guarantees Detector.canCollide returns false for all pills
      body.collisionFilter.group = isOrganizedMode ? -1 : 0;
      body.collisionFilter.mask = isOrganizedMode ? 0 : 0xFFFFFFFF;
      body.collisionFilter.category = 0x0001;
    });
  }, []);

  // Toggle Organize Mode: magnetically align skills into categorized horizontal rows
  const handleToggleOrganize = useCallback(() => {
    if (!engineRef.current || !canvasWrapRef.current) return;
    const nextOrganized = !isOrganized;
    setIsOrganized(nextOrganized);
    isOrganizedRef.current = nextOrganized;
    const wrap = canvasWrapRef.current;

    if (nextOrganized) {
      setIsZeroG(false);
      engineRef.current.gravity.y = 0;
      engineRef.current.gravity.x = 0;
      // Wipe stale collision pairs and disable inter-pill collision resolution
      setOrganizeCollisionMode(true);

      const w = wrap.clientWidth || 650;
      const isMobile = w < 640;
      const baseHeight = isMobile ? 360 : 350;
      const { targets, totalHeight } = computeOrganizedPositions(w, baseHeight);

      // Expand jar height if organized rows need more space (fully visible on mobile)
      if (totalHeight > baseHeight) {
        const expandedH = Math.ceil(totalHeight);
        wrap.style.height = `${expandedH}px`;
        setupBoundsRef.current?.(expandedH);
        const recomputed = computeOrganizedPositions(w, expandedH);
        targetPositionsRef.current = recomputed.targets;
      } else {
        targetPositionsRef.current = targets;
      }

      // Reset velocities for smooth transition
      bodiesRef.current.forEach(({ body }) => {
        Matter.Sleeping.set(body, false);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
      });
    } else {
      // Revert wrap height to CSS default
      wrap.style.height = "";
      setupBoundsRef.current?.();

      // Re-enable natural collision physics & gravity
      setOrganizeCollisionMode(false);
      engineRef.current.gravity.y = 0.95;
      engineRef.current.gravity.x = 0;
      bodiesRef.current.forEach(({ body }) => {
        Matter.Sleeping.set(body, false);
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2,
          y: Math.random() * 2,
        });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      });
    }
  }, [isOrganized, computeOrganizedPositions, setOrganizeCollisionMode]);

  // Drop/cascade all skills from the top inside the closed jar
  const dropSkills = useCallback(() => {
    if (!engineRef.current || !canvasWrapRef.current) return;
    setIsOrganized(false);
    isOrganizedRef.current = false;
    canvasWrapRef.current.style.height = "";
    setupBoundsRef.current?.();
    setIsZeroG(false);
    setOrganizeCollisionMode(false);
    engineRef.current.gravity.y = 0.95;
    engineRef.current.gravity.x = 0;

    const width = canvasWrapRef.current.clientWidth || 800;
    const isMobile = width < 640;
    const cols = Math.max(4, Math.floor(width / (isMobile ? 80 : 130)));

    bodiesRef.current.forEach(({ body }, index) => {
      Matter.Sleeping.set(body, false);
      const col = index % cols;
      const row = Math.floor(index / cols);
      const colWidth = width / (cols + 1);
      const startX = colWidth * (col + 1) + (Math.random() - 0.5) * 16;
      const startY = 16 + row * (isMobile ? 18 : 24) + (index % 3) * 6;

      Matter.Body.setPosition(body, { x: startX, y: startY });
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 3 + 2,
      });
      Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.25);
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
    });
  }, [setOrganizeCollisionMode]);

  // Zero Gravity Toggle
  const handleToggleZeroG = useCallback(() => {
    if (!engineRef.current) return;
    if (isOrganized) {
      setIsOrganized(false);
      isOrganizedRef.current = false;
      setOrganizeCollisionMode(false);
    }
    const nextZeroG = !isZeroG;
    setIsZeroG(nextZeroG);

    if (nextZeroG) {
      engineRef.current.gravity.y = 0;
      engineRef.current.gravity.x = 0;
      bodiesRef.current.forEach(({ body }) => {
        Matter.Sleeping.set(body, false);
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2.5,
          y: (Math.random() - 0.5) * 2.5,
        });
      });
    } else {
      engineRef.current.gravity.y = 0.95;
      engineRef.current.gravity.x = 0;
    }
  }, [isZeroG, isOrganized, setOrganizeCollisionMode]);

  // Category select handler (highlights matching pills in-place without re-dropping or restarting physics)
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    selectedCategoryRef.current = catId;
    setIsDropdownOpen(false);
  };

  // Initialize and run physics
  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // Check theme
    const checkTheme = () => {
      isLightRef.current = document.documentElement.getAttribute("data-theme") === "light";
    };
    checkTheme();

    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    // Create physics engine with high iteration counts to prevent body overlap/merging
    const engine = Engine.create({
      gravity: { x: 0, y: 0.95, scale: 0.001 },
      positionIterations: 10,
      velocityIterations: 8,
    });
    engineRef.current = engine;

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Canvas 2D context
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Setup boundaries for the contoured glass jar
    const setupBounds = (forcedHeight?: number) => {
      const rect = wrap.getBoundingClientRect();
      const width = rect.width;
      const isMobile = width < 640;
      const defaultH = isMobile ? 360 : 350;
      const height = forcedHeight || (rect.height > 100 ? rect.height : defaultH);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Remove old walls
      if (wallsRef.current.length > 0) {
        Composite.remove(engine.world, wallsRef.current);
        wallsRef.current = [];
      }

      // Walls
      const wallThickness = 120;
      const floorY = height - 10;
      const ceilingY = 0;

      // Floor (bottom)
      const floor = Bodies.rectangle(width / 2, floorY + wallThickness / 2, width * 2, wallThickness, {
        isStatic: true,
        restitution: 0.25,
        friction: 0.35,
      });

      // Ceiling (enclosed top right below the jar lid)
      const ceiling = Bodies.rectangle(width / 2, ceilingY - wallThickness / 2, width * 2, wallThickness, {
        isStatic: true,
        restitution: 0.25,
        friction: 0.35,
      });

      // Left Wall
      const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 4, {
        isStatic: true,
        restitution: 0.25,
        friction: 0.2,
      });

      // Right Wall
      const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 4, {
        isStatic: true,
        restitution: 0.25,
        friction: 0.2,
      });

      // Smooth rounded bottom corner bumpers (matches jar's rounded bottom curves)
      const cornerRadius = isMobile ? 22 : 38;
      const btmLeftCorner = Bodies.rectangle(cornerRadius * 0.35, height - cornerRadius * 0.35, cornerRadius * 1.5, 20, {
        isStatic: true,
        angle: Math.PI / 4,
        restitution: 0.25,
        friction: 0.2,
      });
      const btmRightCorner = Bodies.rectangle(width - cornerRadius * 0.35, height - cornerRadius * 0.35, cornerRadius * 1.5, 20, {
        isStatic: true,
        angle: -Math.PI / 4,
        restitution: 0.25,
        friction: 0.2,
      });

      wallsRef.current = [floor, ceiling, leftWall, rightWall, btmLeftCorner, btmRightCorner];
      Composite.add(engine.world, wallsRef.current);

      return { width, height };
    };

    setupBoundsRef.current = setupBounds;
    const { width: initWidth } = setupBounds();

    // Setup Mouse and MouseConstraint
    const mouse = Mouse.create(canvas);
    mouse.element.removeEventListener("wheel", (mouse as unknown as { mousewheel: (e: WheelEvent) => void }).mousewheel);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.25,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, "startdrag", (evt: any) => {
      draggedBodyRef.current = evt.body || mouseConstraint.body;
      if (canvas) canvas.style.cursor = "grabbing";
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      draggedBodyRef.current = null;
      if (canvas) canvas.style.cursor = "default";
    });

    // Create all 35 Skill Bodies using responsive metrics
    const dims = getPillDimensions(initWidth);
    isMobileRef.current = dims.isMobile;
    ctx.font = dims.fontStr;
    const cols = Math.max(4, Math.floor(initWidth / (dims.isMobile ? 80 : 130)));
    const items: { body: Matter.Body; name: string; category: string; width: number; height: number }[] = [];

    ALL_SKILLS.forEach((skill, index) => {
      const textMetrics = ctx.measureText(skill.name);
      const pillWidth = Math.max(dims.minWidth, Math.ceil(textMetrics.width + dims.paddingX));
      const pillHeight = dims.pillHeight;

      const col = index % cols;
      const row = Math.floor(index / cols);
      const colWidth = initWidth / (cols + 1);
      const startX = colWidth * (col + 1) + (Math.random() - 0.5) * 16;
      const startY = 16 + row * (dims.isMobile ? 18 : 24) + (index % 3) * 6;

      const body = Bodies.rectangle(startX, startY, pillWidth, pillHeight, {
        chamfer: { radius: dims.chamferRadius },
        restitution: 0.25,
        friction: 0.35,
        frictionAir: 0.015,
        density: 0.003,
        angle: (Math.random() - 0.5) * 0.25,
      });

      items.push({ body, name: skill.name, category: skill.category, width: pillWidth, height: pillHeight });
    });

    bodiesRef.current = items;
    Composite.add(
      engine.world,
      items.map((i) => i.body)
    );

    // Enforce jar enclosure boundaries and organize-mode positioning during physics updates
    Matter.Events.on(engine, "beforeUpdate", () => {
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;

      // When organized mode is active, smoothly lerp each pill directly to its categorized target
      if (isOrganizedRef.current) {
        const targets = targetPositionsRef.current;
        const lerpPos = 0.12;
        const lerpAngle = 0.15;

        bodiesRef.current.forEach(({ body }) => {
          if (draggedBodyRef.current === body) return; // User is dragging freely
          const target = targets.get(body);
          if (!target) return;

          const dx = target.x - body.position.x;
          const dy = target.y - body.position.y;
          const dAngle = -body.angle;

          // If within sub-pixel distance, snap and freeze velocity to prevent micro-vibrations
          if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2 && Math.abs(dAngle) < 0.005) {
            Matter.Body.setPosition(body, { x: target.x, y: target.y });
            Matter.Body.setAngle(body, 0);
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
          } else {
            Matter.Body.setPosition(body, {
              x: body.position.x + dx * lerpPos,
              y: body.position.y + dy * lerpPos,
            });
            Matter.Body.setAngle(body, body.angle + dAngle * lerpAngle);
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
          }
        });
        return; // Skip normal boundary collisions while organized
      }

      bodiesRef.current.forEach(({ body, width: pW }) => {
        const halfW = pW / 2;
        // Left / Right bounds
        if (body.position.x < halfW + 4) {
          Matter.Body.setPosition(body, { x: halfW + 4, y: body.position.y });
          if (body.velocity.x < 0) Matter.Body.setVelocity(body, { x: -body.velocity.x * 0.3, y: body.velocity.y });
        } else if (body.position.x > w - halfW - 4) {
          Matter.Body.setPosition(body, { x: w - halfW - 4, y: body.position.y });
          if (body.velocity.x > 0) Matter.Body.setVelocity(body, { x: -body.velocity.x * 0.3, y: body.velocity.y });
        }
        // Top Ceiling bound
        if (body.position.y < 16) {
          Matter.Body.setPosition(body, { x: body.position.x, y: 16 });
          if (body.velocity.y < 0) Matter.Body.setVelocity(body, { x: body.velocity.x, y: -body.velocity.y * 0.3 });
        }
        // Floor bound (active only during natural physics mode, never clamps organized targets)
        else if (body.position.y > h - 16 && !isOrganizedRef.current) {
          Matter.Body.setPosition(body, { x: body.position.x, y: h - 16 });
          if (body.velocity.y > 0) Matter.Body.setVelocity(body, { x: body.velocity.x, y: -body.velocity.y * 0.3 });
        }
      });

      // Strict safety guard: if no drag is actively happening, ensure mouse constraint is completely detached
      if (!draggedBodyRef.current && mouseConstraint) {
        if (mouseConstraint.constraint.bodyB || (mouseConstraint as any).body) {
          mouseConstraint.constraint.bodyB = null;
          (mouseConstraint as any).body = null;
          mouse.button = -1;
          mouse.position.x = -99999;
          mouse.position.y = -99999;
        }
      }
    });

    // Check if client coordinates are outside the jar canvas boundary
    const checkIsOutside = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    // Helper to release any dragged body from mouse constraint immediately and drop it
    const releaseDragged = () => {
      const releasedBody = draggedBodyRef.current;
      if (releasedBody) {
        Matter.Sleeping.set(releasedBody, false);
        if (!isOrganizedRef.current) {
          releasedBody.isSensor = false;
          // Apply an immediate downward velocity so the block visibly drops/falls even if held at edge
          Matter.Body.setVelocity(releasedBody, {
            x: releasedBody.velocity.x * 0.5,
            y: Math.max(2.5, releasedBody.velocity.y + 1.5),
          });
        }
      }

      if (mouseConstraint) {
        mouseConstraint.constraint.bodyB = null;
        (mouseConstraint as any).body = null;
        // Temporarily disable mouse constraint collision mask so it CANNOT re-grab anything while outside!
        mouseConstraint.collisionFilter.mask = 0;
        mouse.position.x = -99999;
        mouse.position.y = -99999;
        mouse.button = -1;
        (mouse as any).buttons = 0;
        if ((mouse as any).sourceEvents) {
          (mouse as any).sourceEvents.mousedown = null;
          (mouse as any).sourceEvents.mousemove = null;
          (mouse as any).sourceEvents.mouseup = null;
        }
      }

      draggedBodyRef.current = null;
      hoveredBodyRef.current = null;
      if (canvas) canvas.style.cursor = "default";
    };

    // When clicking inside the canvas, re-enable mouseConstraint grabbing
    const handleCanvasPointerDown = () => {
      if (mouseConstraint) {
        mouseConstraint.collisionFilter.mask = 0xFFFFFFFF;
      }
    };

    // Track mouse on canvas: if dragging and cursor leaves bounds, release and drop immediately!
    const handleMouseMove = (e: MouseEvent) => {
      if (checkIsOutside(e) && (draggedBodyRef.current || (mouseConstraint as any)?.body)) {
        releaseDragged();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hovered = bodiesRef.current.find((entry) => {
        return (
          Matter.Bounds.contains(entry.body.bounds, { x: mouseX, y: mouseY }) &&
          Matter.Vertices.contains(entry.body.vertices, { x: mouseX, y: mouseY })
        );
      });

      hoveredBodyRef.current = hovered ? hovered.body : null;
      if (!draggedBodyRef.current) {
        canvas.style.cursor = hovered ? "grab" : "default";
      }
    };

    // Global pointer tracker: EVEN IF THE BUTTON IS HELD DOWN, as soon as cursor exits the jar, drop the block!
    const handleGlobalPointerMove = (e: MouseEvent | PointerEvent) => {
      if (!draggedBodyRef.current && !(mouseConstraint as any)?.body) return;
      if (checkIsOutside(e)) {
        releaseDragged();
      }
    };

    // When pointer leaves the jar, immediately drop
    const handleMouseLeave = () => {
      releaseDragged();
    };

    // When pointerup / mouseup occurs anywhere, release and reset mask
    const handleGlobalMouseUp = () => {
      releaseDragged();
      if (mouseConstraint) {
        mouseConstraint.collisionFilter.mask = 0xFFFFFFFF;
      }
    };

    // Apply dynamic physical impulse to pills along a finger swipe path
    const applySwipeForceAt = (x: number, y: number, vx: number, vy: number) => {
      if (isOrganizedRef.current) return;
      const speed = Math.hypot(vx, vy);
      if (speed < 0.3) return;

      const swipeRadius = 45;
      const swipeRadiusSq = swipeRadius * swipeRadius;

      bodiesRef.current.forEach(({ body }) => {
        if (draggedBodyRef.current === body) return;

        const dx = body.position.x - x;
        const dy = body.position.y - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < swipeRadiusSq) {
          Matter.Sleeping.set(body, false);
          const dist = Math.sqrt(distSq) || 1;
          const forceMag = Math.min(speed * 0.001, 0.03);

          const pushX = (vx * 0.65 + (dx / dist) * speed * 0.35) * forceMag;
          const pushY = (vy * 0.65 + (dy / dist) * speed * 0.35) * forceMag;

          Matter.Body.applyForce(body, body.position, { x: pushX, y: pushY });
          Matter.Body.setAngularVelocity(
            body,
            body.angularVelocity + (Math.random() - 0.5) * speed * 0.02
          );
        }
      });
    };

    // Mobile touch interaction states for fluid swiping and flinging
    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocityX = 0;
    let touchVelocityY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (mouseConstraint) {
        mouseConstraint.collisionFilter.mask = 0xFFFFFFFF;
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        mouse.position.x = x;
        mouse.position.y = y;
        mouse.button = 0;
        (mouse as any).buttons = 1;

        lastTouchX = x;
        lastTouchY = y;
        lastTouchTime = performance.now();
        touchVelocityX = 0;
        touchVelocityY = 0;

        applySwipeForceAt(x, y, 0.5, 0.5);
      }
      if (e.cancelable) e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (checkIsOutside(touch as unknown as MouseEvent)) {
          releaseDragged();
          return;
        }

        mouse.position.x = x;
        mouse.position.y = y;

        const now = performance.now();
        const dt = Math.max(1, now - lastTouchTime);
        const vx = (x - lastTouchX) / (dt / 16.67);
        const vy = (y - lastTouchY) / (dt / 16.67);

        touchVelocityX = vx * 0.6 + touchVelocityX * 0.4;
        touchVelocityY = vy * 0.6 + touchVelocityY * 0.4;

        lastTouchX = x;
        lastTouchY = y;
        lastTouchTime = now;

        applySwipeForceAt(x, y, vx, vy);
      }
      if (e.cancelable) e.preventDefault();
    };

    const handleTouchEnd = () => {
      const releasedBody = draggedBodyRef.current;
      if (releasedBody && !isOrganizedRef.current) {
        const speed = Math.hypot(touchVelocityX, touchVelocityY);
        if (speed > 1.2) {
          Matter.Body.setVelocity(releasedBody, {
            x: Math.max(-10, Math.min(10, touchVelocityX * 0.6)),
            y: Math.max(-10, Math.min(10, touchVelocityY * 0.6)),
          });
        }
      }
      handleGlobalMouseUp();
    };

    canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    canvas.addEventListener("mousedown", handleCanvasPointerDown);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    wrap.addEventListener("mouseleave", handleMouseLeave);
    if (containerRef.current) {
      containerRef.current.addEventListener("mouseleave", handleMouseLeave);
    }
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousemove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("pointerup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    window.addEventListener("touchcancel", handleGlobalMouseUp);
    window.addEventListener("blur", releaseDragged);

    // IntersectionObserver to trigger drop cascade when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredDropRef.current) {
            hasTriggeredDropRef.current = true;
            dropSkills();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(wrap);

    // Responsive resize observer with dynamic body scaling between breakpoints
    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const newDims = getPillDimensions(rect.width);

        // If breakpoint crossed between mobile and desktop, scale the Matter.js bodies
        if (newDims.isMobile !== isMobileRef.current) {
          isMobileRef.current = newDims.isMobile;
          ctx.font = newDims.fontStr;

          bodiesRef.current.forEach((item) => {
            const textMetrics = ctx.measureText(item.name);
            const newW = Math.max(newDims.minWidth, Math.ceil(textMetrics.width + newDims.paddingX));
            const newH = newDims.pillHeight;
            const scaleX = newW / item.width;
            const scaleY = newH / item.height;
            Matter.Body.scale(item.body, scaleX, scaleY);
            item.width = newW;
            item.height = newH;
          });
        }

        const bounds = setupBounds();
        if (isOrganizedRef.current) {
          const { targets, totalHeight } = computeOrganizedPositions(bounds.width, bounds.height);
          if (totalHeight > bounds.height) {
            wrap.style.height = `${Math.ceil(totalHeight)}px`;
            setupBounds(Math.ceil(totalHeight));
          }
          targetPositionsRef.current = targets;
        }
      }, 100);
    });
    resizeObserver.observe(wrap);

    // Render loop
    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const isLight = isLightRef.current;
      const activeCat = selectedCategoryRef.current;
      const isAll = activeCat === "All";

      // Draw each skill pill
      bodiesRef.current.forEach(({ body, name, category, width: pW, height: pH }) => {
        const { x, y } = body.position;
        const angle = body.angle;
        const isHovered = hoveredBodyRef.current === body;
        const isDragged = draggedBodyRef.current === body;
        const isMatch = isAll || category === activeCat;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Highlight matching skills, smoothly fade non-matching skills
        if (!isMatch && !isHovered && !isDragged) {
          ctx.globalAlpha = isLight ? 0.16 : 0.18;
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Draw pill capsule path
        const hW = pW / 2;
        const hH = pH / 2;
        const isMobile = width < 640;

        ctx.beginPath();
        ctx.roundRect(-hW, -hH, pW, pH, isMobile ? 4 : 5);

        // Pill Fill
        if (!isAll && isMatch) {
          // Highlighted category fill
          if (isLight) {
            ctx.fillStyle = isDragged || isHovered ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.05)";
          } else {
            ctx.fillStyle = isDragged || isHovered ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.07)";
          }
        } else if (isLight) {
          ctx.fillStyle = isDragged || isHovered ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.02)";
        } else {
          ctx.fillStyle = isDragged || isHovered ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)";
        }
        ctx.fill();

        // Pill Border
        if (!isAll && isMatch) {
          ctx.lineWidth = isDragged || isHovered ? 1.75 : 1.5;
          ctx.strokeStyle = isLight
            ? (isDragged || isHovered ? "#000000" : "rgba(0, 0, 0, 0.65)")
            : (isDragged || isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.65)");
        } else {
          ctx.lineWidth = 1;
          if (isLight) {
            ctx.strokeStyle = isDragged || isHovered ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.12)";
          } else {
            ctx.strokeStyle = isDragged || isHovered ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.12)";
          }
        }
        ctx.stroke();

        // Centered Text in monospace font
        ctx.font = isMobile
          ? '500 10.5px var(--font-mono, "JetBrains Mono", monospace)'
          : '500 12px var(--font-mono, "JetBrains Mono", monospace)';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (!isAll && isMatch) {
          ctx.fillStyle = isLight ? "#000000" : "#ffffff";
        } else if (isLight) {
          ctx.fillStyle = isDragged || isHovered ? "#09090b" : "#52525b";
        } else {
          ctx.fillStyle = isDragged || isHovered ? "#ffffff" : "#a1a1aa";
        }
        ctx.fillText(name, 0, 0.5);

        ctx.restore();
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handleCanvasPointerDown);
      canvas.removeEventListener("mousedown", handleCanvasPointerDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      wrap.removeEventListener("mouseleave", handleMouseLeave);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousemove", handleGlobalPointerMove);
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("pointerup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
      window.removeEventListener("touchcancel", handleGlobalMouseUp);
      window.removeEventListener("blur", releaseDragged);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, [dropSkills]);

  return (
    <div className="skills-jar-card" ref={containerRef}>
      {/* Contoured Jar Lid Rim with Controls */}
      <div className="skills-jar-lid">
        {/* Category Dropdown on Left */}
        <div className="skills-jar-select-wrap" ref={dropdownRef}>
          <button
            type="button"
            className={`skills-btn skills-dropdown-trigger ${isDropdownOpen ? "active" : ""}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Filter skills by category"
          >
            <span>{selectedCategory}</span>
            <svg
              className={`skills-dropdown-chevron ${isDropdownOpen ? "rotated" : ""}`}
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="skills-dropdown-menu" role="menu">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="menuitem"
                  className={`skills-dropdown-item ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => handleSelectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action controls on Right */}
        <div className="skills-jar-controls">
          <button
            type="button"
            className={`skills-btn ${isOrganized ? "active" : ""}`}
            onClick={handleToggleOrganize}
            title="Sort skills neatly by category"
          >
            {isOrganized ? "Organized" : "Organize"}
          </button>

          <button
            type="button"
            className={`skills-btn ${isZeroG ? "active" : ""}`}
            onClick={handleToggleZeroG}
            title="Toggle zero gravity"
          >
            {isZeroG ? "Zero-G On" : "Zero-G"}
          </button>
        </div>
      </div>

      {/* Contoured Glass Chamber Viewport */}
      <div className="skills-jar-canvas-wrap" ref={canvasWrapRef}>
        <canvas ref={canvasRef} className="skills-jar-canvas" />

        {/* Specular glass reflection along curved side */}
        <div className="skills-jar-glass-specular" />
      </div>
    </div>
  );
}
