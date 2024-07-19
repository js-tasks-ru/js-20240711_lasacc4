class Tooltip {
  static _instance = null;

  constructor() {
    if (Tooltip._instance) {
      return Tooltip._instance;
    }

    Tooltip._instance = this;
    this.onElementPointerOver = this.onElementPointerOver.bind(this);
    this.onElementPointerMove = this.onElementPointerMove.bind(this);
    this.onElementPointerOut = this.onElementPointerOut.bind(this);
  }

  initialize () {
    this.addEventListeners();
  }

  addEventListeners() {
    document.body.addEventListener('pointerover', this.onElementPointerOver);
    document.body.addEventListener('pointermove', this.onElementPointerMove);
    document.body.addEventListener('pointerout', this.onElementPointerOut);
  }

  removeEventListeners() {
    document.body.removeEventListener('pointerover', this.onElementPointerOver);
    document.body.removeEventListener('pointermove', this.onElementPointerMove);
    document.body.removeEventListener('pointerout', this.onElementPointerOut);
  }

  onElementPointerOver(e) {
    const elementWithTooltip = e.target.closest('[data-tooltip]');

    if (!elementWithTooltip) {
      return;
    }

    this._tooltip = elementWithTooltip.dataset.tooltip;
    this._left = e.clientX;
    this._top = e.clientY;

    this.render();
  }

  onElementPointerMove(e) {
    if (this.element) {
      this.element.style.left = `${e.clientX}px`;
      this.element.style.top = `${e.clientY}px`;
    }
  }

  onElementPointerOut() {
    if (this.element) {
      this.element.remove();
    }
  }

  render() {
    const wrapperElement = document.createElement("div");
    wrapperElement.innerHTML = this.getTooltipTemplate();

    this.element = wrapperElement.firstElementChild;
    document.body.appendChild(this.element);
  }

  getTooltipTemplate() {
    const position = `left:${this._left}px; top: ${this._top}px`;

    return (
      `<div
        class="tooltip"
        style="${position}"
      >
        ${this._tooltip}
      </div>`
    );
  }

  destroy() {
    this.element.remove();
    this.removeEventListeners();
    Tooltip._instance = null;
  }
}

export default Tooltip;
