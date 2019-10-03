export const VertexShader = `
precision mediump float;

#define TWO_PI 6.28318530718

attribute float reference;
varying float vReference;

uniform float size;
uniform float amplitude;

#include <waveform_chunk>

float rand(float n){return fract(sin(n) * 43758.5453123);}

float fnoise(float p){
	float fl = floor(p);
	float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

void main() {
	vReference = reference * float(WAVEFORM_RESOLUTION);
  int ref = int(vReference);
	float offset = waveform[ref] * amplitude;

	vec3 pos = vec3(position);
  pos += offset * 10.0;
  vec4 mvPosition = modelViewMatrix * vec4(pos.x, pos.y, pos.z, 1.0);

	// Apply Size Attenuation (make smaller when further)
  // gl_PointSize = size * (1.0 / length( mvPosition.xyz ));

	gl_Position = projectionMatrix * mvPosition;
}
`

export const FragmentShader = `
precision mediump float;

varying float vReference;

uniform vec3 color;
uniform float opacity;

uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;

#include <waveform_chunk>

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
	vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
							6.0)-3.0)-1.0,
					0.0,
					1.0 );
	rgb = rgb*rgb*(3.0-2.0*rgb);
	return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 rgb2hsb( in vec3 c ){
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz),
				vec4(c.gb, K.xy),
				step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r),
				vec4(c.r, p.yzx),
				step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
				d / (q.x + e),
				q.x);
}

void main() {
  vec3 c = color;
  c.r = vReference;
  c.b = vReference;
  // fog
  // float depth = gl_FragCoord.z / gl_FragCoord.w;
  // float fogF = min(smoothstep(fogNear, fogFar, depth), 1.0);

  gl_FragColor = vec4(c, 1.0);
}
`
