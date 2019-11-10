import * as THREE from 'three'

const VertexShader = `
varying vec3 vFragPos;
varying vec3 vNormal;
varying vec2 vTexCoords;

uniform mat4 invertedTransposedModelMatrix;

void main() {
  vFragPos = vec3(modelMatrix * vec4(position, 1.0));
  vNormal = mat3(invertedTransposedModelMatrix) * normal;
  vTexCoords = uv;

  gl_Position = projectionMatrix * viewMatrix * vec4(vFragPos, 1.0);
}
`

const FragmentShader = `
varying vec2 vTexCoords;
varying vec3 vNormal;
varying vec3 vFragPos;

struct Material {
  sampler2D diffuse;
  sampler2D specular;
  float shininess;
};

struct Light {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

uniform Material material;
uniform Light light;

void main() {
  // ambient
  vec3 ambient = light.ambient * texture2D(material.diffuse, vTexCoords).rgb;

  // diffuse
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(light.position - vFragPos);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = light.diffuse * diff * texture2D(material.diffuse, vTexCoords).rgb;

  // specular
  vec3 viewDir = normalize(cameraPosition - vFragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

  vec3 specularMapValue = texture2D(material.specular, vTexCoords).rgb;
  vec3 specular = light.specular * spec * specularMapValue;

  vec3 result = ambient + diffuse + specular;
  gl_FragColor = vec4(result, 1.0);
}
`

const Uniforms = (modelMatrix, light, material) => {
  const invertedTransposed = new THREE.Matrix4()
  invertedTransposed.getInverse(modelMatrix, true)
  invertedTransposed.transpose()

  return {
    invertedTransposedModelMatrix: new THREE.Uniform(invertedTransposed),
    light: {
      value: {
        position: light.position.clone(),
        ambient: light.ambient.clone(),
        diffuse: light.diffuse.clone(),
        specular: light.specular.clone(),
      },
    },
    material: {
      value: {
        diffuse: material.diffuse,
        specular: material.specular,
        shininess: material.shininess,
      },
    },
  }
}

export { VertexShader, FragmentShader, Uniforms }
