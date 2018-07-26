<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <!--
    Highway Data Examiner (HDX) page
    Load and view data files related to Travel Mapping (TM) related
    academic data sets. (Formerly used Clinched Highway Mapping (CHM)
    data.)
    Primary Author: Jim Teresco, Siena College, The College of Saint Rose
    Additional authors: Razie Fathi, Arjol Pengu, Maria Bamundo, Clarice Tarbay,
        Michael Dagostino, Abdul Samad, Eric Sauer

    (Pre-git) Modification History:
    2011-06-20 JDT  Initial implementation
    2011-06-21 JDT  Added .gra support and checkbox for hidden marker display
    2011-06-23 JDT  Added .nmp file styles
    2011-08-30 JDT  Renamed to HDX, added more styles
    2013-08-14 JDT  Completed update to Google Maps API V3
    2016-06-27 JDT  Code reorganization, page design updated based on TM
-->
<title>Highway Data Examiner</title>
<?php
  if (!file_exists("tmlib/tmphpfuncs.php")) {
    echo "<h1 style='color: red'>Could not find file <tt>".__DIR__."/tmlib/tmphpfuncs.php</tt> on server.  <tt>".__DIR__."/tmlib</tt> should contain or be a link to a directory that contains a Travel Mapping <tt>lib</tt> directory.</h1>";
    exit;
  }

 require "tmlib/tmphpfuncs.php";
?>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
<link rel="stylesheet" href="/leaflet/BeautifyMarker/leaflet-beautify-marker-icon.css">
<!-- bring in common JS libraries from TM for maps, etc. -->
<?php tm_common_js(); ?>
<script src="/leaflet/BeautifyMarker/leaflet-beautify-marker-icon.js"></script>
<!-- load in needed JS functions -->
<?php
  if (!file_exists("tmlib/tmjsfuncs.js")) {
    echo "<h1 style='color: red'>Could not find file <tt>".__DIR__."/tmlib/tmpjsfuncs.js</tt> on server.  <tt>".__DIR__."/tmlib</tt> should contain or be a link to a directory that contains a Travel Mapping <tt>lib</tt> directory.</h1>";
    exit;
  }
?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.jquery.min.js"></script>
<script src="basic-sch.js"></script>
<script src="tmlib/tmjsfuncs.js" type="text/javascript"></script>
<script src="hdxjsfuncs.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="supplmentalTypeAhead.css"/>
<link rel="stylesheet" type="text/css" href="supplmentalTypeAhead.css"/>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">


<?php
// function to generate the file load html
function hdx_load_file_entries() {
  echo <<<ENDOFSTUFF
		<tr><td id="selects" class="loadcollapse">
		Load METAL graph: (select filters then press "Get Graph List") <br>
		Sort criteria:
		<select id = "orderOptions">
			<option value = "alpha">Alphabetical</option>
			<option value = "small">Size (small)</option>
			<option value = "large">Size (large)</option>		
		</select>
		<br>
		Graph format:
		<select id = "restrictOptions">
			<option value = "collapsed">Collapsed (most likely you want this)</option>
			<option value = "simple">Simple</option>
			<option value = "all">All</option>		
		</select>
		<br>
		Graph category:
		<select id = "categoryOptions">
				<option value="all">All Graphs</option>
ENDOFSTUFF;
  $result = tmdb_query("SELECT * FROM graphTypes");

  while ($row = $result->fetch_array()) {
     echo "<option value=\"".$row['category']."\">".$row['descr']."</option>\n";
  }
  $result->free();
  echo <<<ENDOFSTUFF
		</select>
		<br>
		Size from
		<input type="number" min="1" value="1" id="minVertices" style="width:6rem;">
		to 
		<input type="number" min="1" value="2000" id="maxVertices" style="width:6rem;">
		vertices
		<br>
		<input type="button" value="Get Graph List" onclick="fillGraphList(event)">
	  </td>
	  <td id="loadcollapsebtn" style="display:none;">
		<input type="button" onclick="undoCollapse(event)" value="Show Load Options">
	  </td>
	  </tr>	  
      <tr><td class="loadcollapse">
		or upload file:
        <input id="filesel" type="file"  value="Start" onchange="startRead()">
      </td></tr>
ENDOFSTUFF;
}
?>


