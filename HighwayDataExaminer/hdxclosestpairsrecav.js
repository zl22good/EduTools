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
    recursiveIndex: 0,
    stack: null,
    //Stack: null,
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


                thisAV.WtoE = waypoints;
                console.log("len 1");
                console.log(thisAV.WtoE);
                let presort = new HDXPresort();
                thisAV.WtoE = presort.sortedWaypoints;
                console.log(thisAV.WtoE);

                thisAV.Stack = new HDXLinear(hdxLinearTypes.STACK,
                    "Stack");

                thisAV.savedArray = new HDXLinear(hdxLinearTypes.STACK,
                    "Stack");

                thisAV.rec_level_arr = new HDXLinear(hdxLinearTypes.STACK,
                    "Stack");
                thisAV.lineStack = new HDXLinear(hdxLinearTypes.STACK,
                    "Stack");    

                this.StoN = new Array(waypoints);
                console.log(thisAV.StoN);
                thisAV.stack = [];
                //thisAV.savedArray = new Array();
                thisAV.startIndex = 0;
                //thisAV.rec_level_arr= [];
                thisAV.rec_levelL = 0;
                thisAV.rec_levelR= 0;
                thisAV.endIndex = waypoints.length ;
                thisAV.minLeft = 0;
                thisAV.minRight = 0;
                thisAV.midLineLong = 0;
                thisAV.closeToCenter = [];
                thisAV.minHalvesSquared = 0;
                thisAV.forLoopIndex = 0;
                thisAV.whileLoopIndex = 0;
                thisAV.returnValue = 0;
                thisAV.minDist = [9999,0,0]
                thisAV.setMin = false;
                thisAV.currentLine;
                thisAV.southBound = waypoints[0].lat;
                thisAV.northBound = waypoints[0].lat;
                thisAV.Stack.add("cleanup");

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

                //thisAV.Stack.add([thisAV.startIndex, thisAV.endIndex]);
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
                console.log(thisAV.endIndex - thisAV.startIndex);
                console.log("recursion level - " + thisAV.rec_levelL);
                console.log("min pts -  " + thisAV.minPoints);
                console.log("start index " + thisAV.startIndex);
                console.log("end index - " + thisAV.endIndex);

                for (let i = 0  ; i < thisAV.WtoE.length; i++) {
                    updateMarkerAndTable(waypoints.indexOf(thisAV.WtoE[i]),
                        visualSettings.discarded,
                        40, false);
                }
                for (let i = thisAV.startIndex  ; i < thisAV.WtoE.length; i++) {
                    updateMarkerAndTable(waypoints.indexOf(thisAV.WtoE[i]),
                        visualSettings.spanningTree,
                        40, false);
                }
                for (let i = thisAV.startIndex; i < thisAV.endIndex; i++) {
                    updateMarkerAndTable(waypoints.indexOf(thisAV.WtoE[i]),
                        visualSettings.visiting,
                        40, false);
                }
                //if (thisAV.minDist [0] == -1) {
                if (thisAV.setMin == true) {
                    
                
                    updateMarkerAndTable(waypoints.indexOf(thisAV.minDist[1]),
                        visualSettings.discovered,
                        40, false);
                    updateMarkerAndTable(waypoints.indexOf(thisAV.minDist[2]),
                        visualSettings.discovered,
                        40, false);
                }
                if (thisAV.endIndex - thisAV.startIndex <= 3 || thisAV.rec_levelL == thisAV.minPoints) {

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
                if(false){
                let minDistTest = thisAV.computeDistance(thisAV.WtoE[thisAV.startIndex], thisAV.WtoE[thisAV.startIndex + 1]);
                console.log("min " + minDistTest);
                }
                else {

                    if(thisAV.endIndex - thisAV.startIndex == 1){
                        let minDistTest = thisAV.computeDistance(thisAV.WtoE[thisAV.startIndex], thisAV.WtoE[thisAV.endIndex]);
                        console.log("min test2 " + minDistTest);
                        console.log("min " + thisAV.minDist[0]);

                        if (minDistTest < thisAV.minDist[0]) {
                            thisAV.minDist = [minDistTest, thisAV.WtoE[thisAV.startIndex], thisAV.WtoE[thisAV.endIndex]];
                        }
                    }
                    else {
                        for (let i = thisAV.startIndex; i < thisAV.endIndex - 1; i++) {
                            for (let j = i + 1; j < thisAV.endIndex; j++) {
                                let minDistTest = thisAV.computeDistance(thisAV.WtoE[i], thisAV.WtoE[j]);
                                console.log("min test " + minDistTest);
                                console.log("min " + thisAV.minDist[0]);

                                if (minDistTest < thisAV.minDist[0]) {
                                    thisAV.minDist = [minDistTest, thisAV.WtoE[i], thisAV.WtoE[j]];
                                }
                            }
                        }
                    }

                }
                console.log("min " + thisAV.minDist);
                console.log("stack len - " + thisAV.Stack.length);
                hdxAV.nextAction = thisAV.Stack.remove();
                console.log("stack len - " + thisAV.Stack.length == 0);
                if(thisAV.endIndex == thisAV.WtoE.length && thisAV.Stack.isEmpty){
                    console.log("null");                    
                    thisAV.startIndex = Math.ceil(thisAV.WtoE.length/2);
                    //hdxAV.nextAction = hdxAV.nextAction[0];
                }
                console.log("after brute " + hdxAV.nextAction);
                //}
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
                //for( i = 0; i < thisAV.WtoE.length-1; i++) {
                  //  updateMarkerAndTable(i.vIndex,
                    //    visualSettings.visiting, 10, false);
                //}

                thisAV.Stack.add("callRecursionRight");

                thisAV.savedArray.add([Math.ceil(thisAV.startIndex +
                    ((thisAV.endIndex-thisAV.startIndex)/2)) ,thisAV.endIndex]);
                console.log("Saved array - " +  Math.ceil(thisAV.startIndex +
                    ((thisAV.endIndex-thisAV.startIndex)/2)) + " " + thisAV.WtoE.length);
                console.log(typeof thisAV.WtoE);
                thisAV.WtoE = thisAV.WtoE.slice(0,thisAV.WtoE.length);

                thisAV.endIndex = Math.ceil(thisAV.startIndex + ((thisAV.endIndex-thisAV.startIndex)/2));

                console.log(thisAV.WtoE);
                thisAV.rec_levelL++;
                thisAV.rec_level_arr.add(thisAV.rec_levelL);
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
                nums = thisAV.savedArray.remove();
                thisAV.rec_levelL = thisAV.rec_level_arr.remove();
                console.log("test - ");
                console.log(nums);
                thisAV.startIndex = nums[0];
                thisAV.endIndex = nums[1];
                console.log("start - " +  thisAV.startIndex);
                console.log("end - " +  thisAV.endIndex);
                
                
                
                //thisAV.Stack.add("recursiveCallTop");
                //hdxAV.nextAction = "setMinOfHalves"
                
                
                thisAV.Stack.add("setMinOfHalves");
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
                // for (let i = thisAV.startIndex  ; i < thisAV.WtoE.length; i++) {
                //     updateMarkerAndTable(waypoints.indexOf(thisAV.WtoE[i]),
                //         visualSettings.spanningTree,
                //         40, false);
                // }
                // highlightPseudocode(this.label, visualSettings.visiting);
                for (let i = 0  ; i < thisAV.endIndex; i++) {
                    updateMarkerAndTable(waypoints.indexOf(thisAV.WtoE[i]),
                        visualSettings.discarded,
                        40, false);
                }

                updateMarkerAndTable(waypoints.indexOf(thisAV.minDist[1]),
                        visualSettings.discovered,
                        40, false);
                updateMarkerAndTable(waypoints.indexOf(thisAV.minDist[2]),
                        visualSettings.discovered,
                        40, false);
                
                thisAV.setMin = true;
                console.log("draw - " + waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex])]);
                if(thisAV.currentLine != null && false){
                    thisAV.currentLine = thisAV.lineStack.remove();
                    thisAV.removeLineVisiting(thisAV.currentLine);
                    thisAV.currentLine = thisAV.lineStack.remove();
                    thisAV.removeLineVisiting(thisAV.currentLine);
                    
                    
            }
                thisAV.currentLine = thisAV.drawLineVisiting(waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex - 1])],
                waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex])]);


                //DRAW YELLOW LINE
                thisAV.lineStack.add(thisAV.currentLine);



               
                // hdxAV.nextAction = "recursiveCallTop";
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

                thisAV.currentLine = thisAV.lineStack.remove();
                thisAV.removeLineVisiting(thisAV.currentLine);
                
                leftDot = thisAV.waypoints[1];
                rightDot = thisAV.waypoints[1];
                console.log("left lon - " +(parseFloat(waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex - 1])].lon) +
                parseFloat(waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex])].lon))/2);
                console.log("way - " + waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex - 1])].lon);
                leftDot.lon = ((parseFloat(waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex - 1])].lon) +
                parseFloat(waypoints[waypoints.indexOf(thisAV.WtoE[thisAV.startIndex])].lon))/2) 
                + parseFloat(thisAV.minDist);
                console.log("left lon - " + leftDot.lon);
                leftDot.lat = 0;
                thisAV.currentLine = thisAV.drawLineVisiting(leftDot,leftDot);
                thisAV.lineStack.add(thisAV.currentLine);

                rightDot.lon = leftDot.lon - (2 * parseFloat(thisAV.minDist));
               
                thisAV.currentLine = thisAV.drawLineVisiting(rightDot,rightDot);
                thisAV.lineStack.add(thisAV.currentLine);

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
                console.log("stack len - " + thisAV.Stack.length);
                thisAV.currentLine = thisAV.lineStack.remove();
                thisAV.removeLineVisiting(thisAV.currentLine);
                thisAV.currentLine = thisAV.lineStack.remove();
                thisAV.removeLineVisiting(thisAV.currentLine);
                if (thisAV.Stack.length == 0){
                    hdxAV.nextAction = cleanup;
                }
                else {
                    hdxAV.nextAction = thisAV.Stack.remove();
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
                console.log("end");
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
    drawLineVisiting(v1, v2) {

        let visitingLine = [];
        let lonLine = (parseFloat(v2.lon) + parseFloat(v1.lon)) / 2;
        console.log("line count - " + this.lineCount);
        visitingLine[0] = [90, lonLine];
        visitingLine[1] = [-90, lonLine];

        if (this.lineCount % 3 == 0) {
        this.lineVisiting = L.polyline(visitingLine, {
            color: visualSettings.visiting.color,
            opacity: 0.6,
            weight: 4
        });
    }
    else{
        this.lineVisiting = L.polyline(visitingLine, {
            color: visualSettings.discovered.color,
            opacity: 0.6,
            weight: 4
        });
    }
        //thisAV.lineStack.add(this.lineVisiting);
        this.lineVisiting.addTo(map);  
        this.lineCount ++; 
        return this.lineVisiting
    },
    
    computeDistance(v1, v2) {
        return Math.sqrt(Math.pow(v1.lat - v2.lat, 2) + Math.pow(v1.lon - v2.lon, 2));
    },
    
    // function to remove the visiting polyline
    removeLineVisiting(l1) {

        l1.remove();
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
        let lineCount = 0;

        //reorder waypoints
        console.log(waypoints);
        let presort = new HDXPresort();
        this.originalWaypoints = waypoints;
        this.waypoints = presort.sortedWaypoints;
        hdxClosestPairsRecAV.WtoE = this.waypoints;
        console.log(this.waypoints);
        updateMap();

        // show waypoints, hide connections
        initWaypointsAndConnections(true, false,
                                    visualSettings.undiscovered);

        this.Stack = new HDXLinear(hdxLinearTypes.STACK,
            "Stack");this.Stack = new HDXLinear(hdxLinearTypes.STACK,
            "Stack");

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
    
