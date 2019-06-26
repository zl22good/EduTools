//
// HDX-specific Javascript functions
//
// Load and view data files related to Travel Mapping (TM), formerly
// Clinched Highway Mapping (CHM), related academic data sets.
//
// Primary author: Jim Teresco, Siena College, The College of Saint Rose
//
// Additional authors: Razie Fathi, Arjol Pengu, Maria Bamundo, Clarice Tarbay,
// Michael Dagostino, Abdul Samad, Eric Sauer

// some globals used here (map, waypoints, markers, etc) come from

// most functionality has been moved to other JS files for easier
// code management

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

// functions related to changes of units in the display
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

    if (!vs.hasOwnProperty('icon')) {
        var options = {
            iconShape: 'circle-dot',
            iconSize: [vs.scale, vs.scale],
            iconAnchor: [vs.scale, vs.scale],
            borderWidth: vs.scale,
            borderColor: vs.color
        };

        vs.icon = L.BeautifyIcon.icon(options);
    }
    markers[waypointNum].setIcon(vs.icon);
    markers[waypointNum].setZIndexOffset(2000+zIndex);
    var row = document.getElementById("waypoint"+waypointNum);
    row.style.backgroundColor = vs.color;
    row.style.color = vs.textColor;
    if (hideTableLine) {
        row.style.display = "none";
    }
    else if(hideTableLine == false){
       row.style.display = "table-row";
   }
}

// function to set the edge color and table entry information
// based on the visual settings, optionally hide line
function updatePolylineAndTable(edgeNum, vs, hideTableLine) {

    let edge = graphEdges[edgeNum];
    connections[edgeNum].setStyle({
        color: vs.color,
        weight: vs.weight,
        opacity: vs.opacity});

    let row = document.getElementById("connection" + edgeNum);
    row.style.backgroundColor = vs.color;
    row.style.color = vs.textColor;
    if (hideTableLine) {
        row.style.display = "none";
    } 
}

// function to show/hide/reinitialize waypoints and connections
// at the initialization of an AV
//
// showW: boolean indicating whether to show waypoints on map and in table
// showC: boolean indicating whether to show connections on map and in table
// vs: a visualSettings object to use to color shown components
function initWaypointsAndConnections(showW, showC, vs) {

    if (showW) {
        // make sure waypoints table is displayed
        document.getElementById("waypoints").style.display = "";
        
        // show all existing markers on map and table
        for (var i = 0; i < waypoints.length; i++) {
            markers[i].remove();
            markers[i].addTo(map);
            updateMarkerAndTable(i, vs, 0, false);
        }

        // ensure individual table rows are shown
        var pointRows = document.getElementById("waypoints").getElementsByTagName("*");
        for (var i = 0; i < pointRows.length; i++) {
            pointRows[i].style.display = "";
        }
    }
    else {
        // undisplay the waypoints table
        document.getElementById("waypoints").style.display = "none";

        // remove all markers from the map
        for (var i = 0; i < waypoints.length; i++) {
            markers[i].remove();
        }
    }

    if (showC) {
        // display the connections table
        document.getElementById("connection").style.display = "";

        // ensure individual table rows are shown
        var pointRows = document.getElementById("connection").getElementsByTagName("*");
        for (var i = 0; i < pointRows.length; i++) {
            pointRows[i].style.display = "";
        }

        // show edges
        for (var i = 0; i < connections.length; i++) {
	    connections[i].remove();
	    connections[i].addTo(map);
            updatePolylineAndTable(i, vs, false);
        }
    }
    else {
        // undisplay the connections table
        document.getElementById("connection").style.display = "none";

        // remove each connection from the map
        for (var i = 0; i < connections.length; i++) {
            connections[i].remove();
        }
    }
}

