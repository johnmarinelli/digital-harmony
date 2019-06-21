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

float yVar;
vec2 s,g,m;
vec3 bg(vec2 uv)
{
    return texture2D(videoTexture, uv).rgg;
}

vec3 effect(vec2 uv, vec3 col)
{
    float granularity = yVar*20.+10.;
    if (granularity > 0.0)
    {
        float dx = granularity / s.x;
        float dy = granularity / s.y;
        uv = vec2(dx*(floor(uv.x/dx) + 0.5),
                  dy*(floor(uv.y/dy) + 0.5));
        return bg(uv);
    }
    return col;
}

vec2 getUV()
{
    return g / s;
}

void main()
{
	s = resolution.xy;
    g = gl_FragCoord.xy;
    m = s / 2.;
    yVar = m.y/s.y * 0.5;
   	vec2 uv = getUV();
    vec3 tex = bg(uv);
    vec3 col = effect(uv,tex);
	gl_FragColor = vec4(col,1.);
}
`

const ReactionDiffusionShader = ({ texture, resolution }) => {
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

export default ReactionDiffusionShader
