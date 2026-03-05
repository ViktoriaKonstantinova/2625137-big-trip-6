import { createElement } from '../render.js';

const getDefaultPoint = () => {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    id: null,
    type: 'flight',
    basePrice: 0,
    dateFrom: now.toISOString(),
    dateTo: later.toISOString(),
    destination: null,
    offers: [],
    isFavorite: false
  };
};

const formatDateTimeForInput = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const createEditFormTemplate = (point) => {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers
  } = point;

  const destinationName = destination ? destination.name : '';
  const destinationDescription = destination ? destination.description : '';
  const destinationPictures = destination ? destination.pictures : [];

  const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
  const typeOptionsHtml = types.map((t) => `
    <div class="event__type-item">
      <input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t.charAt(0).toUpperCase() + t.slice(1)}</label>
    </div>
  `).join('');

  const offersHtml = offers.map((offer) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer" checked>
      <label class="event__offer-label" for="event-offer-${offer.id}-1">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  const destinationPhotosHtml = destinationPictures.map((pic) => `
    <img class="event__photo" src="${pic.src}" alt="${pic.description}">
  `).join('');

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${typeOptionsHtml}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
          <datalist id="destination-list-1">
            <option value="Amsterdam"></option>
            <option value="Geneva"></option>
            <option value="Chamonix"></option>
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDateTimeForInput(dateFrom)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDateTimeForInput(dateTo)}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">${point.id ? 'Delete' : 'Cancel'}</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>
          <div class="event__available-offers">
            ${offersHtml || 'No offers available'}
          </div>
        </section>

        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${destinationDescription}</p>
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationPhotosHtml}
            </div>
          </div>
        </section>
      </section>
    </form>
  </li>`;
};

export default class EditFormView {
  constructor(point = null) {
    this.point = point || getDefaultPoint();
    this.element = null;
  }

  getTemplate() {
    return createEditFormTemplate(this.point);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}

