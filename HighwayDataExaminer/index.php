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
<script src="tmlib/tmjsfuncs.js" type="text/javascript"></script>
<script src="hdxjsfuncs.js" type="text/javascript"></script>
<script src="hdxav.js" type="text/javascript"></script>
<script src="hdxcallbacks.js" type="text/javascript"></script>
<script src="hdxvisualsettings.js" type="text/javascript"></script>
<script src="hdxavcp.js" type="text/javascript"></script>
<script src="hdxvertexselector.js" type="text/javascript"></script>
<script src="hdxhover.js" type="text/javascript"></script>
<script src="hdxpseudocode.js" type="text/javascript"></script>
<script src="hdxnoav.js" type="text/javascript"></script>
<script src="hdxvertexextremesav.js" type="text/javascript"></script>
<script src="hdxedgeextremesav.js" type="text/javascript"></script>
<script src="hdxextremepairsav.js" type="text/javascript"></script>
<script src="hdxtravspanavs.js" type="text/javascript"></script>
<script src="hdxbfchav.js" type="text/javascript"></script>
<script src="hdxlinear.js" type="text/javascript"></script>
<script src="hdxpresort.js" type="text/javascript"></script>
<script src="hdxgraphsearchbox.js" type="text/javascript"></script>
<script src="hdxkruskalav.js" type="text/javascript"></script>
<script src="hdxdegreeav.js" type="text/javascript"></script>
<script src="hdxdfsrecav.js" type="text/javascript"></script>
<script src="hdxinstructions.js" type="text/javascript"></script>
<script src="hdxclosestpairsrecav.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="supplmentalTypeAhead.css"/>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">


