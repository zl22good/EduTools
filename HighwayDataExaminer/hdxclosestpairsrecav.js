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
    stack: null,
    callStack: null,
    
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
            comment: "initialize closest pair variables",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                //fill WtoE with sorted vertices by longitude
                
                
                
                
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

                thisAV.callStack.add(thisAV.WtoE);
                hdxAV.nextAction = "checkBaseCase"
            },
            logMessage: function(thisAV) {
                return "Call recursion";
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
        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">WtoE[] &larr; vertices sorted by longitude<br />StoN[] &larr; vertices sorted by latitude</td></tr>';
        this.code += pcEntry(0,'EfficientClosestPair(WtoE, StoN)',"recursiveCallTop");
        this.code += pcEntry(1,'if (WtoE.length <= 3 || recursiveDepth == userLimit)',"checkBaseCase");
        this.code += pcEntry(2,'return min distance found by the brute-force algorithm',"returnBruteForceSolution");
        this.code += pcEntry(1,'else',"");
        this.code += pcEntry(2,'WtoE<sub>left</sub>[] &larr; copy first ⌈n/2⌉ points of WtoE',"");
        this.code += pcEntry(2,'StoN<sub>left</sub>[] &larr; copy same ⌈n/2⌉ points from StoN',"");
        this.code += pcEntry(2,'WtoE<sub>right</sub>[] &larr; copy remaining ⌊n/2⌋ points of WtoE',"");
        this.code += pcEntry(2,'StoN<sub>right</sub>[] &larr; copy remaining ⌈n/2⌉ points from StoN',"");
        this.code += pcEntry(2,'d<sub>left</sub> &larr; EfficientClosestPair(WtoE<sub>left</sub>, StoN<sub>left</sub>)',"");
        this.code += pcEntry(2,'d<sub>right</sub> &larr; EfficientClosestPair(WtoE<sub>right</sub>, StoN<sub>right</sub>)',"");
        this.code += pcEntry(2,'d &larr; min(d<sub>left</sub>, d<sub>right</sub>)',"");
        
        this.WtoE = new Array(waypoints.length);
        this.StoN = new Array(waypoints.length);
        
        },

    // set up UI entries for closest/farthest pairs
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        let newAO = '';
        hdxAV.algOptions.innerHTML = newAO;
        addEntryToAVControlPanel("checkingDistance", visualSettings.visiting);
        
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
    
