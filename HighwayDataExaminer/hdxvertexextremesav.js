//
// HDX Vertex Extremes AV
//
// METAL Project
//
// Primary Author: Jim Teresco, contributions from many
//

// helper functions

// function to create the table entry for the leader for extreme points
function extremePointLeaderString(label, waypointNum) {
    
    return label + ':<br />#' + waypointNum +
        ' (' + waypoints[waypointNum].lat + ',' +
        waypoints[waypointNum].lon +
        ') ' + waypoints[waypointNum].label;
}

// function to create the table entry for the leader for
// label-based comparisons
function vertexLabelLeaderString(label, waypointNum) {
    
    return label + ':<br />#' + waypointNum +
        ' (length ' + waypoints[waypointNum].label.length + ') ' +
        waypoints[waypointNum].label;
}


var hdxVertexExtremesSearchAV = {

    // entries for list of AVs
    value: "vertex",
    name: "Vertex Extremes Search",
    description: "Search for extreme values based on vertex (waypoint) locations and labels.",

    // pseudocode
    code: `
<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">
north &larr; 0, 
south &larr; 0, 
east &larr; 0, 
west &larr; 0<br />
longest &larr; 0,
shortest &larr; 0,
firstalpha &larr; 0,
lastalpha &larr; 0
</td></tr>
<tr id="forLoopTop"><td>for (check &larr; 1 to |V|-1)</td></tr>
<tr id="checkNextCategory0"><td>
&nbsp;&nbsp;if (v[check].lat > v[north].lat)
</td></tr>
<tr id="updateNextCategory0"><td>
&nbsp;&nbsp;&nbsp;&nbsp;north &larr; check
</td></tr>
<tr id="checkNextCategory1"><td>
&nbsp;&nbsp;if (v[check].lat < v[south].lat)
</td></tr>
<tr id="updateNextCategory1"><td>
&nbsp;&nbsp;&nbsp;&nbsp;south &larr; check
</td></tr>
<tr id="checkNextCategory2"><td>
&nbsp;&nbsp;if (v[check].lng > v[east].lng)
</td></tr>
<tr id="updateNextCategory2"><td>
&nbsp;&nbsp;&nbsp;&nbsp;east &larr; check
</td></tr>
<tr id="checkNextCategory3"><td>
&nbsp;&nbsp;if (v[check].lng < v[west].lng)
</td></tr>
<tr id="updateNextCategory3"><td>
&nbsp;&nbsp;&nbsp;&nbsp;west &larr; check
</td></tr>
<tr id="checkNextCategory4"><td>
&nbsp;&nbsp;if (len(v[check].label) < len(v[shortest].label)))
</td></tr>
<tr id="updateNextCategory4"><td>
&nbsp;&nbsp;&nbsp;&nbsp;shortest &larr; check
</td></tr>
<tr id="checkNextCategory5"><td>
&nbsp;&nbsp;if (len(v[check].label) > len(v[longest].label)))
</td></tr>
<tr id="updateNextCategory5"><td>
&nbsp;&nbsp;&nbsp;&nbsp;longest &larr; check
</td></tr>
<tr id="checkNextCategory6"><td>
&nbsp;&nbsp;if (v[check].label < v[shortest].label)
</td></tr>
<tr id="updateNextCategory6"><td>
&nbsp;&nbsp;&nbsp;&nbsp;firstalpha &larr; check
</td></tr>
<tr id="checkNextCategory7"><td>
&nbsp;&nbsp;if (v[check].label > v[longest].label)
</td></tr>
<tr id="updateNextCategory7"><td>
&nbsp;&nbsp;&nbsp;&nbsp;lastalpha &larr; check
</td></tr>
</table>
`,
    
    // state variables for vertex extremes search
    nextToCheck: 0,
    discarded: 0,
    foundNewLeader: false,
    // list of polylines showing the directional bounds, updated by
    // directionalBoundingBox function below
    boundingPoly: [],

    // the categories for which we are finding our extremes,
    // with names for ids, labels to display, indicies of leader,
    // comparison function to determine if we have a new leader,
    // and visual settings for the display
    categories: [
        {
            name: "north",
            label: "North extreme",
            index: -1,

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) >
                        parseFloat(waypoints[this.index].lat));
            },

            leaderString: extremePointLeaderString,

            visualSettings: {
                color: "#8b0000",
                textColor: "white",
                scale: 6,
                name: "northLeader",
                value: 0
            }
        },

        {
            name: "south",
            label: "South extreme",
            index: -1,

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) <
                        parseFloat(waypoints[this.index].lat));
            },
            leaderString: extremePointLeaderString,
            
            visualSettings: {
                color: "#ee0000",
                textColor: "white",
                scale: 6,
                name: "southLeader",
                value: 0
            }
        },

        {
            name: "east",
            label: "East extreme",
            index: -1,

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) >
                        parseFloat(waypoints[this.index].lon));
            },
            leaderString: extremePointLeaderString,
            visualSettings: {
                color: "#000080",
                textColor: "white",
                scale: 6,
                name: "eastLeader",
                value: 0
            }
        },

        {
            name: "west",
            label: "West extreme",
            index: -1,

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) <
                        parseFloat(waypoints[this.index].lon));
            },
            leaderString: extremePointLeaderString,
            visualSettings: {
                color: "#551A8B",
                textColor: "white",
                scale: 6,
                name: "westLeader",
                value: 0
            }
        },

        {
            name: "shortest",
            label: "Shortest vertex label",
            index: -1,
            
            newLeader: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length <
                        waypoints[this.index].label.length);
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.shortLabelLeader
        },
        
        {
            name: "longest",
            label: "Longest vertex label",
            index: -1,
            
            newLeader: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length >
                        waypoints[this.index].label.length);
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.longLabelLeader
        },
	
        {
            name: "firstalpha",
            label: "First vertex label alphabetically",
            index: -1,
            
            newLeader: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) < 0;
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.firstLabelLeader
        },
	
        {
            name: "lastalpha",
            label: "Last vertex label alphabetically",
            index: -1,
            
            newLeader: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) > 0;
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.lastLabelLeader
        },
    ],

    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "initialize all leader indices to 0",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                for (var i = 0; i < thisAV.categories.length; i++) {
                    thisAV.categories[i].index = 0;
                }
                
                // highlight vertex 0 as leader in all categories and current
                thisAV.nextToCheck = 0;
                thisAV.discarded = 0;
        
                updateAVControlEntry("undiscovered", waypoints.length + "vertices not yet visited");
                updateAVControlEntry("visiting", "Visiting #0 (initial leader in each category: #0 " + waypoints[0].label);
                updateAVControlEntry("discarded", "0 vertices discarded");

                // show marker 0 as the leader in each category
                // on the map and in the table
                for (var i = 0; i < thisAV.categories.length; i++) {
                    updateMarkerAndTable(thisAV.categories[i].index,
                                         thisAV.categories[i].visualSettings, 
                                         40, false);
                    updateAVControlEntry(
                        thisAV.categories[i].name, 
                        thisAV.categories[i].leaderString(thisAV.categories[i].label,
                                                          thisAV.categories[i].index)
                    );
                }
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Initializing leaders to vertex 0";
            }
        },
        {
            label: "forLoopTop",
            comment: "for loop to iterate over remaining vertices",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                thisAV.nextToCheck++;
                if (thisAV.nextToCheck == waypoints.length) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    // highlight nextToCheck as current vertex
                    hdxAV.nextAction = "checkNextCategory";
                    thisAV.nextCategory = 0;
                    thisAV.foundNewLeader = false;
                    updateMarkerAndTable(thisAV.nextToCheck, visualSettings.visiting,
                                         30, false);
                    updateAVControlEntry("undiscovered", (waypoints.length - thisAV.nextToCheck) + " vertices not yet visited");
                    updateAVControlEntry("visiting", "Visiting: #" + thisAV.nextToCheck + " " + waypoints[thisAV.nextToCheck].label);
                }
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Top of main for loop over vertices, check=" + thisAV.nextToCheck;
            }
        },
        {
            label: "checkNextCategory",
            comment: "check if current vertex is a new category leader",
            code: function(thisAV) {
                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                //console.log("checkNextCategory for vertex " + thisAV.nextToCheck + " in category " + thisAV.nextCategory);
                if (thisAV.categories[thisAV.nextCategory].newLeader()) {
                    hdxAV.nextAction = "updateNextCategory";
                }
                else {
                    thisAV.nextCategory++;
                    if (thisAV.nextCategory == thisAV.categories.length) {
                        hdxAV.nextAction = "forLoopBottom";
                    }
                    else {
                        hdxAV.nextAction = "checkNextCategory";
                    }
                }
            },
            logMessage: function(thisAV) {
                if (hdxAV.nextAction == "updateNextCategory") {
                    return "Check for new " + thisAV.categories[thisAV.nextCategory].label + " leader";
                }
                else {
                    return "Check for new " + thisAV.categories[thisAV.nextCategory-1].label + " leader";
                }
            }
        },
        {
            label: "updateNextCategory",
            comment: "update new category leader",
            code: function(thisAV) {

                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                // remember that we have a new leader so this doesn't
                // get discarded at the end of the loop
                thisAV.foundNewLeader = true;

                // if the old leader is still leading in some other category,
                // color it as such, and if not, discard
                let oldLeader = thisAV.categories[thisAV.nextCategory].index;
                let stillALeader = false;
                for (var i = 0; i < thisAV.categories.length; i++) {
                    if (i == thisAV.nextCategory) continue;
                    if (thisAV.categories[i].index == oldLeader) {
                        stillALeader = true;
                        updateMarkerAndTable(oldLeader,
                                             thisAV.categories[i].visualSettings, 
                                             40, false);
                        break;  // could lead in others, but pick the first
                    }
                }
                if (!stillALeader) {
                    updateMarkerAndTable(oldLeader, visualSettings.discarded,
                                         20, true);
                    thisAV.discarded++;
                    updateAVControlEntry("discarded", thisAV.discarded + " vertices discarded");
                }
                    
                // update this category to indicate its new leader
                // but keep it shown as the vertex being visited on the
                // map and in the table until the end of the iteration
                thisAV.categories[thisAV.nextCategory].index = thisAV.nextToCheck;

                // update bounding box
                if (thisAV.showBB) {
                    thisAV.directionalBoundingBox();
                }
                
                updateAVControlEntry(
                    thisAV.categories[thisAV.nextCategory].name, 
                    thisAV.categories[thisAV.nextCategory].leaderString(
                        thisAV.categories[thisAV.nextCategory].label,
                        thisAV.categories[thisAV.nextCategory].index)
                );
                thisAV.nextCategory++;
                if (thisAV.nextCategory == thisAV.categories.length) {
                    hdxAV.nextAction = "forLoopBottom";
                }
                else {
                    hdxAV.nextAction = "checkNextCategory";
                }
            },
            logMessage: function(thisAV) {
                return thisAV.nextToCheck + " is new " + thisAV.categories[thisAV.nextCategory-1].label + " leader";
            }
        },
        {
            label: "forLoopBottom",
            comment: "end of for loop iteration",
            code: function(thisAV){

                // if this waypoint is the leader in any category, show it,
                // otherwise it gets discarded
                if (thisAV.foundNewLeader) {
                    for (var i = 0; i < thisAV.categories.length; i++) {
                        if (thisAV.nextToCheck == thisAV.categories[i].index) {
                            updateMarkerAndTable(thisAV.categories[i].index,
                                                 thisAV.categories[i].visualSettings, 
                                                 40, false);
                            break;  // just use the first we find
                        }
                    }
                }
                else {
                    updateMarkerAndTable(thisAV.nextToCheck, visualSettings.discarded,
                                         20, true);
                    thisAV.discarded++;
                    updateAVControlEntry("discarded", thisAV.discarded + " vertices discarded");

                }
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Update/discard on map and table";
            }
        },
        {
            label: "cleanup",
            comment: "cleanup and updates at the end of the visualization",
            code: function(thisAV) {
                hdxAV.algStat.innerHTML =
                    "Done! Visited " + markers.length + " waypoints.";
                updateAVControlEntry("undiscovered", "0 vertices not yet visited");
                updateAVControlEntry("visiting", "");
                hdxAV.nextAction = "DONE";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Cleanup and finalize visualization";
            }
        }
    ],

    // function to draw or update a bounding box of polylines
    // that encloses the directional extremes found so far
    directionalBoundingBox() {

        // note this assumes that the order of the categories
        // has north at 0, south at 1, east at 2, west at 3
        let n = waypoints[this.categories[0].index].lat;
        let s = waypoints[this.categories[1].index].lat;
        let e = waypoints[this.categories[2].index].lon;
        let w = waypoints[this.categories[3].index].lon;
        let nEnds = [[n,w],[n,e]];
        let sEnds = [[s,w],[s,e]];
        let eEnds = [[n,e],[s,e]];
        let wEnds = [[n,w],[s,w]];

        // create or update as appropriate
        if (this.boundingPoly.length == 0) {
            this.boundingPoly.push(
                L.polyline(nEnds, {
                    color: this.categories[0].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(sEnds, {
                    color: this.categories[1].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(eEnds, {
                    color: this.categories[2].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(wEnds, {
                    color: this.categories[3].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            for (var i = 0; i < 4; i++) {
                this.boundingPoly[i].addTo(map);
            }
        }
        else {
            this.boundingPoly[0].setLatLngs(nEnds);
            this.boundingPoly[1].setLatLngs(sEnds);
            this.boundingPoly[2].setLatLngs(eEnds);
            this.boundingPoly[3].setLatLngs(wEnds);
        }
    },
    
    // required prepToStart function
    // initialize a vertex-based search
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";

        // show waypoints, hide connections
        initWaypointsAndConnections(true, false,
                                    visualSettings.undiscovered);

        // honor bounding box checkbox
        this.showBB = document.getElementById("boundingBox").checked;
        
        // start the search by initializing with the value at pos 0
        updateMarkerAndTable(0, visualSettings.visiting, 40, false);
        
    },


    // set up UI for the start of this algorithm
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.algOptions.innerHTML = '<input id="boundingBox" type="checkbox" name="Show Bounding Box" checked />&nbsp;Show Extremes Bounding Box';

        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("discarded", visualSettings.discarded);
        for (var i = 0; i < this.categories.length; i++) {
            addEntryToAVControlPanel(this.categories[i].name,
                                     this.categories[i].visualSettings);
        }
    },
        
        
    // remove UI modifications made for vertex extremes search
    cleanupUI() {

        for (var i = 0; i < this.boundingPoly.length; i++) {
            this.boundingPoly[i].remove();
        }
        this.boundingPoly = [];
    }
};
