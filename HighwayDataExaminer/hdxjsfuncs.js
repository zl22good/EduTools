//
// HDX-specific Javascript functions
//
// Load and view data files related to Travel Mapping (TM), formerly
// Clinched Highway Mapping (CHM), related academic data sets.
//
// Primary author: Jim Teresco, Siena College, The College of Saint Rose
//
// Additional authors: Razie Fathi, Arjol Pengu, Maria Bamundo, Clarice Tarbay


// some globals used here (map, waypoints, markers, etc) come from
// tmjsfuncs.js

// variables declared here are HDX-specific global variables

// group of variables used by many or all algorithm visualizations
var hdxAV = {
    // boolean to indicate if a simulation in progress is paused
    pause: false,
    // is an AV complete?
    done: false,
    // delay (in ms) between visualization steps
    // default delay 50 should match the selected option in the speedChanger
    // and delay should be used for the amount of time in the future to use
    // for setTimeout calls
    delay: 50,
    // what was the most recent algorithm?
    previousAlgorithm: null,

    // reset values
    reset: function() {
	pause = false;
	done = false;
	previousAlgorithm = null;
	delay = 50;
    }
};

/**********************************************************************
 * General AV functions
 **********************************************************************/
// speedChanger dropdown callback
function speedChanged() {

    var speedChanger = document.getElementById("speedChanger");
    hdxAV.delay = speedChanger.options[speedChanger.selectedIndex].value;
}

// pause button callback, simply sets pause to true, other functions
// deal with this as appropriate
function pauseSimulation() {

    hdxAV.pause = true;
}

// algorithm visualization color settings and other parameters
var visualSettings = {
    // first, some used by many algorithms
    undiscovered: {
        color: "#202020",
        textColor: "#e0e0e0",
        scale: 2,
	name: "undiscovered", 
	value: 0
    },
    visiting: {
        color: "yellow",
        textColor: "black",
        scale: 6,
	name: "visiting",
	value: 0
    },
    leader: {
        color: "red",
        textColor: "white",
        scale: 6,
	name: "leader",
	value: 0
    },
    discarded: {
        color: "#a0a0a0",
        textColor: "black",
        scale: 2,
	name: "discarded",
	value: 0
    },
    // specific to vertex search
    northLeader: {
        color: "#8b0000",
        textColor: "white",
        scale: 6,
	name: "northLeader",
	value: 0
    },
    southLeader: {
        color: "#ee0000",
        textColor: "white",
        scale: 6,
	name: "southLeader",
	value: 0
    },
    eastLeader: {
        color: "#000080",
        textColor: "white",
        scale: 6,
	name: "eastLeader",
	value: 0
    },
    westLeader: {
        color: "#551A8B",
        textColor: "white",
        scale: 6,
	name: "westLeader",
	value: 0
    },
    shortLabelLeader: {
        color: "#654321",
        textColor: "white",
        scale: 6,
	name: "shortLabelLeader",
	value: 0
    },
    longLabelLeader: {
        color: "#006400",
        textColor: "white",
        scale: 6,
	name: "longLabelLeader",
	value: 0
    },
    // specific to graph traversals
    startVertex: {
        color: "purple",
        textColor: "white",
        scale: 6,
	name: "startVertex",
	value: 0
    },
    discoveredEarlier: {
        color: "red",
        textColor: "white",
        scale: 4,
	name: "discoveredEarlier",
	value: 0
    },
    visitedEarlier: {
        color: "orange",
        textColor: "black",
        scale: 4,
	name: "visitedEarlier",
	value: 0
    },
    spanningTree: {
        color: "#0000a0",
        textColor: "white",
        scale: 2,
	name: "spanningTree",
	value: 0
    },
    discovered: {
        color: "#00a000",
        textColor: "white",
        scale: 4,
	name: "discovered",
	value: 0
    },
    hoverV: {
	color: "#a0036b",
	textColor: "white",
	scale: 6,
	name: "hoverV",
	value: 0
    },
    hullI: {
        color: "#0000aa",
        textColor: "black",
        scale: 6,
	name: "hullI",
	value: 0
    }
};

var endOrStart;
var endOrStart1;

//allows the user to click on the table to select a vertex to start at
function vertexSelect(vertex) {
    if (endOrStart) {
	var startVertex = document.querySelector("#startPoint");
	startVertex.value = vertex;
	endOrStart = false;
    }
}

function vertexSelectEnd(vertex) {
    if (endOrStart1) {
	var endVertex = document.querySelector("#endPoint");
	endVertex.value = vertex;
	endOrStart1 = false;
    }
}

function startPointInput() {
    endOrStart = true;
}

function endPointInput() {
    endOrStart1 = true;
}

function hoverV(i, bool) {
    if ((bool && hdxAV.pause) || !bool) {
	vicon = markers[i].getIcon();
	vcolor = document.getElementById("waypoint"+i).style.backgroundColor;
	vtext = document.getElementById("waypoint"+i).style.color;
	updateMarkerAndTable(i, visualSettings.hoverV, 0, false);
    }
}

function hoverEndV(i, bool) {
    if ((bool && hdxAV.pause) || !bool) {
	markers[i].setIcon(vicon);
	document.getElementById("waypoint"+i).style.backgroundColor = vcolor;
	document.getElementById("waypoint"+i).style.color = vtext;
	if ($("#l"+i).length > 0)
	    document.getElementById("l"+i).style.backgroundColor = vcolor;
	if ($("#di"+i).length > 0) {
	    document.getElementById("di"+i).style.backgroundColor = vcolor;
	    document.getElementById("di"+i).style.color = vtext;
	}
    }
}

function hoverE(event, i) {
    ecolor = event.target.parentNode.style.backgroundColor;
    etext = event.target.parentNode.style.color;
    event.target.parentNode.style.color = visualSettings.hoverV.textColor;
    event.target.parentNode.style.backgroundColor = visualSettings.hoverV.color
    edge = connections[i].get("strokeColor");
    edgew = connections[i].get("strokeOpacity");
    connections[i].setOptions({
        strokeColor: visualSettings.hoverV.color,
	strokeOpacity: 0.7
    });
}

function hoverEndE(event, i) {
    connections[i].setOptions({
        strokeColor: edge,
	strokeOpacity: edgew
    });
    event.target.parentNode.style.color = etext;
    event.target.parentNode.style.backgroundColor = ecolor;
}

var vcolor, vtext, vicon;
var ecolor, etext, edge, edgew;

function labelClickHDX(i) {
    vertexSelect(i);
    vertexSelectEnd(i);
    map.panTo(new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon));
    //infowindow.setContent(info);
    infowindow.setContent(markerinfo[i]);
    infowindow.open(map, markers[i]);
}


function changeUnits(event) {
    prevUnit = curUnit;
    curUnit = event.target.value;
    if (event.target.value == "miles") {
	changeUnitsInner("feet", "km", "meters", .000189394, .621371, .000621371);
    }
    else if (event.target.value == "feet") {
	changeUnitsInner("miles", "km", "meters", 5280, 3280.84, 3.28084);
    }
    else if (event.target.value == "meters") {
	changeUnitsInner("feet", "km", "miles", .3048, 1000, 1609.34);	
    }
    else if (event.target.value == "km") {
	changeUnitsInner("feet", "meters", "miles", .0003048, .001, 1.60934);
    }
}

function changeUnitsInner(un1, un2, un3, mult1, mult2, mult3) {
    loopChangeUnits(un1, mult1);
    loopChangeUnits(un2, mult2);
    loopChangeUnits(un3, mult3);
}

function loopChangeUnits(oldUnit, mult) {
    var arr = document.getElementsByClassName(oldUnit);
    for (var i = arr.length-1; i >= 0; i--) {
	if (arr[i].innerHTML.indexOf(oldUnit) == -1)
	    arr[i].innerHTML =
	    Math.round(parseFloat(arr[i].innerHTML)*mult*1000)/1000;
	else
	    arr[i].innerHTML =
	    Math.round(parseFloat(arr[i].innerHTML.substring(0, (arr[i].innerHTML.length-1-oldUnit.length)))*mult*1000)/1000+" "+curUnit;
	arr[i].classList.add(curUnit);
	arr[i].classList.remove(oldUnit);		
    }	
}
var curUnit = "miles";
var prevUnit;

function generateUnit(lat1, lon1, lat2, lon2) {
    prevUnit = curUnit;
    curUnit = document.getElementById("distUnits").value;
    if (curUnit == "miles") {
	return Math.round(distanceInMiles(lat1, lon1, lat2, lon2)*1000)/1000 +
	    " miles";
    }
    else if (curUnit == "feet") {
	return Math.round(distanceInFeet(lat1, lon1, lat2, lon2)*1000)/1000 +
	    " feet";
    }
    else if (curUnit == "meters") {
	return Math.round(distanceInFeet(lat1, lon1, lat2, lon2)*.3048*1000)/1000
	    + " meters";
    }
    else if (curUnit == "km") {
	return Math.round(distanceInFeet(lat1, lon1, lat2, lon2)*.0003048*1000)/1000
	    + " km";
    }
}

function convertMiles(num) {
    if (curUnit == "feet") {
	return Math.round(num*5280*1000)/1000;
    }
    else if (curUnit == "meters") {
	return Math.round(num*1609.34*1000)/1000;
    }
    else if (curUnit == "km") {
	return Math.round(num*1.60934*1000)/1000;
    }
    else {
	return Math.round(num*1000)/1000;
    }
}

