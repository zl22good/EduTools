//
// CHM Data Viewer-related Javascript functions
//
// Load and view data files related to Clinched Highway Mapping (CHM)
// related academic data sets.
//
// Renamed as tmjsfuncs.js as part of the Travel Mapping project
//
// Author: Jim Teresco, Siena College, The College of Saint Rose
//
// Code developed based on examples from
// http://cmap.m-plex.com/tools/wptedit/wptedit.html
// http://www.alecjacobson.com/weblog/?p=1645
//
// Modification History:
//
// 2011-06-20 JDT  Initial implementation
// 2011-06-21 JDT  Added .gra support and checkbox for hidden marker display
// 2011-06-23 JDT  Added .nmp file support (near-miss points)
// 2011-08-23 JDT  Added .pth file support (path)
// 2011-08-31 JDT  Added tabular graph data display
// 2013-08-14 JDT  Completed conversion to Google Maps API V3
// 2013-08-15 JDT  Added custom icon for intersections
// 2013-12-08 JDT  Fixed to handle DOS-style CRLF in uploaded files
// 2013-12-25 JDT  Click on GRA, PTH point label in table recenters map
// 2014-11-17 JDT  Added .wpl file support (waypoint list)
// 2015-06-10 JDT  Adapted for reading from database entries using PHP
// 2015-06-14 JDT  Clinched segment support
// 2015-06-17 JDT  All highways in region support
// 2015-08-19 JDT  Fixed a few bugs with infowindows
// 2016-05-25 JDT  Consolidated some changes from copies of chmviewerfunc3.js
// 2016-06-27 JDT  Removed code not needed by TM
//

// global variable to hold the map, which will be assigned a google.maps.Map reference
var map;

// array of waypoints displayed
var waypoints = new Array();
// array of waypoint indices where route changes for region mapping
var newRouteIndices = new Array();
// tiers of each route included
var routeTier = new Array();
// color code for each route included
var routeColor = new Array();
// system for each route included
var routeSystem = new Array();
// the markers at those waypoints
var markers = new Array();
// the info displayed when markers are clicked
var markerinfo = new Array();
// array of google.maps.LatLng representing the waypoint coordinates
var polypoints = new Array();
// array of connections on map as google.maps.Polyline overlays
var connections = new Array();
// array of graph edges (for graph data, used by HDX, which imports this code)
var graphEdges = new Array();
// array of segments and clinched for "clinched by traveler" mapping
var segments = new Array();
var clinched = new Array();
// boolean to say if we're doing this
var mapClinched = false;
// traveler name for clinched
var traveler;
// boolean to determine if graph edges should be generated automatically
var genEdges = false;
// boolean to determine if graph edges are in vertex adjacency lists
var usingAdjacencyLists = false;
//boolean to determine pause value
var pause = false;


// array of objects that define color codes from names in the DB
var colorCodes = new Array();
colorCodes[0] = { name: "blue", unclinched: "rgb(100,100,255)", clinched: "rgb(0,0,255)" };
colorCodes[1] = { name: "brown", unclinched: "rgb(153,152,102)", clinched: "rgb(153,102,0)" };
colorCodes[2] = { name: "red", unclinched: "rgb(255,100,100)", clinched: "rgb(255,0,0)" };
colorCodes[3] = { name: "yellow", unclinched: "rgb(255,255,128)", clinched: "rgb(225,225,0)" };
colorCodes[4] = { name: "teal", unclinched: "rgb(100,200,200)", clinched: "rgb(0,200,200)" };
colorCodes[5] = { name: "green", unclinched: "rgb(100,255,100)", clinched: "rgb(0,255,0)" };
colorCodes[6] = { name: "magenta", unclinched: "rgb(255,100,255)", clinched: "rgb(255,0,255)" };

// array of custom color codes to be pulled from query string parameter "colors="
var customColorCodes = new Array();

var infowindow = new google.maps.InfoWindow();

// some map options, from http://cmap.m-plex.com/hb/maptypes.js by Timothy Reichard

var MapnikOptions = { alt: "Show Mapnik road map tiles from OpenStreetMap.org",
		      getTileUrl: getMapnikTileURL,
		      maxZoom: 18,
		      minZoom: 0,
		      name: "Mapnik",
		      opacity: 1,
		      tileSize: new google.maps.Size(256, 256)
		    };

function getMapnikTileURL(point, zoom)
{
    return 'http://tile.openstreetmap.org/' + zoom + '/' + point.x + '/' + point.y + '.png';
}

var MQOpenMapOptions = { alt: "Show Mapquest Open Map road map tiles based on OpenStreetMap.org data",
			 getTileUrl: getMQOpenMapTileURL,
			 maxZoom: 18,
			 minZoom: 0,
			 name: "MQOpenMap",
			 opacity: 1,
			 tileSize: new google.maps.Size(256, 256)
		       };

function getMQOpenMapTileURL(point, zoom)
{
    var subdomain = Math.floor( Math.random() * (4 - 1 + 1) ) + 1; // Request tile from random subdomain.
    return 'http://otile' + subdomain + '.mqcdn.com/tiles/1.0.0/map/' + zoom + '/' + point.x + '/' + point.y + '.jpg';
    //return 'http://cmap.m-plex.com/hb/ymaptile.php?t=m&s=mq&x=' + point.x + '&y=' + point.y + '&z=' + zoom;
}

var MQOpenSatOptions = { alt: "Show Mapquest Open Map satellite imagery tiles based on OpenStreetMap.org data",
			 getTileUrl: getMQOpenSatTileURL,
			 maxZoom: 18,
			 minZoom: 0,
			 name: "MQOpenSat",
			 opacity: 1,
			 tileSize: new google.maps.Size(256, 256)
		       };

function getMQOpenSatTileURL(point, zoom)
{
    var subdomain = Math.floor( Math.random() * (4 - 1 + 1) ) + 1; // Request tile from random subdomain.
    return 'http://otile' + subdomain + '.mqcdn.com/tiles/1.0.0/sat/' + zoom + '/' + point.x + '/' + point.y + '.jpg';
    //return 'http://cmap.m-plex.com/hb/ymaptile.php?t=s&s=mq&x=' + point.x + '&y=' + point.y + '&z=' + zoom;
}

var BlankOptions = { alt: "Show a blank background",
		     getTileUrl: getBlankURL,
		     maxZoom: 18,
		     minZoom: 0,
		     name: "Blank",
		     opacity: 1,
		     tileSize: new google.maps.Size(256, 256)
		   };

function getBlankURL() {
    return '/empty.gif';
}

var intersectionimage = {
    url: 'smallintersection.png',
    // This marker is 16x16
    size: new google.maps.Size(16, 16),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the center of the intersection
    anchor: new google.maps.Point(8, 8)
};

