import { render, RenderPosition, replace } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointView from '../view/point-view.js';
import ListMessageView from '../view/list-message-view.js';
import FilterModel from '../model/filter-model.js';
import { FiltersPoint, filter } from '../utils/filter-utils.js';

export default class TripPresenter {
  constructor(destinationsModel, offersModel, pointsModel) {
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
    this.pointsModel = pointsModel;
    this.filterModel = new FilterModel();
    this.currentSort = 'day';
    this.eventsList = null;
    this.filterComponent = null;
    this.sortComponent = null;
  }

  _getFullPoints() {
    const points = this.pointsModel.getPoints();
    return points.map((point) => {
      const destination = this.destinationsModel.getDestinationById(point.destination);
      const allOffersForType = this.offersModel.getOffersByType(point.type);
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

  _getFilteredPoints() {
    const fullPoints = this._getFullPoints();
    const currentFilter = this.filterModel.filter;
    return filter[currentFilter](fullPoints);
  }

  _getSortedPoints(points) {
    const sortedPoints = [...points];
    switch (this.currentSort) {
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

  _clearEventsList() {
    if (this.eventsList) {
      this.eventsList.remove();
      this.eventsList = null;
    }
  }

  _clearSortComponent() {
    if (this.sortComponent) {
      this.sortComponent.removeElement();
      this.sortComponent = null;
    }
  }

  _renderEmptyMessage() {
    this.eventsList = document.createElement('ul');
    this.eventsList.classList.add('trip-events__list');
    this.tripEventsContainer.appendChild(this.eventsList);

    const messageView = new ListMessageView({ message: 'Click New Event to create your first point' });
    render(messageView, this.eventsList);
    if (messageView._restoreHandlers) {
      messageView._restoreHandlers();
    }
  }

  _renderPointsList(points) {
    this.eventsList = document.createElement('ul');
    this.eventsList.classList.add('trip-events__list');
    this.tripEventsContainer.appendChild(this.eventsList);

    for (const point of points) {
      this._renderPoint(point, this.eventsList);
    }
  }

  _renderPoint(point, container) {
    const pointView = new PointView(point, () => {
      this._replacePointToEditForm(point, pointView, container);
    });
    render(pointView, container);
    pointView._restoreHandlers();
  }

  _replacePointToEditForm(point, oldPointView, container) {
    const editFormView = new EditFormView(
      point,
      () => {
        this._replaceEditFormToPoint(point, editFormView, container);
      },
      () => {
        this._replaceEditFormToPoint(point, editFormView, container);
      }
    );

    replace(editFormView, oldPointView);
    editFormView._restoreHandlers();

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this._replaceEditFormToPoint(point, editFormView, container);
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };
    document.addEventListener('keydown', onEscKeyDown);
    editFormView._onEscKeyDown = onEscKeyDown;
  }

  _replaceEditFormToPoint(point, oldEditFormView, container) {
    if (oldEditFormView._onEscKeyDown) {
      document.removeEventListener('keydown', oldEditFormView._onEscKeyDown);
    }

    const newPointView = new PointView(point, () => {
      this._replacePointToEditForm(point, newPointView, container);
    });
    replace(newPointView, oldEditFormView);
    newPointView._restoreHandlers();
  }

  _renderFilters() {
    const filters = Object.values(FiltersPoint);
    const currentFilter = this.filterModel.filter;
    this.filterComponent = new FilterView(filters, currentFilter, (filterType) => {
      this.filterModel.setFilter('MAJOR', filterType);
      this._renderBoard();
    });
    render(this.filterComponent, this.filterContainer);
    if (this.filterComponent._restoreHandlers) {
      this.filterComponent._restoreHandlers();
    }
  }

  _renderSort() {
    this.sortComponent = new SortView(this.currentSort, (sortType) => {
      this.currentSort = sortType;
      this._renderBoard();
    });
    render(this.sortComponent, this.tripEventsContainer, RenderPosition.AFTERBEGIN);
    if (this.sortComponent._restoreHandlers) {
      this.sortComponent._restoreHandlers();
    }
  }

  _renderBoard() {
    this._clearEventsList();

    if (this.sortComponent) {
      this.sortComponent.element.remove();
      this.sortComponent = null;
    }

    const filteredPoints = this._getFilteredPoints();
    const sortedPoints = this._getSortedPoints(filteredPoints);

    if (sortedPoints.length === 0) {
      this._renderEmptyMessage();
      return;
    }

    this._renderSort();
    this._renderPointsList(sortedPoints);
  }

  init() {
    this._renderFilters();
    this._renderBoard();
  }
}
