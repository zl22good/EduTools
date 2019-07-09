//
// HDX Callback Functions and various hide/show methods used by them
//
// METAL Project
//
// Primary Author: Jim Teresco
//

// speedChanger dropdown callback
function speedChanged() {

    var speedChanger = document.getElementById("speedChanger");
    let temp = speedChanger.options[speedChanger.selectedIndex];
    hdxAV.delay = temp.value;
    hdxAV.speedName = temp.innerHTML;
}


// special HDX version of the label click event handler that is
// called by the general TM addMarker, as it is registered
// by the registerMarkerClickListener call in updateMap
function labelClickHDX(i) {

    // handle vertex control selection
    hdxVertexSelector.select(i);

    // standard map center/infowindow display
    map.panTo([waypoints[i].lat, waypoints[i].lon]);

    markers[i].openPopup();
}



// get the selected algorithm from the AlgorithmSelection menu
// (factored out here to avoid repeated code)
function getSelectedAlgorithm() {
    var menuSelection = document.getElementById("AlgorithmSelection");
    var selectionIndex = menuSelection.selectedIndex;
    return menuSelection.options[selectionIndex].value;
}

// pseudocode display event handler
// function both sets the traceActions variable and shows/hides
// the actual code on the display as appropriate
function showHidePseudocode() {

    hdxAV.traceActions = document.getElementById("pseudoCheckbox").checked;
    document.getElementById("pseudoText").style.display =
        (hdxAV.traceActions ? "" : "none");
}

// generic event handler for start/pause/resume button
function startPausePressed() {
    
    switch (hdxAV.status) {

    case hdxStates.AV_SELECTED:
        // if we have selected but not yet started an algorithm,
        // this is a start button
        hdxAV.setStatus(hdxStates.AV_RUNNING);
        if (hdxAV.delay == -1) {
            hdxAV.startPause.innerHTML = "Next Step";
        }
        else {
            hdxAV.startPause.innerHTML = "Pause";
        }
        hdxAV.currentAV.prepToStart();
        // set pseudocode
        document.getElementById("pseudoText").innerHTML = hdxAV.currentAV.code;

        // reset all execution counts
        hdxAV.execCounts = [];
        hdxAV.maxExecCount = 0;

        showHidePseudocode();

        // get the simulation going, always start with the "START"
        // action, then do it
        hdxAV.nextAction = "START";
        hdxAV.nextStep(hdxAV.currentAV);
        addStop();
        break;
        
    case hdxStates.AV_RUNNING:
        // if we are in a running algorithm, this is a pause button
        // the running algorithm will pause when its next
        // timer event fires    
        hdxAV.setStatus(hdxStates.AV_PAUSED);
        if (hdxAV.delay == -1){
            hdxAV.startPause.innerHTML = "Next Step";
        }
        else {
            hdxAV.startPause.innerHTML = "Resume";
        }
        break;
        
    case hdxStates.AV_PAUSED:

        // depending on whether we're stepping or not, button
        // will need different labels
        if (hdxAV.delay == -1) {
            hdxAV.startPause.innerHTML = "Next Step";
        }
        else {
            hdxAV.startPause.innerHTML = "Pause";
        }

        // in all cases, we set status to running and perform the next step
        hdxAV.setStatus(hdxStates.AV_RUNNING);
        hdxAV.nextStep(hdxAV.currentAV);
        break;

    default:
        alert("startPausePressed, unexpected status=" + hdxAV.status);
    }
}

// Event handler for state change on the algorithm selection select control
function algorithmSelectionChanged() {

    // cleanup anything from the previous algorithm
    if (hdxAV.currentAV != null) {
        cleanupAVControlPanel();
        hdxAV.currentAV.cleanupUI();
    }
    
    let value = getSelectedAlgorithm();

    // set the current algorithm
    for (var i = 1; i < hdxAV.avList.length; i++) {
        if (value == hdxAV.avList[i].value) {
            hdxAV.currentAV = hdxAV.avList[i];
            break;
        }
    }

    document.getElementById("currentAlgorithm").innerHTML =
        hdxAV.currentAV.name;

    // call its function to set up its status and options
    hdxAV.currentAV.setupUI();
}

// event handler for the "Done" button on the algorithm options panel
function algOptionsDonePressed() {

    // TODO: make sure no additional validation is needed to make sure
    // good options are chosen before we allow this to be dismissed.

    if (hdxAV.currentAV == null) {
        hdxAV.currentAV = hdxNoAV;
    }
    
    // set status depending on whether an AV was selected
    if (hdxAV.currentAV.value == hdxNoAV.value) {
        hdxAV.setStatus(hdxStates.GRAPH_LOADED);
    }
    else {
        hdxAV.setStatus(hdxStates.AV_SELECTED);
        showAVStatusPanel();
    }

    hideAlgorithmSelectionPanel();
    showTopControlPanel();
}

