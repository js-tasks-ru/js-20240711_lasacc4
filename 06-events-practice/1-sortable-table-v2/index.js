import {sortByFields} from "./utils.js";
import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTable extends SortableTableV1 {
  _validSortTypes = ["number", "string"];

  constructor(headerConfig, props = {}) {
    const {
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc',
      },
      isSortLocally = true,
      customUserSortField
    } = props;

    super(headerConfig, data);

    this._currentOrder = sorted.order;
    this._isSortLocally = isSortLocally;
    this._customUserSortField = customUserSortField;

    this.sort(sorted.id);
    this.createEventListeners();
  }

  sort(field, order) {
    const {sortType, sortable} = this._headerConfig.find(item => item.id === field);

    if (!this._data.length || !sortable) {
      return;
    }

    const sortFields = this.getSortFields(field, sortType);
    const sortOrder = order ?? this._currentOrder;

    this._data = this.getSortedData(sortFields, sortOrder);
    this._currentSortField = field;
    this._currentOrder = sortOrder === 'asc' ? 'desc' : 'asc';

    this.subElements.header.innerHTML = this.createHeaderCellsTemplate();
    this.subElements.body.innerHTML = this.createBodyRowsTemplate();
  }

  getSortFields(field, sortType) {
    const sortFields = [{value: field, type: sortType}];

    if (this._customUserSortField) {
      const type = typeof this._data[0][this._customUserSortField];

      if (this._validSortTypes.includes(type)) {
        sortFields.push({value: this._customUserSortField, type});
      }
    }

    return sortFields;
  }

  getSortedData(fields, order) {
    if (this._isSortLocally) {
      return sortByFields(this._data, fields, order);
    }

    // placeholder for server sorting
    return this._data;
  }

  onHeaderClick(e) {
    const cellElement = e.target.closest('[data-sortable]');

    if (!cellElement) {
      return;
    }

    const id = cellElement.dataset.id;
    const isSortable = cellElement.dataset.sortable === "true";

    if (isSortable) {
      this.sort(id);
    }
  }

  createEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick.bind(this));
  }

  destroyEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick.bind(this));
  }

  destroy() {
    super.destroy();
    this.destroyEventListeners();
  }
}
