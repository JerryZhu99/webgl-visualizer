/**
 *
 * @param {WebGLRenderingContext} gl
 */
function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

  const colors = [
    1.0, 1.0, 1.0, 1.0,    // white
    1.0, 0.0, 0.0, 1.0,    // red
    0.0, 1.0, 0.0, 1.0,    // green
    0.0, 0.0, 1.0, 1.0,    // blue
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
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

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexColor);
  }

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
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

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
  },
};


const shaderProgramThreshold = initShaderProgram(gl, vsSource, fsThresholdSource);

const programInfoThreshold = {
  program: shaderProgramThreshold,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgramThreshold, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgramThreshold, 'aVertexColor'),
    textureCoord: gl.getAttribLocation(shaderProgramThreshold, 'aTextureCoord'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgramThreshold, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgramThreshold, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgramThreshold, 'uSampler'),
  },
};
const shaderProgramBlurH = initShaderProgram(gl, vsBlurSource, fsBlurHSource);

const programInfoBlurH = {
  program: shaderProgramBlurH,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgramBlurH, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgramBlurH, 'aVertexColor'),
    textureCoord: gl.getAttribLocation(shaderProgramBlurH, 'aTextureCoord'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgramBlurH, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgramBlurH, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgramBlurH, 'uSampler'),
  },
};

const shaderProgramBlurV = initShaderProgram(gl, vsBlurSource, fsBlurVSource);

const programInfoBlurV = {
  program: shaderProgramBlurV,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgramBlurV, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgramBlurV, 'aVertexColor'),
    textureCoord: gl.getAttribLocation(shaderProgramBlurV, 'aTextureCoord'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgramBlurV, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgramBlurV, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgramBlurV, 'uSampler'),
  },
};

const shaderProgramBlend = initShaderProgram(gl, vsSource, fsBlendSource);

const programInfoBlend = {
  program: shaderProgramBlend,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgramBlend, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgramBlend, 'aVertexColor'),
    textureCoord: gl.getAttribLocation(shaderProgramBlend, 'aTextureCoord'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgramBlend, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgramBlend, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgramBlend, 'uSampler'),
    uSampler2: gl.getUniformLocation(shaderProgramBlend, 'uSampler2'),
  },
};

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
  for (let i = 0; i < 3; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferH.buffer);
    drawFrameBuffer(gl, programInfoBlurH, screenRectBuffers, blurBufferV);

    gl.bindFramebuffer(gl.FRAMEBUFFER, blurBufferV.buffer);
    drawFrameBuffer(gl, programInfoBlurV, screenRectBuffers, blurBufferH);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  drawFrameBuffer(gl, programInfoBlend, screenRectBuffers, sceneBuffer, blurBufferV);

  requestAnimationFrame(draw);
}
draw();