<?php
// function to generate the file load html
function hdx_load_file_entries() {
  echo <<<ENDOFSTUFF
		<tr><td id="selects" class="loadcollapse">
		<b>Option 2: </b>Search for a METAL graph by characteristics.<br />Select desired graph characteristics then press "Get Graph List" to see matching graphs.<br>
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
			<option value = "traveled">Traveled</option>
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
	  </tr>	  
      <tr><td class="loadcollapse">
	  <b>Option 3:</b>Select and upload a data file from your computer.<br />
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
<link rel="stylesheet" type="text/css" href="hdx.css" />
</head>

<body onload="loadmap(); getDescriptions(); getGraphs(); hdxAV.initOnLoad(); createTabs();" ondragover="allowdrop(event)" ondrop="drop(event)">
<p class="menubar">
  HDX: <span id="startUp">To begin, select data to display using the Load Data panel at the upper left of the map</span>
  <span id="filename"></span>
  <span id="status"></span>
  <span id="currentAlgorithm"></span>
</p>
<div id="topControlPanel">
  <table id="topControlPanelTable">
    <tbody>
      <tr>
	<td id="topControlPanelAV1">
	  <button id="startPauseButton" type="button" onclick="startPausePressed()">Start</button>
	  </td><td id="topControlPanelAV2">
	  <select id="speedChanger" onchange="speedChanged()">
	    <option value="0">Run To Completion</option>
        <option value="0">Jump To Breakpoint</option>
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
	  </td><td id="topControlPanelAV3">
	  <input id="pseudoCheckbox" type="checkbox" name="Pseudocode-level AV" checked onclick="showHidePseudocode();cleanupBreakpoints()" />&nbsp;Trace Pseudocode<br>
	  </td><td id="topControlPanelAV4">
	  <input id="resetButton" type="button" value="Reset AV" onclick="resetPressed();cleanupBreakpoints()" />
	<!-- if any more AV-specific entries are added, they need to
	     be dealt with in showTopControlPanel() -->
	<td>
	  <input id="loadOptionsButton" type="button" value="Load Data Options" id="loadDataPanelShow" onClick="loadDataOptionsPressed()"/>
	</td>
	<td>
	  <input id="datatablesCheckbox" type="checkbox" name="Datatables" checked onclick="showHideDatatables()" />&nbsp;Show Data Tables<br>
	</td>
	<td id="topControlPanelShowMarkers">
          <input id="showMarkers" type="checkbox" name="Show Markers" onclick="showMarkersClicked()" checked />&nbsp;Show Markers
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
<div id="loadDataPanel">
    <table id="loadDataTable" class="gratable">
      <thead>
	<tr><th>Load Data:</th></tr>
      </thead>
      <tbody>
	<tr><td>
	    Use this panel to load one of METAL's graphs right
	    from METAL's database (Options 1 and 2),<br />
	    or upload any data file
	    in a format recognized by HDX from your computer (Option
	    3).
	</td></tr>
	<tr>
	  <td>
	    <b>Option 1: </b>Search for a METAL collapsed graph by name.<br />Start typing in the box below for suggestions.
	    <div id="the-basics">
	      <input class="typeahead" type="text" id="searchBox" placeholder="Pick a Graph" onkeypress="returnInput()">
	      
	    </div>
	    Once you have selected a graph from the list of suggestions, press Enter to load it.
	  </td>
	</tr>
	<tr>
	  <td>
	    <div>
	      <?php hdx_load_file_entries(); ?>
	    </div>
	  </td>
	</tr>
	
	
	<tr><td>
	    <input type="button" value="Cancel" id="hideLoadDataPanel" onClick="hideLoadDataPanel();showTopControlPanel();" disabled>
	</td></tr>
      </tbody>
    </table>
</div>
<div id="algorithmSelectionPanel" style="display=none;">
  <table id="algorithmSelectionPanelTable" style="display=none;" class="gratable">
    <thead>
      <tr><th>Algorithm Visualization Selection and Options</th></tr>
    </thead>
    <tbody>
      <tr><td><p>To perform an algorithm visualization on the data
	  currently displayed, choose an algorithm and the options you
	  would like to use, then press "Done".<br />  To explore the
	  data on the map manually with no algorithm visualization,
	  choose the "No Algorithm Visualization" option.</p>
      </td></tr>
      <tr>
	<td>
	  Select an Algorithm to Visualize:
	  <select id="AlgorithmSelection" onchange="algorithmSelectionChanged()">
	    <!-- filled in with options by JS code in hdxAV.initOnLoad() -->
	  </select>
	  
	</td>
      </tr>
      <tr>
	<td id="algorithmOptions"></td>
	
      </tr>
      <tr>
	<td>
	  <input type="button" value="Done" id="algOptionsDone" onClick="algOptionsDonePressed(); createVariableSelector();">
	</td>
      </tr>
    </tbody>
  </table>
</div>
<div id="avStatusPanel">
  <table id="avStatusTable" class="gratable">
    <thead><tr><th>Algorithm Visualization Status</th></tr><thead>
      <tbody id="algorithmVars">
	<tr><td id="algorithmStatus"></td></tr>
	<tr><td id="pseudo">
	    <span id="pseudoText" style="display:none;">Select an algorithm to view pseudocode.</span>
	  </td>
	</tr>
      </tbody>
  </table>
</div>
  
</div>
<div id="datatable" draggable="false"  ondragstart="drag(event)">
</div>
    <table id="instructions">
        <thead>
            <tr ><th id="instructionsHeader">Using METAL's Highway Data Examiner (HDX)</th></tr>
        </thead>
        <tbody>
            <tr>
                <td class="tabs" id="instructionTab1">Maps/Graphs</td>
                <td class="tabs" id="instructionTab2">AV Control Panel</td>
                <td class="tabs" id="instructionTab3">AV Status Panel</td>
                <td class="tabs" id="instructionTab4">Code/Breakpoints</td>
                <td class="tabs" id="instructionTab5">Credits</td>
            </tr>
            <tr>
                <td id="instructionsBody">HDX's user interface is
                intended to be self-explanatory, but some of its
                features might not be obvious.  Select among the tabs
                above to learn how to get the most out
                of <a href="http://courses.teresco.org/metal/">METAL</a>
                and HDX.  This panel will close automatically after
                data is loaded into HDX using the panel to the left.<br />
		  <b>What's New?</b><br />  The 2019 Summer Scholars
		project at <a href="http://www.siena.edu">Siena
		College</a> added new algorithms (Kruskal's algorithm,
		a recursive depth-first traversal, a vertex degree
		search) new options and features in existing
		algorithms, support for conditional breakpoints, plus
		many user interface improvements and general bug
		fixes.  Enjoy!<td>
            <tr>
        </tbody>
    </table>
</body>
</html>
<?php tmdb_close();?>
