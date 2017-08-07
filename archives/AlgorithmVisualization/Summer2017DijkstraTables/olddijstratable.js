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

