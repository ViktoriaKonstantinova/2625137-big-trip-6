import Observable from '../framework/observable.js';

export default class OffersModel extends Observable {
  #offers = [];

  setOffers(offers) {
    this.#offers = offers;
    this._notify('MAJOR', null);
  }

  getOffers() {
    return this.#offers;
  }

  getOffersByType(type) {
    const offerGroup = this.#offers.find((group) => group.type === type);
    return offerGroup ? offerGroup.offers : [];
  }
}
