
function compute_loss(x, y) {
  let expPart = Math.exp(Math.sin(2.5 * x) + Math.cos(3 * y));
  let sqrtPart = Math.sqrt(x * x + y * y);
  return -0.25 + 0.13 * expPart + 0.4 * sqrtPart;
  
}

function compute_gradient(x, y) {
  let expPart = Math.exp(Math.sin(2.5 * x) + Math.cos(3 * y));
  let sqrtPart = Math.sqrt(x * x + y * y);

  let dL_dx = 0.13 * expPart*Math.cos(2.5*x) * 2.5 + (0.4 * x)/sqrtPart;
  let dL_dy = 0.13 * expPart*(-Math.sin(3*y)) * 3 + (0.4 * y)/sqrtPart;

  return [dL_dx, dL_dy];
}

function get_loss_surface_points(x_min, x_max, y_min, y_max, x_res, y_res) {
  const points = [];

  const x_step = (x_max - x_min) / (x_res - 1);
  const y_step = (y_max - y_min) / (y_res - 1);

  for (let i = 0; i < x_res; i++) {
    const row = [];
    const x = x_min + i * x_step;
    for (let j = 0; j < y_res; j++) {
      const y = y_min + j * y_step;
      const z = compute_loss(x, y);
      row.push([x, y, z]);
    }
    points.push(row);
  }

  return points;
}

function setup() {
  createCanvas(700, 700);
  console.log(get_loss_surface_points(-1, 1, -1, 1, 100, 100));
}

function draw() {
  background("black");
  ellipse(100, 100, 100, 100);
}
