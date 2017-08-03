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

// Essentially an enum of possible states of the simulation, used to
// ensure that only things that should be done are permitted in a
// given state.  Any AV_ state implies that a graph is loaded.  
var hdxStates = {

    NO_DATA: 1,
    GRAPH_LOADED: 2,
    WPT_LOADED: 3,
    NMP_LOADED: 4,
    WPL_LOADED: 5,
    PTH_LOADED: 6,
    AV_SELECTED: 7,
    AV_RUNNING: 8,
    AV_PAUSED: 9,
    AV_COMPLETE: 10
};

// group of variables used by many or all algorithm visualizations
var hdxAV = {
    // current state of HDX
    status: hdxStates.NO_DATA,

    // delay (in ms) between visualization steps
    // default delay 50 should match the selected option in the speedChanger
    // and delay should be used for the amount of time in the future to use
    // for setTimeout calls
    delay: 50,

    // list of available AVs
    avList: [],
    
    // remember the currently-selected AV
    currentAV: null,
    
    // what was the most recent algorithm?
    previousAlgorithm: null,

    // reset values
    reset: function() {
	this.previousAlgorithm = null;
	this.delay = 50;
    },

    // some commonly-used document elements
    algStat: null,
    algOptions: null,
    startPause: null,
    
    // set the status and do any needed cleanup for that change
    setStatus(newStatus) {
	
	if (this.status == newStatus) {
	    return;
	}

	this.status = newStatus;
	switch (newStatus) {
	case hdxStates.GRAPH_LOADED:
	case hdxStates.WPT_LOADED:
	case hdxStates.PTH_LOADED:
	case hdxStates.NMP_LOADED:
	case hdxStates.WPL_LOADED:
	    this.algStat.innerHTML = "";
	    this.algOptions.innerHTML = "";
	    break;

	case hdxStates.AV_COMPLETE:
	    this.startPause.disabled = true;
	    this.startPause.innerHTML = "Start";
	    break;
	}
    },
    
    // are we paused?
    paused() {
	return this.status == hdxStates.AV_PAUSED;
    },

    // all setup that needs to happen on page load for HDX
    initOnLoad() {
	
	// populate the list of algorithms -- add new entries here
	this.avList.push(hdxNoAV);
	this.avList.push(hdxVertexExtremesSearchAV);
	this.avList.push(hdxEdgeExtremesSearchAV);
	this.avList.push(hdxGraphTraversalsAV);
	this.avList.push(hdxDijkstraAV);
	this.avList.push(hdxBFConvexHullAV);
	
	// populate the algorithm selection select with options
	// from the avList
	let s = document.getElementById("AlgorithmSelection");
	s.innerHTML = "";
	for (var i = 0; i < this.avList.length; i++) {
	    let av = this.avList[i];
	    s.innerHTML += '<option value="' + av.value +
		'">' + av.name + '</option>';	    
	}

	// make the "selected" div resizable, was function makeResize()
	$( "#selected" ).resizable();
	var div = document.createElement("div");
	div.setAttribute("id", "resize");
	document.getElementById("selected").appendChild(div);
	$( "#contents_table" ).resizable();

	// initalize table for upper right side dropdown
	toggleTable();

	// set up side panel
	sidePanel();

	// set up main area, was function mainArea()
	var main = document.createElement("div");
	main.setAttribute("id", "main");
	main.appendChild(document.getElementById("map"));
	main.appendChild(document.getElementById("togglecontents_table"));
	//main.appendChild(document.getElementById("distUnits"));
	main.appendChild(document.getElementById("selected"));
	main.appendChild(document.getElementById("options"));
	main.appendChild(document.getElementById("pointbox"));
	main.appendChild(document.getElementById("AlgorithmVisualization"));
	main.appendChild(document.getElementById("controlbox"));
	main.appendChild(document.getElementById("contents_table"));
	main.appendChild(document.getElementById("panelBtn"));
	main.appendChild(document.getElementById("toggleselected"));
	document.body.appendChild(main);

	// set up some references to commonly-used document elements
	this.algStat = document.getElementById("algorithmStatus");
	this.algOptions = document.getElementById("algorithmOptions");
	this.startPause = document.getElementById("startPauseButton");

	// register the HDX-specific event handler for waypoint clicks
	registerMarkerClickListener(labelClickHDX);
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

    // both vertex and edge search
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

/* add entry to the algorithm visualization control panel */
function addEntryToAVControlPanel(namePrefix, vs) {
    
    let avControlTbody = document.getElementById('AVControlPanel');
    let infoBox = document.createElement('td');
    let infoBoxtr= document.createElement('tr');
    infoBox.setAttribute('id', namePrefix + "AVCPEntry");
    infoBox.setAttribute('style', "color:" + vs.textColor +
			 "; background-color:" + vs.color);
    infoBoxtr.appendChild(infoBox);
    avControlTbody.appendChild(infoBoxtr);
}

/* remove entry from algorithm visualization control panel */
function removeEntryFromAVControlPanel(namePrefix) {

    let avControlTbody = document.getElementById('AVControlPanel');
    let infoBox = document.getElementById(namePrefix + "AVCPEntry");
    let infoBoxtr= infoBox.parentNode;
    avControlTbody.removeChild(infoBoxtr);
}

/* set the HTML of an AV control panel entry */
function updateAVControlEntry(namePrefix, text) {

    document.getElementById(namePrefix + "AVCPEntry").innerHTML = text;
}


/* Support for selection of a vertex (such as a starting or ending
   vertex for a traversal or search) by clicking on a waypoint on
   the map or an entry in the waypoint table.  The startSelection
   method should be set as the onfocus event handler for a selector
   used to store vertex numbers for any purpose in an algorithm.

   Based on code originally developed by Arjol Pengu, Summer 2017. 
*/
var hdxVertexSelector = {

    // the string to find the selector to fill in with
    // a vertex number, if null, no selection is in process
    selector: "",

    // function to call to start the selection (when the
    // selector is clicked)
    startSelection(label) {
	//alert("startSelection: " + label);
	this.selector = label;
    },

    // the actual event handler function to set the value
    select(vNum) {
	//alert("select: " + vNum);
	if (this.selector != "") {
	    let v = document.getElementById(this.selector);
	    v.value = vNum;
	    // and update the label
	    waypointSelectorChanged(this.selector);
	}
	this.selector = "";
    }
};

// a function to build HTML to insert a vertex/waypoint selector
// component
// id is the HTML element id for the input
// label is the label for the control
// initVal is the waypoint number to use for initialization
function buildWaypointSelector(id,label,initVal) {

    return label + ' <input id="' + id +
	'" onfocus="hdxVertexSelector.startSelection(\'' + id +
	'\')" type="number" value="' + initVal + '" min="0" max="' +
	(waypoints.length-1) + '" size="6" style="width: 7em" ' +
	'onchange="waypointSelectorChanged(\'' + id + '\')"' +
	'/><span id="' + id + 'Label">' + waypoints[initVal].label +
	'</span>';
}

// event handler for waypoint selectors
function waypointSelectorChanged(id) {

    let vNum = document.getElementById(id).value;
    //let vNum = document.querySelector(id).value;
    document.getElementById(id + "Label").innerHTML = waypoints[vNum].label;
}

// variables and functions to highlight waypoints and connections
// when the mouse hovers over them
// TODO: these can go into an object
var vcolor, vtext, vicon;
var ecolor, etext, edge, edgew;

function hoverV(i, bool) {
    if ((bool && hdxAV.paused()) || !bool) {
	vicon = markers[i].getIcon();
	vcolor = document.getElementById("waypoint"+i).style.backgroundColor;
	vtext = document.getElementById("waypoint"+i).style.color;
	updateMarkerAndTable(i, visualSettings.hoverV, 0, false);
    }
}

function hoverEndV(i, bool) {
    if ((bool && hdxAV.paused()) || !bool) {
	markers[i].setIcon(vicon);
	document.getElementById("waypoint"+i).style.backgroundColor = vcolor;
	document.getElementById("waypoint"+i).style.color = vtext;
	if ($("#l"+i).length > 0) {
	    document.getElementById("l"+i).style.backgroundColor = vcolor;
	}
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

// special HDX version of the label click event handler that is
// called by the general TM addMarker, as it is registered
// by the registerMarkerClickListener call in updateMap
function labelClickHDX(i) {

    // handle vertex control selection
    hdxVertexSelector.select(i);

    // standard map center/infowindow display
    map.panTo(new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon));
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
    if (hideTableLine) {
        row.style.display = "none";
    }
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

// dummy AV entry for main menu
var hdxNoAV = {

    // entries for list of AVs
    value: "NONE",
    name: "Select an Algorithm",
    description: "No algorithm is selected, please select.",

    code: "Select an algorithm to view pseudocode.",
    
    // provide start, nextStep, setupUI, just in case buttons are
    // somehow active when this option is selected
    start() {

	alert("Please select an algorithm first.");
    },
    
    nextStep() {

	alert("Please select an algorithm first.");
    },

    setupUI() {},

    cleanupUI() {}
};

// vertex extremes search

// helper functions

// function to create the table entry for the leader for extreme points
function extremePointLeaderString(label, waypointNum, vs) {
    
    return label + ':<br />#' + waypointNum +
        ' (' + waypoints[waypointNum].lat + ',' +
        waypoints[waypointNum].lon +
        ') ' + waypoints[waypointNum].label;
}

// function to create the table entry for the leader for
// label-based comparisons
function labelLeaderString(label, waypointNum, vs) {
    
    return label + ':<br />#' + waypointNum +
        ' (length ' + waypoints[waypointNum].label.length + ') ' +
        waypoints[waypointNum].label;
}

var hdxVertexExtremesSearchAV = {

    // entries for list of AVs
    value: "vertex",
    name: "Vertex Extremes Search",
    description: "Search for extreme values based on vertex (waypoint) locations and labels.",

    // pseudocode
    code: `
<pre>longest <- 0
shortest <- 0
north <- 0
south <- 0
east <- 0
west <- 0
for (checkIndex <- 1 to |V|-1) {
  if (len(v[checkIndex].label) > len(v[longest].label))) {
    longest <- checkIndex
  }
  if (len(v[checkIndex].label) < len(v[shortest].label))) {
    shortest <- checkIndex
  }
  if (v[checkIndex].lat > v[north].lat) {
    north <- checkIndex
  }
  if (v[checkIndex].lat < v[south].lat) {
    south <- checkIndex
  }
  if (v[checkIndex].lng < v[west].lng) {
    west <- checkIndex
  }
  if (v[checkIndex].lng > v[east].lng) {
    east <- checkIndex
  }
}</pre>
`,
    
    // state variables for vertex extremes search
    nextToCheck: 0,
    discarded: 0,

    // the categories for which we are finding our extremes,
    // with names for ids, labels to display, indicies of leader,
    // comparison function to determine if we have a new leader,
    // and visual settings for the display
    categories: [
	{
	    name: "north",
	    label: "North extreme",
	    index: -1,

	    newLeader: function() {
		return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) >
			parseFloat(waypoints[this.index].lat));
	    },

	    leaderString: extremePointLeaderString,

	    visualSettings: {
		color: "#8b0000",
		textColor: "white",
		scale: 6,
		name: "northLeader",
		value: 0
	    }
	},

	{
	    name: "south",
	    label: "South extreme",
	    index: -1,

	    newLeader: function() {
		return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) <
			parseFloat(waypoints[this.index].lat));
	    },
	    leaderString: extremePointLeaderString,
	    
	    visualSettings: {
		color: "#ee0000",
		textColor: "white",
		scale: 6,
		name: "southLeader",
		value: 0
	    }
	},

	{
	    name: "east",
	    label: "East extreme",
	    index: -1,

	    newLeader: function() {
		return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) >
			parseFloat(waypoints[this.index].lon));
	    },
	    leaderString: extremePointLeaderString,
	    visualSettings: {
		color: "#000080",
		textColor: "white",
		scale: 6,
		name: "eastLeader",
		value: 0
	    }
	},

	{
	    name: "west",
	    label: "West extreme",
	    index: -1,

	    newLeader: function() {
		return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) <
			parseFloat(waypoints[this.index].lon));
	    },
	    leaderString: extremePointLeaderString,
	    visualSettings: {
		color: "#551A8B",
		textColor: "white",
		scale: 6,
		name: "westLeader",
		value: 0
	    }
	},

	{
	    name: "shortest",
	    label: "Shortest vertex label",
	    index: -1,
	    
	    newLeader: function() {
		return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length <
			waypoints[this.index].label.length);
	    },
	    leaderString: labelLeaderString,
	    visualSettings: visualSettings.shortLabelLeader
	},
	
	{
	    name: "longest",
	    label: "Longest vertex label",
	    index: -1,
	    
	    newLeader: function() {
		return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length >
			waypoints[this.index].label.length);
	    },
	    leaderString: labelLeaderString,
	    visualSettings: visualSettings.longLabelLeader
	},
    ],
    
    // required start function
    // initialize a vertex-based search
    start() {

	hdxAV.algStat.innerHTML = "Initializing";
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
	
	// start the search by initializing with the value at pos 0
	updateMarkerAndTable(0, visualSettings.visiting, 40, false);
	
	this.nextToCheck = 0;
	this.discarded = 0;
	
	hdxAV.algStat.innerHTML = "In Progress";
	updateAVControlEntry("undiscovered", waypoints.length + "vertices not yet visited");
	updateAVControlEntry("visiting", "Preparing to visit: #0 " + waypoints[0].label);
	updateAVControlEntry("discarded", "0 vertices discarded");
	if (!hdxAV.paused()) {
	    var self = this;
	    setTimeout(function() { self.nextStep() }, hdxAV.delay);
	}
    },

    // required nextStep function
    // do an iteration of vertex-based search
    nextStep() {

	// if the simulation is paused, we can do nothing, as this function
	// will be called again when we restart
	if (hdxAV.paused()) {
            return;
	}

	// keep track of points that were leaders but got beaten to be
	// colored grey if they are no longer a leader in any category
	var defeated = [];
	
	// keep track of whether this point is a new leader
        let foundNewLeader = false;

	// special case of first checked
	if (this.nextToCheck == 0) {
            // this was our first check, so this point wins all to start
	    for (var i = 0; i < this.categories.length; i++) {
		this.categories[i].index = 0;
	    }
            foundNewLeader = true;
	}
	// we have to do real work to see if we have new winners
	else {
	    // check each category
	    for (var i = 0; i < this.categories.length; i++) {
		if (this.categories[i].newLeader()) {
		    foundNewLeader = true;
		    if (defeated.indexOf(this.categories[i].index) == -1) {
			defeated.push(this.categories[i].index);
		    }
		    this.categories[i].index = this.nextToCheck;
		}
	    }
	}
	
	// any point that was a leader but is no longer gets
	// discarded, but need to check that it's not still a leader
	// in another category
	while (defeated.length > 0) {
            let toCheck = defeated.pop();
	    let discard = true;
	    for (var i = 0; i < this.categories.length; i++) {
		if (toCheck == this.categories[i].index) {
		    discard = false;
		    break;
		}
	    }
            if (discard) {
		updateMarkerAndTable(toCheck, visualSettings.discarded,
				     20, true);
		this.discarded++;
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
	    
	    for (var i = 0; i < this.categories.length; i++) {
		updateMarkerAndTable(this.categories[i].index, this.categories[i].visualSettings, 
				     40, false);
		updateAVControlEntry(
		    this.categories[i].name, 
		    this.categories[i].leaderString(this.categories[i].label,
						    this.categories[i].index,
						    this.categories[i].visualSettings)
		);
	    }
	}
	else {
            // we didn't have a new leader, just discard this one
            updateMarkerAndTable(this.nextToCheck, visualSettings.discarded,
				 20, true);
	    this.discarded++;
	}
	
	updateAVControlEntry("undiscovered", (waypoints.length - this.nextToCheck) + " vertices not yet visited");
	updateAVControlEntry("visiting", "Visiting: #" + this.nextToCheck + " " + waypoints[this.nextToCheck].label);
	updateAVControlEntry("discarded", this.discarded + " vertices discarded");
	
	// prepare for next iteration
	this.nextToCheck++;
	if (this.nextToCheck < markers.length) {
            updateMarkerAndTable(this.nextToCheck, visualSettings.visiting,
				 30, false);
            var self = this;
            setTimeout(function() { self.nextStep() }, hdxAV.delay);
	}
	else {
	    hdxAV.setStatus(hdxStates.AV_COMPLETE);
            hdxAV.algStat.innerHTML =
		"Done! Visited " + markers.length + " waypoints.";
	    updateAVControlEntry("undiscovered", "0 vertices not yet visited");
	    updateAVControlEntry("visiting", "");
	    updateAVControlEntry("discarded", this.discarded + " vertices discarded");
	
	}
    },

    // set up UI for the start of this algorithm
    setupUI() {

	hdxAV.algStat.style.display = "";
	hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.algOptions.innerHTML = '';

	addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
	addEntryToAVControlPanel("visiting", visualSettings.visiting);
	addEntryToAVControlPanel("discarded", visualSettings.discarded);
	for (var i = 0; i < this.categories.length; i++) {
	    addEntryToAVControlPanel(this.categories[i].name,
				     this.categories[i].visualSettings);
	}
    },

    // remove UI modifications made for vertex extremes search
    cleanupUI() {

	removeEntryFromAVControlPanel("undiscovered");
	removeEntryFromAVControlPanel("visiting");
	removeEntryFromAVControlPanel("discared");
	for (var i = 0; i < this.categories.length; i++) {
	    removeEntryFromAVControlPanel(this.categories[i].name);
	}
    }
};

