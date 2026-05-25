import AbstractView from '../framework/view/abstract-view.js';

const createFilterTemplate = (filters, currentFilter, counts) => `<div class="trip-controls__filters">
    <h2 class="visually-hidden">Filter events</h2>
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => `
        <div class="trip-filters__filter">
          <input id="filter-${filter}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter}" ${filter === currentFilter ? 'checked' : ''} ${counts[filter] === 0 ? 'disabled' : ''}>
          <label class="trip-filters__filter-label" for="filter-${filter}">${filter.charAt(0).toUpperCase() + filter.slice(1)}</label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  </div>`;

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #counts = null;
  #onFilterChange = null;

  constructor(filters, currentFilter, counts, onFilterChange) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#counts = counts;
    this.#onFilterChange = onFilterChange;
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilter, this.#counts);
  }

  _restoreHandlers() {
    this.element.querySelectorAll('.trip-filters__filter-input:not(:disabled)').forEach((input) => {
      input.addEventListener('change', () => {
        this.#onFilterChange(input.value);
      });
    });
  }
}
