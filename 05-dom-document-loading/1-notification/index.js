export default class NotificationMessage {
  static _activeNotification;

  constructor(message = "", props = {}) {
    const {
      duration = 2000,
      type = "success"
    } = props;

    this._message = message;
    this._duration = duration;
    this._type = type;

    this._element = this.createElement();
  }

  get element() {
    return this._element;
  }

  get duration() {
    return this._duration;
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createNotificationTemplate();

    return element.firstElementChild;
  }

  createNotificationTemplate() {
    return (
      `<div
          class="notification ${this._type}"
          style="--value:${this.getDurationInSeconds()}s"
       >
          <div class="timer"></div>
          <div class="inner-wrapper">
             ${this.createWrapperContent()}
          </div>
       </div>`
    );
  }

  getDurationInSeconds() {
    return this._duration / 1000;
  }

  createWrapperContent() {
    return (
      `<div class="notification-header">
           ${this._type}
       </div>
       <div class="notification-body">
          ${this._message}
       </div>`
    );
  }

  show(containerElement = document.body) {
    if (NotificationMessage._activeNotification) {
      NotificationMessage._activeNotification.destroy();
    }

    containerElement.append(this._element);
    NotificationMessage._activeNotification = this;
    this.timerId = setTimeout(() => this.remove(), this._duration);
  }

  remove() {
    this._element.remove();
  }

  destroy() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.remove();
  }
}
