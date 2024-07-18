import {sortByFields} from "./utils.js";

export default class SortableTable {
  _validSortTypes = ["number", "string"];

  constructor(headersConfig, props = {}) {
    const {
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc',
      },
      isSortLocally = true,
      customUserSortField
    } = props;

    this._headersConfig = headersConfig;
    this._data = data;
    this._order = sorted.order;
    this._isSortLocally = isSortLocally;
    this._customUserSortField = customUserSortField;

    this.sort(sorted.id);

    this._element = this.createContainerElement(sorted);
  }

  get element() {
    return this._element;
  }

  onHeaderPointerDownListener(e) {
    const cellElement = e.target.closest('[data-sortable]');

    if (!cellElement) {
      return;
    }

    const id = cellElement.dataset.id;
    const isSortable = cellElement.dataset.sortable === "true";

    if (isSortable) {
      this.sort(id);

      this.subElements.header.innerHTML = this.createHeaderCellsTemplate();
      this.subElements.body.innerHTML = this.createBodyRowsTemplate();
    }
  }

  sort(field) {
    if (!this._data.length) {
      return;
    }

    const {sortType} = this._headersConfig.find(item => item.id === field);
    const sortFields = [{value: field, type: sortType}];

    if (this._customUserSortField) {
      const type = typeof this._data[0][this._customUserSortField];

      if (this._validSortTypes.includes(type)) {
        sortFields.push({value: this._customUserSortField, type});
      }
    }

    this._data = this.getSortedData(sortFields);
    this._currentSortField = field;
    this._order = this._order === 'asc' ? 'desc' : 'asc';
  }

  getSortedData(fields) {
    if (this._isSortLocally) {
      return sortByFields(this._data, fields, this._order);
    }

    // placeholder for server sorting
    return this._data;
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
    this.subElements.header.addEventListener('pointerdown', this.onHeaderPointerDownListener.bind(this));
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
    return this._headersConfig.map(item => {
      const {id, title, sortable} = item;
      const isSortField = this._currentSortField === id;
      const dataSort = this._order ? `data-order="${this._order}"` : '';

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
      .map((item) => this.createRowTemplate(item, this._headersConfig))
      .join('');
  }

  createRowTemplate(item) {
    const cells = this._headersConfig.map(({id, template}) => {
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
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderPointerDownListener.bind(this));
    this._element.remove();
  }
}
