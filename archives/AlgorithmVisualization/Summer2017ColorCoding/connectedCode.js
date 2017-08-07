// functionality to be merged into traversals
// computing connected components

var red = 255;
var green = 0;
var blue = 0;
var piecenum = 1;

function startConnectedPieces(vert, visitarr) {
	
    discoveredVerticesName = "Queue";
    
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
    if (!hdxAV.paused()) {
	setTimeout(continueConnectedPieces, hdxAV.delay);
    }
}

function continueConnectedPieces() {
	
    // if we're paused, do nothing for now
    if (hdxAV.paused()) {
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
	hdxAV.status = hdxStates.AV_COMPLETE;
	document.getElementById("startPauseButton").disabled = true;
	document.getElementById("startPauseButton").innerHTML = "Start";
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
    if (newDS != null) {
	document.getElementById("algorithmStatus").appendChild(newDS);
    }
    setTimeout(continueConnectedPieces, hdxAV.delay);
}
