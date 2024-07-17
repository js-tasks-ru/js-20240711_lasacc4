import {sortMethods} from "./utils.js";

export default class SortableTable {
  _currentSortField;
  _currentOrder;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this._headerConfig = headerConfig;
    this._data = data;

    this._element = this.createContainerElement();
  }

  get element() {
    return this._element;
  }

  sort(field, order) {
    const {sortable, sortType} = this._headerConfig.find(item => item.id === field);

    if (!sortable) {
      return;
    }

    this._currentSortField = field;
    this._data = sortMethods[sortType](this._data, field, order);

    this.subElements.header.innerHTML = this.createHeaderCellsTemplate();
    this.subElements.body.innerHTML = this.createBodyRowsTemplate();
  }

  createContainerElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createContainerTemplate();

    const containerElement = element.firstElementChild;
    const tableElement = containerElement.firstElementChild;

    if (this._data.length) {
      tableElement.classList.remove('sortable-table_loading', 'sortable-table_empty');
    }

    this.subElements = this.getSubElements(containerElement);
    return containerElement;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");
    const result = {};

    elements.forEach((subElement) => {
      const name = subElement.dataset.element;
      result[name] = subElement;
    });

    return result;
  }

  createContainerTemplate() {
    return (
      `<div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table sortable-table_loading sortable-table_empty">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.createHeaderCellsTemplate()}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.createBodyRowsTemplate()}
                </div>
                ${this.createEmptyDataTemplate()}
            </div>
       </div>`
    );
  }

  createHeaderCellsTemplate() {
    return this._headerConfig.map(item => {
      const {id, title, sortable} = item;
      const isSortField = this._currentSortField === id;
      const dataSort = this._currentOrder ? `data-order="${this._currentOrder}"` : '';

      return (
        `<div
            class="sortable-table__cell"
            data-id=${id}
            data-sortable=${sortable}
            ${dataSort}
        >
            <span>${title}</span>
            ${isSortField ? this.createSortArrowTemplate() : ''}
        </div>`
      );
    }).join('');
  }

  createSortArrowTemplate() {
    return (
      `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
       </span>`
    );
  }

  createBodyRowsTemplate() {
    return this._data
      .map((item) => this.createRowTemplate(item, this._headerConfig))
      .join('');
  }

  createRowTemplate(item) {
    const cells = this._headerConfig.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');

    return (
      `<a href="/products/${item.id}" class="sortable-table__row">
            ${cells}
       </a>`
    );
  }

  createEmptyDataTemplate() {
    return (
      `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
       <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
           <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">
                 Reset all filters
              </button>
           </div>
       </div>`
    );
  }

  destroy() {
    this._element.remove();
  }
}

