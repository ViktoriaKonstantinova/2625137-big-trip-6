import { offers } from '../mock/offer-mock.js';

class OffersModel {
  constructor() {
    this._offers = offers;
  }

  getOffers() {
    return this._offers;
  }

  getOffersByType(type) {
    const offerGroup = this._offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }
}

export default OffersModel;
