# Restaurant Reviews
## Udacity MWS Nanodegree Project

## Project Overview

This project was submitted as coursework for the [Udacity][Udacity] [MWS
Nanodegree][Udacity-MWS]. Students were provided with the initial restaurant
reviews website, which can be found [upstream][Upstream] of this repository. The
initial website did not have a responsive design or standard accessibility
features, and in fact did not even function well on a desktop display. The task
of students was to fix these problems, and moreover to convert the static site
into a [progressive web app][PWA] (PWA) by implementing offline first
functionality.

In completing this project I implemented the following design and accessibility
features:

* a mobile first redesign with major layout breakpoints targeting phones,
  tablets and larger devices,
* appropriate tab and focus control to support keyboard and screen reader users,
* appropriate [ARIA][MDN-ARIA] labels and semantic page to support screen reader
  use.

To convert the static website to a progressive website I performed the
following general steps:

* created site icons in various resolutions,
* created a [web app manifest][WebAppManifest] to enable mobile browsers to
  identify the site as a PWA,
* cached the HTML skeleton, CSS, JS, icons and other resources offline using a
  [service worker][MDN-ServiceWorker] and the [Cache API][MDN-Cache],

I also ensured that the database based functionality worked offline first:

* cached JSON responses from the database server using
  [IndexedDB][MDN-IndexedDB],
* responded to database queries using the local cache _first_ to ensure fast
  responses with no connection or a poor connection
* queried the remote server in the background to replace stale data as soon as
  possible,
* allowed the user to mark favorites and submit, edit and delete reviews
  offline,
* synced user favorites and reviews with the server as soon as possible,
* notified the user with an appropriate (ARIA-friendly) banner when working in
  offline mode.

## Setup Instructions

### Quick Version

```
yarn install
yarn start
```
It is also necessary to start the [database server][DBServer]. If [`yarn`][yarn]
is unavailable, `npm` may be used instead
```
npm install
npm start
```

### Details

Dependencies are stored in `package.json` and can be installed with
[`yarn`][yarn]
```
yarn install
```

The site build process is automated with [`gulp`][gulp] and runs automatically
as a postinstall task after installation. To build manually run
```
gulp build
```

After building, the site can be served from `public/` using an appropriate
webserver. A simple [Express][Express] static webserver is provided for
convenience. To serve the site on `http://localhost:3000` run
```
yarn start
```
or
```
node server.js
```

If in production mode (i.e. `NODE_ENV=production`), then CSS and JS will be
minified. Otherwise, they will remain in cleartext and the development server
will be started automatically when the build is complete.

## Licenses and Third Party Content

### Software

* The map is provided using [leafletjs][LeafletJS] with [Mapbox][Mapbox].
* [IndexedDB][MDN-IndexedDB] is used via the promise based interface [IndexedDB
  Promised][IndexedDBPromised].

### Media

* SVG icons (modified for fill and color) from the [Feather][Feather] icon set
  (MIT license).
* The [app icon][AppIcon] and [placeholder image][PlaceholderImage] use the
  [Poiret One][Poiret] font (Open Font License).


[Repo]: https://github.com/thornecc/mws-restaurant
[DBServer]: https://github.com/thornecc/mws-restaurant-server
[Upstream]: https://github.com/udacity/mws-restaurant-stage-1
[gulp]: https://gulpjs.com/
[yarn]: https://yarnpkg.com/
[Express]: https://expressjs.com/
[LeafletJS]: https://leafletjs.com/
[Mapbox]: https://www.mapbox.com/
[IndexedDBPromised]: https://github.com/jakearchibald/idb
[Feather]: https://feathericons.com
[Poiret]: https://fonts.google.com/specimen/Poiret+One
[OFL]: https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL_web
[MDN-ServiceWorker]: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
[MDN-Cache]: https://developer.mozilla.org/en-US/docs/Web/API/Cache
[MDN-IndexedDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[MDN-ARIA]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
[PWA]: https://developers.google.com/web/progressive-web-apps/
[WebAppManifest]: https://developers.google.com/web/fundamentals/web-app-manifest/
[Udacity]: https://udacity.com/
[Udacity-MWS]: https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024
[AppIcon]: src/icon/app-512.png
[PlaceholderImage]: src/img/placeholder.png
