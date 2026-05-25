import ApiService from '../framework/api-service.js';

const Methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class Api extends ApiService {
  getPoints() {
    return this._load({ url: 'points' }).then(ApiService.parseResponse);
  }

  getDestinations() {
    return this._load({ url: 'destinations' }).then(ApiService.parseResponse);
  }

  getOffers() {
    return this._load({ url: 'offers' }).then(ApiService.parseResponse);
  }

  updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Methods.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).then(ApiService.parseResponse);
  }

  addPoint(point) {
    return this._load({
      url: 'points',
      method: Methods.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).then(ApiService.parseResponse);
  }

  deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: Methods.DELETE,
    });
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'is_favorite': point.isFavorite,
    };
    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;
    return adaptedPoint;
  }
}