// loadmap constructs and sets up the initial map
function loadmap() {
    var typeMQOpenMap = new google.maps.ImageMapType(MQOpenMapOptions);
    var typeMQOpenSat = new google.maps.ImageMapType(MQOpenSatOptions);
    var typeMapnik = new google.maps.ImageMapType(MapnikOptions);
    var typeBlank = new google.maps.ImageMapType(BlankOptions);

    var maptypelist = ['Mapnik', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'Blank'];
    var maptypecontroloptions = {mapTypeIds: maptypelist, position: google.maps.TOP_RIGHT, style: google.maps.MapTypeControlStyle.DROPDOWN_MENU};
    //var mapopt = {center: new google.maps.LatLng(42.664529, -73.786470), zoom: 12, mapTypeId: 'Mapnik', mapTypeControl: true, mapTypeControlOptions: maptypecontroloptions, streetViewControl: true, disableDefaultUI: true, panControl: true, zoomControl: true, scaleControl: true, overviewMapControl: true, keyboardShortcuts: true, disableDoubleClickZoom: false};
    // OLD coordinates are Albertus Hall room 400-2 at The College of Saint Rose
    //var mapopt = {center: new google.maps.LatLng(42.664529, -73.786470), zoom: 16, mapTypeControl: true, mapTypeControlOptions: maptypecontroloptions};

    // coordinates are Roger Bacon 321 at Siena College
    var mapopt = {center: new google.maps.LatLng(42.719450, -73.752063), zoom: 16, mapTypeControl: true, mapTypeControlOptions: maptypecontroloptions};

    map = new google.maps.Map(document.getElementById("map"), mapopt);

    map.mapTypes.set('MQOpenMap', typeMQOpenMap);
    map.mapTypes.set('MQOpenSat', typeMQOpenSat);
    map.mapTypes.set('Mapnik', typeMapnik);
    map.mapTypes.set('Blank', typeBlank);
}

// construct a new Waypoint object (based on similar function by Tim Reichard)
// now supporting edge adjacency lists
function Waypoint(label, lat, lon, elabel, edgeList) {
    this.label = label;
    this.lat = parseFloat(lat).toFixed(6);
    this.lon = parseFloat(lon).toFixed(6);
    this.visible = true;
    if (label.indexOf("+") >= 0) {
	this.visible = false;
    }
    this.elabel = elabel;
    this.edgeList = edgeList;
    return this;
}

// update the map to the current set of waypoints and connections
function updateMap()
{
    // remove any existing google.maps.Polyline connections shown
    for (var i = 0; i < connections.length; i++) {
	connections[i].setMap(null);
    }
    connections = new Array();

    var minlat = 999;
    var maxlat = -999;
    var minlon = 999;
    var maxlon = -999;

    polypoints = new Array();
    for (var i = 0; i < markers.length; i++) {
	markers[i].setMap(null);
    }

    var showHidden = false;
    if (document.getElementById('showHidden') != null) {
	showHidden = document.getElementById('showHidden').checked;
    }
    var showMarkers = true;
    if (document.getElementById('showMarkers') != null) {
	showMarkers = document.getElementById('showMarkers').checked;
    }

    markers = new Array();
    markerinfo = new Array();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < waypoints.length; i++) {
	minlat = Math.min(minlat, waypoints[i].lat);
	maxlat = Math.max(maxlat, waypoints[i].lat);
	minlon = Math.min(minlon, waypoints[i].lon);
	maxlon = Math.max(maxlon, waypoints[i].lon);

	polypoints[i] = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);

	markerinfo[i] = MarkerInfo(i, waypoints[i]);
	markers[i] = new google.maps.Marker({
	    position: polypoints[i],
	    //map: map,
	    title: waypoints[i].label,
	    icon: intersectionimage
	});
	if (showMarkers && (showHidden || waypoints[i].visible)) {
	    AddMarker(markers[i], markerinfo[i], i);
	}
	bounds.extend(polypoints[i]);
    }

    var midlat = (minlat + maxlat)/2;
    var midlon = (minlon + maxlon)/2;

    var nsdist = Mileage(minlat, midlon, maxlat, midlon);
    var ewdist = Mileage(midlat, minlon, midlat, maxlon);
    var maxdist = Math.max(nsdist, ewdist);

    //var zoom = 17 - (12 + Math.floor(Math.log(maxdist/800)/Math.log(2.0)));
    //zoom = Math.max(zoom, 0);
    //zoom = Math.min(zoom, 17);
    //map.setZoom(zoom);
    map.fitBounds(bounds);

    // if this is a graph in HDX, we draw edges as connections,
    // otherwise we may be connecting waypoints in order to plot a
    // path
    if (graphEdges.length > 0) {
	for (var i = 0; i < graphEdges.length; i++) {
	    var numPoints;
	    if (graphEdges[i].via == null) {
		numPoints = 2;
	    }
	    else {
		numPoints = graphEdges[i].via.length/2 + 2;
	    }
	    var edgePoints = new Array(numPoints);
	    var v1 = graphEdges[i].v1;
	    var v2 = graphEdges[i].v2;
	    //	    DBG.write("Adding edge " + i + " from " + v1 + "(" + waypoints[v1].lat + "," + waypoints[v1].lon + ") to " + v2 + "(" + waypoints[v2].lat + "," + waypoints[v2].lon + ")");
	    edgePoints[0] = new google.maps.LatLng(waypoints[v1].lat, waypoints[v1].lon);
	    nextPoint = 1;
	    if (graphEdges[i].via != null) {
		for (var j = 0; j < graphEdges[i].via.length; j+=2) {
		    edgePoints[nextPoint] = new google.maps.LatLng(graphEdges[i].via[j], graphEdges[i].via[j+1]);
		    nextPoint++;
		}
	    }
	    edgePoints[nextPoint] = new google.maps.LatLng(waypoints[v2].lat, waypoints[v2].lon);
	    connections[i] = new google.maps.Polyline({path: edgePoints, strokeColor: "#0000FF", strokeWeight: 10, strokeOpacity: 0.4, map: map});
	    //map.addOverlay(connections[i]);
	}
	google.maps.event.clearListeners(map, 'zoom_changed');
	google.maps.event.addListener(map, 'zoom_changed', zoomChange);
	zoomChange();
    }
    else if (usingAdjacencyLists) {
	var edgeNum = 0;
	for (var i = 0; i < waypoints.length; i++) {
	    for (var j = 0; j < waypoints[i].edgeList.length; j++) {
		var thisEdge = waypoints[i].edgeList[j];
		// avoid double plot by only plotting those with v1 as i
		if (thisEdge.v1 == i) {
		    var numPoints;
		    if (thisEdge.via == null) {
			numPoints = 2;
		    }
		    else {
			numPoints = thisEdge.via.length/2 + 2;
		    }
		    var edgePoints = new Array(numPoints);
		    edgePoints[0] = new google.maps.LatLng(waypoints[thisEdge.v1].lat, waypoints[thisEdge.v1].lon);
		    nextPoint = 1;
		    if (thisEdge.via != null) {
			for (var p = 0; p < thisEdge.via.length; p+=2) {
			    edgePoints[nextPoint] = new google.maps.LatLng(thisEdge.via[p], thisEdge.via[p+1]);
			    nextPoint++;
			}
		    }
		    edgePoints[nextPoint] = new google.maps.LatLng(waypoints[thisEdge.v2].lat, waypoints[thisEdge.v2].lon);
		    // count the commas, which tell us how many
		    // concurrent routes are represented, as they will
		    // be comma-separated, then use that to choose a
		    // color to indicate the number of routes
		    // following the edge
		    concurrent = thisEdge.label.split(",").length;
		    color = "";
		    switch (concurrent) {
		    case 1:
			color = "#0000FF";
			break;
		    case 2:
			color = "#00FF00";
			break;
		    case 3:
			color = "#FF00FF";
			break;
		    case 4:
			color = "#FFFF00";
			break;
		    default:
			color = "#FF0000";
			break;
		    }
		    connections[edgeNum] = new google.maps.Polyline({path: edgePoints, strokeColor: color, strokeWeight: 10, strokeOpacity: 0.4, map: map});
		    edgeNum++;
		}
	    }
	}

	google.maps.event.clearListeners(map, 'zoom_changed');
	google.maps.event.addListener(map, 'zoom_changed', zoomChange);
	zoomChange();
    }
    // connecting waypoints in order to plot a path
    else if (mapClinched) {
	// clinched vs unclinched segments mapped with different colors
	var nextClinchedCheck = 0;
	var totalMiles = 0.0;
	var clinchedMiles = 0.0;
	var level = map.getZoom();
	var weight = 2;
	if (newRouteIndices.length > 0) {
	    // if newRouteIndices is not empty, we're plotting multiple routes
	    //DBG.write("Multiple clinched routes!");
	    var nextSegment = 0;
	    for (var route = 0; route < newRouteIndices.length; route++) {
		var start = newRouteIndices[route];
		var end;
		if (route == newRouteIndices.length-1) {
		    end = waypoints.length-1;
		}
		else {
		    end = newRouteIndices[route+1]-1;
		}
		//DBG.write("route = " + route + ", start = " + start + ", end = " + end);
		// support for clinch colors from systems.csv
		var unclinchedColor = "rgb(200,200,200)"; //"#cccccc";
		var clinchedColor = "rgb(255,128,128)"; //"#ff8080";
		for (var c = 0; c<colorCodes.length; c++) {
		    if (colorCodes[c].name == routeColor[route]) {
			unclinchedColor = colorCodes[c].unclinched;
			clinchedColor = colorCodes[c].clinched;
		    }
		}
		// override with tier or system colors given in query string if they match
		for (var c = 0; c<customColorCodes.length; c++) {
		    if (customColorCodes[c].name == ("tier"+routeTier[route])) {
			unclinchedColor = customColorCodes[c].unclinched;
			clinchedColor = customColorCodes[c].clinched;
		    }
		    if (customColorCodes[c].name == routeSystem[route]) {
			unclinchedColor = customColorCodes[c].unclinched;
			clinchedColor = customColorCodes[c].clinched;
		    }
		}
		for (var i=start; i<end; i++) {
		    var zIndex = 10 - routeTier[route];
		    var edgePoints = new Array(2);
		    edgePoints[0] = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
		    edgePoints[1] = new google.maps.LatLng(waypoints[i+1].lat, waypoints[i+1].lon);
		    var segmentLength = Mileage(waypoints[i].lat,
						waypoints[i].lon,
						waypoints[i+1].lat,
						waypoints[i+1].lon);
		    totalMiles += segmentLength;
		    //DBG.write("i = " + i);
		    var color = unclinchedColor;
		    var opacity = 0.3;
		    if (segments[nextSegment] == clinched[nextClinchedCheck]) {
			//DBG.write("Clinched!");
			color = clinchedColor;
			zIndex = zIndex + 10;
			nextClinchedCheck++;
			clinchedMiles += segmentLength;
			opacity = 0.85;
		    }
		    connections[nextSegment] = new google.maps.Polyline(
			{path: edgePoints, strokeColor: color, strokeWeight: weight, strokeOpacity: opacity,
			 zIndex : zIndex, map: map});
		    nextSegment++;
		}
	    }
	    // set up listener for changes to zoom level and adjust strokeWeight in response
	    //DBG.write("Setting up zoom_changed");
	    google.maps.event.clearListeners(map, 'zoom_changed');
	    google.maps.event.addListener(map, 'zoom_changed', zoomChange);
	    //	    google.maps.event.addListener(map, 'zoom_changed', function() {
	    //		var level = map.getZoom();
	    //		var weight = Math.floor(level);
	    //		DBG.write("Zoom level " + level + ", weight = " + weight);
	    //		for (var i=0; i<connections.length; i++) {
	    //		    connections[i].setOptions({strokeWeight: weight});
	    //		}
	    //	    });
	}
	else {
	    // single route
	    for (var i=0; i<segments.length; i++) {
		var edgePoints = new Array(2);
		edgePoints[0] = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
		edgePoints[1] = new google.maps.LatLng(waypoints[i+1].lat, waypoints[i+1].lon);
		var segmentLength = Mileage(waypoints[i].lat,
					    waypoints[i].lon,
					    waypoints[i+1].lat,
					    waypoints[i+1].lon);
		totalMiles += segmentLength;
		var color = "#cccccc";
		if (segments[i] == clinched[nextClinchedCheck]) {
		    color = "#ff8080";
		    nextClinchedCheck++;
		    clinchedMiles += segmentLength;
		}
		connections[i] = new google.maps.Polyline({path: edgePoints, strokeColor: color, strokeWeight: 10, strokeOpacity: 0.75, map: map});
	    }
	}
	if (document.getElementById('controlboxinfo') != null) {
	    document.getElementById('controlboxinfo').innerHTML = ""; //clinchedMiles.toFixed(2) + " of " + totalMiles.toFixed(2) + " miles (" + (clinchedMiles/totalMiles*100).toFixed(1) + "%) clinched by " + traveler + ".";
	}
    }
    else if (genEdges) {
	connections[0] = new google.maps.Polyline({path: polypoints, strokeColor: "#0000FF", strokeWeight: 10, strokeOpacity: 0.75, map: map});
	//map.addOverlay(connections[0]);
    }
    // don't think this should not be needed, but an attempt to get
    // hidden waypoints to be hidden when first created
    showHiddenClicked();
}

