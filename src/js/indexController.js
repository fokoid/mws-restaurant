import DBHelper from '/js/dbhelper.js';
import Restaurant from '/js/restaurant.js';

export default class IndexController {
  constructor(container) {
    this._container = container;
    this._db = new DBHelper();
    this._data = {
      restaurants: []
    };
    document.addEventListener('DOMContentLoaded', () => void this._init());
  }

  async _init() {
    await Promise.all([
      this._db.getNeighborhoods({
        callback: this._fillNeighborhoodsHTML.bind(this)
      }),
      this._db.getCuisines({
        callback: this._fillCuisinesHTML.bind(this)
      })
    ]);
    this._initMap();
    this._updateRestaurants();
  }

  _fillNeighborhoodsHTML(neighborhoods) {
    if (!neighborhoods) return;
    this._data.neighborhoods = neighborhoods;
    const select = document.getElementById('neighborhoods-select');
    select.onchange = () => this._updateRestaurants();
    const currentValues = Array.from(select.children).
      map(option => option.innerHTML);
    neighborhoods.forEach(neighborhood => {
      if (!currentValues.includes(neighborhood)) {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
      }
    });
  }

  _fillCuisinesHTML(cuisines) {
    if (!cuisines) return;
    this._data.cuisines = cuisines;
    const select = document.getElementById('cuisines-select');
    select.onchange = () => this._updateRestaurants();
    const currentValues = Array.from(select.children).
      map(option => option.innerHTML);
    cuisines.forEach(cuisine => {
      if (!currentValues.includes(cuisine)) {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
      }
    });
  }

  _clearRestaurants() {
    // clear restaurant cards and map markers
    this._data.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    if (this._data.markers) {
      this._data.markers.forEach(marker => marker.remove());
    }
    this._data.markers = [];
  }

  _updateRestaurants() {
    this._clearRestaurants();
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    return this._db.searchRestaurants({
      cuisine,
      neighborhood,
      callback: this._fillRestaurantsHTML.bind(this)
    });
  }

  _fillRestaurantsHTML(restaurants) {
    if (!restaurants || restaurants.length === 0) {
      return;
    }
    const oldIDs = this._data.restaurants.map(restaurant => restaurant.id);
    restaurants = restaurants.
      filter(restaurant => !oldIDs.includes(restaurant.id));
    const restaurantsToInsert = restaurants.map(data => new Restaurant(data));
    this._data.restaurants = this._data.restaurants.concat(restaurantsToInsert);

    const ul = document.getElementById('restaurants-list');
    restaurantsToInsert.forEach(restaurant => {
      ul.append(restaurant.cardHTML);
      restaurant.mapMarker.addTo(this._map);
      this._data.markers.push(restaurant.mapMarker);
    });
  }

  _initMap() {
    try {
      this._map = L.map('map', { /* eslint no-undef: 0 */
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
    } catch (err) { // leaflet not loaded for some reason?
      console.error('Error loading map.');
    }
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', { /* eslint no-undef: 0 */
      mapboxToken: 'pk.eyJ1IjoidGhvcm5lY2MiLCJhIjoiY2prNGd4NjJtMDU2MTN3b3N6amhkOWlmZSJ9.w5foWJEe-aT0t1kPYvVEPg',
      maxZoom: 18,
      attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this._map);
  }
}
