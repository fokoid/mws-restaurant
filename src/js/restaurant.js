export default class Restaurant {
  constructor({data, favoriteCallback}) {
    this._data = data;
    this._setFavorite = favoriteCallback;
  }

  get id() { return this._data.id; }
  get name() { return this._data.name; }
  get hours() { return this._data.operating_hours; }
  get address() { return this._data.address; }
  get neighborhood() { return this._data.neighborhood; }
  get cuisine() { return this._data.cuisine_type; }
  get isFavorite() {
    return this._data.is_favorite === true || this._data.is_favorite === 'true';
  }

  get url() { return `./restaurant.html?id=${this.id}`; }
  get imageAltText() {
    if ('photograph_alt' in this._data)
      return this._data.photograph_alt;
    return `${this.name} Restaurant`;
  }
  imageUrl(width=800, format='jpg') {
    if (!this._data.photograph)
      return `/img/placeholder-${width}.png`;
    return (`/img/${this._data.photograph}-${width}.${format}`);
  }

  get cardNode() {
    if (!this._cardNode) this._cardNode = this.makeCardNode();
    return this._cardNode;
  }

  makeCardNode() {
    const li = document.createElement('li');

    li.id = `restaurant-card-${this._data.id}`;
    li.classList.add('card');

    const favoriteButton = this._makeFavoriteButton();
    li.appendChild(favoriteButton);

    const picture = document.createElement('picture');
    li.appendChild(picture);
    this._fillPicture(picture, [
      '(min-width: 1300px) 33vw',
      '(min-width: 768px) 50vw',
      '100vw'
    ]);

    const name = document.createElement('h2');
    li.appendChild(name);

    const neighborhood = document.createElement('p');
    neighborhood.classList.add('restaurant-neighborhood');
    li.appendChild(neighborhood);

    const address = document.createElement('p');
    address.classList.add('restaurant-address');
    li.appendChild(address);

    li.appendChild(this._makeButtons());

    // #yayclosures
    this.updateCardNode = data => {
      if (data) this._data = data;

      name.innerHTML = this.name;
      neighborhood.innerHTML = this.neighborhood;
      address.innerHTML = this.address;
      if (this.isFavorite)
        favoriteButton.setAttribute('checked', 'checked');
      else
        favoriteButton.removeAttribute('checked');
    };

    this.updateCardNode();

    return li;
  }

  _makeFavoriteButton() {
    const fav = document.createElement('input');
    fav.type = 'checkbox';
    fav.classList.add('icon-button', 'favorite');
    fav.setAttribute('aria-label', `Favorite ${this.name}`);
    fav.addEventListener('change', () => {
      // this checkbox has no ID but we still have right when we need it
      // #yayclosures ☺ ☺ ☺
      this._data.is_favorite = fav.checked;
      this._setFavorite({id: this.id, is_favorite: fav.checked});
    });
    return fav;
  }

  _makeButtons() {
    const container = document.createElement('div');
    //container.appendChild(this._makeButtonReviews());
    container.appendChild(this._makeButtonDetails());
    return container;
  }

  _makeButtonReviews() {
    const reviews = document.createElement('a');
    reviews.classList.add('brand-button');
    reviews.innerHTML = 'Reviews';
    reviews.setAttribute('aria-label', `${this.name} reviews`);
    reviews.href = `${this.url}#reviews`;
    return reviews;
  }

  _makeButtonDetails() {
    const more = document.createElement('a');
    more.classList.add('brand-button');
    more.innerHTML = 'View Details';
    more.setAttribute('aria-label', `${this.name} details`);
    more.href = this.url;
    return more;
  }

  _fillPicture(picture, sourceSizes) {
    sourceSizes = sourceSizes.join(', ');
    const sourceWidths = [400, 800];
    const sourceSet = format => sourceWidths.map(
      width => `${this.imageUrl(width, format)} ${width}w`
    ).join(', ');

    const webpSource = document.createElement('source');
    webpSource.sizes = sourceSizes;
    webpSource.srcset = sourceSet('webp');
    webpSource.type = 'image/webp';
    picture.appendChild(webpSource);

    const jpegSource = document.createElement('source');
    jpegSource.sizes = sourceSizes;
    jpegSource.srcset = sourceSet('jpg');
    picture.appendChild(jpegSource);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.sizes = sourceSizes;
    image.src = this.imageUrl();
    image.alt = this.imageAltText;

    picture.appendChild(image);
  }

  fillDetailsHTML({name, favorite, cuisine, address, picture, hoursTable}) {
    name.innerHTML = this.name;
    cuisine.innerHTML = this.cuisine;
    address.innerHTML = this.address;
    if (this.isFavorite)
      favorite.setAttribute('checked', 'checked');
    else
      favorite.removeAttribute('checked');
    favorite.addEventListener('change', () => {
      // this checkbox has no ID but we still have right when we need it
      // #yayclosures ☺ ☺ ☺
      this._data.is_favorite = favorite.checked;
      this._setFavorite({id: this.id, is_favorite: favorite.checked});
    });
    favorite.setAttribute('aria-label', `Favorite ${this.name}`);
    this._fillPicture(picture, [
      '(min-width: 1024px) 492px',
      '(min-width: 768px) 50vw',
      '100vw'
    ]);
    this._fillHoursTable(hoursTable);
  }

  _fillHoursTable(hoursTable) {
    hoursTable.innerHTML = '';
    if (!this.hours) return;
    for (let key in this.hours) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = this.hours[key];
      row.appendChild(time);

      hoursTable.appendChild(row);
    }
  }

  get mapMarker() {
    if (!this._mapMarker) {
      this._mapMarker = new L.marker( /* eslint no-undef: 0 */
        [this._data.latlng.lat, this._data.latlng.lng], {
          title: this.name,
          alt: this.name,
          url: this.url
        }
      );
      this._mapMarker.on('click', () => {
        window.location.href = this._mapMarker.options.url;
      });
    }
    return this._mapMarker;
  }

  get mapCoords() {
    return [
      this._data.latlng.lat,
      this._data.latlng.lng
    ];
  }
}