function zoomChange() {

    var level = map.getZoom();
    var newWeight;
    if (level < 9) newWeight = 2;
    else if (level < 12) newWeight = 6;
    else if (level < 15) newWeight = 10;
    else newWeight = 16;
    DBG.write("zoomChange: Zoom level " + level + ", newWeight = " + newWeight);
    for (var i=0; i<connections.length; i++) {
	//connections[i].setMap(null);
	connections[i].setOptions({strokeWeight: newWeight});
    }
}

function AddMarker(marker, markerinfo, i) {

    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.setContent(markerinfo);
	infowindow.open(map, marker);
    });
}

function LabelClick(i, label, lat, lon, errors) {

    map.panTo(new google.maps.LatLng(lat, lon));
    //infowindow.setContent(info);
    infowindow.setContent(markerinfo[i]);
    infowindow.open(map, markers[i]);
}

function MarkerInfo(i, wpt) {

    return '<p style="line-height:160%;"><span style="font-size:24pt;">' + wpt.label + '</span><br><b>Waypoint ' + (i+1) + '<\/b><br><b>Coords.:<\/b> ' + wpt.lat + '&deg;, ' + wpt.lon + '&deg;<\/p>';

}

// compute distance in miles between two lat/lon points
function Mileage(lat1, lon1, lat2, lon2) {
    if(lat1 == lat2 && lon1 == lon2)
	return 0.;

    var rad = 3963.;
    var deg2rad = Math.PI/180.;
    var ang = Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * Math.cos((lon1 - lon2)*deg2rad) + Math.sin(lat1 * deg2rad) * Math.sin(lat2 * deg2rad);
    return Math.acos(ang) * 1.02112 * rad;
}

// compute distance in feet between two lat/lon points
function Feet(lat1, lon1, lat2, lon2) {
    if(lat1 == lat2 && lon1 == lon2)
	return 0.;

    var rad = 3963.;
    var deg2rad = Math.PI/180.;
    var ang = Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * Math.cos((lon1 - lon2)*deg2rad) + Math.sin(lat1 * deg2rad) * Math.sin(lat2 * deg2rad);
    return Math.acos(ang) * 1.02112 * rad * 5280;
}

