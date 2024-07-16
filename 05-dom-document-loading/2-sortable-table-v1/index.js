const tableSort = {
  string: (data, field, order) => {
    const options = {caseFirst: "upper"};

    return [...data].sort((a, b) => {
      return order === 'asc'
        ? a[field].localeCompare(b[field], ['ru', 'en'], options)
        : b[field].localeCompare(a[field], ['ru', 'en'], options);
    });
  },
  number: (data, field, order) => {
    return [...data].sort((a, b) => {
      return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
    });
  }
};

export default class SortableTable {
  _currentSortField;
  _currentOrder;

  constructor(headerConfig = [], data = []) {
    this._headerConfig = headerConfig;
    this._data = data;

    this.subElements = {
      header: this.createHeaderElement(),
      body: this.createBodyElement(),
    };

    this._element = this.createElement();
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
    this._data = tableSort[sortType](this._data, field, order);

    this.subElements.header.innerHTML = this.createHeaderContent();
    this.subElements.body.innerHTML = this.createBodyContent();
  }

  createHeaderElement() {
    const header = document.createElement("div");
    header.classList.add('sortable-table__header', 'sortable-table__row');
    header.setAttribute('data-element', 'header');
    header.innerHTML = this.createHeaderContent();

    return header;
  }

  createBodyElement() {
    const body = document.createElement("div");
    body.classList.add('sortable-table__body');
    body.setAttribute('data-element', 'body');
    body.innerHTML = this.createBodyContent();

    return body;
  }

  createHeaderContent() {
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
            ${isSortField ? this.createSortArrow() : ''}
        </div>`
      );
    }).join('');
  }

  createSortArrow() {
    return (
      `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
       </span>`
    );
  }

  createBodyContent() {
    return this._data
      .map((item) => this.createBodyRow(item, this._headerConfig))
      .join('');
  }

  createBodyRow(item) {
    const cells = this._headerConfig.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');

    return (
      `<a href="/products/${item.id}" class="sortable-table__row">
            ${cells}
       </a>`
    );
  }

  createElement() {
    const rootElement = document.createElement("div");
    rootElement.setAttribute("data-element", "productsContainer");
    rootElement.classList.add('products-list__container');
    rootElement.append(this.createTable());

    return rootElement;
  }

  createTable() {
    const table = document.createElement("div");
    table.classList.add('sortable-table');

    table.append(
      this.subElements.header,
      this.subElements.body,
    );

    return table;
  }

  destroy() {
    this.subElements.header?.remove();
    this.subElements.body?.remove();
    this._element.remove();
  }
}

