export default class Restaurant {
  constructor(data) {
    this._data = data;
    this._fillHTML();
  }

  get id() { return this._data.id; }
  get name() { return this._data.name; }
  get hours() { return this._data.operating_hours; }
  get address() { return this._data.address; }
  get cuisine() { return this._data.cuisine_type; }

  get _url() { return `./restaurant.html?id=${this.id}`; }
  get _imageAltText() {
    if ('photograph_alt' in this._data)
      return this._data.photograph_alt;
    return this.name;
  }
  _imageUrl(width=800, format='jpg') {
    return (`/img/${this._data.photograph}-${width}.${format}`);
  }

  get cardHTML() { return this._card; }

  _fillHTML() {
    this._card = document.createElement('li');

    this._card.id = `restaurant-card-${this._data.id}`;
    this._card.classList.add('card');

    this._card.appendChild(this._makePicture([
      '(min-width: 1300px) 33vw',
      '(min-width: 768px) 50vw',
      '100vw'
    ]));
    this._card.appendChild(this._makeHeading());
    this._card.appendChild(this._makeNeighborhood());
    this._card.appendChild(this._makeAddress());
    this._card.appendChild(this._makeButtons());
  }

  _makeHeading() {
    const name = document.createElement('h2');
    name.innerHTML = this._data.name;
    return name;
  }

  _makeNeighborhood() {
    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = this._data.neighborhood;
    neighborhood.classList.add('restaurant-neighborhood');
    return neighborhood;
  }

  _makeAddress() {
    const address = document.createElement('p');
    address.innerHTML = this._data.address;
    address.classList.add('restaurant-address');
    return address;
  }

  _makeButtons() {
    const container = document.createElement('div');
    container.appendChild(this._makeButtonDetails());
    return container;
  }

  _makeButtonDetails() {
    const more = document.createElement('a');
    more.classList.add('brand-button');
    more.innerHTML = 'View Details';
    more.setAttribute('aria-label', `${this._data.name} details`);
    more.href = this._url;
    return more;
  }

  _makePicture(sourceSizes) {
    const picture = document.createElement('picture');
    this._fillPicture(picture, sourceSizes);
    return picture;
  }

  _fillPicture(picture, sourceSizes) {
    sourceSizes = sourceSizes.join(', ');
    const sourceWidths = [400, 800];
    const sourceSet = format => sourceWidths.map(
      width => `${this._imageUrl(width, format)} ${width}w`
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
    image.src = this._imageUrl();
    image.alt = this._imageAltText;
    picture.appendChild(image);
  }

  fillDetailsHTML({name, cuisine, address, picture, hoursTable}) {
    name.innerHTML = this.name;
    cuisine.innerHTML = this.cuisine;
    address.innerHTML = this.address;
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
    if (!this._mapMaker) {
      this._mapMarker = new L.marker( /* eslint no-undef: 0 */
        [this._data.latlng.lat, this._data.latlng.lng], {
          title: this.name,
          alt: this.name,
          url: this._url
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
