const unique = ls => ls.filter((v, i) => ls.indexOf(v) == i);
const filterOnProp = (prop, key) => ls => ls.filter(x => x[prop] === key);
const extractProp = prop => ls => unique(ls.map(x => x[prop]));

const applyToPendingStores = async f => {
  const pendingStoreNames = ['pendingReviews', 'pendingFavorites', 'pendingDeletions'];
  return await Promise.all(pendingStoreNames.map(f));
};

/**
 * A wrapper for the restaurant JSON database.
 *
 * A local database is used to respond to queries. This database is kept in
 * sync, as much as possible, with the remote database.
 */
export default class DBHelper {
  constructor({
    host='localhost',
    port=1338,
    name='restaurant-reviews',
    pendingCallback
  } = {}) {
    this._host = host;
    this._port = port;
    this._name = name;
    this._pendingCallback = pendingCallback;
    if (!('serviceWorker' in navigator)) {
      this._dbPromise = null;
      return;
    }
    this._dbPromise = idb.open(name, 4, upgradeDB => { /* eslint no-undef: 0 */
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
          upgradeDB.createObjectStore('reviews', { keyPath: 'id' }).
            createIndex('by-restaurant', 'restaurant_id');
        case 1: /* eslint no-fallthrough: 0 */
          upgradeDB.createObjectStore('pendingFavorites', { keyPath: 'id' });
        case 2: /* eslint no-fallthrough: 0 */
          upgradeDB.createObjectStore('pendingReviews', { keyPath: 'restaurant_id' });
        case 3: /* eslint no-fallthrough: 0 */
          upgradeDB.createObjectStore('pendingDeletions', { keyPath: 'id' });
      }
    });
    if (this._pendingCallback)
      this._isPending().then(pending => void this._pendingCallback({pending}));
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
    return `http://localhost:1338/restaurants/${id}`;
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
   * Main fetch method. Pulls data from database for speed/offline first and
   * then goes to network to check for updates.
   *
   * The callback will be called twice: once on the local data and then again on
   * the network response (if it succeeds).
   *
   * The return value is a promise which resolves to the local response, or the
   * network response if no local response exists.
   *
   * After a successful network fetch, at attempt is made to reconcile any
   * pending local transactions. This serves two purposes:
   *  - syncing with remote server as soon as network is available
   *  - ensuring pending changes are preserved in the local database and are not
   *    overwritten by stale data from the network
   * This reconciliation is performed before the second callback, to ensure that
   * the final UI update uses the authoritative state.
   */
  async fetch({storeName, restaurant_id, id, callback}) {
    let queryUrl = `${this.origin}/${storeName}/`;
    let localResult;
    if (id) {
      queryUrl += id;
    } else if (restaurant_id) {
      id = restaurant_id;
      queryUrl += `?restaurant_id=${restaurant_id}`;
      storeName = 'by-restaurant';
      // get locally stored (pending) reviews
      const {tx, store} = await this.open({storeName: 'pendingReviews'});
      localResult = await store.get(id);
      await tx.complete;
    }
    const result = await this.get({storeName, id});
    if (localResult)
      result.push(localResult);

    if (callback)
      callback(result);

    const networkResult = fetch(queryUrl).then(async response => {
      if (response.status === 200) {
        this.put({
          storeName,
          records: await response.json()
        });
        await this._tryPending();
        const result = await this.get({storeName, id});
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
    if (!restaurant_id) return [];
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

  async deleteReview({id, restaurant_id}) {
    // if the review has an ID then it's already on the server
    // if not, it's local only. in this case, deletion is simple
    if (!id) {
      if (!restaurant_id) return;
      const {tx, store} = await this.open({storeName: 'pendingReviews', write: true});
      store.delete(restaurant_id);
      return tx.complete;
    } else {
      localStorage.removeItem(`user-owns-review-${id}`);
      const alreadyPending = await this._isPending();
      const {tx, store} = await this.open({storeName: 'reviews', write: true});
      store.delete(id);
      await tx.complete;
      if (! await this._deleteReviewNetworkFetch(id)) {
        const {tx, store} = await this.open({storeName: 'pendingDeletions', write: true});
        store.put({id, type: 'review'});
        if (this._pendingCallback && !alreadyPending)
          this._pendingCallback({pending: true});
        await tx.complete;
      }
    }
  }

  async _deleteReviewNetworkFetch(id) {
    const method = 'DELETE';
    const url = `${this.origin}/reviews/${id}`;
    try {
      const response = await fetch(url, {method});
      if (response.status === 200)
        return true;
    } catch (err) {
      console.log('Fetch failed:', err);
    }
    return false;
  }

  async _applyPendingNetworkDeletions() {
    const {store} = await this.open({storeName: 'pendingDeletions'});
    const pendingDeletions = await store.getAll();
    const result = (await Promise.all(pendingDeletions.map(
      ({id}) => this._deleteReviewNetworkFetch(id)
    ))).every(x => x);
    return result;
  }

  async saveReview({review, callback}) {
    await this._tryPending();
    const response = await this._saveReviewNetworkFetch(review);

    if (response) {
      localStorage.setItem(`user-owns-review-${response.id}`, true);
      this.put({storeName: 'reviews', records: response});
      callback(response);
    } else {
      const alreadyPending = await this._isPending();
      const {tx, store} = await this.open({storeName: 'pendingReviews', write: true});
      store.put(review);
      if (this._pendingCallback && !alreadyPending) {
        this._pendingCallback({pending: true});
      }
      callback(review);
      await tx.complete;
    }

    return response;
  }

  async _saveReviewNetworkFetch({id, restaurant_id, name, rating, comments}) {
    let method = id ? 'PUT' : 'POST';
    const okCode = id ? 200 : 201;
    let url = `${this.origin}/reviews`;
    const body = { name, rating, comments };
    if (id) {
      url += `/${id}`;
    } else {
      body.restaurant_id = restaurant_id;
    }
    try {
      const response = await fetch(url, {method, body: JSON.stringify(body)});
      if (response.status === okCode) {
        return await response.json();
      }
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  async setFavorite({id, is_favorite}) {
    // we do not use our network wrapping functions here:
    // unlike reviews, we cannot PUT restaurants and so the network database
    // cannot be generically kept in sync with the local database
    //
    // instead we make changes directly to the IDB store while also queueing a
    // fetch to update the favorite status on the server
    const {tx, store} = await this.open({storeName: 'restaurants', write: true});
    const restaurant = await store.get(id);
    restaurant.is_favorite = is_favorite;
    store.put(restaurant);
    this._setFavoriteNetwork({id, is_favorite});
    return tx.complete;
  }

  async _setFavoriteNetwork({id, is_favorite}) {
    // Try to resolve pending transactions over the network (no need to worry
    // about latency ― the local database was already updated).
    await this._tryPending();

    // Now try to apply current transaction.
    const success = await this._setFavoriteNetworkFetch({id, is_favorite});

    // If remote save failed, we are probably offline so let's queue it for later.
    if (!success) {
      // 1. Check if there are already pending transactions: we need this to
      // decide whether to notify client via `this._pendingCallback`.
      const alreadyPending = await this._isPending();

      // 2. Open store and write transaction.
      const {tx, store} = await this.open({storeName: 'pendingFavorites', write: true});
      store.put({id, is_favorite});

      // 3. Notify client if necessary.
      if (this._pendingCallback && !alreadyPending) {
        this._pendingCallback({pending: true});
      }
      return await tx.complete;
    }
  }

  async _setFavoriteNetworkFetch({id, is_favorite}) {
    const url = `${this.origin}/restaurants/${id}/?is_favorite=${is_favorite}`;
    try {
      const response = await fetch(url, {method: 'PUT'});
      if (response.status !== 200)
        throw new Error(`Failed to set is_favorite=${is_favorite} for restaurant ${id} on remote server.`);
    } catch (err) {
      console.log('Error setting favorite over network:', err);
      return false;
    }
    return true;
  }

  async _applyPendingNetworkFavorites() {
    const {tx, store} = await this.open({storeName: 'pendingFavorites'});
    const networkPromises = [];
    const changes = [];
    store.iterateCursor(cursor => {
      if (!cursor) return;
      networkPromises.push(this._setFavoriteNetworkFetch(cursor.value));
      changes.push(cursor.value);
      cursor.continue();
    });
    await tx.complete;
    const success = (await Promise.all(networkPromises)).every(x => x === true);
    await this._applyPendingLocalFavorites(changes);
    return success;
  }

  async _applyPendingLocalFavorites(changes) {
    const {tx, store} = await this.open({
      storeName: 'restaurants', write: true
    });
    changes.forEach(async ({id, is_favorite}) => {
      const restaurant = await store.get(id);
      restaurant.is_favorite = is_favorite;
      store.put(restaurant);
    });
    return await tx.complete;
  }

  async _applyPendingNetworkReviews() {
    const {store} = await this.open({storeName: 'pendingReviews'});
    const pendingReviews = await store.getAll();
    const changes = await Promise.all(pendingReviews.map(
      this._saveReviewNetworkFetch.bind(this)
    ));
    const success = changes.every(x => x);
    await this._applyPendingLocalReviews(changes.filter(x => x));
    return success;
  }

  async _applyPendingLocalReviews(changes) {
    const {tx, store} = await this.open({storeName: 'reviews', write: true});
    changes.forEach(review => {
      store.put(review);
      localStorage.setItem(`user-owns-review-${review.id}`, true);
    });
    return tx.complete;
  }

  async _erasePending(storeName) {
    if (!storeName) {
      await applyToPendingStores(this._erasePending.bind(this));
      // now reset warning status ― user will be warned next time there is no
      // connection
      localStorage.removeItem('user_warned');
      return;
    }
    const {tx, store} = await this.open({storeName, write: true});
    store.clear();
    return await tx.complete;
  }

  async _tryPending() {
    if (!await this._isPending()) return;
    const success = (await Promise.all([
      this._applyPendingNetworkFavorites(),
      this._applyPendingNetworkReviews(),
      this._applyPendingNetworkDeletions()
    ])).every(x => x);
    if (success) {
      // if we successfully reconciled with network, wipe pending transactions
      // from IDB
      await this._erasePending();
      if (this._pendingCallback)
        this._pendingCallback({pending: false});
    }
  }

  async _isPending(storeName) {
    if (!storeName) {
      return (await applyToPendingStores(x => this._isPending(x))).
        some(x => x);
    }

    const {tx, store} = await this.open({storeName});
    let pending = (await store.count()) > 0;
    await tx.complete;
    return pending;
  }
}
