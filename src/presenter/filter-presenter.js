import { render, replace } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { FiltersPoint } from '../utils/filter-utils.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #filterView = null;

  constructor(container, filterModel) {
    this.#container = container;
    this.#filterModel = filterModel;
  }

  init() {
    this.#filterModel.addObserver(() => this.#render());
    this.#render();
  }

  #render() {
    const filters = Object.values(FiltersPoint);
    const currentFilter = this.#filterModel.filter;
    const newFilterView = new FilterView(filters, currentFilter, (filterType) => {
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
