import { render, RenderPosition, replace } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointView from '../view/point-view.js';

export default class TripPresenter {
  constructor(destinationsModel, offersModel, pointsModel) {
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
    this.pointsModel = pointsModel;
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

  init() {
    const filterView = new FilterView();
    render(filterView, this.filterContainer);
    if (filterView._restoreHandlers) {
      filterView._restoreHandlers();
    }

    const sortView = new SortView();
    render(sortView, this.tripEventsContainer, RenderPosition.AFTERBEGIN);
    if (sortView._restoreHandlers) {
      sortView._restoreHandlers();
    }

    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    this.tripEventsContainer.appendChild(eventsList);

    const fullPoints = this._getFullPoints();
    fullPoints.sort((a, b) => new Date(a.date_from) - new Date(b.date_from));

    for (const point of fullPoints) {
      this._renderPoint(point, eventsList);
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
}