// callback for when the showHidden checkbox is clicked
function showHiddenClicked() {

    var showHidden = false;
    if (document.getElementById('showHidden') != null) {
	showHidden = document.getElementById('showHidden').checked;
    }
    //DBG.write("showHiddenClicked: showHidden is " + showHidden);
    if (showHidden) {
	// add in the hidden markers
	for (var i = 0; i < waypoints.length; i++) {
	    if (!waypoints[i].visible) {
		AddMarker(markers[i], markerinfo[i], i);
	    }
	}
    }
    else {
	// hide the ones that should no longer be visible
	for (var i = 0; i < waypoints.length; i++) {
	    if (!waypoints[i].visible) {
		markers[i].setMap(null);
	    }
	}
    }
}

// callback for when the hideMarkers checkbox is clicked
function showMarkersClicked() {

    var showThem = document.getElementById('showMarkers').checked;
    if (showThem) {
	for (var i = 0; i < waypoints.length; i++) {
	    if (waypoints[i].visible) {
		AddMarker(markers[i], markerinfo[i], i);
	    }
	}
    }
    else {
	for (var i = 0; i < waypoints.length; i++) {
	    markers[i].setMap(null);
	}
    }
}

function redirect(url) {
    var win = window.open(url);
    win.focus();
}

// default delay 50 should match the selected option in the speedChanger
// and delay should be used for the amount of time in the future to use
// for setTimeout calls
var delay = 50;
function speedChanged() {
    var speedChanger = document.getElementById("speedChanger");
    delay = speedChanger.options[speedChanger.selectedIndex].value;
}



// some variables to support our search with timers
var nextToCheck;
var northIndex = -1;
var southIndex = -1;
var eastIndex = -1;
var westIndex = -1;
var shortestVLabel;
var longestVLabel;
var indexOfShortestLabel;
var indexOfPreviousShortestLabel;
var IndexOfLongestLabel;
var indexOfPreviousLongestLabel;
var shortestLableColorCode = "#654321"
var longestLabelColorCode = "#006400"

// callback for when startSearch button is pressed
function startSearch() {
    if (pause == true) {
	pause = false;
	continueSearch();
	return;
    }

    var statusLine = document.getElementById("status");
    // statusLine.innerHTML = "Preparing for Extreme Point Search Visualization";
    // in the future, make sure we have appropriate data in the system
    // before executing anything here

    // start by showing all existing markers, even hidden
    for (var i = 0; i < waypoints.length; i++) {
	markers[i].setMap(map);
	markers[i].setIcon({path: google.maps.SymbolPath.CIRCLE,
			    scale: 2,
			    zIndex: google.maps.Marker.MAX_ZINDEX+1,
			    fillColor: 'white',
			    strokeColor: 'white'});
    }
    // we don't need edges here, so we remove those
    for (var i = 0; i < connections.length; i++) {
	connections[i].setMap(null);
    }
    //we don't need connections table here, so we remove those
    var cTable = document.getElementById("connection");
    cTable.innerHTML = "";


    var startingPoint = document.getElementById("startPoint").value;

    // indexOfShortestLabel = startPoint;
    // IndexOfLongestLabel = startPoint;

    shortestVLabel = waypoints[startingPoint].label;
    longestVLabel = waypoints[startingPoint].label;

    // start the search by initializing with the value at pos 0
    markers[startingPoint].setIcon({path: google.maps.SymbolPath.CIRCLE,
				    scale: 6,
				    zIndex: google.maps.Marker.MAX_ZINDEX+ 4,
				    fillColor: 'yellow',
				    strokeColor: 'yellow'});
    markers[startingPoint].setZIndex( 1E9 );
    document.getElementById('waypoint'+ startingPoint).style.backgroundColor = "yellow";
    nextToCheck = startingPoint;
    queueOrStack.innerHTML = 'Checking: <span style="color:yellow">0</span>';
    // enable pause button
    //document.getElementById("pauseRestart").disabled = false;
    setTimeout(continueSearch, delay);
}