// function to set the waypoint color, scale, and table entry
// using an entry passed in from the visualSettings
// optionally hide also by setting display to none
function updateMarkerAndTable(waypointNum, vs, zIndex, hideTableLine) {
    legendArea(vs);
    markers[waypointNum].setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: vs.scale,
        fillColor: vs.color,
        strokeColor: vs.color
    });
    markers[waypointNum].setZIndex(google.maps.Marker.MAX_ZINDEX + zIndex);
    var row = document.getElementById("waypoint"+waypointNum);
    row.style.backgroundColor = vs.color;
    row.style.color = vs.textColor;
    if ($("#l"+waypointNum).length > 0) {
	document.getElementById("l"+(waypointNum)).style.backgroundColor = vs.color;
    }
    if ($("#di"+waypointNum).length > 0) {
	document.getElementById("di"+waypointNum).style.backgroundColor = vs.color;
	document.getElementById("di"+waypointNum).style.color = vs.textColor;
    }
    if (hideTableLine) 
        row.style.display = "none";
    if (vs.color == "#0000a0") {
	var clone = row.cloneNode(true);
	clone.className = "blueRow";
	row.parentNode.appendChild(clone);
	row.parentNode.removeChild(row);		
    }
    if (vs.color == "#00a000") {
	var clone = row.cloneNode(true);
	row.parentNode.insertBefore(clone, row.parentNode.childNodes[1]);
	row.parentNode.removeChild(row);		
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
    if (hdxAV.pause) {
        hdxAV.pause = false;
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
    document.getElementById("connection").style.display = "none";
    
    document.getElementById("waypoints").style.display = "";
    var pointRows = document.getElementById("waypoints").getElementsByTagName("*");
    for (var i = 0; i < pointRows.length; i++) {
	pointRows[i].style.display = "";
    }

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
    for (var i = 1; i < 7; i++) {
	infoBox = document.createElement('td');
	infoBoxtr= document.createElement('tr');
	infoid = "info"+i;
	infoBox.setAttribute('id',infoid);
	infoBoxtr.appendChild(infoBox);
	algorithmsTbody.appendChild(infoBoxtr);
    }

    // enable pause button
    //document.getElementById("pauseRestart").disabled = false;
    setTimeout(continueVertexSearch, hdxAV.delay);
}


// do an iteration of vertex-based search
function continueVertexSearch() {

    // if the simulation is paused, we can do nothing, as this function
    // will be called again when we restart
    if (hdxAV.pause) {
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
        if (parseFloat(waypoints[nextToCheck].lat) >
	    parseFloat(waypoints[northIndex].lat)) {
            foundNewLeader = true;
            defeated.push(northIndex);
            northIndex = nextToCheck;
        }
        // check south
        if (parseFloat(waypoints[nextToCheck].lat) <
	    parseFloat(waypoints[southIndex].lat)) {
            foundNewLeader = true;
            defeated.push(southIndex);
            southIndex = nextToCheck;
        }
        // check east

        if (parseFloat(waypoints[nextToCheck].lon) >
	    parseFloat(waypoints[eastIndex].lon)) {
            foundNewLeader = true;
            defeated.push(eastIndex);
            eastIndex = nextToCheck;
        }
        // check west
        if (parseFloat(waypoints[nextToCheck].lon) <
	    parseFloat(waypoints[westIndex].lon)) {
            foundNewLeader = true;
            defeated.push(westIndex);
            westIndex = nextToCheck;
        }

        // check label lengths
        if (waypoints[nextToCheck].label.length <
	    waypoints[shortIndex].label.length) {
            foundNewLeader = true;
            defeated.push(shortIndex);
            shortIndex = nextToCheck;
        }

        if (waypoints[nextToCheck].label.length >
	    waypoints[longIndex].label.length) {
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
    }
    else {
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
        
        setTimeout(continueVertexSearch, hdxAV.delay);
    }
    else {
	hdxAV.done = true;
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
var edgeshort = null;
var edgelong = null;
var currentEdgeIndex = 0;
var shortestELabel;
var longestELabel;
var maxnum = -1;
var minnum = -1;
var shortnum = -1;
var longnum = -1;
var flag = "";

function startEdgeSearch() {

    if (hdxAV.pause) {
        hdxAV.pause = false;
        continueEdgeSearch();
        return;
    }

    var statusLine = document.getElementById("status");
    // statusLine.innerHTML = "Preparing for Extreme Edge Search Visualization";
    // we don't need edges here, so we remove those
    for (var i = 0; i < connections.length; i++) {
        connections[i].setOptions(
	    {
		strokeColor: visualSettings.undiscovered.color,
		strokeOpacity: 0.3
	    });
    }
    //we don't need waypoints table here, so we remove those
    document.getElementById("waypoints").style.display = "none";
    
    document.getElementById("connection").style.display = "";
    var pointRows = document.getElementById("connection").getElementsByTagName("*");
    for (var i = 0; i < pointRows.length; i++) {
	pointRows[i].style.display = "";
    }
    var algorithmsTable = document.getElementById('AlgorithmsTable');
    var algorithmsTbody = algorithmsTable.children[1];
    var infoid = "info1";
    var infoBox = document.createElement('td');
    var infoBoxtr= document.createElement('tr');
    infoBox.setAttribute('id',infoid);
    infoBoxtr.appendChild(infoBox);
    algorithmsTbody.appendChild(infoBoxtr);
    // document.getElementById('algorithmStatus').innerHTML = 'Checking: <span style="color:yellow">0</span>';
    setTimeout(continueEdgeSearch, hdxAV.delay);    
}

function findEdge(edgeNum, color, op, weight) {
    var edge = graphEdges[edgeNum];
    connections[edgeNum].setOptions({
	strokeColor: color, 
	strokeWeight: weight, 
	strokeOpacity: op});
    var firstNode = Math.min(edge.v1, edge.v2);
    var secondNode = Math.max(edge.v1, edge.v2);
    document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = color;
}

function continueEdgeSearch() {
    if (hdxAV.pause) {
        return;
    }	
	
    if (flag != "") {
	findEdge(maxnum, "#0000ff", 1, 15);
	findEdge(minnum, "#FF0000", 1, 15);
	findEdge(shortnum, "#00ffff", 1, 15);
	findEdge(longnum, "#FF00ff", 1, 15);
	var ids = flag.split(",");
	for (var i=1; i<ids.length; i++) {
	    var id = parseInt(ids[i]);
	    if (id != -1 && id != minnum && id != maxnum &&
		id != shortnum && id != longnum) {
		findEdge(id, visualSettings.spanningTree.color, 0.6, 10);
		document.getElementById("connection"+(id)).style.display = "none";
	    }
	}
    }
    else {
	if (currentEdgeIndex > 0) {
	    document.getElementById("connection"+(currentEdgeIndex-1)).style.display = "none";
	    findEdge(currentEdgeIndex-1, visualSettings.spanningTree.color,
		     0.6, 10);
	}
    }
    
    if (currentEdgeIndex == graphEdges.length) {
	hdxAV.done = true;
	document.getElementById('info1').innerHTML = "<span style='background-color:cyan; color:black;' onclick='edgeClick("+shortnum+")'>Shortest Edge label: " + shortestELabel + "</span><br><span style='background-color:magenta' onclick='edgeClick("+longnum+")'> Longest Edge label: " + longestELabel +	"</span><br><span style = 'background-color:red' onclick='edgeClick("+minnum+")'>Shortest Edge: " + edgeMin.label+ ": <span id='minedgelength'>"  + generateUnit(waypoints[graphEdges[minnum].v1].lat, waypoints[graphEdges[minnum].v1].lon, waypoints[graphEdges[minnum].v2].lat, waypoints[graphEdges[minnum].v2].lon) + "</span></span><br><span style = 'background-color:blue' onclick='edgeClick("+maxnum+")'>  Longest Edge: " + edgeMax.label + ": <span id='maxedgelength'>" + generateUnit(waypoints[graphEdges[maxnum].v1].lat, waypoints[graphEdges[maxnum].v1].lon, waypoints[graphEdges[maxnum].v2].lat, waypoints[graphEdges[maxnum].v2].lon) + "</span></span>";
	document.getElementById("minedgelength").classList.add(curUnit);
	document.getElementById("maxedgelength").classList.add(curUnit);
	return;
    }
    
    flag = '';	
    
    var edge = graphEdges[currentEdgeIndex];
    findEdge(currentEdgeIndex, "#FFFF00", 1, 10);
    
    var distance = distanceInMiles(waypoints[edge.v1].lat, waypoints[edge.v1].lon,
				   waypoints[edge.v2].lat, waypoints[edge.v2].lon);
    
    if (distance < minDistance) {
        minDistance = distance;
        edgeMin = edge;
	flag += "," + minnum;
	minnum = currentEdgeIndex;
    }
    
    if (distance > maxDistance) {
        maxDistance = distance;
        edgeMax = edge;
	flag += "," + maxnum;
	maxnum = currentEdgeIndex;
    }
    
    if (shortestELabel === undefined || shortestELabel == null ||
	shortestELabel.length > edge.label.length) {
        shortestELabel = edge.label;
	edgeshort = edge;
	flag += "," + shortnum;
	shortnum = currentEdgeIndex;
    }
    
    if (longestELabel === undefined || longestELabel == null ||
	longestELabel.length < edge.label.length) {
        longestELabel = edge.label;
	edgelong = edge;
	flag += "," + longnum;
	longnum = currentEdgeIndex;
    }	
    document.getElementById('info1').innerHTML = "<span style='background-color:cyan; color:black;' onclick='edgeClick("+shortnum+")'>Shortest Edge label: " + shortestELabel + "</span><br><span style='background-color:magenta' onclick='edgeClick("+longnum+")'> Longest Edge label: " + longestELabel +	"</span><br><span style = 'background-color:red' onclick='edgeClick("+minnum+")'>Shortest Edge: " + edgeMin.label+ ": <span id='minedgelength'>"  + generateUnit(waypoints[graphEdges[minnum].v1].lat, waypoints[graphEdges[minnum].v1].lon, waypoints[graphEdges[minnum].v2].lat, waypoints[graphEdges[minnum].v2].lon) + "</span></span><br><span style = 'background-color:blue' onclick='edgeClick("+maxnum+")'>  Longest Edge: " + edgeMax.label + ": <span id='maxedgelength'>" + generateUnit(waypoints[graphEdges[maxnum].v1].lat, waypoints[graphEdges[maxnum].v1].lon, waypoints[graphEdges[maxnum].v2].lat, waypoints[graphEdges[maxnum].v2].lon) + "</span></span>";
    
    document.getElementById("maxedgelength").classList.add(curUnit);
    document.getElementById("minedgelength").classList.add(curUnit);
    
    currentEdgeIndex += 1;
    setTimeout(continueEdgeSearch, hdxAV.delay);
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

var endingVertex;
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
var gred = 245;
var ggrn = 255;
var gblu = 245;


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
    if (hdxAV.pause) {
        hdxAV.pause = false;
        continueGraphTraversal();
        return;
    }

    document.getElementById("connection").style.display = "none";
    document.getElementById("waypoints").style.display = "";
    var pointRows = document.getElementById("waypoints").getElementsByTagName("*");
    for (var i = 0; i < pointRows.length; i++) {
	pointRows[i].style.display = "";
    }
    
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
    numVisited++;

    updateMarkerAndTable(startingVertex, visualSettings.startVertex, 10, false);

    // nothing to update this first time
    lastVisitedVertex = -1;
    setTimeout(continueGraphTraversal, hdxAV.delay);
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
var numVisited = 0;
var numVisitedComingOut = 0;
var numAlreadyVisited = 0;
function continueGraphTraversal() {
    
    // if we're paused, do nothing for now
    if (hdxAV.pause) {
        return;
    }

    // maybe we have a last visited vertex to update
    if (lastVisitedVertex != -1) {
        if (lastVisitedVertex == startingVertex) {
            // always leave the starting vertex colored appropriately
            // and in the table
            updateMarkerAndTable(startingVertex, visualSettings.startVertex,
				 10, false);
        }
	else if (!discoveredVerticesContainsVertex(lastVisitedVertex)) {
            // not in the list, this vertex gets marked as in the spanning tree
            updateMarkerAndTable(lastVisitedVertex, visualSettings.spanningTree,
				 1, false);
        }
	else {
            // still in the list, color with the "discoveredEarlier"  style
            updateMarkerAndTable(lastVisitedVertex,
				 visualSettings.discoveredEarlier,
				 5, false);
        }
    }
    // maybe we're done
    if (discoveredVertices.length == 0) {
	hdxAV.done = true;
        return;
    }

    // select the next vertex to visit and remove it from the
    // discoveredVertices list
    var nextToVisit;
    if (traversalDiscipline == "BFS") {
        nextToVisit = discoveredVertices.shift();
        numVisitedComingOut++;
    }
    else if (traversalDiscipline == "DFS") {
        nextToVisit = discoveredVertices.pop();
        numVisitedComingOut++;
    }
    else if (traversalDiscipline == "RFS") {
        var index = Math.floor(Math.random() * discoveredVertices.length);
        nextToVisit = discoveredVertices[index];
        discoveredVertices.splice(index, 1);
        numVisitedComingOut++;
    }

    lastVisitedVertex = nextToVisit.vIndex;
    var vIndex = nextToVisit.vIndex;
    numVisited++;
    // now decide what to do with this vertex -- depends on whether it
    // had been previously visited
    if (visited[vIndex]) {
        numAlreadyVisited++;
        // we've been here before, but is it still in the list?
        if (discoveredVerticesContainsVertex(vIndex)) {
            // not there anymore, indicated this as visitedEarlier, and
            // will be discarded or marked as discoveredEarlier on the
            // next iteration
            updateMarkerAndTable(vIndex, visualSettings.visitedEarlier,
				 4, false);
        }
	else {
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
                updateMarkerAndTable(neighbors[i],
				     {
					 color: "rgb("+gred+","+ggrn+","+gblu+")",
					 textColor: "black",
					 scale: 4
				     },
				     5, false);
		if (gblu >=10) {
		    gred-=10;
		    gblu-=10;
		}
		else {
		    ggrn-=10;
		}
		
                // also color the edge we followed to get to this
                // neighbor as the same color to indicate it's a candidate
                // edge followed to find a current discovered but
                // unvisited vertex
                if (connection != null) {
                    connection.setOptions({
                        strokeColor: visualSettings.discovered.color
                    });
                }
		else {
                    console.log("Unexpected null connection, vIndex=" + vIndex +
				", i=" + i);
                }
            }
        }
    }

    // update view of our list
    //printList(queue);
   /* document.getElementById('algorithmStatus').innerHTML = discoveredVerticesName + " (size: " + discoveredVertices.length + ") " + listToVIndexString(discoveredVertices);
    setTimeout(continueGraphTraversal, delay);*/
    var newDS = makeTable();
    if (newDS!=null)
	document.getElementById("algorithmStatus").appendChild(newDS);
    shiftColors();
    setTimeout(continueGraphTraversal, hdxAV.delay);
}

var red = 255;
var green = 0;
var blue = 0;
var piecenum = 1;

function startConnectedPieces(vert, visitarr) {
	
    discoveredVerticesName = "Queue";
    
    // if we are paused
    if (hdxAV.pause) {
        hdxAV.pause = false;
        continueConnectedPieces();
        return;
    }	

    var piecesTD = "";
    
    document.getElementById("connection").style.display = "none";
    document.getElementById("waypoints").style.display = "";
    var pointRows = document.getElementById("waypoints").getElementsByTagName("*");
    for (var i = 0; i < pointRows.length; i++)
	pointRows[i].style.display = "";
    
    // initialize our visited array, define start vertex, recolor if necessary
    if (vert == -1) {
	var piecesTR = document.createElement("tr");
	piecesTD = document.createElement("td");
	piecesTR.appendChild(piecesTD);
	piecesTD.setAttribute("id","piecesTD");
	$("#AlgorithmsTable > tbody").append(piecesTR);
	piecesTD = document.getElementById("piecesTD");
	visited = new Array(waypoints.length).fill(false);
	startingVertex = document.getElementById("startPoint").value;
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
    }
    else {
	piecesTD = document.getElementById("piecesTD");
	visited = visitarr;
	startingVertex = vert;
    }
    
    piecesTD.innerHTML = "Currently traversing component #"+ piecenum;
    piecesTD.style.backgroundColor = "rgb("+red+","+green+","+blue+")";
    
    // initialize the process with this value
    discoveredVertices.push({
        vIndex: startingVertex,
        connection: null
    });
    
    updateMarkerAndTable(startingVertex, visualSettings.startVertex, 10, false);
    
    // nothing to update this first time
    lastVisitedVertex = -1;
    setTimeout(function() {continueConnectedPieces()}, hdxAV.delay);
}

function continueConnectedPieces() {
	
    // if we're paused, do nothing for now
    if (hdxAV.pause) {
        return;
    }

    // maybe we have a last visited vertex to update
    if (lastVisitedVertex != -1) {
	if (!discoveredVerticesContainsVertex(lastVisitedVertex)) {
            // not in the list, this vertex gets marked as in the spanning tree
            updateMarkerAndTable(lastVisitedVertex,
				 {
				     color: "rgb("+red+","+green+","+blue+")",
				     textColor: "black",
				     scale: 2
				 },
				 1, false);
        } else {
            // still in the list, color with the "discoveredEarlier"  style
            updateMarkerAndTable(lastVisitedVertex,
				 visualSettings.discoveredEarlier,
				 5, false);
        }
    }
    
    var vleft = false;
    var index = -1;
    for (var i = 0; i < visited.length; i++) {
	if (!visited[i]) {
	    vleft = true;
	    index = i;
	}
    }

    // maybe we're done
    if (discoveredVertices.length == 0 && !vleft) {
	hdxAV.done = true;
        document.getElementById("piecesTD").innerHTML = "Done! Map contains "+piecenum+" unconnected pieces";
	document.getElementById("piecesTD").style.backgroundColor = "#ffffff";
        return;
    }
    
    if (discoveredVertices.length == 0 && vleft) {
	if (green <= 220 && blue <=220)
	    green = green+35;
	else if (red >= 35 && green > 220)
	    red-=35;	
	else if (blue <= 220 && red <= 220)
	    blue += 35;	
	else if (blue > 220 && green >=35)
	    green -=35;
	else if (red <= 220 && green <= 220)
	    red += 35;		
	piecenum++;
        startConnectedPieces(index, visited);
	return;
    }

    // select the next vertex to visit and remove it from the
    // discoveredVertices list
   
    var nextToVisit = discoveredVertices.shift();
    numVisited++;
   
    lastVisitedVertex = nextToVisit.vIndex;
    var vIndex = nextToVisit.vIndex;
    
    // now decide what to do with this vertex -- depends on whether it
    // had been previously visited
    if (visited[vIndex]) {
	numAlreadyVisited++;
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
	numVisitedComingOut++;
        visited[vIndex] = true;
        updateMarkerAndTable(vIndex, visualSettings.visiting,
			     10, false);

        // we used the edge to get here, so let's mark it as such
        if (nextToVisit.connection != null) {
            nextToVisit.connection.setOptions({
                strokeColor: "rgb("+red+","+green+","+blue+")"
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
    var newDS = makeTable();
    if (newDS!=null)
	document.getElementById("algorithmStatus").appendChild(newDS);
    setTimeout(function() {continueConnectedPieces()}, hdxAV.delay);
}

function startDijkstra() {
	
    // if we are paused
    if (hdxAV.pause) {
        hdxAV.pause = false;
        continueDijkstra();
        return;
    }
    else {	
	document.getElementById("connection").style.display = "none";
	document.getElementById("waypoints").style.display = "none";
	
	if ($("#dijtable").length > 0)
	    $("#dijtable").remove();
	
	var dijkstraTable = document.createElement("table");
	dijkstraTable.id = "dijtable";
	dijkstraTable.className = "gratable";
	var dijthead = document.createElement("thead");
	
	var topRow = document.createElement("tr");
	
	var th = document.createElement("th");
	th.innerHTML = "#";
	topRow.appendChild(th);
	
	th = document.createElement("th");
	th.innerHTML = "Distance";
	topRow.appendChild(th);
	
	th = document.createElement("th");
	th.innerHTML = "Name";
	topRow.appendChild(th);
	
	th = document.createElement("th");
	th.innerHTML = "Previous edge";
	topRow.appendChild(th);
	
	dijthead.appendChild(topRow);
	dijkstraTable.appendChild(dijthead);
	var dijtbody = document.createElement("tbody");
	dijtbody.id = "dijtbody";
	dijkstraTable.appendChild(dijtbody);
	
	document.getElementById("waypoints").parentNode.parentNode.appendChild(dijkstraTable);	
    }
    discoveredVerticesName = "PQueue";
    
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
    endingVertex = document.getElementById("endPoint").value;
    
    
    // initialize the process with this value
    discoveredVertices.push({
        vIndex: startingVertex,
        connection: null,
	dist: 0,
	edge: null
    });
    numVisited++;
    
    updateMarkerAndTable(startingVertex, visualSettings.startVertex, 10, false);
    
    // nothing to update this first time
    lastVisitedVertex = -1;
    setTimeout(continueDijkstra, hdxAV.delay);
}

function comparePQ(a, b) {
    return a.dist-b.dist;
}

var totalPath = Array();

function findNextV(edge, vnum) {
    if (edge.v1 == vnum)
	return edge.v2;
    else 
	return edge.v1;
}

function findNextPath(v1, v2) {
    var cur;
    for (var i = 0; i < totalPath.length; i++) {
	cur = totalPath[i].edge;
	if (cur != null &&
	    (v1 == cur.v1 || v1 == cur.v2) && (v2 != cur.v1 && v2 != cur.v2)) {
	    return i;
	}
    }
}

function continueDijkstra() {
    // if we're paused, do nothing for now
    if (hdxAV.pause) {
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
            updateMarkerAndTable(lastVisitedVertex,
				 visualSettings.discoveredEarlier,
				 5, false);
        }
    }
    // maybe we're done, if there are no vertices left, or in the case
    // that start/end are different, we've visited the end
    if (discoveredVertices.length == 0 ||
	(visited[endingVertex] && startingVertex != endingVertex)) {
	//make our table a sortable DataTable
	createDataTable("#dijtable");
	//if start/end different, construct path from start to end
        if (startingVertex != endingVertex) {
	    var curV = totalPath[totalPath.length-1];
	    var edgePath = curV.edge;
	    var curVnum = endingVertex;
	    var nextV;
	    while (curV != null) {
		edgePath = curV.edge;
		curVnum = nextV;
		if (curVnum == startingVertex)
		    break;
		updateMarkerAndTable(curV.vIndex,
				     {
					 color: "#ffaa00",
					 textColor: "black",
					 scale: 5},
				     5, false);
		curV.connection.setOptions({
		    strokeColor: "#ffaa00"
		});
		
		nextV = findNextV(edgePath, curVnum);
		curV = totalPath[findNextPath(nextV, curVnum)];
	    }
	}
	hdxAV.done = true;
        return;
    }

    // select the next vertex to visit and remove it from the
    // discoveredVertices list
    var nextToVisit = discoveredVertices.shift();
	if (startingVertex != endingVertex)
		totalPath.push(nextToVisit);
	
	if ($("#di"+nextToVisit.vIndex).length<=0) {
	    var tr = document.createElement("tr");
	    tr.id = "di"+nextToVisit.vIndex;
	    var td = document.createElement("td");
	    td.innerHTML = nextToVisit.vIndex;
	    td.setAttribute("onclick", "labelClickHDX("+nextToVisit.vIndex+")");
	    td.setAttribute("onmouseover", "hoverV("+nextToVisit.vIndex+", false)");
	    td.setAttribute("onmouseout", "hoverEndV("+nextToVisit.vIndex+", false)");
	    tr.appendChild(td);	
	    td = document.createElement("td");
	    if (nextToVisit.edge!=null)
		td.innerHTML = convertMiles(nextToVisit.dist);
	    else
		td.innerHTML = 0;
	    td.classList.add(curUnit);
	    td.setAttribute("onclick", "labelClickHDX("+nextToVisit.vIndex+")");
	    td.setAttribute("onmouseover", "hoverV("+nextToVisit.vIndex+", false)");
	    td.setAttribute("onmouseout", "hoverEndV("+nextToVisit.vIndex+", false)");
	    tr.appendChild(td);
	    td = document.createElement("td");
	    td.setAttribute("onclick", "labelClickHDX("+nextToVisit.vIndex+")");
	    td.setAttribute("onmouseover", "hoverV("+nextToVisit.vIndex+", false)");
	    td.setAttribute("onmouseout", "hoverEndV("+nextToVisit.vIndex+", false)");
	    td.innerHTML = waypoints[nextToVisit.vIndex].label;
	    tr.appendChild(td);
	    td = document.createElement("td");
	    var ind = graphEdges.indexOf(nextToVisit.edge);
	    td.setAttribute("onmouseover", "hoverE(event,"+ind+")");
	    td.setAttribute("onmouseout", "hoverEndE(event,"+ind+")");
	    td.setAttribute("onclick", "edgeClick("+ind+")");
	    if (nextToVisit.edge!=null) {
		td.innerHTML = "("+nextToVisit.edge.v1+")"+
		    waypoints[nextToVisit.edge.v1].label+"<br>"+"("+
		    nextToVisit.edge.v2+")"+waypoints[nextToVisit.edge.v2].label;
	    }
	    else {
		td.innerHTML = "null";
	    }
	    tr.appendChild(td);
	    
	    document.getElementById("dijtbody").appendChild(tr);
	}
    
    lastVisitedVertex = nextToVisit.vIndex;
    var vIndex = nextToVisit.vIndex;
    numVisited++;
    // now decide what to do with this vertex -- depends on whether it
    // had been previously visited
    if (visited[vIndex]) {
        numAlreadyVisited++;
	
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
	numVisitedComingOut++;
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
                    connection: connection,
		    dist: distanceInMiles(waypoints[vIndex].lat,
					  waypoints[vIndex].lon,
					  waypoints[neighbors[i]].lat,
					  waypoints[neighbors[i]].lon)+nextToVisit.dist,
		    edge: waypoints[vIndex].edgeList[i]
                });
                updateMarkerAndTable(neighbors[i],
				     {
					 color: "rgb("+gred+","+ggrn+","+gblu+")",
					 textColor: "black",
					 scale: 4
				     },
				     5, false);
		if (gblu >=10) {
		    gred-=10;
		    gblu-=10;
		}
		else {
		    ggrn-=10;
		}
		
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
    discoveredVertices.sort(comparePQ);
    
    // update view of our list
    var newDS = makeTable();
    if (newDS!=null)
	document.getElementById("algorithmStatus").appendChild(newDS);
    shiftColors();
    setTimeout(continueDijkstra, hdxAV.delay);
}

function DSColor(id, color) {
    
    document.getElementById(id).style.backgroundColor = color;
}

function shiftColors() {
    var r = 245;
    var g = 255;
    var b = 245;
    var inc;
    if (discoveredVertices.length <= 6) {
	inc = 70;
    }
    else if (discoveredVertices.length <=10) {
	inc = 45;
    }
    else if (discoveredVertices.length <= 24) {
	inc = 20;
    }
    else if (discoveredVertices.length <= 49) {
	inc = 10;
    }
    else {
	inc = 9;
    }
    pts = Array(waypoints.length);
    for (var i = 0; i < pts.length; i++) {
	pts[i] = 0;
    }
    //works until 83 vertices in DS, then repeats cyan
    for (var i = 0; i < discoveredVertices.length; i++) {
	if (pts[discoveredVertices[i].vIndex] > 0) {
	    if ($("#di"+discoveredVertices[i].vIndex).length > 0) {
		DSColor("l"+discoveredVertices[i].vIndex+"_"+
			pts[discoveredVertices[i].vIndex], "#0000a0");
	    }
	    else {
		DSColor("l"+discoveredVertices[i].vIndex+"_"+
			pts[discoveredVertices[i].vIndex], "red");
	    }
	}
	else if ($("#di"+discoveredVertices[i].vIndex).length > 0) {
	    DSColor("l"+discoveredVertices[i].vIndex, "#0000a0");
	    
	    updateMarkerAndTable(discoveredVertices[i].vIndex,
				 visualSettings.spanningTree,
				 1, false);
	}
	else {
	    updateMarkerAndTable(discoveredVertices[i].vIndex,
				 {
				     color: "rgb("+r+","+g+","+b+")",
				     textColor: "black",
				     scale: 4
				 },
				 5, false);
	    if (r >= inc && b >= inc && g >= inc) {
		r-=inc;
		b-=inc;			
	    }
	    else if (g >= inc && b < inc && r < inc) {
		g-=inc;
	    }
	    else {
		b+=inc;
		g+=inc;
	    }
	}
	pts[discoveredVertices[i].vIndex]++;
    }
    if (discoveredVertices.length > 0) {
	var colors = document.getElementById("waypoint"+
			    discoveredVertices[discoveredVertices.length-1].vIndex).style.backgroundColor.split(",");
	gred = parseInt(colors[0].substring(4, colors[0].length).trim());
	ggrn = parseInt(colors[1].trim());
	gblu = parseInt(colors[2].substring(0, colors[2].length-1).trim());
	if (gred>=inc) {
	    gred-=inc;
	    gblu-=inc;
	}
	else {
	    ggrn-=inc;
	}
    }
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

// New Convex Hull 
function addToHull(temp1, temp2) {
    hull[0] = temp1;
    hull[1] = temp2;
}

// Compute Squared Distance 
function squaredDistance(o1, o2) {
    var dx, dy;
    dx = o1.lon - o2.lon;
    dy = o1.lat - o2.lat;
    return dx * dx + dy * dy;
}

var hull = [];

var hullI = 0;
var hullJ = 0;
//var k = 0;
var hull = [];

var convexLineHull = [];

var visitingLine = [];

var currentSegment;

function visitingLineHull(lineHull) {
    //for (var i = 0; i < lineHull.length; i++) {
    //currentSegment.setMap(null);
    //document.getElementById("for2").className -= " highlight";
    document.getElementById("drawLine").className += " highlight";
    currentSegment = new google.maps.Polyline({
	map: map,
	path: lineHull,
	strokeColor: '#0000aa',
	strokeOpacity: 0.6,
	strokeWeight: 4
    });
}

var point1;
var point2;

var a;
var b;
var c;

var lookingForPositive;
var foundProblem;
var firstTestPoint;

function bruteForceConvexHull() {

    if (hdxAV.pause) {
	hdxAV.pause = false;
	innerLoopConvexHull();
	return;
    }
    for (var outerLoop = 0; outerLoop < connections.length; outerLoop++) {
	connections[outerLoop].setMap(null);
    }
    for (var i = 0; i < waypoints.length; i++) {
        updateMarkerAndTable(i, visualSettings.undiscovered, 30, false);
    }
    hullJ = 1;
    hullI = 0;
    document.getElementById("for1").className += " highlight";
    setTimeout(innerLoopConvexHull, hdxAV.delay);
}

function innerLoopConvexHull() {
    document.getElementById("for2").className += " highlight";
    document.getElementById("for1").className -= " highlight";
    document.getElementById("drawLine").className -= " highlight";
    document.getElementById("drawLine2").className -= " highlight";
    updateMarkerAndTable(hullI, visualSettings.hullI, 30, false);

    if (hdxAV.pause) {
	return;
    }
    
    point1 = waypoints[hullI];
    point2 = waypoints[hullJ];
    
    //higlight the points being considered
    //updateMarkerAndTable(i, visualSettings.leader, 30, false);
    updateMarkerAndTable(hullJ, visualSettings.visiting, 30, false);
    
    // from here, we need to see if all other points are
    // on the same side of the line connecting point1 and point2
    a = point2.lat - point1.lat;
    b = point1.lon - point2.lon;
    c = point1.lon * point2.lat - point1.lat * point2.lon;
    // now check all other points to see if they're on the
    // same side -- stop as soon as we find they're not
    lookingForPositive = false;
    foundProblem = false;
    firstTestPoint = true;
    
    visitingLine[0] = new google.maps.LatLng(point1.lat, point1.lon);
    visitingLine[1] = new google.maps.LatLng(point2.lat, point2.lon);
    visitingLineHull(visitingLine);
    
    setTimeout(innerLoop2, hdxAV.delay);
}

function innerLoop2() {
    if (hdxAV.pause) {
	return;
    }
    
    for (var k = 0; k < waypoints.length; k++) {	
	var point3 = waypoints[k];
	
	if (point1 === point3 || point2 === point3) {
	    continue;
	}
	//updateMarkerAndTable(k, visualSettings.hullK, 30, false);
	var checkVal = a * point3.lon + b * point3.lat - c;
	
	if (checkVal === 0) {
	    if (isBetween(point1, point2, point3)) {
		continue;
	    } else {
		foundProblem = true;
		break;
	    }
	}
	if (firstTestPoint) {
	    lookingForPositive = (checkVal > 0);
	    firstTestPoint = false;
	}
	else {
	    if ((lookingForPositive && (checkVal < 0) ||
		 (!lookingForPositive && (checkVal > 0)))) {
		// segment not on hull, jump out of innermost loop
		foundProblem = true;
		break;
		//possibly end 3rd for loop here
	    }
	}
    }
    document.getElementById("drawLine").className -= " highlight";
    currentSegment.setMap(null);
    if (!foundProblem) {
        document.getElementById("for2").className -= " highlight";
        document.getElementById("drawLine").className -= " highlight";
        document.getElementById("drawLine2").className += " highlight";
	// purple line showing convex hull
	hull[0] = new google.maps.LatLng(point1.lat, point1.lon);
	hull[1] = new google.maps.LatLng(point2.lat, point2.lon);
	polyline = new google.maps.Polyline({
	    map: map,
	    path: hull,
	    strokeColor: '#cc00ff',
	    strokeOpacity: 0.6,
	    strokeWeight: 6
	});
	updateMarkerAndTable(hullI, visualSettings.startVertex, 30, false);
	updateMarkerAndTable(hullJ, visualSettings.startVertex, 30, false);
    } else {
	updateMarkerAndTable(hullJ, visualSettings.discarded, 30, false);
    }
    hullJ++;
    if (hullJ == waypoints.length) {
	updateMarkerAndTable(hullI, visualSettings.discarded, 30, false);
        document.getElementById("for1").className += " highlight";
        document.getElementById("for2").className -= " highlight";
	hullI++;
        for (var i = hullI; i >= 0; i--) {
            updateMarkerAndTable(i, visualSettings.discarded, 30, false);
        }
        for (var i = hullI + 1; i < waypoints.length; i++) {
            updateMarkerAndTable(i, visualSettings.undiscovered, 30, false);
        }
	var checkVal = a * point3.lon + b * point3.lat - c;
	var checkVal = a * point3.lon + b * point3.lat - c;
	hullJ = hullI + 1;
    }
    
    if (hullI < waypoints.length - 1) {
	setTimeout(innerLoopConvexHull, hdxAV.delay);
    }
}

/**
    Check if this point is directly in between the two given
    points.  Note: the assumption is that they are colinear.

    @param o1 one of the points
    @param o2 the other point
    @return whether this point is between the two given points
    */

function isBetween(o1, o2, o3) {
    var sqDisto1o2 = squaredDistance(o1,o2);
    //alert("isBetween" + (squaredDistance(o3,o2) < sqDisto1o2) &&
    //      (squaredDistance(o3,o2) < sqDisto1o2));
    return (squaredDistance(o3,o2) < sqDisto1o2) &&
        (squaredDistance(o3,o2) < sqDisto1o2);
}

// Creates the TOSLabels for the different map tiles and appends them
// to a div which is returned
function TOSLabel() {
    var menubar = document.querySelector(".menubar");
    
    var label = document.createElement("a");
    label.setAttribute("id", "ReferenceLink");
    label.setAttribute("href", "http://tm.teresco.org/credits.php");
    label.setAttribute("target", "_blank");
    label.innerHTML = "Credits and Sources";
    
    return label;
}

var createTable = false;
var showAll = false;
var numVisitedString = document.createTextNode("Number of Visited Vertices: " + numVisited);
var numVisitedComingOutString = document.createTextNode("Number of Vertices Visited Coming out: " + numVisitedComingOut);
var numAlreadyVisitedString = document.createTextNode("Number of Vertices already Visited: " + numAlreadyVisited);
var nameAndSize = document.createTextNode(discoveredVerticesName + " Size: " + discoveredVertices.length);

function makeTable() {
    
    var size = discoveredVertices.length-1;
    if (createTable) {
	var oldtableBody = document.getElementById("tablebody");
	oldtableBody.innerHTML = "";
        var tableBody = dsTbody(size);        
        oldtableBody.innerHTML = tableBody.innerHTML;
	if (size >9 && !showAll)
	    collapseElements("collapseDataStructure");
    }
    else {
        createTable = true;
        
        var div = document.createElement("div");
        div.setAttribute("id", "makeTable");
        
        div.appendChild(numVisitedString);
        div.appendChild(document.createElement("br"));
        div.appendChild(numVisitedComingOutString);
        div.appendChild(document.createElement("br"));
        div.appendChild(numAlreadyVisitedString);
        div.appendChild(document.createElement("br"));
        div.appendChild(nameAndSize);
	
	var buttondiv = document.createElement("div");
	buttondiv.setAttribute("id", "buttondiv");
	buttondiv.id = "collapseDataStructurebtn";
	buttondiv.style.display = "none";
	var btn = document.createElement("input");
	btn.type = "button";
	btn.addEventListener("click", undoCollapse);
	btn.addEventListener("click", function() {showAll = true;});
	btn.value = "Expand";
	buttondiv.appendChild(btn);
	div.appendChild(buttondiv);
	buttondiv = document.createElement("div");
	buttondiv.setAttribute("id", "buttondiv");
	buttondiv.className = "collapseDataStructure";
	buttondiv.style.display = "none";
	btn = document.createElement("input");
	btn.addEventListener("click", function() {
	    collapseElements("collapseDataStructure");
	    showAll = false;
	});
	btn.value = "Collapse";
	btn.type = "button";
	buttondiv.appendChild(btn);
	div.appendChild(buttondiv);
        
        var table = document.createElement("table");
        table.setAttribute("id", "dstable");
        var tableBody = dsTbody(size);
        tableBody.setAttribute("id","tablebody");            
        table.appendChild(tableBody);
        table.setAttribute("border", "2");
        div.appendChild(table);
    }
    return div;        
}

//Add gradient to points and corresponding table values 

function dsElement(type, num) {
    var ele = document.createElement(type);
    ele.className = "";
    ele.setAttribute("onmouseover", "hoverV("+num+", true)");
    ele.setAttribute("onmouseout", "hoverEndV("+num+", true)");
    ele.setAttribute("onclick", "labelClickHDX("+num+")");
    if (pts[num] > 0) {
	ele.setAttribute("id", "l"+num+"_"+pts[num]);
    }
    else {
	ele.setAttribute("id", "l"+num);
    }
    return ele;
}

var pts;

function dsTbody(size) {
    numVisitedString.nodeValue = "Number of Visited Vertices: " + numVisited;
    numVisitedComingOutString.nodeValue =
	"Number of Vertices Visited Coming out: " + numVisitedComingOut;
    numAlreadyVisitedString.nodeValue = "Number of Vertices already Visited: " +
	numAlreadyVisited;
    nameAndSize.nodeValue = discoveredVerticesName + " Size: " +
	discoveredVertices.length;
    var tableBody = document.createElement("tbody");
    pts = Array(waypoints.length);
    for (var i = 0; i < pts.length; i++) {
	pts[i] = 0;
    }
    if (discoveredVerticesName == "Stack") {
        for (var i = 0; i <= size ; i++) { 
	    var point =  discoveredVertices[discoveredVertices.length-(1+i)].vIndex;
            var row = dsElement("tr", point);			
	    var col = document.createElement("td");
	    col.innerHTML = point;
	    row.appendChild(col);
	    if (i > 9) {
		row.className = "collapseDataStructure";
	    }
	    pts[point]++;
            tableBody.appendChild(row);
        }
    }
    else if (discoveredVerticesName == "Queue" ||
	     discoveredVerticesName == "PQueue" ||
	     discoveredVerticesName == "List") {
	var row = document.createElement("tr");
        for (var i = 0; i <= size ; i++) { 				
            var col = dsElement("td", discoveredVertices[i].vIndex);
            if (i > 9) {
		col.className = "collapseDataStructure";
	    }
	    if (discoveredVerticesName == "PQueue") {
		col.innerHTML = discoveredVertices[i].vIndex + " dist: <span class="+curUnit+" style='color:black;' >"+convertMiles(discoveredVertices[i].dist)+" "
		    +curUnit+"</span>";
	    }
	    else {
		col.innerHTML = discoveredVertices[i].vIndex;
	    }
	    row.appendChild(col);
	    pts[discoveredVertices[i].vIndex]++;
            tableBody.appendChild(row);
        }
    }
    return tableBody;
}

function createSidePanelBtn() {
    //Creates the menu icon
    var showPanel = document.createElement("button");
    showPanel.setAttribute("id", "panelBtn");
    showPanel.innerHTML = '<i id="menuIcon" class="material-icons">menu</i>';
    showPanel.setAttribute("title", "Menu");
    showPanel.addEventListener("click", openSidePanel);
    document.body.appendChild(showPanel);
}

var sidePanelContent = ["Legend"];
function sidePanel() {
    var div = document.createElement("div");
    div.setAttribute("id", "sidePanel");
    var xButton = document.createElement("a");
    xButton.setAttribute("id", "closeButton");
    xButton.setAttribute("href", "javascript:void(0)");
    xButton.innerHTML = "&times;";
    xButton.addEventListener("click", closeSidePanel);
    div.appendChild(xButton);
    for (var i = 0; i < sidePanelContent.length; i++) {
	var contentArea = document.createElement("div");
	contentArea.setAttribute("id", "contentArea_" + sidePanelContent[i]);
	
	var panelContentLabels = document.createElement("a");
	panelContentLabels.setAttribute("id", sidePanelContent[i]);
	panelContentLabels.innerHTML = sidePanelContent[i];
	contentArea.appendChild(panelContentLabels);
	div.appendChild(contentArea);
    }
    div.appendChild(TOSLabel());
    document.body.appendChild(div);
}

function openSidePanel() {
    if (document.getElementById("sidePanel") != null) {
	document.getElementById("sidePanel").style.width = "250px";
	document.getElementById("main").style.marginLeft = "250px";
    }
}

function closeSidePanel() {
    document.getElementById("sidePanel").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function mainArea() {
    var main = document.createElement("div");
    main.setAttribute("id", "main");
    main.appendChild(document.getElementById("map"));
    main.appendChild(document.getElementById("togglecontents_table"));
    main.appendChild(document.getElementById("distUnits"));
    main.appendChild(document.getElementById("selected"));
    main.appendChild(document.getElementById("options"));
    main.appendChild(document.getElementById("pointbox"));
    main.appendChild(document.getElementById("AlgorithmVisualization"));
    main.appendChild(document.getElementById("controlbox"));
    main.appendChild(document.getElementById("contents_table"));
    main.appendChild(document.getElementById("panelBtn"));
    main.appendChild(document.getElementById("toggleselected"));
    document.body.appendChild(main);
}

var legendArray = [
    "undiscovered",
    "visiting",
    "leader",
    "discarded",
    "northLeader",
    "southLeader",
    "eastLeader",
    "westLeader",
    "shortLabelLeader",
    "longLabelLeader",
    "startVertex",
    "discoveredEarlier",
    "visitedEarlier",
    "spanningTree",
    "discovered",
    "hoverV",
    "hullK",
    "hullI"
];

function legendArea(vis) {
    var legendDiv = document.getElementById("contentArea_Legend");
    for (var i = 0; i < legendArray.length; i++) {
	if (vis.name == legendArray[i] && vis.name != null) {
	    if (vis.value == 1) {
		continue;
	    }
	    else {
		vis.value = 1;
		var boxContainer = document.createElement("div");
		boxContainer.setAttribute("id", "boxContainer");
		var box = document.createElement("div");
		var label = document.createElement("span");
		label.setAttribute("id", legendArray[i]);
		label.innerHTML = legendArray[i];
		box.setAttribute("class", "box");
		box.style.backgroundColor =  vis.color;
		boxContainer.appendChild(box);
		boxContainer.appendChild(label);
		legendDiv.appendChild(boxContainer);
	    }
	}
    }
}

// loadfromqs used to be part of loadmap, likely to be replaced with
// code generated by PHP later
function loadfromqs() {
    
    // check for a load query string parameter
    var qs = location.search.substring(1);
    //DBG.write("qs: " + qs);
    var qsitems = qs.split('&');
    for (var i = 0; i < qsitems.length; i++) {
	//DBG.write("qsitems[" + i + "] = " + qsitems[i]);
	var qsitem = qsitems[i].split('=');
	//DBG.write("qsitem[0] = " + qsitem[0]);
	if (qsitem[0] == "load") {
	    var request = new XMLHttpRequest();
	    //DBG.write("qsitem[1] = " + qsitem[1]);
	    document.getElementById('filename').innerHTML = qsitem[1];
	    request.open("GET", qsitem[1], false);
	    request.setRequestHeader("User-Agent", navigator.userAgent);
	    request.send(null);
	    if (request.status == 200) {
		processContents(request.responseText);
	    }
	}
    }
}

// shortcut function to display errors
function pointboxErrorMsg(msg) {
    pointbox = document.getElementById("pointbox");
    selected = document.getElementById("selected");
    
    pointbox.innerHTML = "<table class=\"gratable\"><thead><tr><th style=\"color: red\">" + msg + "</th></thead></table>";
    selected.innerHTML = pointbox.innerHTML;
    
}

// when a file is selected, this will be called
function startRead() {

    clearTables();
    // first, retrieve the selected file (as a File object)
    // which must be done before we toggle the table to force
    // the pointbox to be displayed
    var file = document.getElementById('filesel').files[0];
    
    // force highway data box to be displayed
    var menu = document.getElementById("showHideMenu");
    // menu.options[2].selected = true;
    // toggleTable();

    if (file) {
	//DBG.write("file: " + file.name);
	document.getElementById('filename').innerHTML = file.name;
	if ((file.name.indexOf(".wpt") == -1) &&
	    (file.name.indexOf(".pth") == -1) &&
	    (file.name.indexOf(".nmp") == -1) &&
	    (file.name.indexOf(".gra") == -1) &&
	    (file.name.indexOf(".tmg") == -1) &&
	    (file.name.indexOf(".wpl") == -1)) {
	    pointboxErrorMsg("Unrecognized file type!");
	    return;
	}
	if (file.name.includes("OCE-continent")) {
	    alert("This graph cannot be used with the Convex Hull algorithm as currently implemented, as it spans the international date line.");
	}
	// pointboxErrorMsg("Loading... (" + file.size + " bytes)");
	var reader;
	try {
	    reader = new FileReader();
	}
	catch(e) {
	    pointboxErrorMsg("Error: unable to access file (Perhaps no browser support?  Try recent Firefox or Chrome releases.).");
	    return;
	}
	reader.readAsText(file, "UTF-8");
	reader.onload = fileLoaded;
	//reader.onerror = fileLoadError;
    }
}

function readServer(event) {
    clearTables();
    var index = document.getElementById("mapOptions").selectedIndex;
    var value = document.getElementById("mapOptions").options[index].value;
    
    if (value != "") {
 	// document.getElementById("test").innerHTML = value;
 	
 	var xmlhttp = new XMLHttpRequest();
 	xmlhttp.onreadystatechange = function() {
 	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
 		
 		var file = new Blob([xmlhttp.responseText], {type : "text/plain"});
 		file.name = value;
 		
 		// force highway data box to be displayed
 		var menu = document.getElementById("showHideMenu");
 		// menu.options[2].selected = true;
 		// toggleTable();
		
 		if (file) {
 		    //DBG.write("file: " + file.name);
 		    document.getElementById('filename').innerHTML = file.name;
 		    if ((file.name.indexOf(".wpt") == -1) &&
 			(file.name.indexOf(".pth") == -1) &&
 			(file.name.indexOf(".nmp") == -1) &&
 			(file.name.indexOf(".gra") == -1) &&
 			(file.name.indexOf(".tmg") == -1) &&
 			(file.name.indexOf(".wpl") == -1)) {
 			pointboxErrorMsg("Unrecognized file type!");
 			return;
 		    }
 		    // pointboxErrorMsg("Loading... (" + file.size + " bytes)");
 		    var reader;
 		    try {
 			reader = new FileReader();
 		    }
 		    catch(e) {
 			pointboxErrorMsg("Error: unable to access file (Perhaps no browser support?  Try recent Firefox or Chrome releases.).");
 			return;
 		    }
 		    reader.readAsText(file, "UTF-8");
 		    reader.onload = fileLoaded;
 		    //reader.onerror = fileLoadError;
 		}
 	    }
 	};
 	xmlhttp.open("GET", "http://courses.teresco.org/metal/graphs/"+value, true);
 	xmlhttp.send();	
    }
}

// when the FileReader created in startRead has finished, this will be called
// to process the contents of the file
function fileLoaded(event) {
    // file done loading, read the contents
    processContents(event.target.result);
}

function undoCollapse(event) {
    var container = event.target.parentNode;
    var clss = "."+container.id.substring(0,container.id.indexOf("btn"));
    var elems = document.querySelectorAll(clss);
    for (var i = 0; i < elems.length; i++) {
	elems[i].style.display = "";
    }
    container.style.display = "none";
}

function collapseElements(clss) {
    var elems = document.querySelectorAll("."+clss);
    var btn = document.getElementById(clss+"btn");
    for (var i = 0; i < elems.length; i++) {
	elems[i].style.display = "none";
    }
    btn.style.display = "";
}

// process the contents of a String which came from a file or elsewhere
function processContents(fileContents) {
    collapseElements("loadcollapse");
    
    // place the contents into the file contents area (will improve later)
    // document.getElementById('pointbox').innerHTML = "<pre>" + fileContents + "</pre>";
    // document.getElementById('selected').innerHTML = "<pre>" + fileContents + "</pre>";
    
    var pointboxContents = "";
    
    // parse the file and process as appropriate
    // TODO: check that this is always still here when we ask, might be
    // better to store the filename in a variable for safe keeping
    var fileName = document.getElementById('filename').innerHTML;
    if (fileName.indexOf(".wpt") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Waypoint File)";
	pointboxContents = parseWPTContents(fileContents);
    }
    else if (fileName.indexOf(".pth") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Waypoint Path File)";
	pointboxContents = parsePTHContents(fileContents);
    }
    else if (fileName.indexOf(".nmp") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Near-Miss Point File)";
	pointboxContents = parseNMPContents(fileContents);
    }
    else if (fileName.indexOf(".wpl") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Waypoint List File)";
	pointboxContents = parseWPLContents(fileContents);
    }
    else if (fileName.indexOf(".gra") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Highway Graph File)";
	pointboxContents = parseGRAContents(fileContents);
    }
    else if (fileName.indexOf(".tmg") >= 0) {
	document.getElementById('filename').innerHTML = fileName + " (Highway Graph File)";
	pointboxContents = parseTMGContents(fileContents);
    }
    
    // document.getElementById('pointbox').innerHTML = pointboxContents;
    var newEle = document.createElement("div");
    newEle.setAttribute("id", "newEle");
    newEle.innerHTML = pointboxContents;
    document.getElementById('contents_table').appendChild(newEle);
    createDataTable("#waypoints");
    createDataTable("#connection");
    updateMap();   
}

function mapOptions(e) {
    
    var sels = document.getElementById("selects");
    var orderSel = document.getElementById("orderOptions").value;
    var resSel = document.getElementById("restrictOptions").value;
    var cateSel = document.getElementById("categoryOptions").value;
    var min = document.getElementById("minVertices").value;
    var max = document.getElementById("maxVertices").value;
    if (max < 0 || min < 0 || min > max) {
	return;
    }
    if ($("#mapOptions").length != 0) {
	sels.removeChild(document.getElementById("mapOptions"));
    }
    var mapSel = document.createElement("select");
    mapSel.setAttribute("id", "mapOptions");
    mapSel.setAttribute("onchange", "readServer(event)");
    var init = document.createElement("option");
    init.innerHTML = "Choose Map";
    init.value = "init";
    mapSel.appendChild(init);		
    sels.appendChild(mapSel);
    var params = {
	order:orderSel,
	restrict:resSel,
	category:cateSel,
	min:min,
	max:max
    };
    var jsonParams = JSON.stringify(params);
    $.ajax({
        type: "POST",
        url: "./generateMaps.php",
	datatype: "json",
        data: {"params":jsonParams},
        success: function(data) {
            var opts = $.parseJSON(data);
	    var txt = opts['text'];
	    var values = opts['values'];
	    var vertices = opts['vertices'];
	    var edges = opts['edges'];
	    var opt;
	    var str = "";
	    for (var i = 0; i < txt.length; i++) {
		opt = document.createElement("option");
		if (values[i].indexOf("simple") != -1) {
		    str = txt[i] + " (simple), size: (" + vertices[i] + ", " + edges[i] + ")";
		}
		else {
		    str = txt[i] + ", size: (" + vertices[i] + ", " + edges[i] + ")" ;
		}
		opt.innerHTML = str;
		opt.value = values[i];
		document.getElementById("mapOptions").appendChild(opt);
	    }
	}
    });
}

function clearTables() {
    if ($("#waypoints").length != 0) {
	document.getElementById("waypoints_wrapper").parentNode.parentNode.removeChild(document.getElementById("waypoints_wrapper").parentNode);
    }
    if ($("#connection").length!=0) {
	document.getElementById("connection_wrapper").parentNode.parentNode.removeChild(document.getElementById("connection_wrapper").parentNode);
    }
}

function createDataTable(id) {

    if ($(id).length > 0) {
	$(id).dataTable({
	    "destroy":true,
	    "paging":false,
	    "searching":false,
	    "info":false
	});
    }	
}

// in case we get an error from the FileReader
function errorHandler(evt) {

    if (evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
	// The file could not be read
	document.getElementById('filecontents').innerHTML = "Error reading file...";
    }
}

// parse the contents of a .tmg file
//
// First line specifies TMG and version number (expected to be 1.0),
// followed by the word "collapsed" (only supported option so far)
// indicating that the hidden vertices in the graph are collapsed
// into intermediate points along edges.
//
// Second line specifies the number of vertices, numV, and the number
// of edges, numE
//
// Next numV lines are a waypoint name (a String) followed by two
// floating point numbers specifying the latitude and longitude
//
// Next numE lines are vertex numbers (based on order in the file)
// that are connected by an edge followed by a String listing the
// highway names that connect those points, followed by pairs of
// floating point numbers, all space-separated, indicating the
// coordinates of any shaping points along the edge
//
function parseTMGContents(fileContents) {

    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    var header = lines[0].split(' ');
    if (header[0] != "TMG") {
	return '<table class="gratable"><thead><tr><th>Invalid TMG file (missing TMG marker on first line)</th></tr></table>';
    }
    if (header[1] != "1.0") {
	return '<table class="gratable"><thead><tr><th>Unsupported TMG file version (' + header[1] + ')</th></tr></table>';
    }
    if ((header[2] != "simple") && (header[2] != "collapsed")) {
	return '<table class="gratable"><thead><tr><th>Unsupported TMG graph format (' + header[2] + ')</th></tr></table>';
    }
    var counts = lines[1].split(' ');
    var numV = parseInt(counts[0]);
    var numE = parseInt(counts[1]);
    var summaryInfo = '<table class="gratable"><thead><tr><th>' + numV + " waypoints, " + numE + " connections.</th></tr></table>";

    var vTable = '<table id="waypoints" class="gratable"><thead><tr><th colspan="3">Waypoints</th></tr><tr><th>#</th><th>Coordinates</th><th>Waypoint Name</th></tr></thead><tbody>';

    waypoints = new Array(numV);
    for (var i = 0; i < numV; i++) {
	var vertexInfo = lines[i+2].split(' ');
	waypoints[i] = new Waypoint(vertexInfo[0], vertexInfo[1], vertexInfo[2], "", new Array());
	vTable += '<tr id="waypoint' + i +'" onmouseover = "hoverV('+i+', false)" onmouseout = "hoverEndV('+i+', false)" onclick = "labelClick('+i+')" ><td>' + i +
	    '</td><td>(' + parseFloat(vertexInfo[1]).toFixed(3) + ',' +
	    parseFloat(vertexInfo[2]).toFixed(3) + ')</td><td>'
	    + waypoints[i].label + '</td></tr>';
    }
    vTable += '</tbody></table>';

    var eTable = '<table  id="connection" class="gratable"><thead><tr  ><th colspan="3">Connections</th></tr><tr><th>#</th><th>Route Name(s)</th><th>Endpoints</th></tr></thead><tbody>';
    graphEdges = new Array(numE);
    for (var i = 0; i < numE; i++) {
      var edgeInfo = lines[i+numV+2].split(' ');
      var newEdge;
      if (edgeInfo.length > 3) {
        newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1], edgeInfo[2], edgeInfo.slice(3));
      }
      else {
        newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1], edgeInfo[2], null);
      }
      var firstNode = Math.min(parseInt(newEdge.v1), parseInt(newEdge.v2));
      var secondNode = Math.max(parseInt(newEdge.v1), parseInt(newEdge.v2));
      // add this new edge to my endpoint vertex adjacency lists
      waypoints[newEdge.v1].edgeList.push(newEdge);
      waypoints[newEdge.v2].edgeList.push(newEdge);

      eTable += '<tr onmouseover="hoverE(event,'+i+')" onmouseout="hoverEndE(event,'+i+')" onclick="edgeClick('+i+')" id="connection' + i + '" class="v_' + firstNode + '_' + secondNode + '"><td>' + i + '</td><td>' + edgeInfo[2] + '</td><td>'
      + edgeInfo[0] + ':&nbsp;' + waypoints[newEdge.v1].label +
      ' &harr; ' + edgeInfo[1] + ':&nbsp;'
      + waypoints[newEdge.v2].label + '</td></tr>';

      graphEdges[i] = newEdge;

    }
    eTable += '</tbody></table>';
    genEdges = false;
    usingAdjacencyLists = true;
    return summaryInfo + '<p />' + vTable + '<p />' + eTable;
}

