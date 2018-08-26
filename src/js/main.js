/* eslint no-unused-vars: 0, no-undef: 0 */
import '/js/sw.js';
import DBHelper from '/js/dbhelper.js';
const db = new DBHelper();
window.db = db;

let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = async () => {
  self.neighborhoods = await db.getNeighborhoods({
    callback: fillNeighborhoodsHTML
  });
  return self.neighborhoods;
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  const currentValues = Array.from(select.children).map(option => option.innerHTML);

  neighborhoods.forEach(neighborhood => {
    if (!currentValues.includes(neighborhood)) {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    }
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = async () => {
  self.cuisines = await db.getCuisines({
    callback: fillCuisinesHTML
  });
  return self.cuisines;
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  const currentValues = Array.from(select.children).map(option => option.innerHTML);

  cuisines.forEach(cuisine => {
    if (!currentValues.includes(cuisine)) {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    }
  });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = async () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  resetRestaurants();
  self.restaurants = await db.searchRestaurants({
    cuisine,
    neighborhood,
    callback: fillRestaurantsHTML
  });
  return self.restaurants;
};
self.updateRestaurants = updateRestaurants;

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = () => {
  // Remove all restaurants
  self.restaurants = [];

  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
};

/**
 * Add the given restaurants to the HTML. Restaurant cards are labelled by a
 * unique ID `restaurant-card-${id}` to ensure no duplicates are added.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  console.log('received restaurant IDs:', restaurants.map(({id}) => id));
  const ul = document.getElementById('restaurants-list');
  const oldIDs = Array.from(ul.getElementsByTagName('li')).
    map(li => parseInt(li.id.replace('restaurant-card-', '')));
  console.log('existing restaurant IDs:', oldIDs);
  restaurants = restaurants.filter(({id}) => !oldIDs.includes(id));
  console.log('inserting restaurant IDs:', restaurants.map(({id}) => id));
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap(restaurants);
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
  const li = document.createElement('li');
  li.id = `restaurant-card-${restaurant.id}`;
  li.classList.add('card');

  const picture = createRestaurantPicture(restaurant);
  li.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.classList.add('restaurant-neighborhood');
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.classList.add('restaurant-address');
  li.append(address);

  const more = document.createElement('a');
  more.classList.add('brand-button');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', `${restaurant.name} details`);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Create restaurant picture + sources
 */
const createRestaurantPicture = (restaurant) => {
  const picture = document.createElement('picture');

  const sourceSizes = [
    '(min-width: 1300px) 33vw',
    '(min-width: 768px) 50vw',
    '100vw'
  ].join(', ');
  const sourceWidths = [400, 800];
  const sourceSet = format => sourceWidths.map(
    width => `${DBHelper.imageUrlForRestaurant(restaurant, width, format)} ${width}w`
  ).join(', ');

  const webpSource = document.createElement('source');
  webpSource.sizes = sourceSizes;
  webpSource.srcset = sourceSet('webp');
  webpSource.type = 'image/webp';
  picture.append(webpSource);

  const jpegSource = document.createElement('source');
  jpegSource.sizes = sourceSizes;
  jpegSource.srcset = sourceSet('jpg');
  picture.append(jpegSource);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.sizes = sourceSizes;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = DBHelper.imageAltTextForRestaurant(restaurant);
  picture.append(image);

  return picture;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

};

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  try {
    self.newMap = L.map('map', {
      center: [40.722216, -73.987501],
      zoom: 12,
      scrollWheelZoom: false
    });
  } catch (err) { // leaflet not loaded for some reason?
    console.log('Error loading map.');
  }

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoidGhvcm5lY2MiLCJhIjoiY2prNGd4NjJtMDU2MTN3b3N6amhkOWlmZSJ9.w5foWJEe-aT0t1kPYvVEPg',
    maxZoom: 18,
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(self.newMap);

  updateRestaurants();
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', async event => {
  await Promise.all([
    fetchNeighborhoods(),
    fetchCuisines()
  ]);
  initMap(); // added
});

