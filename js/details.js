const detailsDiv = document.getElementById('details');

// Récupère l'ID du film depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const filmId = urlParams.get('id')

fetch(`http://api.tvmaze.com/shows/${filmId}`)
.then(response => response.json())
.then(data => displayDetails(data))
.catch(error => console.error('Erreur lors de la récupération des détails :', error));


function displayDetails(details) {
    detailsDiv.innerHTML = `
        <h2>${details.name}</h2>
        <img src="${details.image? details.image.medium : ''}" alt="${details.name}">
        <p>${details.summary || 'Aucun synopsis disponible.'}</p>
    `;
}