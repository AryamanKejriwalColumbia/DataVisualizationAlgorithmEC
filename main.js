// Final Colour Palette
let c1 = '#88352b';
let c2 = '#d0755c';
let c3 = '#ebceb1';
let c4 = '#eee9de';
let c5 = '#929489';
let c6 = '#798187';
let c7 = '#576169';

let surfacePoints = [];
let angle = 0;
let font;

let current_point_coords = [0, 0];

let alphaSlider, epsilonSlider;
let alpha = 0.2, epsilon = 0.02;
let rotSlider;

const SURFACE_SCALE = 1.2;

let resetButton;
let nextButton;
let startButton;
let status = 0;

arrow_path = [];

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
}

function setup() {
  createCanvas(1280, 720, WEBGL);
  textFont(font);
  textSize(0.1);
  current_point_coords[0] = random(-1, 1);
  current_point_coords[1] = random(-1, 1);
  surfacePoints = get_loss_surface_points(-SURFACE_SCALE, SURFACE_SCALE, -SURFACE_SCALE, SURFACE_SCALE, 30, 30);
  //console.log(surfacePoints);
  
  arrow_path = [current_point_coords];
  
  // Alpha slider
  alphaSlider = createSlider(0, 0.5, 0.2, 0.01); // min, max, default, step
  alphaSlider.position(width*1/4 + 150, 70+610);
  alphaSlider.style('width', '200px');
  alphaSlider.style('z-index', '1000'); // so it's above the canvas

  // Epsilon slider
  epsilonSlider = createSlider(0, 0.2, 0.02, 0.01);
  epsilonSlider.position(width*1/4 + 150, 20+610);
  epsilonSlider.style('width', '200px');
  epsilonSlider.style('z-index', '1000');
  
  // Rotation Speed slider
  rotSlider = createSlider(0, 0.02, 0.005, 0.001);
  rotSlider.position(width*1/4 - 80, 100);
  rotSlider.style('width', '200px');
  rotSlider.style('z-index', '1000');
  
  // Reset button
  resetButton = createButton('Reset');
  resetButton.position(width * 3 / 4 - 250, 80);
  resetButton.mousePressed(reset);
  resetButton.style('z-index', '1000');
  
  // Next button
  nextButton = createButton('Step');
  nextButton.position(width * 3 / 4 + 200, 80);
  nextButton.mousePressed(next);
  nextButton.style('z-index', '1000');
  
  // Start button
  startButton = createButton('Start');
  startButton.position(width * 3 / 4 + 150, 80);
  startButton.mousePressed(start);
  startButton.style('z-index', '1000');
  
  updateButtons();
}

