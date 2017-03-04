var model = { //All of my point of interests in New Zealand vacation spots.
  map: map,
  markers: [], //Array for my markers on the map.
  locationsData: [
    {
      title: "Wellington",
      location: {lat:  -41.28646, lng: 174.776236},
      visible: true
    },
    {
      title: "Queenstown",
      location: {lat: -45.031162, lng: 168.662644},
      visible: true
    },
    {
      title: "Milford Sound",
      location: {lat: -44.641402, lng: 167.89738},
      visible: true
    },
    {
      title: "Rotorua",
      location: {lat: -38.136848, lng: 176.249746},
      visible: true
    },
    {
      title: "Cathedral Cove",
      location: {lat:  -36.827535, lng: 175.790346},
      visible: true
    },
    {
      title: "Abel Tasman",
      location: {lat: -40.934685, lng: 172.972155},
      visible: true
    },
    {
      title: "Hobbiton",
      location: {lat: -37.87209, lng: 175.68291},
      visible: true
    },
    {
      title: "Waiheke Island",
      location: {lat: -36.801924, lng: 175.108015},
      visible: true
    },
    {
      title: "Mount Maunganui",
      location: {lat: -37.638654, lng: 176.183627},
      visible: true
    },
    {
      title: "Cape Palliser",
      location: {lat: -41.611904, lng: 175.290124},
      visible: true
    }
  ]
};

var viewModel = { //viewModel is the command center between model and view.
  init: function() {
    for (var i = 0; i < model.locationsData.length; i++) {
      viewModel.locations.push(model.locationsData[i]);
    }
    viewModel.currentQuery.subscribe(viewModel.search); //Invokes search.
    mapView.init();
  },
  currentQuery: ko.observable(''), //notifies list to update.
  locations: ko.observableArray([]),  //Creates an observableArray data-bound.
  createMarkers: function() {
    var defaultIcon = viewModel.makeMarkerIcon("0091ff"); //Default colot of the icon.
    var bounds = new google.maps.LatLngBounds(); //Let's us access the bounds f.
    var largeInfoWindow = new google.maps.InfoWindow(); //Creates an instance.
    for (var i = 0; i < model.locationsData.length; i++) {
      var position = model.locationsData[i].location; //LatLng coordinates.
      var title = model.locationsData[i].title; //Name of each location.
      var visible = model.locationsData[i].visible;
      var marker = new google.maps.Marker({ //New marker instance.
        map: model.map, //Sets the map to be used.
        position: position, //Sets the coordinates.
        title: title, //Sets the name.
        visible: visible, //Boolean to check if it should be visible.
        animation: google.maps.Animation.DROP, //Animates entrance of markers.
        icon: defaultIcon, //Sets the color of each icon.
        id: i //Sets the id of each marker correspoding the index of the markers.
      });

      model.markers.push(marker); //Pushes each marker to our markers array.
      bounds.extend(marker.position); //Extends the map to include all markers.
      viewModel.wikisearch(title); //adds wiki details on markers.
      marker.addListener("click", function() { //Sets click listner for markers.
      viewModel.populateInfoWindow(this, largeInfoWindow); //our infowindow.
      });
    }
    model.map.fitBounds(bounds); //GoolgeMap f that invokes the fitBounds.
  },
  search: function(value) {
    viewModel.locations.removeAll(); //Removes all items on locations.
    for (var i = 0; i < model.locationsData.length; i++) {
      if (model.locationsData[i].title.toLowerCase().indexOf(value.toLowerCase()) >=0) {
        viewModel.locations.push(model.locationsData[i]);
          model.markers[i].visible = true;
        } else {
          model.markers[i].visible = false;
        }
    }
    viewModel.setAllMap();
  },
  wikisearch: function(title) { //loads the data for wikipedia searches
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
    + title + '&format=json&callback=wikiCallback';

    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      success: function(response) {
        var titleDesc = response[2][0];
      }
    })
  },
  setAllMap: function () { //Hides Markers not part of the current search query
    for (var i = 0; i < model.markers.length; i++) {
      if (model.markers[i].visible === false) {
        model.markers[i].setMap(null);
      } else {
        model.markers[i].setMap(model.map);
      }
    }
  },
  //Customizes the look of your icon. Passes along the color. See defaultIcon.
  makeMarkerIcon: function (markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10,34),
      new google.maps.Size(21,34)
    )

    return markerImage;
  },
  //Encapsulates each marker with a unique info according to each location.
  populateInfoWindow: function (marker, infoWindow) {
    if (infoWindow.marker != marker) { //Checks if infoWindow is not open.
      infoWindow.marker = marker;
      infoWindow.setContent("<div>" + marker.title + "</div>"); //Sets name.
      infoWindow.open(model.map, marker); //Opens the marker.
      infoWindow.addListener("closeclick", function(){ //Listener to close info.
        infoWindow.setMarker(null); //Clears the content on infoWindow.
      })
    }
  }
};

var mapView = { //mapView
  init: function() {
    var originalCenter = model.locationsData[0].location;
    model.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -40.900557, lng: 174.885971}, // Centers at New Zealand.
      zoom: 8, //Default zoom.
      center: originalCenter //Centers to the first item on my locationsData
    })
    this.render();
  },

  render: function(){
    viewModel.createMarkers();
  }
};

ko.applyBindings(viewModel);
