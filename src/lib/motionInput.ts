export type MotionState = "unsupported" | "needs-permission" | "active" | "denied";

export interface MotionSample {
  x: number;
  y: number;
  active: boolean;
  state: MotionState;
}

export interface MotionInputController {
  getState(): MotionState;
  getSample(): MotionSample;
  requestPermission(): Promise<MotionState>;
  subscribe(fn: (sample: MotionSample) => void): () => void;
  onStateChange(fn: (state: MotionState) => void): () => void;
  setPaused(paused: boolean): void;
  recalibrate(): void;
}

interface DeviceOrientationConstructorWithPermission {
  requestPermission?: () => Promise<"granted" | "denied" | string>;
}

export function isPhoneViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches &&
    Math.min(window.innerWidth, window.innerHeight) < 600
  );
}

function getScreenAngle(): number {
  const raw =
    screen.orientation?.angle ??
    (window as unknown as { orientation?: number }).orientation ??
    0;
  const norm = ((raw % 360) + 360) % 360;
  return (Math.round(norm / 90) * 90) % 360;
}

function mapOrientationToScreen(beta: number, gamma: number): [number, number] {
  switch (getScreenAngle()) {
    case 90:
      return [beta, -gamma];
    case 270:
      return [-beta, gamma];
    case 180:
      return [-gamma, -beta];
    default:
      return [gamma, beta];
  }
}

