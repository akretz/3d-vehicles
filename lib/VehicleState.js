import * as math from 'mathjs';

export default class VehicleState {
  constructor(x, y, length, width, height, orientation, speed = 0, turningRate = 0) {
    this.state = [x, y, length, width, height, orientation, speed, turningRate];
  }

  get x() { return this.state[0]; }

  get y() { return this.state[1]; }

  get length() { return this.state[2]; }

  get width() { return this.state[3]; }

  get height() { return this.state[4]; }

  get orientation() { return this.state[5]; }

  get speed() { return this.state[6]; }

  get turningRate() { return this.state[7]; }

  get corners() {
    return VehicleState.CORNERS.map((corner) => {
      const m = math.matrix(VehicleState.getProjectionMatrix(this.orientation, corner));
      return math.multiply(m, [this.x, this.y, this.length, this.width, this.height, 0]).toArray();
    });
  }

  static getProjectionMatrix(orientation, corner, offset = 0) {
    return [
      [1, 0, corner[0] * Math.cos(orientation), -corner[1] * Math.sin(orientation), 0, offset * Math.cos(orientation)],
      [0, 1, corner[0] * Math.sin(orientation), corner[1] * Math.cos(orientation), 0, offset * Math.sin(orientation)],
      [0, 0, 0, 0, corner[2], 0],
    ];
  }
}

VehicleState.CORNERS = [
  [0.5, 0.5, 0], // front left bottom
  [-0.5, 0.5, 0], // back left bottom
  [-0.5, -0.5, 0], // back right bottom
  [0.5, -0.5, 0], // front right bottom
  [0.25, 0.5, 1], // front left top
  [-0.25, 0.5, 1], // back left top
  [-0.25, -0.5, 1], // back right top
  [0.25, -0.5, 1], // front right top
];
