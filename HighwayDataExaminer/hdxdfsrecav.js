//
// HDX Kruskal's Algorithm AV
//
// METAL Project
//
// Primary Author: Jim Teresco, Alissa Ronca
//

var hdxDFSRecAV = {

    // entries for list of AVs
    value: "dfs-recursive",
    name: "Recursive Depth First Search",
    description: "Recursive Depth-First search.",

    
    // state variables for edge search
    discarded: 0,
    stack: null,
    callStack: null,
    // last place to come out of the call stack, currently "visiting"
    visiting: 0,
    connection: 0,
    prevVisiting: 0,
    prevConnection: 0,
    nextToCheck: 0,
    nextVertex: 0,
    

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
    totalTreeCost: 0,
    

    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "Initializing variables",
            code: function(thisAV) {
                
                highlightPseudocode(this.label, visualSettings.visiting);
                
                thisAV.stack = [];
                // highlight edge 0 as leader in all categories and current
                thisAV.discarded = 0;
                thisAV.nextToCheck = 0;
                thisAV.nextVertex = -1;
                thisAV.connection = -1;
        
                thisAV.updateControlEntries();
              
                for(let j = 0; j < waypoints.length; j++) {
                    waypoints[j].hops = -1;
                    waypoints[j].prevVertex = -1;
                }
                
                // vertex index to start the traversal
                thisAV.startingVertex =
                    document.getElementById("startPoint").value;
                
                thisAV.visiting = thisAV.startingVertex;
                //thisAV.stack.push(visiting);
                
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "recursiveCallTop";
            },
            logMessage: function(thisAV) {
                return "Initializing all variables";
            }
        },
        {
            label: "recursiveCallTop",
            comment: "recursive call to dfs",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                thisAV.callStack.add(thisAV.visiting);
                thisAV.addCallToStackTable(thisAV.visiting,
                    thisAV.callStack.maxLabelLength,
                    thisAV.callStack.valPrecision,
                    thisAV.numESpanningTree);

                updateAVControlEntry("visiting", "Visiting vertex " + thisAV.visiting
                    + ": " + waypoints[thisAV.visiting].label);

                updateMarkerAndTable(thisAV.visiting,
                    visualSettings.visiting, 10, false);
                if (thisAV.connection != -1) {
                    updatePolylineAndTable(thisAV.connection, 
                        visualSettings.visiting, false);
                }
                //recolor what was previously being visited as discovered
                if (thisAV.stack.length > 0) {
                    let prevRoute = thisAV.stack[thisAV.stack.length - 1];
                    updateMarkerAndTable(waypoints[thisAV.visiting].prevVertex,
                        visualSettings.discovered, 10, false);
                    if (prevRoute[1] != -1) {
                        updatePolylineAndTable(prevRoute[1], 
                            visualSettings.discovered, false);
                        updateMarkerAndTable(thisAV.startingVertex,
                    visualSettings.startVertex, 4, false);
                    }
                }
                    
                hdxAV.nextAction = "setHops";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "recursive call to dfs";
            }
        },
        {
            label: "setHops",
            comment: "set vertex's number of hops to mark as discovered",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                //if its the first point set hops to 0
                if (waypoints[thisAV.visiting].prevVertex == -1) {
                    waypoints[thisAV.visiting].hops = 0;
                }
                //set number of hops to its parent vertex's number of hops + 1
                else {
                    waypoints[thisAV.visiting].hops =
                        waypoints[waypoints[thisAV.visiting].prevVertex].hops + 1;
                }
                hdxAV.nextAction = "forLoopTop";
                thisAV.nextToCheck = 0;
                
            },
            logMessage: function(thisAV) {
                return "set vertex's number of hops to mark as discovered";
            }
        },
        {
            label: "forLoopTop",
            comment: "Loop through each vertex in V's adjacency list",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                if (thisAV.nextToCheck >= waypoints[thisAV.visiting].edgeList.length) {
                    // || thisAV.nextToCheck == null) {
                    //reset visiting from prevVertex, nexttocheck from stack,
                    //pop from stack, return
                    if (thisAV.stack.length != 0) {
                        let route = thisAV.stack.pop();
                        thisAV.nextToCheck = route[0];
                        thisAV.connection = route[1];
                        thisAV.visiting = waypoints[thisAV.visiting].prevVertex;
                    }
                    hdxAV.nextAction = "return";
                }
                else {

                    //get the other vertex from the adjacency list
                    thisAV.connection = waypoints[thisAV.visiting].edgeList[thisAV.nextToCheck].edgeListIndex;
                    //updatePolylineAndTable(thisAV.connection, visualSettings.spanningTree, false);
                    thisAV.nextVertex = -1;
                    if (graphEdges[thisAV.connection].v1 == thisAV.visiting) {
                        thisAV.nextVertex = graphEdges[thisAV.connection].v2;
                    }
                    else if (graphEdges[thisAV.connection].v2 == thisAV.visiting) {
                        thisAV.nextVertex = graphEdges[thisAV.connection].v1;
                    }

                    //check nextVertex against all vertexalready discovered
                    //if discovered skip and incriment by one then go through the for loop again 
                    //if (waypoints[thisAV.nextVertex].prevVertex.hops == -1) {
                        
                        hdxAV.nextAction = "checkUndiscovered";
                    //}
                    //else {
                        //thisAV.nextToCheck++;
                        //hdxAV.nextAction = "forLoopTop"
                    //}
                }
            },
            logMessage: function(thisAV) {
                return "Loop through each vertex in V's adjacency list";
            }
        },
        {
            label: "checkUndiscovered",
            comment: "check if vertex has previously been discovered",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                if (waypoints[thisAV.nextVertex].hops == -1) {

                    waypoints[thisAV.nextVertex].prevVertex = thisAV.visiting;
                    //thisAV.nextToCheck++;
                    hdxAV.nextAction = "callRecursion";
                }
                else{
                    thisAV.nextToCheck++;                    
                    hdxAV.nextAction = "forLoopTop";
                    if (thisAV.stack.length != 0 && thisAV.stack[thisAV.stack.length - 1][1] != thisAV.connection) {
                        updatePolylineAndTable(thisAV.connection,
                        visualSettings.discarded, false);
                    }

                }
                
            },
            logMessage: function(thisAV) {
                return "check if vertex has previously been discovered";
            }
        },
        {
            label: "callRecursion",
            comment: "call recursion with new vertex",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                //thisAV.stack.push(thisAV.nextToCheck);
                thisAV.stack.push([thisAV.nextToCheck, thisAV.connection]);
                thisAV.visiting = thisAV.nextVertex;
                hdxAV.nextAction = "recursiveCallTop"
                
            },
            logMessage: function(thisAV) {
                return "call recursion with new vertex";
            }
        },
        {
            label: "return",
            comment: "return to previous level of recursion",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                thisAV.callStack.remove();

                //color finished edges and vertices added to tree
                updateMarkerAndTable(graphEdges[thisAV.connection].v1,
                    visualSettings.spanningTree, 10, false);
                updateMarkerAndTable(graphEdges[thisAV.connection].v2,
                    visualSettings.spanningTree, 10, false);
                updatePolylineAndTable(thisAV.connection,
                    visualSettings.spanningTree, false);

                //update color for new current vertex
                updateAVControlEntry("visiting", "Visiting vertex " + thisAV.visiting
                    + ": " + waypoints[thisAV.visiting].label);
                updateMarkerAndTable(thisAV.visiting,
                    visualSettings.visiting, 10, false);
                                

                if (thisAV.stack.length == 0 && thisAV.nextToCheck >= waypoints[thisAV.visiting].edgeList.length) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    thisAV.nextToCheck++;
                    hdxAV.nextAction = "forLoopTop";
                }
                
            },
            logMessage: function(thisAV) {
                return "return to previous level of recursion";
            }
        },

        {
            label: "cleanup",
            comment: "cleanup and updates at the end of the visualization",
            code: function (thisAV) {
                updateMarkerAndTable(thisAV.startingVertex,
                    visualSettings.startVertex, 4, false);
                hdxAV.algStat.innerHTML =
                    "Done! Visited " + graphEdges.length + " edges.";
                updateAVControlEntry("visiting", "");
                //updateAVControlEntry("discovered", "");
                //updateAVControlEntry("undiscovered", "");
                hdxAV.nextAction = "DONE";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Cleanup and finalize visualization";
            }
                
        }
    ],

    // format a recursive call entry for addition to the stack table
    addCallToStackTable(vertex, maxLabelLength, precision, count) {
        let newtr = document.createElement("tr");
        let vertexLabelFull;
        let vertexLabel;

        vertexLabelFull = waypoints[vertex].label;
        vertexLabel = shortLabel(vertexLabelFull, maxLabelLength);

        // id to show shortest paths later
        newtr.setAttribute("id", "foundPaths" + count);

        // actual table row to display
        newtr.innerHTML =
            '<td>#' + vertex + ": " + vertexLabel + '</td>';

        this.foundTBody.appendChild(newtr);
        document.getElementById("foundEntriesCount").innerHTML =
            this.numESpanningTree;
    },
    
    updateControlEntries() {
        let numComponents = this.numVSpanningTree - this.numESpanningTree;
        let componentLabel = " Components";
        if (numComponents == 1) componentLabel = " Component";
        updateAVControlEntry("undiscovered", "Undiscovered: " +
                             this.numEUndiscovered + " E, " +
                             this.numVUndiscovered + " V");
        updateAVControlEntry("currentSpanningTree", "Spanning Forest: " +
                             this.numESpanningTree + " E, " + this.numVSpanningTree +
                             " V, " + numComponents + componentLabel);
        updateAVControlEntry("discardedOnRemoval", "Discarded on removal: " +
                             this.numEDiscardedOnRemoval + " E");

    },

    // required prepToStart function
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";
        
        // hide waypoints, show connections
        initWaypointsAndConnections(true, true,
                                    visualSettings.undiscovered);
        
        this.discarded= 0;
        this.callStack= null;
        // last place to come out of the call stack, currently "visiting"
        this.visiting= null;

        // when finding all, track the lists of vertices and edges that are
        // forming the current spanning tree
        this.componentVList= [];
        this.componentEList= [];
        this.componentVAdj= [];

        // some additional stats to maintain and display
        this.numVSpanningTree= 0;
        this.numESpanningTree= 0;
        this.numVUndiscovered= waypoints.length;
        this.numEUndiscovered= graphEdges.length;
        this.numEDiscardedOnRemoval= 0;
        this.totalTreeCost = 0;
                
        this.stack = new HDXLinear(hdxLinearTypes.STACK,
                         "Stack");

        this.callStack = new HDXLinear(hdxLinearTypes.CALL_STACK,
            "Call Stack");
        if (this.hasOwnProperty("comparator")) {
            this.callStack.setComparator(this.comparator);
        }
        this.callStack.setDisplay(getAVControlEntryDocumentElement("discovered"),
            displayCallStackItem);

        // pseudocode
        this.code ='<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">';
        this.code += 'initialize variables</td></tr>';
        this.code += pcEntry(0, "dfs(v)", "recursiveCallTop");
        this.code += pcEntry(1, "v.hops &larr; v.previousVertex.hops + 1", "setHops");
        this.code += pcEntry(1, "for each vertex w in V adjacent to v do", "forLoopTop");
        this.code += pcEntry(2, "if w.hops = 0", "checkUndiscovered");
        this.code += pcEntry(3, "dfs(w)", "callRecursion");
        this.code += pcEntry(1, "return", "return");
        this.code += "</table>";
    },
        
    // set up UI for the start of edge search
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        let newAO =
            buildWaypointSelector("startPoint", "Start Vertex", 0) +
            "<br />";
        //newAO += '</select>';
        hdxAV.algOptions.innerHTML = newAO;
            //+ this.extraAlgOptions;
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("discovered", visualSettings.discovered);
        addEntryToAVControlPanel("currentSpanningTree", visualSettings.spanningTree);
        addEntryToAVControlPanel("discardedOnRemoval", visualSettings.discarded);
        addEntryToAVControlPanel("found", visualSettings.spanningTree);
        let foundEntry = '<span id="foundEntriesCount">0</span>' +
            ' <span id="foundTableLabel">Edges in Minimum Spanning Tree</span>' +
            '<br /><table class="gratable"><thead>' +
            '<tr style="text-align:center"><th>Place</th>' +
            '<th>Hops</th>' +
            '<th>Arrive From</th>' +
            '<th>Via</th></tr>' +
            '</thead><tbody id="foundEntries"></tbody></table>';
        updateAVControlEntry("found", foundEntry);
        this.foundTBody = document.getElementById("foundEntries");
        this.foundLabel = document.getElementById("foundTableLabel");

    },

    // clean up kruskal UI
    cleanupUI() {

    }, 
    
    idOfAction(action){
        return action.label;
    }
};


function displayCallStackItem(item, callStack) {
    let vertexLabel = "";
    let vertexLabelFull = "";

    vertexLabelFull = waypoints[item].label;
    vertexLabel = shortLabel(vertexLabelFull, callStack.maxLabelLength);

    return '<span custom-title="Vertex #' + item + ":" +
        vertexLabelFull + '">' + "dfs (v = " + item + ": " + vertexLabel + ")" + "</span>";
};