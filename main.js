let surfacePoints = [];
let angle = 0;
let font;

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
}

function setup() {
  createCanvas(1280, 720, WEBGL);
  textFont(font);
  textSize(0.1);
  surfacePoints = get_loss_surface_points(-1, 1, -1, 1, 20, 20);
  //console.log(surfacePoints);
}

function draw() {
  clear();
  background('#F2E9E4');

  // === 3D Section ===
  push();
  translate(-width / 4, 0, 0);
  rotateX(PI / 3);
  rotateZ(angle);
  scale(150);

  // === Lighting ===
  ambientLight(255);
  //pointLight(100, 100, 100, -2, 0, 0);
  //directionalLight(100, 100, 100, -1, -1, -1); // from top-left-front
  directionalLight(255, 255, 255, 1, 1, 1);    // from bottom-right-back

  ambientMaterial('grey');
  specularMaterial(10, 10, 10);
  shininess(1);

  draw_axes();
  noStroke();
  /*sphere(0.1);
  translate(0, 0, 1);
  sphere(0.1);
  translate(0, 0, -1);*/
  draw_surface(surfacePoints);
  pop();

  // === 2D Panel on Right ===
  push();
  resetMatrix();
  noStroke();
  fill('#F2E9E4');
  rect(width / 2, 0, width / 2, height);
  pop();

  angle += 0.01;
}

// === Compute Surface ===
function compute_loss(x, y) {
  let expPart = Math.exp(Math.sin(2.5 * x) + Math.cos(3 * y));
  let sqrtPart = Math.sqrt(x * x + y * y);
  return -0.25 + 0.13 * expPart + 0.4 * sqrtPart;
}

function get_loss_surface_points(x_min, x_max, y_min, y_max, x_res, y_res) {
  const points = [];
  const normals = [];

  const x_step = (x_max - x_min) / (x_res - 1);
  const y_step = (y_max - y_min) / (y_res - 1);

  for (let i = 0; i < x_res; i++) {
    const row = [];
    const normalRow = [];
    for (let j = 0; j < y_res; j++) {
      const x = x_min + i * x_step;
      const y = y_min + j * y_step;
      const z = compute_loss(x, y);

      row.push([x, y, z]);
      normalRow.push([0, 0, 0]); // Placeholder
    }
    points.push(row);
    normals.push(normalRow);
  }

  // Accumulate normals from surrounding triangles
  for (let i = 0; i < x_res - 1; i++) {
    for (let j = 0; j < y_res - 1; j++) {
      let p1 = points[i][j];
      let p2 = points[i + 1][j];
      let p3 = points[i][j + 1];
      let p4 = points[i + 1][j + 1];

      let n1 = compute_normal(p1, p2, p3);
      let n2 = compute_normal(p2, p4, p3);

      accumulate(normals, i, j, n1);
      accumulate(normals, i + 1, j, n1);
      accumulate(normals, i, j + 1, n1);

      accumulate(normals, i + 1, j, n2);
      accumulate(normals, i + 1, j + 1, n2);
      accumulate(normals, i, j + 1, n2);
    }
  }

  // Normalize accumulated normals
  for (let i = 0; i < x_res; i++) {
    for (let j = 0; j < y_res; j++) {
      let n = normals[i][j];
      let len = Math.hypot(n[0], n[1], n[2]);
      if (len !== 0) {
        normals[i][j] = [n[0] / len, n[1] / len, n[2] / len];
      }
    }
  }

  // Return a structure with both vertices and normals
  return { points, normals };
}

function accumulate(normals, i, j, n) {
  normals[i][j][0] += n[0];
  normals[i][j][1] += n[1];
  normals[i][j][2] += n[2];
}

// === Draw Surface Triangles ===
function draw_surface(surface) {
  const points = surface.points;
  const normals = surface.normals;

  for (let i = 0; i < points.length - 1; i++) {
    for (let j = 0; j < points[i].length - 1; j++) {
      let v1 = points[i][j];
      let v2 = points[i + 1][j];
      let v3 = points[i][j + 1];
      let v4 = points[i + 1][j + 1];

      let n1 = normals[i][j];
      let n2 = normals[i + 1][j];
      let n3 = normals[i][j + 1];
      let n4 = normals[i + 1][j + 1];

      // Triangle 1
      beginShape(TRIANGLES);
      normal(...n1); vertex(...v1);
      normal(...n2); vertex(...v2);
      normal(...n3); vertex(...v3);
      endShape();

      // Triangle 2
      beginShape(TRIANGLES);
      normal(...n2); vertex(...v2);
      normal(...n4); vertex(...v4);
      normal(...n3); vertex(...v3);
      endShape();
    }
  }
}

// === Draw XYZ Axes ===
function draw_axes() {
  strokeWeight(1);
  stroke(0);

  // X Axis
  line(-1, 0, 0, 1, 0, 0);
  push();
  translate(1.05, 0, 0);
  rotateZ(-angle);
  fill(0);
  text("X", 0, 0, 0);
  pop();

  // Y Axis
  line(0, -1, 0, 0, 1, 0);
  push();
  translate(0, 1.05, 0);
  rotateZ(-angle);
  fill(0);
  text("Y", 0, 0, 0);
  pop();

  // Z Axis
  line(0, 0, 0, 0, 0, 1);
  push();
  translate(0, 0, 1.05);
  rotateZ(-angle);
  fill(0);
  text("Z", 0, 0, 0);
  pop();
}

function compute_normal(p1, p2, p3) {
  let U = [
    p2[0] - p1[0],
    p2[1] - p1[1],
    p2[2] - p1[2]
  ];
  let V = [
    p3[0] - p1[0],
    p3[1] - p1[1],
    p3[2] - p1[2]
  ];

  let nx = U[1] * V[2] - U[2] * V[1];
  let ny = U[2] * V[0] - U[0] * V[2];
  let nz = U[0] * V[1] - U[1] * V[0];

  let length = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (length === 0) return [0, 0, 1]; // default normal if degenerate
  return [nx / length, ny / length, nz / length];
}
