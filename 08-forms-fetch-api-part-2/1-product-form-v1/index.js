import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const IMGUR_URL = 'https://api.imgur.com/3/image';
const BACKEND_URL = 'https://course-js.javascript.ru';
const CATEGORIES_ENDPOINT = '/api/rest/categories?_sort=weight&_refs=subcategory';
const PRODUCTS_ENDPOINT = '/api/rest/products';

export default class ProductForm {
  subElements = {};

  constructor(productId = '') {
    this.productId = productId;
    this.productsUrl = new URL(PRODUCTS_ENDPOINT, BACKEND_URL);
    this.categoriesUrl = new URL(CATEGORIES_ENDPOINT, BACKEND_URL);

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onUploadButtonClick = this.onUploadButtonClick.bind(this);
    this.onUploadInputChange = this.onUploadInputChange.bind(this);
    this.onDeleteImageButtonClick = this.onDeleteImageButtonClick.bind(this);

    this.productData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      price: 100,
      discount: 0
    };
    this.images = [];
    this.isEditMode = !!productId;
  }

  async render() {
    await this.fetchInitialData();

    const wrapperElement = document.createElement('div');
    wrapperElement.innerHTML = this.createTemplate();

    this.element = wrapperElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.setInitialFormValues();
    this.createEventListeners();

    return this.element;
  }

  async onFormSubmit(e) {
    e.preventDefault();

    const productFormElements = this.subElements.productForm?.elements;
    this.productData = this.getNewProductData(productFormElements, (dict, key) => dict[key]?.value);

    await this.save(productFormElements);
  }

  onUploadButtonClick() {
    const {uploadInput} = this.subElements;

    if (uploadInput) {
      uploadInput.click();
    }
  }

  async onUploadInputChange(e) {
    const formData = new FormData();
    formData.append("image", e.target.files[0], e.target.files[0].name);

    const link = await this.sendImageFile(formData);

    this.images = [
      ...this.images,
      {url: link || '', source: e.target.files[0].name}
    ];

    this.subElements['imageListContainer'].innerHTML = this.createImageListTemplate();
  }

  onDeleteImageButtonClick(e) {
    const deleteButton = e.target.closest('[data-delete-handle]');

    if (!deleteButton) {
      return;
    }

    const imageSource = deleteButton.dataset.deleteHandle;

    this.images = this.images.filter((image) => image.source !== imageSource);
    this.subElements['imageListContainer'].innerHTML = this.createImageListTemplate();
  }

  async save() {
    const {id} = await this.sendProductData();
    this.dispatchProductEvent();

    if (!this.isEditMode) {
      this.productId = id;
      this.isEditMode = true;
      await this.fetchInitialData();
    }
  }

  async fetchInitialData() {
    this.categoriesData = await this.fetchJsonData(this.categoriesUrl);

    if (this.productId) {
      await this.fetchProductData();
    }
  }

  async fetchProductData() {
    this.productsUrl.searchParams.set('id', this.productId);
    const responseData = await this.fetchJsonData(this.productsUrl);

    if (!responseData.length) {
      return;
    }

    const fetchedProduct = responseData[0];

    this.images = fetchedProduct.images;
    this.productData = this.getNewProductData(fetchedProduct);
  }

  async sendProductData() {
    this.productsUrl.searchParams.delete('id');

    return fetchJson(this.productsUrl, {
      method: this.isEditMode ? 'PATCH' : 'PUT',
      body: JSON.stringify({
        ...this.productData,
        id: this.isEditMode ? this.productId : '',
        images: this.images
      }),
      headers: new Headers({'content-type': 'application/json'}),
    });
  }

  dispatchProductEvent() {
    const eventName = this.isEditMode ? 'product-updated' : 'product-saved';

    this.element.dispatchEvent(new CustomEvent(eventName, {
      detail: this.productData
    }));
  }

  async sendImageFile(data) {
    const responseBody = await this.fetchJsonData(IMGUR_URL, {
      method: 'POST',
      body: data,
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      }
    });

    return responseBody?.data?.link ?? 'no-link';
  }

  async fetchJsonData(url, data = {}, defaultValue = []) {
    try {
      return await fetchJson(url, data);
    } catch (e) {
      console.error(e);
      return defaultValue;
    }
  }

  setInitialFormValues() {
    const {productForm} = this.subElements;

    Object.entries(this.productData)
      .forEach(([key, value]) => {
        productForm.querySelector(`#${key}`).value = value;
      });
  }

  getNewProductData(dictionary, valueGetter = (dict, key) => dict[key]) {
    return Object.keys(this.productData).reduce((acc, key) => {
      const formValue = valueGetter(dictionary, key);

      acc[key] = Number.isInteger(this.productData[key])
        ? +formValue
        : formValue;

      return acc;
    }, {});
  }

  createEventListeners() {
    const {productForm, uploadButton, uploadInput} = this.subElements;
    productForm.addEventListener('submit', this.onFormSubmit);
    uploadButton.addEventListener('click', this.onUploadButtonClick);
    uploadInput.addEventListener('change', this.onUploadInputChange);
    this.element.addEventListener('click', this.onDeleteImageButtonClick);
  }

  destroyEventListeners() {
    const {productForm, uploadButton, uploadInput} = this.subElements;
    productForm.removeEventListener('submit', this.onFormSubmit);
    uploadButton.removeEventListener('click', this.onUploadButtonClick);
    uploadInput.removeEventListener('change', this.onUploadInputChange);
    this.element.removeEventListener('click', this.onDeleteImageButtonClick);
  }

  createTemplate() {
    return (
      `<div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
           <fieldset>
              <label class="form-label">Название товара</label>
              <input
                 id="title"
                 required=""
                 type="text"
                 name="title"
                 class="form-control"
                 placeholder="Название товара"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea
                required=""
                class="form-control"
                name="description"
                id="description"
                data-element="productDescription"
                placeholder="Описание товара"
            >
            </textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
                ${this.createImageListTemplate()}
            </div>
            <button
                type="button"
                name="uploadImage"
                class="button-primary-outline"
                data-element="uploadButton"
            >
               <span>Загрузить</span>
               <input type="file" hidden accept="image/*" data-element="uploadInput">
            </button>
          </div>
          <div class="form-group form-group__half_left">
            ${this.createCategoriesTemplate()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input
                required=""
                type="number"
                id="price"
                name="price"
                class="form-control"
                placeholder="100"
              >
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input
                required=""
                type="number"
                id="discount"
                name="discount"
                class="form-control"
                placeholder="0"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input
                required=""
                type="number"
                class="form-control"
                name="quantity"
                placeholder="1"
                id="quantity"
              >
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" data-element="productStatus"  id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
    </div>`);
  }

  createCategoriesTemplate() {
    const subCategories = this.categoriesData.flatMap(({title, subcategories}) => (
      subcategories.map(({id, title: subTitle}) => {
        return (`
          <option
              value=${escapeHtml(id)}
          >
            ${escapeHtml(title)} ${escapeHtml('>')} ${escapeHtml(subTitle)}
          </option>`);
      })
    )).join('');

    return (
      `<label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
            ${subCategories}
        </select>`
    );
  }

  createImageListTemplate() {
    const imageList = this.images.map(({source, url}) => this.createImageItemTemplate(source, url)).join('');

    return (
      `<ul class="sortable-list">
           ${imageList}
      </ul>`
    );
  }

  createImageItemTemplate(source = '', url = '') {
    const escapedSource = escapeHtml(source);
    const escapedUrl = escapeHtml(url);

    return (
      `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value=${escapedUrl}>
          <input type="hidden" name="source" value=${escapedSource}>
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src=${escapedUrl}>
            <span>${escapedSource}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle=${escapedSource} alt="delete">
          </button>
      </li>`
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyEventListeners();
  }
}
