const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const VERSION = 'v1';

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    //Vérifier que l utilisateur a bien entré une chaine de caractère
    if (searchTerm !== '') {
        searchFilms(searchTerm);
    }
});

// function searchFilms(query) {
//     fetch(`http://api.tvmaze.com/search/shows?q=${query}`)
//     .then(response => {
//         // Clone de la réponse pour la mettre en cache
//         const responseClone = response.clone();
//         caches.open(VERSION).then(cache => {
//             cache.put(`http://api.tvmaze.com/search/shows?q=${query}`, responseClone);
//         });
//         return response.json();
//     })
//     .then(data => {
//         displayResults(data);
//         saveSearch(query);
//     })
//     .catch(() => {
//         resultsDiv.innerHTML = '';

//         const resultDiv = document.createElement('div');
//         resultDiv.innerHTML = `
//                 <h2>Vous n avez pas fais cette recherche auparavant</h2>
//             `;
//         resultsDiv.appendChild(resultDiv);
//     });
// }


function searchFilms(query) {
    fetch(`http://api.tvmaze.com/search/shows?q=${query}`)
    .then(response => {
        // Clone de la réponse pour la mettre en cache
        const responseClone = response.clone();
        caches.open(VERSION).then(cache => {
            cache.put(`http://api.tvmaze.com/search/shows?q=${query}`, responseClone);
        });
        return response.json();
    })
    .then(data => {
        displayResults(data);
        saveSearch(query);
        
        // Mettre en cache les détails des films
        data.forEach(result => {
            const { show } = result;
            caches.open(VERSION).then(cache => {
                cache.put(`http://api.tvmaze.com/shows/${show.id}`, new Response(JSON.stringify(show)));
            });
        });
    })
    .catch(() => {
        resultsDiv.innerHTML = '';

        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `
                <h2>Vous n avez pas fais cette recherche auparavant</h2>
            `;
        resultsDiv.appendChild(resultDiv);
    });
}


function displayResults(results) {
    resultsDiv.innerHTML = '';

        results.forEach(result => {
            const { show } = result;
            const resultDiv = document.createElement('div');
            resultDiv.innerHTML = `
                    <h2>${show.name}</h2>
                    <img src="${show.image? show.image.medium : ''}" alt="${show.name}">
                    <p'>${show.summary || 'Aucun synopsis disponible.'}</p>
                    <a href="details.html?id=${show.id}">Voir les détails</a>
            `;
            resultsDiv.appendChild(resultDiv);
        }); 
}

function saveSearch(query) {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    searches.unshift(query);
    localStorage.setItem('searches', JSON.stringify(searches));
}

