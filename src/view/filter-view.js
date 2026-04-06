import AbstractView from '../framework/view/abstract-view.js';

const createFilterTemplate = (filters, currentFilter) => `<div class="trip-controls__filters">
    <h2 class="visually-hidden">Filter events</h2>
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => `
        <div class="trip-filters__filter">
          <input id="filter-${filter}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter}" ${filter === currentFilter ? 'checked' : ''}>
          <label class="trip-filters__filter-label" for="filter-${filter}">${filter.charAt(0).toUpperCase() + filter.slice(1)}</label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  </div>`;

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #onFilterChange = null;

  constructor(filters, currentFilter, onFilterChange) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#onFilterChange = onFilterChange;
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilter);
  }

  _restoreHandlers() {
    this.element.querySelectorAll('.trip-filters__filter-input').forEach((input) => {
      input.addEventListener('change', () => {
        this.#onFilterChange(input.value);
      });
    });
  }
}