// parse the contents of a .gra file
//
// First line specifies the number of vertices, numV, and the number
// of edges, numE
// Next numV lines are a waypoint name (a String) followed by two
// floating point numbers specifying the latitude and longitude
// Next numE lines are vertex numbers (based on order in the file)
// that are connected by an edge followed by a String listing the
// highway names that connect those points
function parseGRAContents(fileContents) {

    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    var counts = lines[0].split(' ');
    var numV = parseInt(counts[0]);
    var numE = parseInt(counts[1]);
    var sideInfo = '<table  class="gratable"><thead><tr><th>' + numV + " waypoints, " + numE + " connections.</th></tr></table>";

    var vTable = '<table class="gratable"><thead><tr><th colspan="3">Waypoints</th></tr><tr><th>#</th><th>Coordinates</th><th>Waypoint Name</th></tr></thead><tbody>';

    waypoints = new Array(numV);
    for (var i = 0; i < numV; i++) {
	var vertexInfo = lines[i+1].split(' ');
	waypoints[i] = new Waypoint(vertexInfo[0], vertexInfo[1], vertexInfo[2], "", "");
	vTable += '<tr><td>' + i +
	    '</td><td>(' + parseFloat(vertexInfo[1]).toFixed(3) + ',' +
	    parseFloat(vertexInfo[2]).toFixed(3) + ')</td><td>'
	    + "<a onclick=\"javascript:labelClick(" + i + ",'"
	    + waypoints[i].label + "\',"
	    + waypoints[i].lat + "," + waypoints[i].lon + ",0);\">"
	    + waypoints[i].label + "</a></td></tr>"
    }
    vTable += '</tbody></table>';

    var eTable = '<table class="gratable"><thead><tr><th colspan="3">Connections</th></tr><tr><th>#</th><th>Route Name(s)</th><th>Endpoints</th></tr></thead><tbody>';
    graphEdges = new Array(numE);
    for (var i = 0; i < numE; i++) {
	var edgeInfo = lines[i+numV+1].split(' ');
	graphEdges[i] = new GraphEdge(edgeInfo[0], edgeInfo[1], edgeInfo[2], null);
	eTable += '<tr><td>' + i + '</td><td>' + edgeInfo[2] + '</td><td>'
	    + edgeInfo[0] + ':&nbsp;' + waypoints[graphEdges[i].v1].label +
	    ' &harr; ' + edgeInfo[1] + ':&nbsp;'
	    + waypoints[graphEdges[i].v2].label + '</td></tr>';
    }
    eTable += '</tbody></table>';
    genEdges = false;
    return sideInfo + '<p />' + vTable + '<p />' + eTable;
}