// do an iteration of search
function continueSearch() {
    if (pause == true) {
	return;
    }

    var startingPoint = document.getElementById("startPoint").value;
    //DBG.write("continueSearch: " + nextToCheck + " N: " + northIndex + " S:" + southIndex + " E: " + eastIndex + " W:" + westIndex);
    // first we finish the previous point to see if it's a new winner,
    // and if necessary downgrade anyone who was beaten by this one
    // special case of first checked
    if (nextToCheck == startingPoint) {
	// this was our first check, so this point wins all to start
	northIndex = startingPoint;
	southIndex = startingPoint;
	eastIndex = startingPoint;
	westIndex = startingPoint;
	// it's red as our leader
	markers[startingPoint].setIcon({path: google.maps.SymbolPath.CIRCLE,
					scale: 6,
					zIndex: google.maps.Marker.MAX_ZINDEX + 4,
					fillColor: 'red',
					strokeColor: 'red'});
	markers[startingPoint].setZIndex(1E9);
	document.getElementById('waypoint'+ startingPoint).style.backgroundColor = "red";
    }
    // we have to do real work to see if we have new winners
    else {
	// keep track of whether this point is a new leader
	var foundNewLeader = false;
	// keep track of points that were leaders but got beaten to be
	// colored grey if they are no longer a leader in any direction
	var defeated = new Array();

	// check north
	if (waypoints[nextToCheck].lat > waypoints[northIndex].lat) {
	    foundNewLeader = true;
	    defeated.push(northIndex);
	    northIndex = nextToCheck;
	    console.log(waypoints[northIndex].lat);
	    // var queueOrStack = document.getElementById('shortestLongest') ;
            var shortestLongest = document.getElementById('shortestLongest') ;
            shortestLongest.innerHTML = "N : " + '<span style="color:#8b0000">' + "Lat: "  + waypoints[northIndex].lat + " Lon: " + '<span style="color:#8b0000">' + waypoints[northIndex].lon +
		"  Label: " + '<span style="color:#8b0000">' + waypoints[northIndex].label;


	}
	// check south
	if (waypoints[nextToCheck].lat < waypoints[southIndex].lat) {
	    foundNewLeader = true;
	    defeated.push(southIndex);
	    southIndex = nextToCheck;
	    // var queueOrStack = document.getElementById('queueOrStack') ;
            var legend = document.getElementById('legend') ;
            legend.innerHTML = "S : " + '<span style="color:#ff0000">' + "Lat: "  + waypoints[southIndex].lat + " Lon: " + '<span style="color:#ff0000">' + waypoints[southIndex].lon +
		"  Label: " + '<span style="color:#ff0000">' + waypoints[southIndex].label;

	}
	// check east
	if (waypoints[nextToCheck].lon > waypoints[eastIndex].lon) {
	    foundNewLeader = true;
	    defeated.push(eastIndex);
	    eastIndex = nextToCheck;
            var latitude = document.getElementById('latitude') ;
            latitude.innerHTML = "E : " + '<span style="color:#000080">' + "Lat: "  + waypoints[eastIndex].lat + " Lon: " + '<span style="color:#000080">' + waypoints[eastIndex].lon +
		"  Label: " + '<span style="color:#000080">' + waypoints[eastIndex].label;

	}
	// check west
	if (waypoints[nextToCheck].lon < waypoints[westIndex].lon) {
	    foundNewLeader = true;
	    defeated.push(westIndex);
	    westIndex = nextToCheck;
            var length = document.getElementById('length') ;
            length.innerHTML = "W : " + '<span style="color:#551A8B">' + "Lat: "  + waypoints[westIndex].lat + " Lon: " + '<span style="color:#551A8B">' + waypoints[westIndex].lon +
		"  Label: " + '<span style="color:#551A8B">' + waypoints[westIndex].label;
        }

	if (shortestVLabel.length > waypoints[nextToCheck].label.length) {
	    indexOfPreviousShortestLabel = indexOfShortestLabel;
	    indexOfShortestLabel = nextToCheck;
	    shortestVLabel = waypoints[nextToCheck].label;
	    console.log("shortest label: " + shortestVLabel + ", index: " + indexOfShortestLabel);
            var shortLabel = document.getElementById('shortLabel') ;
            shortLabel.innerHTML = "Shortest Label : " + '<span style="color:#654321">' + "Lat: "  + waypoints[nextToCheck].lat + " Lon: " + '<span style="color:#654321">' + waypoints[nextToCheck].lon +
        	"  Label: " + '<span style="color:#654321">' + waypoints[nextToCheck].label;
        }

	if (longestVLabel.length < waypoints[nextToCheck].label.length) {
	    indexOfPreviousLongestLabel = IndexOfLongestLabel;
	    IndexOfLongestLabel = nextToCheck;
	    longestVLabel = waypoints[nextToCheck].label;
	    console.log("longest label: " + longestVLabel + ", index: " + IndexOfLongestLabel);
            var longLabel = document.getElementById('longLabel') ;
      	    longLabel.innerHTML = "Longest Label : " + '<span style="color:#006400">' + "Lat: "  + waypoints[westIndex].lat + " Lon: " + '<span style="color:#006400">' + waypoints[westIndex].lon +
      		"  Label: " + '<span style="color:#006400">' + waypoints[westIndex].label;

	}

	// var shortestLongest = document.getElementById('shortestLongest') ;
	// shortestLongest.innerHTML = '<span style="color:#654321">' + "Shortest: " + shortestVLabel + '<span style="color:#006400">' + " " + "longest: " + longestVLabel ;

	if (foundNewLeader) {
	    //DBG.write("a new leader becoming red: " + nextToCheck);
	    // this one's a new winner, make it red and big
	    markers[nextToCheck].setIcon({path: google.maps.SymbolPath.CIRCLE,
					  scale: 6,
					  zIndex: google.maps.Marker.MAX_ZINDEX + 4,
					  fillColor: 'red',
					  strokeColor: 'red'});
	    markers[startingPoint].setZIndex(1E9);
	    document.getElementById('waypoint' + nextToCheck).style.backgroundColor = "red";
	    // any that was just defeated should stop being red unless it's
	    // still a leader in some other direction (will happen especially
	    // early in searches)
	    while (defeated.length > 0) {
		var toCheck = defeated.pop();
		//DBG.write("a former leader to check: " + toCheck);
		if ((toCheck != northIndex) &&
		    (toCheck != southIndex) &&
		    (toCheck != eastIndex) &&
		    (toCheck != westIndex)) {
		    if (toCheck == indexOfShortestLabel) {
			setColorsForShortestLabel();
		    } else if (toCheck == IndexOfLongestLabel) {
			setColorstForLongestLabel();
		    } else {
			discardThePoint(toCheck);
		    }
		} else {
		    if ((indexOfPreviousShortestLabel != undefined) &&
			(indexOfPreviousShortestLabel != northIndex) &&
			(indexOfPreviousShortestLabel != southIndex) &&
			(indexOfPreviousShortestLabel != eastIndex) &&
			(indexOfPreviousShortestLabel != westIndex)) {
			discardThePoint(indexOfPreviousShortestLabel);
		    }

		    if ((indexOfPreviousLongestLabel != undefined) &&
			(indexOfPreviousLongestLabel != northIndex) &&
			(indexOfPreviousLongestLabel != southIndex) &&
			(indexOfPreviousLongestLabel != eastIndex) &&
			(indexOfPreviousLongestLabel != westIndex)) {
			discardThePoint(indexOfPreviousLongestLabel);
		    }
		}
	    }
	}
	else {
	    if (nextToCheck == indexOfShortestLabel) {
		setColorsForShortestLabel();

		if (indexOfPreviousShortestLabel != undefined) {
		    if ((indexOfPreviousShortestLabel != northIndex) &&
			(indexOfPreviousShortestLabel != southIndex) &&
			(indexOfPreviousShortestLabel != eastIndex) &&
			(indexOfPreviousShortestLabel != westIndex)) {
			discardThePoint(indexOfPreviousShortestLabel);
		    } else {
			document.getElementById('waypoint' + indexOfPreviousShortestLabel).style.backgroundColor = "red";
		    }
		}
	    } else if (nextToCheck == IndexOfLongestLabel) {
		setColorstForLongestLabel();
		if (indexOfPreviousLongestLabel != undefined) {
		    if ((indexOfPreviousLongestLabel != northIndex) &&
			(indexOfPreviousLongestLabel != southIndex) &&
			(indexOfPreviousLongestLabel != eastIndex) &&
			(indexOfPreviousLongestLabel != westIndex)) {
			discardThePoint(indexOfPreviousLongestLabel);
		    } else {
			document.getElementById('waypoint' + indexOfPreviousLongestLabel).style.backgroundColor = "red";
		    }
		}
	    } else {
		discardThePoint(nextToCheck);
	    }
	}
    }
    var statusLine = document.getElementById("status");
    var line = 'Checking : <span style="color:yellow"> ' + nextToCheck + "</span> N: ";
    if (northIndex == nextToCheck) {
	line = line + '<span style="color:#8b0000">' + northIndex + '</span>';
    }
    else {
	line = line + northIndex;
    }
    line = line + " S: ";
    if (southIndex == nextToCheck) {
	line = line + '<span style="color:#ff0000">' + southIndex + '</span>';
    }
    else {
	line = line + southIndex;
    }
    line = line + " E: ";
    if (eastIndex == nextToCheck) {
	line = line + '<span style="color:#000080">' + eastIndex + '</span>';
    }
    else {
	line = line + eastIndex;
    }
    line = line + " W: ";
    if (westIndex == nextToCheck) {
	line = line + '<span style="color:#add8e6">' + westIndex + '</span>';
    }
    else {
	line = line + westIndex;
    }
    line = line + " Short: ";
    // indexOfShortestLabel = shortestLongest + '<span style="color:#00ff00">' + shortestVLabel + '</span>';
    if (indexOfShortestLabel == nextToCheck) {
	line = line + '<span style="color:#654321">' + indexOfShortestLabel + '</span>';
	// shortestLongest = shortestLongest + '<span style="color:#00ff00">' + shortestVLabel + '</span>';
    }

    else{
	// shortestLongest = shortestLongest + shortestVLabel;
	line = line + indexOfShortestLabel;
    }
    line = line + " Long: ";
    if (IndexOfLongestLabel == nextToCheck) {
	line = line + '<span style="color:#006400">' + IndexOfLongestLabel + '</span>';
    }
    else {
	line = line + IndexOfLongestLabel;
    }

    document.getElementById('queueOrStack').innerHTML = line;
    // if(shortestVLabel.length > waypoints[nextToCheck].label.length) {
    // 	shortestVLabel = waypoints[nextToCheck].label;
    // }
    //
    // if (longestVLabel.length < waypoints[nextToCheck].label.length) {
    // 	longestVLabel = waypoints[nextToCheck].label;
    // }

    nextToCheck++;
    if (nextToCheck < markers.length) {
	markers[nextToCheck].setIcon({path: google.maps.SymbolPath.CIRCLE,
				      scale: 6,
				      zIndex: google.maps.Marker.MAX_ZINDEX+3,
				      fillColor: 'yellow',
				      strokeColor: 'yellow'});
	markers[nextToCheck].setZIndex(1E9);
	document.getElementById('waypoint' + nextToCheck).style.backgroundColor = "yellow";
	//if (!paused) {
	setTimeout(continueSearch, delay);
	//	}
    }
    else {
        // document.getElementById('queueOrStack').innerHTML = "Done! Results:" + '<span style="color:#8b0000">' + " N: " + northIndex + '<span style="color:#ff0000">' + " S:" + southIndex +  '<span style="color:#000080">' + " E: " + eastIndex  + '<span style="color:#4B0082">' + " W:" + westIndex;

	// document.getElementById('queueOrStack').innerHTML = "Done! Results:" + '<span style="color:#8b0000">' + " N: " + northIndex + '<span style="color:#ff0000">' + " S:" + southIndex +  '<span style="color:#000080">' + " E: " + eastIndex  + '<span style="color:#4B0082">' + " W:" + westIndex;
	// document.getElementById('shortestLongest').innerHTML = "Done!"+ '<span style="color:#654321">' + " Shortest: " + shortestVLabel + " \t " +  '<span style="color:#006400">' + " Longest " + longestVLabel;
	// document.getElementById('latitude').innerHTML = "Done! Latitudes:" + '<span style="color:#8b0000">' + " N: " + waypoints[northIndex].lat + '<span style="color:#ff0000">' + " S:" +  waypoints[southIndex].lat + '<span style="color:#000080">' + " E: " + waypoints[eastIndex].lat +  '<span style="color:#4B0082">' + " W:" + waypoints[westIndex].lat;
	// document.getElementById('length').innerHTML = "Done! lengths:" + '<span style="color:#654321">' + " Shortest: " + shortestVLabel.length +  '<span style="color:#006400">' + " longest:" +  longestVLabel.length;
	// // document.getElementById('Longtitude').innerHTML = "Done! Longtitude:" + '<span style="color:#8b0000">' + " N: " + waypoints[northIndex].lon + '<span style="color:#ff0000">' + " S:" +  waypoints[southIndex].lon + '<span style="color:#000080">' + " E: " + waypoints[eastIndex].lon +  '<span style="color:#4B0082">' + " W:" + waypoints[westIndex].lon;
	document.getElementById('queueOrStack').innerHTML = "Done! Results:" + '<span style="color:#8b0000">' + " N: " + northIndex + '<span style="color:#ff0000">' + " S:" + southIndex +  '<span style="color:#000080">' + " E: " + eastIndex  + '<span style="color:#4B0082">' + " W:" + westIndex +
	    +		'<span style="color:#654321">' + " Short:" + shortIndex + '<span style="color:#006400">' + " Long:" + longIndex;


    }
}

