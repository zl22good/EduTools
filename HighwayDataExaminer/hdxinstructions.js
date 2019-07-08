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
of roads as chosen by the <a target="_blank"
href="http://travelmapping.net">Travel 
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

        // AV Control panel
        case "instructionTab2":
            return `
<header><b><u>Algorithm Visualization Control Panel</u></b></header><br />

<p>The Algorithm Visualization Control Panel appears at the top edge
of the map once a graph is loaded into HDX and an algorithm is
selected.<br />

<img src="pictures/avcp.png" alt="Algorithm Visualization Control
Panel"></p>

<p>The button labeled "Start" will change its label and functionality
(e.g, to "Resume" or "Step") depending on the state of the AV.  The
speed dropdown box changes the speed of the simulation and is also the
place to set to run step-by-step, run to the next breakpoint, or run
to completion of the entire algorithm.</p>

<p>The "Trace Pseudocode" checkbox determines whether HDX will execute
the AV and update its on-screen information based on lines or code
(when checked) or based on larger "iterations" of the algorithm.  The
definition of an "iteration" is algorithm-dependent, but is usually a
single iteration of the algorithm's outermost loop.  See the
"Code/Breakpoints" tab in this window for more on pseudocode and
breakpoints.</p>

<p>The "Reset AV" button resets to the start of the AV on the same
data, and the "Load Data Options" brings back the "Load Data" panel to
load in different data.</p>

<p>The "Show Data Tables" checkbox allows the table of waypoints and/or connections on the right side of the window to be hidden to expose more of the map.</p>

`;

        //AV Status Box
        case "instructionTab3":
            return `
<header><b><u>Algorithm Visualization Status Panel</u></b></header><br />

<p>The Algorithm Visualization (AV) Status Panel, which occupies the
left side of the window, contains all of the information about the AV
in progress.</p>

<p>The first entry in the AV Status Panel is a brief description of
the currently executing step in the AV.<br />

<img src="pictures/logInfoPseudocode.PNG" alt="Log List and Pseudocode
Example"><br />

By hovering over this entry with the mouse pointer, the 5 most
recently-executed steps are shown.</p>

<p>When selected in the AV Control Panel, the next part of the AV
Status Panel shows METAL's representation of the pseudocode for the
algorithm being simulated.  Details about this pseudocode, including
execution counts and conditional breakpoints, are given in the
"Code/Breakpoints" tab in this window.</p>

<p>The remainder of the AV Status Panel contains algorithm-specific
information.  These are usually values of important variables and the
contents of important data structures. Most are color-coded to match
the corresponding waypoints and/or connections both on the map and in
the data tables.
For example, in the Vertex Extremes Search, entries are included to
indicate which vertices have not yet been visited, which one is
currently being visited, and which vertices have been visited but are
not leaders in any category.<br />

<img src="pictures/genericWaypointInfo.PNG" alt="Generic Waypoint Info Example"><br />

And entries are included for the current leader in each category.<br />

<img src="pictures/vertexExtremesAVBox.PNG" alt="Vertex Extremes AVBox
Example"><br />

In many cases, including these, expanded information is available by
hovering the mouse pointer over entries in the AV Status Panel.  For
example, in the Vertex Extremes Search where the option is selected to
track all vertices which are tied for the lead in a given category,
space concerns necessitate that the complete information is only
included about the first leader vertex found.  Information about other
vertices tied for the lead can be seen by hovering over the entry for
that category.
</p>
`;
        //Pseudocode tab
        case "instructionTab4":
        return `
<header><b><u>Pseudocode and Conditional
Breakpoints</u></b></header><br />

<p>The pseudocode displayed and "executed" during METAL AVs really is a
"pseudo" code -- behind the scenes it is implemented as a series of
actions, executed on a virtual machine.  Many of these actions
correspond to statements which are represented to the user by
something that looks more like the high-level language code most
people are used to.</p>

<p>When "Trace Pseudocode" is checked in the AV Control Panel, the
lines of pseudocode are highlighted as their actions are performed.
This alone can give some good insight into the behavior of an
algorithm, seeing which code is executed more frequently.  As the AV
proceeds, lines of code that are executed most frequently, the "hot"
ones, become more pink in color.  The "cold" lines, which are executed
rarely, become more blue in color.  At any time, the exact number of
times that each line has been executed can be seen by hovering the
mouse over that line of code.</p>

<p>METAL AVs also support both unconditional and conditional
breakpoints, giving debugger-like capabilities.  Suppose you wanted to
run an algorithm until a particular line of code is executed, or even
until a specific waypoint is first visited, or a specific connection
is first added to or removed from some data structure.  Breakpoints
provide these capabilities.  To set a breakpoint, click on a line of
code.  If it has breakpoint capabilities (the vast majority of lines
do), it will become highlighted with a red-dashed border.<br />

<img src="pictures/breakpointExample.PNG" alt="Breakpoint Example"><br />

When the AV is executed, it will stop every time it encounters that
line of code, so you can explore the state of the algorithm's progress
in the AV Status Panel, on the map, and in the data tables.  To clear
a breakpoint, either click on that line again (in which case no
breakpoint will be set), or click on a different line (in which case
that line will be set with a breakpoint).</p>

<p>Most lines of code also support conditional breakpoint.  This means
that execution would only stop on those lines if certain conditions
are met.  When a breakpoint is set at a line that supports conditional
breakpoints, a small red arrow appears to the right of the AV Status
Panel.  Click on it to reveal the popout where the condition can be
set.<br />

<img src="pictures/conditionalBreakpointPopout.PNG" alt="Condtional
Breakpoint Example"><br />

To enable conditions for this breakpoint, check the box on the
popout.<br />

<img src="pictures/checkedBox.PNG" alt="checkbox Example"><br />

Now, choose the conditions under which you wish the code to stop.
These are algorithm-specific, but common examples include stopping a
<tt>for</tt> loop at a specific vertex, stopping only when the
condition of an <tt>if</tt> statement takes on a specific value, 
or the insertion or removal of specific values from a data
structure.</p>

<p>Unconditional and conditional breakpoints are honored with any speed
setting except "Run to Completion".  To execute as quickly as possible
to the next breakpoint, the "Jump to Breakpoint" setting can be used.
<br />

<img src="pictures/speedSettings.PNG" alt="Speed Settings Example"></p>
`;

        //Contributions tab
        case "instructionTab5":
	let html = `
<header><b><u>Credits</u></b></header><br />

<p>METAL exists thanks to the previous and ongoing efforts of many
people.  The project was originally conceived and built by Jim Teresco
in his roles as a professor at Mount Holyoke College, The College of
Saint Rose, and Siena College.  He continues to be a primary
developer, and has supervised many student contributions to the
project as well.</p>

<header><b>Student Contributors</b></header>
`;

        html += contributions("Siena College Summer Scholars 2019", "Tyler Gorman");
        html += contributions("Siena College Summer Scholars 2019", "Zac Goodsell");
        html += contributions("Siena College Summer Scholars 2019", "Alissa Ronca");
        html += contributions("Siena College Summer Scholars 2018", "Abdul Samad");
        html += contributions("Siena College Summer Scholars 2018", "Michael Dagostino");
        html += contributions("Siena College Summer Scholars 2018", "Eric Sauer");
        html += contributions("Siena College Summer Scholars 2017", "MariaRose Bamundo");
        html += contributions("Siena College Summer Scholars 2017", "Arjol Pengu");
        html += contributions("Siena College Summer Scholars 2017", "Clarice Tarbay");
        html += contributions("Graduate Student", "Razieh Fathi");
	html += contributions("Spring 2015 Software Engineering Class at Saint Rose", "The Map Busters");

	html += `
<p>The development of this project has been guided by feedback
 from the students in classes at Mount Holyoke, Saint Rose, and
Siena, who have used METAL and its predecessor projects over the
years.</p>

<header><b>Travel Mapping</b></header>

<p>METAL's data is dervied from the <a target="blank"
href="http://travelmapping.net">Travel Mapping (TM) Project</a>, and METAL
exists thanks to the <a target="_blank"
href="http://travelmapping.net/credits.php">contributors, tools, and
sources used by TM</a>.</p>

<header><b>Funding Sources</b></header>

<p>Much of METAL's early development was done on a volunteer basis or
as part of Prof. Teresco's preparation in classes and labs where it
has been used.  Some of its more substantial development has been
funded by the <a target="_blank"
href="https://www.siena.edu/centers-institutes/center-for-undergraduate-research-and-creative-activity/summer-research/summer-scholars/">Summer
Scholars Program, Center for Undergraduate Research and Creative
Activity (CURCA), at Siena College</a>.</p> 
`;
        return html;
    }
}

//This function takes a title of a person, and their name
//and it sets them float left, float right and adds a new line after
function contributions(title, name){
    let line = '<div style="float: left;">' + title + '</div><div style="float: right;">' + name + '</div><br \>';
    return line;
}
