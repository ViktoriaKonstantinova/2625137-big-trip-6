import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { isEscapeKey } from '../utils/points-utils.js';

export default class PointPresenter {
  #point = null;
  #pointView = null;
  #editFormView = null;
  #container = null;
  #onDataChange = null;
  #onModeChange = null;
  #destinationsModel = null;
  #offersModel = null;
  #isEditMode = false;

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
      this.#handleRollupClick();
    }, () => {
      this.#onFavoriteClick();
    });
  }

  #createEditFormView() {
    const pointForForm = {
      ...this.#point,
      offers: this.#point.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
    };
    this.#editFormView = new EditFormView(
      pointForForm,
      this.#destinationsModel,
      this.#offersModel,
      async (updatedPoint) => {
        if (!this.#isEditMode) {
          return;
        }
        this.#editFormView.setSaving(true);
        try {
          const rawPoint = {
            id: updatedPoint.id,
            type: updatedPoint.type,
            basePrice: updatedPoint.basePrice,
            dateFrom: updatedPoint.dateFrom,
            dateTo: updatedPoint.dateTo,
            destination: typeof updatedPoint.destination === 'object' ? updatedPoint.destination.id : updatedPoint.destination,
            offers: updatedPoint.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
            isFavorite: updatedPoint.isFavorite,
          };
          await this.#onDataChange({ ...rawPoint, isDeleted: false });
          this.#closeEditForm();
        } catch {
          this.#editFormView.shake();
        } finally {
          this.#editFormView.setSaving(false);
        }
      },
      () => {
        if (!this.#isEditMode) {
          return;
        }
        this.#closeEditForm();
      },
      async () => {
        if (!this.#isEditMode) {
          return;
        }
        this.#editFormView.setDeleting(true);
        try {
          await this.#onDataChange({ ...this.#point, isDeleted: true });
          this.#closeEditForm();
        } catch {
          this.#editFormView.shake();
        } finally {
          this.#editFormView.setDeleting(false);
        }
      }
    );
  }

  #handleRollupClick() {
    if (this.#isEditMode) {
      this.#closeEditForm();
    } else {
      this.#openEditForm();
    }
  }

  #openEditForm() {
    if (this.#isEditMode) {
      return;
    }
    this.#onModeChange();
    this.#createEditFormView();
    replace(this.#editFormView, this.#pointView);
    this.#editFormView._restoreHandlers();
    this.#isEditMode = true;
    this.#addEscHandler();
  }

  #closeEditForm() {
    if (!this.#isEditMode) {
      return;
    }
    if (this.#editFormView && this.#editFormView.element) {
      try {
        replace(this.#pointView, this.#editFormView);
      } catch {
        if (this.#editFormView.element.parentElement) {
          this.#editFormView.element.remove();
        }
        if (!this.#pointView.element.parentElement) {
          render(this.#pointView, this.#container);
        }
      }
    }
    this.#pointView._restoreHandlers();
    this.#isEditMode = false;
    this.#removeEscHandler();
  }

  #addEscHandler() {
    const onEscKeyDown = (evt) => {
      if (isEscapeKey(evt)) {
        evt.preventDefault();
        this.#closeEditForm();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };
    document.addEventListener('keydown', onEscKeyDown);
    this.#editFormView._escHandler = onEscKeyDown;
  }

  #removeEscHandler() {
    if (this.#editFormView && this.#editFormView._escHandler) {
      document.removeEventListener('keydown', this.#editFormView._escHandler);
      delete this.#editFormView._escHandler;
    }
  }

  #onFavoriteClick() {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };
    this.#onDataChange(updatedPoint).catch(() => {
      this.shake();
    });
  }

  update(point) {
    this.#point = point;
    const newPointView = new PointView(this.#point, () => {
      this.#handleRollupClick();
    }, () => {
      this.#onFavoriteClick();
    });
    replace(newPointView, this.#pointView);
    this.#pointView = newPointView;
    this.#pointView._restoreHandlers();

    if (this.#isEditMode) {
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
    if (this.#isEditMode) {
      this.#closeEditForm();
    }
  }

  shake() {
    this.#pointView.shake();
  }
}
