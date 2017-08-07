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

function DSColor(id, color) {
    
    document.getElementById(id).style.backgroundColor = color;
}