// event handler for "Reset AV" button press
function resetPressed() {

    // go back to the "graph loaded" status
    hdxAV.setStatus(hdxStates.GRAPH_LOADED);

    hdxAV.startPause.innerHTML = "Start";

    // show waypoints, show connections
    initWaypointsAndConnections(true, true,
                                visualSettings.undiscovered);

    hideTopControlPanel();
    cleanupAVControlPanel();
    algorithmSelectionChanged();
    hideAVStatusPanel();
    showAlgorithmSelectionPanel();
    deleteVariableSelector();
}

// event handler for "Load Data Options" button
function loadDataOptionsPressed() {

    switch (hdxAV.status) {

    case hdxStates.AV_RUNNING:
        // if there's an AV running, we need to pause it
        hdxAV.setStatus(hdxStates.AV_PAUSED);
        hdxAV.startPause.innerHTML = "Start";
        // break intentionally omitted

    case hdxStates.AV_PAUSED:
    case hdxStates.AV_COMPLETE:
    case hdxStates.GRAPH_LOADED:
        // show waypoints, show connections
        initWaypointsAndConnections(true, true,
                                    visualSettings.undiscovered);
        
        cleanupAVControlPanel();
        algorithmSelectionChanged();
        hideAVStatusPanel();
        break;
    }

    // in all cases, we hide the top panel, show the load panel
    hideTopControlPanel();
    showLoadDataPanel();
    deleteVariableSelector();
}

// event handler for "Show Data Tables" checkbox
function showHideDatatables() {

    let checked = document.getElementById("datatablesCheckbox").checked;
    let datatable = document.getElementById("datatable");
    if (checked) {
        datatable.style.display = "";
    }
    else {
        datatable.style.display = "none";
    }
}

// Functions to show or hide panels that are displayed only
// in certain modes of HDX operation

// top control panel (algorithm controls, reset/load buttons)
function showTopControlPanel() {

    let av1 = document.getElementById("topControlPanelAV1");
    let av2 = document.getElementById("topControlPanelAV2");
    let av3 = document.getElementById("topControlPanelAV3");
    let av4 = document.getElementById("topControlPanelAV4");
    let av4button = document.getElementById("resetButton");
    let showMarkers = document.getElementById("topControlPanelShowMarkers");
    
    // show only the relevant components given the current
    // state of HDX
    switch (hdxAV.status) {
    case hdxStates.WPT_LOADED:
    case hdxStates.NMP_LOADED:
    case hdxStates.WPL_LOADED:
    case hdxStates.PTH_LOADED:
        // undisplay all AV-related controls
        av1.style.display = "none";
        av2.style.display = "none";
        av3.style.display = "none";
        av4.style.display = "none";
        showMarkers.style.display = "";
        break;

    case hdxStates.GRAPH_LOADED:
        // only display the "Reset AV" button (but relabel it
        // as "Select AV" since this means no AV is currently
        // selected
        av1.style.display = "none";
        av2.style.display = "none";
        av3.style.display = "none";
        av4.style.display = "";
        av4button.value = "Select AV";
        showMarkers.style.display = "";
        break;

    default:
        // An AV is selected and possibly running, paused, or complete
        // so show all AV-related controls and make sure the "Reset AV"
        // button is labeled that way, and reset default values
        av1.style.display = "";
        av2.style.display = "";
        av3.style.display = "";
        av4.style.display = "";
        av4button.value = "Reset AV";
        showMarkers.style.display = "none";
        document.getElementById("speedChanger").selectedIndex = 5;
        speedChanged();
        document.getElementById("pseudoCheckbox").checked = true;
        document.getElementById("datatablesCheckbox").checked = true;
        break;
    }
    
    document.getElementById("topControlPanel").style.display="table";
}

function hideTopControlPanel() {
    document.getElementById("topControlPanel").style.display="none";
}

// the load data panel, where graphs and other data are specified
// to be loaded into HDX
function showLoadDataPanel() {
    document.getElementById("loadDataPanel").style.display = "table";
    document.getElementById("hideLoadDataPanel").disabled=false;
}

function hideLoadDataPanel() {
    document.getElementById("loadDataPanel").style.display ="none";
}

// the algorithm selection panel, where an algorithm is selected
// and its parameters are specified
function hideAlgorithmSelectionPanel() {
    document.getElementById("algorithmSelectionPanel").style.display="none";
}

function showAlgorithmSelectionPanel() {
    document.getElementById("algorithmSelectionPanel").style.display="table";
}

// the algorithm status panel, including messages, code, data, and
// other information showing the status of an AV
function showAVStatusPanel() {
    document.getElementById("avStatusPanel").style.display="block";
}

function hideAVStatusPanel() {
    document.getElementById("avStatusPanel").style.display="none";
}
