// from https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
/**
 * A linear interpolator for hexadecimal colors
 * lerpColor(0x000000, 0xffffff, 0.5)
 * @returns {Hexadecimal Number}
 */
function lerpHexColor(a, b, amount) {
  var ah = a,
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = b,
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab)

  return ((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0
}

export { lerpHexColor }
