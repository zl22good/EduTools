//
// HDX Edge extremes search AV
//
// METAL Project
//
// Primary Author: Jim Teresco, initial implementation by Razie Fathi
//

var hdxKruskalAV = {

    // entries for list of AVs
    value: "edge",
    name: "Edge Extremes Search",
    description: "Search for extreme values based on edge (connection) lengths and labels.",

    // pseudocode
    code:`
<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">
longestLabel &larr; 0<br />
shortestLabel &larr; 0<br />
longestEdge &larr; 0<br />
shortestEdge &larr; 0</td></tr>
<tr id="forLoopTop"><td>for (checkIndex &larr; 1 to |E|-1)</td></tr>
<tr id="checkNextCategory0"><td> 
&nbsp;&nbsp;if (len(e[checkIndex].label) > len(e[longestLabel].label)))
</td></tr>
<tr id="updateNextCategory0"><td>
&nbsp;&nbsp;&nbsp;&nbsp;longestLabel &larr; checkIndex
</td></tr>
<tr id="checkNextCategory1"><td>
&nbsp;&nbsp;if (len(e[checkIndex].label) < len(e[shortestLabel].label)))
</td></tr>
<tr id="updateNextCategory1"><td>       
&nbsp;&nbsp;&nbsp;&nbsp;shortestLabel &larr; checkIndex
</td></tr>
<tr id="checkNextCategory2"><td>
&nbsp;&nbsp;if (e[checkIndex].len > e[longestEdge].len)
</td></tr>
<tr id="updateNextCategory2"><td>
&nbsp;&nbsp;&nbsp;&nbsp;longestEdge &larr; checkIndex
</td></tr>
<tr id="checkNextCategory3"><td>
&nbsp;&nbsp;if (e[checkIndex].len < e[shortestEdge].len)
</td></tr>
<tr id="updateNextCategory3"><td>
&nbsp;&nbsp;&nbsp;&nbsp;shortestEdge &larr; checkIndex
</td></tr>
</table>
`,
    
    // state variables for edge search
    // next to examine
    nextToCheck: 0,
    discarded: 0,
    ldv: null,
    // required function to create an appropriate list of discovered vertices
    hdxKruskalAV.createLDV = function() {
    
        return new HDXLinear(hdxLinearTypes.PRIORITY_QUEUE,
                         "Priority Queue");
    };

    // comparator for priority queue
    hdxKruskalAV.comparator = function(a, b) {
        return a.val < b.val;
    };

    // function to determine the next "val" field for a new LDV entry
    // in this case, the edge length
    //
    // first parameter is the LDV entry being visited at this point,
    // second parameter is the destination vertex and edge traversed
    // to get from the vertex being visited
    hdxKruskalAV.valForLDVEntry = function() {
        return edgeLengthInMiles(graphEdges[nextToCheck]);
    }
    
    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "Sorting all edges by length",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                
                
                // highlight edge 0 as leader in all categories and current
                thisAV.nextToCheck = 0;
                thisAV.discarded = 0;
        
                updateAVControlEntry("undiscovered", (graphEdges.length - thisAV.nextToCheck) + " edges not yet visited");
                updateAVControlEntry("visiting", "Visiting: #" + thisAV.nextToCheck + " " + graphEdges[thisAV.nextToCheck].label);
                updateAVControlEntry("discarded", thisAV.discarded + " edges discarded");

                //add all edges to PQ sorted by length
                for (var i = 0; i < thisAV.graphEdges.length; i++) {
                    edgeLengthInMiles(graphEdges[i])
                    //////working here
                    thisAV.ldv.add(new LDVEntry(thisAV.startingVertex, 0, -1));
                }
                
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "whileLoopTop";
            },
            logMessage: function(thisAV) {
                return "Sorting all edges by length";
            }
        },
        {
            label: "whileLoopTop",
            comment: "while loop to iterate over remaining edges",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                thisAV.nextToCheck++;
                if (thisAV.nextToCheck == graphEdges.length) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    // highlight nextToCheck as current edge
                    hdxAV.nextAction = "checkNextCategory";
                    thisAV.nextCategory = 0;
                    thisAV.foundNewLeader = false;
                    updateAVControlEntry("undiscovered", (graphEdges.length - thisAV.nextToCheck) + " edges not yet visited");
                        updateAVControlEntry("visiting", "Visiting: #" + thisAV.nextToCheck + " " + graphEdges[thisAV.nextToCheck].label);
                    updatePolylineAndTable(thisAV.nextToCheck,
                                           visualSettings.visiting,
                                           false);
                }
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Top of main for loop over edges, check=" + thisAV.nextToCheck;
            }
        },
        {
            label: "checkNextCategory",
            comment: "check if current edge is a new category leader",
            code: function(thisAV) {
                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
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
                    return "New " + thisAV.categories[thisAV.nextCategory].label + " leader";
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
                        updatePolylineAndTable(oldLeader,
                                             thisAV.categories[i].visualSettings, 
                                              false);
                        break;  // could lead in others, but pick the first
                    }
                }
                if (!stillALeader) {
                    updatePolylineAndTable(oldLeader, visualSettings.discarded,
                                 true);
                    thisAV.discarded++;
                    updateAVControlEntry("discarded", thisAV.discarded + " vertices discarded");
                }
                    
                // update this category to indicate its new leader
                // but keep it shown as the edge being visited on the
                // map and in the table until the end of the iteration
                thisAV.categories[thisAV.nextCategory].index = thisAV.nextToCheck;
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

                // if this edge is the leader in any category, show it,
                // otherwise it gets discarded
                if (thisAV.foundNewLeader) {
                    for (var i = 0; i < thisAV.categories.length; i++) {
                        if (thisAV.nextToCheck == thisAV.categories[i].index) {
                            updatePolylineAndTable(thisAV.categories[i].index,
                                                 thisAV.categories[i].visualSettings, 
                                                 false);
                            break;  // just use the first we find
                        }
                    }
                }
                else {
                    updatePolylineAndTable(thisAV.nextToCheck, visualSettings.discarded,
                         true);
                    thisAV.discarded++;
                        updateAVControlEntry("discarded", thisAV.discarded + " edges discarded");

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
                    "Done! Visited " + graphEdges.length + " edges.";
                updateAVControlEntry("undiscovered", "0 edges not yet visited");
                updateAVControlEntry("visiting", "");
                hdxAV.nextAction = "DONE";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Cleanup and finalize visualization";
            }
                
        }
    ],
        
    // required prepToStart function
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";

        // hide waypoints, show connections
        initWaypointsAndConnections(false, true,
                                    visualSettings.undiscovered);
    },
        
    // set up UI for the start of edge search
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        hdxAV.algOptions.innerHTML = '';
        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("discarded", visualSettings.discarded);
        for (var i = 0; i < this.categories.length; i++) {
            addEntryToAVControlPanel(this.categories[i].name,
                                     this.categories[i].visualSettings);
        }

    },

    // clean up edge search UI
    cleanupUI() {

    }
};
