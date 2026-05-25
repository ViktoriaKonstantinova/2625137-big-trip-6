import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { formatDate } from '../utils/points-utils.js';

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

const createDestinationOptions = (destinations) => destinations.map((dest) => `
  <option value="${dest.name}"></option>
`).join('');

const createCreateFormTemplate = (state, types, availableOffers, destinationDetails, allDestinations, isSaving) => {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers: selectedOffers,
  } = state;

  const formattedDateFrom = formatDate(dateFrom, 'd/m/y H:i');
  const formattedDateTo = formatDate(dateTo, 'd/m/y H:i');

  const destinationName = destination?.name || '';
  const destinationDescription = destinationDetails?.description || '';
  const destinationPictures = destinationDetails?.pictures || [];

  const typeOptionsHtml = createTypeOptions(type, types);
  const offersHtml = availableOffers.length
    ? createOffersHtml(availableOffers, selectedOffers)
    : '<p class="event__offers-empty">No offers available</p>';
  const destinationPhotosHtml = createDestinationPhotosHtml(destinationPictures);
  const destinationOptionsHtml = createDestinationOptions(allDestinations);

  const saveButtonText = isSaving ? 'Saving...' : 'Save';
  const disabledAttr = isSaving ? 'disabled' : '';

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
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" autocomplete="off" ${disabledAttr}>
          <datalist id="destination-list-1">
            ${destinationOptionsHtml}
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formattedDateFrom}" autocomplete="off" readonly ${disabledAttr}>
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formattedDateTo}" autocomplete="off" readonly ${disabledAttr}>
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" ${disabledAttr}>
        </div>

        <button class="event__save-btn btn btn--blue" type="submit" ${disabledAttr}>${saveButtonText}</button>
        <button class="event__reset-btn" type="reset" ${disabledAttr}>Cancel</button>
        <button class="event__rollup-btn" type="button" ${disabledAttr}>
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        ${availableOffers.length ? `
        <section class="event__section event__section--offers">
          <h3 class="event__section-title event__section-title--offers">Offers</h3>
          <div class="event__available-offers">
            ${offersHtml}
          </div>
        </section>
        ` : ''}
        ${destinationDetails ? `
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${destinationDescription}</p>
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationPhotosHtml}
            </div>
          </div>
        </section>
        ` : ''}
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
  #flatpickrStart = null;
  #flatpickrEnd = null;
  #onEscKeyDown = null;
  #isSaving = false;

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
    const allDestinations = this.#destinationsModel.getDestinations();
    return createCreateFormTemplate(this._state, this.#types, availableOffers, destinationDetails, allDestinations, this.#isSaving);
  }

  _restoreHandlers() {
    const element = this.element;
    const form = element.querySelector('form');
    const rollupBtn = element.querySelector('.event__rollup-btn');
    const cancelBtn = element.querySelector('.event__reset-btn');
    const typeInputs = element.querySelectorAll('.event__type-input');
    const destinationInput = element.querySelector('.event__input--destination');
    const priceInput = element.querySelector('.event__input--price');
    const startTimeInput = element.querySelector('#event-start-time-1');
    const endTimeInput = element.querySelector('#event-end-time-1');
    const offersCheckboxes = element.querySelectorAll('.event__offer-checkbox');

    if (!this.#isSaving) {
      form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        if (!this._state.destination) {
          this.shake();
          return;
        }
        if (this._state.basePrice <= 0) {
          this.shake();
          return;
        }
        this.#onSubmit(this._state);
      });

      rollupBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.#onCancel();
      });

      cancelBtn.addEventListener('click', (evt) => {
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
        const allDestinations = this.#destinationsModel.getDestinations();
        const destination = allDestinations.find((d) => d.name === destinationName);
        if (destination) {
          this.#handleDestinationChange(destination);
        } else {
          this.updateElement({ destination: null });
        }
      });

      priceInput.addEventListener('change', () => {
        const newPrice = parseInt(priceInput.value, 10);
        if (!isNaN(newPrice)) {
          this.updateElement({ basePrice: newPrice });
        }
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

    this.#initFlatpickr(startTimeInput, endTimeInput);
    this.#addEscHandler();
  }

  setSaving(isSaving) {
    this.#isSaving = isSaving;
    this.updateElement({});
  }

  #initFlatpickr(startInput, endInput) {
    if (this.#flatpickrStart) {
      this.#flatpickrStart.destroy();
    }
    if (this.#flatpickrEnd) {
      this.#flatpickrEnd.destroy();
    }

    const commonConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
      locale: { firstDayOfWeek: 1 },
      onClose: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 0) {
          return;
        }
        if (instance.element.id === 'event-start-time-1') {
          this.updateElement({ dateFrom: selectedDates[0].toISOString() });
          if (this.#flatpickrEnd) {
            this.#flatpickrEnd.set('minDate', selectedDates[0]);
          }
        } else {
          this.updateElement({ dateTo: selectedDates[0].toISOString() });
        }
      },
    };

    this.#flatpickrStart = flatpickr(startInput, {
      ...commonConfig,
      defaultDate: this._state.dateFrom,
      minDate: 'today',
    });

    this.#flatpickrEnd = flatpickr(endInput, {
      ...commonConfig,
      defaultDate: this._state.dateTo,
      minDate: this._state.dateFrom,
    });
  }

  #addEscHandler() {
    this.#onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this.#onCancel();
      }
    };
    document.addEventListener('keydown', this.#onEscKeyDown);
  }

  #removeEscHandler() {
    if (this.#onEscKeyDown) {
      document.removeEventListener('keydown', this.#onEscKeyDown);
      this.#onEscKeyDown = null;
    }
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
