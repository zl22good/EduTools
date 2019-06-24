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

    originalWaypoints: null,
    //vertices sorted by longitude
    //WtoE: null,
    //vertices sorted by latitude
    //StoN: null,
    
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

                thisAV.minPoints =
                    document.getElementById("minPoints").value;
                //this.WtoE = new Array(waypoints.length);
                //this.StoN = new Array(waypoints.length);
        
                
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
        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">WtoE[] &larr; vertices sorted by longitude</td></tr>';
        this.code += pcEntry(0,'ClosestPair(WtoE) //length = n',"recursiveCallTop");
        this.code += pcEntry(1,'if (WtoE.length <= 3 || recursiveDepth == userLimit)',"checkBaseCase");
        this.code += pcEntry(2,'return brute force min distance',"returnBruteForceSolution");
        this.code += pcEntry(1,'else',"");
        this.code += pcEntry(2,'min<sub>left</sub> &larr; ClosestPair(WtoE[0, (n/2)-1])',"");
        this.code += pcEntry(2,'min<sub>right</sub> &larr; ClosestPair(WtoE[n/2, n-1])',"");
        this.code += pcEntry(2,'min<sub>halves</sub> &larr; min(min<sub>left</sub>, min<sub>right</sub>)',"");
        this.code += pcEntry(2,'mid &larr; WtoE[n/2].longitude',"");
        this.code += pcEntry(2,'closeToCenter[] &larr; all points which |longitude − mid| < min<sub>halves</sub>',"");
        this.code += pcEntry(2,'min<sub>halves</sub>Sq &larr; min<sub>halves</sub><sup>2</sup>',"");


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
    
