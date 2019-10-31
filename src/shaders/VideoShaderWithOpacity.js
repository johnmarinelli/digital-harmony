const VertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FragmentShader = `
// the video input
uniform sampler2D videoTexture;

// uv texture coordinates
varying vec2 vUv;

uniform float opacity;

void main()
{
  vec2 uv = gl_FragCoord.xy;
  gl_FragColor = texture2D(videoTexture, vUv);
  gl_FragColor.a = opacity;
}

`

const VideoShaderWithOpacity = ({ texture }) => {
  return {
    uniforms: {
      videoTexture: { type: 't', value: texture },
      opacity: { type: 'f', value: 1 },
    },

    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  }
}

export { VideoShaderWithOpacity }
