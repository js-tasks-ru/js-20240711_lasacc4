import {borderValueValidator} from "./utils.js";

export default class DoubleSlider {
  constructor(props = {}) {
    const {
      min = 10,
      max = 90,
      formatValue = value => value,
      selected = {
        from: min,
        to: max
      },
    } = props;

    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.onThumbPointerDown = this.onThumbPointerDown.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
    this.onThumbPointerMove = this.onThumbPointerMove.bind(this);

    this.render();
  }

  render() {
    const wrapperElement = document.createElement("div");
    wrapperElement.innerHTML = this.getTemplate();

    this.element = wrapperElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('pointerdown', this.onThumbPointerDown);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.onThumbPointerDown);
    document.removeEventListener('pointerup', this.onThumbPointerUp);
    document.removeEventListener('pointermove', this.onThumbPointerMove);
  }

  onThumbPointerDown(e) {
    const element = e.target.closest('[data-element]');
    const isThumb = element && (element.dataset.element === 'left' || element.dataset.element === 'right');

    if (!isThumb) {
      return;
    }

    this._draggedThumb = element.dataset.element;
    this._thumbDirection = this._draggedThumb === 'left' ? 'from' : 'to';

    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onThumbPointerMove);
  }

  onThumbPointerUp() {
    this.element.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.onThumbPointerMove);

    this.selected[this._thumbDirection] = this._selectedAmount;
    this._draggedThumb = null;
    this.dispatchCustomEvents();
  }

  dispatchCustomEvents() {
    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: this.selected
    }));
  }

  onThumbPointerMove(e) {
    this._selectedAmount = this.getSelectedAmount(e.clientX);
    const newThumbPosition = this.calculateThumbPosition(this._draggedThumb, this._selectedAmount);

    this.subElements[this._draggedThumb].style[this._draggedThumb] = `${newThumbPosition}%`;
    this.subElements['progress'].style[this._draggedThumb] = `${newThumbPosition}%`;
    this.subElements[this._thumbDirection].textContent = this.formatValue(Math.floor(this._selectedAmount));
  }

  getSelectedAmount(clientX) {
    const innerSlider = this.subElements['inner'];
    const sliderWidth = innerSlider.getBoundingClientRect().width;
    const sliderLeftBorder = innerSlider.getBoundingClientRect().left;

    const proportion = sliderWidth / (this.max - this.min);
    const selectedAmount = (clientX - sliderLeftBorder) / proportion;

    return this.getNormalizedAmount(selectedAmount, this._draggedThumb);
  }

  getNormalizedAmount(amount, thumb) {
    const leftShiftedAmount = amount + this.min;

    const params = {
      value: leftShiftedAmount,
      min: this.min,
      max: this.max,
      selected: this.selected
    };

    return borderValueValidator[thumb](params);
  }

  calculateThumbPosition(thumb, amount) {
    const value = thumb === 'right'
      ? this.max - amount
      : amount - this.min;

    const overallPercent = this.max - this.min;

    return (this.max + this.min) * value / (overallPercent > 0 ? overallPercent : 1);
  }

  getTemplate() {
    return (
      `<div class="range-slider">
        ${this.getValueTemplate('from', this.selected.from)}
          <div class="range-slider__inner" data-element="inner">
            ${this.getInnerContentTemplate()}
          </div>
        ${this.getValueTemplate('to', this.selected.to)}
    </div>`
    );
  }

  getValueTemplate(dataValue, value) {
    return (
      `<span data-element="${dataValue}">
        ${this.formatValue(value)}
      </span>`
    );
  }

  getInnerContentTemplate() {
    const left = this.calculateThumbPosition('left', this.selected.from);
    const right = this.calculateThumbPosition('right', this.selected.to);

    return (
      `<span
          class="range-slider__progress"
          data-element="progress"
          style="left: ${left}%; right: ${right}%"
       ></span>
       <span
          class="range-slider__thumb-left"
          data-element="left"
          style="left: ${left}%"
       ></span>
       <span
          class="range-slider__thumb-right"
          data-element="right"
          style="right: ${right}%"
       ></span>`
    );
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

  destroy() {
    this.element.remove();
    this.removeEventListeners();
  }
}
