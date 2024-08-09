export default class SortableList {
  constructor(props = {}) {
    const {
      items = []
    } = props;

    this.onDraggableMouseDown = this.onDraggableMouseDown.bind(this);
    this.onDraggableMouseMove = this.onDraggableMouseMove.bind(this);
    this.onDraggableMouseUp = this.onDraggableMouseUp.bind(this);
    this.onDeleteHandleClick = this.onDeleteHandleClick.bind(this);

    this.items = items;

    this.render();
  }

  updateList(items) {
    this.items = items;
    this.element.innerHTML = this.createListItemsTemplate();
  }

  onDraggableMouseDown(e) {
    e.preventDefault();

    const draggableElement = e.target.closest('[data-grab-handle]');

    if (!draggableElement) {
      return;
    }

    const listItemElement = draggableElement.closest('.sortable-list__item');

    this.createDynamicEventListeners();
    this.calculateCursorPositionShift(listItemElement, e.clientX, e.clientY);
    this.setDraggingStyles(listItemElement);

    listItemElement.after(this.placedHolderElement);

    this.draggedElement = listItemElement;
    this.moveDraggedElement(e.clientX, e.clientY);
  }

  onDraggableMouseMove(e) {
    this.moveDraggedElement(e.clientX, e.clientY);
    const closestElement = this.getClosestListElement(e.clientX, e.clientY);

    if (!closestElement) {
      return;
    }

    const direction = this.getElementAppendDirection(e.clientY, closestElement);
    closestElement[direction](this.placedHolderElement);
  }

  onDraggableMouseUp() {
    this.draggedElement.classList.remove('sortable-list__item_dragging');
    this.draggedElement.style = undefined;
    this.placedHolderElement.replaceWith(this.draggedElement);

    this.destroyDynamicEventListeners();
  }

  onDeleteHandleClick(e) {
    const deleteHandler = e.target.closest('[data-delete-handle]');

    if (!deleteHandler) {
      return;
    }

    const listItemElement = deleteHandler.closest('.sortable-list__item');

    this.items = this.items.filter(item => item !== listItemElement);
    listItemElement.remove();
    this.element.dispatchEvent(new CustomEvent('item-deleted', { detail: deleteHandler }));
  }

  calculateCursorPositionShift(draggable, x, y) {
    const {top, left} = draggable.getBoundingClientRect();

    this.shiftLeft = x - left;
    this.shiftRight = y - top;
  }

  setDraggingStyles(listItem) {
    const {height, width} = listItem.getBoundingClientRect();

    this.placedHolderElement.style.height = `${height}px`;
    this.placedHolderElement.style.width = `${width}px`;

    listItem.style.height = `${height}px`;
    listItem.style.width = `${width}px`;
    listItem.classList.add('sortable-list__item_dragging');
  }

  moveDraggedElement(x, y) {
    this.draggedElement.style.left = `${x - this.shiftLeft}px`;
    this.draggedElement.style.top = `${y - this.shiftRight}px`;
  }

  getClosestListElement(x, y) {
    this.draggedElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(x, y);
    this.draggedElement.style.display = '';

    if (!elementBelow) {
      return;
    }

    return elementBelow.closest('.sortable-list__item');
  }

  getElementAppendDirection(y, element) {
    const {top, bottom} = element.getBoundingClientRect();
    const topDiff = Math.abs(top - y);
    const bottomDiff = Math.abs(bottom - y);

    return topDiff < bottomDiff ? 'before' : 'after';
  }

  render() {
    const rootElement = document.createElement("ul");
    rootElement.classList.add("sortable-list");

    this.createPlaceholderElement();

    rootElement.innerHTML = this.createListItemsTemplate();
    this.element = rootElement;
    this.createEventListeners();
  }

  createPlaceholderElement() {
    this.placedHolderElement = document.createElement('div');
    this.placedHolderElement.classList.add('sortable-list__placeholder');
  }


  createListItemsTemplate() {
    const rootElement = document.createElement('div');

    rootElement.append(...this.items.map(item => {
      item.classList.add('sortable-list__item');
      return item;
    }));

    return rootElement.innerHTML;
  }

  createEventListeners() {
    this.element.addEventListener('pointerdown', this.onDraggableMouseDown);
    this.element.addEventListener('pointerdown', this.onDeleteHandleClick);
  }

  createDynamicEventListeners() {
    document.addEventListener('pointermove', this.onDraggableMouseMove);
    document.addEventListener('pointerup', this.onDraggableMouseUp);
  }

  destroyEventListeners() {
    this.element.removeEventListener('pointerdown', this.onDraggableMouseDown);
    this.element.removeEventListener('pointerdown', this.onDeleteHandleClick);
    this.destroyDynamicEventListeners();
  }

  destroyDynamicEventListeners() {
    document.removeEventListener('pointermove', this.onDraggableMouseMove);
    document.removeEventListener('pointerup', this.onDraggableMouseUp);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyEventListeners();
  }
}
