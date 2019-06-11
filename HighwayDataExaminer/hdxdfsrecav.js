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
    // last place to come out of the LDV, currently "visiting"
    visiting: 0,
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
        
                thisAV.updateControlEntries();
              
                for(let j = 0; j < waypoints.length; j++) {
                    waypoints[j].hops = 0;
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
                
                updateAVControlEntry("visiting", "Visiting vertex " + thisAV.visiting
                    + ": " + waypoints[thisAV.visiting].label);
                // show on map as visiting color
                updateMarkerAndTable(thisAV.visiting,
                    visualSettings.visiting, 10, false);
                    
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

                //set number of hops to its parent vertex's number of hops + 1
                console.log("prev vertex: " + waypoints[thisAV.visiting].prevVertex);
                //if its the first point set hops to 0
                if (waypoints[thisAV.visiting].prevVertex == -1) {
                    waypoints[thisAV.visiting].hops = 0;
                }
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

                //thisAV.nextToCheck++;
                //if for loop is done for this level of recursion
                console.log("For loop top visiting: " + thisAV.visiting);
                console.log("For loop top nexttocheck: " + thisAV.nextToCheck);


                if (thisAV.nextToCheck == waypoints[thisAV.visiting].edgeList.length) {
                    //reset visiting from prevVertex, nexttocheck from stack,
                    //pop from stack, return
                    thisAV.nextToCheck = thisAV.stack.pop();
                    thisAV.visiting = waypoints[thisAV.visiting].prevVertex;
                    hdxAV.nextAction = "return";
                }
                else {

                    //get the other vertex from the adjacency list
                    console.log(waypoints[thisAV.visiting].edgeList);
                    console.log("trying to access: " + thisAV.nextToCheck);
                    let edge = waypoints[thisAV.visiting].edgeList[thisAV.nextToCheck];
                    thisAV.nextVertex = -1;
                    if (edge.v1 == thisAV.visiting) {
                        thisAV.nextVertex = edge.v2;
                    }
                    else if (edge.v2 == thisAV.visiting) {
                        thisAV.nextVertex = edge.v1;
                    }
                    waypoints[thisAV.nextVertex].prevVertex = thisAV.visiting;
                    console.log("prevVertex of waypoints[" + thisAV.nextVertex + "] is waypoints[" + thisAV.visiting + "]")
                    console.log("nextVertex is: " + thisAV.nextVertex);
                    thisAV.nextToCheck++;
                    hdxAV.nextAction = "checkUndiscovered";
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
                highlightPseudocode(this.label, visualSettings.discarded);

                if (waypoints[thisAV.visiting].hops == 0){
                    hdxAV.nextAction = "callRecursion";
                }
                else{
                    //thisAV.nextToCheck++;
                    hdxAV.nextAction = "forLoopTop";
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
                highlightPseudocode(this.label, visualSettings.discarded);
                thisAV.stack.push(thisAV.nextToCheck);
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
                highlightPseudocode(this.label, visualSettings.discarded);

                if (thisAV.stack.isEmpty){
                    hdxAV.nextAction = "cleanup";
                }
                else {
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
            code: function(thisAV) {
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
        this.numVUndiscovered= waypoints.length;
        this.numEUndiscovered= graphEdges.length;
        this.numEDiscardedOnRemoval= 0;
        this.totalTreeCost = 0;
                
        this.stack = new HDXLinear(hdxLinearTypes.STACK,
                         "Stack");
        
        
        // pseudocode
        this.code ='<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">';
        this.code += '</td></tr>';
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
        newAO += '</select>';
        hdxAV.algOptions.innerHTML = newAO + this.extraAlgOptions;
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("discovered", visualSettings.discovered);
        addEntryToAVControlPanel("currentSpanningTree", visualSettings.spanningTree);
        addEntryToAVControlPanel("discardedOnRemoval", visualSettings.discarded);
        addEntryToAVControlPanel("found", visualSettings.spanningTree);
        let foundEntry = '<span id="foundEntriesCount">0</span>' +
            ' <span id="foundTableLabel">Edges in Minimum Spanning Tree/Forest</span>' +
            '<span id="totalTreeCost"></span>' + '<br />' +
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

    }, 
    
    idOfAction(action){
        return action.label;
    }
};
