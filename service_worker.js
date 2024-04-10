const VERSION = 'v1';
const HOST = location.protocol+'//'+location.host
const FILECACHE = [
    HOST+'/',
    HOST+'/manifest.json',
    HOST+'/index.html',
    HOST+'/details.html',
    HOST+'/offline/game.html',
    HOST+'/offline/offline.html',
    HOST+'/offline/details.html',
    HOST+'/js/app.js',
    HOST+'/js/details.js',
    HOST+'/js/game.js',
    HOST+'/css/game.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    console.log("Version :", VERSION);

    (async () =>{
        const cache = await caches.open(VERSION);

        await Promise.all(
            FILECACHE.map(
                (path) => { return cache.add(path) }
            )
          )
    })()
});

self.addEventListener('activate', (e) =>{
    e.waitUntil(
        (async () =>{
            //on recup toutes les clés du cache
            const keys = await caches.keys();

            await Promise.all(
                keys.map((k) => {
                    if(!k.includes(VERSION)) return caches.delete(k);
                })
            )
        })()
    )
});


self.addEventListener("fetch", (e) => {
    // console.log("Fetch :", e.request.url);
    // console.log("Fetch :", e.request.mode);

    // const apiUrl = 'http://api.tvmaze.com/search/shows';

    // // verifier si la requete est une recherche dans l'api
    // //  mettre le json de la réponse dans le cache
    // if (e.request.url.startsWith(apiUrl)) {
    //     e.respondWith(
    //         fetch(e.request)
    //         .then(response => {
    //             const responseClone = response.clone();
    //             caches.open(VERSION).then(cache => {
    //                 cache.put(e.request, responseClone);
    //             });
    //             return response;
    //         })
    //         .catch(() => {
    //             return caches.match(e.request);
    //         })
    //     );
    //     return;
    // }

    console.log("Fetch :", e.request.url);
    console.log("Fetch :", e.request.mode);

    const apiUrl = 'http://api.tvmaze.com';

    // vérifier si la requête est une recherche dans l'api
    // mettre le json de la réponse dans le cache
    if (e.request.url.startsWith(apiUrl)) {
        e.respondWith(
            fetch(e.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(VERSION).then(cache => {
                    cache.put(e.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(e.request);
            })
        );
        return;
    }

    // Intercepter les requêtes vers les détails des films et les servir à partir du cache
    if (e.request.url.startsWith(`${apiUrl}/shows/`)) {
        e.respondWith(
            caches.match(e.request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(e.request).then(response => {
                    const responseClone = response.clone();
                    caches.open(VERSION).then(cache => {
                        cache.put(e.request, responseClone);
                    });
                    return response;
                }).catch(() => {
                    return caches.match('/offline/details.html');
                });
            })
        );
        return;
    }

    if (e.request.mode === "navigate"  && !e.request.url.endsWith('game.html') && !e.request.url.includes('details')) {
        e.respondWith(
            (async () => {
                try {
                    // Charger la page demandée depuis la mémoire
                    const preloadedResponse = await e.preloadResponse;
                    // Trouver la page dans le cache et la renvoyer si disponible
                    if (preloadedResponse) return preloadedResponse;

                    return await fetch(e.request.url);
                } catch (error) {
                    // En cas d'erreur, renvoyer la page hors ligne
                    const cache = await caches.open(VERSION);
                    return await cache.match("/offline/offline.html");
                }
            })()
        );
    } else if (FILECACHE.includes(e.request.url)) {
        // Répondre aux chargements de fichiers depuis le cache
        e.respondWith(caches.match(e.request));
    }


    if (e.request.url.endsWith('game.html')) {
        e.respondWith(caches.match(`/offline/game.html`));
    }

    if (e.request.url.includes('details')) {
        const urlParams = new URLSearchParams(window.location.search);
        const filmId = urlParams.get('id') 
        e.respondWith(caches.match(`/offline/details.html?id=${filmId}`));
    }

});

