import DBHelper from '/js/dbhelper.js';
import Restaurant from '/js/restaurant.js';
import Review from '/js/review.js';

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[[]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

export default class RestaurantInfoController {
  constructor(container) {
    this._container = container;
    this._db = new DBHelper();
    this._data = {
      reviews: []
    };
    this._data.id = parseInt(getParameterByName('id'));
    if (isNaN(this._data.id)) {
      console.error('No restaurant id in URL');
      return;
    }
    document.addEventListener('DOMContentLoaded', () => void this._init());
  }

  async _init() {
    this._data.restaurant = new Restaurant({
      data: await this._db.getRestaurant({
        id: this._data.id,
      }),
      favoriteCallback: args => this._db.setFavorite(args)
    });
    this._fillBreadcrumbHTML();
    this._fillRestaurantHTML();
    this._db.getReviewsForRestaurant({
      restaurant_id: this._data.restaurant.id,
      callback: this._fillReviewsHTML.bind(this)
    });
    this._initMap();
  }

  _fillRestaurantHTML() {
    this._data.restaurant.fillDetailsHTML({
      name: document.getElementById('restaurant-name'),
      cuisine: document.getElementById('restaurant-cuisine'),
      address: document.getElementById('restaurant-address'),
      picture: document.getElementById('restaurant-img'),
      hoursTable: document.getElementById('restaurant-hours'),
      favorite: document.getElementById('favorite')
    });
  }

  _fillBreadcrumbHTML() {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = this._data.restaurant.name;
    // aria-current="page" is optional, since this item is not a link, but we
    // include it in case we make it a link in future.
    li.setAttribute('aria-current', 'page');
    breadcrumb.appendChild(li);
  }

  _fillReviewsHTML(reviews) {
    if (!reviews || reviews.length === 0) {
      return;
    }
    const oldIDs = this._data.reviews.map(review => review.id);
    reviews = reviews.filter(review => !oldIDs.includes(review.id));
    const reviewsToInsert = reviews.map(data => new Review(data));
    this._data.reviews = this._data.reviews.concat(reviewsToInsert);

    const ul = document.getElementById('reviews-list');
    reviewsToInsert.forEach(review => {
      ul.appendChild(review.cardHTML);
    });
  }

  _initMap() {
    this._map = L.map('map', { /* eslint no-undef: 0 */
      center: this._data.restaurant.mapCoords,
      zoom: 16,
      scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', { /* eslint no-undef: 0 */
      mapboxToken: 'pk.eyJ1IjoidGhvcm5lY2MiLCJhIjoiY2prNGd4NjJtMDU2MTN3b3N6amhkOWlmZSJ9.w5foWJEe-aT0t1kPYvVEPg',
      maxZoom: 18,
      attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this._map);
    this._data.restaurant.mapMarker.addTo(this._map);
  }
}
