export default class NotificationMessage {
  static _activeNotification;
  static _timeout;

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
    const root = document.createElement('div');
    root.innerHTML = this.createNotificationTemplate();

    return root.firstElementChild;
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

  show(rootElement) {
    if (NotificationMessage._activeNotification) {
      this.removeActiveNotification();
    }

    const root = rootElement ?? document.body;
    root.append(this._element);
    this.setActiveNotification();
  }

  setActiveNotification() {
    NotificationMessage._activeNotification = this._element;
    NotificationMessage._timeout = setTimeout(() => this.remove(), this._duration);
  }

  remove() {
    this._element.remove();
    NotificationMessage._activeNotification = undefined;
  }

  removeActiveNotification() {
    if (NotificationMessage._timeout) {
      clearTimeout(NotificationMessage._timeout);
    }

    NotificationMessage._activeNotification?.remove();
    NotificationMessage._activeNotification = undefined;
  }

  destroy() {
    this.remove();
    this.removeActiveNotification();
    delete this;
  }
}
