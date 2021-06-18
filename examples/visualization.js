import { computeBoundingBox } from '3d-vehicles';

export function drawVehicle(ctx, camera, vehicleState,
  drawBoundingBox = false,
  color3D = '#00f',
  color2D = '#f00') {
  const {corners} = vehicleState;
  const points = camera.project2ImagePlane(corners);

  ctx.strokeStyle = color3D;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(points[i][0], points[i][1]);
    ctx.lineTo(points[i + 1][0], points[i + 1][1]);
  }
  ctx.lineTo(points[0][0], points[0][1]);

  for (let i = 4; i < 7; i++) {
    ctx.moveTo(points[i][0], points[i][1]);
    ctx.lineTo(points[i + 1][0], points[i + 1][1]);
  }
  ctx.lineTo(points[4][0], points[4][1]);

  for (let i = 0; i < 4; i++) {
    ctx.moveTo(points[i][0], points[i][1]);
    ctx.lineTo(points[i + 4][0], points[i + 4][1]);
  }

  const midFront = [
    (points[0][0] + points[3][0]) / 2,
    (points[0][1] + points[3][1]) / 2,
  ];
  ctx.moveTo(points[1][0], points[1][1]);
  ctx.lineTo(midFront[0], midFront[1]);
  ctx.lineTo(points[2][0], points[2][1]);

  ctx.stroke();
  ctx.closePath();

  if (drawBoundingBox) {
    ctx.strokeStyle = color2D;
    const box = computeBoundingBox(camera, vehicleState);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
}
