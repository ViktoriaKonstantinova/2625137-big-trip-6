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

  constructor(tripEventsContainer, destinationsModel, offersModel, pointsModel, filterModel) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
  }

  init() {
    this.#pointsModel.addObserver(() => this.#renderBoard());
    this.#destinationsModel.addObserver(() => this.#renderBoard());
    this.#offersModel.addObserver(() => this.#renderBoard());
    this.#filterModel.addObserver(() => {
      this.#currentSort = 'day';
      this.#renderBoard();
    });
    this.#newEventButton.addEventListener('click', () => this.#handleNewEventClick());
    this.#renderBoard();
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
      this.#renderBoard();
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
      try {
        await this.#pointsModel.deletePoint(updatedPoint.id);
      } catch {
        const pointToShake = this.#pointPresenters.get(updatedPoint.id);
        if (pointToShake) {
          pointToShake.shake();
        }
      }
    } else {
      try {
        await this.#pointsModel.updatePoint(rawPoint);
      } catch {
        const pointToShake = this.#pointPresenters.get(updatedPoint.id);
        if (pointToShake) {
          pointToShake.shake();
        }
      }
    }
    const updatedPresenter = this.#pointPresenters.get(updatedPoint.id);
    if (updatedPresenter) {
      const fullPoint = this.#getFullPoints().find((p) => p.id === updatedPoint.id);
      updatedPresenter.update(fullPoint);
    }
  }

  #handleModeChange() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    if (this.#isCreating) {
      this.#closeCreateForm();
    }
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
        } catch {
          const formComponent = this.#eventsList.querySelector('.event--edit');
          if (formComponent && formComponent.__component) {
            formComponent.__component.shake();
          }
        }
      },
      () => {
        this.#isCreating = false;
        this.#newEventButton.disabled = false;
        this.#renderBoard();
      }
    );
    render(createForm, this.#eventsList, RenderPosition.AFTERBEGIN);
    createForm._restoreHandlers();
  }

  #closeCreateForm() {
    this.#isCreating = false;
    this.#renderBoard();
  }

  #handleNewEventClick() {
    if (this.#isCreating) {
      return;
    }
    this.#closeAllEditForms();
    this.#isCreating = true;
    this.#currentSort = 'day';
    this.#filterModel.setFilter('MAJOR', FiltersPoint.EVERYTHING);
    this.#newEventButton.disabled = true;
    this.#renderBoard();
  }

  #closeAllEditForms() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }
}