function setColorsForShortestLabel() {
    document.getElementById('waypoint' + indexOfShortestLabel).style.backgroundColor = shortestLableColorCode;
    markers[indexOfShortestLabel].setIcon({
	path: google.maps.SymbolPath.CIRCLE,
	scale: 6,
	zIndex: google.maps.Marker.MAX_ZINDEX + 9,
	fillColor: shortestLableColorCode,
	strokeColor: shortestLableColorCode
    });
    if (indexOfPreviousShortestLabel != undefined) {
	discardThePoint(indexOfPreviousShortestLabel);
    }
}

function setColorstForLongestLabel() {
    document.getElementById('waypoint' + IndexOfLongestLabel).style.backgroundColor = longestLabelColorCode;
    markers[IndexOfLongestLabel].setIcon({
	path: google.maps.SymbolPath.CIRCLE,
	scale: 6,
	zIndex: google.maps.Marker.MAX_ZINDEX + 9,
	fillColor: longestLabelColorCode,
	strokeColor: longestLabelColorCode
    });
    if (indexOfPreviousLongestLabel != undefined) {
	discardThePoint(indexOfPreviousLongestLabel);
    }
}

function discardThePoint(pointIndex) {
    markers[pointIndex].setIcon({
	path: google.maps.SymbolPath.CIRCLE,
	scale: 2,
	zIndex: google.maps.Marker.MAX_ZINDEX + 1,
	fillColor: 'grey',
	strokeColor: 'grey'
    });
    document.getElementById('waypoint' + pointIndex).style.display = "none";
}

var minDistance = 9999999;
var maxDistance = -999999;
var edgeMin = null;
var edgeMax = null;
var currentEdgeIndex = 0;
var shortestELabel;
var longestELabel;
function startEdgeSearch() {

    if (pause == true){
	pause = false;
	continueEdgeSearch();
	return;
    }

    var statusLine = document.getElementById("status");
    // statusLine.innerHTML = "Preparing for Extreme Edge Search Visualization";
    // we don't need edges here, so we remove those
    for (var i = 0; i < connections.length; i++) {
	connections[i].setMap(null);
    }
    //we don't need waypoints table here, so we remove those
    var Table = document.getElementById("waypoints");
    Table.innerHTML = "";
    // document.getElementById('queueOrStack').innerHTML = 'Checking: <span style="color:yellow">0</span>';
    setTimeout(continueEdgeSearch, delay);

}

function continueEdgeSearch(){
    if (pause == true){
	return;
    }
    if(currentEdgeIndex== graphEdges.length){
	var maxEdgePoints = new Array(2);
	maxEdgePoints [0] = new google.maps.LatLng( waypoints[edgeMax.v1].lat, waypoints[edgeMax.v1].lon);
	maxEdgePoints [1] = new google.maps.LatLng( waypoints[edgeMax.v2].lat, waypoints[edgeMax.v2].lon);
	new google.maps.Polyline({path: maxEdgePoints, strokeColor: '#0000FF', strokeWeight: 10, strokeOpacity: 1, map: map});
	var firstNode = Math.min(edgeMax.v1, edgeMax.v2);
	var secondNode = Math.max(edgeMax.v1, edgeMax.v2);
	document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = "blue";
	var minEdgePoints = new Array(2);
	minEdgePoints [0] = new google.maps.LatLng( waypoints[edgeMin.v1].lat, waypoints[edgeMin.v1].lon);
	minEdgePoints [1] = new google.maps.LatLng( waypoints[edgeMin.v2].lat, waypoints[edgeMin.v2].lon);
	new google.maps.Polyline({path: minEdgePoints, strokeColor: '#FF0000', strokeWeight: 20, strokeOpacity: 1, map: map});
	var firstNode = Math.min(edgeMin.v1, edgeMin.v2);
	var secondNode = Math.max(edgeMin.v1, edgeMin.v2);
	document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = "red";

	document.getElementById('shortestLongest').innerHTML = "Shortest Edge label: " + shortestELabel + "  Longest Edge label: " + longestELabel;
	console.log("shortest Edge label: " + shortestELabel);
	console.log("Longest Edge label: " + longestELabel);
	return;
    }
    var edge = graphEdges[currentEdgeIndex];
    var distance = Feet(waypoints[edge.v1].lat, waypoints[edge.v1].lon,
			waypoints[edge.v2].lat, waypoints[edge.v2].lon);

    if (distance < minDistance){
	minDistance = distance;
	edgeMin = edge;
    }

    if (distance > maxDistance) {
	maxDistance = distance;
	edgeMax = edge;
    }

    if (shortestELabel === undefined || shortestELabel.length > edge.label.length) {
	shortestELabel = edge.label;
    }

    if (longestELabel === undefined || longestELabel.length < edge.label.length) {
	longestELabel = edge.label;
    }

    var initEdgePoints = new Array(2);
    initEdgePoints [0] = new google.maps.LatLng( waypoints[edge.v1].lat, waypoints[edge.v1].lon);
    initEdgePoints [1] = new google.maps.LatLng( waypoints[edge.v2].lat, waypoints[edge.v2].lon);
    new google.maps.Polyline({path: initEdgePoints, strokeColor: '#FFFF00', strokeWeight: 10, strokeOpacity: 1, map: map});
    var firstNode = Math.min(edge.v1, edge.v2);
    var secondNode = Math.max(edge.v1, edge.v2);
    document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = "grey";
    currentEdgeIndex += 1;
    setTimeout(continueEdgeSearch, delay);
}

