import { render, RenderPosition } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import ListMessageView from '../view/list-message-view.js';
import PointPresenter from './point-presenter.js';
import CreateFormView from '../view/create-form-view.js';
import { FiltersPoint, filter } from '../utils/filter-utils.js';

const EMPTY_MESSAGES = {
  [FiltersPoint.EVERYTHING]: 'Click New Event to create your first point',
  [FiltersPoint.FUTURE]: 'There are no future events now',
  [FiltersPoint.PRESENT]: 'There are no present events now',
  [FiltersPoint.PAST]: 'There are no past events now',
};

export default class TripPresenter {
  #tripEventsContainer = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointsModel = null;
  #filterModel = null;
  #pointPresenters = new Map();
  #currentSort = 'day';
  #sortComponent = null;
  #eventsList = null;
  #isCreating = false;
  #newEventButton = null;

  #tripInfo = {
    route: '',
    startDate: '',
    endDate: '',
    totalCost: 0,
  };

  constructor(tripEventsContainer, destinationsModel, offersModel, pointsModel, filterModel) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
  }

  init() {
    this.#pointsModel.addObserver(() => this.#updateTripInfoAndRender());
    this.#destinationsModel.addObserver(() => this.#updateTripInfoAndRender());
    this.#offersModel.addObserver(() => this.#updateTripInfoAndRender());
    this.#filterModel.addObserver(() => {
      this.#currentSort = 'day';
      this.#updateTripInfoAndRender();
    });
    this.#newEventButton.addEventListener('click', () => this.#handleNewEventClick());
    this.#updateTripInfoAndRender();
  }

  #updateTripInfoAndRender() {
    this.#updateTripInfo();
    this.#renderTripInfo();
    this.#renderBoard();
  }

  #updateTripInfo() {
    const points = this.#pointsModel.getPoints();
    if (points.length === 0) {
      this.#tripInfo = { route: '', dateRange: '', totalCost: 0 };
      return;
    }

    const sortedPoints = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    const firstPoint = sortedPoints[0];
    const lastPoint = sortedPoints[sortedPoints.length - 1];

    const destinations = [];
    for (const point of sortedPoints) {
      const dest = this.#destinationsModel.getDestinationById(point.destination);
      if (dest) {
        destinations.push(dest.name);
      }
    }

    let route = '';
    if (destinations.length === 0) {
      route = '';
    } else if (destinations.length === 1) {
      route = destinations[0];
    } else if (destinations.length === 2) {
      route = `${destinations[0]} — ${destinations[1]}`;
    } else {
      route = `${destinations[0]} — ... — ${destinations[destinations.length - 1]}`;
    }

    const startDate = new Date(firstPoint.dateFrom);
    const endDate = new Date(lastPoint.dateTo);
    const startDay = startDate.getDate();
    const startMonth = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const endDay = endDate.getDate();
    const endMonth = endDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const dateRange = `${startDay} ${startMonth} — ${endDay} ${endMonth}`;

    let totalCost = 0;
    for (const point of points) {
      totalCost += point.basePrice;
      const offersForType = this.#offersModel.getOffersByType(point.type);
      for (const offerId of point.offers) {
        const offer = offersForType.find((o) => o.id === offerId);
        if (offer) {
          totalCost += offer.price;
        }
      }
    }

    this.#tripInfo = { route, dateRange, totalCost };
  }

  #renderTripInfo() {
    const tripMainElement = document.querySelector('.trip-main');
    const existingInfo = tripMainElement.querySelector('.trip-info');
    if (existingInfo) {
      existingInfo.remove();
    }

    const points = this.#pointsModel.getPoints();
    if (points.length === 0) {
      return;
    }

    const tripInfoHtml = `
      <div class="trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${this.#tripInfo.route}</h1>
          <p class="trip-info__dates">${this.#tripInfo.dateRange}</p>
        </div>
        <p class="trip-info__cost">Total: € <span class="trip-info__cost-value">${this.#tripInfo.totalCost}</span></p>
      </div>
    `;
    tripMainElement.insertAdjacentHTML('afterbegin', tripInfoHtml);
  }

  #getFullPoints() {
    const points = this.#pointsModel.getPoints();
    return points.map((point) => {
      const destination = this.#destinationsModel.getDestinationById(point.destination);
      const allOffersForType = this.#offersModel.getOffersByType(point.type);
      const selectedOffers = allOffersForType.filter((offer) =>
        point.offers.includes(offer.id)
      );
      return {
        ...point,
        destination: destination,
        offers: selectedOffers,
      };
    });
  }

  #getFilteredPoints() {
    const fullPoints = this.#getFullPoints();
    const currentFilter = this.#filterModel.filter;
    return filter[currentFilter](fullPoints);
  }

  #getSortedPoints(points) {
    const sortedPoints = [...points];
    switch (this.#currentSort) {
      case 'time':
        sortedPoints.sort((a, b) => {
          const durationA = new Date(b.dateTo) - new Date(b.dateFrom);
          const durationB = new Date(a.dateTo) - new Date(a.dateFrom);
          return durationA - durationB;
        });
        break;
      case 'price':
        sortedPoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        sortedPoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
    return sortedPoints;
  }

  #clearEventsList() {
    if (this.#eventsList) {
      this.#eventsList.remove();
      this.#eventsList = null;
    }
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #clearSortComponent() {
    if (this.#sortComponent) {
      this.#sortComponent.element.remove();
      this.#sortComponent = null;
    }
  }

  #renderEmptyMessage() {
    this.#eventsList = document.createElement('ul');
    this.#eventsList.classList.add('trip-events__list');
    this.#tripEventsContainer.appendChild(this.#eventsList);
    const message = EMPTY_MESSAGES[this.#filterModel.filter] || EMPTY_MESSAGES[FiltersPoint.EVERYTHING];
    const messageView = new ListMessageView({ message });
    render(messageView, this.#eventsList);
  }

  #renderSort() {
    this.#sortComponent = new SortView(this.#currentSort, (sortType) => {
      if (this.#currentSort === sortType) {
        return;
      }
      this.#currentSort = sortType;
      this.#updateTripInfoAndRender();
    });
    render(this.#sortComponent, this.#tripEventsContainer, RenderPosition.AFTERBEGIN);
    this.#sortComponent._restoreHandlers();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this.#eventsList,
      (updatedPoint) => this.#handlePointChange(updatedPoint),
      () => this.#handleModeChange(),
      this.#destinationsModel,
      this.#offersModel
    );
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  async #handlePointChange(updatedPoint) {
    const rawPoint = {
      id: updatedPoint.id,
      type: updatedPoint.type,
      basePrice: updatedPoint.basePrice,
      dateFrom: updatedPoint.dateFrom,
      dateTo: updatedPoint.dateTo,
      destination: typeof updatedPoint.destination === 'object' ? updatedPoint.destination.id : updatedPoint.destination,
      offers: updatedPoint.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
      isFavorite: updatedPoint.isFavorite,
    };
    if (updatedPoint.isDeleted) {
      await this.#pointsModel.deletePoint(updatedPoint.id);
    } else {
      await this.#pointsModel.updatePoint(rawPoint);
    }
    const updatedPresenter = this.#pointPresenters.get(updatedPoint.id);
    if (updatedPresenter) {
      const fullPoint = this.#getFullPoints().find((p) => p.id === updatedPoint.id);
      const pointForUpdate = {
        ...fullPoint,
        offers: fullPoint.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
      };
      updatedPresenter.update(pointForUpdate);
    }
    this.#updateTripInfoAndRender();
  }

  #handleModeChange() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    if (this.#isCreating) {
      this.#closeCreateForm();
    }
  }

  #closeCreateForm() {
    this.#isCreating = false;
    this.#newEventButton.disabled = false;
  }

  #renderBoard() {
    this.#clearEventsList();
    this.#clearSortComponent();

    const filteredPoints = this.#getFilteredPoints();
    const sortedPoints = this.#getSortedPoints(filteredPoints);

    if (sortedPoints.length === 0 && !this.#isCreating) {
      this.#renderEmptyMessage();
      return;
    }

    this.#renderSort();

    this.#eventsList = document.createElement('ul');
    this.#eventsList.classList.add('trip-events__list');
    this.#tripEventsContainer.appendChild(this.#eventsList);

    if (this.#isCreating) {
      this.#renderCreateForm();
    }

    for (const point of sortedPoints) {
      this.#renderPoint(point);
    }
  }

  #renderCreateForm() {
    const createForm = new CreateFormView(
      this.#destinationsModel,
      this.#offersModel,
      async (newPoint) => {
        createForm.setSaving(true);
        try {
          const rawPoint = {
            type: newPoint.type,
            basePrice: newPoint.basePrice,
            dateFrom: newPoint.dateFrom,
            dateTo: newPoint.dateTo,
            destination: newPoint.destination.id,
            offers: newPoint.offers,
            isFavorite: false,
          };
          await this.#pointsModel.addPoint(rawPoint);
          this.#isCreating = false;
          this.#newEventButton.disabled = false;
          this.#updateTripInfoAndRender();
        } catch {
          createForm.shake();
          createForm.setSaving(false);
        }
      },
      () => {
        this.#isCreating = false;
        this.#newEventButton.disabled = false;
        this.#updateTripInfoAndRender();
      }
    );
    render(createForm, this.#eventsList, RenderPosition.AFTERBEGIN);
    createForm._restoreHandlers();
  }

  #handleNewEventClick() {
    if (this.#isCreating) {
      return;
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#isCreating = true;
    this.#currentSort = 'day';
    this.#filterModel.setFilter('MAJOR', FiltersPoint.EVERYTHING);
    this.#newEventButton.disabled = true;
    this.#renderBoard();
  }
}