// edge extremes search
var hdxEdgeExtremesSearchAV = {

    // entries for list of AVs
    value: "edge",
    name: "Edge Extremes Search",
    description: "Search for extreme values based on edge (connection) lengths and labels.",

    // pseudocode
    code:`
<pre>longestLabel <- 0
shortestLabel <- 0
longestEdge <- 0
shortestEdge <- 0
for (checkIndex <- 1 to |E|-1) {
  if (len(e[checkIndex].label) > len(e[longestLabel].label))) {
    longestLabel <- checkIndex
  }
  if (len(e[checkIndex].label) < len(e[shortestLabel].label))) {
    shortestLabel <- checkIndex
  }
  if (e[checkIndex].len > e[longestEdge].len) {
    longestEdge <- checkIndex
  }
  if (e[checkIndex].len < e[shortestEdge].len) {
    shortestEdge <- checkIndex
  }
}</pre>
`,
    
    // state variables for edge search
    // next to examine
    currentEdgeIndex: -1,

    // indices of our leaders in each category
    shortestEdgeLengthIndex: -1,
    longestEdgeLengthIndex: -1,
    shortestEdgeLabelIndex: -1,
    longestEdgeLabelIndex: -1,    

    // visual settings specific to edge search
    visualSettings: {
	shortestLeader: {
            color: "#8b0000",
            textColor: "white",
            scale: 6,
	    name: "northLeader",
	    value: 0
	},
	longestLeader: {
            color: "#ee0000",
            textColor: "white",
            scale: 6,
	    name: "southLeader",
	    value: 0
	}
    },
    
    // helper function
    updateEdgeColor(edgeNum, color, op, weight) {
	var edge = graphEdges[edgeNum];
	connections[edgeNum].setOptions({
	    strokeColor: color, 
	    strokeWeight: weight, 
	    strokeOpacity: op});
	var firstNode = Math.min(edge.v1, edge.v2);
	var secondNode = Math.max(edge.v1, edge.v2);
	document.getElementsByClassName('v_' + firstNode + '_' + secondNode)[0].style.backgroundColor = color;
    },

    // required start function
    start() {

	// initialize all edges to have the "undiscovered" color
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
	var algorithmsTbody = document.getElementById('AVControlPanel');
	var infoid = "info1";
	var infoBox = document.createElement('td');
	var infoBoxtr= document.createElement('tr');
	infoBox.setAttribute('id',infoid);
	infoBoxtr.appendChild(infoBox);
	algorithmsTbody.appendChild(infoBoxtr);
	// hdxAV.algStat.innerHTML = 'Checking: <span style="color:yellow">0</span>';

	// initialize to start looking at edge 0
	this.currentEdgeIndex = 0;
	
	if (!hdxAV.paused()) {
	    var self = this;
	    setTimeout(function() { self.nextStep(); }, hdxAV.delay);
	}
    },

    // required nextStep function for edge search
    nextStep() {
    
	if (hdxAV.paused()) {
            return;
	}	

	// keep track of edges that were leaders but got beaten to be
	// colored grey if they are no longer a leader in any category
	var defeated = [];
	
	// keep track of whether the current edge becomes a new leader
        var foundNewLeader = false;
	
	// if this is the first step, we have a new leader in all!
	if (this.currentEdgeIndex == 0) {
	    this.shortestEdgeLengthIndex = 0;
	    this.longestEdgeLengthIndex = 0;
	    this.shortestEdgeLabelIndex = 0;
	    this.longestEdgeLabelIndex = 0;
	    foundNewLeader = true;
	}
	// continue with the current edge, looking for new leaders
	else {
	    let d = edgeLengthInMiles(graphEdges[this.currentEdgeIndex]);

	    // is this longer than the longest?
	    if (d > edgeLengthInMiles(graphEdges[this.longestEdgeLengthIndex])) {
		foundNewLeader = true;
		defeated.push(this.longestEdgeLengthIndex);
		this.longestEdgeLengthIndex = this.currentEdgeIndex;
	    }

	    // is this shorter than the longest?
	    if (d < edgeLengthInMiles(graphEdges[this.shortestEdgeLengthIndex])) {
		foundNewLeader = true;
		defeated.push(this.shortestEdgeLengthIndex);
		this.shortestEdgeLengthIndex = this.currentEdgeIndex;
	    }

	    // is this label longer than any we've seen?
	    if (graphEdges[this.currentEdgeIndex].label.length >
		graphEdges[this.longestEdgeLabelIndex].label.length) {
		foundNewLeader = true;
		defeated.push(this.longestEdgeLabelIndex);
		this.longestEdgeLabelIndex = this.currentEdgeIndex;
	    }

	    // is this label shorter than any we've seen?
	    if (graphEdges[this.currentEdgeIndex].label.length <
		graphEdges[this.shortestEdgeLabelIndex].label.length) {
		foundNewLeader = true;
		defeated.push(this.shortestEdgeLabelIndex);
		this.shortestEdgeLabelIndex = this.currentEdgeIndex;
	    }
	}

	// any edge that was a leader but is no longer will get
	// discarded
	while (defeated.length > 0) {
	    let toCheck = defeated.pop();
	    if (toCheck != this.longestEdgeLengthIndex &&
		toCheck != this.shortestEdgeLengthIndex &&
		toCheck != this.longestEdgeLabelIndex &&
		toCheck != this.shortestEdgeLabelIndex) {
		this.updateEdgeColor(toCheck, visualSettings.spanningTree.color, 0.6, 10);
		document.getElementById("connection"+ toCheck).style.display = "none";
	    }
	}

	// if we found a new leader, update leader edges and table entries
	if (foundNewLeader) {

	    // longest edge length
	    this.updateEdgeColor(this.longestEdgeLengthIndex,
				 this.visualSettings.longestLeader.color, 1, 15);

	    // shortest edge length
	    this.updateEdgeColor(this.shortestEdgeLengthIndex,
				 this.visualSettings.shortestLeader.color, 1, 15);
	    
	    // longest edge label
	    this.updateEdgeColor(this.longestEdgeLabelIndex,
				 visualSettings.longLabelLeader.color, 1, 15);

	    // shortest edge label
	    this.updateEdgeColor(this.shortestEdgeLabelIndex,
				 visualSettings.shortLabelLeader.color, 1, 15);

	    // update info area
	    document.getElementById('info1').innerHTML =
		// short label leader
		"<span style='background-color:" +
		visualSettings.shortLabelLeader.color + "; color:" +
		visualSettings.shortLabelLeader.textColor +
		";' onclick='edgeClick("+
		this.shortestEdgeLabelIndex + ")'>Shortest Edge label: " +
		graphEdges[this.shortestEdgeLabelIndex].label +
		"</span><br>" +
		// long label leader
		"<span style='background-color:" +
		visualSettings.longLabelLeader.color + "; color:" +
		visualSettings.longLabelLeader.textColor +
		";' onclick='edgeClick("+
		this.longestEdgeLabelIndex + ")'>Longest Edge label: " +
		graphEdges[this.longestEdgeLabelIndex].label +
		"</span><br>" +
		// short edge length leader
		"<span style = 'background-color:" +
		this.visualSettings.shortestLeader.color +
		"' onclick='edgeClick(" + this.shortestEdgeLengthIndex +
		")'>Shortest Edge: " +
		graphEdges[this.shortestEdgeLengthIndex].label +
		": <span id='minedgelength'>"  +
		edgeLengthInMiles(graphEdges[this.shortestEdgeLengthIndex]) +
		"</span></span><br>" +
		// long edge length leader
		"<span style = 'background-color:" +
		this.visualSettings.longestLeader.color +
		"' onclick='edgeClick(" + this.longestEdgeLengthIndex +
		")'>Longest Edge: " +
		graphEdges[this.longestEdgeLengthIndex].label +
		": <span id='maxedgelength'>"  +
		edgeLengthInMiles(graphEdges[this.longestEdgeLengthIndex]) +
		"</span></span>";

	    document.getElementById("minedgelength").classList.add(curUnit);
	    document.getElementById("maxedgelength").classList.add(curUnit);
	}
	else {
	    // no new leader, this edge gets discarded
	    this.updateEdgeColor(this.currentEdgeIndex,
				 visualSettings.spanningTree.color, 0.6, 10);
	    document.getElementById("connection"+ this.currentEdgeIndex).style.display = "none";
	}

	// update status
	hdxAV.algStat.innerHTML =
            'Visiting: <span style="color:' + visualSettings.visiting.textColor +
            '; background-color:' + visualSettings.visiting.color + '"> ' +
            this.currentEdgeIndex + '</span>, ' +
	    (graphEdges.length - this.currentEdgeIndex - 1) +
            ' remaining';
	
	// prepare for next iteration
	this.currentEdgeIndex++;
	if (this.currentEdgeIndex < graphEdges.length) {
	    this.updateEdgeColor(this.currentEdgeIndex,
				 visualSettings.visiting.color, 0.6, 10);
            var self = this;
            setTimeout(function() { self.nextStep() }, hdxAV.delay);
	}
	else {
	    hdxAV.setStatus(hdxStates.AV_COMPLETE);
            hdxAV.algStat.innerHTML =
		"Done! Visited " + graphEdges.length + " edges.";
	}
    },

    // set up UI for the start of edge search
    setupUI() {

	hdxAV.algStat.style.display = "";
	hdxAV.algStat.innerHTML = "";
        hdxAV.algOptions.innerHTML = '';

    },

    // clean up edge search UI
    cleanupUI() {}

};

