import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

const getEmptyPoint = () => ({
  id: null,
  type: 'flight',
  basePrice: 0,
  dateFrom: new Date().toISOString(),
  dateTo: new Date(Date.now() + 3600000).toISOString(),
  destination: null,
  offers: [],
  isFavorite: false,
});

const formatDateTimeForInput = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const createTypeOptions = (currentType, types) => types.map((type) => `
  <div class="event__type-item">
    <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === currentType ? 'checked' : ''}>
    <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
  </div>
`).join('');

const createOffersHtml = (offers, selectedOffers) => offers.map((offer) => `
  <div class="event__offer-selector">
    <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer" value="${offer.id}" ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
    <label class="event__offer-label" for="event-offer-${offer.id}-1">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </label>
  </div>
`).join('');

const createDestinationPhotosHtml = (pictures) => pictures.map((pic) => `
  <img class="event__photo" src="${pic.src}" alt="${pic.description}">
`).join('');

const createCreateFormTemplate = (state, types, availableOffers, destinationDetails) => {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers: selectedOffers,
  } = state;

  const destinationName = destination?.name || '';
  const destinationDescription = destinationDetails?.description || '';
  const destinationPictures = destinationDetails?.pictures || [];

  const typeOptionsHtml = createTypeOptions(type, types);
  const offersHtml = availableOffers.length
    ? createOffersHtml(availableOffers, selectedOffers)
    : 'No offers available';
  const destinationPhotosHtml = createDestinationPhotosHtml(destinationPictures);

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
          <label class="event__label event__type-output" for="event-destination-1">${type}</label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" autocomplete="off">
          <datalist id="destination-list-1">
            ${types.map((t) => `<option value="${t}"></option>`).join('')}
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
          <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>
          <div class="event__available-offers">
            ${offersHtml}
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

export default class CreateFormView extends AbstractStatefulView {
  #destinationsModel = null;
  #offersModel = null;
  #onSubmit = null;
  #onCancel = null;
  #types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

  constructor(destinationsModel, offersModel, onSubmit, onCancel) {
    super();
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#onSubmit = onSubmit;
    this.#onCancel = onCancel;
    this._setState(getEmptyPoint());
  }

  get template() {
    const availableOffers = this.#offersModel.getOffersByType(this._state.type);
    const destinationDetails = this._state.destination
      ? this.#destinationsModel.getDestinationById(this._state.destination.id)
      : null;
    return createCreateFormTemplate(this._state, this.#types, availableOffers, destinationDetails);
  }

  _restoreHandlers() {
    const element = this.element;
    const form = element.querySelector('form');
    const rollupBtn = element.querySelector('.event__rollup-btn');
    const typeInputs = element.querySelectorAll('.event__type-input');
    const destinationInput = element.querySelector('.event__input--destination');
    const priceInput = element.querySelector('.event__input--price');
    const startTimeInput = element.querySelector('#event-start-time-1');
    const endTimeInput = element.querySelector('#event-end-time-1');
    const offersCheckboxes = element.querySelectorAll('.event__offer-checkbox');

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#onSubmit(this._state);
    });

    rollupBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.#onCancel();
    });

    typeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.#handleTypeChange(input.value);
        }
      });
    });

    destinationInput.addEventListener('change', () => {
      const destinationName = destinationInput.value;
      const destination = this.#destinationsModel.getAllDestinations().find((d) => d.name === destinationName);
      if (destination) {
        this.#handleDestinationChange(destination);
      }
    });

    priceInput.addEventListener('change', () => {
      this.updateElement({ basePrice: parseInt(priceInput.value, 10) });
    });

    startTimeInput.addEventListener('change', () => {
      this.updateElement({ dateFrom: new Date(startTimeInput.value).toISOString() });
    });

    endTimeInput.addEventListener('change', () => {
      this.updateElement({ dateTo: new Date(endTimeInput.value).toISOString() });
    });

    offersCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const offerId = checkbox.value;
        let newOffers = [...this._state.offers];
        if (checkbox.checked) {
          newOffers.push(offerId);
        } else {
          newOffers = newOffers.filter((id) => id !== offerId);
        }
        this.updateElement({ offers: newOffers });
      });
    });
  }

  #handleTypeChange(newType) {
    const newState = {
      ...this._state,
      type: newType,
      offers: [],
    };
    this.updateElement(newState);
  }

  #handleDestinationChange(destination) {
    this.updateElement({ destination });
  }
}