// function to limit the given string to the given length, replacing
// characters in the middle with ".." if needed to shorten
function shortLabel(label, max) {
    
    if (label.length > max) {
        return label.substring(0,max/2-1) + ".." +
            label.substring(label.length - (max/2-1));
    }
    return label;
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

// Creates the TOSLabels for the different map tiles and appends them
// to a div which is returned
function TOSLabel() {
    var menubar = document.querySelector(".menubar");
    
    var label = document.createElement("a");
    label.setAttribute("id", "ReferenceLink");
    label.setAttribute("href", "http://travelmapping.net/credits.php");
    label.setAttribute("target", "_blank");
    label.innerHTML = "Credits and Sources";
    
    return label;
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

    // first, retrieve the selected file (as a File object)
    // which must be done before we toggle the table to force
    // the pointbox to be displayed
    var file = document.getElementById('filesel').files[0];
    
    // force data table to be displayed
    let datatable = document.getElementById("datatable");
    datatable.style.display = "";
    let checkbox = document.getElementById("datatablesCheckbox");
    checkbox.selected = true;

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

function readServer(event) {

    var index = document.getElementById("graphList").selectedIndex;
    var value = document.getElementById("graphList").options[index].value;
    
    if (value != "") {
        // document.getElementById("test").innerHTML = value;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                
                var file = new Blob([xmlhttp.responseText], {type : "text/plain"});
                file.name = value;
                
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
        xmlhttp.open("GET", "http://courses.teresco.org/metal/graphdata/"+value, true);
        xmlhttp.send(); 
    }
}

function readServerSearch(file)
{
        var tmgFile = file;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                        var file = new Blob([xmlhttp.responseText], {type : "text/plain"});
                        file.name = tmgFile;
                        if(tmgFile){
                                document.getElementById('filename').innerHTML = file.name;
                                var reader;
                                try{
                                        reader = new FileReader();
                                }
                                catch(e){
                                        pointboxErrorMsg("Error: unable to access file (Perhaps no browser support?  Try recent Firefox or Chrome releases.).");
                                        return;
                                }
                                reader.readAsText(file, "UTF-8");
                                reader.onload = fileLoaded;
                        }
                        
                }
        };
        xmlhttp.open("GET", "http://courses.teresco.org/metal/graphdata/"+tmgFile, true);
        xmlhttp.send();
}


// when the FileReader created in startRead has finished, this will be called
// to process the contents of the file
function fileLoaded(event) {
    // file done loading, read the contents
    processContents(event.target.result);
    customTitle();
    hideInstructions();
}