var queue = [];
var visited =[];
var minDistanceBfs =  99999999;
var maxDistanceBfs = -99999999;
var minEdgeBfs;
var maxEdgeBfs;

function startBfsSearch() {
    if (pause == true){
	pause = false;
	processQueue();
	return;
    }
    var cTable = document.getElementById("connection");
    cTable.innerHTML = "";
    visited = new Array(waypoints.length).fill(false);
    // we don't need edges here, so we remove those
    for (var i = 0; i < connections.length; i++) {
	connections[i].setMap(null);
    }
    connections = new Array();
    var startingPoint = document.getElementById("startPoint").value;
    queue.push(startingPoint);
    document.getElementById('waypoint' + startingPoint).style.backgroundColor="yellow";
    markers[startingPoint].setMap(map);
    markers[startingPoint].setIcon({path: google.maps.SymbolPath.CIRCLE,
				    scale: 8,
				    zIndex: google.maps.Marker.MAX_ZINDEX+1,
				    fillColor: 'yellow',
				    strokeColor: 'yellow'});
    markers[startingPoint].setZIndex( 1E9 );
    setTimeout(processQueue, delay);
}

function processQueue() {
    if (pause == true){
	return;
    }

    if (queue.length == 0) {
	console.log("Done!");
	console.log("Min distance: " + minDistanceBfs);
	console.log("Max distance: " + maxDistance);
	return;
    }
    if (visited[queue[0]]) {
	var pop = queue.shift();
	console.log("pop: " + pop);
	// document.getElementById('waypoint'+ pop).style.backgroundColor="grey";
	document.getElementById('waypoint'+ pop).style.display="none";
	markers[pop].setMap(map);
	markers[pop].setIcon({path: google.maps.SymbolPath.CIRCLE,
			      scale: 2,
			      zIndex: google.maps.Marker.MAX_ZINDEX+1,
			      fillColor: 'grey',
			      strokeColor: 'grey'});
	printList(queue);
	document.getElementById('queueOrStack').innerHTML = "Size : " + queue.length +", queue : " + listToString(queue);
	setTimeout(processQueue, delay);
	return;
    }

    visited[queue[0]] = true;
    var currentRow = document.getElementById('waypoint' + queue[0]);

    currentRow.style.backgroundColor="yellow";
    markers[queue[0]].setMap(map);
    markers[queue[0]].setIcon({path: google.maps.SymbolPath.CIRCLE,
			       scale: 6,
			       zIndex: google.maps.Marker.MAX_ZINDEX+1,
			       fillColor: 'yellow',
			       strokeColor: 'yellow'});

    var neighbors = getAdjacentPoints(queue[0]);
    for (var i = 0; i < neighbors.length; i++) {
	if (visited[neighbors[i]] == false) {
	    queue.push(neighbors[i]);
	    document.getElementById('waypoint'+ neighbors[i]).style.backgroundColor="purple";
	    markers[neighbors[i]].setMap(map);
	    markers[neighbors[i]].setIcon({path: google.maps.SymbolPath.CIRCLE,
					   scale: 4,
					   zIndex: google.maps.Marker.MAX_ZINDEX+1,
					   fillColor: 'purple',
					   strokeColor: 'purple'});

            var distance = Feet(waypoints[neighbors[i]].lat, waypoints[neighbors[i]].lon, waypoints[queue[0]].lat, waypoints[queue[0]].lon);
	    if (distance < minDistanceBfs) {
        	minDistanceBfs = distance;
		minEdgeBfs = waypoints[queue[0]].edgeList[i];
            }

            if (distance > maxDistanceBfs) {
		maxDistanceBfs = distance;
		maxEdgeBfs  = waypoints[queue[0]].edgeList[i];
            }

	}
    }
    printList(queue);
    document.getElementById('queueOrStack').innerHTML = "Size : " + queue.length +", queue : " + listToString(queue);
    setTimeout(processQueue, delay);
}

function getAdjacentPoints(pointIndex) {
    var resultArray = [];
    var edgeList = waypoints[pointIndex].edgeList;
    for (var i = 0; i < edgeList.length; i++) {
	var adjacentIndex;
	if (edgeList[i].v1 == pointIndex) {
	    adjacentIndex = edgeList[i].v2;
	} else {
	    adjacentIndex = edgeList[i].v1;
	}
	resultArray.push(adjacentIndex);
    }

    return resultArray;
}

function printList(items) {
    if (items.length == 0) {
	console.log("[]");
    } else {
	var line = `[`;
		     for (var i = 0; i < items.length; i++) {
			 if (i == items.length - 1) {
			     line += items[i];
			 } else {
			     line += items[i] + `, `;
			 }

		     }
		     line += `]`;
	console.log(line);
    }

}
function listToString(items) {
    if (items.length == 0) {
	return "[]";
    } else {
	var line = `[`;
		     for (var i = 0; i < items.length; i++) {
			 if (i == items.length - 1) {
			     line += items[i];
			 } else {
			     line += items[i] + `, `;
			 }

		     }
		     line += ` ]`;
	return line;
    }

}
var stack = [];
var visitedDfs =[];
var minDistanceDfs;
var maxDistanceDfs;
var minEdgeDfs;
var maxEdgeDfs;
var maxEdgePolylineDFS;
var minEdgePolylineDFS;

function startDfsSearch() {
    if (pause == true){
	pause = false;
	processStack();
	return;
    }
    var cTable = document.getElementById("connection");
    cTable.innerHTML = "";


    // Reset previous state
    minDistanceDfs =  99999999;
    maxDistanceDfs = -99999999;
    minEdgeDfs = null;
    maxEdgeDfs = null;
    maxEdgePolyline = null;
    minEdgePolyline = null;
    visitedDfs = new Array(waypoints.length).fill(false)
    var startingPoint = document.getElementById("startPoint").value;
    // put frist point into the stack and start processing the stack
    stack.push(startingPoint);

    setTimeout(processStack, delay);
}