// parse the contents of a .wpt file
//
// Consists of a series of lines each containing a waypoint name
// and an OSM URL for that point's location:
//
/*
YT1_S http://www.openstreetmap.org/?lat=60.684924&lon=-135.059652
MilCanRd http://www.openstreetmap.org/?lat=60.697199&lon=-135.047250
+5 http://www.openstreetmap.org/?lat=60.705383&lon=-135.054932
4thAve http://www.openstreetmap.org/?lat=60.712623&lon=-135.050619
*/
function parseWPTContents(fileContents) {

    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    graphEdges = new Array();
    waypoints = new Array();
    for (var i = 0; i < lines.length; i++) {
	if (lines[i].length > 0) {
	    waypoints[waypoints.length] = WPTLine2Waypoint(lines[i]);
	}
    }
    genEdges = true;
    return "<h2>Raw file contents:</h2><pre>" + fileContents + "</pre>";
}

// parse the contents of a .pth file
//
// Consists of a series of lines each containing a route name, zero or
// more intermediate points (latitude, longitude pairs), then a
// waypoint name and a latitude and a longitude, all space-separated,
// or a line containing a route name and waypoint name followed by a
// lat,lng pair in parens
//
/*
START YT2@BorRd (60.862343,-135.196595)
YT2 YT2@TakHSRd (60.85705,-135.202029)
YT2 (60.849881,-135.203934) (60.844649,-135.187111) (60.830141,-135.187454) YT1_N/YT2_N (60.810264,-135.205286)
YT1,YT2 (60.79662,-135.170288) YT1/YT2@KatRd (60.788579,-135.166302)
YT1,YT2 YT1/YT2@WannRd (60.772479,-135.15044)
YT1,YT2 YT1/YT2@CenSt (60.759893,-135.141191)

or

START YT2@BorRd 60.862343 -135.196595
YT2 YT2@TakHSRd 60.85705 -135.202029
YT2 60.849881 -135.203934 60.844649 -135.187111 60.830141 -135.187454 YT1_N/YT2_N 60.810264 -135.205286
YT1,YT2 60.79662 -135.170288 YT1/YT2@KatRd 60.788579 -135.166302
YT1,YT2 YT1/YT2@WannRd 60.772479 -135.15044
YT1,YT2 YT1/YT2@CenSt 60.759893 -135.141191

*/
function parsePTHContents(fileContents) {

    var table = '<table class="pthtable"><thead><tr><th>Route</th><th>To Point</th><th>Seg.<br>Miles</th><th>Cumul.<br>Miles</th></tr></thead><tbody>';
    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    graphEdges = new Array();
    waypoints = new Array();
    var totalMiles = 0.0;
    var segmentMiles = 0.0;
    var previousWaypoint = null;
    for (var i = 0; i < lines.length; i++) {
	if (lines[i].length > 0) {
	    // standardize first
	    var line = standardizePTHLine(lines[i]);
	    var info = PTHLineInfo(line, previousWaypoint);
	    waypoints[waypoints.length] = info.waypoint;
	    totalMiles += info.mileage;
	    // this will display as a graph, so create and assign the
	    // graph edges
	    if (previousWaypoint != null) {
		var newEdge = new GraphEdge(i-1, i, info.waypoint.elabel, info.via);
		previousWaypoint.edgeList[previousWaypoint.edgeList.length] = newEdge;
		info.waypoint.edgeList[0] = newEdge;
	    }
	    previousWaypoint = info.waypoint;
	    table += '<tr><td>' + waypoints[waypoints.length-1].elabel +
		"</td><td><a onclick=\"javascript:labelClick(" + 0 + ",\'"
	        + waypoints[waypoints.length-1].label + "\',"
	        + waypoints[waypoints.length-1].lat + "," + waypoints[waypoints.length-1].lon +
		",0);\">" + waypoints[waypoints.length-1].label +
		'</a></td><td style="text-align:right">' + info.mileage.toFixed(2) +
		'</td><td style="text-align:right">' + totalMiles.toFixed(2) +
		'</td></tr>';
	}
    }
    table += '</tbody></table>';
    //genEdges = true;
    usingAdjacencyLists = true;
    return table;
}

