export default class ColumnChart {
  constructor(props = {}) {
    const {data, label, value, link, formatHeading} = props;

    this.chartHeight = +this.getBaseChartHeight();
    this._label = label;
    this._value = value;
    this._link = link;
    this._formatHeading = formatHeading;
    this._data = data ? this.getHeightNormalizedElements(data) : [];

    this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    this._element = document.createElement('div');
    this._element.classList.add('column-chart');

    if (!this._data || !this._data.length) {
      this._element.classList.add('column-chart_loading');
    }

    this.appendChildrenNodes();
  }

  appendChildrenNodes() {
    const title = new ChartTitle({
      label: this._label,
      link: this._link,
    });

    this._chartContainerObject = new ChartContainer({
      data: this._data,
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

    this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    this._element = document.createElement('div');
    this._element.className = 'column-chart__title';
    this._element.textContent = `Total ${this._label}`;

    this.appendExtraNodes();
  }

  appendExtraNodes() {
    if (this._link) {
      const salesLink = document.createElement('a');
      salesLink.classList.add('column-chart__link');
      salesLink.textContent = 'View all';
      salesLink.href = this._link;

      this._element.appendChild(salesLink);
    }
  }
}

class ChartContainer {
  constructor({value, data, formatHeading = () => value}) {
    this._value = value;
    this._data = data;
    this._formatHeading = formatHeading;

    this.createNodes();
  }

  get element() {
    return this._element;
  }

  createNodes() {
    this._element = document.createElement('div');
    this._element.classList.add('column-chart__container');

    this.appendHeader();
    this.appendChartBody();
  }

  appendHeader() {
    const header = document.createElement('div');
    header.classList.add('column-chart__header');
    header.setAttribute("data-element", "header");
    header.textContent = this._formatHeading(this._value);

    this._element.appendChild(header);
  }

  appendChartBody() {
    const chartBody = document.createElement('div');
    chartBody.classList.add('column-chart__chart');
    chartBody.setAttribute("data-element", "body");

    chartBody.append(...this.getContainerItems(this._data));
    this._element.appendChild(chartBody);
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
