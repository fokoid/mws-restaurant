class ReviewForm {
  constructor({restaurant_id, submitCallback} = {}) {
    const li = document.createElement('li');
    li.id = 'user-review';
    li.classList.add('card', 'review', 'user-review');

    const header = document.createElement('div');
    li.appendChild(header);
    header.classList.add('card-header', 'review-header');

    const form = document.createElement('form');
    li.appendChild(form);

    const hiddenID = document.createElement('input');
    form.appendChild(hiddenID);
    form.method = 'POST';
    form.onsubmit = event => {
      if (submitCallback)
        submitCallback();
      event.preventDefault();
    };
    hiddenID.type = 'hidden';
    hiddenID.name = 'id';

    const hiddenRestaurantID = document.createElement('input');
    form.appendChild(hiddenRestaurantID);
    hiddenRestaurantID.type = 'hidden';
    hiddenRestaurantID.name = 'restaurant_id';
    hiddenRestaurantID.value = restaurant_id;

    const nameContainer = document.createElement('label');
    form.appendChild(nameContainer);
    nameContainer.innerHTML = 'Name';
    const nameInput = document.createElement('input');
    nameContainer.appendChild(nameInput);
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.required = 'required';

    const ratingContainer = document.createElement('fieldset');
    form.appendChild(ratingContainer);
    form.setAttribute('aria-label', 'Rating');
    const radios = [1, 2, 3, 4, 5].map(r => {
      const radio = document.createElement('input');
      ratingContainer.appendChild(radio);
      radio.type = 'radio';
      radio.name = 'rating';
      radio.id = `rating-${r}`;
      radio.required = 'required';
      radio.setAttribute('aria-label', r);
      return radio;
    });

    const textarea = document.createElement('textarea');
    form.appendChild(textarea);
    textarea.name = 'comments';

    const submitButton = document.createElement('button');
    form.appendChild(submitButton);
    submitButton.classList.add('brand-button');
    submitButton.type = 'submit';
    submitButton.innerHTML = 'Submit Review';

    this.clear = () => {
      header.innerHTML = 'Please write your review...';
      hiddenID.value = null;
      nameInput.value = '';
      textarea.value = '';
      radios.forEach(radio => radio.removeAttribute('checked'));
    };

    this.reset = review => {
      console.log(review);
      if (!review) {
        this.clear();
        return ;
      }

      header.innerHTML = 'Edit your review…';
      hiddenID.value = review.id;
      hiddenRestaurantID.value = review.restaurant_id;
      nameInput.value = review.reviewer;
      textarea.value = review.text;
      radios.forEach(radio => {
        if (review && `rating-${review.rating}` === radio.id)
          radio.checked = 'checked';
      });
    };

    this.hide = () => void li.classList.add('inactive');
    this.show = () => void li.classList.remove('inactive');

    this._node = li;
  }

  get node() { return this._node; }
}


class Review {
  constructor({data, editCallback, deleteCallback}) {
    this._data = data;
    this._editCallback = editCallback;
    this._deleteCallback = deleteCallback;
  }

  get id() { return this._data.id; }
  get restaurant_id() { return this._data.restaurant_id; }
  get isUserOwned() {
    return localStorage.getItem(`user-owns-review-${this.id}`) !== null;
  }
  get reviewer() { return this._data.name; }
  get rating() { return this._data.rating; }
  get ratingText() {
    return  `${this.rating} star${this.rating > 1 ? 's' : ''}`;
  }
  get date() { return new Date(this._data.updatedAt); }
  get text() { return this._data.comments; }
  get cardHTML() {
    if (!this._cardNode) this._cardNode = this.makeCardHTML();
    return this._cardNode;
  }

  makeCardHTML() {
    const li = document.createElement('li');
    li.classList.add('card', 'review');
    if (this.isUserOwned)
      li.classList.add('user-review');
    li.appendChild(this._makeHeader());
    li.appendChild(this._makeText());
    if (this.isUserOwned)
      li.appendChild(this._makeButtons());
    return li;
  }

  _makeHeader() {
    const header = document.createElement('div');
    header.classList.add('review-header', 'card-header');

    const name = document.createElement('span');
    name.innerHTML = this.reviewer;
    name.classList.add('review-name');
    header.appendChild(name);

    const rating = document.createElement('span');
    rating.innerHTML = '★'.repeat(this.rating);
    rating.classList.add('review-rating');
    rating.setAttribute('aria-label', this.ratingText);
    header.appendChild(rating);

    const date = document.createElement('span');
    date.innerHTML = this.date.toLocaleDateString('en-gb', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    date.classList.add('review-date');
    header.appendChild(date);

    return header;
  }

  _makeText() {
    const text = document.createElement('p');
    text.innerHTML = this.text;
    text.classList.add('review-text');
    return text;
  }

  _makeButtons() {
    const container = document.createElement('div');

    const edit = document.createElement('button');
    container.appendChild(edit);
    edit.classList.add('icon-button', 'edit');
    edit.setAttribute('aria-label', 'Edit');
    edit.addEventListener('click', this._editCallback);

    const del = document.createElement('button');
    container.appendChild(del);
    del.classList.add('icon-button', 'delete');
    del.setAttribute('aria-label', 'Delete');

    return container;
  }
}

export {Review, ReviewForm};
