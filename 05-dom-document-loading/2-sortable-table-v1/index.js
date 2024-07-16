const tableSort = {
  number: (data, field, order) => sortNumbers(data, field, order),
  string: (data, field, order) => sortStrings(data, field, order)
};

const sortStrings = (data, field, order) => {
  const options = {caseFirst: "upper"};

  return [...data].sort((a, b) => {
    return order === 'asc'
      ? a[field].localeCompare(b[field], ['ru', 'en'], options)
      : b[field].localeCompare(a[field], ['ru', 'en'], options);
  });
};

const sortNumbers = (data, field, order) => {
  return [...data].sort((a, b) => {
    return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
  });
};

export default class SortableTable {
  _currentSortField;

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

    this.subElements.header = this.createHeaderElement(order);
    this.subElements.body = this.createBodyElement();

    this._element.innerHTML = '';
    this._element.append(this.createTableElement());
  }

  createElement() {
    const rootElement = document.createElement("div");
    rootElement.setAttribute("data-element", "productsContainer");
    rootElement.classList.add('products-list__container');
    rootElement.append(this.createTableElement());

    return rootElement;
  }

  createTableElement() {
    const table = document.createElement("div");
    table.classList.add('sortable-table');

    table.append(
      this.subElements.header,
      this.subElements.body,
    );

    return table;
  }

  createHeaderElement(order) {
    const header = document.createElement("div");
    header.classList.add('sortable-table__header', 'sortable-table__row');
    header.setAttribute('data-element', 'header');
    header.innerHTML = this.createHeaderCells(order);

    return header;
  }

  createHeaderCells(order) {
    return this._headerConfig.map(item => {
      const {id, title, sortable} = item;
      const isSortField = this._currentSortField === id;
      const dataSort = order ? `data-order="${order}"` : '';

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

  createBodyElement() {
    const body = document.createElement("div");
    body.classList.add('sortable-table__body');
    body.setAttribute('data-element', 'body');
    body.innerHTML = this._data
      .map((item) => this.createBodyRow(item, this._headerConfig))
      .join('');

    return body;
  }

  createBodyRow(item) {
    const cells = this._headerConfig.map(({id, template}) => {
      return template ? template(item[id]) : this.defaultCellTemplate(item[id]);
    }).join('');

    return (
      `<a href="/products/${item.id}" class="sortable-table__row">
            ${cells}
       </a>`
    );
  }

  defaultCellTemplate(data) {
    return `<div class="sortable-table__cell">${data}</div>`;
  }

  destroy() {
    this.subElements.header?.remove();
    this.subElements.body?.remove();
    this._element.remove();
  }
}

