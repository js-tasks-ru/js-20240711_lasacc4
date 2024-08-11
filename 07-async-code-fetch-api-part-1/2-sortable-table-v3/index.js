import fetchJson, {fetchWithHeader} from './utils/fetch-json.js';
import SortableTableV2 from '../../06-events-practice/1-sortable-table-v2/index.js';
import {sortByFields} from "../../06-events-practice/1-sortable-table-v2/utils.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTableV2 {
  _hasMoreData = true;
  isInfiniteScrollLoading = false;

  constructor(headerConfig, props = {}) {
    super(headerConfig, props);

    const {
      url = '',
      isSortLocally = false,
      range = {
        start: 0,
        end: 15
      },
      dateRange = {}
    } = props;

    this.url = new URL(url, BACKEND_URL);
    this._range = range;
    this._isSortLocally = isSortLocally;
    this.dateRange = dateRange;

    this.onInfiniteScroll = this.onInfiniteScroll.bind(this);
    this.render();
  }

  async render() {
    this.setUrlSearchParams(this.dateRange);
    this._data = await this.sortOnServer(this._sorted.id, this._sorted.order);
    super.update(this._sorted.id);
    this.initEventListeners();
  }

  async update(from, to) {
    this._data = await this.fetchTableData({from, to});
    super.update(this._sorted.id);
  }

  async sort(field, order) {
    const {sortType, sortable} = this._headerConfig.find(item => item.id === field);

    if (!this._data.length || !sortable) {
      return;
    }

    const sortOrder = order ?? this._currentOrder;

    this._sortType = sortType;
    this._data = await this.getSortedData(field, sortOrder);
    super.update(field, sortOrder);
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

    return data;
  }

  async onInfiniteScroll() {
    if (this.isInfiniteScrollEnabled()) {
      const rangeValue = this.addNewRange();
      this.isInfiniteScrollLoading = true;

      const [body, xTotalCount] = await this.fetchTableData({
        _sort: this._currentSortField,
        _order: this._currentOrder,
        _start: this._range.start,
        _end: this._range.end,
      }, 'custom');

      this._hasMoreData = xTotalCount >= rangeValue;
      this._data = [...this._data, ...body];

      super.update(this._currentSortField);
      
      this.isInfiniteScrollLoading = false;
    }
  }

  isInfiniteScrollEnabled() {
    return this.isIntersecting() && this._hasMoreData && !this.isInfiniteScrollLoading && !this._isSortLocally;
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
    this.element.firstElementChild.classList.add('sortable-table_loading');

    try {
      return fetchType === 'default' 
        ? await fetchJson(this.url) 
        : await fetchWithHeader(this.url);
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      this.element.firstElementChild.classList.remove('sortable-table_loading');
    }
  }

  initEventListeners() {
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
