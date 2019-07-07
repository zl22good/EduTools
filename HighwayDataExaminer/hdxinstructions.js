//
// HDX Instructions box with tabs
//
// METAL Project
//
// Primary Author: Tyler Gorman, edits by Jim Teresco
//

//This is for Instructions tabs
//This creates the clickable tabs for the info box
function createTabs(){
    var instructionTabSelected = "instructionTab1"
    let elements = document.getElementsByClassName("tabs");
    for (let element of elements){
        element.addEventListener("click", function(event){
            instructionTabSelected = element.getAttribute("id");
            document.getElementById("instructionsBody").innerHTML = instructionsText(instructionTabSelected);
            let temp = document.getElementsByClassName("tabs");
            for (let ele of temp){
                ele.style.backgroundColor = "white";
            }
            event.target.style.backgroundColor = "yellow";
        }, false);
    }
}

//This is the text that goes into the help box
function instructionsText(whatText){
    switch (whatText){
        //Map Waypoints Tab
        case "instructionTab1":
            return `
<header><b><u>Maps and Graph Data</u></b></header><br /> 

<p>HDX is the METAL's visualization tool for the project's highway-based data
and algorithms operating on that data.</p> 

<p>The first step is to load some data into the system using the panel to
the left.  Most users will load METAL graph data directly from the
database using Options 1 or 2 and that will be the assumption for the
rest of these instructions.  (Note: this instructions panel will close
once you select data.)</p>

<p>Upon loading a METAL graph into HDX, its <i>waypoints</i> (i.e., graph
vertices) and <i>connections</i> (i.e., graph edges) are shown both on
the map and in a table.  Waypoints are typically major intersections
of roads as chosen by the <a href="http://travelmapping.net">Travel
Mapping</a> project, from which METAL graph data is derived, and
connections represent road segments that connect these waypoints.
Clicking on the waypoints (represented with the little yellow
"intersection" icons) or connections brings up popup windows with more
information about those graph entities and the intersections and roads
they represent.<br />
<img src="pictures/waypointVertexPopup.PNG" alt="Waypoint Popup
Example"><br />

Similar information can be found by hovering over entries in the data
table on the right side of the screen.  <br />

<img src="pictures/waypointInfoBox.png" alt="Waypoint Info Box
Example"><br />

Waypoints are identified by a unique label derivied from the name of
the intersection it represents and by an arbitrary but unique number.
Connections are identified by a unique number, include a label that
represents the route name(s), and by their waypoint endpoints.</p>

<p>Most HDX users are there to utilize its algorithm visualization
capabilities.  Choose from among the growing list of algorithms
supported in the "Algorithm Visualization Selection and Options"
panel.<br />
<img src="pictures/algorithmSelect.PNG" alt="Algorithm Select
Example"><br />

Many of the algorithms have various options and parameters, and these
will appear once an algorithm is selected.  For example, the
visualization of Prim's Algorithm allows selection of a starting
and ending vertices, as well as the stopping condition for the
algorithm.<br />

<img src="pictures/primsAlgorithmOptions.PNG" alt="Prims Algorithm
Options Example"></p>`;

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
