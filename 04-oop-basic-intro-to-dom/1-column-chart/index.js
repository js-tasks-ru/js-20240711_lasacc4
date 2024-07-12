export default class ColumnChart {
  constructor(props = {}) {
    const {data, label, value, link, formatHeading} = props;

    this.chartHeight = +this.getBaseChartHeight();
    this._label = label;
    this._value = value;
    this._link = link;
    this._formatHeading = formatHeading;

    this._element = document.createElement('div');
    this._element.classList.add('column-chart');

    if (!data || !data.length) {
      this._element.classList.add('column-chart_loading');
    }

    const normalizedData = this.getHeightNormalizedElements(data);

    this.initElements(normalizedData);
  }

  get element() {
    return this._element;
  }

  initElements(data) {
    const title = new ChartTitle({
      label: this._label,
      link: this._link,
    });

    this._chartContainerObject = new ChartContainer({
      data,
      value: this._value,
      formatHeading: this._formatHeading
    });

    this._element.append(title.element);
    this._element.append(this._chartContainerObject.element);
  }

  update(newData) {
    if (!newData || !newData.length) {
      this._element.classList.add('column-chart_loading');
      return;
    }

    this._element.classList.remove('column-chart_loading');
    const normalizedData = this.getHeightNormalizedElements(newData);
    this._chartContainerObject.updateChartBody(normalizedData);
  }

  remove() {
    this._element.remove();
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
}

class ChartTitle {
  constructor({label, link}) {
    this._label = label;
    this._link = link;

    const title = document.createElement('div');
    title.className = 'column-chart__title';
    title.textContent = `Total ${this._label}`;

    this.appendExtraTitleElements(title);

    this._element = title;
  }

  get element() {
    return this._element;
  }

  appendExtraTitleElements(title) {
    if (this._link) {
      const salesLink = document.createElement('a');
      salesLink.classList.add('column-chart__link');
      salesLink.textContent = 'View all';
      salesLink.href = this._link;

      title.appendChild(salesLink);
    }
  }
}

class ChartContainer {
  constructor({value, data, formatHeading = () => value}) {
    this._value = value;
    this._data = data;
    this._formatHeading = formatHeading;

    const container = document.createElement('div');
    container.classList.add('column-chart__container');

    this.appendHeader(container);
    this.appendChartBody(container);

    this._element = container;
  }

  get element() {
    return this._element;
  }

  appendHeader(container) {
    const header = document.createElement('div');
    header.classList.add('column-chart__header');
    header.setAttribute("data-element", "header");
    header.textContent = this._formatHeading(this._value);

    container.appendChild(header);
  }

  appendChartBody(container) {
    const chartBody = document.createElement('div');
    chartBody.classList.add('column-chart__chart');
    chartBody.setAttribute("data-element", "body");

    chartBody.append(...this.getContainerItems(this._data));
    container.appendChild(chartBody);
  }

  updateChartBody(newData) {
    const chartBody = document.querySelector('.column-chart__chart');
    chartBody.innerHTML = '';
    chartBody.append(...this.getContainerItems(newData));
  }

  getContainerItems(data) {
    if (!data) {
      return [];
    }

    return data.map((item) => ChartContainerItem.create(item));
  }
}

class ChartContainerItem {
  static create({value, percent}) {
    const chartElement = document.createElement("div");

    chartElement.style.setProperty("--value", value?.toString());
    chartElement.setAttribute("data-tooltip", `${percent}%`);

    return chartElement;
  }
}
