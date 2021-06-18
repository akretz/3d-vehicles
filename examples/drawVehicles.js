import { Camera, VehicleState } from '3d-vehicles';
import canvas from 'canvas';
import fs from 'fs';
import { drawVehicle } from './visualization';
import config from './config';

const camera = new Camera(config.CAMERA_MATRIX);
const vehicleStates = [
  new VehicleState(0, 0, 4, 2, 1.5, 0),
  new VehicleState(5, 2, 4, 2, 1.5, 0.5),
  new VehicleState(10, 4, 4, 2, 1.5, 1),
  new VehicleState(15, 6, 4, 2, 1.5, 1.5),
];

const c = canvas.createCanvas(960, 600);
const ctx = c.getContext('2d');
vehicleStates.forEach((vehicleState) => drawVehicle(ctx, camera, vehicleState, true));

fs.writeFileSync('vehicles.png', c.toBuffer('image/png'));
