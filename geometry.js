


function circle(radius = 1, n = 60, offsetx = 0, offsety = 0) {
  const vertices = [];
  const colors = [];
  const texCoords = [];
  const indices = [];
  for (let i = 0; i < n; i++) {
    const angle = i * 2 * Math.PI / n;
    const dx = Math.sin(angle);
    const dy = Math.cos(angle);
    const x = offsetx + dx * radius;
    const y = offsety + dy * radius;
    vertices.push(x, y);
    texCoords.push((dx + 1) / 2, (dy + 1) / 2);
    colors.push((dx + 1) / 2, (dy + 1) / 2, 1, 1);
  }

  vertices.push(offsetx, offsety);
  colors.push(1, 1, 1, 1);
  texCoords.push(0.5, 0.5)

  for (let i = 0; i < n; i++) {
    indices.push(n, i, (i + 1) % n);
  }

  return {
    vertices,
    colors,
    texCoords,
    indices,
  }
}
