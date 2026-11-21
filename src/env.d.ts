/// <reference path="../.astro/types.d.ts" />

// Lenis instance and phone gyroscope controller are shared across scripts.
interface Window {
  __lenis?: import('lenis').default;
  __motionInput?: import('./lib/motionInput').MotionInputController;
}
