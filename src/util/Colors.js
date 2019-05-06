// Float, Float, Float => Hex
// 255, 0, 128 => 0xff0080
// there are no unit tests 4 this fun >:)
const rgbToHex = (r, g, b) =>
  parseInt(
    [r, g, b]
      .map(color => Number(color).toString(16))
      .map(str => (str.length === 1 ? `0${str}` : str))
      .reduce((acc, e) => `${e}${acc}`),
    16
  )

export { rgbToHex }
