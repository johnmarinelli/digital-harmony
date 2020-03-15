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

export { ExtendableFloatArray }
