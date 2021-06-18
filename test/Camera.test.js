import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
import { Camera } from '../index';
import config from './config';

expect.extend({ toBeDeepCloseTo });

test('project from world coordinate system to image plane and back', () => {
  const points = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 2, 3]];
  const camera = new Camera(config.CAMERA_MATRIX);
  const imagePoints = camera.project2ImagePlane(points);
  const worldPoints = camera.project2GroundPlane(imagePoints, [0, 0, 0, 3]);
  expect(worldPoints).toBeDeepCloseTo(points);
});
