import { Camera, Tracker } from '3d-vehicles';
import canvas from 'canvas';
import fs from 'fs';
import config from './config';
import { drawVehicle } from './visualization';

const camera = new Camera(config.CAMERA_MATRIX);
const tracker = new Tracker(camera);

const BOXES = [
  { x: 669, y: 303, width: 181, height: 74 },
  { x: 570, y: 276, width: 139, height: 61 },
];

function drawBoxes(ctx, boxes) {
  ctx.strokeStyle = '#f00';
  boxes.forEach((box) => {
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  });
}

const c = canvas.createCanvas(960, 600);
const ctx = c.getContext('2d');
drawBoxes(ctx, BOXES);
tracker.update(0, BOXES[0]);
const vehicleState = tracker.update(5, BOXES[1]);
drawVehicle(ctx, camera, vehicleState, true);

fs.writeFileSync('vehicle_fit.png', c.toBuffer('image/png'));
