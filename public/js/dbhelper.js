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
  static async fetchRestaurants(id='') {
    try {
      const response = await fetch(DBHelper.databaseUrl(id));
      return await response.json();
    } catch (err) {
      console.log(`Request failed for restaurant ${id}.`, err);
      return null;
    }
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static async fetchRestaurantByCuisine(cuisine) {
    const restaurants = await DBHelper.fetchRestaurants();
    if (!restaurants)
      return null;
    return restaurants.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static async fetchRestaurantByNeighborhood(neighborhood) {
    const restaurants = await DBHelper.fetchRestaurants();
    if (!restaurants)
      return null;
    return restaurants.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    const restaurants = await DBHelper.fetchRestaurants();
    if (!restaurants)
      return null;
    let results = restaurants;
    if (cuisine != 'all') { // filter by cuisine
      results = results.filter(r => r.cuisine_type == cuisine);
    }
    if (neighborhood != 'all') { // filter by neighborhood
      results = results.filter(r => r.neighborhood == neighborhood);
    }
    return results;
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static async fetchNeighborhoods() {
    const restaurants = await DBHelper.fetchRestaurants();
    if (!restaurants)
      return null;
    return unique(restaurants.map(({neighborhood}) => neighborhood));
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static async fetchCuisines() {
    const restaurants = await DBHelper.fetchRestaurants();
    if (!restaurants)
      return null;
    return unique(restaurants.map(({cuisine_type}) => cuisine_type));
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

