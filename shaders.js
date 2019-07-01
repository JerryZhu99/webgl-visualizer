const vsSource = `#version 300 es

  in vec4 aVertexPosition;
  in vec4 aVertexColor;
  in vec2 aTextureCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  out lowp vec4 vColor;
  out highp vec2 vTextureCoord;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
  }
`;

const fsSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  out lowp vec4 outColor;

  void main() {
    outColor = ceil(vColor * 8.0) / 8.0;
  }
`;

const fsThresholdSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  out lowp vec4 outColor;

  void main() {
    lowp float lightness = (min(vColor.r, min(vColor.g, vColor.b)) + max(vColor.r, max(vColor.g, vColor.b))) / 2.0;
    outColor = vec4(vColor.rgb * smoothstep(0.5, 0.7, lightness), vColor.a);
  }
`;


const vsBlurSource = `#version 300 es

  in vec4 aVertexPosition;
  in vec4 aVertexColor;
  in vec2 aTextureCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  out lowp vec4 vColor;
  out highp vec2 vTextureCoord;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
  }
`;

const fsBlurHSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  out lowp vec4 outColor;

  void main() {
    highp ivec2 tex_size = textureSize(uSampler, 0);
    highp vec2 tex_offset = vec2(1.0 / float(tex_size.x), 1.0 / float(tex_size.y)) * 2.0;
    outColor = vec4(0.0);
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * -4.0, 0.0)) * 0.0162162162;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * -3.0, 0.0)) * 0.0540540541;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * -2.0, 0.0)) * 0.1216216216;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * -1.0, 0.0)) * 0.1945945946;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * 0.0, 0.0)) * 0.2270270270;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * 1.0, 0.0)) * 0.1945945946;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * 2.0, 0.0)) * 0.1216216216;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * 3.0, 0.0)) * 0.0540540541;
    outColor += texture(uSampler, vTextureCoord + vec2(tex_offset.x * 4.0, 0.0)) * 0.0162162162;
  }
`;

const fsBlurVSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  out lowp vec4 outColor;

  void main() {
    highp ivec2 tex_size = textureSize(uSampler, 0);
    highp vec2 tex_offset = vec2(1.0 / float(tex_size.x), 1.0 / float(tex_size.y)) * 2.0;
    outColor = vec4(0.0);
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * -4.0)) * 0.0162162162;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * -3.0)) * 0.0540540541;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * -2.0)) * 0.1216216216;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * -1.0)) * 0.1945945946;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * 0.0)) * 0.2270270270;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * 1.0)) * 0.1945945946;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * 2.0)) * 0.1216216216;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * 3.0)) * 0.0540540541;
    outColor += texture(uSampler, vTextureCoord + vec2(0.0, tex_offset.y * 4.0)) * 0.0162162162;
  }
`;


const fsBlendSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;
  uniform sampler2D uSampler2;

  out lowp vec4 outColor;

  void main() {
    outColor = vec4(1.0 - (1.0- texture(uSampler, vTextureCoord).rgb)
     * (1.0-  texture(uSampler2, vTextureCoord).rgb), 1.0);
  }
`;

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vsSource
 * @param {string} fsSource
 */
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/**
 * Creates a shader of the given type, uploads the source and
 * compiles it.
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vsSource
 * @param {string} fsSource
 * @param {string[]} attributes
 * @param {string[]} uniforms
 */
function getShaderProgram(gl, vsSource, fsSource, attributes, uniforms) {
  const program = initShaderProgram(gl, vsSource, fsSource);
  const attribLocations = {};
  for (let attribute of attributes) {
    attribLocations[attribute] = gl.getAttribLocation(program, attribute);
  }
  const uniformLocations = {};
  for (let uniform of uniforms) {
    uniformLocations[uniform] = gl.getUniformLocation(program, uniform);
  }

  return {
    program,
    attribLocations,
    uniformLocations,
  }
}