function draw() {
  clear();
  background(c4);
  
  alpha = alphaSlider.value();
  epsilon = epsilonSlider.value();

  // === 3D Section ===
  push();
  translate(-width / 4, 0, 0);
  rotateX(PI / 3);
  rotateZ(angle);
  scale(150);

  // === Lighting ===
  ambientLight(255);
  //pointLight(100, 100, 100, -2, 0, 0);
  directionalLight(20, 20, 20, -1, -1, -1); // from top-left-front
  directionalLight(80, 80, 80, 1, 1, 1);    // from bottom-right-back

  ambientMaterial(c2);
  specularMaterial(c2);
  shininess(50);

  draw_axes();
  noStroke();
  /*sphere(0.1);
  translate(0, 0, 1);
  sphere(0.1);
  translate(0, 0, -1);*/
  draw_surface(surfacePoints);
  fill(0);
  stroke(c4);
  strokeWeight(3);
  draw_line_path_3D(arrow_path);
  
  translate(current_point_coords[0], current_point_coords[1], compute_loss(current_point_coords[0], current_point_coords[1])+0.01);
  shininess(10);
  ambientMaterial(c7);
  specularMaterial(c4);
  noStroke();
  //noFill();
  sphere(0.05);
  translate(-current_point_coords[0], -current_point_coords[1], -compute_loss(current_point_coords[0], current_point_coords[1])-0.01);
  pop();

  // === 2D Panel on Right ===
  push();

  // Switch to 2D-friendly projection and view
  resetMatrix();
  ortho(-width/2, width/2, height/2, -height/2, -1000, 1000);  // left, right, bottom, top
  camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, -1, 0);       // standard orthographic camera

  noLights();
  noStroke();
  
  rectMode(CENTER);
  
  translate(-width/2, 0);

  // Background of panel
  fill(c4);
  rect(width / 4, 0, width / 2, height);  // center-aligned
  
  scale(-1, 1); 
  fill(0);
  textSize(40);
  text("Gradient Descent", -800, height/2 - 670);
  scale(-1, 1); 
  
  stroke(0);
  strokeWeight(4);
  fill(c2);
  rect(width / 4, 0, 500, 500); // This is input space rectangle
  
  strokeWeight(1);
  line(width/4 - 250, 0, width/4 + 250, 0);
  line(width/4, -250, width/4, 250);
  fill(0, 0, 0);
  textSize(15);
  textAlign(CENTER, CENTER);
  text("0", width / 4 + 7.5, 10);
  text("X", width / 4 - 257.5, -2.5);
  text("Y", width / 4, 262.5);
  
  fill(0);
  textAlign(LEFT, TOP);
  textSize(15);
  scale(-1, 1); 
  text("Alpha = " + nf(alpha, 1, 2), -width + 340, -height/2 + 70+610);
  text("Epsilon = " + nf(epsilon, 1, 2), -width + 340, -height/2 + 20+610);
  text("Model Rotation Speed:", -width + 50, -height/2 + 100);
  text("Unscaled Gradient:", -width + 510, -height/2 + 50+610);
  text("Current coordinates: (" + nf(current_point_coords[0], 1, 2) + ", " + nf(current_point_coords[1], 1, 2) + ", L=" + nf(compute_loss(current_point_coords[0], current_point_coords[1]), 1, 3) + ")", -width + 835, -height/2 + 20+610);
  if(status === 2) {
    textSize(20);
    fill(c1);
    text("Loss minimized at (" + nf(current_point_coords[0], 1, 2) + ", " + nf(current_point_coords[1], 1, 2) + ", L=" + nf(compute_loss(current_point_coords[0], current_point_coords[1]), 1, 3) + ")", -width, -height/2 + 500);
    fill(0);
    textSize(15);
  }
  scale(-1, 1); 
  
  let localMouse = localMouseCoords();

  fill(c1);
  stroke(c1);
  strokeWeight(2);
  
  let gradient = compute_gradient(current_point_coords[0], current_point_coords[1]);
  
  line(320+250, 280, 320+250 - epsilon*250, 280);
  line(320+250, 275, 320+250, 285);
  line(320+250 - epsilon*250, 275, 320+250 - epsilon*250, 285);
  
  fill(c7);
  stroke(c7);
  arrow(320+250, 300+30, 320+250 - compute_length(gradient)*alpha*250, 300+30, compute_length(gradient)*alpha*25);
  
  arrow(320+250, 310, 320+250 - compute_length(gradient)*250, 310, compute_length(gradient)*25);
  
  fill(c4);
  stroke(c4);
  
  //console.log(gradient);
  
  arrow(320-current_point_coords[0]*250, current_point_coords[1]*250, 320-(current_point_coords[0] - gradient[0]*alpha)*250, (current_point_coords[1] - gradient[1]*alpha)*250, compute_length(gradient)*alpha*50);
  
  draw_arrow_path(arrow_path);
  //current_point_coords = [current_point_coords[0] - gradient[0]*alpha, current_point_coords[1] - gradient[1]*alpha]
  
  fill(c7);
  stroke(c7);
  noStroke();
  translate(0, 0, 100);
  
  if(Math.abs(localMouse[0]) <= 250 && Math.abs(localMouse[1]) <= 250 && status == 0) {
    //console.log('yes');
    circle(320-localMouse[0], localMouse[1], 10);
    let x = localMouse[0] / 250;
    let y = localMouse[1] / 250;
  }
  circle(320-current_point_coords[0]*250, current_point_coords[1]*250, 10);
  translate(0, 0, -100);
  pop();
  
  angle += rotSlider.value();
}

function arrow(x1, y1, x2, y2, offset) {
  // this code is to make the arrow point
  line(x1,y1,x2,y2)
  push() //start new drawing state
  var angle = atan2(y1 - y2, x1 - x2); //gets the angle of the line
  translate(x2, y2); //translates to the destination vertex
  rotate(angle - HALF_PI); //rotates the arrow point
  triangle(-offset * 0.6, offset*1.5, offset * 0.6, offset*1.5, 0, 0); //draws the arrow point as a triangle
  pop();
}

