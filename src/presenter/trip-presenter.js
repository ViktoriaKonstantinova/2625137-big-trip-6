import { render, RenderPosition } from '../render.js';
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

    const sortView = new SortView();
    render(sortView, this.tripEventsContainer, RenderPosition.AFTERBEGIN);

    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    this.tripEventsContainer.appendChild(eventsList);

    const fullPoints = this._getFullPoints();
    fullPoints.sort((a, b) => new Date(a.date_from) - new Date(b.date_from));

    if (fullPoints.length > 0) {
      const editFormView = new EditFormView(fullPoints[0]);
      render(editFormView, eventsList);
    } else {
      const createFormView = new EditFormView();
      render(createFormView, eventsList);
    }

    for (const point of fullPoints) {
      const pointView = new PointView(point);
      render(pointView, eventsList);
    }
  }
}
