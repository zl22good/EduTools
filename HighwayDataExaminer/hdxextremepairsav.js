//
// HDX Brute-force extreme vertex pairs (closest/furthest) AV
//
// METAL Project
//
// Primary Author: Jim Teresco
//

/* closest/farthest pairs of vertices, just brute force for now */
var hdxExtremePairsAV = {

    // entries for list of AVs
    value: "closestpairs",
    name: "Vertex Closest/Farthest Pairs",
    description: "Search for the closest/farthest pair of vertices (waypoints).",
    
    // state variables for closest pairs search
    // loop indices
    v1: 0,
    v2: 0,

    // computed distance between v1 and v2
    d_this: 0,

    // leader info
    closest: [-1, -1],
    d_closest: Number.MAX_VALUE,
    farthest: [-1, -1],
    d_farthest: 0,

    // polylines for leaders and visiting
    lineClosest: null,
    lineFarthest: null,
    lineVisiting: null,

    // visual settings specific to closest/farthest pairs
    // NOTE: these match BFCH and should probably be given
    // common names and moved to hdxAV.visualSettings
    visualSettings: {
        v1: {
            color: "darkRed",
            textColor: "white",
            scale: 6,
            name: "v1",
            value: 0
        },
        v2: {
            color: "red",
            textColor: "white",
            scale: 6,
            name: "v2",
            value: 0
        },
        discardedv2: {
            color: "green",
            textColor: "black",
            scale: 2,
            name: "discardedv2",
            value: 0
        }
    },
    
    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "initialize closest pair variables",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                
                updateAVControlEntry("closeLeader", "no leader yet, d<sub>closest</sub> = &infin;");
                updateAVControlEntry("farLeader", "no leader yet, d<sub>farthest</sub> = 0");


                hdxAV.iterationDone = true;
                thisAV.v1 = -1;  // will increment to 0
                thisAV.d_closest = Number.MAX_VALUE;
                thisAV.d_farthest = 0;
                hdxAV.nextAction = "v1forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Initializing closest pair variables";
            }
        },
        {
            label: "v1forLoopTop",
            comment: "outer for loop to visit all pairs of vertices",
            code: function(thisAV) {
                highlightPseudocode(this.label, thisAV.visualSettings.v1);
                thisAV.v1++;
                if (thisAV.v1 == waypoints.length-1) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    hdxAV.nextAction = "v2forLoopTop";
                    thisAV.v2 = thisAV.v1;  // will increment to +1
                    updateMarkerAndTable(thisAV.v1, thisAV.visualSettings.v1,
                                         30, false);
                    updateAVControlEntry("v1visiting", "v<sub>1</sub>: #" + thisAV.v1 + " " + waypoints[thisAV.v1].label);
                    // all subsequent vertices will be looped over and should
                    // go back to undiscovered for now
                    for (var i = thisAV.v1+1; i < waypoints.length; i++) {
                        updateMarkerAndTable(i, visualSettings.undiscovered,
                                             20, false);
                    }
                }
            },
            logMessage: function(thisAV) {
                return "Next v<sub>1</sub>=" + thisAV.v1;
            }
        },
        {
            label: "v2forLoopTop",
            comment: "inner for loop to visit all pairs of vertices",
            code: function(thisAV) {
                highlightPseudocode(this.label, thisAV.visualSettings.v2);
                thisAV.v2++;
                if (thisAV.v2 == waypoints.length) {
                    hdxAV.nextAction = "v1forLoopBottom";
                }
                else {
                    hdxAV.nextAction = "computeDistance";
                    updateMarkerAndTable(thisAV.v2, thisAV.visualSettings.v2,
                                         30, false);
                    updateAVControlEntry("v2visiting", "v<sub>2</sub>: #" + thisAV.v2 + " " + waypoints[thisAV.v2].label);
                    updateAVControlEntry("checkingDistance", "Distance: ");
                    thisAV.drawLineVisiting();
                }
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                if (hdxAV.traceActions) {
                    return "Next v<sub>2</sub>=" + thisAV.v2;
                }
                return "Checking v<sub>1</sub>=" + thisAV.v1 +
                    "and v<sub>2</sub>=" + thisAV.v2;
            }
        },
        {
            label: "computeDistance",
            comment: "compute distance of current candidate pair",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);       
                thisAV.d_this = distanceInMiles(waypoints[thisAV.v1].lat,
                                                waypoints[thisAV.v1].lon,
                                                waypoints[thisAV.v2].lat,
                                                waypoints[thisAV.v2].lon);
                updateAVControlEntry("checkingDistance", "Distance: " + thisAV.d_this.toFixed(3));
                hdxAV.nextAction = "checkCloseLeader";

            },
            logMessage: function(thisAV) {
                return "Compute distance " + thisAV.d_this.toFixed(3) + " between v<sub>1</sub>=" + thisAV.v1 + " and v<sub>2</sub>=" + thisAV.v2;
            }
        },
        {
            label: "checkCloseLeader",
            comment: "check if current candidate pair is the new closest pair",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);       
                if (thisAV.d_this < thisAV.d_closest) {
                    hdxAV.nextAction = "newCloseLeader";
                }
                else {
                    hdxAV.nextAction = "checkFarLeader";
                }
            },
            logMessage: function(thisAV) {
                return "Check if [" + thisAV.v1 + "," + thisAV.v2 + "] is the new closest pair";
            }
        },
        {
            label: "newCloseLeader",
            comment: "update new closest pair",
            code: function(thisAV) {

                highlightPseudocode(this.label, visualSettings.leader);

                // if we had previous leaders, they're no longer leaders
                if (thisAV.closest[0] != -1) {
                    // old v1 leader is now either going to be leader again
                    // below or is now discarded, so mark as discarded
                    updateMarkerAndTable(thisAV.closest[0],
                                         visualSettings.discarded, 15, true);

                    // old v2 leader is either discarded if it's less than
                    // or equal to v1, unvisited on this inner iteration
                    // otherwise
                    if (thisAV.closest[1] <= thisAV.v1) {
                        updateMarkerAndTable(thisAV.closest[1],
                                             visualSettings.discarded, 15,
                                             true);
                    }
                    else {
                        updateMarkerAndTable(thisAV.closest[1],
                                             thisAV.visualSettings.discardedv2,
                                             15, false);
                    }
                }
                // remember the current pair as the closest
                thisAV.closest = [ thisAV.v1, thisAV.v2 ];
                thisAV.d_closest = thisAV.d_this;

                updateAVControlEntry("closeLeader", "Closest: [" + 
                                     thisAV.v1 + "," + thisAV.v2 + "], d<sub>closest</sub>: " + thisAV.d_closest.toFixed(3));
                updateMarkerAndTable(thisAV.v1, visualSettings.leader,
                                     40, false);
                updateMarkerAndTable(thisAV.v2, visualSettings.leader,
                                     40, false);
                thisAV.updateLineClosest();
                hdxAV.nextAction = "checkFarLeader";
            },
            logMessage: function(thisAV) {
                return "[" + thisAV.v1 + "," + thisAV.v2 + "] new closest pair with d<sub>closest</sub>=" + thisAV.d_closest.toFixed(3);
            }
        },
        {
            label: "checkFarLeader",
            comment: "check if current candidate pair is the new farthest pair",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);       
                if (thisAV.d_this > thisAV.d_farthest) {
                    hdxAV.nextAction = "newFarLeader";
                }
                else {
                    hdxAV.nextAction = "v2forLoopBottom";
                }
            },
            logMessage: function(thisAV) {
                return "Check if [" + thisAV.v1 + "," + thisAV.v2 + "] is the new farthest pair";
            }
        },
        {
            label: "newFarLeader",
            comment: "update new farthest pair",
            code: function(thisAV) {

                highlightPseudocode(this.label, visualSettings.leader2);

                // if we had previous leaders, they're no longer leaders
                if (thisAV.farthest[0] != -1) {
                    // old v1 leader is now either going to be leader again
                    // below or is now discarded, so mark as discarded
                    updateMarkerAndTable(thisAV.farthest[0],
                                         visualSettings.discarded, 15, true);

                    // old v2 leader is either discarded if it's less than
                    // or equal to v1, unvisited on this inner iteration
                    // otherwise
                    if (thisAV.farthest[1] <= thisAV.v1) {
                        updateMarkerAndTable(thisAV.farthest[1],
                                             visualSettings.discarded, 15,
                                             true);
                    }
                    else {
                        updateMarkerAndTable(thisAV.farthest[1],
                                             thisAV.visualSettings.discardedv2,
                                             15, false);
                    }
                }
                // remember the current pair as the farthest
                thisAV.farthest = [ thisAV.v1, thisAV.v2 ];
                thisAV.d_farthest = thisAV.d_this;

                updateAVControlEntry("farLeader", "Farthest: [" + 
                                     thisAV.v1 + "," + thisAV.v2 + "], d<sub>farthest</sub>: " + thisAV.d_farthest.toFixed(3));
                updateMarkerAndTable(thisAV.v1, visualSettings.leader2,
                                     40, false);
                updateMarkerAndTable(thisAV.v2, visualSettings.leader2,
                                     40, false);
                thisAV.updateLineFarthest();
                hdxAV.nextAction = "v2forLoopBottom";
            },
            logMessage: function(thisAV) {
                return "[" + thisAV.v1 + "," + thisAV.v2 + "] new farthest pair with d<sub>farthest</sub>=" + thisAV.d_farthest.toFixed(3);
            }
        },
        {
            label: "v2forLoopBottom",
            comment: "end of outer for loop iteration",
            code: function(thisAV){

                // undisplay the visiting segment
                thisAV.removeLineVisiting();
                
                // if the current v2 isn't part of the current closest pair
                // or current farthest pair, discard it
                if (thisAV.v2 == thisAV.closest[0] ||
                    thisAV.v2 == thisAV.closest[1]) {
                    updateMarkerAndTable(thisAV.v2,
                                         visualSettings.leader,
                                         40, false);
                }
                else if (thisAV.v2 == thisAV.farthest[0] ||
                         thisAV.v2 == thisAV.farthest[1]) {
                    updateMarkerAndTable(thisAV.v2,
                                         visualSettings.leader2,
                                         40, false);
                }
                else {
                    updateMarkerAndTable(thisAV.v2,
                                         thisAV.visualSettings.discardedv2,
                                         15, false);
                }
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "v2forLoopTop";
            },
            logMessage: function(thisAV) {
                // since this is an iterationDone action, we give a
                // different log message with more info
                if (hdxAV.traceActions) {
                    return "Done processing v<sub>2</sub>=" + thisAV.v2;
                }
                let leaderOrNot;
                // would be nice to differentiate between which leader
                // or indicate both
                if (thisAV.closest[0] == thisAV.v1 &&
                    thisAV.closest[1] == thisAV.v2 ||
                    thisAV.farthest[0] == thisAV.v1 &&
                    thisAV.farthest[1] == thisAV.v2) {
                    leaderOrNot = "New leader";
                }
                else {
                    leaderOrNot = "Discarding";
                }
                return leaderOrNot + ": distance " + thisAV.d_this.toFixed(3) + " between v<sub>1</sub>=" + thisAV.v1 + " and v<sub>2</sub>=" + thisAV.v2;
            }
        },
        {
            label: "v1forLoopBottom",
            comment: "end of outer for loop iteration",
            code: function(thisAV){

                // if the current v1 isn't part of the current closest pair
                // or current farthest pair, we discard it
                if (thisAV.v1 == thisAV.closest[0] ||
                    thisAV.v1 == thisAV.closest[1]) {
                    updateMarkerAndTable(thisAV.v1,
                                         visualSettings.leader,
                                         40, false);
                }
                else if (thisAV.v1 == thisAV.farthest[0] ||
                         thisAV.v1 == thisAV.farthest[1]) {
                    updateMarkerAndTable(thisAV.v1,
                                         visualSettings.leader2,
                                         40, false);
                }
                else {
                    updateMarkerAndTable(thisAV.v1,
                                         thisAV.visualSettings.discardedv2,
                                         15, false);
                }
                hdxAV.nextAction = "v1forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Done processing v<sub>1</sub>=" + thisAV.v1;
            }
        },
        {
            label: "cleanup",
            comment: "cleanup and updates at the end of the visualization",
            code: function(thisAV) {

                // if the last vertex is not one of the closest pair or one
                // of the closest pair, we need to discard it
                if (waypoints.length - 1 != thisAV.closest[0] &&
                    waypoints.length - 1 != thisAV.closest[1] &&
                    waypoints.length - 1 != thisAV.farthest[0] &&
                    waypoints.length - 1 != thisAV.farthest[1]) {
                    updateMarkerAndTable(waypoints.length - 1,
                                         visualSettings.discarded, 15, true);
                }
                
                updateAVControlEntry("v1visiting", "");
                updateAVControlEntry("v2visiting", "");
                updateAVControlEntry("checkingDistance", "");
                hdxAV.nextAction = "DONE";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Done!";
            }
        }
    ],

    // function to draw the polyline connecting the current
    // candidate pair of vertices
    drawLineVisiting() {

        let visitingLine = [];
        visitingLine[0] = [waypoints[this.v1].lat, waypoints[this.v1].lon];
        visitingLine[1] = [waypoints[this.v2].lat, waypoints[this.v2].lon];
        this.lineVisiting = L.polyline(visitingLine, {
            color: visualSettings.visiting.color,
            opacity: 0.6,
            weight: 4
        });
        this.lineVisiting.addTo(map);   
    },
    
    // function to remove the visiting polyline
    removeLineVisiting() {

        this.lineVisiting.remove();
    },

    // functions to draw or update the polylines connecting the
    // current closest and furthest pairs
    updateLineClosest() {

        let closestLine = [];
        closestLine[0] = [waypoints[this.closest[0]].lat, waypoints[this.closest[0]].lon];
        closestLine[1] = [waypoints[this.closest[1]].lat, waypoints[this.closest[1]].lon];

        if (this.lineClosest == null) {
            this.lineClosest = L.polyline(closestLine, {
                color: visualSettings.leader.color,
                opacity: 0.6,
                weight: 4
            });
            this.lineClosest.addTo(map);        
        }
        else {
            this.lineClosest.setLatLngs(closestLine);
        }
    },
    updateLineFarthest() {

        let farthestLine = [];
        farthestLine[0] = [waypoints[this.farthest[0]].lat, waypoints[this.farthest[0]].lon];
        farthestLine[1] = [waypoints[this.farthest[1]].lat, waypoints[this.farthest[1]].lon];

        if (this.lineFarthest == null) {
            this.lineFarthest = L.polyline(farthestLine, {
                color: visualSettings.leader2.color,
                opacity: 0.6,
                weight: 4
            });
            this.lineFarthest.addTo(map);       
        }
        else {
            this.lineFarthest.setLatLngs(farthestLine);
        }
    },

    // required prepToStart function
    // initialize a vertex closest/farthest pairs search
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";

        // show waypoints, hide connections
        initWaypointsAndConnections(true, false,
                                    visualSettings.undiscovered);
        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">closest &larr; null<br />d<sub>closest</sub> &larr; &infin;<br />farthest &larr; null<br />d<sub>farthest</sub> &larr; 0</td></tr>';
        this.code += pcEntry(0,'for (v<sub>1</sub> &larr; 0 to |V|-2)',"v1forLoopTop");
        this.code += pcEntry(1, 'for (v<sub>2</sub> &larr; v1+1 to |V|-1)', "v2forLoopTop");
        this.code += pcEntry(2, 'd &larr; dist(v<sub>1</sub>,v<sub>2</sub>)', "computeDistance");
        this.code += pcEntry(2, 'if (d < d<sub>closest</sub>)', "checkCloseLeader");
        this.code += pcEntry(3, 'closest &larr; [v<sub>1</sub>,v<sub>2</sub>]<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d<sub>closest</sub> &larr; d', "newCloseLeader");
        this.code += pcEntry(2, 'if (d > d<sub>farthest</sub>)', "checkFarLeader");
        this.code += pcEntry(3, 'farthest &larr; [v<sub>1</sub>,v<sub>2</sub>]<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d<sub>farthest</sub> &larr; d', "newFarLeader");
    },

    // set up UI entries for closest/farthest pairs
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        hdxAV.algOptions.innerHTML = '';

        addEntryToAVControlPanel("v1visiting", this.visualSettings.v1);
        addEntryToAVControlPanel("v2visiting", this.visualSettings.v2);
        addEntryToAVControlPanel("checkingDistance", visualSettings.visiting);
        addEntryToAVControlPanel("closeLeader", visualSettings.leader);
        addEntryToAVControlPanel("farLeader", visualSettings.leader2);
    },
        
        
    // remove UI modifications made for vertex closest/farthest pairs
    cleanupUI() {

        if (this.lineClosest != null) {
            this.lineClosest.remove();
        }
        if (this.lineFarthest != null) {
            this.lineFarthest.remove();
        }
    },
    
    idOfAction(action){
            return action.label;
    }
};
