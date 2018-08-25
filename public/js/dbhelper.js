/* eslint no-unused-vars: 0, no-undef: 0 */
/**
 * Return the unique values in a list.
 */
const unique = ls => ls.filter((v, i) => ls.indexOf(v) == i);

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static databaseUrl(id='') {
    return `http://localhost:1337/restaurants/${id}`;
  }

  /**
   * Fetch all restaurants, or a given restaurant (by its ID).
   */
  static async fetchRestaurants({id, updateCallback} = {}) {
    if (!('serviceWorker' in navigator)) {
      // no serviceworker, no caching. just fetch from the network
      return await fetch(DBHelper.databaseUrl(id));
    }
    // first search the database
    const db = await window.dbPromise;
    const tx = db.transaction('restaurants');
    const store = tx.objectStore('restaurants');

    if (!id) {
      const restaurants = await store.getAll();

      fetch(DBHelper.databaseUrl()).then(async response => {
        const networkData = await response.clone().json();
        const db = await window.dbPromise;
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        networkData.forEach(async restaurant => {
          store.put(restaurant);
        });
        updateCallback(await response.json());
      });
      return restaurants;
    }

    const restaurantID = parseInt(id);
    if (isNaN(restaurantID)) {
      console.error('Bad ID', id);
      return;
    }

    const restaurant = await store.get(restaurantID);
    console.log(restaurant);
    const networkPromise = fetch(DBHelper.databaseUrl(id)).
      then(async response => {
        const db = await window.dbPromise;
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        store.put(await response.clone().json());
        // if we hit a match in the cache, we should reload to ensure any
        // updated information is present
        if (restaurant && updateCallback)
          updateCallback(await response.clone().json());
        return await response.json();
      });
    return restaurant || await networkPromise;
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static async fetchRestaurantByCuisine(cuisine, updateCallback) {
    const restaurants = await DBHelper.fetchRestaurants({updateCallback});
    if (!restaurants)
      return null;
    return restaurants.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static async fetchRestaurantByNeighborhood(neighborhood, updateCallback)  {
    const restaurants = await DBHelper.fetchRestaurants({updateCallback});
    if (!restaurants)
      return null;
    return restaurants.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, updateCallback) {
    const filterRestaurants = restaurants => {
      let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      return results;
    };
    const restaurants = await DBHelper.fetchRestaurants({
      updateCallback: restaurants => updateCallback(filterRestaurants(restaurants))
    });
    if (!restaurants)
      return [];
    return filterRestaurants(restaurants);
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static async fetchNeighborhoods(updateCallback) {
    const getNeighborhoods = restaurants => {
      if (!restaurants)
        return [];
      return unique(restaurants.map(({neighborhood}) => neighborhood));
    };
    const restaurants = await DBHelper.fetchRestaurants({
      updateCallback: restaurants => updateCallback(getNeighborhoods(restaurants))
    });
    return getNeighborhoods(restaurants);
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static async fetchCuisines(updateCallback) {
    const getCuisines = restaurants => {
      if (!restaurants)
        return [];
      return unique(restaurants.map(({cuisine_type}) => cuisine_type));
    };
    const restaurants = await DBHelper.fetchRestaurants({
      updateCallback: restaurants => updateCallback(getCuisines(restaurants))
    });
    return getCuisines(restaurants);
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, width=800, format='jpg') {
    return (`/img/${restaurant.photograph}-${width}.${format}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    });
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  /**
   * Alt text for restaurant image
   */
  static restaurantImageAltText(restaurant) {
    if ('photograph_alt' in restaurant)
      return restaurant.photograph_alt;
    return restaurant.name;
  }
}

