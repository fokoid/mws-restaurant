const unique = ls => ls.filter((v, i) => ls.indexOf(v) == i);
const filterOnProp = (prop, key) => ls => ls.filter(x => x[prop] === key);
const extractProp = prop => ls => unique(ls.map(x => x[prop]));

/**
 * A wrapper for the restaurant JSON database.
 *
 * A local database is used to respond to queries. This database is kept in
 * sync, as much as possible, with the remote database.
 */
export default class DBHelper {
  constructor({host='localhost', port=1337, name='restaurant-reviews'} = {}) {
    this._host = host;
    this._port = port;
    this._name = name;
    if (!('serviceWorker' in navigator)) {
      this._dbPromise = null;
      return;
    }
    this._dbPromise = idb.open(name, 1, upgradeDB => { /* eslint no-undef: 0 */
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
          upgradeDB.createObjectStore('reviews', { keyPath: 'id' }).
            createIndex('by-restaurant', 'restaurant_id');
      }
    });
  }

  get name() { return this._name; }
  get host() { return this._host; }
  get port() { return this._port; }
  get protocol() {
    if (this.host === 'localhost' || this.host === '127.0.0.1')
      return 'http';
    return 'https';
  }
  get origin() {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  queryUrl({id=''} = {}) {
    return `http://localhost:1337/restaurants/${id}`;
  }

  networkFetch({id=''} = {}) {
    return fetch(this.queryUrl({id}));
  }

  /**
   * ============ Generic database methods =============
   */
  async open({storeName, write=false} = {}) {
    if (!storeName)
      return {};
    const db = await this._dbPromise;
    const mode = write ? 'readwrite' : 'readonly';
    let index;
    if (storeName === 'by-restaurant') {
      index = true;
      storeName = 'reviews';
    }
    const tx = db.transaction(storeName, mode);
    let store = tx.objectStore(storeName);
    if (index)
      store = store.index('by-restaurant');
    return {db, tx, store};
  }

  async get({storeName, id} = {}) {
    const {store} = await this.open({storeName});
    if (id) {
      if (storeName === 'by-restaurant') {
        return await store.getAll(id);
      }
      return await store.get(id);
    }
    return await store.getAll();
  }

  async put({storeName, records}) {
    if (!Array.isArray(records)) records = [records];
    if (storeName === 'by-restaurant') storeName = 'reviews';
    const {tx, store} = await this.open({storeName, write: true});
    records.forEach(record => store.put(record));
    return await tx.complete;
  }

  /**
   * Main fetch methods.
   */
  async fetch({storeName, restaurant_id, id, callback}) {
    let queryUrl = `${this.origin}/${storeName}/`;
    if (id) {
      queryUrl += id;
    } else if (restaurant_id) {
      id = restaurant_id;
      queryUrl += `?restaurant_id=${restaurant_id}`;
      storeName = 'by-restaurant';
    }
    const result = await this.get({storeName, id});
    if (callback)
      callback(result);

    const networkResult = fetch(queryUrl).then(async response => {
      if (response.status === 200) {
        this.put({
          storeName,
          records: await response.clone().json()
        });
        const result = await response.json();
        if (callback)
          callback(result);
        return result;
      }
    }).catch(err => {
      console.log(`Fetch for ${queryUrl} failed:`, err);
    });
    return result || await networkResult;
  }

  getReview({id, callback}) {
    return this.fetch({storeName: 'reviews', id, callback});
  }

  getReviewsForRestaurant({restaurant_id, callback}) {
    return this.fetch({storeName: 'reviews', restaurant_id, callback});
  }

  getReviews({callback} = {}) {
    return this.fetch({storeName: 'reviews', callback});
  }

  getRestaurant({id, callback}) {
    return this.fetch({storeName: 'restaurants', id, callback});
  }

  getRestaurants({callback} = {}) {
    return this.fetch({storeName: 'restaurants', callback});
  }

  async searchRestaurants({cuisine, neighborhood, callback}) {
    const filterByCuisine = filterOnProp('cuisine_type', cuisine);
    const filterByNeighborhood = filterOnProp('neighborhood', neighborhood);
    const search = restaurants => {
      let results = restaurants;
      if (cuisine && cuisine != 'all')
        results = filterByCuisine(results);
      if (neighborhood && neighborhood != 'all')
        results = filterByNeighborhood(results);
      return results;
    };
    const restaurants = await this.getRestaurants({
      callback: callback && (ls => callback(search(ls)))
    });
    return search(restaurants);
  }

  async getPropertyValues({property, callback}) {
    const restaurants = await this.getRestaurants({
      callback: callback && (ls => callback(extractProp(property)(ls)))
    });
    return extractProp(property)(restaurants);
  }

  getNeighborhoods({callback} = {}) {
    return this.getPropertyValues({property: 'neighborhood', callback});
  }

  getCuisines({callback} = {}) {
    return this.getPropertyValues({property: 'cuisine_type', callback});
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
   * Alt text for restaurant image
   */
  static imageAltTextForRestaurant(restaurant) {
    if ('photograph_alt' in restaurant)
      return restaurant.photograph_alt;
    return restaurant.name;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      title: restaurant.name,
      alt: restaurant.name,
      url: this.urlForRestaurant(restaurant)
    });
    marker.addTo(newMap);
    return marker;
  }

}