// process the contents of a String which came from a file or elsewhere
function processContents(fileContents) {
    
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
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parseWPTContents(fileContents);
        showTopControlPanel();
    }
    else if (fileName.indexOf(".pth") >= 0) {
        document.getElementById('filename').innerHTML = fileName + " (Waypoint Path File)";
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parsePTHContents(fileContents);
        showTopControlPanel();
    }
    else if (fileName.indexOf(".nmp") >= 0) {
        document.getElementById('filename').innerHTML = fileName + " (Near-Miss Point File)";
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parseNMPContents(fileContents);
        showTopControlPanel();
    }
    else if (fileName.indexOf(".wpl") >= 0) {
        document.getElementById('filename').innerHTML = fileName + " (Waypoint List File)";
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parseWPLContents(fileContents);
        showTopControlPanel();
    }
    else if (fileName.indexOf(".gra") >= 0) {
        document.getElementById('filename').innerHTML = fileName + " (Highway Graph File)";
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parseGRAContents(fileContents);
    }
    else if (fileName.indexOf(".tmg") >= 0) {
        document.getElementById('filename').innerHTML = fileName + " (Highway Graph File)";
        document.getElementById('startUp').innerHTML="";
        pointboxContents = parseTMGContents(fileContents);
        showAlgorithmSelectionPanel();
    }
    
    document.getElementById('datatable').innerHTML = pointboxContents;
    hideLoadDataPanel();
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
                else if (values[i].indexOf("traveled") != -1) {
                    str = txt[i] + " (traveled), size: (" + vertices[i] + ", " + edges[i] + ")";
                }
                else {
                    str = txt[i] + " (collapsed), size: (" + vertices[i] + ", " + edges[i] + ")" ;
                }
                opt.innerHTML = str;
                opt.value = values[i];
                document.getElementById("graphList").appendChild(opt);
            }
        }
    });
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
// supports version 1.0 and 2.0 "simple", "collapsed" or "traveled".
// see http://courses.teresco.org/metal/graph-formats.shtml
//
function parseTMGContents(fileContents) {
    
    var lines = fileContents.replace(/\r\n/g,"\n").split('\n');
    var header = lines[0].split(' ');
    if (header[0] != "TMG") {
        return '<table class="table"><thead class = "thead-dark"><tr><th scope="col">Invalid TMG file (missing TMG marker on first line)</th></tr></table>';
    }
    if ((header[1] != "1.0") && (header[1] != "2.0")) {
        return '<table class="table"><thead class = "thead-dark"><tr><th scope="col">Unsupported TMG file version (' + header[1] + ')</th></tr></table>';
    }
    if ((header[2] != "simple") && (header[2] != "collapsed")
        && (header[2] != "traveled")) {
        return '<table class="table"><thead class = "thead-dark"><tr><th scope="col">Unsupported TMG graph format (' + header[2] + ')</th></tr></table>';
    }
    var counts = lines[1].split(' ');
    var numV = parseInt(counts[0]);
    var numE = parseInt(counts[1]);
    var numTravelers = 0;
    
    // is this a traveled format graph?
    if (header[2] == "traveled") {
        haveTravelers = true;
        numTravelers = parseInt(counts[2]);
    }
    else {
        haveTravelers = false;
        numTravelers = 0;
    }
    
    var summaryInfo = '<table class="table-sm"><thead class = "thead-dark"><tr><th scope="col">' + numV + " waypoints, " + numE + " connections"

    if (haveTravelers) {
        summaryInfo += ", " + numTravelers + " travelers";
    }
    
    summaryInfo += ".</th></tr></table>";
    
    var vTable = '<table id="waypoints" class="table table-light table-bordered"><thead class = "thead-dark"><tr><th scope="col" colspan="3">Waypoints</th></tr><tr><th>#</th><th scope="col">Coordinates</th><th scope="col">Waypoint Name</th></tr></thead><tbody>';
    
    waypoints = new Array(numV);
    for (var i = 0; i < numV; i++) {
        var vertexInfo = lines[i+2].split(' ');
        waypoints[i] = new Waypoint(vertexInfo[0], vertexInfo[1], vertexInfo[2], "", new Array());
        
        var vsubstr =  parseFloat(vertexInfo[1]).toFixed(3) + ',' +
            parseFloat(vertexInfo[2]).toFixed(3) 
            +'</td>' + '<td style ="word-break:break-all;">' + (waypoints[i].label).substring(0,10);
        var e = "...";
        if(((waypoints[i]).label).length > 10){
            
            vsubstr =  parseFloat(vertexInfo[1]).toFixed(3) + ',' +
                parseFloat(vertexInfo[2]).toFixed(3) 
                +'</td>' + '<td style ="word-break:break-all;">' + (waypoints[i].label).substring(0,10) + e;
        }
        
        var vsubstrL =  parseFloat(vertexInfo[1]).toFixed(3) + ',' +
            parseFloat(vertexInfo[2]).toFixed(3) 
            + waypoints[i].label;
        
        vTable += '<tr id="waypoint' + i + '" custom-title = "' + vsubstrL +'" onmouseover = "hoverV('+i+', false)" onmouseout = "hoverEndV('+i+', false)" onclick = "labelClickHDX('+i+')" ><td style ="word-break:break-all;">' + i +'</td>';
        
        var vstr = '<td style ="word-break:break-all;"' ; 
        var vstr2 = vstr +'>' + vsubstr + '</td></tr>';
        vTable += vstr2;
    }
    vTable += '</tbody></table>';
    
    var eTable = '<table  id="connection" class="table table-light"><thead class = "thead-dark"><tr><th scope="col" colspan="3">Connections</th></tr><tr><th scope="col">#</th><th scope="col">Route Name(s)</th><th scope="col">Endpoints</th></tr></thead><tbody>';
    graphEdges = new Array(numE);
    for (var i = 0; i < numE; i++) {
        var edgeInfo = lines[i+numV+2].split(' ');
        var newEdge;
        if (haveTravelers) {
            if (edgeInfo.length > 4) {
                newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1],
                                        edgeInfo[2], edgeInfo[3],
                                        edgeInfo.slice(4));
            }
            else {
                newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1],
                                        edgeInfo[2], edgeInfo[3], null);
            }
            if (newEdge.travelerList.length > maxEdgeTravelers) {
                maxEdgeTravelers = newEdge.travelerList.length;
            }
        }
        else {
            if (edgeInfo.length > 3) {
                newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1],
                                        edgeInfo[2], null,
                                        edgeInfo.slice(3));
            }
            else {
                newEdge = new GraphEdge(edgeInfo[0], edgeInfo[1],
                                        edgeInfo[2], null, null);
            }
        }
        var firstNode = Math.min(parseInt(newEdge.v1), parseInt(newEdge.v2));
        var secondNode = Math.max(parseInt(newEdge.v1), parseInt(newEdge.v2));
        // add this new edge to my endpoint vertex adjacency lists
        waypoints[newEdge.v1].edgeList.push(newEdge);
        waypoints[newEdge.v2].edgeList.push(newEdge);
        var test = edgeInfo[0] + ':&nbsp;' + waypoints[newEdge.v1].label +
            ' &harr; ' + edgeInfo[1] + ':&nbsp;'
            + waypoints[newEdge.v2].label;
        var subst = '<td style ="word-break:break-all;">'
            + edgeInfo[0] + ':&nbsp;' + (waypoints[newEdge.v1].label).substring(0,5) +
            ' &harr; ' + edgeInfo[1] + ':&nbsp;'
            + (waypoints[newEdge.v2].label).substring(0,5) + '</td>';
        
        eTable += '<tr custom-title = "' + test + '"' + 'onmouseover="hoverE(event,'+i+')" onmouseout="hoverEndE(event,'+i+')" onclick="edgeClick('+i+')" id="connection' + i + '" class="v_' + firstNode + '_' + secondNode + '"><td id = "connectname" style ="word-break:break-all;" >' + i + '</td>';
        
        var subst2 = '<td style ="word-break:break-all;"'; 
        var subst3 = subst2 + '>' + edgeInfo[2] + subst;
        eTable += subst3;
        
        graphEdges[i] = newEdge;
        // record edge index in GraphEdge structure
        newEdge.edgeListIndex = i;
    }
    
    eTable += '</tbody></table>';
    genEdges = false;
    usingAdjacencyLists = true;

    // if we have travelers, read those in too
    if (haveTravelers) {
        travelerNames = lines[lines.length-2].split(' ');
    }
    hdxAV.setStatus(hdxStates.GRAPH_LOADED);
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
                var newEdge = new GraphEdge(i-1, i, info.waypoint.elabel,
                                            null, info.via);
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
    waypointColors = new Array();
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
            var xline = lines[i].split(' ');
            if (xline.length == 3 || xline.length == 4) {
                waypoints[waypoints.length] = new Waypoint(xline[0], xline[1], xline[2], "", "");
                if (xline.length == 3) {
                    waypointColors[waypointColors.length] = "red";
                }
                else {
                    if (xline[3] == "FP" || xline[3] == "FPLI") {
                        waypointColors[waypointColors.length] = "green";
                    }
                    else { // must be "LI"
                        waypointColors[waypointColors.length] = "yellow";
                    }
                }
            }
        }
    }
    // graph edges between pairs, will be drawn as connections
    var numE = waypoints.length/2;
    graphEdges = new Array(numE);
    for (var i = 0; i < numE; i++) {
        // add the edge
        graphEdges[i] = new GraphEdge(2*i, 2*i+1, "", null, null);

        // add an entry to the table to be drawn in the pointbox
        var miles = distanceInMiles(waypoints[2*i].lat, waypoints[2*i].lon,
                                    waypoints[2*i+1].lat,
                                    waypoints[2*i+1].lon).toFixed(4);
        var feet = distanceInFeet(waypoints[2*i].lat, waypoints[2*i].lon,
                                  waypoints[2*i+1].lat,
                                  waypoints[2*i+1].lon).toFixed(2);
        table += "<tr style=\"background-color:" + waypointColors[2*i] +
            "\"><td><table class=\"nmptable2\"><thead /><tbody><tr><td>"
            + "<a onclick=\"javascript:labelClickHDX(" + 2*i + ");\">"
            + waypoints[2*i].label + "</a></td><td>("
            + waypoints[2*i].lat + ","
            + waypoints[2*i].lon + ")</td></tr><tr><td>"
            + "<a onclick=\"javascript:labelClickHDX(" + (2*i+1) + ");\">"
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
    // register the HDX-specific event handler for waypoint clicks
    registerMarkerClickListener(labelClickHDX);
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
    var url = xline[xline.length-1];
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


/* function is currently obsolete, but remains as a starting point
   for its eventual replacement:

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
*/

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

//Takes anything with a custom-title attribute and appends
//them into span tag under document.body. This then adds various
//styles and class, that function as ids (allowing for more "ids")
function customTitle()
{
    var body = document.body;
    //selects all things with attribute custom-title
    var titles = document.querySelectorAll("[custom-title]");
    var numberOfDataTitles = getLastTitle();
    for(let x = 0; x <titles.length; x++)
        {
            //offset the numbering to avoid conflicts
            var offset = numberOfDataTitles + x;
            var theClass = "Atitle" + offset;
            //adds class to the original html
            titles[x].classList.add(theClass);
            //Remove any duplicates before after adding the class, but before doing anything else
            updateTitle(titles[x]);
            
            
            //Adds a mouse event when it enters an object with a custom title
            //will grab the class(psuedo-ID) and change the spantags display to block
            titles[x].addEventListener("mouseenter", function(event){
                try {
                    var target = event.target; //mouse enter event
                    var currClass = target.getAttribute("class"); // grabs the current class, acting as an ID
                    currClass = currClass.substr(currClass.indexOf("Atitle"));
                    var classNodes = document.body.getElementsByClassName(currClass);
                    var spanTag = classNodes[1];//Grabs the spanTag as it is always the 2nd element when pulled this way
                    var style = window.getComputedStyle(spanTag);
                    var display = style.getPropertyValue("display");
                    if (display == "none") {
                        spanTag.style.display = "block";
                    }
                    
                    //Get the left and top x-y coordinates. Set them for the span tag
                    var rect = classNodes[0].getBoundingClientRect();
                    var left = rect.left;
                    spanTag.style.left = left + "px";
                    spanTag.style.top = (50 + rect.top) + "px";
                    
                    //Grab the span tag's right most side, if its past the screen, shift
                    //it to the left the difference to display it all
                    var rect2 = spanTag.getBoundingClientRect();
                    if (rect2.right > window.innerWidth) {
                        spanTag.style.left = left - (rect2.right - window.innerWidth) + "px";
                    }

                }
                catch(err)
                {
                    console.log("MouseEnter has encountered an error");
                }
            }, false);

            
            //Adds a mouse event when it leaves an object with a custom title
            //will grab the class(psuedo-ID) and change the spantags display to none
            titles[x].addEventListener("mouseleave", function(event){
                try {

                    var target = event.target;
                    var currClass = target.getAttribute("class"); // grabs the current class, acting as an ID
                    currClass = currClass.substr(currClass.indexOf("Atitle"));
                    var classNodes = document.body.getElementsByClassName(currClass);
                    var spanTag = classNodes[1]; //Grabs the spanTag as it is always the 2nd element
                    var style = window.getComputedStyle(spanTag);
                    
                    var display = style.getPropertyValue("display");
                    if (display == "block") {
                        spanTag.style.display = "none";
                    }
                }
                catch(err){
                    console.log("MouseLeave has encountered an error");
                }
                       
            }, false);

            //obtains the text of the custom title and creates a text node
            var titleValue= titles[x].getAttribute("custom-title");
            var titleNode = document.createTextNode(titleValue);
            var title = document.createElement("span");
            //setAttribute
            //Adds attributes of Style to the span tag
            title.style.display = "none";
            title.classList.add(theClass);
            title.classList.add("data-title");
            title.style.position = "fixed";

            var rect = titles[x].getBoundingClientRect();
            title.style.left = "" + rect.left + "px";
            title.style.top = "" + rect.top + "px";
            title.style.zIndex = "99999";
            title.style.maxWidth = "550px";
            //adds the titleNode to title
            title.appendChild(titleNode);
            var textt = title.innerHTML;
            while(textt.includes("&gt;"))
                {
                    title.innerHTML = title.innerHTML.replace(/&lt;/, '<').replace(/&gt;/, '>');
                    textt = textt.replace(/&lt;/, '<').replace(/&gt;/, '>');
                }
            //in case the label glitches
            title.addEventListener("mouseenter",function(event) {
                let target = event.target;
                target.style.display = "none";
            },false);
            //span tag - title - is added to the body
            body.appendChild(title);

            //remove attribute custom-title from the object processed
            //This is to avoid running this multiple times on the same object
            //MUST BE HERE DUE TO CODE EXECUTION TOP TO BOTTOM
            titles[x].removeAttribute("custom-title");
        }
}

//Updates title classes of elements to assure there is no overlap of mult. classes
//This will allow for the tags to auto update without any confusion
function updateTitle(customSpanTag)
{
    //Last previously known class with the prefix title
    var lastClass = "";
    //grabs all classes from the current tag
    let classes = customSpanTag.classList;
    for(let temp of classes)
        {
            //if the current class has title in it
            if(temp.includes("Atitle"))
                {
                    //if last class was already a title
                    if(lastClass.includes("Atitle"))
                        {
                            //remove the class title###... from the main tag
                            //get Elements both with the title###... and data-title classes
                            //find the span tag and remove that node
                            customSpanTag.classList.remove(lastClass);
                            let pickMe = lastClass + " data-title";
                            let spanTagRemove = document.getElementsByClassName(pickMe)[0];
                            spanTagRemove.parentNode.removeChild(spanTagRemove);
                        }
                    //Last class is set to a title
                    lastClass = temp;
                }   
        }
}

//Gets the titile class with the last number. This will keep indexing constant so no numbers double over
//and mess up the link between the tags. OFFSET method
function getLastTitle()
{
    //last = length of data-title list -> Check to make sure theres
    //at least one
    let last = document.getElementsByClassName("data-title").length-1;
    if(last >= 0)
        {
            //Get the last indexed data-title class -> This directly relates with the
            //highest number one due to TOP to BOTTOM
            let lastOne = document.getElementsByClassName("data-title")[last];
            //Grabs the individual classes from the tag
            let classes = lastOne.classList;
            let theOne = "";
            //Go through and check the tag's classes. If any have the pattern title#+
            //make theOne equal to it
            for(let title of classes)
                {
                    if(/Atitle(\d+)/.test(title))
                       {
                            theOne = title;
                       }
                }
            //remove the "title" part and parse it for the number portion
            theOne = theOne.substring(6);
            return (parseInt(theOne) + 1);
        }
    else
        {
            //return there are NONE
            return 0;
        }
}

//Hide the instructions object
function hideInstructions()
{
    let element = document.getElementById("instructions");
    element.style.display = "none";
}

//Inserts innerHTML of code lines
//for conditionals
function commonConditionalBreakpoints(name){
    let html = "No innerHTML"
    switch(name){
        case "vtestforLoopTop":
        case "v2forLoopTop":
        case "v1forLoopTop":
        case "forLoopTop":
            html = buildWaypointSelector2("generic2", "Please select the vertex to stop at: ", 0);
            return html;
    }
    return html;
}

//Used with each algorithms method to check if a method
//has a conditional
function hasCommonConditonalBreakpoints(name){
    switch(name){
        case "vtestforLoopTop":
        case "v2forLoopTop":
        case "v1forLoopTop":
        case "forLoopTop":   
            return true;
    }
    return false;
}

//This is for Instructions tabs
//This creates the clickable tabs for the info box
function createTabs(){
    var instructionTabSelected = "instructionTab1"
    let elements = document.getElementsByClassName("tabs");
    for(let element of elements){
        element.addEventListener("click", function(event){
            instructionTabSelected = element.getAttribute("id");
            document.getElementById("instructionsBody").innerHTML = instructionsText(instructionTabSelected);
            let temp = document.getElementsByClassName("tabs");
            for(let ele of temp){
                ele.style.backgroundColor = "white";
            }
            event.target.style.backgroundColor = "yellow";
        }, false);
    }
}

//This is the text that goes into the help box
function instructionsText(whatText){
    switch(whatText){
        //Map Waypoints Tab
        case "instructionTab1":
            html = '<header><b><u>Maps and Waypoints</u></b></header><br \>';
            html += 'METAL is a project that allows for the visualization and interaction with algorithms ' +
                'while using locations to help show their real life contribution. This project was originally using ' +
                'google maps to get locations and waypoints. After google discontinued support for API calls, it was ' +
                'done away with. A solution had to be found and that was in the name of leaflet.';
            html += '<br \>';
            html += 'When you first load up a map, there are many ways in doing so. Option 1 allows for you to search' +
                ' the list of graphs and select one with enter. ' +
                '<br \><img src="pictures/option1Selection.PNG" alt="Option 1 Selection Example"><br \>';
            html += 'Option 2 allows for you to select the map from a drop down list of all maps. They can be ' +
                'sorted from the number of vertices, alphabetically or other areas of interest.';
            html += '<br \><img src="pictures/option2Selection.PNG" alt="Option 2 Example"><br \>';
            html += 'Option 3 allows for you to select a TMG file that is saved locally, so you can specific ' +
                'maps with ease.';
            html += '<br \><img src="pictures/option3Selection.PNG" alt="Option 3 Example"><br \>';
            html += 'The map will tell you the number of waypoints and connections there are on it as the size' +
                ' ex: size:(57, 50) would mean 57 waypoints and 50 connections <br \>';
            html += 'Upon selecting the map, you will have the choice of what algorithm to visualize. The majority' +
                ' of which are linear algorithms and the others are recursive.';
            html += '<br \><img src="pictures/algorithmSelect.PNG" alt="Algorithm Select Example"><br \>';
            html += 'Options will show up once you select the algorithm allowing you to customize what data is ' +
                'tracked and things like starting points/ending points. Below is Prims Algorithm where you can select' +
                ' the starting point and ending point, as well as the ending condition for the algorithm.';
            html += '<br \><img src="pictures/primsAlgorithmOptions.PNG" alt="Prims Algorithm Options Example"><br \>';
            html += "Waypoints exist in a couple of places for the user to see. The first would be the waypoints box" +
                " on the right side of the screen with the other as points on the map" +
                ". In this box you can find the given waypoint number, it's real " +
                "coordinates and it's name. Hovering on a box will bring up it's full label for you to see, which " +
                "is a combination of it's coordinate and name.";
            html += '<br \><img src="pictures/waypointInfoBox.png" alt="Waypoint Info Box Example"><br \>';
            html += "When hovering on a point in the box, it will highlight the point on the map so you know " +
                "exactly where it lies. Clicking on the point will move the map over by a few pixels to help center" +
                " it. Although, you may have to click a few times to get there. Another key feature of waypoints are" +
                " when you click on a specific waypoint in it's box or on the map, the vertex on the map of it will " +
                "have a popup which shows the data above it pointing to it directly.";
            html += '<br \><img src="pictures/waypointHoverPoint.png" alt="Waypoint Color Example">';
            html += '<img src="pictures/waypointVertexPopup.PNG" alt="Waypoint Popup Example"><br \>';
            return html;
        //AV Status Box
        case "instructionTab2":
            html = '<header><b><u>Algorithm Visualization Box</u></b></header><br \>';
            html += 'The Algorithm Visualization (AV) Box contains various info for the user. Among these are ' +
                'important points to each individual algorithm. For example, in Vertex Extreme Search, some of these ' +
                'points would be North, South, West and East extremes, the shortest and longest vertex labels ' +
                'and the first and last vertex label alphabetically.<br \>' +
                '<img src="pictures/vertexExtremesAVBox.PNG" alt="Vertex Extremes AVBox Example"><br \>';
            html += 'Above the unique algorithm info will be various info about the waypoints. This info will include' +
                ' the number of vertices not yet visited, the currently visited vertex and the number of discarded' +
                ' ones<br \><img src="pictures/genericWaypointInfo.PNG" alt="Generic Waypoint Info Example"><br \>';
            html += 'And above this info will exist a log list and pseudocode for the algorithm. The log will explain' +
                ' what action is currently happening and can be hovered on for a list of the past 5 events. For ' +
                'more info on the pseudocode, click on the Pseudocode Emulation tab.<br \>' +
                '<img src="pictures/logInfoPseudocode.PNG" alt="Log List and Pseudocode Example"><br \>';
            html += 'Lastly, points on the map, and in the Waypoints box correspond with the info in the AV box based' +
                ' on color';
            return html;
        //Pseudocode tab
        case "instructionTab3":
            html = '<header><b><u>Pseudocode Emulation</u></b></header><br \>';
            html += 'For the METAL project, the code that is seen on screen is never ran. This means that all of the ' +
                'code is fake. However, that is not entirely true. There is actually code tied to it so it will run ' +
                'correctly. This allows for us to emulate a debugger/VM for the code. With that said, the pseudocode' +
                ' provided are the correct steps for the given algorithm. A great feature is the breakpoint system.' +
                ' By clicking on a line of code, if it has breakpoint capabilities, it will highlight in red. When ' +
                'METAL runs, it will stop every time it comes across the on screen code.';
            html += '<br \><img src="pictures/breakpointExample.PNG" alt="Breakpoint Example"><br \>';
            html += 'To further on the breakpoint functionality, there are conditional breakpoints as well. This' +
                ' means that certain lines of code (most at this point) will offer additional conditions aside from' +
                ' when we run the line. The additional requirements show up as a pop up to the right of the AV' +
                ' status panel.';
            html += '<br \><img src="pictures/conditionalBreakpointPopout.PNG" alt="Condtional ' +
                'Breakpoint Example"><br \>';
            html += 'To enable this feature, check the box on the popout.<img ' +
                'src="pictures/checkedBox.PNG" alt="checkbox Example"><br \>';
            html += 'Examples of these are for loops allowing to stop at any vertex, if statements allowing you to ' +
                'choose what condition to stop at and lines like engueue and dequeue allowing stops at certain ' +
                'starting vertices, connections and ending vertices.<br \>';
            html += 'Every speed setting works with these breakpoints except for run to completion. If ' +
                'you would like to jump directly to where the next instance of your break point happens as fast as ' +
                'possible, select the jump to breakpoint setting.';
            html += '<br \><img src="pictures/speedSettings.PNG" alt="Speed Settings Example"><br \>';
            html += 'Lastly, hovering over the line of code will show how many times it has been executed.';
            return html;
        //Extra Info
        case "instructionTab4":
            html = '<header><b><u>Extra info</u></b></header><br \>';
            html += '';
            return html;
        //Contributions tab
        case "instructionTab5":
            html = '<header style="text-align: center;"><b><u>Contributions</u></b></header><br \>';
            html += contributions("Original Author/Owner of Metal", "Prof. James Teresco");
            html += '<header style="text-align: center;"><b><u>Summer 2019</u></b></header><br \>';
            html += contributions("Undergraduate Researcher", "Tyler Gorman");
            html += contributions("Undergraduate Researcher", "Zac Goodsell");
            html += contributions("Undergraduate Researcher", "Alissa Ronca");
            html += '<header style="text-align: center;"><b><u>Summer 2018</u></b></header><br \>';
            html += contributions("Undergraduate Researcher", "Abdul Samad");
            html += contributions("Undergraduate Researcher", "Michael A. Dagostino Jr.");
            html += contributions("Undergraduate Researcher", "Eric D. Sauer");
            html += '<header style="text-align: center;"><b><u>Summer 2017</u></b></header><br \>';
            html += contributions("?", "Lukasz Ziarek");
            html += contributions("PHD candidate", "Razieh Fathi");
            html += contributions("Undergraduate Researcher", "MariaRose Bamundo");
            html += contributions("Undergraduate Researcher", "Arjol Pengu");
            html += contributions("Undergraduate Researcher", "Clarice F. Tarbay");
            return html;
    }
}

//This function takes a title of a person, and their name
//and it sets them float left, float right and adds a new line after
function contributions(title, name){
    let line = '<div style="float: left;">' + title + '</div><div style="float: right;">' + name + '</div><br \>';
    return line;
}