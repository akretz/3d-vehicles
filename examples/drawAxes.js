import { Camera } from '3d-vehicles';
import canvas from 'canvas';
import fs from 'fs';
import config from './config';

const AXES_COORDS = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]];
const COLORS = [
  '#f00',
  '#0f0',
  '#00f'];
const camera = new Camera(config.CAMERA_MATRIX);

const points = camera.project2ImagePlane(AXES_COORDS);
const c = canvas.createCanvas(960, 600);
const ctx = c.getContext('2d');
COLORS.forEach((color, index) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  ctx.lineTo(points[index + 1][0], points[index + 1][1]);
  ctx.stroke();
});

fs.writeFileSync('axes.png', c.toBuffer('image/png'));
