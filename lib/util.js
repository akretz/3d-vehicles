import VehicleState from './VehicleState';

export function computeBoundingBox(camera, vehicleState) {
  const { corners } = vehicleState;
  const points = camera.project2ImagePlane(corners);
  const xx = points.map((x) => x[0]);
  const yy = points.map((x) => x[1]);
  const xMin = Math.min(...xx);
  const yMin = Math.min(...yy);
  const xMax = Math.max(...xx);
  const yMax = Math.max(...yy);

  const outerCorners = {
    left: VehicleState.CORNERS[xx.indexOf(xMin)],
    top: VehicleState.CORNERS[yy.indexOf(yMin)],
    right: VehicleState.CORNERS[xx.indexOf(xMax)],
    bottom: VehicleState.CORNERS[yy.indexOf(yMax)],
  };

  return {
    outerCorners,
    box: {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    },
  };
}
