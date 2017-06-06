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
// boolean to indicate if a simulation in progress is paused
var pause = false;


// array of objects that define color codes from names in the DB
var colorCodes = new Array();
colorCodes[0] = {
    name: "blue",
    unclinched: "rgb(100,100,255)",
    clinched: "rgb(0,0,255)"
};
colorCodes[1] = {
    name: "brown",
    unclinched: "rgb(153,152,102)",
    clinched: "rgb(153,102,0)"
};
colorCodes[2] = {
    name: "red",
    unclinched: "rgb(255,100,100)",
    clinched: "rgb(255,0,0)"
};
colorCodes[3] = {
    name: "yellow",
    unclinched: "rgb(255,255,128)",
    clinched: "rgb(225,225,0)"
};
colorCodes[4] = {
    name: "teal",
    unclinched: "rgb(100,200,200)",
    clinched: "rgb(0,200,200)"
};
colorCodes[5] = {
    name: "green",
    unclinched: "rgb(100,255,100)",
    clinched: "rgb(0,255,0)"
};
colorCodes[6] = {
    name: "magenta",
    unclinched: "rgb(255,100,255)",
    clinched: "rgb(255,0,255)"
};

// array of custom color codes to be pulled from query string parameter "colors="
var customColorCodes = new Array();

// algorithm visualization color settings and other parameters
var visualSettings = {
    // first, some used by many algorithms
    undiscovered: {
        color: "#202020",
        textColor: "#e0e0e0",
        scale: 2
    },
    visiting: {
        color: "yellow",
        textColor: "black",
        scale: 6
    },
    leader: {
        color: "red",
        textColor: "white",
        scale: 6
    },
    discarded: {
        color: "#a0a0a0",
        textColor: "black",
        scale: 2
    },
    // specific to vertex search
    northLeader: {
        color: "#8b0000",
        textColor: "white",
        scale: 6
    },
    southLeader: {
        color: "#ee0000",
        textColor: "white",
        scale: 6
    },
    eastLeader: {
        color: "#000080",
        textColor: "white",
        scale: 6
    },
    westLeader: {
        color: "#551A8B",
        textColor: "white",
        scale: 6
    },
    shortLabelLeader: {
        color: "#654321",
        textColor: "white",
        scale: 6
    },
    longLabelLeader: {
        color: "#006400",
        textColor: "white",
        scale: 6
    },
    // specific to graph traversals
    startVertex: {
        color: "purple",
        textColor: "white",
        scale: 6
    },
    discoveredEarlier: {
        color: "red",
        textColor: "white",
        scale: 4
    },
    visitedEarlier: {
        color: "orange",
        textColor: "black",
        scale: 4
    },
    spanningTree: {
        color: "#0000a0",
        textColor: "white",
        scale: 2
    },
    discovered: {
        color: "#00a000",
        textColor: "white",
        scale: 4
       },
	hoverV: {
		color: "#a0036b",
		textColor: "white",
		scale: 6
	}
};

function hoverV (e, i){
	vicon = markers[i].getIcon();
	vcolor = getObj("waypoint"+i).style.backgroundColor;
	vtext = getObj("waypoint"+i).style.color;
	updateMarkerAndTable(i, visualSettings.hoverV, 0, false);
}

function hoverEndV (e, i){
	markers[i].setIcon(vicon);
	getObj("waypoint"+i).style.backgroundColor = vcolor;
	getObj("waypoint"+i).style.color = vtext;
}

var vcolor, vtext, vicon;

var infowindow = new google.maps.InfoWindow();

// some map options, from http://cmap.m-plex.com/hb/maptypes.js by Timothy Reichard

