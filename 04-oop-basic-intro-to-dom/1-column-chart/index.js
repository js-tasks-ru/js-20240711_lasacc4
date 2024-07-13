export default class ColumnChart {
  constructor(props = {}) {
    const {
      data = [],
      label = '',
      value = 0,
      link = '',
      formatHeading = (val) => val
    } = props;

    this.chartHeight = +this.getBaseChartHeight();
    this._label = label;
    this._value = value;
    this._link = link;
    this._formatHeading = formatHeading;
    this._data = this.getHeightNormalizedElements(data);

    this._element = this.createElement();
  }

  get element() {
    return this._element;
  }

  createElement() {
    const rootElement = document.createElement("div");
    rootElement.innerHTML = this.createChartTemplate();

    if (!this._data || !this._data.length) {
      rootElement.firstElementChild.classList.add('column-chart_loading');
    }

    return rootElement.firstElementChild;
  }

  createChartTemplate() {
    return (
      `<div class="column-chart">
         <div class="column-chart__title">
            Total ${this._label}
            ${this.createLink('View all')}
         </div>
         <div class="column-chart__container">
            ${this.createHeader()}
            ${this.createBody()}
         </div>
       </div>`
    );
  }

  createLink(linkText) {
    return this._link
      ? `<a href=${this._link} class="column-chart__link">${linkText}</a>`
      : '';
  }

  createHeader() {
    return (
      `<div data-element="header" class="column-chart__header">
            ${this._formatHeading(this._value)}
      </div>`
    );
  }

  createBody() {
    return (
      `<div data-element="body" class="column-chart__chart">
          ${this.getBodyItems()}
      </div>`
    );
  }

  getBodyItems() {
    return this._data.map(({value, percent}) => (
      `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`
    )).join('');
  }

  update(newData) {
    if (newData && newData.length) {
      this._element.classList.remove('column-chart_loading');
    }

    const chartBody = document.querySelector('.column-chart__chart');
    this._data = this.getHeightNormalizedElements(newData);

    chartBody.innerHTML = this.getBodyItems();
  }

  getBaseChartHeight() {
    const dashboardElement = document.querySelector('.dashboard__charts');
    const defaultHeight = 50;

    return dashboardElement
      ? getComputedStyle(dashboardElement).getPropertyValue('--chart-height')
      : defaultHeight;
  }

  getHeightNormalizedElements(data) {
    if (!data || !data.length) {
      return [];
    }

    const maxHeight = Math.max(...data);
    const proportion = maxHeight / this.chartHeight;

    return data.map((height) => ({
      value: Math.floor(height / proportion),
      percent: (height / maxHeight * 100).toFixed(0),
    }));
  }

  destroy() {
    this.remove();
    delete this;
  }

  remove() {
    this._element.remove();
  }
}
