const ExtendableFloatArray = () => {
  let FloatArray

  if (typeof Float32Array != 'undefined') {
    FloatArray = Float32Array
  } else {
    FloatArray = Array
  }

  let shortcut, properties
  return function(shortcuts) {
    shortcuts = shortcuts || {}
    properties = {}
    for (shortcut in shortcuts) {
      ;(function(index) {
        properties[shortcut] = {
          get: function() {
            return this[index]
          },
          set: function(value) {
            this[index] = value
          },
        }
      })(shortcuts[shortcut])
    }
    Object.defineProperties(FloatArray.prototype, properties)
    return FloatArray
  }
}

const ImprovedNoise = () => {
  // prettier-ignore
  var p = [ 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180, ]
  for (var i = 0; i < 256; i++) {
    p[256 + i] = p[i]
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  function lerp(t, a, b) {
    return a + t * (b - a)
  }

  function grad(hash, x, y, z) {
    var h = hash & 15
    var u = h < 8 ? x : y,
      v = h < 4 ? y : h == 12 || h == 14 ? x : z
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v)
  }
  var v
  function grad2d(i, x, y) {
    v = (i & 1) == 0 ? x : y
    return (i & 2) == 0 ? -v : v
  }

  var X, Y, fx, p0, p1, fy, x0, y0
  return {
    noise: function(x, y) {
      x0 = Math.floor(x)
      y0 = Math.floor(y)
      X = x0 & 255
      Y = y0 & 255
      x -= x0
      y -= y0
      fx = (3 - 2 * x) * x * x
      fy = (3 - 2 * y) * y * y
      p0 = p[X] + Y
      p1 = p[X + 1] + Y
      return lerp(
        fy,
        lerp(fx, grad2d(p[p0], x, y), grad2d(p[p1], x - 1, y)),
        lerp(fx, grad2d(p[p0 + 1], x, y - 1), grad2d(p[p1 + 1], x - 1, y - 1))
      )
    },
  }
}

const noise = ImprovedNoise().noise

export { ExtendableFloatArray, noise }
