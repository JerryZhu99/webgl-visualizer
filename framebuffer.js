/**
 *
 * @param {WebGLRenderingContext} gl
 */
function generateFrameBuffer(gl) {
  const targetTextureWidth = gl.canvas.width;
  const targetTextureHeight = gl.canvas.height;
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  const data = null;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    targetTextureWidth, targetTextureHeight, border,
    format, type, data);

  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);


  return {
    texture: targetTexture,
    buffer: fb,
  }
}



/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {{texture: number, buffer: number}} framebuffer
 */
function drawFrameBuffer(gl, programInfo, buffers, framebuffer, framebuffer2) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const projectionMatrix = mat4.create();

  mat4.ortho(projectionMatrix, -1, 1, -1, 1, -1, 1);

  const modelViewMatrix = mat4.create();
  const objectData = {
    buffers,
    texture1: framebuffer && framebuffer.texture,
    texture2: framebuffer2 && framebuffer2.texture,
  };
  drawObject(gl, programInfo, objectData, modelViewMatrix, projectionMatrix);
}




/**
 *
 * @param {WebGLRenderingContext} gl
 */
function initScreenRectBuffers(gl) {
  const positions = [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ];

  const textureCoordinates = [
    0.0, 1.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
  ]

  const indices = [
    0, 1, 2, 1, 2, 3
  ]

  return createBuffers(gl, positions, null, textureCoordinates, indices);
}
