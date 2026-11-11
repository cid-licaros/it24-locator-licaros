

const map = L.map('map').setView([12.8797, 121.7740], 6);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const markerLayer = L.layerGroup().addTo(map);


const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');
const message = document.getElementById('message');


form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const city = input.value.trim();

    if (city.length < 2) {
        message.textContent = 'Please enter at least two characters.';
        return;
    }

   
    markerLayer.clearLayers();

    message.textContent = 'Searching for locations...';

    try {
        const url =
            'https://geocoding-api.open-meteo.com/v1/search?' +
            new URLSearchParams({
                name: city,
                count: '5',
                language: 'en',
                format: 'json',
                countryCode: 'PH'
            });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Request failed.');
        }

        const data = await response.json();
        const locations = data.results ?? [];

        if (locations.length === 0) {
            message.textContent =
                'No Philippine locations found. Try another city.';
            return;
        }

        const bounds = [];

      
        locations.slice(0, 5).forEach((place) => {
            const coords = [
                place.latitude,
                place.longitude
            ];

            bounds.push(coords);

            L.marker(coords)
                .addTo(markerLayer)
                .bindPopup(`
                    <strong>${place.name}</strong><br>
                    Country: ${place.country ?? 'Unknown'}
                `);
        });

  
        if (bounds.length === 1) {
            map.setView(bounds[0], 11);
        } else {
            map.fitBounds(bounds, {
                padding: [35, 35]
            });
        }

        message.textContent =
            `${bounds.length} location(s) found for "${city}".`;

    } catch (error) {
        console.error(error);

        message.textContent =
            'An error occurred. Please check your internet connection and try again.';
    }
});