// parse the contents of a .nmp file
//
// Consists of a series of lines, each containing a waypoint name
// followed by two floating point numbers representing the point's
// latitude and longitude
//
// Entries are paired as "near-miss" points, and a graph edge is
// added between each pair for viewing.
//
function parseNMPContents(fileContents) {

    var table = '<table class="nmptable"><thead /><tbody>';
    // all lines describe waypoints
    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    waypoints = new Array();
    for (var i = 0; i < lines.length; i++) {
	if (lines[i].length > 0) {
	    var xline = lines[i].split(' ');
	    if (xline.length == 3) {
		waypoints[waypoints.length] = new Waypoint(xline[0], xline[1], xline[2], "", "");
	    }
	}
    }
    // graph edges between pairs, will be drawn as connections
    var numE = waypoints.length/2;
    graphEdges = new Array(numE);
    for (var i = 0; i < numE; i++) {
	// add the edge
	graphEdges[i] = new GraphEdge(2*i, 2*i+1, "", null);

	// add an entry to the table to be drawn in the pointbox
	var miles = distanceInMiles(waypoints[2*i].lat, waypoints[2*i].lon,
				    waypoints[2*i+1].lat,
				    waypoints[2*i+1].lon).toFixed(4);
	var feet = distanceInFeet(waypoints[2*i].lat, waypoints[2*i].lon,
				  waypoints[2*i+1].lat,
				  waypoints[2*i+1].lon).toFixed(2);
	table += "<tr><td><table class=\"nmptable2\"><thead /><tbody><tr><td>"
	    + "<a onclick=\"javascript:labelClick(" + 2*i + ",\'"
	    + waypoints[2*i].label + "\',"
	    + waypoints[2*i].lat + "," + waypoints[2*i].lon + ",0);\">"
	    + waypoints[2*i].label + "</a></td><td>("
	    + waypoints[2*i].lat + ","
	    + waypoints[2*i].lon + ")</td></tr><tr><td>"
	    + "<a onclick=\"javascript:labelClick(" + 2*i+1 + ",\'"
	    + waypoints[2*i+1].label + "\',"
	    + waypoints[2*i+1].lat + "," + waypoints[2*i+1].lon + ",0);\">"
	    + waypoints[2*i+1].label + "</a></td><td>("
	    + waypoints[2*i+1].lat + ","
	    + waypoints[2*i+1].lon + ")</td></tr>"
	    + "</tbody></table></td><td>"
	    + miles  + " mi/"
	    + feet + " ft</td></tr>";
    }

    table += "</tbody></table>";
    genEdges = false;
    return table;
}

