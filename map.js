 // Initialize the map on the "california-map" div
 var map = L.map('california-map', {
    center: [37.5, -119.5], // Centered on California
    zoom: 6,
    minZoom: 6,
    maxZoom: 10
});

// Base layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to style each county
function style(feature) {
    return {
        fillColor: 'white', // Default fill color
        weight: 2,
        opacity: 1,
        color: 'blue', // Border color
        fillOpacity: 0.7
    };
}

// Function to highlight feature on hover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
}

// Function to reset highlight
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

// Function to process each feature
function onEachFeature(feature, layer) {
    // Check if the feature has a property named 'COUNTY_NAME'
    if (feature.properties && feature.properties.COUNTY_NAME) {
        layer.bindTooltip(feature.properties.COUNTY_NAME, {
            permanent: false, // Set to false to show on hover
            direction: 'auto' // 'auto' positions tooltip where it best fits on the screen
        });
    }

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

var geojsonLayer;

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

// Load GeoJSON for California counties
fetch('California_Counties.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJson(data, { style: style, onEachFeature: onEachFeature}).addTo(map);
    });