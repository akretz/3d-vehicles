import * as math from 'mathjs';

export default class Camera {
  constructor(cameraMatrix) {
    this.cameraMatrix = math.matrix(cameraMatrix);
  }

  project2ImagePlane(points) {
    let p = math.matrix(points);
    const n = p.size()[0];

    p = math.concat(p, math.ones(n, 1));
    const result = math.multiply(p, math.transpose(this.cameraMatrix));

    return result
      .subset(math.index(math.range(0, n), [0, 1]))
      .map((value, index) => value / result.subset(math.index(index[0], 2)))
      .toArray();
  }

  project2GroundPlane(points, offset = 0) {
    const n = points.length;
    let offsets = offset;
    if (!Array.isArray(offset)) {
      offsets = Array(n).fill(offset);
    }

    const m = this.cameraMatrix.toArray();
    return points.map((p, i) => {
      const o = offsets[i];
      const A = math.matrix([
        [m[0][0] - m[2][0] * p[0], m[0][1] - m[2][1] * p[0]],
        [m[1][0] - m[2][0] * p[1], m[1][1] - m[2][1] * p[1]],
      ]);
      const b = math.matrix([
        -m[0][2] * o - m[0][3] + m[2][2] * o * p[0] + m[2][3] * p[0],
        -m[1][2] * o - m[1][3] + m[2][2] * o * p[1] + m[2][3] * p[1],
      ]);
      return math.multiply(math.inv(A), b).toArray().concat([o]);
    });
  }

  depths(points) {
    let p = math.matrix(points);
    const n = p.size()[0];

    p = math.concat(p, math.ones(n, 1));
    return math.squeeze(
      math.multiply(p, math.transpose(
        this.cameraMatrix.subset(math.index([2], [0, 1, 2, 3])),
      )),
    ).toArray();
  }
}
