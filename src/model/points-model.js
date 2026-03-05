import { getMockPoints } from '../mock/point-mock.js';

class PointsModel {
  constructor() {
    this._points = getMockPoints();
  }

  getPoints() {
    return this._points;
  }
}

export default PointsModel;
