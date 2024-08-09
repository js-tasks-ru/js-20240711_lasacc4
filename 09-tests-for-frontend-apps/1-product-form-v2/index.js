import ProductFormV1 from "../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";
import escapeHtml from "../../08-forms-fetch-api-part-2/1-product-form-v1/utils/escape-html.js";
import SortableList from "../2-sortable-list/index.js";

export default class ProductForm extends ProductFormV1 {
  constructor(productId) {
    super(productId);

    this.onListElementDeleted = this.onListElementDeleted.bind(this);
  }

  async render() {
    const element = await super.render();
    const sortableListElements = this.createSortableListElements();
    this.sortableImageListComponent = new SortableList({items: sortableListElements});

    this.createCustomEventListeners();

    this.subElements['imageListContainer']
      .firstElementChild
      .replaceWith(this.sortableImageListComponent.element);

    return element;
  }

  onListElementDeleted(e) {
    const deleteHandler = e.detail;

    if (!deleteHandler) {
      return;
    }

    this.removeImage(deleteHandler);
  }

  updateImageList() {
    const newImageListElements = this.createSortableListElements();
    this.sortableImageListComponent.updateList(newImageListElements);
  }

  createSortableListElements() {
    return this.images.map(({source, url}) => this.createListItemElement(source, url));
  }

  createListItemElement(source = '', url = '') {
    const escapedSource = escapeHtml(source);
    const escapedUrl = escapeHtml(url);
    const listElement = document.createElement('li');
    listElement.classList.add('products-edit__imagelist-item');

    listElement.innerHTML = (
      `<input type="hidden" name="url" value=${escapedUrl}>
       <input type="hidden" name="source" value=${escapedSource}>
        <span>
           <img src="icon-grab.svg" data-grab-handle="" alt="grab">
           <img class="sortable-table__cell-img" alt="Image" src=${escapedUrl}>
           <span>${escapedSource}</span>
        </span>
        <button type="button">
           <img src="icon-trash.svg" data-delete-handle=${escapedSource} alt="delete">
        </button>`
    );

    return listElement;
  }

  createCustomEventListeners() {
    this.sortableImageListComponent.element.addEventListener('item-deleted', this.onListElementDeleted);
  }

  destroyEventListeners() {
    super.destroyEventListeners();
    this.sortableImageListComponent.element.removeEventListener('item-deleted', this.onListElementDeleted);
  }

  destroy() {
    super.destroy();
    this.sortableImageListComponent.destroy();
  }
}
