class ReviewForm {
  constructor({restaurant_id, submitCallback} = {}) {
    const li = document.createElement('li');
    li.id = 'user-review';
    li.classList.add('card', 'review', 'review-form');

    const header = document.createElement('div');
    li.appendChild(header);
    header.classList.add('card-header', 'review-header');

    const form = document.createElement('form');
    li.appendChild(form);

    const hiddenID = document.createElement('input');
    form.appendChild(hiddenID);
    form.method = 'POST';
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(event.target);
      if (submitCallback) {
        submitCallback({
          id: parseInt(data.get('id')),
          restaurant_id: parseInt(data.get('restaurant_id')),
          name: data.get('name'),
          rating: data.get('rating'),
          comments: data.get('comments')
        });
      }
    });
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
      radio.value = r;
      radio.required = 'required';
      radio.setAttribute('aria-label', r);
      return radio;
    });

    const textarea = document.createElement('textarea');
    form.appendChild(textarea);
    textarea.name = 'comments';
    textarea.placeholder = 'Enter comments…';
    textarea.setAttribute('aria-label', 'Enter comments…');

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
      if (!review) {
        this.clear();
        return ;
      }

      header.innerHTML = 'Edit your review…';
      hiddenID.value = review.id;
      hiddenRestaurantID.value = review.restaurant_id;
      nameInput.value = review.name;
      textarea.value = review.comments;
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
    return isNaN(this.id) || localStorage.getItem(`user-owns-review-${this.id}`) !== null;
  }
  get reviewer() { return this._data.name; }
  get rating() { return this._data.rating; }
  get ratingText() {
    return  `${this.rating} star${this.rating > 1 ? 's' : ''}`;
  }
  get date() { return new Date(this._data.updatedAt); }
  get text() { return this._data.comments; }
  get node() {
    if (!this._cardNode) this._cardNode = this.makeCardHTML();
    return this._cardNode;
  }

  makeCardHTML() {
    const li = document.createElement('li');
    li.classList.add('card', 'review');

    const header = document.createElement('div');
    header.classList.add('review-header', 'card-header');
    li.appendChild(header);

    const name = document.createElement('span');
    name.classList.add('review-name');
    header.appendChild(name);

    const rating = document.createElement('span');
    rating.classList.add('review-rating');
    header.appendChild(rating);

    const date = document.createElement('span');
    date.classList.add('review-date');
    header.appendChild(date);

    const text = document.createElement('p');
    text.classList.add('review-text');
    li.appendChild(text);

    const buttonContainer = document.createElement('div');
    li.appendChild(buttonContainer);

    const edit = document.createElement('button');
    buttonContainer.appendChild(edit);
    edit.classList.add('icon-button', 'edit');
    edit.setAttribute('aria-label', 'Edit');
    if (this._editCallback)
      edit.addEventListener('click', this._editCallback);

    const del = document.createElement('button');
    buttonContainer.appendChild(del);
    del.classList.add('icon-button', 'delete');
    del.setAttribute('aria-label', 'Delete');
    if (this._deleteCallback) {
      del.addEventListener('click', () => {
        this._deleteCallback({id: this.id, restaurant_id: this.restaurant_id});
      });
    }

    this.fillData = data => {
      if (!data) return;
      this._data = data;

      li.id = `review-${this.id}`;
      name.innerHTML = this.reviewer;
      rating.innerHTML = '★'.repeat(this.rating);
      rating.setAttribute('aria-label', this.ratingText);
      let theDate = this.date;
      if (isNaN(Date.parse(this._data.updatedAt))) {
        theDate = new Date();
      }
      date.innerHTML = theDate.toLocaleDateString('en-gb', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      text.innerHTML = this.text;
      if (this.isUserOwned) {
        li.classList.add('user-review');
        buttonContainer.classList.remove('inactive');
      } else {
        li.classList.remove('user-review');
        buttonContainer.classList.add('inactive');
      }
    };
    this.fillData(this._data);

    return li;
  }
}

export {Review, ReviewForm};