function createMotionInput(): MotionInputController {
  let state: MotionState = "unsupported";
  let paused = false;
  let listenerAttached = false;

  let hasBaseline = false;
  let hasPrevRaw = false;
  let baseX = 0;
  let baseY = 0;
  let prevScreenX = 0;
  let prevScreenY = 0;

  let targetX = 0;
  let targetY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let lastSentX = 0;
  let lastSentY = 0;
  let hasEmittedActive = false;

  let rafId = 0;
  let lastTime = 0;

  const subscribers = new Set<(sample: MotionSample) => void>();
  const stateListeners = new Set<(state: MotionState) => void>();

  const getSample = (): MotionSample => ({
    x: smoothX,
    y: smoothY,
    active: state === "active",
    state,
  });

  const notifySubscribers = () => {
    const sample = getSample();
    subscribers.forEach((fn) => fn(sample));
  };

  const setState = (next: MotionState) => {
    if (state === next) return;
    state = next;
    stateListeners.forEach((fn) => fn(state));
    if (state === "active") {
      ensureRaf();
    } else {
      stopRaf();
    }
  };

  const stopRaf = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    lastTime = 0;
  };

  const tick = (now: number) => {
    rafId = 0;
    if (
      subscribers.size === 0 ||
      state !== "active" ||
      paused ||
      document.hidden
    ) {
      lastTime = 0;
      return;
    }

    const dt = lastTime ? (now - lastTime) / 1000 : 0.016;
    lastTime = now;
    const alpha = 1 - Math.exp(-Math.min(0.05, Math.max(0.001, dt)) * 8.5);

    smoothX += (targetX - smoothX) * alpha;
    smoothY += (targetY - smoothY) * alpha;

    if (
      !hasEmittedActive ||
      Math.abs(smoothX - lastSentX) > 0.001 ||
      Math.abs(smoothY - lastSentY) > 0.001
    ) {
      lastSentX = smoothX;
      lastSentY = smoothY;
      hasEmittedActive = true;
      notifySubscribers();
    }

    rafId = requestAnimationFrame(tick);
  };

  const ensureRaf = () => {
    if (
      !rafId &&
      subscribers.size > 0 &&
      state === "active" &&
      !paused &&
      !document.hidden
    ) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const recalibrate = () => {
    hasBaseline = false;
    hasPrevRaw = false;
    targetX = 0;
    targetY = 0;
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (paused || document.hidden) return;
    const { beta, gamma } = e;
    if (
      typeof beta !== "number" ||
      typeof gamma !== "number" ||
      !Number.isFinite(beta) ||
      !Number.isFinite(gamma)
    ) {
      return;
    }

    if (state !== "active") {
      setState("active");
    }

    const [screenX, screenY] = mapOrientationToScreen(beta, gamma);

    if (!hasBaseline || !hasPrevRaw) {
      baseX = screenX;
      baseY = screenY;
      prevScreenX = screenX;
      prevScreenY = screenY;
      hasBaseline = true;
      hasPrevRaw = true;
      targetX = 0;
      targetY = 0;
      return;
    }

    // Guard gimbal-lock or wraparound spikes by skipping sudden >45° jumps
    if (
      Math.abs(screenX - prevScreenX) > 45 ||
      Math.abs(screenY - prevScreenY) > 45
    ) {
      prevScreenX = screenX;
      prevScreenY = screenY;
      return;
    }

    const dx = screenX - baseX;
    const dy = screenY - baseY;

    // Gentle low-velocity baseline drift (~5s comfort-angle re-centering)
    if (Math.hypot(screenX - prevScreenX, screenY - prevScreenY) < 1.5) {
      baseX += dx * 0.004;
      baseY += dy * 0.004;
    }

    prevScreenX = screenX;
    prevScreenY = screenY;

    const rawTargetX = Math.tanh(dx / 22);
    const rawTargetY = Math.tanh(dy / 18);

    targetX = Math.abs(rawTargetX) < 0.015 ? 0 : rawTargetX;
    targetY = Math.abs(rawTargetY) < 0.015 ? 0 : rawTargetY;

    ensureRaf();
  };

  const attachListener = () => {
    if (listenerAttached) return;
    listenerAttached = true;
    window.addEventListener("deviceorientation", handleOrientation, {
      passive: true,
    });
  };

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasDeviceOrientation =
    typeof window !== "undefined" &&
    typeof window.DeviceOrientationEvent !== "undefined";

  if (isPhoneViewport() && !reduced && hasDeviceOrientation) {
    const DoeCtor =
      window.DeviceOrientationEvent as unknown as DeviceOrientationConstructorWithPermission;

    if (typeof DoeCtor.requestPermission === "function") {
      state = "needs-permission";
    } else {
      attachListener();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopRaf();
      } else {
        recalibrate();
        ensureRaf();
      }
    });

    window.addEventListener("orientationchange", recalibrate, { passive: true });
    screen.orientation?.addEventListener("change", recalibrate, {
      passive: true,
    });
  }

  return {
    getState: () => state,
    getSample,
    requestPermission(): Promise<MotionState> {
      const DoeCtor =
        typeof window !== "undefined"
          ? (window.DeviceOrientationEvent as unknown as DeviceOrientationConstructorWithPermission)
          : undefined;

      if (!DoeCtor || typeof DoeCtor.requestPermission !== "function") {
        return Promise.resolve(state);
      }

      // Invoke iOS requestPermission() synchronously inside the click handler gesture
      let permPromise: Promise<string>;
      try {
        permPromise = DoeCtor.requestPermission();
      } catch {
        setState("denied");
        return Promise.resolve("denied");
      }

      return permPromise.then(
        (result) => {
          if (result === "granted") {
            recalibrate();
            attachListener();
            setState("active");
            return "active";
          }
          setState("denied");
          return "denied";
        },
        () => {
          setState("denied");
          return "denied";
        }
      );
    },
    subscribe(fn) {
      subscribers.add(fn);
      if (state === "active") {
        fn(getSample());
        ensureRaf();
      }
      return () => {
        subscribers.delete(fn);
        if (subscribers.size === 0) {
          stopRaf();
        }
      };
    },
    onStateChange(fn) {
      stateListeners.add(fn);
      return () => {
        stateListeners.delete(fn);
      };
    },
    setPaused(nextPaused: boolean) {
      if (paused === nextPaused) return;
      paused = nextPaused;
      if (paused) {
        stopRaf();
      } else {
        recalibrate();
        ensureRaf();
      }
    },
    recalibrate,
  };
}

export function getMotionInput(): MotionInputController {
  if (typeof window !== "undefined" && window.__motionInput) {
    return window.__motionInput;
  }
  const instance = createMotionInput();
  if (typeof window !== "undefined") {
    window.__motionInput = instance;
  }
  return instance;
}
