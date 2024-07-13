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

    this._element = this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    const element = document.createElement('div');
    element.classList.add('column-chart');

    if (!this._data || !this._data.length) {
      element.classList.add('column-chart_loading');
    }

    element.appendChild(this.createTitle());
    element.appendChild(this.createContainer());

    return element;
  }

  createTitle() {
    const title = new ChartTitle({
      label: this._label,
      link: this._link,
    });

    return title.element;
  }

  createContainer() {
    this._chartContainerObject = new ChartContainer({
      data: this._data,
      value: this._value,
      formatHeading: this._formatHeading
    });

    return this._chartContainerObject.element;
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

    this._element = this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    const element = document.createElement('div');
    element.className = 'column-chart__title';
    element.textContent = `Total ${this._label}`;

    if (this._link) {
      element.appendChild(this.createLink());
    }

    return element;
  }

  createLink() {
    const salesLink = document.createElement('a');
    salesLink.classList.add('column-chart__link');
    salesLink.textContent = 'View all';
    salesLink.href = this._link;

    return salesLink;
  }
}

class ChartContainer {
  constructor({value, data, formatHeading}) {
    this._value = value;
    this._data = data;
    this._formatHeading = formatHeading;

    this._element = this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    const element = document.createElement('div');
    element.classList.add('column-chart__container');

    element.appendChild(this.createHeader());
    element.appendChild(this.createChartBody());

    return element;
  }

  createHeader() {
    const header = document.createElement('div');
    header.classList.add('column-chart__header');
    header.setAttribute("data-element", "header");
    header.textContent = this._formatHeading(this._value);

    return header;
  }

  createChartBody() {
    const chartBody = document.createElement('div');
    chartBody.classList.add('column-chart__chart');
    chartBody.setAttribute("data-element", "body");

    chartBody.append(...this.getContainerItems(this._data));

    return chartBody;
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
