/* eslint no-undef: 0 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(
    () => void console.log('Service worker registration successful.')
  ).catch(err => void console.log('Service worker registration failed.', err));

  // we have a service worker, so let's also create the database
  window.dbPromise = idb.open('restaurants', 1, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
    }
  });
}
