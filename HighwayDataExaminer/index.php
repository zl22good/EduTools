<?php
// function to generate the file load html
function hdx_load_file_entries() {
  echo <<<ENDOFSTUFF
      <tr><td class="loadcollapse">
		Upload file: <br>
        <input id="filesel" type="file"  value="Start" onchange="startRead()">
      </td></tr>
	  <tr><td id="selects" class="loadcollapse">
		Or load METAL graph: (select your filters then press "Get Graph List") <br>
		Order by:
		<select id = "orderOptions">
			<option value = "alpha">Alphabetical</option>
			<option value = "small">Size (small)</option>
			<option value = "large">Size (large)</option>		
		</select>
		<br>
		Restrict by:
		<select id = "restrictOptions">
			<option value = "collapsed">Collapsed (most likely you want this)</option>
			<option value = "simple">Simple</option>
			<option value = "all">All</option>		
		</select>
		<br>
		Category:
		<select id = "categoryOptions">
				<option value="all">All</option>
				<option value="region">Region</option>
				<option value="area">Area</option>
				<option value="continent">Continent</option>
				<option value="multiregio">Multi Region</option>
				<option value="multisyste">Multi System</option>
				<option value="system">System</option>
				<option value="master">Master</option>
				<option value="country">Country</option>
		</select>
		<br>
		Size from
		<input type="number" min="1" value="1" id="minVertices" style="width:6rem;">
		to 
		<input type="number" min="1" value="5000" id="maxVertices" style="width:6rem;">
		vertices
		<br>
		<input type="button" value="Get Graph List" onclick="mapOptions(event)">
	  </td>
	  <td id="loadcollapsebtn" style="display:none;">
		<input type="button" onclick="undoCollapse(event)" value="Show Load Options">
	  </td>
	  </tr>	  
ENDOFSTUFF;
}
?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <!--
    Highway Data Examiner (HDX) page
    Load and view data files related to Travel Mapping (TM) related
    academic data sets. (Formerly used Clinched Highway Mapping (CHM)
    data.)
    Author: Jim Teresco, Siena College, The College of Saint Rose
    Modification History:
    2011-06-20 JDT  Initial implementation
    2011-06-21 JDT  Added .gra support and checkbox for hidden marker display
    2011-06-23 JDT  Added .nmp file styles
    2011-08-30 JDT  Renamed to HDX, added more styles
    2013-08-14 JDT  Completed update to Google Maps API V3
    2016-06-27 JDT  Code reorganization, page design updated based on TM
-->


<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="http://cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css"/>
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css"/>
<link rel="stylesheet" type="text/css" href="http://tm.teresco.org/css/travelMapping.css"/>
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
  top:25px;
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
  right: 42px;
  top: 70px;
  bottom: 10px;
  overflow: scroll;
  max-width: 50%;
  max-height: 85%;
  opacity: .95;
}
#pseudoTable{
  position: absolute;
  padding: 5px;
  bottom: 150px;
  overflow-y: scroll;
  max-width: 33%;
  opacity: .95;
}
#mapOptions{
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
}
#menuIcon:hover {
		color: lightgrey;
}
#sidePanel {
    height: 100%;
    width: 0;
    position: absolute;
    z-index: 1;
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

/** Psudocode CSS */
.highlight {
    background-color: yellow;
}
.for1{}
.for2{}
.for3{}
.if1{}
.if2{}
=======
.box {
  	display: inline-block;
  	height: 20px;
  	width: 20px;
	border: 2px solid;
}
#contentArea_legend{
	background-color: white;
}
span{
	color: white;
}
#boxContainer{
	padding-left: 30px;
}
</style>
<script
 src="http://maps.googleapis.com/maps/api/js?sensor=false"
 type="text/javascript"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script
 src="http://cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"
  type="text/javascript"></script>
<!-- config file to find libs from a TM installation -->
<?php
  $hdxconffile = fopen("hdx.conf", "r");
  $tmliburl = chop(fgets($hdxconffile));
  echo "<script type=\"application/javascript\">";
  echo "var tmliburl = \"$tmliburl\";";
  echo "</script>\n";
  fclose($hdxconffile)
  ?>
<!-- load in needed JS functions -->
<?php
  echo "<script src=\"".$tmliburl."tmjsfuncs.js\" type=\"text/javascript\"></script>\n";
?>
<script src="hdxjsfuncs.js" type="text/javascript"></script>
<title>Highway Data Examiner</title>
</head>
<body onload="loadmap(); makeResize(); toggleTable(); createSidePanelBtn(); sidePanel(); mainArea()" ondragover="allowdrop(event)" ondrop="drop(event)">
<p class="menubar">
  HDX: <span id="filename">Select a file to display</span>
  <span id="status"></span>
