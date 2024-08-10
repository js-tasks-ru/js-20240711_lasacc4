import RangePicker from "../../08-forms-fetch-api-part-2/2-range-picker/index.js";
import SortableTable from "../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js";
import ColumnChart from "../../07-async-code-fetch-api-part-1/1-column-chart/index.js";
import header from "./bestsellers-header.js";

export default class Page {
  element;
  components;

  constructor() {
    const today = new Date();
    const range = {
      from: new Date(today.getFullYear(), today.getMonth() - 1),
      to: today,
    };

    this.components = {
      rangePicker: new RangePicker(range),
      ordersChart: new ColumnChart({
        url: "api/dashboard/orders",
        label: "orders",
        link: "#",
        range: range,
      }),
      salesChart: new ColumnChart({
        url: "api/dashboard/sales",
        label: "sales",
        formatHeading: (data) => `$${data}`,
        range: range,
      }),
      customersChart: new ColumnChart({
        url: "api/dashboard/customers",
        label: "customers",
        range: range,
      }),
      sortableTable: new SortableTable(header, {
        url: "api/dashboard/bestsellers",
        isSortLocally: true,
        dateRange: range,
      }),
    };
  }

  async render() {
    const rootElement = document.createElement("div");
    rootElement.innerHTML = this.createTempalte();

    this.element = rootElement.firstElementChild;
    this.subElements = this.getSubElements();
    this.appendComponentElements();
    this.createEventListeners();

    return this.element;
  }

  onRangePickerDateSelect = (e) => {
    Object.values(this.components).forEach(async (component) => {
      const { from, to } = e.detail;

      if (!(component instanceof RangePicker)) {
        await component.update(from, to);
      }
    });
  };

  createEventListeners() {
    this.components.rangePicker.element.addEventListener(
      "date-select",
      this.onRangePickerDateSelect
    );
  }

  destroyEventListeners() {
    this.components.rangePicker.element.removeEventListener(
      "date-select",
      this.onRangePickerDateSelect
    );
  }

  createTempalte() {
    return `<div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>
                <h3 class="block-title">Best sellers</h3>
                <div data-element="sortableTable"></div>
            </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");

    return [...elements].reduce((acc, element) => {
      const value = element.dataset.element;
      acc[value] = element;

      return acc;
    }, {});
  }

  appendComponentElements() {
    Object.entries(this.components).forEach(([name, component]) => {
      this.subElements[name].append(component.element);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyEventListeners();
    this.remove();
    Object.values(this.components).forEach((component) => component.destroy());
  }
}
