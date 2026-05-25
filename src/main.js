import Api from './service/api.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import { adaptToClient } from './utils/adapter.js';

const AUTHORIZATION = 'Basic er883jdzbdw';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const api = new Api(END_POINT, AUTHORIZATION);
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();
const pointsModel = new PointsModel(api);
const filterModel = new FilterModel();

const filterContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const filterPresenter = new FilterPresenter(filterContainer, filterModel);
const tripPresenter = new TripPresenter(tripEventsContainer, destinationsModel, offersModel, pointsModel, filterModel);

const showLoading = () => {
  const loadingMessage = document.createElement('p');
  loadingMessage.className = 'trip-events__msg';
  loadingMessage.textContent = 'Loading...';
  tripEventsContainer.appendChild(loadingMessage);
};

const removeLoading = () => {
  const loadingMsg = tripEventsContainer.querySelector('.trip-events__msg');
  if (loadingMsg) {
    loadingMsg.remove();
  }
};

const init = async () => {
  showLoading();
  try {
    const [destinations, offers, points] = await Promise.all([
      api.getDestinations(),
      api.getOffers(),
      api.getPoints(),
    ]);
    destinationsModel.setDestinations(destinations);
    offersModel.setOffers(offers);
    pointsModel.setPoints(points.map(adaptToClient));
    filterPresenter.init();
    tripPresenter.init();
  } catch (err) {
    destinationsModel.setDestinations([]);
    offersModel.setOffers([]);
    pointsModel.setPoints([]);
    filterPresenter.init();
    tripPresenter.init();
  } finally {
    removeLoading();
  }
};

init();
