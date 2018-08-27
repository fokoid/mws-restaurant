import DBHelper from '/js/dbhelper.js';
import Restaurant from '/js/restaurant.js';
import getWarning from '/js/warning.js';

const unique = ls => ls.filter((v, i) => ls.indexOf(v) == i);
const extractProp = prop => ls => unique(ls.map(x => x[prop]));

export default class IndexController {
  constructor(container) {
    this._container = container;
    this._warningNode = getWarning();
    this._db = new DBHelper({
      pendingCallback: ({pending}) => {
        if (pending) {
          // state just changed to pending: let's notify the user
          this._warningNode.activate(document.activeElement);
        } else {
          // if not, make sure warning is hidden
          this._warningNode.deactivate(document.activeElement);
        }
      }
    });
    this._data = {
      restaurants: []
    };
    document.addEventListener('DOMContentLoaded', () => void this._init());
  }

  async _init() {
    document.getElementsByTagName('header')[0].appendChild(this._warningNode);
    this._warningNode.enableAnimation();
    this._db.getRestaurants({
      callback: restaurants => {
        this._data.restaurants = restaurants.map(data => new Restaurant({
          data, favoriteCallback: x => this._db.setFavorite(x)
        }));
        this._updateContent();
      }
    });
    this._initMap();
  }

  _updateContent() {
    document.getElementById('favorites-select').addEventListener(
      'change', () => void this._updateRestaurants()
    );
    this._fillNeighborhoodsHTML();
    this._fillCuisinesHTML();
    this._updateRestaurants();
  }

  _fillNeighborhoodsHTML() {
    this._data.neighborhoods = extractProp('neighborhood')(this._data.restaurants);

    const select = document.getElementById('neighborhoods-select');
    select.addEventListener('change', () => void this._updateRestaurants());
    const currentValues = Array.from(select.children).
      map(option => option.innerHTML);
    this._data.neighborhoods.forEach(neighborhood => {
      if (!currentValues.includes(neighborhood)) {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.appendChild(option);
      }
    });
  }

  _fillCuisinesHTML() {
    this._data.cuisines = extractProp('cuisine')(this._data.restaurants);

    const select = document.getElementById('cuisines-select');
    select.addEventListener('change', () => void this._updateRestaurants());
    const currentValues = Array.from(select.children).
      map(option => option.innerHTML);
    this._data.cuisines.forEach(cuisine => {
      if (!currentValues.includes(cuisine)) {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.appendChild(option);
      }
    });
  }

  _searchRestaurants({favorites, cuisine, neighborhood}) {
    let results = this._data.restaurants;
    if (favorites === true)
      results = results.filter(restaurant => restaurant.isFavorite);
    if (cuisine && cuisine != 'all')
      results = results.filter(restaurant => restaurant.cuisine === cuisine);
    if (neighborhood && neighborhood != 'all')
      results = results.filter(restaurant => restaurant.neighborhood === neighborhood);
    return results;
  }

  _clearRestaurants() {
    // clear restaurant cards and map markers
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    if (this._data.markers) {
      this._data.markers.forEach(marker => marker.remove());
    }
    this._data.markers = [];
  }

  _updateRestaurants() {
    this._clearRestaurants();
    const fSelect = document.getElementById('favorites-select');
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const favorites = fSelect.checked;
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    this._fillRestaurantsHTML(this._searchRestaurants({
      favorites, cuisine, neighborhood
    }));
  }

  _fillRestaurantsHTML(restaurants) {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.appendChild(restaurant.cardNode);
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
