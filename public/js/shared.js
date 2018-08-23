(async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registration successful.');
    } catch (err) {
      console.log('Service worker registration failed.');
    }
  }
})();
