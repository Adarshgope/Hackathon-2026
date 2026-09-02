/**
 * Fixed coordinate space for the landing-page scene.
 *
 * Every element of the ship, the deck cargo and the suspended container is
 * positioned in these 1280x720 units and the whole frame is scaled to the
 * viewport. Working in fixed units is what lets the chain drop land the top
 * container exactly on the three below it at any screen size.
 */
export const SCENE = {
  W: 1280,
  H: 720,
  waterline: 648,
  deckY: 556, // top of the weather deck
  hullLeft: 290,
  hullW: 700,
  hullH: 110,
  box: { w: 150, h: 110, gap: 14 },
  topBox: { w: 478, h: 124 },
  hangY: 96,

  /** Left edge of the three-abreast deck stack. */
  get boxLeft() {
    return 700 - (this.box.w * 3 + this.box.gap * 2) / 2;
  },
  /** Top edge of the deck containers. */
  get boxTop() {
    return this.deckY - this.box.h;
  },
  /** Where the suspended container comes to rest on the stack. */
  get topRestY() {
    return this.boxTop - this.topBox.h;
  },
  /** Vertical travel of the chain drop. */
  get dropDistance() {
    return this.topRestY - this.hangY;
  },
};
