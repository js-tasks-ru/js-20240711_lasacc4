import {dateComparer} from "./utils.js";

export default class RangePicker {
  isOpen = false;
  selectionStart;

  constructor(props) {
    const {
      from = new Date(2024, 6, 15),
      to = new Date(2024, 7, 25),
    } = props;

    this.onRangePickerInputClick = this.onRangePickerInputClick.bind(this);
    this.onSelectorContentClick = this.onSelectorContentClick.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);

    this.from = from;
    this.to = to;
    this.leftPickerDate = new Date(from.getFullYear(), from.getMonth());
    this.rightPickerDate = new Date(to.getFullYear(), to.getMonth());

    this.render();
  }

  render() {
    const rootElement = document.createElement("div");
    rootElement.innerHTML = this.createTemplate();

    this.element = rootElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.createEventListeners();
  }

  onRangePickerInputClick(e) {
    if (this.isOpen) {
      return;
    }

    e.stopPropagation();

    const {selector} = this.subElements;

    if (!selector.innerHTML) {
      selector.innerHTML = this.createSelectorTemplate();
      this.subElements = {...this.subElements, ...this.getSubElements(selector)};
    }

    this.element.classList.add('rangepicker_open');
    this.isOpen = true;
  }

  onDocumentClick() {
    if (!this.isOpen) {
      return;
    }

    this.element.classList.remove('rangepicker_open');
    this.isOpen = false;
  }

  onSelectorContentClick(e) {
    e.stopPropagation();

    this.changeCalendarMonth(e);
    this.selectNewDateRange(e);
  }

  changeCalendarMonth(e) {
    const controlElement = e.target.closest('[data-control]');

    if (!controlElement) {
      return;
    }

    const controlDirection = controlElement.dataset.control;
    const monthChangeDirection = controlDirection === 'left' ? -1 : 1;

    this.leftPickerDate = this.getUpdatedMonthDate(this.leftPickerDate, monthChangeDirection);
    this.rightPickerDate = this.getUpdatedMonthDate(this.rightPickerDate, monthChangeDirection);

    this.updateCalendarsContent();
  }

  selectNewDateRange(e) {
    const controlElement = e.target.closest('[data-value]');

    if (!controlElement) {
      return;
    }

    if (!this.selectionStart) {
      this.clearSelectedClasses();
      e.target.classList.add('rangepicker__selected-from');
      this.selectionStart = controlElement;
    } else {
      this.setNewSelectedRange(controlElement);
      this.dispatchDateSelectEvent();
      this.selectionStart = undefined;
    }
  }

  setNewSelectedRange(controlElement) {
    const firstSelectionValue = new Date(this.selectionStart.dataset.value);
    const currentSelectionValue = new Date(controlElement.dataset.value);

    const isFirstValueLess = dateComparer.isFirstValueLess(firstSelectionValue, currentSelectionValue);

    this.from = isFirstValueLess ? firstSelectionValue : currentSelectionValue;
    this.to = isFirstValueLess ? currentSelectionValue : firstSelectionValue;

    this.updateCalendarsContent();
    this.subElements.input.innerHTML = this.createInputContentTemplate();
  }

  updateCalendarsContent() {
    const {calendarLeft, calendarRight} = this.subElements;

    calendarLeft.innerHTML = this.createCalendarContentTemplate(this.leftPickerDate);
    calendarRight.innerHTML = this.createCalendarContentTemplate(this.rightPickerDate);
  }

  clearSelectedClasses() {
    const cells = this.element.querySelectorAll('.rangepicker__cell');

    cells.forEach(cell => cell.classList.remove(
      'rangepicker__selected-between',
      'rangepicker__selected-from',
      'rangepicker__selected-to',
    ));
  }

  getUpdatedMonthDate(date, months) {
    return new Date(date.setMonth(date.getMonth() + months));
  }

  dispatchDateSelectEvent() {
    const event = new CustomEvent('date-select', {
      detail: {from: this.from, to: this.to},
    });

    dispatchEvent(event);
  }

  createEventListeners() {
    this.subElements.input.addEventListener('click', this.onRangePickerInputClick);
    this.subElements.selector.addEventListener('click', this.onSelectorContentClick);
    document.addEventListener('click', this.onDocumentClick);
  }

  destroyEventListeners() {
    this.subElements.input.removeEventListener('click', this.onRangePickerInputClick);
    this.subElements.selector.removeEventListener('click', this.onSelectorContentClick);
    document.removeEventListener('click', this.onDocumentClick);
  }

  createTemplate() {
    return (
      `<div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
            ${this.createInputContentTemplate()}
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>`
    );
  }

  createInputContentTemplate() {
    return (`
        <span data-element="from">${this.from.toLocaleString().split(',')[0]}</span> -
        <span data-element="to">${this.to.toLocaleString().split(',')[0]}</span>`
    );
  }

  createSelectorTemplate() {
    return (`
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left" data-control="left"></div>
      <div class="rangepicker__selector-control-right" data-control="right"></div>
      <div class="rangepicker__calendar" data-element="calendarLeft">
        ${this.createCalendarContentTemplate(this.leftPickerDate)}
      </div>
      <div class="rangepicker__calendar" data-element="calendarRight">
        ${this.createCalendarContentTemplate(this.rightPickerDate)}
      </div>`);
  }

  createCalendarContentTemplate(date) {
    const monthName = date.toLocaleString('ru-RU', {month: 'long'});

    return (`
        <div class="rangepicker__month-indicator">
          <time datetime=${monthName}>${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
            ${this.createDateGridTemplate(date)}
        </div>`);
  }

  createDateGridTemplate(date) {
    const fullYear = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = this.getDaysInMonth(fullYear, month);
    const firstDayOfMonth = this.getFirstDayOfMonth(fullYear, month);

    return Array(daysInMonth).fill(0).map((_, i) => {
      const dayNumber = i + 1;
      const elementDateValue = new Date(fullYear, month, dayNumber, 17);
      const startFromStyle = `style="--start-from: ${firstDayOfMonth}"`;

      return (
        `<button
            type="button"
            class="rangepicker__cell ${this.getRangePickerClasses(elementDateValue).join('')}"
            data-value=${elementDateValue.toISOString()}
            ${dayNumber === 1 ? startFromStyle : ''}
        >
            ${dayNumber}
        </button>`
      );
    }).join('');
  }

  getRangePickerClasses(elementDate) {
    const isFromSelected = dateComparer.isSameDay(elementDate, this.from);
    const isToSelected = dateComparer.isSameDay(elementDate, this.to);
    const key = isFromSelected ? 'from' : 'to';

    const isBetween = dateComparer.isBetweenDates(this.from, this.to, elementDate);

    const selectedClass = (isFromSelected || isToSelected) ? `rangepicker__selected-${key}` : '';
    const betweenClass = isBetween ? 'rangepicker__selected-between' : '';

    return [selectedClass, betweenClass];
  }

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(year, month) {
    const dayNumber = new Date(year, month + 1, 1).getDay();

    return dayNumber === 0 ? 7 : dayNumber;
  }

  getSubElements(rootElement) {
    const elements = rootElement.querySelectorAll('[data-element]');
    const result = {};

    elements.forEach(subElement => {
      const elementValue = subElement.dataset.element;
      result[elementValue] = subElement;
    });

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyEventListeners();
  }
}