function mouseClicked() {
  
  let localMouse = localMouseCoords();
  
  if(Math.abs(localMouse[0]) <= 250 && Math.abs(localMouse[1]) <= 250 && status == 0) {
    let x = localMouse[0] / 250;
    let y = localMouse[1] / 250;
    
    current_point_coords = [x, y];
    arrow_path = [current_point_coords];
  }
  
}

function updateButtons() {
  if (status === 1) {
    startButton.attribute('disabled', '');
    nextButton.removeAttribute('disabled');
    
    alphaSlider.attribute('disabled', '');
    epsilonSlider.attribute('disabled', '');
  } else if (status === 0) {
    startButton.removeAttribute('disabled');
    nextButton.attribute('disabled', '');
    
    alphaSlider.removeAttribute('disabled');
    epsilonSlider.removeAttribute('disabled');
  } else {
    startButton.attribute('disabled', '');
    nextButton.attribute('disabled', '');
    
    alphaSlider.attribute('disabled', '');
    epsilonSlider.attribute('disabled', '');
  }
}

function reset() {
  current_point_coords[0] = random(-1, 1);
  current_point_coords[1] = random(-1, 1);
  
  status = 0;
  updateButtons();
  
  arrow_path = [current_point_coords];
}

function next() {
  if(status === 1) {
    let gradient = compute_gradient(current_point_coords[0], current_point_coords[1]);
    current_point_coords = [current_point_coords[0] - gradient[0]*alpha, current_point_coords[1] - gradient[1]*alpha];
    arrow_path.push(current_point_coords);
    
    if(compute_length(compute_gradient(current_point_coords[0], current_point_coords[1]))*alpha < epsilon) {
      status = 2;
      updateButtons();
      //console.log("Ended!");
    }
  }
  
}

function start() {
  status = 1;
  updateButtons();
  if(compute_length(compute_gradient(current_point_coords[0], current_point_coords[1]))*alpha < epsilon) {
    status = 2;
    updateButtons();
    //console.log("Ended!");
  }
}


function draw_arrow_path(path) {
  for(let i = 0; i < path.length-1; i +=1) {
    arrow(320-path[i][0]*250, path[i][1]*250, 320-(path[i+1][0])*250, (path[i+1][1])*250, compute_length([path[i][0] - path[i+1][0] , path[i][1] - path[i+1][1]])*50);
  }
}

function draw_line_path_3D(path) {
  for(let i = 0; i < path.length-1; i +=1) {
    line(path[i][0], path[i][1], compute_loss(path[i][0], path[i][1]), path[i+1][0], path[i+1][1], compute_loss(path[i+1][0], path[i+1][1]));
  }
}

// === Input Space Functionality ===
function localMouseCoords() {
  // Transform mouseX and mouseY from screen to centered coordinates
  let localX = mouseX - width / 2;  // convert to WEBGL coordinate system
  let localY = mouseY - height / 2;

  // Shift for the 2D right panel
  localX -= -width / 2; // undo left translate in draw
  let panelCenterX = width / 4;
  let panelCenterY = 0;

  // Compute distance from center of the input space rect
  let dx = localX - panelCenterX;
  let dy = localY - panelCenterY;

  //return Math.abs(dx) <= 250 && Math.abs(dy) <= 250;
  return [dx - width/2, dy];
}

// === Compute Surface ===
function compute_loss(x, y) {
  let expPart = Math.exp(Math.sin(1.2*2.5 * x) + Math.cos(1.2*3 * y));
  let sqrtPart = Math.sqrt(x * x + y * y);
  return -0.25 + 0.13 * expPart + 0.4 * sqrtPart;
}

function compute_gradient(x, y) {
  let expPart = Math.exp(Math.sin(1.2*2.5 * x) + Math.cos(1.2*3 * y));
  let sqrtPart = Math.sqrt(x * x + y * y);

  let dL_dx = 0.13 * expPart*Math.cos(1.2*2.5*x) * 1.2*2.5 + (0.4 * x)/sqrtPart;
  let dL_dy = 0.13 * expPart*(-Math.sin(1.2*3*y)) * 1.2*3 + (0.4 * y)/sqrtPart;
  
  if(isNaN(dL_dx)) {
    dL_dx = 0;
  } 
  if(isNaN(dL_dy)) {
    dL_dy = 0;
  }
  

  return [dL_dx, dL_dy];
}

function compute_length(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
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
