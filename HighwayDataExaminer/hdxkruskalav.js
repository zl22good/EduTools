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

    
    // state variables for edge search
    discarded: 0,
    ldv: null,
    // last place to come out of the LDV, currently "visiting"
    visiting: null,

    // when finding all, track the lists of vertices and edges that are
    // forming the current spanning tree
    componentVList: [],
    componentEList: [],
    componentVAdj: [],

    // some additional stats to maintain and display
    numVSpanningTree: 0,
    numESpanningTree: 0,
    numVUndiscovered: 0,
    numEUndiscovered: 0,
    numEDiscardedOnRemoval: 0,
    componentNum: 0,

   

    // comparator for priority queue
    comparator: function(a, b) {
        return a.val < b.val;
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
    
    isCycle: function(edgeNum) {
        let vertex1 = graphEdges[edgeNum].v1;
        let vertex2 = graphEdges[edgeNum].v2;
        if (!this.componentVList.includes(vertex1) || !this.componentVList.includes(vertex2)) {
            return false;   
        }
        
        //depth first search for path from vertex1 to vertex2 
        let treeV1Index = this.componentVList.indexOf(vertex1);
        let treeV2Index = this.componentVList.indexOf(vertex2);
        let stack = [];
        let discoveredV = [];
        stack.push(treeV1Index);
        
        while (stack.length != 0) {
            let currentV = stack.pop();
            //let componentIndex = 
            //we have found a path to v2 which means it is a cycle
            if (currentV == treeV2Index) {
                console.log("vertex: " + waypoints[currentV].label)
                return true;
            }
            
            //if v hasn't been discovered:
            if (!discoveredV.includes(currentV)) {
                discoveredV.push(currentV);
                let componentVIndex = this.componentVList.indexOf(currentV);
                console.log(componentVIndex + " / "+ this.componentVList.length + " " + this.componentVAdj);
                for (let i = 0; i < this.componentVAdj[componentVIndex].length; i++) {
                    stack.push(this.componentVAdj[componentVIndex][i]);
                }
            }
        }
        
        
        return false;
    },
    
    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "Sorting all edges by length",
            code: function(thisAV) {
                
                highlightPseudocode(this.label, visualSettings.visiting);
                
                
                // highlight edge 0 as leader in all categories and current
                thisAV.discarded = 0;
        
                //updateAVControlEntry("undiscovered", (thisAV.ldv.length) + " edges not yet visited");
                //updateAVControlEntry("visiting", "Visiting: " + graphEdges[thisAV.visiting.connection].label);
                //updateAVControlEntry("discarded", thisAV.discarded + " edges discarded");

                
                    
                //add all edges to PQ sorted by length
                for (let i = 0; i < graphEdges.length; i++) {
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
                // if empty, go to LDVEmpty to report failure,
                // otherwise carry on
                if (thisAV.ldv.isEmpty()) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    hdxAV.nextAction = "getPlaceFromLDV";
                }
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Check if any edges remain in Priority Queue";
            }
        },
        {
            label: "getPlaceFromLDV",
            comment: "Get a place from the LDV",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                // get next place from the LDV
                thisAV.visiting = thisAV.ldv.remove();
                updateAVControlEntry("visiting", "Visiting " +
                    graphEdges[thisAV.visiting.connection].label);
                // show on map as visiting color
                updateMarkerAndTable(thisAV.visiting.vIndex,
                    visualSettings.visiting,
                    10, false);
                if (thisAV.visiting.connection != -1) {
                    updatePolylineAndTable(thisAV.visiting.connection,
                        visualSettings.visiting,
                        false);
                }

                hdxAV.nextAction = "checkCycle";
            },
            logMessage: function(thisAV) {
                return "Removed edge #" +
                    thisAV.visiting.connection + " from Priority Queue";
            }
        },
        {
            label: "checkCycle",
            comment: "Check if the edge being visited creates a cycle",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                // need to make method to determine if adding an edge would create a cycle
                //if MST contains both vertices do a dfs to check for cycle between them
                let cycle = thisAV.isCycle(thisAV.visiting.connection);
                if (cycle) {
                    hdxAV.nextAction = "isCycle";
                }
                else {
                    hdxAV.nextAction = "isNotCycle";
                }
            },
            logMessage: function(thisAV) {
                return "Checking if edge #" + thisAV.visiting.connection +
                    " creates a cycle";
            }
        },
        {
            label: "isCycle",
            comment: "Edge being visited creates a cycle, so discard",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.discarded);

                thisAV.numEDiscardedOnRemoval++;

               // the edge that got us here is not
                // part of the ultimate spanning tree, so it should be the
                // "discardedOnRemoval" color
                if (thisAV.visiting.connection != -1) {
                    updatePolylineAndTable(thisAV.visiting.connection,
                        visualSettings.discarded,
                        false);

                    //updateMarkerAndTable(thisAV.visiting.vIndex,
                      //  visualSettings.discarded,
                        //5, false);
                }

                thisAV.updateControlEntries();

                hdxAV.nextAction = "whileLoopTop";

            },
            logMessage: function(thisAV) {
                return "Discarding " +
                    graphEdges[thisAV.visiting.connection].label + " on removal";
            }
        },

        {
            label: "isNotCycle",
            comment: "Found new edge that doesn't create cycle, so add it to tree",
            code: function(thisAV) {
                highlightPseudocode(this.label,
                    visualSettings.spanningTree);

                // was just discovered, now part of spanning tree
                let vertex1 = graphEdges[thisAV.visiting.connection].v1;
                let vertex2 = graphEdges[thisAV.visiting.connection].v2;

                if (!thisAV.componentVList.includes(vertex1)) {
                    thisAV.componentVList.push(vertex1);
                    thisAV.componentVAdj.push(new Array());
                    thisAV.numVSpanningTree++;
                    updateMarkerAndTable(vertex1, visualSettings.spanningTree, 10, false);
                }
                if (!thisAV.componentVList.includes(vertex2)) {
                    thisAV.componentVList.push(vertex2);
                    thisAV.componentVAdj.push(new Array());
                    thisAV.numVSpanningTree++;
                    updateMarkerAndTable(vertex2, visualSettings.spanningTree, 10, false);
                }

                // we used the edge to get here, so let's mark it as such
                if (thisAV.visiting.connection != -1) {
                    thisAV.numESpanningTree++;
                    thisAV.componentEList.push(thisAV.visiting.connection);
                    updatePolylineAndTable(thisAV.visiting.connection,
                        visualSettings.spanningTree, false);
                    
                    //add edge to spanning tree vertex's adjacency list
                    for (let i = 0; i < thisAV.componentVList.length; i++) {
                        let vertex = thisAV.componentVList[i];
                        if (vertex == vertex1){
                            thisAV.componentVAdj[i].push(vertex2);
                            //console.log(vertex + " has edge: " + thisAV.visiting.connection);
                        }
                        if (vertex == vertex2){
                            thisAV.componentVAdj[i].push(vertex1);
                        }
                    }
                }

                //add entry to spanning tree table
                thisAV.addLDVEntryToFoundTable(thisAV.visiting,
                    thisAV.ldv.maxLabelLength,
                    thisAV.ldv.valPrecision,
                    thisAV.numESpanningTree);


                thisAV.updateControlEntries();
                hdxAV.nextAction = "whileLoopTop";
            },
            logMessage: function(thisAV) {
                return "Adding edge #" + thisAV.visiting.connection + " to tree";
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

    // format an LDV entry for addition to the found table
    addLDVEntryToFoundTable(item, maxLabelLength, precision, count) {
        let newtr = document.createElement("tr");
        let edgeLabel;
        let fullEdgeLabel;
        let endpoints;
        
        fullEdgeLabel = item.connection + ': ' + graphEdges[item.connection].label;
        edgeLabel = shortLabel(fullEdgeLabel, 10);
        endpoints = graphEdges[item.connection].v1 + ':&nbsp;' + 
            (waypoints[graphEdges[item.connection].v1].label).substring(0,5) +
            ' &harr; ' + graphEdges[item.connection].v2 + ':&nbsp;'
            + (waypoints[graphEdges[item.connection].v2].label).substring(0,5);
        //graphEdges[item.connection].v2.label

        // mouseover title
        //newtr.setAttribute("custom-title",
        //    "Path to #" + item.vIndex + ":" +
         //   waypoints[item.vIndex].label + ", " +
         //   this.distEntry + ": " +
         //   item.val.toFixed(precision) + ", " + fullFromLabel +
        //  ", via " + fullEdgeLabel);

        // id to show shortest paths later
        newtr.setAttribute("id", "foundPaths" + count);

        // actual table row to display
        newtr.innerHTML =
            '<td>' + item.val.toFixed(precision) + '</td>' +
            '<td>' + edgeLabel + '</td>' +
            '<td style ="word-break:break-all;">' + endpoints + '</td>' ;

        this.foundTBody.appendChild(newtr);
        document.getElementById("foundEntriesCount").innerHTML =
            this.numESpanningTree;
    },

    updateControlEntries() {
        updateAVControlEntry("undiscovered", "Undiscovered: " +
                             this.numVUndiscovered + " V, " +
                             this.numEUndiscovered + " E");
        let label = "Spanning Forest: ";
        
        
        updateAVControlEntry("currentSpanningTree", label +
                             this.numVSpanningTree + " V, " +
                             this.numESpanningTree + " E");
        updateAVControlEntry("discardedOnRemoval", "Discarded on removal: " +
                             this.numEDiscardedOnRemoval + " E");

    },

    // required prepToStart function
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";
        
        // hide waypoints, show connections
        initWaypointsAndConnections(false, true,
                                    visualSettings.undiscovered);
        
        this.discarded= 0;
        this.ldv= null;
        // last place to come out of the LDV, currently "visiting"
        this.visiting= null;

        // when finding all, track the lists of vertices and edges that are
        // forming the current spanning tree
        this.componentVList= [];
        this.componentEList= [];
        this.componentVAdj= [];

        // some additional stats to maintain and display
        this.numVSpanningTree= 0;
        this.numESpanningTree= 0;
        this.numVUndiscovered= 0;
        this.numEUndiscovered= 0;
        this.numEDiscardedOnRemoval= 0;
        this.componentNum= 0;
                
        this.ldv = new HDXLinear(hdxLinearTypes.PRIORITY_QUEUE,
                         "Priority Queue");
        if (this.hasOwnProperty("comparator")) {
            this.ldv.setComparator(this.comparator);
        }

        this.ldv.setDisplay(getAVControlEntryDocumentElement("discovered"),
                            displayLDVItem, 6);
        
        // pseudocode
        this.code ='<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">';
        this.code += 'pq &larr; all edges</td></tr>';
        this.code += pcEntry(0, "while not pq.isEmpty", "whileLoopTop");
        this.code += pcEntry(1, "edge &larr; pq.remove()", "getPlaceFromLDV");
        this.code += pcEntry(1, "if edge.createsCycle", "checkCycle");
        this.code += pcEntry(2, "discard edge", "isCycle");
        this.code += pcEntry(1, "else", "");
        this.code += pcEntry(2, "tree.add(edge)", "isNotCycle");
        this.code += "</table>";
    },
        
    // set up UI for the start of edge search
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        hdxAV.algOptions.innerHTML = '';
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("discovered", visualSettings.discovered);
        addEntryToAVControlPanel("currentSpanningTree", visualSettings.spanningTree);
        addEntryToAVControlPanel("discardedOnRemoval", visualSettings.discarded);
        addEntryToAVControlPanel("found", visualSettings.spanningTree);
        let foundEntry = '<span id="foundEntriesCount">0</span>' +
            ' <span id="foundTableLabel">Edges in Minimum Spanning Tree/Forest</span><br />' +
            '<table class="gratable"><thead>' +
            '<tr style="text-align:center"><th>Length</th>' +
            '<th>Edge</th>' +
            '<th>Endpoints</th></tr>' +
            '</thead><tbody id="foundEntries"></tbody></table>';
        updateAVControlEntry("found", foundEntry);
        this.foundTBody = document.getElementById("foundEntries");
        this.foundLabel = document.getElementById("foundTableLabel");

    },

    // clean up kruskal UI
    cleanupUI() {

    }
};
