import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  #point = null;
  #pointView = null;
  #editFormView = null;
  #container = null;
  #onDataChange = null;
  #onModeChange = null;
  #destinationsModel = null;
  #offersModel = null;

  constructor(container, onDataChange, onModeChange, destinationsModel, offersModel) {
    this.#container = container;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
  }

  init(point) {
    this.#point = point;
    this.#createPointView();
    render(this.#pointView, this.#container);
    this.#pointView._restoreHandlers();
  }

  #createPointView() {
    this.#pointView = new PointView(this.#point, () => {
      this.#openEditForm();
    }, () => {
      this.#onFavoriteClick();
    });
  }

  #createEditFormView() {
    this.#editFormView = new EditFormView(
      this.#point,
      this.#destinationsModel,
      this.#offersModel,
      () => {
        this.#closeEditForm();
      },
      () => {
        this.#closeEditForm();
      }
    );
  }

  #openEditForm() {
    this.#onModeChange();
    if (this.#editFormView) {
      this.#editFormView.removeElement();
    }
    this.#createEditFormView();
    if (!this.#container.contains(this.#pointView.element)) {
      render(this.#pointView, this.#container);
    }
    replace(this.#editFormView, this.#pointView);
    this.#editFormView._restoreHandlers();
    this.#addEscHandler();
  }

  #closeEditForm() {
    if (!this.#editFormView || !this.#editFormView.element) {
      return;
    }
    replace(this.#pointView, this.#editFormView);
    this.#pointView._restoreHandlers();
    this.#removeEscHandler();
  }

  #addEscHandler() {
    this.#editFormView._onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this.#closeEditForm();
        document.removeEventListener('keydown', this.#editFormView._onEscKeyDown);
      }
    };
    document.addEventListener('keydown', this.#editFormView._onEscKeyDown);
  }

  #removeEscHandler() {
    if (this.#editFormView && this.#editFormView._onEscKeyDown) {
      document.removeEventListener('keydown', this.#editFormView._onEscKeyDown);
      delete this.#editFormView._onEscKeyDown;
    }
  }

  #onFavoriteClick() {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };
    this.#onDataChange(updatedPoint);
  }

  update(point) {
    this.#point = point;
    const newPointView = new PointView(this.#point, () => {
      this.#openEditForm();
    }, () => {
      this.#onFavoriteClick();
    });
    replace(newPointView, this.#pointView);
    this.#pointView = newPointView;
    this.#pointView._restoreHandlers();

    if (this.#editFormView && this.#editFormView.element && this.#editFormView.element.parentElement) {
      const oldEditForm = this.#editFormView;
      this.#createEditFormView();
      replace(this.#editFormView, oldEditForm);
      this.#editFormView._restoreHandlers();
      oldEditForm.removeElement();
    }
  }

  destroy() {
    if (this.#pointView) {
      remove(this.#pointView);
    }
    if (this.#editFormView) {
      remove(this.#editFormView);
    }
  }

  resetView() {
    if (this.#editFormView && this.#editFormView.element && this.#editFormView.element.parentElement) {
      this.#closeEditForm();
    }
  }
}
