import fetchJson from './utils/fetch-json.js';
import ColumnChartV1 from "../../04-oop-basic-intro-to-dom/1-column-chart/index.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartV1 {
  constructor(props = {}) {
    super(props);
    const {
      range = {
        from: new Date(),
        to: new Date(),
      },
      url = ''
    } = props;


    this.url = new URL(url, BACKEND_URL);
    this.update(range.from, range.to);
  }

  async update(dateFrom, dateTo) {
    this._element.classList.add('column-chart_loading');

    const data = await this.fetchChartData({from: dateFrom, to: dateTo});
    const fetchedValues = Object.values(data);

    if (fetchedValues.length) {
      this._element.classList.remove('column-chart_loading');
    }

    this._value = fetchedValues.reduce((acc, curr) => acc + curr, 0);
    this._data = this.getHeightNormalizedElements(data);

    this.subElements.header.textContent = this._formatHeading(this._value);
    this.subElements.body.innerHTML = this.getBodyItems();
  }

  async fetchChartData(range) {
    this.setUrlSearchParams(range);

    try {
      return await fetchJson(this.url);
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  setUrlSearchParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      this.url.searchParams.set(key, value.toISOString());
    });
  }

  getHeightNormalizedElements(data = {}) {
    const maxHeight = Math.max(...Object.values(data));
    const proportion = maxHeight / this.chartHeight;

    return Object.entries(data).map(([name, height]) => ({
      name,
      value: Math.floor(height / proportion),
      percent: (height / maxHeight * 100).toFixed(0),
    }));
  }
}