</p>
<div id="map">
</div>
<input type="button" id="togglecontents_table" value="Hide Table" style="left:100px; top:25px; opacity:.75; position:absolute; padding:0;" onclick="toggleUI(event)">
<input type="button" id="toggleselected" value="Hide Panel" style="left:180px; top:25px; opacity:.75; position:absolute; padding:0;" onclick="toggleUI(event)">
<select id="distUnits" style="position:absolute; left:100px; top:48px; width: 7rem; z-index:2;" onchange="changeUnits(event)">
	<option value="miles">Miles</option>
	<option value="km">Kilometers</option>
	<option value="feet">Feet</option>
	<option value="meters">Meters</option>
</select>
<div id="selected" draggable="true"  ondragstart="drag(event)" style="left:10px; top:70px; position:absolute; z-index:3;">

</div>
<div id="options">
  <table id="optionsTable" class="gratable">
    <thead>
      <tr><th>Load/Map Options</th></tr>
    </thead>
    <tbody>
      <?php hdx_load_file_entries(); ?>
      <tr><td>
        <input id="showHidden" type="checkbox" name="Show Hidden Markers" onclick="showHiddenClicked()" checked="false">&nbsp;Show Hidden Markers
      </td></tr>
    </tbody>
  </table>
</div>
<div id="pointbox">
  No data loaded....
</div>
<div id="AlgorithmVisualization">
  <table id="AlgorithmsTable" class="gratable">
    <thead>
      <tr><th>Algorithm Simulation Control Panel</th></tr>
    </thead>
    <tbody>
      <?php hdx_load_file_entries(); ?>
      <tr><td>
        Algorithm Selection:
        <select id= "AlgorithmSelection" onchange="selectAlgorithmAndCheckBoxes()">
          <option value="NONE">Select an Algorithm</option>
          <option value="vertexSearch">Search Vertices</option>
          <option value="EdgeSearch">Search Edges </option>
          <option value="BFS">Breadth-First Traversal</option>
          <option value="DFS">Depth-First Traversal</option>
          <option value="RFS">Random-First Traversal</option>
		  <option value="connected">Connected Paths</option>
          <option value="ConvexHull"> Convex Hull </option>
         <option value="Dijkstra"> Dijkstra </option>
        </select>

      </td></tr>
      <tr><td id= "optionSection" > </td></tr>
        <!--. Start Vertex <input id="startPoint" type="text" name="Starting Point" value="0" size="7" /> -->
        <!-- <input id="showOptions" type="checkbox" name="Options" onclick="selectAlgorithmAndCheckBoxes()" > Options<br> -->
        <!-- <input id="showHidden" type="checkbox" name="Show selected algorithm pseudocode" onclick="showHiddenPseudocode()" >&nbsp;Pseudocode<br> -->
        <!-- <button type="button" onclick="selectAlgorithmAndCheckBoxes()">Options</button> -->
      <tr id="speedtr"><td>
        <button type="button" onclick="selectAlgorithmAndStart()">Start</button>
        <button type="button" onclick="pauseSimulation()">Pause</button>
        <!-- button type="button" onclick="resetSearch()">Reset</button -->
        <select id="speedChanger" onchange="speedChanged()">
          <option value="1">Fastest</option>
          <option value="5">Extremely fast</option>
          <option value="20">Very fast</option>
          <option value="50" selected>Fast</option>
          <option value="100">Medium speed</option>
          <option value="250">Pretty slow</option>
          <option value="500">Slow</option>
          <option value="1000">Painfully slow</option>
        </select>

      </td></tr>
     <!-- <tr><td id="selectionCheckboxes"></td><tr>-->
		<tr><td id="algorithmStatus" style="display:none"></td></tr>
      <!--<tr><td id="info1"></td><tr>
      <tr><td id="info2"></td><tr>
      <tr><td id="info3"></td><tr>
      <tr><td id="info4"></td><tr>
      <tr><td id="info5"></td><tr>
      <tr><td id="info6"></td><tr>-->
		<!--<tr><td id="legends"></td></tr>-->
		<tr><td id="pseudo"></td></tr>

            </tbody>
        </table>
    </div>

    <div id="controlbox">
        <select id="showHideMenu" onchange="toggleTable();">
            <option value="maponly">Map Only</option>
            <option value="options" >Show/Load Map Options</option>
            <option value="pointbox">Show Highway Data</option>
            <option value= "AlgorithmVisualization" selected="selected">Show Algorithm Visualization</option>
          </select>

        </div>
        <div id="contents_table" draggable="true"  ondragstart="drag(event)" style="top:70px; left:70%; z-index:3;">
        </div>
        </body>
</html>