// parse the contents of a .wpl file
//
// Consists of a series of lines, each containing a waypoint name
// followed by two floating point numbers representing the point's
// latitude and longitude
//
function parseWPLContents(fileContents) {

    var vTable = '<table class="gratable"><thead><tr><th colspan="2">Waypoints</th></tr><tr><th>Coordinates</th><th>Waypoint Name</th></tr></thead><tbody>';

    // all lines describe waypoints
    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    waypoints = new Array();
    for (var i = 0; i < lines.length; i++) {
	if (lines[i].length > 0) {
	    var vertexInfo = lines[i].split(' ');
	    if (vertexInfo.length == 3) {
		var w = new Waypoint(vertexInfo[0], vertexInfo[1], vertexInfo[2], "", "");
		waypoints[waypoints.length] = w;
		vTable += '<tr><td>(' + parseFloat(vertexInfo[1]).toFixed(3) + ',' +
		    parseFloat(vertexInfo[2]).toFixed(3) + ')</td><td>'
		    + "<a onclick=\"javascript:labelClick(" + i + ",'"
		    + w.label + "\',"
		    + w.lat + "," + w.lon + ",0);\">"
		    + w.label + "</a></td></tr>"
	    }
	}
    }
    vTable += '</tbody></table>';
    // no edges here
    graphEdges = new Array();
    genEdges = false;
    var summaryInfo = '<table class="gratable"><thead><tr><th>' + waypoints.length + " waypoints.</th></tr></table>";
    return summaryInfo + '<p />' + vTable;
}

