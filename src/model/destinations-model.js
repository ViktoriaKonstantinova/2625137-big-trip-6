import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = [];

  setDestinations(destinations) {
    this.#destinations = destinations;
    this._notify('MAJOR', null);
  }

  getDestinations() {
    return this.#destinations;
  }

  getDestinationById(id) {
    return this.#destinations.find((dest) => dest.id === id) || null;
  }
}