<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="http://cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css"/>
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css"/>
<link rel="stylesheet" type="text/css" href="http://travelmapping.net/css/travelMapping.css"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style type="text/css">
#controlbox {
  width: 25%;*/
  position: fixed;
  top:50px;
  bottom:100px;
  height:100%;
  left:400px;
  right:0px;
  overflow:auto;
  padding:5px;
}
#map {
  position: absolute;
  top: 25px;
  bottom:0px;
  width: 100%;
  overflow:hidden;
}
#map * {
  cursor:crosshair;
}
#selected {
  position: relative;
  overflow: scroll;
  display: inline-block;
  max-width: 50%;
  max-height: 85%;
  width:auto;
  height:auto;
  opacity: .95;  /* also forces stacking order */
}
#pointbox {
  visibility: hidden;
  left: 0px;
  width: 1px;
  height: 1px;
}
#options {
  visibility: hidden;
  left: 0px;
  width: 1px;
  height: 1px;
}
#showHideMenu {
  position: fixed;
  right: 10px;
  opacity: .75;  /* also forces stacking order */
}
#AlgorithmVisualization{
visibility: hidden;
left: 0px;
width: 1px;
height: 1px;
}
#contents_table{
  display: inline-block;
  position: absolute;
  overflow: scroll;
  right:2%;
  max-width: 30%;
  max-height: 95%;
  opacity: .95;
  z-index:750; // above leaflet tiles and overlays, below map tile selector
}

#pseudoTable{
  position: absolute;
  padding: 5px;
  bottom: 150px;
  overflow-y: scroll;
  max-width: 33%;
  opacity: .95;
}
#graphList{
width:150px;
}
table.dataTable tbody td{
padding:0px;
}

#menuIcon{
	padding: 0px;
	margin: 0px;
	top: 1px;
	position: fixed;
	display: inline-block;
	border: none;
	color: white;
}
#panelBtn {
	padding: 0px;
	margin: 0px;
	top: 3px;
	left: 10px;
	position: fixed;
	display: inline-block;
	text-align: center;
	border: none;
	text-decoration: none;
	z-index: 10;
}
#menuIcon:hover {
		color: lightgrey;
}
#sidePanel {
    height: 100%;
    width: 0;
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    background-color: #111;
    overflow-x: hidden;
    transition: 0.5s;
    padding-top: 60px;
}

#sidePanel a {
    padding: 8px 8px 8px 32px;
    text-decoration: none;
    font-size: 25px;
    color: #818181;
    display: block;
    transition: 0.3s;
}
#sidePanel a:hover, .offcanvas a:focus{
    color: #f1f1f1;
}

.sidePanel .closeButton {
    position: absolute;
    top: 0;
    right: 25px;
    font-size: 36px;
    margin-left: 50px;
}

@media screen and (max-height: 450px) {
  .sidePanel {padding-top: 15px;}
  .sidePanel a {font-size: 18px;}
}
#togglecontents_table{
	position: absolute;
	top: 35px;
}
#toggleselected{
	position: absolute;
	top: 35px;
}


table.pseudocode {
    font-size: 9pt;
    font-family: "Courier New", Courier, monospace;
    border: none;
    border-spacing: 0px;
    border-collapse: collapse;
    margin-left: auto;
    margin-right: auto;
    background-color: white;
    color: black;
}

td.pseudocode {
    border: none;
    border-collapse: collapse;
    padding-top: 0;
}

tr.pseudocode {
    border: none;
    border-collapse: collapse;
    padding-top: 0;
}

.highlight {
    background-color: yellow;
}
.for1{}
.for2{}
.for3{}
.if1{}
.if2{}

.box {
  	display: inline-block;
  	height: 20px;
  	width: 20px;
	border: 2px solid;
}
#contentArea_legend{
	background-color: white;
}
#boxContainer{
	padding-left: 30px;
}
#searchTest{
	top: 100px;
	margin: auto;
	background-color: white; 
	z-index: 14000;
	position: absolute;
}
#searchTable{
	border: 1px solid black;
	
}
#searchBox{
	width: 365px;
}
#algorithmControls2{
	top: 100px;
	margin: auto;
	background-color: white; 
	z-index: 12000;
	position: absolute;
	display: none;
}
#algControlsPanel{
	border: 1px solid black;
}
#selected{
	display: none;
}
#algStats{
	margin:auto;
	top: 100px;
	z-index: 10000;
	background-color: blue;
	position: absolute;
	overflow: scroll;
	width: 30%;
	max-height: calc(100vh - 125px);
	opacity: .95;
	display: none;
}
#algStatsTable{
	border: 1px solid black;
	max-width: 100%;
	
	
}
#algorithmControls3{
	background-color: white;
    margin: auto;
	top: 25px;
	left: 40%;
	margin-left: -80px;
	position: absolute;
	z-index: 11000;
	display: none;
}