function WPTLine2Waypoint(line) {

    // remove extraneous spaces in the line
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');

    var xline = line.split(' ');
    if (xline.length < 2) {
	return Waypoint('bad-line', 0, 0);
    }
    var label = xline[0];
    var url = xline[1];
    var latlon = Url2LatLon(url);
    return new Waypoint(label, latlon[0], latlon[1], 0, "");
}

// convert an openstreetmap URL to a latitude/longitude
function Url2LatLon(url) {

    var latlon = new Array(0., 0.);
    var floatpattern = '([-+]?[0-9]*\.?[0-9]+)';
    var latpattern = 'lat=' + floatpattern;
    var lonpattern = 'lon=' + floatpattern;

    //search for lat
    var matches = url.match(latpattern);
    if (matches != null) {
	latlon[0] = parseFloat(matches[1]).toFixed(6);
    }

    //search for lon
    matches = url.match(lonpattern);
    if (matches != null) {
	latlon[1] = parseFloat(matches[1]).toFixed(6);
    }

    return latlon;
}

// "standardize" a PTH line so it has coordinates separated by a space
// instead of in parens and with any extraneous spaces removed
function standardizePTHLine(line) {

    // remove extraneous spaces
    var newline = line;
    do {
	line = newline;
	newline = line.replace('  ',' ');
    } while (line != newline);


    // if this doesn't end in a paren, we should be good
    if (!line.endsWith(')')) {
	return line;
    }

    // this ends in a paren, so we convert each "(lat,lng)" group to
    // simply "lat lng"
    var xline = line.split(' ');
    line = xline[0];
    for (var pos = 1; pos < xline.length; pos++) {
	var newlatlng = xline[pos];
	if ((xline[pos].charAt(0) == '(') &&
	    (xline[pos].indexOf(',') > 0) &&
	    (xline[pos].charAt(xline[pos].length-1) == ')')) {
	    newlatlng = xline[pos].replace('(', '');
	    newlatlng = newlatlng.replace(',', ' ');
	    newlatlng = newlatlng.replace(')', '');
	}
	line += " " + newlatlng;
    }
    return line;
}

// convert a "standardized" PTH line to a Waypoint object with support
// for intermediate points along a segment
function PTHLine2Waypoint(line) {

    var xline = line.split(' ');
    if (xline.length < 4) {
	return Waypoint('bad-line', 0, 0);
    }
    return new Waypoint(xline[xline.length-3], xline[xline.length-2], xline[xline.length-1], 0, xline[0]);

}

// OLD: convert PTH line to a Waypoint object
function PTHLine2WaypointOLD(line) {

    // remove any extraneous spaces in the line
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');
    line = line.replace('  ', ' ');

    var xline = line.split(' ');
    // check for and convert a (lat,lng) format
    if ((xline.length == 3) &&
	(xline[2].charAt(0) == '(') &&
	(xline[2].indexOf(',') > 0) &&
	(xline[2].charAt(xline[2].length-1) == ')')) {
	newlatlng = xline[2].replace('(', '');
	newlatlng = newlatlng.replace(',', ' ');
	newlatlng = newlatlng.replace(')', '');
	return PTHLine2Waypoint(xline[0] + " " + xline[1] + " " + newlatlng);
    }
    if (xline.length < 4) {
	return Waypoint('bad-line', 0, 0);
    }
    return new Waypoint(xline[1], xline[2], xline[3], 0, xline[0]);
}

// mileage with a "standardized" PTH line that could have intermediate points
// to include
function mileageWithPTHLine(from, to, line) {

    var xline = line.split(' ');
    if (xline.length == 4) {
	// no intermediate points, so just compute mileage
	return distanceInMiles(from.lat, from.lon, to.lat, to.lon);
    }

    // we have more points, compute sum of segments
    var total = 0.0;
    var last_lat = from.lat;
    var last_lon = from.lon;
    var num_points = (xline.length - 4) / 2;
    for (var i = 0; i < num_points; i++) {
	var this_lat = parseFloat(xline[2*i+1]).toFixed(6);
	var this_lon = parseFloat(xline[2*i+2]).toFixed(6);
	total += distanceInMiles(last_lat, last_lon, this_lat, this_lon);
	last_lat = this_lat;
	last_lon = this_lon;
    }
    total += distanceInMiles(last_lat, last_lon, to.lat, to.lon);
    return total;
}

// parse all useful info from a "standardized" PTH file line and
// return in an object with fields for waypoint (a Waypoint object),
// mileage (a number), and via, an array of lat/lng values the
// path passes through that will be used to construct the edge
// that this line represents in the path
// extra parameter is the previous waypoint for mileage computation
function PTHLineInfo(line, from) {

    var xline = line.split(' ');
    if (xline.length < 4) {
	return {
	    waypoint: Waypoint('bad-line', 0, 0),
	    mileage: 0.0,
	    via: null};
    }
    var result = {
	waypoint: new Waypoint(xline[xline.length-3], xline[xline.length-2],
			       xline[xline.length-1], xline[0], new Array()),
	mileage: 0.0,
	via: null
    };

    if (xline.length == 4) {
	// no intermediate points, so just compute mileage and have a
	// null "via" list
	if (from != null) {
	    result.mileage = distanceInMiles(from.lat, from.lon,
					     result.waypoint.lat,
					     result.waypoint.lon);
	}
	result.via = null;
    }
    else {
	// we have more points, compute sum of segments
	// and remember our list of lat/lng points in via
	var total = 0.0;
	var last_lat = from.lat;
	var last_lon = from.lon;
	var num_points = (xline.length - 4) / 2;
	for (var i = 0; i < num_points; i++) {
	    var this_lat = parseFloat(xline[2*i+1]).toFixed(6);
	    var this_lon = parseFloat(xline[2*i+2]).toFixed(6);
	    total += distanceInMiles(last_lat, last_lon, this_lat, this_lon);
	    last_lat = this_lat;
	    last_lon = this_lon;
	}
	total += distanceInMiles(last_lat, last_lon,
				 result.waypoint.lat, result.waypoint.lon);
	result.mileage = total;
	result.via = xline.slice(1,xline.length-3);
    }
    return result;
}

function toggleTable() {
    var menu = document.getElementById("showHideMenu");
    var index = menu.selectedIndex;
    var value = menu.options[index].value;
    //  var algoTable = menu.algorithmbased.value;
    var pointbox = document.getElementById("pointbox");
    var options = document.getElementById("options");
    var selected = document.getElementById("selected");
    var algorithmVisualization =
	document.getElementById("AlgorithmVisualization");
    // show only table (or no table) based on value
    if (value == "pointbox") {
	selected.removeChild(selected.childNodes[selected.childNodes.length-1]);
	var newEle = document.createElement("div");
	newEle.setAttribute("id", "newEle");
	newEle.innerHTML = pointbox.innerHTML;
	if ($("#connection").length != 0 || $("#waypoints").length != 0)
	    document.getElementById("connection").parentNode.parentNode.style.display = "";
	selected.appendChild(newEle);
    }
    else if (value == "options") {
	selected.removeChild(selected.childNodes[selected.childNodes.length-1]);
	var newEle = document.createElement("div");
	newEle.setAttribute("id", "newEle");
	newEle.innerHTML = options.innerHTML;
	selected.appendChild(newEle);
	if ($("#connection").length != 0 || $("#waypoints").length != 0)
	    document.getElementById("connection").parentNode.parentNode.style.display = "";
	if (document.querySelector(".loadcollapse").style.display == "none")
	    document.getElementById("loadcollapsebtn").style.display = "";
    }
    else if (value =="AlgorithmVisualization") {
	selected.removeChild(selected.childNodes[selected.childNodes.length-1]);
	var newEle = document.createElement("div");
	newEle.setAttribute("id", "newEle");
	newEle.innerHTML = algorithmVisualization.innerHTML;
	selected.appendChild(newEle);
	if ($("#connection").length != 0 || $("#waypoints").length != 0)
	    document.getElementById("connection").parentNode.parentNode.style.display = "";
	if (document.querySelector(".loadcollapse").style.display == "none")
	    document.getElementById("loadcollapsebtn").style.display = "";
    }
    else {  
	selected.removeChild(selected.childNodes[selected.childNodes.length-1]);
	var newEle = document.createElement("div");
	newEle.setAttribute("id", "newEle");
	selected.appendChild(newEle);
	if ($("#connection").length != 0 || $("#waypoints").length != 0)
	    document.getElementById("connection").parentNode.parentNode.style.display = "none";
    }
}