// ********************************************************************
// graph traversals, with option to find connected components
// ********************************************************************

var hdxGraphTraversalsAV = {

    // entries for list of AVs
    value: "traverals",
    name: "Graph Traversal/Connected Components",
    description: "Perform graph traversal using breadth-first, depth-first, or random-first traversals, with the option of repeating to find all connected components of the graph.",

    // pseudocode
    code:`
<pre>(NEEDS UPDATING)
unmark all vertices
choose some starting vertex x
mark x
list L <- x
tree T <- x
while L nonempty {
   remove vertex v from L
   mark v
   for each unmarked neighbor w of v
      L.add(w)
      T.add(edge vw)
</pre>
`,

    // list of vertices discovered but not yet visited
    // a stack for DFS, queue for BFS, just an
    // arbirtrary list for RFS
    
    // elements here are objects with fields vIndex for the index of
    // this vertex and connection is the Polyline connection followed
    // to get here (so it can be colored appropriately when the
    // element comes out)
    discoveredVertices: null,

    // array of booleans to indicate if we've visited each vertex
    visitedVertices: [],

    // vertex visited on the previous iteration to be updated
    lastVisitedVertex: -1,

    // where did we start?
    startingVertex: -1,

    // what is our traversal discipline, i.e., is discoveredVertices to be
    // treated as a stack, queue, or something else
    // values are currently "BFS" or "DFS" or "RFS"
    traversalDiscipline: "TBD",

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
    

    // to be added back in later, possibly
    //gred: 245,
    //ggrn: 255,
    //gblu: 245,

    // some additional stats we keep
    numVisited: 0,
    numVisitedComingOut: 0,
    numAlreadyVisited: 0,

    // color items specific to graph traversals
    visualSettings: {
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
	}
    },
    
    // initialize graph traversal process, required for all algorithms
    start() {

	let d = document.getElementById("traversalDiscipline");
	this.traversalDiscipline = d.options[d.selectedIndex].value;
	if (this.traversalDiscipline == "BFS") {
            this.discoveredVertices = HDXLinear(hdxLinearTypes.QUEUE);
	}
	else if (this.traversalDiscipline == "DFS") {
            this.discoveredVertices = HDXLinear(hdxLinearTypes.STACK);
	}
	else if (this.traversalDiscipline == "RFS") {
            this.discoveredVertices = HDXLinear(hdxLinearTypes.RANDOM);
	}

	document.getElementById("connection").style.display = "none";
	document.getElementById("waypoints").style.display = "";
	var pointRows = document.getElementById("waypoints").getElementsByTagName("*");
	for (var i = 0; i < pointRows.length; i++) {
	    pointRows[i].style.display = "";
	}
	
	// initialize our visited array
	this.visitedVertices = new Array(waypoints.length).fill(false);
	
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
	this.startingVertex = document.getElementById("startPoint").value;
	
	// initialize the process with this value
	this.discoveredVertices.add({
            vIndex: this.startingVertex,
            connection: null
	});
	this.numVisited = 1;

	updateMarkerAndTable(this.startingVertex,
			     this.visualSettings.startVertex, 10, false);
	
	// nothing to update this first time
	this.lastVisitedVertex = -1;
	if (!hdxAV.paused()) {
	    var self = this;
	    setTimeout(function() { self.nextStep(); }, hdxAV.delay);
	}
    },

    // function to see if a vertex with the given index is in
    // discoveredVertices
    //discoveredVerticesContainsVertex(vIndex) {

