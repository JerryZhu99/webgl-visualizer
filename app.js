/**
 *
 * @param {WebGLRenderingContext} gl
 */
function initBuffers(gl) {
  const { vertices, colors, texCoords, indices } = circle(1);

  return createBuffers(gl, vertices, colors, texCoords, indices);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} programInfo
 * @param {*} buffers
 */
function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

  mat4.rotateY(modelViewMatrix, modelViewMatrix, Date.now() / 1000)

  gl.useProgram(programInfo.program);

  drawObject(gl, programInfo, { buffers }, modelViewMatrix, projectionMatrix);
}


/**
 * @type HTMLCanvasElement
 */
const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl2");
if (gl === null) {
  console.error("Failed to initialize WebGL");
  throw "error"
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const programInfo = getShaderProgram(gl, vsSource, fsSource,
  ['aVertexPosition', 'aVertexColor', 'aTextureCoord'],
  ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'],
);

const programInfoThreshold = getShaderProgram(gl, vsSource, fsThresholdSource,
  ['aVertexPosition', 'aVertexColor', 'aTextureCoord'],
  ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'],
);

const programInfoBlurH = getShaderProgram(gl, vsBlurSource, fsBlurHSource,
  ['aVertexPosition', 'aVertexColor', 'aTextureCoord'],
  ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'],
);

const programInfoBlurV = getShaderProgram(gl, vsBlurSource, fsBlurVSource,
  ['aVertexPosition', 'aVertexColor', 'aTextureCoord'],
  ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'],
);

const programInfoBlend = getShaderProgram(gl, vsSource, fsBlendSource,
  ['aVertexPosition', 'aVertexColor', 'aTextureCoord'],
  ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler', 'uSampler2'],
);

const buffers = initBuffers(gl);
const screenRectBuffers = initScreenRectBuffers(gl);

const sceneBuffer = generateFrameBuffer(gl);
const thresholdBuffer = generateFrameBuffer(gl);
const blurBufferH = generateFrameBuffer(gl);
const blurBufferV = generateFrameBuffer(gl);

const draw = () => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer.buffer);
  drawScene(gl, programInfo, buffers)

  gl.bindFramebuffer(gl.FRAMEBUFFER, thresholdBuffer.buffer);
  drawScene(gl, programInfoThreshold, buffers)

  gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferH.buffer);
  drawFrameBuffer(gl, programInfoBlurH, screenRectBuffers, thresholdBuffer);

  gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferV.buffer);
  drawFrameBuffer(gl, programInfoBlurV, screenRectBuffers, blurBufferH);

  gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferH.buffer);
  drawFrameBuffer(gl, programInfoBlurH, screenRectBuffers, blurBufferV);

  gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferV.buffer);
  drawFrameBuffer(gl, programInfoBlurV, screenRectBuffers, blurBufferH);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  drawFrameBuffer(gl, programInfoBlend, screenRectBuffers, sceneBuffer, blurBufferV);

  requestAnimationFrame(draw);
}
draw();
