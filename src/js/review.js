export default class Review {
  constructor(data) {
    this._data = data;
    this._fillHTML();
  }

  get id() { return this._data.id; }
  get reviewer() { return this._data.name; }
  get rating() { return this._data.rating; }
  get ratingText() {
    return  `${this.rating} star${this.rating > 1 ? 's' : ''}`;
  }
  get date() { return new Date(this._data.updatedAt); }
  get text() { return this._data.comments; }
  get cardHTML() { return this._card; }

  _fillHTML() {
    this._card = document.createElement('li');
    this._card.classList.add('card', 'review');

    this._card.appendChild(this._makeHeader());
    this._card.appendChild(this._makeText());
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
}
