import { Camera, computeBoundingBox, Tracker } from '../index';
import config from './config';

test('remove old boxes', () => {
  const camera = new Camera(config.CAMERA_MATRIX);
  const tracker = new Tracker(camera, 10);
  tracker.update(0, {
    x: 10, y: 10, w: 40, h: 20,
  });
  expect(tracker.boxes.get(0)).toBeDefined();
  tracker.update(5, {
    x: 10, y: 10, w: 40, h: 20,
  });
  expect(tracker.boxes.get(0)).toBeDefined();
  expect(tracker.boxes.get(5)).toBeDefined();
  tracker.update(11, {
    x: 10, y: 10, w: 40, h: 20,
  });
  expect(tracker.boxes.get(0)).toBeUndefined();
  expect(tracker.boxes.get(5)).toBeDefined();
  expect(tracker.boxes.get(11)).toBeDefined();
});

test('fit initial 3d box', () => {
  const BOXES = [
    { x: 669, y: 303, width: 181, height: 74 },
    { x: 570, y: 276, width: 139, height: 61 },
  ];
  const camera = new Camera(config.CAMERA_MATRIX);
  const tracker = new Tracker(camera, 10);
  tracker.update(0, BOXES[0]);
  const vehicleState = tracker.update(5, BOXES[1]);
  const { box } = computeBoundingBox(camera, vehicleState);

  expect(box.x).toBeGreaterThan(BOXES[1].x - 5);
  expect(box.x).toBeLessThan(BOXES[1].x + 5);
  expect(box.y).toBeGreaterThan(BOXES[1].y - 5);
  expect(box.y).toBeLessThan(BOXES[1].y + 5);
  expect(box.width).toBeGreaterThan(BOXES[1].width - 5);
  expect(box.width).toBeLessThan(BOXES[1].width + 5);
  expect(box.height).toBeGreaterThan(BOXES[1].height - 5);
  expect(box.height).toBeLessThan(BOXES[1].height + 5);
});
