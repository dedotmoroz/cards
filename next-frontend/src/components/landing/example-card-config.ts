/** Timings for the landing example-card context carousel (ms). */
export const EXAMPLE_CARD_TIMINGS = {
  /** Initial loader before the first context slides in */
  loadingMs: 1200,
  /** How long each context stays visible before switching */
  carouselIntervalMs: 5000,
  /** Slide-out duration before swapping to the next context */
  slideMs: 450,
} as const;
