import { render, RenderPosition } from '../render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointView from '../view/point-view.js';
import CreateFormView from '../view/create-form-view.js';
const POINTS_COUNT = 3;

export default class TripPresenter {
  constructor() {
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    const filterView = new FilterView();
    render(filterView, this.filterContainer);

    const sortView = new SortView();
    render(sortView, this.tripEventsContainer, RenderPosition.AFTERBEGIN);

    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    this.tripEventsContainer.appendChild(eventsList);

    const editFormView = new EditFormView();
    render(editFormView, eventsList);

    for (let i = 0; i < POINTS_COUNT; i++) {
      const pointView = new PointView();
      render(pointView, eventsList);
    }

    const createFormView = new CreateFormView();
    render(createFormView, eventsList);
  }
}
