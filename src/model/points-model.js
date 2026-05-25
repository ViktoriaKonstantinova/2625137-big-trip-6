import Observable from '../framework/observable.js';
import { adaptToClient } from '../utils/adapter.js';

export default class PointsModel extends Observable {
  #api = null;
  #points = [];

  constructor(api) {
    super();
    this.#api = api;
  }

  setPoints(points) {
    this.#points = points;
    this._notify('MAJOR', null);
  }

  getPoints() {
    return this.#points;
  }

  async updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
    if (index === -1) {
      return;
    }
    try {
      const response = await this.#api.updatePoint(updatedPoint);
      const adaptedPoint = adaptToClient(response);
      this.#points[index] = adaptedPoint;
      this._notify('MINOR', adaptedPoint);
    } catch (err) {
      throw new Error('Не удалось обновить точку');
    }
  }

  async addPoint(point) {
    try {
      const response = await this.#api.addPoint(point);
      const adaptedPoint = adaptToClient(response);
      this.#points.push(adaptedPoint);
      this._notify('MAJOR', adaptedPoint);
    } catch (err) {
      throw new Error('Не удалось добавить точку');
    }
  }

  async deletePoint(pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);
    if (index === -1) {
      return;
    }
    try {
      await this.#api.deletePoint(pointId);
      this.#points.splice(index, 1);
      this._notify('MAJOR', null);
    } catch (err) {
      throw new Error('Не удалось удалить точку');
    }
  }
}
