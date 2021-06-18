import * as math from 'mathjs';
import VehicleState from './VehicleState';
import { computeBoundingBox } from './util';

function removeOldObjects(map, currentFrameId, maxAge) {
  map.forEach((value, frameId) => {
    if (frameId < currentFrameId - maxAge) {
      map.delete(frameId);
    }
  });
}

function getBottomCenter(box) {
  return [box.x + box.width / 2, box.y + box.height];
}

const SHAPE_PRIOR_VALUES = [4, 2, 1.5];
const SHAPE_PRIOR_WEIGHT = 10;

function createLeastSquaresMatrix(cameraMatrix, box, orientation, outerCorners, offset = 0) {
  const tmp = cameraMatrix.subset(math.index([0, 1, 0, 1], [0, 1, 2, 3]));
  const tmp2 = cameraMatrix.subset(math.index([2, 2, 2, 2], [0, 1, 2, 3]));
  const tmp3 = math.diag([box.x, box.y, box.x + box.width, box.y + box.height]);
  const tmp4 = math.subtract(tmp, math.multiply(tmp3, tmp2));

  const A = math.concat(
    math.multiply(
      tmp4.subset(math.index(0, [0, 1, 2])),
      VehicleState.getProjectionMatrix(orientation, outerCorners.left, offset),
    ),
    math.multiply(
      tmp4.subset(math.index(1, [0, 1, 2])),
      VehicleState.getProjectionMatrix(orientation, outerCorners.top, offset),
    ),
    math.multiply(
      tmp4.subset(math.index(2, [0, 1, 2])),
      VehicleState.getProjectionMatrix(orientation, outerCorners.right, offset),
    ),
    math.multiply(
      tmp4.subset(math.index(3, [0, 1, 2])),
      VehicleState.getProjectionMatrix(orientation, outerCorners.bottom, offset),
    ),
    0,
  );

  const b = math.dotMultiply(-1, math.squeeze(tmp4.subset(math.index([0, 1, 2, 3], 3))));
  return { A, b };
}

function solveLeastSquares(A, b) {
  return math.multiply(
    math.multiply(
      math.inv(math.multiply(math.transpose(A), A)),
      math.transpose(A),
    ),
    b,
  ).toArray();
}

export default class Tracker {
  constructor(camera, maxFrameAge = 20) {
    this.camera = camera;
    this.maxFrameAge = maxFrameAge;
    this.state = null;
    this.boxes = new Map();
  }

  update(frameId, box) {
    removeOldObjects(this.boxes, frameId, this.maxFrameAge);
    const previousFrameIds = Array.from(this.boxes.keys());
    const previousBoxes = Array.from(this.boxes.values());
    this.boxes.set(frameId, box);

    // We don't know where the vehicle is located in real world coordinates, so
    // we just assume that the bottom center of the 2D bounding box is on the
    // ground plane and use this point as an approximation for the vehicle's
    // position.
    const previousPoints = this.camera.project2GroundPlane(
      previousBoxes.map(getBottomCenter),
    );
    const currentPoint = this.camera.project2GroundPlane(
      [getBottomCenter(box)],
    )[0];

    const movements = previousPoints.map(
      (point) => [currentPoint[0] - point[0], currentPoint[1] - point[1]],
    );
    const distances = movements.map((x) => Math.hypot(...x));
    const orientations = movements.map((x) => Math.atan2(x[1], x[0]));

    for (let i = orientations.length - 1; i >= 0; i--) {
      if (distances[i] > 2) {
        const orientation = orientations[i];
        const previousBox = previousBoxes[i];
        const previousPoint = previousPoints[i];
        const previousFrameId = previousFrameIds[i];

        const [currentDepth, previousDepth] = this.camera.depths(
          [currentPoint,
            previousPoint],
        );

        const { outerCorners } = computeBoundingBox(
          this.camera,
          new VehicleState(
            currentPoint[0], currentPoint[1], 4, 2, 1.5, orientation,
          ),
        );
        const previousOuterCorners = computeBoundingBox(
          this.camera,
          new VehicleState(
            previousPoint[0], previousPoint[1], 4, 2, 1.5, orientation,
          ),
        ).outerCorners;

        const M1 = createLeastSquaresMatrix(
          this.camera.cameraMatrix, box, orientation, outerCorners,
        );
        const M2 = createLeastSquaresMatrix(
          this.camera.cameraMatrix, previousBox, orientation, previousOuterCorners, -1,
        );
        let A = math.concat(
          math.dotDivide(M1.A, currentDepth),
          math.dotDivide(M2.A, previousDepth),
          0,
        );
        let b = math.concat(
          math.dotDivide(M1.b, currentDepth),
          math.dotDivide(M2.b, previousDepth),
        );

        // If we don't add a shape prior, weird things can happen; for example
        // we might get a shape with negative numbers.
        A = math.concat(
          A,
          [
            [0, 0, SHAPE_PRIOR_WEIGHT, 0, 0, 0],
            [0, 0, 0, SHAPE_PRIOR_WEIGHT, 0, 0],
            [0, 0, 0, 0, SHAPE_PRIOR_WEIGHT, 0]],
          0,
        );
        b = math.concat(
          b,
          [
            SHAPE_PRIOR_VALUES[0] * SHAPE_PRIOR_WEIGHT,
            SHAPE_PRIOR_VALUES[1] * SHAPE_PRIOR_WEIGHT,
            SHAPE_PRIOR_VALUES[2] * SHAPE_PRIOR_WEIGHT],
        );

        // x, y, length, width, height, movement
        const state = solveLeastSquares(A, b);

        this.state = new VehicleState(
          state[0],
          state[1],
          state[2],
          state[3],
          state[4],
          orientation,
          state[5] / (frameId - previousFrameId),
        );
        break;
      }
    }

    return this.state;
  }

  estimateMovement(boxes) {
    const firstBox = boxes[0];
    const [lastBox] = boxes.slice(-1);
    const points = this.camera.project2RoadPlane([firstBox, lastBox].map(getBottomCenter));
    return [points[1][0] - points[0][0], points[1][1] - points[0][1]];
  }
}
