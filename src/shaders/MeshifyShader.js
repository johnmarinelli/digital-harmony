const VertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FragmentShader = `
uniform sampler2D videoTexture;
uniform vec2 resolution;
uniform float time;
varying vec2 vUv;
#define L 8.  // interline distance
#define A 4.  // amplification factor
#define P 6.  // thickness

void main()
{
  vec2 uv = gl_FragCoord.xy;
  vec4 o = gl_FragColor;
  o -= o;
  uv /= L;
  vec2  p = floor(uv+.5);

  #define T(x,y) texture2D(videoTexture,L*vec2(x,y)/resolution.xy).g   // add .g or nothing

  #define M(c,T) gl_FragColor += pow(.5+.5*cos( 6.28*(uv-p).c + A*(2.*T-1.) ),P)

  M( y, T( uv.x, p.y ) );   // modulates  y offset
  M( x, T( p.x, uv.y ) );   // modulates  y offset
}

`

const MeshifyShader = ({ texture, resolution }) => {
  return {
    uniforms: {
      videoTexture: { type: 't', value: texture },
      resolution: { type: 'v2', value: resolution },
      time: { type: 'f', value: 0 },
    },

    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  }
}

export default MeshifyShader
