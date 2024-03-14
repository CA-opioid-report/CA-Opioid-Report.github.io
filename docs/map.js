 // Initialize the map on the "california-map" div
 var map = L.map('california-map', {
    center: [37.5, -119.5], // Center on California coordinates
    zoom: 6,
    minZoom: 6,
    maxZoom: 10
});

// Data from JSON
var overdoseRatesData = {};
var countyData = {};


// Fetch the JSON file with county data
fetch('county_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Populate overdoseRatesData and countyData objects with data from the JSON file
        data.forEach(item => {
            var countyKey = item.county;
            overdoseRatesData[countyKey] = item.rate_of_overdose;
            countyData[countyKey] = {
                median_household_income: parseFloat(item.median_household_income.replace(/,/g, '')),
                opioid_death_over_time: item.opioid_death_over_time,
                opioid_prescriptions: item.opioid_prescriptions,
                rate_of_overdose: item.rate_of_overdose
            };
        });
        loadGeoJsonLayer(); // Load the GeoJSON layer
    })
    .catch(error => {
        console.error('Failed to fetch county data:', error);
    });

// Function for hue gradient for counties
function getColor(variable, value) {
    var minVal = 0;
    var maxVal = Math.max(...Object.values(countyData).map(data => data[variable]));
    var startColor = [255, 255, 255];
    var endColor = [0, 51, 51];

    var factor = (value - minVal) / (maxVal - minVal);
    var color = startColor.map(function(startComponent, i) {
        return Math.round(startComponent + factor * (endColor[i] - startComponent));
    });
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

// Function to style each county
function style(feature) {
    var countyName = feature.properties.COUNTY_NAME;
    var selectedVariable = document.getElementById('dataSelector').value; // Get the current selected variable
    var value = countyData[countyName] ? countyData[countyName][selectedVariable] : 0; // Get the value for the selected variable
    return {
        fillColor: getColor(selectedVariable, value),
        weight: 2,
        opacity: 1,
        color: 'black',
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
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Function to reset highlight
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

// Function to process each feature
function onEachFeature(feature, layer) {

    layer.bindTooltip(feature.properties.COUNTY_NAME, {
        className: 'county-label'
    });

    if (feature.properties && feature.properties.COUNTY_NAME) {
        var countyName = feature.properties.COUNTY_NAME;
        var countyInfo = countyData[countyName];

        // Check if countyInfo exists to avoid error
        if (countyInfo) {
            var popupContent = '<h3>' + countyName + ' County</h3>';
            popupContent += '<table>';
            popupContent += '<tr><td>Overdose Rate (per 100,000 residents) : </td><td><strong>' + Math.round(countyInfo.rate_of_overdose) + '</strong></td></tr>';
            popupContent += '<tr><td>Opioids Prescribed (per resident):</td><td><strong>' + Math.round(countyInfo.opioid_prescriptions / 100) + '</strong></td></tr>';
            popupContent += '<tr><td>Median Household Income: </td><td><strong>' + '$' + countyInfo.median_household_income + '</strong></td></tr>';
            popupContent += '</table>';
            layer.bindPopup(popupContent);
        } else {
            // Handle the case where there is no data for the county
            layer.bindPopup('No data available for ' + countyName + ' County');
        }
    }

    layer.on({
        mouseover:function(e) {
            var layer = e.target;
            layer.openTooltip();
            layer.setStyle({
                weight:3,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        },
        mouseout: function(e) {
            var layer = e.target;
            layer.closeTooltip();
            geojsonLayer.resetStyle(layer);
        },
        
        click: function(e) {
            e.target.openPopup();
        }
    });
}

var geojsonLayer;

// Load GeoJSON for California counties
function loadGeoJsonLayer() {
    fetch('California_Counties.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            geojsonLayer = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
        .catch(error => {
            console.error('Failed to load GeoJSON data:', error);
        });
}

function searchAndHighlightCounty() {
    var searchText = document.getElementById('countySearch').value.trim().toLowerCase(); // Get the input text
    searchText = searchText.replace(/county/gi, '').trim(); // Remove the word "county" from the search text if present

    var foundLayer = null;

    geojsonLayer.eachLayer(function(layer) {
        // Remove "county" from the layer name
        var layerName = layer.feature.properties.COUNTY_NAME.replace(/county/gi, '').trim().toLowerCase();
        
        if (layerName === searchText || layerName.startsWith(searchText)) {
            foundLayer = layer; // Saving the layer that matches the search text
        }
    });

    if (foundLayer) {
        // Reset styles for any previously highlighted features
        resetAllHighlights();

        // Highlight the found layer
        foundLayer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        map.fitBounds(foundLayer.getBounds());
        foundLayer.fireEvent('click');

    } else {
        alert('County not found. Please check your spelling and try again.');
    }
}

document.getElementById('countySearch').addEventListener('keydown', function(e) {
    if (e.keyCode === 13) { // 13 is the Enter key's keycode
        searchAndHighlightCounty();
    }
});

function resetAllHighlights() {
    geojsonLayer.eachLayer(function(layer) {
        geojsonLayer.resetStyle(layer);
    });
}

document.getElementById('dataSelector').addEventListener('change', function(e) {
    var selectedVariable = e.target.value;
    geojsonLayer.setStyle(function(feature) {
        var countyName = feature.properties.COUNTY_NAME;
        var countyInfo = countyData[countyName];
        var value = countyInfo ? countyInfo[selectedVariable] : 0;
        return {
            fillColor: getColor(selectedVariable, value),
            weight: 2,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.7
        };
    });
});

document.getElementById('resetButton').addEventListener('click', resetMapView);
document.getElementById('searchButton').addEventListener('click', searchAndHighlightCounty);

function resetMapView() {
    map.closePopup();
    map.setView([37.5, -119.5], 6); // Reset the map view
    resetAllHighlights(); 
    document.getElementById('countySearch').value = '';
    geojsonLayer.eachLayer(function (layer) {
        layer.closeTooltip(); // Close the tooltip for this layer
        geojsonLayer.resetStyle(layer); // Reset the style to default
    });
}