//	for (var i = 0; i < this.discoveredVertices.length; i++) {
  //          if (this.discoveredVertices[i].vIndex == vIndex) {
//		return true;
  //          }
//	}
//	return false;
  //  },

    // function to process one vertex from the discoveredVertices in the
    // graph traversal process
    nextStep() {
    
	// if we're paused, do nothing for now
	if (hdxAV.paused()) {
            return;
	}
	
	// maybe we have a last visited vertex to update
	if (this.lastVisitedVertex != -1) {
            if (this.lastVisitedVertex == this.startingVertex) {
		// always leave the starting vertex colored appropriately
		// and in the table
		updateMarkerAndTable(this.startingVertex,
				     this.visualSettings.startVertex,
				     10, false);
            }
	    else if (!this.discoveredVertices.containsFieldMatching("vIndex", this.lastVisitedVertex)) {
		// not in the list, this vertex gets marked as in the
		// spanning tree
		updateMarkerAndTable(this.lastVisitedVertex,
				     visualSettings.spanningTree,
				     1, false);
            }
	    else {
		// still in the list, color with the "discoveredEarlier"  style
		updateMarkerAndTable(this.lastVisitedVertex,
				     this.visualSettings.discoveredEarlier,
				     5, false);
            }
	}
	// maybe we're done
	if (this.discoveredVertices.isEmpty()) {
	    hdxAV.setStatus(hdxStates.AV_COMPLETE);
            return;
	}
	
	// select the next vertex to visit and remove it from the
	// discoveredVertices list
	let nextToVisit = this.discoveredVertices.remove();
        this.numVisitedComingOut++;
	this.lastVisitedVertex = nextToVisit.vIndex;
	let vIndex = nextToVisit.vIndex;
	this.numVisited++;
	// now decide what to do with this vertex -- depends on whether it
	// had been previously visited
	if (this.visitedVertices[vIndex]) {
            this.numAlreadyVisited++;
            // we've been here before, but is it still in the list?
            if (this.discoveredVertices.containsFieldMatching("vIndex", vIndex)) {
		// not there anymore, indicated this as visitedEarlier, and
		// will be discarded or marked as discoveredEarlier on the
		// next iteration
		updateMarkerAndTable(vIndex, this.visualSettings.visitedEarlier,
				     4, false);
            }
	    else {
		// still to be seen again, so mark is as discoveredEarlier
		updateMarkerAndTable(vIndex, this.visualSettings.discoveredEarlier,
				     5, false);
            }
	    
            // in either case here, the edge that got us here is not
            // part of the ultimate spanning tree, so it should be the
            // "discoveredEarlier" color
            if (nextToVisit.connection != null) {
		nextToVisit.connection.setOptions({
                    strokeColor: this.visualSettings.discoveredEarlier.color
		});
            }
	}
	// visiting for the first time
	else {
            this.visitedVertices[vIndex] = true;
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
		if (!this.visitedVertices[neighbors[i]]) {
                    var connection = connections[waypoints[vIndex].edgeList[i].edgeListIndex];
                    this.discoveredVertices.add({
			vIndex: neighbors[i],
			connection: connection
                    });
		    updateMarkerAndTable(neighbors[i], visualSettings.discovered,
					 5, false);
/*
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
*/		
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
	
	var newDS = null; //makeTable(this.discoveredVertices);
	if (newDS != null) {
	    hdxAV.algStat.appendChild(newDS);
	}
	//shiftColors();
	let self = this;
	setTimeout(function() { self.nextStep(); }, hdxAV.delay);
    },

    // set up UI components for traversals
    setupUI() {

	hdxAV.algStat.style.display = "none";
	hdxAV.algStat.innerHTML = "";
        hdxAV.algOptions.innerHTML = 'Order: <select id="traversalDiscipline"><option value="BFS">Breadth First</option><option value="DFS">Depth First</option><option value="RFS">Random</option></select>' +
	    '<br /><input id="findConnected" type="checkbox" name="Final all connected components">&nbsp;Find all connected components' +
	    '<br />' + buildWaypointSelector("startPoint", "Start Vertex", 0) +
            '<br /><input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';

    },

    // clean up traversals UI
    cleanupUI() {}

};

// Dijstra's algorithm for single-source shortest paths
// initial code by Clarice Tarbay
var hdxDijkstraAV = {
    
    // entries for list of AVs
    value: "dijkstra",
    name: "Dijkstra's Algorithm",
    description: "Dijkstra's algorithm for single-source shortest paths.",

    // pseudocode
    code:`To be added.`,
    
    totalPath: [],

    gred: 245,
    gblu: 245,
    ggrn: 245,

    // where do we start and end?
    startingVertex: -1,
    endingVertex: -1,

    // vertex visited on the previous iteration to be updated
    lastVisitedVertex: -1,

    // required algorithm start method for Dijkstra's
    start() {

	// vertex indices for the start and end of the traversal
	this.startingVertex = document.getElementById("startPoint").value;
	this.endingVertex = document.getElementById("endPoint").value;
	
	if (this.startingVertex == this.endingVertex) {
	    alert("Start and End vertices must be different!");
	    return;
	}    
	
	document.getElementById("connection").style.display = "none";
	document.getElementById("waypoints").style.display = "none";
	
	if ($("#dijtable").length > 0) {
	    $("#dijtable").remove();
	}
	
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
	
	discoveredVerticesName = "PQueue";
	
	// initialize our visited array
	this.visitedVertices = new Array(waypoints.length).fill(false);
	
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
	
	// initialize the process with this value
	discoveredVertices.push({
            vIndex: this.startingVertex,
            connection: null,
	    dist: 0,
	    edge: null
	});
	numVisited++;
	
	updateMarkerAndTable(this.startingVertex, visualSettings.startVertex, 10, false);
	
	// nothing to update this first time
	lastVisitedVertex = -1;
	if (!hdxAV.paused()) {
	    let self = this;
	    setTimeout(function() { self.nextStep(); }, hdxAV.delay);
	}
    },

    // PQ comparator function
    comparePQ(a, b) {
	return a.dist-b.dist;
    },

    // additional helper functions
    findNextV(edge, vnum) {
	if (edge.v1 == vnum)
	    return edge.v2;
	else 
	    return edge.v1;
    },

    findNextPath(v1, v2) {
	var cur;
	for (var i = 0; i < this.totalPath.length; i++) {
	    cur = this.totalPath[i].edge;
	    if (cur != null &&
		(v1 == cur.v1 || v1 == cur.v2) && (v2 != cur.v1 && v2 != cur.v2)) {
		return i;
	    }
	}
    },

    // continue next step of Dijkstra's algorithm
    nextStep() {

	// if we're paused, do nothing for now
	if (hdxAV.paused()) {
            return;
	}
	
	// maybe we have a last visited vertex to update
	if (lastVisitedVertex != -1) {
            if (lastVisitedVertex == this.startingVertex) {
		// always leave the starting vertex colored appropriately
		// and in the table
		updateMarkerAndTable(this.startingVertex, visualSettings.startVertex,
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
	    (visited[this.endingVertex] && this.startingVertex != this.endingVertex)) {
	    //make our table a sortable DataTable
	    createDataTable("#dijtable");
	    //if start/end different, construct path from start to end
            if (this.startingVertex != this.endingVertex) {
		var curV = totalPath[totalPath.length-1];
		var edgePath = curV.edge;
		var curVnum = endingVertex;
		var nextV;
		while (curV != null) {
		    edgePath = curV.edge;
		    curVnum = nextV;
		    if (curVnum == this.startingVertex)
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
	    hdxAV.setStatus(hdxStates.AV_COMPLETE);
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
	discoveredVertices.sort(this.comparePQ);
	
	// update view of our list
	var newDS = null; //makeTable();
	if (newDS != null) {
	    hdxAV.algStat.appendChild(newDS);
	}
	shiftColors();
	let self = this;
	setTimeout(function() { self.nextStep(); }, hdxAV.delay);
    },

    // set up UI for Dijkstra's
    setupUI() {
	
	hdxAV.algStat.style.display = "none";
	hdxAV.algStat.innerHTML = "";
        hdxAV.algOptions.innerHTML =
	    buildWaypointSelector("startPoint", "Start Vertex", 0) +
	    "<br />" + buildWaypointSelector("endPoint", "End Vertex", 1) +
	    '<br /><input id="showDataStructure" type="checkbox" onchange="toggleDS()" name="Show Data Structure">Show Data Structure';
    },

    // clean up Dijkstra's UI
    cleanupUI() {}

};

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

// get a list of adjacent vertices by index into waypoints array
function getAdjacentPoints(pointIndex) {
    var resultArray = [];
    var edgeList = waypoints[pointIndex].edgeList;
    for (var i = 0; i < edgeList.length; i++) {
        var adjacentIndex;
        if (edgeList[i].v1 == pointIndex) {
            adjacentIndex = edgeList[i].v2;
        }
	else {
            adjacentIndex = edgeList[i].v1;
        }
        resultArray.push(adjacentIndex);
    }
    
    return resultArray;
}

// Brute-force convex hull AV
// based on original code by Arjol Pengu and Maria Bamundo
var hdxBFConvexHullAV = {

    // entries for list of AVs
    value: "bfhull",
    name: "Brute-Force Convex Hull",
    description: "Compute the convex hull of the waypoints using the brute-force algorithm.",
    
    // pseudocode
    code:`<pre>
for (i <- 1 to n–1)
  for (j <- i+1 to n)
     L <- line through waypoints[i] and waypoints[j]
       if (all other points lie on the same side of L)
          add L to hull
</pre>`,
    
    // the convex hull being computed
    hull: [],

    // need to check these to see if some should be locals
    // the i and j loop indices for our deconstructed nested loop
    hullI: 0,
    hullJ: 0,
    
    convexLineHull: [],
    visitingLine: [],
    currentSegment: null,
 
    // boolean to determine whether to set up or do an iteration of
    // the inner loop, to allow the candidate line to be seen on
    // the map before it is determined to be part of the hull or not
    setupNewLine: false,
    
    // helper function to highlight a line
    visitingLineHull(lineHull) {

	document.getElementById("drawLine").className += " highlight";
	this.currentSegment = new google.maps.Polyline({
	    map: map,
	    path: lineHull,
	    strokeColor: '#0000aa',
	    strokeOpacity: 0.6,
	    strokeWeight: 4
	});
    },

    // required start method for brute force convex hull
    // TODO: where do we know we're done?
    start() {

	// clear connections from the map, as this is a vertex-only
	// algorithm
	for (var outerLoop = 0; outerLoop < connections.length; outerLoop++) {
	    connections[outerLoop].setMap(null);
	}
	// mark all vertices as "undiscovered"
	for (var i = 0; i < waypoints.length; i++) {
            updateMarkerAndTable(i, visualSettings.undiscovered, 30, false);
	}

	// initialize our i and j for the main n^2 loop
	this.hullJ = 1;
	this.hullI = 0;
	document.getElementById("for1").className += " highlight";
	if (!hdxAV.paused()) {
	    this.setupNewLine = true;
	    let self = this;
	    setTimeout(function() { self.nextStep(); }, hdxAV.delay);
	}
    },

    // required nextStep function for brute-force convex hull
    nextStep() {
	
	if (hdxAV.paused()) {
	    return;
	}

	// depending on the value of setupNewLine, we either draw a
	// line from the hullI to hullJ to show the next segment to
	// be considered, or we actually consider that segment (and
	// either remove it or add it to the hull, then advance to
	// the next hullI, hullJ
	
	if (this.setupNewLine) {
	    // formerly "innerLoopConvexHull()"
	    
	    document.getElementById("for2").className += " highlight";
	    document.getElementById("for1").className -= " highlight";
	    document.getElementById("drawLine").className -= " highlight";
	    document.getElementById("drawLine2").className -= " highlight";
	    
	    // highlight the points being considered
	    updateMarkerAndTable(this.hullI, visualSettings.hullI, 30, false);
	    updateMarkerAndTable(this.hullJ, visualSettings.visiting, 30, false);
    
	    this.visitingLine[0] =
		new google.maps.LatLng(waypoints[this.hullI].lat,
				       waypoints[this.hullI].lon);
	    this.visitingLine[1] =
		new google.maps.LatLng(waypoints[this.hullJ].lat,
				       waypoints[this.hullJ].lon);
	    this.visitingLineHull(this.visitingLine);
	    
	    if (!hdxAV.paused()) {
		this.setupNewLine = false;
		let self = this;
		setTimeout(function() { self.nextStep(); }, hdxAV.delay);
	    }
	}
	else {
	    // was: "innerLoop2()"

	    var pointI = waypoints[this.hullI];
	    var pointJ = waypoints[this.hullJ];
    
	    // from here, we need to see if all other points are
	    // on the same side of the line connecting pointI and pointJ
	    // the coefficients for ax + by = c
	    var a = pointJ.lat - pointI.lat;
	    var b = pointI.lon - pointJ.lon;
	    var c = pointI.lon * pointJ.lat - pointI.lat * pointJ.lon;
	    
	    // now check all other points to see if they're on the
	    // same side -- stop as soon as we find they're not
	    var lookingForPositive = false;
	    var foundProblem = false;
	    var firstTestPoint = true;
	    
	    for (var k = 0; k < waypoints.length; k++) {	
		var pointK = waypoints[k];

		// make sure point is not one of the endpoints
		// of the line being considered for inclusion
		// in the hull
		if (pointI === pointK || pointJ === pointK) {
		    continue;
		}
		//updateMarkerAndTable(k, visualSettings.hullK, 30, false);
		var checkVal = this.a * pointK.lon + this.b * pointK.lat - this.c;
		
		if (checkVal === 0) {
		    if (isBetween(pointI, pointJ, pointK)) {
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
	    // remove the candidate segment
	    currentSegment.setMap(null);
	    
	    if (!foundProblem) {
		// it's part of the hull, so let's remember that
		document.getElementById("for2").className -= " highlight";
		document.getElementById("drawLine").className -= " highlight";
		document.getElementById("drawLine2").className += " highlight";
		// purple line showing convex hull
		this.hull[0] = new google.maps.LatLng(pointI.lat, pointI.lon);
		this.hull[1] = new google.maps.LatLng(pointJ.lat, pointJ.lon);
		polyline = new google.maps.Polyline({
		    map: map,
		    path: this.hull,
		    strokeColor: '#cc00ff',
		    strokeOpacity: 0.6,
		    strokeWeight: 6
		});
		updateMarkerAndTable(this.hullI, visualSettings.startVertex, 30, false);
		updateMarkerAndTable(this.hullJ, visualSettings.startVertex, 30, false);
	    } else {
		updateMarkerAndTable(this.hullJ, visualSettings.discarded, 30, false);
	    }
	    this.hullJ++;
	    if (this.hullJ == waypoints.length) {
		updateMarkerAndTable(this.hullI, visualSettings.discarded, 30, false);
		document.getElementById("for1").className += " highlight";
		document.getElementById("for2").className -= " highlight";
		this.hullI++;
		for (var i = this.hullI; i >= 0; i--) {
		    updateMarkerAndTable(i, visualSettings.discarded, 30, false);
		}
		for (var i = this.hullI + 1; i < waypoints.length; i++) {
		    updateMarkerAndTable(i, visualSettings.undiscovered, 30, false);
		}
		// initialize next hullJ loop
		this.hullJ = this.hullI + 1;
	    }

	    // more to do?
	    if (this.hullI < waypoints.length - 1) {	    
		if (!hdxAV.paused()) {
		    this.setupNewLine = true;
		    let self = this;
		    setTimeout(function() { self.nextStep(); }, hdxAV.delay);
		}
	    }
	    else {
		// done
		hdxAV.setStatus(hdxStates.AV_COMPLETE);
	    }
	}
    },

    // set up UI for convex hull
    setupUI() {

	alert("This is an n^3 algorithm in the worst case, so choose a relatively small graph.");
	hdxAV.algStat.style.display = "none";
	hdxAV.algStat.innerHTML = "";
        hdxAV.algOptions.innerHTML = '';
    },

    // clean up convex hull UI
    cleanupUI() {}

};

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


/*
  Linear structure that can be displayed in a collapsed form
*/
var hdxLinearTypes = {

    // constants to refer to these, if new ones are added,
    // place before UNKNOWN and increment UNKNOWN's value
    STACK: 1,
    QUEUE: 2,
    RANDOM: 3,
    PRIORITY_QUEUE:4,
    UNKNOWN: 5
};
    
function HDXLinear(type) {

    // supported types listed above
    if (type < hdxLinearTypes.STACK || type >= hdxLinearTypes.UNKNOWN) {
	console.log("Invalid type of HDXLinear!");
    }
    this.type = type;

    // the actual array representing this linear structure
    this.items = [];

    // add a item to this linear structure
    this.add = function(e) {
	items.push(e);
    };

    // remove next based on type
    this.remove = function() {

	switch(this.type) {

	case hdxLinearTypes.STACK:
	    return this.items.pop();

	case hdxLinearTypes.QUEUE:
	    return this.items.shift();

	case hdxLinearTypes.RANDOM:
            let index = Math.floor(Math.random() * this.items.length);
            let retval = this.items[index];
            this.items.splice(index, 1);
	    return retval;
	}
    };
    
    // search for an entry with the given field having the given value
    this.containsFieldMatching = function(field, value) {

	for (var i = 0; i < this.items.length; i++) {
	    if (this.items[i][field] == value) {
		return true;
	    }
	}
	return false;
    };

    // check for empty list
    this.isEmpty = function() {

	return items.length == 0;
    };

    return this;
}

/* object to display the value of a variable (which should be
   a number or string) with a given label and in the given
   document element's innerHTML, beginning with the given
   initial value */
function HDXDisplayVariable(displayLabel,docElement,initVal) {

    this.value = initVal;
    this.label = displayLabel;
    this.docElement = docElement;

    // set to a new value
    this.set = function(newVal) {
	
	this.value = newVal;
	this.paint();
    };

    // increment
    this.increment = function() {

	this.value++;
	this.paint();
    };
    
    // redraw in the document element
    this.paint = function() {

	this.docElement.innerHTML = this.label + this.value;
    };

    this.paint();
    return this;
}

/*
function createSidePanelBtn() {
    //Creates the menu icon
    var showPanel = document.createElement("button");
    showPanel.setAttribute("id", "panelBtn");
    showPanel.innerHTML = '<i id="menuIcon" xxxclass="material-icons">menu</i>';
    showPanel.setAttribute("title", "Menu");
    showPanel.addEventListener("click", openSidePanel);
    document.body.appendChild(showPanel);
}
*/

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
    var index = document.getElementById("graphList").selectedIndex;
    var value = document.getElementById("graphList").options[index].value;
    
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

// event handler for "Show Load Options" button
// which replaces it with the load options panels
function undoCollapse(event) {
    var container = event.target.parentNode;
    var clss = "."+container.id.substring(0,container.id.indexOf("btn"));
    var elems = document.querySelectorAll(clss);
    for (var i = 0; i < elems.length; i++) {
	elems[i].style.display = "";
    }
    container.style.display = "none";
}

// function to hide the load options and show the "Show Load Options"
// button in the AV control panel
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

// TODO: make sure maps cannot be selected when an AV is running
function fillGraphList(e) {
    
    var sels = document.getElementById("selects");
    var orderSel = document.getElementById("orderOptions").value;
    var resSel = document.getElementById("restrictOptions").value;
    var cateSel = document.getElementById("categoryOptions").value;
    var min = document.getElementById("minVertices").value;
    var max = document.getElementById("maxVertices").value;
    if (max < 0 || min < 0 || min > max) {
	return;
    }
    if ($("#graphList").length != 0) {
	sels.removeChild(document.getElementById("graphList"));
    }
    var mapSel = document.createElement("select");
    mapSel.setAttribute("id", "graphList");
    mapSel.setAttribute("onchange", "readServer(event)");
    var init = document.createElement("option");
    init.innerHTML = "Choose a Graph";
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
        url: "./generateGraphList.php",
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
	    if (txt.length == 0) {
		alert("No graphs matched!  Please choose less restrictive filters.");
	    }
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
		document.getElementById("graphList").appendChild(opt);
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
	vTable += '<tr id="waypoint' + i +'" onmouseover = "hoverV('+i+', false)" onmouseout = "hoverEndV('+i+', false)" onclick = "labelClickHDX('+i+')" ><td>' + i +
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
	// record edge index in GraphEdge structure
	newEdge.edgeListIndex = i;
    }
    eTable += '</tbody></table>';
    genEdges = false;
    usingAdjacencyLists = true;
    hdxAV.setStatus(hdxStates.GRAPH_LOADED);
    document.getElementById("AlgorithmSelection").disabled = false;
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
	    + "<a onclick=\"javascript:labelClickHDX(" + i + ");\">"
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
    hdxAV.setStatus(hdxStates.GRAPH_LOADED);
    document.getElementById("AlgorithmSelection").disabled = false;
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
    hdxAV.setStatus(hdxStates.WPT_LOADED);
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
		"</td><td><a onclick=\"javascript:labelClickHDX(0);\">" + waypoints[waypoints.length-1].label +
		'</a></td><td style="text-align:right">' + info.mileage.toFixed(2) +
		'</td><td style="text-align:right">' + totalMiles.toFixed(2) +
		'</td></tr>';
	}
    }
    table += '</tbody></table>';
    //genEdges = true;
    usingAdjacencyLists = true;
    hdxAV.setStatus(hdxStates.PTH_LOADED);
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
	    + "<a onclick=\"javascript:labelClickHDX(" + 2*i + ");\">"
	    + waypoints[2*i].label + "</a></td><td>("
	    + waypoints[2*i].lat + ","
	    + waypoints[2*i].lon + ")</td></tr><tr><td>"
	    + "<a onclick=\"javascript:labelClickHDX(" + 2*i+1 + ");\">"
	    + waypoints[2*i+1].label + "</a></td><td>("
	    + waypoints[2*i+1].lat + ","
	    + waypoints[2*i+1].lon + ")</td></tr>"
	    + "</tbody></table></td><td>"
	    + miles  + " mi/"
	    + feet + " ft</td></tr>";
    }

    table += "</tbody></table>";
    genEdges = false;
    hdxAV.setStatus(hdxStates.NMP_LOADED);
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
		    + "<a onclick=\"javascript:labelClickHDX(" + i + ");\">"
		    + w.label + "</a></td></tr>"
	    }
	}
    }
    vTable += '</tbody></table>';
    // no edges here
    graphEdges = new Array();
    genEdges = false;
    var summaryInfo = '<table class="gratable"><thead><tr><th>' + waypoints.length + " waypoints.</th></tr></table>";
    hdxAV.setStatus(hdxStates.WPL_LOADED);
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

// pseudocode display event handler
function showHidePseudocode() {

    let show = document.getElementById("pseudoCheckbox").checked;
    document.getElementById("pseudoText").style.display =
	(show ? "" : "none");
}

// generic event handler for start/pause/resume button
function startPausePressed() {
    
    switch (hdxAV.status) {

    case hdxStates.AV_SELECTED:
	// if we have selected but not yet started an algorithm,
	// this is a start button
	hdxAV.setStatus(hdxStates.AV_RUNNING);
	hdxAV.startPause.innerHTML = "Pause";
	document.getElementById("AlgorithmSelection").disabled = true;
	selectAlgorithmAndStart();
	break;

    case hdxStates.AV_RUNNING:
	// if we are in a running algorithm, this is a pause button
	// the running algorithm will pause when its next
	// timer event fires
	hdxAV.setStatus(hdxStates.AV_PAUSED);
	hdxAV.startPause.innerHTML = "Resume";
	break;

    case hdxStates.AV_PAUSED:
	// if we are in paused algorithm, this is a resume button
	hdxAV.setStatus(hdxStates.AV_RUNNING);
	hdxAV.startPause.innerHTML = "Pause";
	continuePausedAlgorithm();
	break;

    default:
	alert("startPausePressed, unexpected status=" + hdxAV.status);
    }
}

// function to resume a paused algorithm
function continuePausedAlgorithm() {

    hdxAV.currentAV.nextStep();
}

// function to begin the execution of a new AV
function selectAlgorithmAndStart() {

    resetVars();
    hdxAV.currentAV.start();
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

// Event handler for state change on the algorithm selection select control
function algorithmSelected() {

    // if we have an algorithm already selected, clean up its
    // UI first
    if (hdxAV.currentAV != null) {

	hdxAV.currentAV.cleanupUI();
    }
    
    var value = getCurrentAlgorithm();

    // if we selected a valid algorithm, enable the start button
    if (value != hdxNoAV.value) {
	hdxAV.setStatus(hdxStates.AV_SELECTED);
	hdxAV.startPause.disabled = false;
    }

    // set the current algorithm
    for (var i = 1; i < hdxAV.avList.length; i++) {
	if (value == hdxAV.avList[i].value) {
	    hdxAV.currentAV = hdxAV.avList[i];
	    break;
	}
    }

    // set pseudocode
    document.getElementById("pseudoText").innerHTML = hdxAV.currentAV.code;

    // call its function to set up its status and options
    hdxAV.currentAV.setupUI();
}

function toggleDS() {
    if (hdxAV.algStat.style.display == "none") {
	hdxAV.algStat.style.display = "";
    }
    else {
	hdxAV.algStat.style.display = "none";
    }
}

/* SEEMS TO BE UNUSED
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
*/

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


// moved to the end for now, until all variables are grouped by algorithm
function resetVars() {
    if (hdxAV.status == hdxStates.AV_COMPLETE ||
	hdxAV.previousAlgorithm != document.getElementById("AlgorithmSelection").value) {
	//hdxAV.done = false;
	hdxAV.reset();
	updateMap();
	
	if ($("#piecesTD").length > 0) {
	    document.getElementById("piecesTD").parentNode.parentNode.removeChild(document.getElementById("piecesTD").parentNode);
	}
	//for (var i = 0; i < 7; i++) {
	//    if ($("#info"+i).length > 0) {
//		document.getElementById("info"+i).parentNode.parentNode.removeChild(document.getElementById("info"+i).parentNode);
//	    }
//	}
	hdxAV.algStat.innerHTML = "";
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

// Compute Squared Distance 
function squaredDistance(o1, o2) {
    var dx, dy;
    dx = o1.lon - o2.lon;
    dy = o1.lat - o2.lat;
    return dx * dx + dy * dy;
}