</style>
</head>
<body onload="loadmap(); hdxAV.initOnLoad();" ondragover="allowdrop(event)" ondrop="drop(event)">
<p class="menubar">
  <span id="panelBtn" title="Menu" onclick="openSidePanel()">
     <i id="menuIcon" class="material-icons">menu</i>
  </span>
  HDX: <span id="startUp">Select data to display using the controls in the upper left</span>
  <span id="filename">Select a file to display </span>
  <span id="status"></span>
  <span id="currentAlgorithm"></span>
</p>
<div id="algorithmControls3">
<form onclick= clearForm(this.form)>
	<table id="newAlgControls">
			<tbody>
				<tr>
					<td id="speedtr">
						<button id="startPauseButton" type="button" onclick="startPausePressed()" disabled>Start</button>
						<select id="speedChanger" onchange="speedChanged()">
						<option value="0">Run To Completion</option>
						  <option value="1">Fastest possible</option>
						  <option value="5">Extremely fast</option>
						  <option value="20">Very fast</option>
						  <option value="50" selected>Fast</option>
						  <option value="100">Medium speed</option>
						  <option value="250">Pretty slow</option>
						  <option value="500">Slow</option>
						  <option value="1000">Painfully slow</option>
						  <option value="-1">Step</option>
						</select>
					</td>
					<td>
						<input id="pseudoCheckbox" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHidePseudocode()" >&nbsp;Pseudocode<br>
					</td>
					<td>
						<input type="button" value="Reset AV" onClick="clearForm(this.form)"/>
						<input type="button" value="Load Options" id="searchBarShow" onClick="ShowSearchBar()"/>
					</td>
				</tr>
			</tbody>
	</table>
</div>
<div id="map">
</div>
<!-- commented out until this system can be reworked
<select id="distUnits" style="position:absolute; left:100px; top:48px; width: 7rem; z-index:2;" onchange="changeUnits(event)">
	<option value="miles">Miles</option>
	<option value="km">Kilometers</option>
	<option value="feet">Feet</option>
	<option value="meters">Meters</option>
</select>
-->
	<div id="searchTest">
	<form name="algVis" action="#">
		<table id="searchTable" class="gratable">
			<thead>
				<tr><th>Load Data:</th></tr>
			</thead>
			<tbody id="AVControlPanel">
			<tr>
				
				<td>
				Search for a graph:
						<div id="the-basics">
						  <input class="typeahead" type="text" id="searchBox" placeholder="Pick a Graph" onkeypress="returnInput()">
						  
						</div>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<?php hdx_load_file_entries(); ?>
					</div>
				</td>
			</tr>
			
	  
			<tr><td id="hideButtonRow"> <input type="button" value="Hide Search Bar" id="hideSearchBar" onClick="hideSearchBar()" disabled></td></tr>
			</tbody>
		</table>
	</div>
	<div id="algorithmControls2" style="display=none;">
		<table id="algControlsPanel" style="display=none;" class="gratable">
			<thead>
				<tr><th>Algorithm Options</th></tr>
			</thead>
			<tbody>
			<tr>
			<td>
				Algorithm to Visualize:
			<select id="AlgorithmSelection" onchange="algorithmSelected()" disabled>
		<!-- filled in with options by JS code in hdxAV.initOnLoad() -->
			</select>

      </td>
			</tr>
				<tr>
					<td id="algorithmOptions"></td>
					
				</tr>
				<tr>
					<td>
						<input type="button" value="Done" id="algOptionsDone" onClick="hideAlgorithmControls()" disabled>
						<input type="button" value="Dismiss Options" id="algoOptionsDismiss" onClick="hideAlgorithmControlsOnDismiss()">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	
	<div id="algStats">
		<table id="algStatsTable" class="gratable">
			<thead><tr><th>Algorithm Visualization Information</th></tr><thead>
			<tbody id="algorithmVars">
			<tr><td id="algorithmStatus"></td></tr>
			<tr><td id="pseudo">
						<span id="pseudoText" style="display:none;">Select an algorithm to view pseudocode.</span>
					</td>
			</tr>
			</tbody>
		</table>
	</div>

    <div id="controlbox" style="z-index:2000;">
        <select id="showHideMenu" onchange="toggleTable();">
           <!-- <option value="maponly">Map Only</option>-->
            <option value="options" >Show/Load Map Options</option>
            <option value="pointbox">Show Highway Data</option>
            <option value= "AlgorithmVisualization" selected="selected">Show Algorithm Visualization</option>
          </select>

        </div>
		</form>
        <div id="contents_table" draggable="false"  ondragstart="drag(event)">
        </div>
        </body>
</html>
<?php tmdb_close(); ?>
