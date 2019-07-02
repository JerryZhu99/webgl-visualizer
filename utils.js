
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number[]} positions
 * @param {number[]} colors
 * @param {number[]} texCoords
 * @param {number[]} indices
 */
function createBuffers(gl, positions, colors, texCoords, indices) {
  let positionBuffer, colorBuffer, texCoordBuffer, indexBuffer;

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

  if (colors) {
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  }

  if (texCoords) {
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  }

  if (indices) {
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }
  return {
    position: positionBuffer,
    color: colorBuffer,
    texCoord: texCoordBuffer,
    index: indexBuffer,
    vertexCount: indices ? indices.length : positions.length / 2,
  };
}


/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} programInfo
 * @param {*} buffers
 * @param {*} modelViewMatrix
 * @param {*} projectionMatrix
 */
function drawObject(gl, programInfo, object, modelViewMatrix, projectionMatrix) {
  const { buffers, texture1, texture2 } = object;

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.aVertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.aVertexPosition);
  }

  if (buffers.color) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.aVertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.aVertexColor);
  }

  if (buffers.texCoord) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.aTextureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.aTextureCoord);
  }

  if (buffers.index) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
  }

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.uProjectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.uModelViewMatrix,
    false,
    modelViewMatrix);

  if (programInfo.uniformLocations.uSampler && texture1) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
  }
  if (programInfo.uniformLocations.uSampler2 && texture2) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(programInfo.uniformLocations.uSampler2, 1);
  }


  if (buffers.index) {
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  } else {
    const offset = 0;
    const vertexCount = buffers.vertexCount;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}
