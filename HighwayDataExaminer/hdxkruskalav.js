//
// HDX Kruskal's Algorithm AV
//
// METAL Project
//
// Primary Author: Jim Teresco, Alissa Ronca
//

var hdxKruskalAV = {

    // entries for list of AVs
    value: "kruskal",
    name: "Kruskal's Algorithm",
    description: "Search for extreme values based on edge (connection) lengths and labels.",

    // pseudocode
    code:`
<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">
pq &larr; all edges</td></tr>
<tr id="whileLoopTop"><td>while not pq.isEmpty</td></tr>
<tr id="getPlaceFromLDV"><td>&nbsp;&nbsp;edge &larr; pq.remove()</td></tr>
<tr id="checkCycle"><td>&nbsp;&nbsp;if edge.createsCycle</td></tr>
<tr id="wasCycle"><td>&nbsp;&nbsp;&nbsp;&nbsp;discard edge</td></tr>
<tr"><td>&nbsp;&nbsp;else</td></tr>
<tr id="wasNotCycle"><td>&nbsp;&nbsp;&nbsp;&nbsp;tree.add(edge)</td></tr>
</table>
`,
    //&nbsp;&nbsp;
    // state variables for edge search
    // next to examine
    nextToCheck: 0,
    nextEdge: 0,
    discarded: 0,
    ldv: null,
    

    // comparator for priority queue
    comparator: function(a, b) {
        return a.val > b.val;
    },

    // function to determine the next "val" field for a new LDV entry
    // in this case, the edge length
    //
    // first parameter is the LDV entry being visited at this point,
    // second parameter is the destination vertex and edge traversed
    // to get from the vertex being visited
    valForLDVEntry: function() {
        return edgeLengthInMiles(graphEdges[nextEdge]);
    },
    
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
                for (var i = 0; i < graphEdges.length; i++) {
                    //edgeLengthInMiles(graphEdges[i])
                    //////working here
                    thisAV.ldv.add(new LDVEntry(graphEdges[i].v1, edgeLengthInMiles(graphEdges[i]), i));
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
            label: "whileLoopBottom",
            comment: "end of while loop iteration",
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
        
        
        this.ldv = new HDXLinear(hdxLinearTypes.PRIORITY_QUEUE,
                         "Priority Queue");
        if (this.hasOwnProperty("comparator")) {
            this.ldv.setComparator(this.comparator);
        }

        this.ldv.setDisplay(getAVControlEntryDocumentElement("discovered"),
                            displayLDVItem);
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
        addEntryToAVControlPanel("discovered", visualSettings.discovered);
        addEntryToAVControlPanel("discarded", visualSettings.discarded);
        addEntryToAVControlPanel("found", visualSettings.spanningTree);
        let foundEntry = '<span id="foundEntriesCount">0</span>' +
            ' <span id="foundTableLabel">Edges in Minimum Spanning Tree/Forest</span><br />' +
            '<table class="gratable"><thead>' +
            '<tr style="text-align:center"><th>Place</th>' + 
            '<th>Length</th>' + 
            '<th>Arrive From</th><th>Via</th></tr>' +
            '</thead><tbody id="foundEntries"></tbody></table>';
        updateAVControlEntry("found", foundEntry);
        this.foundTBody = document.getElementById("foundEntries");
        this.foundLabel = document.getElementById("foundTableLabel");

    },

    // clean up kruskal UI
    cleanupUI() {

    }
};
