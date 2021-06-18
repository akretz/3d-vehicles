import { Camera, VehicleState, computeBoundingBox } from '../index';
import config from './config';

test('compute outer corners of 3D vehicle', () => {
  const camera = new Camera(config.CAMERA_MATRIX);

  const vehicleStates = [
    new VehicleState(0, 0, 4, 2, 1.5, 0),
    new VehicleState(15, 6, 4, 2, 1.5, 1.5),
  ];

  const outerCorners = vehicleStates.map((state) => computeBoundingBox(camera, state).outerCorners);

  expect(outerCorners).toStrictEqual([
    {
      top: [0.25, 0.5, 1],
      left: [-0.5, 0.5, 0],
      bottom: [-0.5, -0.5, 0],
      right: [0.5, -0.5, 0],
    },
    {
      top: [0.25, -0.5, 1],
      left: [0.5, 0.5, 0],
      bottom: [-0.5, 0.5, 0],
      right: [-0.5, -0.5, 0],
    },
  ]);
});
