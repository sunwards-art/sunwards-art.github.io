/// <reference path="../.astro/types.d.ts" />

// Lenis instance is shared between the scroll engine and the lightbox.
interface Window {
  __lenis?: import('lenis').default;
}
