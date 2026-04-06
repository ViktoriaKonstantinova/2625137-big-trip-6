import AbstractView from '../framework/view/abstract-view.js';

const createSortTemplate = (currentSort) => {
  const sorts = [
    { name: 'day', disabled: false },
    { name: 'event', disabled: true },
    { name: 'time', disabled: false },
    { name: 'price', disabled: false },
    { name: 'offer', disabled: true }
  ];

  return `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
    ${sorts.map((sort) => `
      <div class="trip-sort__item trip-sort__item--${sort.name}">
        <input id="sort-${sort.name}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-${sort.name}" ${sort.name === currentSort ? 'checked' : ''} ${sort.disabled ? 'disabled' : ''}>
        <label class="trip-sort__btn" for="sort-${sort.name}">${sort.name.charAt(0).toUpperCase() + sort.name.slice(1)}</label>
      </div>
    `).join('')}
  </form>`;
};

export default class SortView extends AbstractView {
  #currentSort = null;
  #onSortChange = null;

  constructor(currentSort, onSortChange) {
    super();
    this.#currentSort = currentSort;
    this.#onSortChange = onSortChange;
  }

  get template() {
    return createSortTemplate(this.#currentSort);
  }

  _restoreHandlers() {
    this.element.querySelectorAll('.trip-sort__input:not(:disabled)').forEach((input) => {
      input.addEventListener('change', () => {
        const sortType = input.value.replace('sort-', '');
        this.#onSortChange(sortType);
      });
    });
  }
}
