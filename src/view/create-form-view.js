import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { formatDate } from '../utils/points-utils.js';

const getEmptyPoint = () => ({
  id: null,
  type: 'flight',
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
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

  const formattedDateFrom = dateFrom ? formatDate(dateFrom, 'd/m/y H:i') : '';
  const formattedDateTo = dateTo ? formatDate(dateTo, 'd/m/y H:i') : '';

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
        <button class="event__reset-btn" type="reset">Cancel</button>
        <button class="event__rollup-btn" type="button">
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
        ${(destinationDescription || destinationPictures.length) ? `
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          ${destinationDescription ? `<p class="event__destination-description">${destinationDescription}</p>` : ''}
          ${destinationPictures.length ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationPhotosHtml}
            </div>
          </div>
          ` : ''}
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
        const label = checkbox.closest('.event__offer-selector')?.querySelector('.event__offer-label');
        if (label) {
          label.addEventListener('click', (evt) => {
            evt.preventDefault();
            checkbox.checked = !checkbox.checked;
            const changeEvent = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(changeEvent);
          });
        }
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
    const saveButton = this.element?.querySelector('.event__save-btn');
    const destinationInput = this.element?.querySelector('.event__input--destination');
    const priceInput = this.element?.querySelector('.event__input--price');
    const typeInputs = this.element?.querySelectorAll('.event__type-input');
    const offersCheckboxes = this.element?.querySelectorAll('.event__offer-checkbox');
    const startTimeInput = this.element?.querySelector('#event-start-time-1');
    const endTimeInput = this.element?.querySelector('#event-end-time-1');

    if (saveButton) {
      saveButton.textContent = isSaving ? 'Saving...' : 'Save';
      if (isSaving) {
        saveButton.setAttribute('disabled', 'disabled');
      } else {
        saveButton.removeAttribute('disabled');
      }
    }

    if (destinationInput) {
      if (isSaving) {
        destinationInput.setAttribute('disabled', 'disabled');
      } else {
        destinationInput.removeAttribute('disabled');
      }
    }

    if (priceInput) {
      if (isSaving) {
        priceInput.setAttribute('disabled', 'disabled');
      } else {
        priceInput.removeAttribute('disabled');
      }
    }

    if (typeInputs) {
      typeInputs.forEach((input) => {
        if (isSaving) {
          input.setAttribute('disabled', 'disabled');
        } else {
          input.removeAttribute('disabled');
        }
      });
    }

    if (offersCheckboxes) {
      offersCheckboxes.forEach((checkbox) => {
        if (isSaving) {
          checkbox.setAttribute('disabled', 'disabled');
        } else {
          checkbox.removeAttribute('disabled');
        }
      });
    }

    if (startTimeInput) {
      if (isSaving) {
        startTimeInput.setAttribute('disabled', 'disabled');
      } else {
        startTimeInput.removeAttribute('disabled');
      }
    }

    if (endTimeInput) {
      if (isSaving) {
        endTimeInput.setAttribute('disabled', 'disabled');
      } else {
        endTimeInput.removeAttribute('disabled');
      }
    }
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
      onChange: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 0) {
          return;
        }
        if (instance.element.id === 'event-start-time-1') {
          this._state.dateFrom = selectedDates[0].toISOString();
          if (this.#flatpickrEnd) {
            this.#flatpickrEnd.set('minDate', selectedDates[0]);
          }
        } else {
          this._state.dateTo = selectedDates[0].toISOString();
        }
        return false;
      },
    };

    if (this._state.dateFrom) {
      this.#flatpickrStart = flatpickr(startInput, {
        ...commonConfig,
        defaultDate: new Date(this._state.dateFrom),
        minDate: 'today',
      });
    } else {
      this.#flatpickrStart = flatpickr(startInput, {
        ...commonConfig,
        defaultDate: null,
        minDate: 'today',
      });
      startInput.value = '';
    }

    if (this._state.dateTo) {
      const minDate = this._state.dateFrom ? new Date(this._state.dateFrom) : 'today';
      this.#flatpickrEnd = flatpickr(endInput, {
        ...commonConfig,
        defaultDate: new Date(this._state.dateTo),
        minDate: minDate,
      });
    } else {
      this.#flatpickrEnd = flatpickr(endInput, {
        ...commonConfig,
        defaultDate: null,
        minDate: this._state.dateFrom ? new Date(this._state.dateFrom) : 'today',
      });
      endInput.value = '';
    }
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
