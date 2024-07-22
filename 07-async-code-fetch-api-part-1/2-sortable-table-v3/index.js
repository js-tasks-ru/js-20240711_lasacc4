import fetchJson, {fetchWithHeader} from './utils/fetch-json.js';
import SortableTableV2 from '../../06-events-practice/1-sortable-table-v2/index.js';
import {sortByFields} from "../../06-events-practice/1-sortable-table-v2/utils.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTableV2 {
  _hasMoreData = true;

  constructor(headerConfig, props = {}) {
    super(headerConfig, props);

    const {
      url = '',
      isSortLocally = false,
      range = {
        start: 0,
        end: 15
      }
    } = props;

    this.url = new URL(url, BACKEND_URL);
    this._range = range;
    this._isSortLocally = isSortLocally;

    this.onInfiniteScroll = this.onInfiniteScroll.bind(this);

    this.render();
  }

  async render() {
    this._data = await this.sortOnServer(this._sorted.id, this._sorted.order);
    this.update(this._sorted.id, this._sorted.order);
  }

  async sort(field, order) {
    const {sortType, sortable} = this._headerConfig.find(item => item.id === field);

    if (!this._data.length || !sortable) {
      return;
    }

    const sortOrder = order ?? this._currentOrder;

    this._sortType = sortType;
    this._data = await this.getSortedData(field, sortOrder);
    this.update(field, sortOrder);
  }

  async getSortedData(field, order) {
    if (this._isSortLocally) {
      return this.sortOnClient(field, order);
    }

    return await this.sortOnServer(field, order);
  }

  sortOnClient(field, order) {
    const sortFields = this.getSortFields(field, this._sortType);
    return sortByFields(this._data, sortFields, order);
  }

  async sortOnServer(field, order) {
    this.element.firstElementChild.classList.add('sortable-table_loading');
    this.element.firstElementChild.classList.remove('sortable-table_empty');

    const data = await this.fetchTableData({
      _sort: field,
      _order: order,
      _start: this._range.start,
      _end: this._range.end,
    });

    if (!data.length) {
      this.element.firstElementChild.classList.add('sortable-table_empty');
    }

    this.element.firstElementChild.classList.remove('sortable-table_loading');

    return data;
  }

  async onInfiniteScroll() {
    if (this.isIntersecting() && this._hasMoreData) {
      const rangeValue = this.addNewRange();

      const [body, xTotalCount] = await this.fetchTableData({
        _sort: this._currentSortField,
        _order: this._currentOrder,
        _start: this._range.start,
        _end: this._range.end,
      }, 'custom');

      this._hasMoreData = xTotalCount >= rangeValue;
      this._data = [...this._data, ...body];

      this.update(this._currentSortField);
    }
  }

  isIntersecting() {
    const marginValue = 40;
    const {bottom} = this.element.firstElementChild.getBoundingClientRect();
    const triggerHeightValue = document.documentElement.clientHeight - marginValue;

    return triggerHeightValue >= bottom;
  }

  addNewRange() {
    const rangeValue = this._range.end - this._range.start;
    this._range.start = this._range.start + rangeValue;
    this._range.end = this._range.end + rangeValue;

    return rangeValue;
  }

  async fetchTableData(params = {}, fetchType = 'default') {
    this.setUrlSearchParams(params);

    try {
      return fetchType === 'default' ? await fetchJson(this.url) : await fetchWithHeader(this.url);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  createEventListeners() {
    super.createEventListeners();
    document.addEventListener('scroll', this.onInfiniteScroll);
  }

  destroyEventListeners() {
    super.destroyEventListeners();
    document.removeEventListener('scroll', this.onInfiniteScroll);
  }

  setUrlSearchParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      this.url.searchParams.set(key, value?.toString());
    });
  }
}
