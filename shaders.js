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
    outColor = vColor;
  }
`;

const vsFramebufferSource = `#version 300 es

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

const fsFramebufferSource = `#version 300 es

  in lowp vec4 vColor;
  in highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  out lowp vec4 outColor;

  void main() {
    highp ivec2 tex_size = textureSize(uSampler, 0);
    highp vec2 tex_offset = vec2(1.0 / float(tex_size.x), 1.0 / float(tex_size.y));
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

    // outColor = texture2D(uSampler, vTextureCoord);
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
