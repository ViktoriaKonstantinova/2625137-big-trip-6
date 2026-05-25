import { render, replace } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { FiltersPoint, filter } from '../utils/filter-utils.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;
  #filterView = null;

  constructor(container, filterModel, pointsModel) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#pointsModel.addObserver(() => this.#render());
    this.#filterModel.addObserver(() => this.#render());
    this.#render();
  }

  #render() {
    const points = this.#pointsModel.getPoints();
    const filters = Object.values(FiltersPoint);
    const currentFilter = this.#filterModel.filter;

    const counts = {
      [FiltersPoint.EVERYTHING]: points.length,
      [FiltersPoint.FUTURE]: filter[FiltersPoint.FUTURE](points).length,
      [FiltersPoint.PRESENT]: filter[FiltersPoint.PRESENT](points).length,
      [FiltersPoint.PAST]: filter[FiltersPoint.PAST](points).length,
    };

    const newFilterView = new FilterView(filters, currentFilter, counts, (filterType) => {
      if (counts[filterType] === 0) {
        return;
      }
      this.#filterModel.setFilter('MAJOR', filterType);
    });

    if (this.#filterView) {
      replace(newFilterView, this.#filterView);
    } else {
      render(newFilterView, this.#container);
    }

    this.#filterView = newFilterView;
    this.#filterView._restoreHandlers();
  }
}
