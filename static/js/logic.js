var earthquakeFeed = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var tectonicFeed = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(earthquakeFeed, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  console.log(earthquakeData);
  var earthquake = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng,
        {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: 0.5,
          stroke: true,
          color: "black",
          weight: .5
      });
    }
  });

  createMap(earthquake)
}

function createMap(earthquake) {

  var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite-streets",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Grayscale": grayMap,
    "Satellite": satelliteMap,
    "Outdoors": outdoorsMap
  };

  var tectonic = new L.LayerGroup();

  var overlayMaps = {
    "Earthquakes": earthquake,
    "Tectonics": tectonic
  };

  var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 2.5,
    layers: [satelliteMap, earthquake, tectonic]
  });

  d3.json(tectonicFeed, function(Data) {
    L.geoJSON(Data, {
      color: "blue",
      weight: 2
    })
    .addTo(tectonic);
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(map);

  var legend = L.control({position: "bottomright"});

  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += 'i style="background:' + getColor(grades[i] + 1) + '"></i>' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };

  legend.addTo(map);
}

function getRadius(radius) {
  return radius * 40000
}

function getColor(magnitude) {
  switch(true) {
    case(magnitude) > 5:
      return "red";
    case(magnitude) > 4:
      return "darkorange";
    case(magnitude) > 3:
      return "tan";
    case(magnitude) > 2:
      return "yellow";
    case(magnitude) > 1:
      return "darkgreen";
    default:
      return "lightgreen";
  }
}