function processStack() {
    if (pause == true){
	return;
    }
    // If stack is empty, nothing to do any more and we are done.
    if (stack.length == 0) {
	console.log("Done with DFS search");
	return;
    }

    // get top of stack
    var top = stack[stack.length - 1];
    if (visitedDfs[top] == true) {
	// document.getElementById('waypoint'+ top).style.backgroundColor="purple";
	markers[top].setMap(map);
	markers[top].setIcon({path: google.maps.SymbolPath.CIRCLE,
			      scale: 4,
			      zIndex: google.maps.Marker.MAX_ZINDEX+1,
			      fillColor: 'purple',
			      strokeColor: 'purple'});
	// document.getElementById('waypoint' + top).style.backgroundColor="grey";
	document.getElementById('waypoint' + top).style.display="none";
	var adjacentList = getAdjacentPoints(top);

	// Find the first adjacent of the top node which is not visited yet, and push it to the stack,
	// and continue processing the stack again.
	for (var i = 0; i < adjacentList.length; i++) {
	    if (visitedDfs[adjacentList[i]] == false) {
		stack.push(adjacentList[i]);
		// document.getElementById('waypoint'+ adjacentList[i]).style.backgroundColor="purple";
		markers[adjacentList[i]].setMap(map);
		markers[adjacentList[i]].setIcon({path: google.maps.SymbolPath.CIRCLE,
						  scale: 4,
						  zIndex: google.maps.Marker.MAX_ZINDEX+1,
						  fillColor: 'purple',
						  strokeColor: 'purple'});
		// Update related mins and maxs (minDistanceDfs, minEdgeDfs, maxDistanceBfs, maxEdgeDfs)
		var distance = Feet(waypoints[adjacentList[i]].lat, waypoints[adjacentList[i]].lon, waypoints[top].lat, waypoints[top].lon);
		if (distance < minDistanceDfs) {

		    if (minEdgePolylineDFS != null) {
			// if we already draw a polyline for minEdge, since we found a smaller edge, just remove previous one
			minEdgePolylineDFS.setMap(null);
		    }

		    minDistanceDfs = distance;
		    minEdgeDfs = waypoints[top].edgeList[i];

		}

		if (distance > maxDistanceDfs) {

		    if (maxEdgePolylineDFS != null) {
			// if we already draw a polyline for maxEdge, since we found a larger edge, just remove previous one
			maxEdgePolylineDFS.setMap(null);
		    }

		    maxDistanceDfs = distance;
		    maxEdgeDfs  = waypoints[top].edgeList[i];


		}


		printList(stack);
		document.getElementById('queueOrStack').innerHTML = "Stack : " + listToString(stack);
		setTimeout(processStack, delay);
		return;
	    }
	}
	// being here means that we didn't find any adjacent of top node that is not visited,
	// so we are done with the top node, and we have to remove it from the top of stack, and coninute processing the stack.

	stack.pop();
	markers[top].setMap(map);
	markers[top].setIcon({path: google.maps.SymbolPath.CIRCLE,
			      scale: 3,
			      zIndex: google.maps.Marker.MAX_ZINDEX + 1,
			      fillColor: 'grey',
			      strokeColor: 'grey'});
	markers[top].setZIndex( 1E9 );


	printList(stack);
	document.getElementById('queueOrStack').innerHTML = "Stack : " + listToString(stack);
	setTimeout(processStack, delay);
    } else {
	document.getElementById('waypoint' + top).style.backgroundColor="yellow";
	// markers[top].setMap(map);
	// markers[top].setIcon({path: google.maps.SymbolPath.CIRCLE,
	// 	scale: 6,
	// 	zIndex: google.maps.Marker.MAX_ZINDEX + 1,
	// 	fillColor: 'yellow',
	// 	strokeColor: 'yellow'});

	visitedDfs[top] = true;
	setTimeout(processStack, delay);
    }
}

function startConvexHull(){
    calculateConvexHull();
}


var polyline;

function calculateConvexHull() {
    if (polyline) polyline.setMap(null);
    p = [];
    for (var i=0; i < markers.length; i++) {
	p.push(markers[i].getPosition());
    }
    p.sort(sortPointY);
    p.sort(sortPointX);
    setTimeout(DrawHull, delay);
}

function DrawHull() {
    hullPoints = [];
    chainHull_2D(p, p.length, hullPoints );
    polyline = new google.maps.Polygon({
	map: map,
	paths:hullPoints,
	fillColor:"#FF0000",
	strokeWidth:2,
	fillOpacity:0.5,
	strokeColor:"#0000FF",
	strokeOpacity:0.5
    });
}

function sortPointX(a, b) {
    return a.lng() - b.lng();
}
function sortPointY(a, b) {
    return a.lat() - b.lat();
}

function isLeft(P0, P1, P2) {
    return (P1.lng() - P0.lng()) * (P2.lat() - P0.lat()) - (P2.lng() - P0.lng()) * (P1.lat() - P0.lat());
}
//===================================================================
// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
//
//     Input:  P[] = an array of 2D points
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]


function chainHull_2D(P, n, H) {
    // the output array H[] will be used as the stack
    var bot = 0,
    top = (-1); // indices for bottom and top of the stack
    var i; // array scan index
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0,
    minmax;

    var xmin = P[0].lng();
    for (i = 1; i < n; i++) {
	if (P[i].lng() != xmin) {
	    break;
	}
    }

    minmax = i - 1;
    if (minmax == n - 1) { // degenerate case: all x-coords == xmin
	H[++top] = P[minmin];
	if (P[minmax].lat() != P[minmin].lat()) // a nontrivial segment
	    H[++top] = P[minmax];
	H[++top] = P[minmin]; // add polygon endpoint
	return top + 1;
    }

    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n - 1;
    var xmax = P[n - 1].lng();
    for (i = n - 2; i >= 0; i--) {
	if (P[i].lng() != xmax) {
	    break;
	}
    }
    maxmin = i + 1;

    // Compute the lower hull on the stack H
    H[++top] = P[minmin]; // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin) {
	// the lower line joins P[minmin] with P[maxmin]
	if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
	    continue; // ignore P[i] above or on the lower line
	}

	while (top > 0) { // there are at least 2 points on the stack
	    // test if P[i] is left of the line at the stack top
	    if (isLeft(H[top - 1], H[top], P[i]) > 0) {
		break; // P[i] is a new hull vertex
	    }
	    else {
		top--; // pop top point off stack
	    }
	}

	H[++top] = P[i]; // push P[i] onto stack
    }

    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin) { // if distinct xmax points
	H[++top] = P[maxmax]; // push maxmax point onto stack
    }

    bot = top; // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax) {
	// the upper line joins P[maxmax] with P[minmax]
	if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
	    continue; // ignore P[i] below or on the upper line
	}

	while (top > bot) { // at least 2 points on the upper stack
	    // test if P[i] is left of the line at the stack top
	    if (isLeft(H[top - 1], H[top], P[i]) > 0) {
		break;  // P[i] is a new hull vertex
	    }
	    else {
		top--; // pop top point off stack
	    }
	}

	H[++top] = P[i]; // push P[i] onto stack
    }

    if (minmax != minmin) {
	H[++top] = P[minmin]; // push joining endpoint onto stack
    }

    return top + 1;
}
function getObj(elementID){
    return document.getElementById(elementID);
}



// JS debug window by Mike Maddox from
// http://javascript-today.blogspot.com/2008/07/how-about-quick-debug-output-window.html
var DBG = {
    write : function(txt){
	if (!window.dbgwnd){
	    window.dbgwnd = window.open("","debug","status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=1,width=600,height=250");
	    window.dbgwnd.document.write('<html><head></head><body style="background-color:black"><div id="main" style="color:green;font-size:12px;font-family:Courier New;"></div></body></html>');
	}
	var x = window.dbgwnd.document.getElementById("main");
	this.line=(this.line==null)?1:this.line+=1;
	txt=this.line+': '+txt;
	if (x.innerHTML == ""){
	    x.innerHTML = txt;
	}
	else {
	    x.innerHTML = txt + "<br/>" + x.innerHTML;
	}
    }
}
