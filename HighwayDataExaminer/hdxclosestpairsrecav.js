//
// HDX Recursive Divide and Conquer Closest Pairs AV
//
// METAL Project
//
// Primary Author: Jim Teresco, Alissa Ronca, Zac Goodsell
//

/* closest/farthest pairs of vertices, just brute force for now */
var hdxClosestPairsRecAV = {

    // entries for list of AVs
    value: "closestpairs-recursive",
    name: "Vertex Closest Pairs Recursive",
    description: "Search for the closest pair of vertices (waypoints) using recursive divide and conquer.",
    
    // state variables for closest pairs search
    minPoints: 3,
    recursiveIndex: 0,   stack: null,
    callStack: null,
    startIndex: 0,
    endIndex: 0,
    minLeft: 0,
    minRight: 0,
    midLineLong: 0,
    closeToCenter: null,
    minHalvesSquared: 0,
    forLoopIndex: 0,
    whileLoopIndex: 0,
    returnValue: 0,

    originalWaypoints: null,
    //vertices sorted by longitude
    WtoE: null,
    //vertices sorted by latitude
    StoN: null,
    
    //used for shading
    northBound: 0,
    southBound: 0,

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
    
    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "Initialize closest pair variables",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                thisAV.minPoints =
                    document.getElementById("minPoints").value;

                function mySorterLat(a, b) {
                    var x = parseInt(a.waypoint.latitude);
                    var y = parseInt(b.waypoint.latitude);
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                }
                thisAV.WtoE = new Array(waypoints);
                thisAV.WtoE.sort((mySorterLat));
                console.log(this.WtoE);

                function mySorterLon(a, b) {
                    var y = a.waypoint.longitude;
                    var x = b.waypoint.longitude;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                }
                this.StoN = new Array(waypoints);
                this.StoN.sort(mySorterLon);
                console.log(this.StoN);
                thisAV.stack = [];
                thisAV.savedArray = [];
                thisAV.startIndex = 0;
                thisAV.rec_level_arr= [];
                thisAV.rec_level = 0;
                thisAV.endIndex = waypoints.length - 1;
                thisAV.minLeft = 0;
                thisAV.minRight = 0;
                thisAV.midLineLong = 0;
                thisAV.closeToCenter = [];
                thisAV.minHalvesSquared = 0;
                thisAV.forLoopIndex = 0;
                thisAV.whileLoopIndex = 0;
                thisAV.returnValue = 0;
                
                thisAV.southBound = waypoints[0].lat;
                thisAV.northBound = waypoints[0].lat;
                for (let i = 1; i < waypoints.length; i++) {
                    // keep track of northmost and southmost points
                    thisAV.southBound = Math.min(waypoints[i].lat, thisAV.southBound);
                    thisAV.northBound = Math.max(waypoints[i].lat, thisAV.northBound);
                }
                
                
                
                hdxAV.nextAction = "recursiveCallTop"
            },
            logMessage: function(thisAV) {
                return "Initializing closest pair variables";
            }
        },
        {
            label: "recursiveCallTop",
            comment: "Call recursion",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                //thisAV.callStack.add([thisAV.startIndex, thisAV.endIndex]);
                hdxAV.nextAction = "checkBaseCase"
            },
            logMessage: function(thisAV) {
                return "Call recursion";
            }
        },
        {
            label: "checkBaseCase",
            comment: "Check if base case is reached",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                console.log(thisAV.WtoE);
                if (thisAV.WtoE.length <= 3 || thisAV.rec_level == minPoints) {
                    hdxAV.nextAction = "returnBruteForceSolution";
                }
                else {
                    hdxAV.nextAction = "callRecursionLeft";
                }
            },
            logMessage: function(thisAV) {
                return "Check whether minimum number of points has been reached";
            }
        },
        {
            label: "returnBruteForceSolution",
            comment: "Return brute force Solution",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                let minDistance = computeDistance(waypoints[thisAV.startIndex], waypoints[thisAV.startIndex + 1]);
                for (let i = thisAV.startIndex; i <= thisAV.endIndex; i++){
                    
                }
                
                hdxAV.nextAction = thisAV.callStack.pop();
            },
            logMessage: function(thisAV) {
                return "Return brute force solution for this section";
            }
        },
        {
            label: "callRecursionLeft",
            comment: "Call recursion on left half of points",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                thisAV.callStack.add("callRecursionRight");
                thisAV.savedArray.push(thisAV.WtoE.slice(thisAV.WtoE.length/2-1,thisAV.WtoE.length));
                thisAV.WtoE = thisAV.WtoE.slice(0,thisAV.WtoE.length)
                thisAV.rec_level_arr.push(thisAV.rec_level);
                thisAV.rec_level++;
                hdxAV.nextAction = "recursiveCallTop"
            },
            logMessage: function(thisAV) {
                return "Call recursion on left half of points";
            }
        },
        {
            label: "callRecursionRight",
            comment: "Call recursion on right half of points",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                thisAV.callStack.add("setMinOfHalves");
                hdxAV.nextAction = "recursiveCallTop"
            },
            logMessage: function(thisAV) {
                return "Call recursion on right half of points";
            }
        },
        {
            label: "setMinOfHalves",
            comment: "Find smaller of minimum distances from the two halves",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "setMiddlePoint"
            },
            logMessage: function(thisAV) {
                return "Find smaller of minimum distances from the two halves";
            }
        },
        {
            label: "setMiddlePoint",
            comment: "Find longitude of middle point",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "setPointsToCheck"
            },
            logMessage: function(thisAV) {
                return "Get longitude of middle point that divides map in half";
            }
        },
        {
            label: "setPointsToCheck",
            comment: "Find points closer to middle line than min distance",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                //sort by latitude
                hdxAV.nextAction = "squareMinOfHalves"
            },
            logMessage: function(thisAV) {
                return "Find points closer to middle line than min distance";
            }
        },
        {
            label: "squareMinOfHalves",
            comment: "Square min of halves",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "forLoopTop"
            },
            logMessage: function(thisAV) {
                return "Square min found from halves";
            }
        },
        {
            label: "forLoopTop",
            comment: "Loop through vertices in closeToCenter",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "updateWhileLoopIndex"
            },
            logMessage: function(thisAV) {
                return "Loop through vertices in closeToCenter";
            }
        },
        {
            label: "updateWhileLoopIndex",
            comment: "Set index for while loop",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "whileLoopTop"
            },
            logMessage: function(thisAV) {
                return "Set index for while loop";
            }
        },
        {
            label: "whileLoopTop",
            comment: "Loop through points to check if closer than min distance",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "updateMinPairFound"
            },
            logMessage: function(thisAV) {
                return "Loop through points to check if closer than min distance";
            }
        },
        {
            label: "updateMinPairFound",
            comment: "Update new minimum distance found",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "incrementWhileLoopIndex"
            },
            logMessage: function(thisAV) {
                return "Update new minimum distance found between points";
            }
        },
        {
            label: "incrementWhileLoopIndex",
            comment: "Increment while loop index",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                hdxAV.nextAction = "return"
            },
            logMessage: function(thisAV) {
                return "Increment while loop index";
            }
        },
        {
            label: "return",
            comment: "Return min distance between points",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                
                if (thisAV.callStack.length == 0){
                    hdxAV.nextAction = cleanup;
                }
                else {
                    hdxAV.nextAction = thisAV.callStack.pop();
                }
            },
            logMessage: function(thisAV) {
                return "Return minimum distance between closest pairs";
            }
        },

        //recursiveCallTop checkBaseCase returnBruteForceSolution
        // callRecursionLeft callRecursionRight setMinOfHalves setMiddlePoint
        // setPointsToCheck squareMinOfHalves forLoopTop updateWhileLoopIndex
        // whileLoopTop updateMinPairFound incrementWhileLoopIndex return




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
            label: "cleanup",
            comment: "cleanup and updates at the end of the visualization",
            code: function(thisAV) {

                
                //updateAVControlEntry("v1visiting", "");
                //updateAVControlEntry("v2visiting", "");
                //updateAVControlEntry("checkingDistance", "");
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
    
    computeDistance(v1, v2) {
        return Math.sqrt(Math.pow(v1.lat - v2.lat, 2) + Math.pow(v1.lon - v2.lon, 2));
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

        //reorder waypoints
        console.log(waypoints);
        let presort = new HDXPresort();
        this.originalWaypoints = waypoints;
        waypoints = presort.sortedWaypoints;
        console.log(waypoints);
        updateMap();

        // show waypoints, hide connections
        initWaypointsAndConnections(true, false,
                                    visualSettings.undiscovered);

        this.callStack = new HDXLinear(hdxLinearTypes.CALL_STACK,
            "Call Stack");

        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">WtoE[] &larr; vertices sorted by longitude</td></tr>';
        this.code += pcEntry(0,'ClosestPair(WtoE) //length = n',"recursiveCallTop");
        this.code += pcEntry(1,'if (WtoE.length <= 3 || recursiveDepth == userLimit)',"checkBaseCase");
        this.code += pcEntry(2,'return brute force min distance',"returnBruteForceSolution");
        this.code += pcEntry(1,'else',"");
        this.code += pcEntry(2,'min<sub>left</sub> &larr; ClosestPair(WtoE[0, (n/2)-1])',"callRecursionLeft");
        this.code += pcEntry(2,'min<sub>right</sub> &larr; ClosestPair(WtoE[n/2, n-1])',"callRecursionRight");
        this.code += pcEntry(2,'min<sub>halves</sub> &larr; min(min<sub>left</sub>, min<sub>right</sub>)',"setMinOfHalves");
        this.code += pcEntry(2,'mid &larr; WtoE[n/2].long',"setMiddlePoint");
        this.code += pcEntry(2,'closeToCenter[] &larr; all points which |longitude − mid| < min<sub>halves</sub>',"setPointsToCheck");
        this.code += pcEntry(2,'minSq &larr; min<sub>halves</sub><sup>2</sup>',"squareMinOfHalves");
        this.code += pcEntry(2,'for i &larr; 0 to closeToCenter.length - 2 do',"forLoopTop");
        this.code += pcEntry(3,'k &larr; i + 1',"updateWhileLoopIndex");
        this.code += pcEntry(3,'while (k <= closeToCenter.length - 1 and (closeToCenter[k].lat - closeToCenter[i].lat)<sup>2</sup> < minSq)',"whileLoopTop");
        this.code += pcEntry(4,'minSq &larr; min((closeToCenter[k].long - closeToCenter[i].long)<sup>2</sup> + (closeToCenter[k].lat - closeToCenter[i].lat)<sup>2</sup>, minSq)',"updateMinPairFound");
        this.code += pcEntry(4,'k &larr; k + 1',"incrementWhileLoopIndex");
        this.code += pcEntry(2,'return sqrt(minSq)',"return");

    },

    // set up UI entries for closest/farthest pairs
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        let newAO = 'Number of points to stop on <input type="number" id="minPoints" min="3" max="' 
        + (waypoints.length - 1)/2 + '" value="3">';
        hdxAV.algOptions.innerHTML = newAO;
        addEntryToAVControlPanel("checkingDistance", visualSettings.visiting);
        
    },
        
        
    // remove UI modifications made for vertex closest/farthest pairs
    cleanupUI() {
        waypoints = this.originalWaypoints;
        updateMap();
    },
    
    idOfAction(action){
            return action.label;
    },
    
    setConditionalBreakpoints(name){
        let max = waypoints.length-1;
        let temp = commonConditionalBreakpoints(name);
        if(temp != "No innerHTML"){
            return temp;
        }
        else{
            switch(name){
                    
            }
        }
        return "No innerHTML";
    },

    hasConditonalBreakpoints(name){
        let answer = hasCommonConditonalBreakpoints(name);
        if(answer == true){
            return true;
        }
        else{
            switch(name){
                    
            }
        }
        return false;
    }
};
    
