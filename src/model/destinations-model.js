import { destinations } from '../mock/destination-mock.js';

class DestinationsModel {
  constructor() {
    this._destinations = destinations;
  }

  getDestinations() {
    return this._destinations;
  }

  getDestinationById(id) {
    return this._destinations.find((dest) => dest.id === id) || null;
  }
}

export default DestinationsModel;