var MapnikOptions = {
    alt: "Show Mapnik road map tiles from OpenStreetMap.org",
    getTileUrl: getMapnikTileURL,
    maxZoom: 18,
    minZoom: 0,
    name: "Mapnik",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function getMapnikTileURL(point, zoom) {
    return 'http://tile.openstreetmap.org/' + zoom + '/' + point.x + '/' + point.y + '.png';
}

var OpenStreetMapDEOptions = {
    alt: "Show OpenStreetMapDE road map tiles from OpenStreetMap.org",
    getTileUrl: getOpenStreetMapDEURL,
    maxZoom: 18,
    minZoom: 0,
    name: "DE",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function getOpenStreetMapDEURL(point, zoom) {
    return 'http://tile.openstreetmap.de/tiles/osmde/' + zoom + '/' + point.x + '/' + point.y + '.png';
}

var EsriOptions = {
    alt: "Show Esri road map tiles from OpenStreetMap.org",
    getTileUrl: EsriURL,
    maxZoom: 18,
    minZoom: 0,
    name: "Esri",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function EsriURL(point, zoom) {
    return 'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/' + zoom + '/' + point.y + '/' + point.x;
}

var OpenStreetMapDEOptions = {
    alt: "Show OpenStreetMapDE road map tiles from OpenStreetMap.org",
    getTileUrl: getOpenStreetMapDEURL,
    maxZoom: 18,
    minZoom: 0,
    name: "DE",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function getOpenStreetMapDEURL(point, zoom) {
    return 'http://tile.openstreetmap.de/tiles/osmde/' + zoom + '/' + point.x + '/' + point.y + '.png';
}

//HERE map tiles
var HEREOptions = {
    alt: "Show wego HERE road map tiles from https://wego.here.com",
    getTileUrl: HEREURL,
    maxZoom: 18,
    minZoom: 0,
    name: "HERE",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function HEREURL(point, zoom) {
    return 'https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/' + zoom + '/' + point.x + '/' + point.y + '/256/png8?app_id=VX6plk5zCW0wzrNcN64O&app_code=LcZFksQAhfg7rvZvcZ1lqw';
}

var MQOpenMapOptions = {
    alt: "Show Mapquest Open Map road map tiles based on OpenStreetMap.org data",
    getTileUrl: getMQOpenMapTileURL,
    maxZoom: 18,
    minZoom: 0,
    name: "MQOpenMap",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function getMQOpenMapTileURL(point, zoom) {
    var subdomain = Math.floor(Math.random() * (4 - 1 + 1)) + 1; // Request tile from random subdomain.
    return 'http://otile' + subdomain + '.mqcdn.com/tiles/1.0.0/map/' + zoom + '/' + point.x + '/' + point.y + '.jpg';
    //return 'http://cmap.m-plex.com/hb/ymaptile.php?t=m&s=mq&x=' + point.x + '&y=' + point.y + '&z=' + zoom;
}

var MQOpenSatOptions = {
    alt: "Show Mapquest Open Map satellite imagery tiles based on OpenStreetMap.org data",
    getTileUrl: getMQOpenSatTileURL,
    maxZoom: 18,
    minZoom: 0,
    name: "MQOpenSat",
    opacity: 1,
    tileSize: new google.maps.Size(256, 256)
};

function getMQOpenSatTileURL(point, zoom) {
    var subdomain = Math.floor(Math.random() * (4 - 1 + 1)) + 1; // Request tile from random subdomain.
    return 'http://otile' + subdomain + '.mqcdn.com/tiles/1.0.0/sat/' + zoom + '/' + point.x + '/' + point.y + '.jpg';
    //return 'http://cmap.m-plex.com/hb/ymaptile.php?t=s&s=mq&x=' + point.x + '&y=' + point.y + '&z=' + zoom;
}

var BlankOptions = {
    alt: "Show a blank background",
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
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the center of the intersection
    anchor: new google.maps.Point(8, 8)
};

// loadmap constructs and sets up the initial map
function loadmap() {
    //if (document.getElementById("bingCheck").checked == false) {
    //document.getElementById("bingCheck").checked = false;
    var typeMQOpenMap = new google.maps.ImageMapType(MQOpenMapOptions);
    var typeMQOpenSat = new google.maps.ImageMapType(MQOpenSatOptions);
    var typeMapnik = new google.maps.ImageMapType(MapnikOptions);
    var typeBlank = new google.maps.ImageMapType(BlankOptions);
    var typeOpenStreetMapDE = new google.maps.ImageMapType(OpenStreetMapDEOptions);
    var typeEsri = new google.maps.ImageMapType(EsriOptions);
    var typeHERE = new google.maps.ImageMapType(HEREOptions);

    var maptypelist = ['Mapnik', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'Blank', 'DE', 'Esri', 'HERE'];
    var maptypecontroloptions = {
        mapTypeIds: maptypelist,
        position: google.maps.TOP_RIGHT,
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    };
    //var mapopt = {center: new google.maps.LatLng(42.664529, -73.786470), zoom: 12, mapTypeId: 'Mapnik', mapTypeControl: true, mapTypeControlOptions: maptypecontroloptions, streetViewControl: true, disableDefaultUI: true, panControl: true, zoomControl: true, scaleControl: true, overviewMapControl: true, keyboardShortcuts: true, disableDoubleClickZoom: false};
    // OLD coordinates are Albertus Hall room 400-2 at The College of Saint Rose
    //var mapopt = {center: new google.maps.LatLng(42.664529, -73.786470), zoom: 16, mapTypeControl: true, mapTypeControlOptions: maptypecontroloptions};

    // coordinates are Roger Bacon 321 at Siena College
    var mapopt = {
        center: new google.maps.LatLng(42.719450, -73.752063),
        zoom: 16,
        mapTypeControl: true,
        mapTypeControlOptions: maptypecontroloptions
    };

    map = new google.maps.Map(document.getElementById("map"), mapopt);

    map.mapTypes.set('MQOpenMap', typeMQOpenMap);
    map.mapTypes.set('MQOpenSat', typeMQOpenSat);
    map.mapTypes.set('Mapnik', typeMapnik);
    map.mapTypes.set('Blank', typeBlank);
    map.mapTypes.set('DE', typeOpenStreetMapDE);
    map.mapTypes.set('Esri', typeEsri);
    map.mapTypes.set('HERE', typeHERE);
    //}
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
function updateMap() {
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
            optimized: false, // attempt to deal with zIndex
            title: waypoints[i].label,
            icon: intersectionimage
        });
        if (showMarkers && (showHidden || waypoints[i].visible)) {
            AddMarker(markers[i], markerinfo[i], i);
        }
        bounds.extend(polypoints[i]);
    }

    var midlat = (minlat + maxlat) / 2;
    var midlon = (minlon + maxlon) / 2;

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
            } else {
                numPoints = graphEdges[i].via.length / 2 + 2;
            }
            var edgePoints = new Array(numPoints);
            var v1 = graphEdges[i].v1;
            var v2 = graphEdges[i].v2;
            //	    DBG.write("Adding edge " + i + " from " + v1 + "(" + waypoints[v1].lat + "," + waypoints[v1].lon + ") to " + v2 + "(" + waypoints[v2].lat + "," + waypoints[v2].lon + ")");
            edgePoints[0] = new google.maps.LatLng(waypoints[v1].lat, waypoints[v1].lon);
            nextPoint = 1;
            if (graphEdges[i].via != null) {
                for (var j = 0; j < graphEdges[i].via.length; j += 2) {
                    edgePoints[nextPoint] = new google.maps.LatLng(graphEdges[i].via[j], graphEdges[i].via[j + 1]);
                    nextPoint++;
                }
            }
            edgePoints[nextPoint] = new google.maps.LatLng(waypoints[v2].lat, waypoints[v2].lon);
            connections[i] = new google.maps.Polyline({
                path: edgePoints,
                strokeColor: "#0000FF",
                strokeWeight: 10,
                strokeOpacity: 0.4,
                map: map
            });

            // if we have adjacency lists, let's also remember our Polyline
            // in the GraphEdge
            for (var edgeNum = 0; edgeNum < waypoints[v1].edgeList.length; edgeNum++) {
                var thisEdge = waypoints[v1].edgeList[edgeNum];
                if ((thisEdge.v1 == v2) || (thisEdge.v2 == v2)) {
                    thisEdge.connection = connections[i];
                    break;
                }
            }
        }
        google.maps.event.clearListeners(map, 'zoom_changed');
        google.maps.event.addListener(map, 'zoom_changed', zoomChange);
        zoomChange();
    } else if (usingAdjacencyLists) {
        var edgeNum = 0;
        for (var i = 0; i < waypoints.length; i++) {
            for (var j = 0; j < waypoints[i].edgeList.length; j++) {
                var thisEdge = waypoints[i].edgeList[j];
                // avoid double plot by only plotting those with v1 as i
                if (thisEdge.v1 == i) {
                    var numPoints;
                    if (thisEdge.via == null) {
                        numPoints = 2;
                    } else {
                        numPoints = thisEdge.via.length / 2 + 2;
                    }
                    var edgePoints = new Array(numPoints);
                    edgePoints[0] = new google.maps.LatLng(waypoints[thisEdge.v1].lat, waypoints[thisEdge.v1].lon);
                    nextPoint = 1;
                    if (thisEdge.via != null) {
                        for (var p = 0; p < thisEdge.via.length; p += 2) {
                            edgePoints[nextPoint] = new google.maps.LatLng(thisEdge.via[p], thisEdge.via[p + 1]);
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
                    connections[edgeNum] = new google.maps.Polyline({
                        path: edgePoints,
                        strokeColor: color,
                        strokeWeight: 10,
                        strokeOpacity: 0.4,
                        map: map
                    });
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
                if (route == newRouteIndices.length - 1) {
                    end = waypoints.length - 1;
                } else {
                    end = newRouteIndices[route + 1] - 1;
                }
                //DBG.write("route = " + route + ", start = " + start + ", end = " + end);
                // support for clinch colors from systems.csv
                var unclinchedColor = "rgb(200,200,200)"; //"#cccccc";
                var clinchedColor = "rgb(255,128,128)"; //"#ff8080";
                for (var c = 0; c < colorCodes.length; c++) {
                    if (colorCodes[c].name == routeColor[route]) {
                        unclinchedColor = colorCodes[c].unclinched;
                        clinchedColor = colorCodes[c].clinched;
                    }
                }
                // override with tier or system colors given in query string if they match
                for (var c = 0; c < customColorCodes.length; c++) {
                    if (customColorCodes[c].name == ("tier" + routeTier[route])) {
                        unclinchedColor = customColorCodes[c].unclinched;
                        clinchedColor = customColorCodes[c].clinched;
                    }
                    if (customColorCodes[c].name == routeSystem[route]) {
                        unclinchedColor = customColorCodes[c].unclinched;
                        clinchedColor = customColorCodes[c].clinched;
                    }
                }
                for (var i = start; i < end; i++) {
                    var zIndex = 10 - routeTier[route];
                    var edgePoints = new Array(2);
                    edgePoints[0] = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
                    edgePoints[1] = new google.maps.LatLng(waypoints[i + 1].lat, waypoints[i + 1].lon);
                    var segmentLength = Mileage(waypoints[i].lat,
                        waypoints[i].lon,
                        waypoints[i + 1].lat,
                        waypoints[i + 1].lon);
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
                    connections[nextSegment] = new google.maps.Polyline({
                        path: edgePoints,
                        strokeColor: color,
                        strokeWeight: weight,
                        strokeOpacity: opacity,
                        zIndex: zIndex,
                        map: map
                    });
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
        } else {
            // single route
            for (var i = 0; i < segments.length; i++) {
                var edgePoints = new Array(2);
                edgePoints[0] = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
                edgePoints[1] = new google.maps.LatLng(waypoints[i + 1].lat, waypoints[i + 1].lon);
                var segmentLength = Mileage(waypoints[i].lat,
                    waypoints[i].lon,
                    waypoints[i + 1].lat,
                    waypoints[i + 1].lon);
                totalMiles += segmentLength;
                var color = "#cccccc";
                if (segments[i] == clinched[nextClinchedCheck]) {
                    color = "#ff8080";
                    nextClinchedCheck++;
                    clinchedMiles += segmentLength;
                }
                connections[i] = new google.maps.Polyline({
                    path: edgePoints,
                    strokeColor: color,
                    strokeWeight: 10,
                    strokeOpacity: 0.75,
                    map: map
                });
            }
        }
        if (document.getElementById('controlboxinfo') != null) {
            document.getElementById('controlboxinfo').innerHTML = ""; //clinchedMiles.toFixed(2) + " of " + totalMiles.toFixed(2) + " miles (" + (clinchedMiles/totalMiles*100).toFixed(1) + "%) clinched by " + traveler + ".";
        }
    } else if (genEdges) {
        connections[0] = new google.maps.Polyline({
            path: polypoints,
            strokeColor: "#0000FF",
            strokeWeight: 10,
            strokeOpacity: 0.75,
            map: map
        });
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
    //DBG.write("zoomChange: Zoom level " + level + ", newWeight = " + newWeight);
    for (var i = 0; i < connections.length; i++) {
        //connections[i].setMap(null);
        connections[i].setOptions({
            strokeWeight: newWeight
        });
    }
}

function AddMarker(marker, markerinfo, i) {

    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function () {
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

    return '<p style="line-height:160%;"><span style="font-size:24pt;">' + wpt.label + '</span><br><b>Waypoint ' + (i + 1) + '<\/b><br><b>Coords.:<\/b> ' + wpt.lat + '&deg;, ' + wpt.lon + '&deg;<\/p>';

}

// compute distance in miles between two lat/lon points
function Mileage(lat1, lon1, lat2, lon2) {
    if (lat1 == lat2 && lon1 == lon2)
        return 0.;

    var rad = 3963.;
    var deg2rad = Math.PI / 180.;
    var ang = Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * Math.cos((lon1 - lon2) * deg2rad) + Math.sin(lat1 * deg2rad) * Math.sin(lat2 * deg2rad);
    return Math.acos(ang) * 1.02112 * rad;
}

// compute distance in feet between two lat/lon points
function Feet(lat1, lon1, lat2, lon2) {
    if (lat1 == lat2 && lon1 == lon2)
        return 0.;

    var rad = 3963.;
    var deg2rad = Math.PI / 180.;
    var ang = Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * Math.cos((lon1 - lon2) * deg2rad) + Math.sin(lat1 * deg2rad) * Math.sin(lat2 * deg2rad);
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
    } else {
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
    } else {
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


// pause button callback, simply sets pause to true, other functions
// deal with this as appropriate
function pauseSimulation() {

    pause = true;
}

// function to set the waypoint color, scale, and table entry
// using an entry passed in from the visualSettings
// optionally hide also by setting display to none
function updateMarkerAndTable(waypointNum, vs, zIndex, hideTableLine) {

    markers[waypointNum].setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: vs.scale,
        fillColor: vs.color,
        strokeColor: vs.color
    });
    markers[waypointNum].setZIndex(google.maps.Marker.MAX_ZINDEX + zIndex);

    document.getElementById('waypoint' + waypointNum).style.backgroundColor = vs.color;
    document.getElementById('waypoint' + waypointNum).style.color = vs.textColor;
    if (hideTableLine) {
        document.getElementById('waypoint' + waypointNum).style.display = "none";
    }
}

// function to create the table entry for the leader for extreme points
function extremePointLeaderString(waypointNum, vs) {

    return '<span style="color:' +
        vs.textColor + '; background-color:' +
        vs.color + '"> #' + waypointNum +
        ' (' + waypoints[waypointNum].lat + ',' +
        waypoints[waypointNum].lon +
        ') ' + waypoints[waypointNum].label + '</span>';
}

// function to create the table entry for the leader for label-based
// comparisons
function labelLeaderString(waypointNum, vs) {

    return '<span style="color:' +
        vs.textColor + '; background-color:' +
        vs.color + '"> #' + waypointNum +
        ' (length ' + waypoints[waypointNum].label.length + ') ' +
        waypoints[waypointNum].label + '</span>';
}


// some variables to support our vertex search with timers
var nextToCheck;
var northIndex = -1;
var southIndex = -1;
var eastIndex = -1;
var westIndex = -1;
var shortIndex = -1;
var longIndex = -1;

// initialize a vertex-based search, called by the start button callback
function startVertexSearch() {

    // if we are paused and the start button is pressed, we "unpause"
    if (pause) {
        pause = false;
        continueVertexSearch();
        return;
    }

    var statusLine = document.getElementById("status");
    // statusLine.innerHTML = "Preparing for Extreme Point Search Visualization";
    // in the future, make sure we have appropriate data in the system
    // before executing anything here

    // start by showing all existing markers, even hidden
    for (var i = 0; i < waypoints.length; i++) {
        markers[i].setMap(map);
        updateMarkerAndTable(i, visualSettings.undiscovered, 0, false);
    }
    // we don't need edges here, so we remove those
    for (var i = 0; i < connections.length; i++) {
        connections[i].setMap(null);
    }
    //we don't need connections table here, so we remove those
    var cTable = document.getElementById("connection");
    cTable.innerHTML = "";


    // this doesn't really make sense for this search...
    // var startingPoint = document.getElementById("startPoint").value;


    // start the search by initializing with the value at pos 0
    updateMarkerAndTable(0, visualSettings.visiting, 40, false);

    nextToCheck = 0;
	
	var algorithmsTable = document.getElementById('AlgorithmsTable');
	var algorithmsTbody = algorithmsTable.children[1];
	var infoBox;
	var infoBoxtr;
	var infoid = "";
	for (var i = 1; i<7; i++){
		infoBox = document.createElement('td');
		infoBoxtr= document.createElement('tr');
		infoid = "info"+i;
		infoBox.setAttribute('id',infoid);
		infoBoxtr.appendChild(infoBox);
		algorithmsTbody.appendChild(infoBoxtr);
	}
	

    // enable pause button
    //document.getElementById("pauseRestart").disabled = false;
    setTimeout(continueVertexSearch, delay);
}


// do an iteration of vertex-based search
function continueVertexSearch() {

    // if the simulation is paused, we can do nothing, as this function
    // will be called again when we restart
    if (pause) {
        return;
    }

    // keep track of points that were leaders but got beaten to be
    // colored grey if they are no longer a leader in any category
    var defeated = [];

    // first we finish the previous point to see if it's a new winner,
    // and if necessary downgrade anyone who was beaten by this one

    // special case of first checked
    if (nextToCheck == 0) {
        // this was our first check, so this point wins all to start
        northIndex = 0;
        southIndex = 0;
        eastIndex = 0;
        westIndex = 0;
        shortIndex = 0;
        longIndex = 0;
        foundNewLeader = true;
    }
    // we have to do real work to see if we have new winners
    else {
        // keep track of whether this point is a new leader
        var foundNewLeader = false;

        // check north
        if (waypoints[nextToCheck].lat > waypoints[northIndex].lat) {
            foundNewLeader = true;
            defeated.push(northIndex);
            northIndex = nextToCheck;
        }
        // check south
        if (waypoints[nextToCheck].lat < waypoints[southIndex].lat) {
            foundNewLeader = true;
            defeated.push(southIndex);
            southIndex = nextToCheck;
        }
        // check east
        if (waypoints[nextToCheck].lon > waypoints[eastIndex].lon) {
            foundNewLeader = true;
            defeated.push(eastIndex);
            eastIndex = nextToCheck;
        }
        // check west
        if (waypoints[nextToCheck].lon < waypoints[westIndex].lon) {
            foundNewLeader = true;
            defeated.push(westIndex);
            westIndex = nextToCheck;
        }

        // check label lengths
        if (waypoints[nextToCheck].label.length < waypoints[shortIndex].label.length) {
            foundNewLeader = true;
            defeated.push(shortIndex);
            shortIndex = nextToCheck;
        }

        if (waypoints[nextToCheck].label.length > waypoints[longIndex].label.length) {
            foundNewLeader = true;
            defeated.push(longIndex);
            longIndex = nextToCheck;
        }

    }

    // any point that was a leader but is no longer gets discarded,
    while (defeated.length > 0) {
        var toCheck = defeated.pop();
        if (toCheck != northIndex &&
            toCheck != southIndex &&
            toCheck != eastIndex &&
            toCheck != westIndex &&
            toCheck != longIndex &&
            toCheck != shortIndex) {

            updateMarkerAndTable(toCheck, visualSettings.discarded,
                20, true);
        }
    }

    // the leader in each category is now highlighted in the tables and
    // on the map

    // TODO: handle better the situations where the same vertex
    // becomes the leader in multiple categories, as right now
    // it just gets colored with the last in this list
    if (foundNewLeader) {
	
	// this work will often be redundant but it's probably easier
	// than trying to avoid it
	
	// north
	updateMarkerAndTable(northIndex, visualSettings.northLeader, 
			     40, false);
	infoBox = document.getElementById('info1');
	infoBox.innerHTML = 'North extreme:<br />' +
	    extremePointLeaderString(northIndex, visualSettings.northLeader);
	
	// south
	updateMarkerAndTable(southIndex, visualSettings.southLeader,
			     40, false);
	infoBox = document.getElementById('info2');
	infoBox.innerHTML = "South extreme:<br />" +
	    extremePointLeaderString(southIndex, visualSettings.southLeader);
	
	// east
	updateMarkerAndTable(eastIndex, visualSettings.eastLeader,
			     40, false);
        infoBox = document.getElementById('info3');
        infoBox.innerHTML = "East extreme:<br />" +
            extremePointLeaderString(eastIndex, visualSettings.eastLeader);

        // west
        updateMarkerAndTable(westIndex, visualSettings.westLeader,
            40, false);
        infoBox = document.getElementById('info4');
        infoBox.innerHTML = "West extreme:<br />" +
            extremePointLeaderString(westIndex, visualSettings.westLeader);

        // shortest
        updateMarkerAndTable(shortIndex, visualSettings.shortLabelLeader,
            40, false);
        infoBox = document.getElementById('info5');
        infoBox.innerHTML = "Shortest vertex label:<br />" +
            labelLeaderString(shortIndex, visualSettings.shortLabelLeader);

        // longest
        updateMarkerAndTable(longIndex, visualSettings.longLabelLeader,
            40, false);
        infoBox = document.getElementById('info6');
        infoBox.innerHTML = "Longest vertex label:<br />" +
            labelLeaderString(longIndex, visualSettings.longLabelLeader);
    } else {
        // we didn't have a new leader, just discard this one
        updateMarkerAndTable(nextToCheck, visualSettings.discarded,
            20, true);
    }

    document.getElementById('algorithmStatus').innerHTML =
        'Visiting: <span style="color:' + visualSettings.visiting.textColor +
        '; background-color:' + visualSettings.visiting.color + '"> ' +
        nextToCheck + '</span>, ' + (markers.length - nextToCheck - 1) +
        ' remaining';

    // prepare for next iteration
    nextToCheck++;
    if (nextToCheck < markers.length) {
        updateMarkerAndTable(nextToCheck, visualSettings.visiting,
            30, false);

        setTimeout(continueVertexSearch, delay);
    } else {
        document.getElementById('algorithmStatus').innerHTML =
            "Done! Visited " + markers.length + " waypoints.";
    }
}

// **********************************************************************
// EDGE SEARCH CODE
// **********************************************************************

var minDistance = 9999999;
var maxDistance = -999999;
var edgeMin = null;
var edgeMax = null;
var currentEdgeIndex = 0;
var shortestELabel;
var longestELabel;

function startEdgeSearch() {

    if (pause) {
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
	var algorithmsTable = document.getElementById('AlgorithmsTable');
	var algorithmsTbody = algorithmsTable.children[1];
	var infoid = "info1";
	var infoBox = document.createElement('td');
	var infoBoxtr= document.createElement('tr');
	infoBox.setAttribute('id',infoid);
	infoBoxtr.appendChild(infoBox);
	algorithmsTbody.appendChild(infoBoxtr);
    // document.getElementById('algorithmStatus').innerHTML = 'Checking: <span style="color:yellow">0</span>';
    setTimeout(continueEdgeSearch, delay);

}

function continueEdgeSearch() {
    if (pause) {
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

	document.getElementById('info1').innerHTML = "Shortest Edge label: " + shortestELabel + "<br>  Longest Edge label: " + longestELabel;
	console.log("shortest Edge label: " + shortestELabel);
	console.log("Longest Edge label: " + longestELabel);
	return;
    }
    var edge = graphEdges[currentEdgeIndex];
    var distance = Feet(waypoints[edge.v1].lat, waypoints[edge.v1].lon,
        waypoints[edge.v2].lat, waypoints[edge.v2].lon);

    if (distance < minDistance) {
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
    initEdgePoints[0] = new google.maps.LatLng(waypoints[edge.v1].lat, waypoints[edge.v1].lon);
    initEdgePoints[1] = new google.maps.LatLng(waypoints[edge.v2].lat, waypoints[edge.v2].lon);
    new google.maps.Polyline({
        path: initEdgePoints,
        strokeColor: '#FFFF00',
        strokeWeight: 10,
        strokeOpacity: 1,
        map: map
    });
    var firstNode = Math.min(edge.v1, edge.v2);
    var secondNode = Math.max(edge.v1, edge.v2);
    document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = "grey";
    currentEdgeIndex += 1;
    setTimeout(continueEdgeSearch, delay);
}

// ********************************************************************
// graph traversals
// ********************************************************************

// this first variable is the stack for DFS, queue for BFS, could be other
//  for future enhancements
// elements here are objects with fields vIndex for the index of this vertex
// and connection is the Polyline connection followed to get here (so it
// can be colored appropriately when the element comes out)
var discoveredVertices = [];

// what will we call this structure?
var discoveredVerticesName;

// array of booleans to indicate if we've visited each vertex
var visitedVertices = [];

// vertex visited on the previous iteration to be updated
var lastVisitedVertex;

// where did we start?
var startingVertex;

// what is our traversal discipline, i.e., is discoveredVertices to be
// treated as a stack, queue, or something else
// values are currently "BFS" or "DFS" or "RFS"
var traversalDiscipline;

// initial vertex color coding and zindex offsets for graph traversals:
// start vertex: green/10
// undiscovered: white/0
// in discovered list and not visited: purple/5
// in discovered list but already visited: blue/5
// not in discovered list but already visited: grey/1
// just removed from discovered list and visiting: yellow/10
// just removed from discovered list but already visited: orange/10

// initial edge color coding for graph traversals:
// undiscovered edge: white
// edge leading to a vertex in the discovered list: purple
// edge that is part of the spanning tree: red
// edge that was discovered but ended up not in spanning tree: grey

// initialize graph traversal process
function startGraphTraversal(discipline) {

    traversalDiscipline = discipline;
    if (discipline == "BFS") {
        discoveredVerticesName = "Queue";
    } else if (discipline == "DFS") {
        discoveredVerticesName = "Stack";
    } else if (discipline == "RFS") {
        discoveredVerticesName = "List";
    }

    // if we are paused
    if (pause) {
        pause = false;
        continueGraphTraversal();
        return;
    }

    var cTable = document.getElementById("connection");
    cTable.innerHTML = "";

    // initialize our visited array
    visited = new Array(waypoints.length).fill(false);

    // replace all markers with white circles
    for (var i = 0; i < markers.length; i++) {
        updateMarkerAndTable(i, visualSettings.undiscovered, 0, false);
    }

    // color all edges white also
    for (var i = 0; i < connections.length; i++) {
        connections[i].setOptions({
            strokeColor: visualSettings.undiscovered.color,
            strokeOpacity: 0.6
        });
    }

    // vertex index to start the traversal
    startingVertex = document.getElementById("startPoint").value;

    // initialize the process with this value
    discoveredVertices.push({
        vIndex: startingVertex,
        connection: null
    });

    updateMarkerAndTable(startingVertex, visualSettings.startVertex, 10, false);

    // nothing to update this first time
    lastVisitedVertex = -1;
    setTimeout(continueGraphTraversal, delay);
}

// function to see if a vertex with the given index is in discoveredVertices
function discoveredVerticesContainsVertex(vIndex) {

    for (var i = 0; i < discoveredVertices.length; i++) {
        if (discoveredVertices[i].vIndex == vIndex) {
            return true;
        }
    }
    return false;
}

// function to process one vertex from the discoveredVertices in the
// graph traversal process
function continueGraphTraversal() {

    // if we're paused, do nothing for now
    if (pause) {
        return;
    }

    // maybe we have a last visited vertex to update
    if (lastVisitedVertex != -1) {
        if (lastVisitedVertex == startingVertex) {
            // always leave the starting vertex colored appropriately
            // and in the table
            updateMarkerAndTable(startingVertex, visualSettings.startVertex,
                10, false);
        } else if (!discoveredVerticesContainsVertex(lastVisitedVertex)) {
            // not in the list, this vertex gets marked as in the spanning tree
            updateMarkerAndTable(lastVisitedVertex, visualSettings.spanningTree,
                1, false);
        } else {
            // still in the list, color with the "discoveredEarlier"  style
            updateMarkerAndTable(lastVisitedVertex, visualSettings.discoveredEarlier,
                5, false);
        }
    }
    // maybe we're done
    if (discoveredVertices.length == 0) {
        //console.log("Done!");
        return;
    }

    // select the next vertex to visit and remove it from the
    // discoveredVertices list
    var nextToVisit;
    if (traversalDiscipline == "BFS") {
        nextToVisit = discoveredVertices.shift();
    } else if (traversalDiscipline == "DFS") {
        nextToVisit = discoveredVertices.pop();
    } else if (traversalDiscipline == "RFS") {
        var index = Math.floor(Math.random() * discoveredVertices.length);
        nextToVisit = discoveredVertices[index];
        discoveredVertices.splice(index, 1);
    }

    lastVisitedVertex = nextToVisit.vIndex;
    var vIndex = nextToVisit.vIndex;

    // now decide what to do with this vertex -- depends on whether it
    // had been previously visited
    if (visited[vIndex]) {

        // we've been here before, but is it still in the list?
        if (discoveredVerticesContainsVertex(vIndex)) {
            // not there anymore, indicated this as visitedEarlier, and
            // will be discarded or marked as discoveredEarlier on the
            // next iteration
            updateMarkerAndTable(vIndex, visualSettings.visitedEarlier,
                4, false);
        } else {
            // still to be seen again, so mark is as discoveredEarlier
            updateMarkerAndTable(vIndex, visualSettings.discoveredEarlier,
                5, false);
        }

        // in either case here, the edge that got us here is not
        // part of the ultimate spanning tree, so it should be the
        // "discoveredEarlier" color
        if (nextToVisit.connection != null) {
            nextToVisit.connection.setOptions({
                strokeColor: visualSettings.discoveredEarlier.color
            });
        }
    }
    // visiting for the first time
    else {

        visited[vIndex] = true;
        updateMarkerAndTable(vIndex, visualSettings.visiting,
            10, false);

        // we used the edge to get here, so let's mark it as such
        if (nextToVisit.connection != null) {
            nextToVisit.connection.setOptions({
                strokeColor: visualSettings.spanningTree.color
            });
        }

        // discover any new neighbors
        var neighbors = getAdjacentPoints(vIndex);
        for (var i = 0; i < neighbors.length; i++) {
            if (!visited[neighbors[i]]) {
                var connection = waypoints[vIndex].edgeList[i].connection;
                discoveredVertices.push({
                    vIndex: neighbors[i],
                    connection: connection
                });
                updateMarkerAndTable(neighbors[i], visualSettings.discovered,
                    5, false);

                // also color the edge we followed to get to this
                // neighbor as the same color to indicate it's a candidate
                // edge followed to find a current discovered but
                // unvisited vertex
                if (connection != null) {
                    connection.setOptions({
                        strokeColor: visualSettings.discovered.color
                    });
                } else {
                    console.log("Unexpected null connection, vIndex=" + vIndex + ", i=" + i);
                }
            }
        }
    }

    // update view of our list
    //printList(queue);
   /* document.getElementById('algorithmStatus').innerHTML = discoveredVerticesName + " (size: " + discoveredVertices.length + ") " + listToVIndexString(discoveredVertices);
    setTimeout(continueGraphTraversal, delay);*/
      if(document.getElementById("showDataStructure").checked){
        var testing123 = makeTable();
        if(testing123 == null){
            //alert("NULL");
        }
       else{  document.getElementById('algorithmStatus').appendChild(testing123);
    }
}
    setTimeout(continueGraphTraversal, delay);

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

function listToVIndexString(items) {
    if (items.length == 0) {
        return "[]";
    } else {
        var line = `[`;
        for (var i = 0; i < items.length; i++) {
            if (i == items.length - 1) {
                line += items[i].vIndex;
            } else {
                line += items[i].vIndex + `, `;
            }

        }
        line += ` ]`;
        return line;
    }

}

function startConvexHull() {
    calculateConvexHull();
}


var polyline;

function calculateConvexHull() {
    if (polyline) polyline.setMap(null);
    p = [];
    for (var i = 0; i < markers.length; i++) {
        p.push(markers[i].getPosition());
    }
    p.sort(sortPointY);
    p.sort(sortPointX);
    setTimeout(DrawHull, delay);
}

function DrawHull() {
    hullPoints = [];
    chainHull_2D(p, p.length, hullPoints);
    polyline = new google.maps.Polygon({
        map: map,
        paths: hullPoints,
        fillColor: "#FF0000",
        strokeWidth: 2,
        fillOpacity: 0.5,
        strokeColor: "#0000FF",
        strokeOpacity: 0.5
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
            } else {
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
                break; // P[i] is a new hull vertex
            } else {
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

function getObj(elementID) {
    return document.getElementById(elementID);
}



// JS debug window by Mike Maddox from
// http://javascript-today.blogspot.com/2008/07/how-about-quick-debug-output-window.html
var DBG = {
    write: function (txt) {
        if (!window.dbgwnd) {
            window.dbgwnd = window.open("", "debug", "status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=1,width=600,height=250");
            window.dbgwnd.document.write('<html><head></head><body style="background-color:black"><div id="main" style="color:green;font-size:12px;font-family:Courier New;"></div></body></html>');
        }
        var x = window.dbgwnd.document.getElementById("main");
        this.line = (this.line == null) ? 1 : this.line += 1;
        txt = this.line + ': ' + txt;
        if (x.innerHTML == "") {
            x.innerHTML = txt;
        } else {
            x.innerHTML = txt + "<br/>" + x.innerHTML;
        }
    }
}

//Creates the TOSLabel's for the different map tiles and appends them to a div which is returned
function TOSLabel(){
	var menubar = document.querySelector(".menubar");
	
	var label = document.createElement("a");
	label.setAttribute("id", "ReferenceLink");
	label.setAttribute("href", "http://tm.teresco.org/credits.php");
	label.innerHTML = "Credits and Sources";
	
	menubar.appendChild(label);
}


var createTable = false;
var showAll = false;

function makeTable(){ 
    var size = discoveredVertices.length-1;
    var showAllSymbol = "-";
    if(size > 10 && !showAll){
        size = 10;
        showAllSymbol="+";
    }
    if(createTable == true){
        var new_tbody = document.createElement("tbody");
        if(discoveredVerticesName == "Stack"){
            for (var i = 0; i <= size ; i++) {      
                var row = document.createElement("tr");
                row.setAttribute("id", "l" + i);
                row.innerHTML = discoveredVertices[discoveredVertices.length-(1+i)].vIndex;
                new_tbody.appendChild(row);
            }
            var row = document.createElement("tr");
            row.setAttribute("id", "l" + i);
            row.innerHTML = showAllSymbol;  
            new_tbody.appendChild(row);
        }
        else if(discoveredVerticesName == "Queue"){
            for (var i = 0; i <= size ; i++) { 
                var col = document.createElement("td");
                col.setAttribute("id", "l" + i);
                if(size>=10 && i == size/2){
                    col.innerHTML = showAllSymbol;
                    if(!showAll){
                        size = discoveredVertices.length-1;
                        i = size-5;
                    }
                }
                else{
                    col.innerHTML = discoveredVertices[i].vIndex;
                }
                new_tbody.appendChild(col);
            }
        }
        var tableBody = document.getElementById("tablebody");
        tableBody.innerHTML = new_tbody.innerHTML;
    }
        else{
            createTable = true;
            var div = document.createElement("div");
            div.setAttribute("id", "makeTable");
    
            var table = document.createElement("table");
            table.setAttribute("id", "table");
            var tableBody = document.createElement("tbody");
            tableBody.setAttribute("id","tablebody");
    
            if(discoveredVerticesName == "Stack"){
            for (var i = discoveredVertices.length-1; i >= 0 ; i--) {
                var row = document.createElement("tr");
                row.setAttribute("id", "l" + i);
                row.innerHTML = discoveredVertices[i].vIndex;
                tableBody.appendChild(row);
                }   
            }
            else if(discoveredVerticesName == "Queue"){
            for (var i = 0; i <= size ; i++) {
                var row = document.createElement("td");
                row.setAttribute("id", "l" + i);
                row.innerHTML = discoveredVertices[i].vIndex;
                tableBody.appendChild(row);
            }
        
        }
            table.appendChild(tableBody);
            table.setAttribute("border", "2");
            div.appendChild(table);
            
        
        }
    return div;      
        
}