// get the selected algorithm from the AlgorithmSelection menu
// (factored out here to avoid repeated code)
function getCurrentAlgorithm() {
    var menuSelection = document.getElementById("AlgorithmSelection");
    var selectionIndex = menuSelection.selectedIndex;
    return menuSelection.options[selectionIndex].value;
}

function showHiddenPseudocode() {
    var show = document.getElementById("showHidden").checked;
    var value = getCurrentAlgorithm();
    if (show) {
        if (value == "BFS") {
            document.getElementById('pseudo').innerHTML = "<pre> unmark all vertices\n " +
                "  choose some starting vertex x \n" + "  mark x \n" +
                " list L = x\n " + " tree T = x\n " + "  while L nonempty\n  " +
                " choose some vertex v from front of list\n " + "  visit v\n " +
                " for each unmarked neighbor w\n " + " mark w\n " + " add it to end of list\n " + " add edge vw to T\n </pre>";
        } else if (value == "DFS") {
            document.getElementById('pseudo').innerHTML = " <pre>Algorithm DFS(graph G, Vertex v)\n" +
                " for all edges e in G.incidentEdges(v) do\n" + " if edge e is unexplored then\n" +
                " w = G.opposite(v, e)\n" + " if vertex w is unexplored then\n" +
                " label e as discovery edge\n" + " recursively call DFS(G, w)\n<pre>"
            " else\n" + " label e a a back edge\n";
        } else if (value == "vertexSearch") {
            document.getElementById('pseudo').innerHTML =
                "<pre>longest = 0\n" +
                "shortest = 0\n" +
                "north = 0\n" +
                "south = 0\n" +
                "east = 0\n" +
                "west = 0\n" +
                "for (i=1 to |V|-1) {\n" +
                "  if (len(v[i].label) > len(v[longest]))) {\n" +
                "    longest = i\n" +
                "  }\n" +
                "  if (len(v[i].label) < len(v[shortest]))) {\n" +
                "    shortest = i\n" +
                "  }\n" +
                "  if (v[i].lat > v[north].lat) {\n" +
                "    north = i\n" +
                "  }\n" +
                "  if (v[i].lat < v[south].lat) {\n" +
                "    south = i\n" +
                "  }\n" +
                "  if (v[i].lng < v[west].lng) {\n" +
                "    west = i\n" +
                "  }\n" +
                "  if (v[i].lng > v[east].lng) {\n" +
                "    east = i\n" +
                "  }\n" +
                "}</pre>";
        } else if (value == "EdgeSearch") {
            document.getElementById('pseudo').innerHTML = "<pre>// fill in for real later\nlongest = 0\n</pre>";
        } else if (value == "RFS") {
            document.getElementById('pseudo').innerHTML = "<pre>// fill in for real later\nlongest = 0\n</pre>";
        }
        else if (value == "ConvexHull") {
            document.getElementById('pseudo').innerHTML =
                "<pre><div id='for1'>for(i=1 to n–1) { </div>" + 
                "<div id ='for2'>    for(j=i+1 to n) {</div>" +
                "<div id ='drawLine'>        L=line through pointI and pointJ</div>" 
                +"           if ( all other points lie on the same side of L) {"+
                "<div id ='drawLine2'>              add pointI and pointJ to the boundary</div>"+
                "        }\n    }\n}\n</pre>";
        }  
        else {
            document.getElementById('pseudo').innerHTML = "";
        }
    }
}

function selectAlgorithmAndStart() {
    var value = getCurrentAlgorithm();
    if (value == "vertexSearch") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startVertexSearch();
    }
    else if (value == "EdgeSearch") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startEdgeSearch();
    }
    else if (value == "BFS") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startGraphTraversal("BFS");
    }
    else if (value == "DFS") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startGraphTraversal("DFS");
    }
    else if (value == "RFS") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startGraphTraversal("RFS");
    }
    else if (value == "ConvexHull") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        bruteForceConvexHull();
    } else if (value == "connected") {
	resetVars();
	hdxAV.previousAlgorithm = value;
        startConnectedPieces(-1, null);
    }
    else if (value == "Dijkstra") {
	resetVars();
	hdxAV.previousAlgorithm = value;
	startDijkstra();
	
    }
}

function showLegend() {
    var show = document.getElementById("showLegend").checked;
    var value = getCurrentAlgorithm();
    if (show) {
        if (value == "vertexSearch") {
            document.getElementById('legends').innerHTML = "<pre> Longest Label : green \n " +
                "Shortest Label: brown \n" + " Vertex winners in the table and map: red \n" +
                " Current vertex in the table and map : yellow \n</pre>";
        }
	else if (value == "DFS") {
            document.getElementById('legends').innerHTML = "<pre> Starting vertex : green\n" + " Vertex visiting for the first time : yellow\n" + " Edges got used before visiting the candidate : red\n" +
                " Neighbor edges and possible next candidate: purple\n" + " Vertex in the stack : blue\n" + " Vertex that no be in the stack anymore : gray\n </pre>";
        }
	else if (value == "BFS") {
            document.getElementById('legends').innerHTML = "<pre> Starting vertex : green\n" + "<i>show the yellow</i> \n" + "Edges got used before visiting the candidate : red\n" +
                " Neighbor edges and possible next candidate: purple\n" + " Vertex in the queue : blue\n" + " Vertex that no be in the queue anymore : gray\n </pre>";
        }
	else if (value == "EdgeSearch") {
            document.getElementById('legends').innerHTML = "<pre>// fill in for real later \n</pre>";
        }
	else if (value == "RFS") {
            document.getElementById('legends').innerHTML = "<pre> Starting vertex : green\n" + " Vertex visiting for the first time : yellow\n" + " Edges got used before visiting the candidate : red\n" +
                " Neighbor edges and possible next candidate: purple\n" + " Vertex in the list : blue\n" + " Vertex that no be in the list anymore : gray\n </pre>";
        }
    }
    else {
        document.getElementById('legends').innerHTML = "";
    }
}

function selectAlgorithmAndCheckBoxes() {
    // var show = document.getElementById("selection_checkboxes").checked;
    // if (show == true) {
    var value = getCurrentAlgorithm();
    if (value == "vertexSearch") {
	document.getElementById("algorithmStatus").style.display = "";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = '<input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>';
    }
    else if (value == "EdgeSearch") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = '<input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>';
    }
    else if (value == "BFS") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = 'Start Vertex <input id="startPoint" onfocus="startPointInput()" type="number" name="Starting Point" value="0"  min="0" size="7" /> ' +
            '<br><input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>'+ '<input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    }
    else if (value == "DFS") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = 'Start Vertex <input id="startPoint" onfocus="startPointInput()" type="number" min="0" name="Starting Point" value="0" size="7" /> <br><input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>' + '<input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    }
    else if (value == "RFS") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = 'Start Vertex <input id="startPoint" onfocus="startPointInput()" type="number" name="Starting Point" min="0" value="0" size="7" /> ' + '<br><input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>' + '<input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    }
    else if (value == "connected") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = 'Start Vertex <input id="startPoint" onfocus="startPointInput()" type="number" name="Starting Point" min="0" value="0" size="7" /> ' + '<br><input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>' + '<input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    }
    else if (value == "Dijkstra") {
	document.getElementById("algorithmStatus").style.display = "none";
	document.getElementById("algorithmStatus").innerHTML = "";
        document.getElementById('optionSection').innerHTML = 'Start Vertex <input id="startPoint" onfocus="startPointInput()" type="number" min="0" name="Starting Point" value="0" size="7" /> <br>' + 'End &nbspVertex <input id="endPoint" onfocus="endPointInput()" type="number" min="0" name="End Point" value="0" size="7" /> <br>' + '<input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>' + '<input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    }
    else if (value == "ConvexHull") {
        alert("This is an n^3 algorithm. This means that it takes quite a while to execute fully so it would be most beneficial to use a small graph.");
        document.getElementById('optionSection').innerHTML = '<input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br>';
    }
    else {
        document.getElementById('optionSection').innerHTML = "";
    }
}

function toggleDS() {
    var ds = document.getElementById("algorithmStatus");
    if (ds.style.display == "none") {
	ds.style.display = "";
    }
    else {
	ds.style.display = "none";
    }
}

function selectAlgorithmAndReset() {
    for (var i = 0; i < connections.length; i++) {
        connections[i].setMap(null);
        document.getElementById('connection' + i).style.backgroundColor = "white";
    }
    connections = new Array();
    polypoints = new Array();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
        document.getElementById('waypoint' + i).style.backgroundColor = "white";
    }
    markers = new Array();
    markerinfo = new Array();
}

function drag(event) {
    var x = event.target.style.left;
    var y = event.target.style.top;
    event.dataTransfer.setData("id",event.target.id);
    if (x == "70%") {		
	event.dataTransfer.setData("x",document.documentElement.clientWidth*.7-event.clientX);
    }
    else {
	event.dataTransfer.setData("x",parseInt(x.substring(0,x.length-2))-event.clientX);
    }
    event.dataTransfer.setData("y",parseInt(y.substring(0,y.length-2))-event.clientY);
}

function drop(event) {
    event.preventDefault();
    var de = document.getElementById(event.dataTransfer.getData("id"));
    de.style.left =
	(event.clientX+parseInt(event.dataTransfer.getData("x"))) + 'px';
    de.style.top =
	(event.clientY+parseInt(event.dataTransfer.getData("y"))) + 'px';
}

function allowdrop(event) {
    event.preventDefault();
}   

function toggleUI(event) {
    var button = event.target;
    var panel1 = document.getElementById(button.id.substring(6));
    if (button.value.substring(0,4) == "Hide") {
	button.value = "Show"+ button.value.substring(4);
	panel1.style.display = "none";
    }
    else {
	button.value = "Hide"+button.value.substring(4);
	panel1.style.display = "";
    }
}

function makeResize() {
    $( "#selected" ).resizable();
    var div = document.createElement("div");
    div.setAttribute("id", "resize");
    document.getElementById("selected").appendChild(div);
    $( "#contents_table" ).resizable();
}

// moved to the end for now, until all variables are grouped by algorithm
function resetVars() {
    if (hdxAV.done ||
	hdxAV.previousAlgorithm != document.getElementById("AlgorithmSelection").value) {
	//hdxAV.done = false;
	hdxAV.reset();
	updateMap();
	northIndex = -1;
	southIndex = -1;
	eastIndex = -1;
	westIndex = -1;
	shortIndex = -1;
	longIndex = -1;
	
	minDistance = 9999999;
	maxDistance = -999999;
	edgeMin = null;
	edgeMax = null;
	edgeshort = null;
	edgelong = null;
	currentEdgeIndex = 0;
	shortestELabel = null;
	longestELabel = null;
	maxnum = -1;
	minnum = -1;
	shortnum = -1;
	longnum = -1;
	flag = "";
	
	discoveredVertices = [];
	visitedVertices = [];
	
	numVisited = 0;
	numVisitedComingOut = 0;
	numAlreadyVisited = 0;
	
	hull = [];
	hullI = 0;
	hullJ = 0;
	hull = [];
	convexLineHull = [];
	visitingLine = [];
	
	createTable = false;
	showAll = false;
	numVisitedString = document.createTextNode("Number of Visited Vertices: " + numVisited);
	numVisitedComingOutString = document.createTextNode("Number of Vertices Visited Coming out: " + numVisitedComingOut);
	numAlreadyVisitedString = document.createTextNode("Number of Vertices already Visited: " + numAlreadyVisited);
	nameAndSize = document.createTextNode(discoveredVerticesName + " Size: " + discoveredVertices.length);
	
	red = 255;
	green = 0;
	blue = 0;
	piecenum = 1;
	gred = 245;
	ggrn = 255;
	gblu = 245;
	
	totalPath = Array();
	
	if ($("#piecesTD").length > 0) {
	    document.getElementById("piecesTD").parentNode.parentNode.removeChild(document.getElementById("piecesTD").parentNode);
	}
	for (var i = 0; i < 7; i++) {
	    if ($("#info"+i).length > 0) {
		document.getElementById("info"+i).parentNode.parentNode.removeChild(document.getElementById("info"+i).parentNode);
	    }
	}
	document.getElementById("algorithmStatus").innerHTML = "";	
    }
}


/**********************************************************************
 * General utility functions
 **********************************************************************/

// print a list to the console
function printList(items) {

    console.log(listToVIndexString(items));
}

// return a String containing the objects in a list
function listToVIndexString(items) {
    if (items.length == 0) {
        return "[]";
    }
    else {
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
