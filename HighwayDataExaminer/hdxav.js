//
// HDX General Algorithm Visualization Support
//
// METAL Project
//
// Primary Author: Jim Teresco
//

// group of variables used by many or all algorithm visualizations
var hdxAV = {
    // current state of HDX
    status: hdxStates.NO_DATA,

    // delay (in ms) between visualization steps
    // default delay 50 should match the selected option in the speedChanger
    // and delay should be used for the amount of time in the future to use
    // for setTimeout calls
    delay: 50,

    // list of available AVs
    avList: [],
    
    // remember the currently-selected AV
    currentAV: null,
    
    // are we tracing at the action level rather than the iteration level
    traceActions: true,

    // track the end of an iteration defined by a series of actions
    iterationDone: false,

    // next action to be executed, must refer to labels in the current
    // AV's avActions array, set to the first before initial call
    // to nextStep, and each algorithm must set to "DONE" to
    // terminate
    nextAction: "UNDEFINED",
    
    // for pseudocode highlighting, id of element to unhighlight
    previousHighlight: null,

    // for counting pseudocode executions
    execCounts: [],
    maxExecCount: 0,
    execCountsRecolor: false,
    
    // some commonly-used document elements
    algStat: null,
    algOptions: null,
    startPause: null,

    logMessageArr: [],
    
    // set the status and do any needed cleanup for that change
    setStatus(newStatus) {
        
        if (this.status == newStatus) {
            return;
        }

        this.status = newStatus;
        switch (newStatus) {
        case hdxStates.GRAPH_LOADED:
        case hdxStates.WPT_LOADED:
        case hdxStates.PTH_LOADED:
        case hdxStates.NMP_LOADED:
        case hdxStates.WPL_LOADED:
            this.algStat.innerHTML = "";
            this.algOptions.innerHTML = "";
            break;

        case hdxStates.AV_COMPLETE:
            this.startPause.disabled = true;
            this.startPause.innerHTML = "Start";
            break;
        default:
            // other AV in progress states
            this.startPause.disabled = false;
            break;
        }
        //this is after the list of pseudo-code populates on screen with
        //the start button
    },
    
    // are we paused or otherwise not running?
    paused() {
        return this.status != hdxStates.AV_RUNNING;
    },

    // all setup that needs to happen on page load for HDX
    initOnLoad() {
        // populate the list of algorithms -- add new entries here
        this.avList.push(hdxNoAV);
        this.avList.push(hdxVertexExtremesSearchAV);
        this.avList.push(hdxEdgeExtremesSearchAV);
        this.avList.push(hdxExtremePairsAV);
        this.avList.push(hdxGraphTraversalsAV);
        this.avList.push(hdxDijkstraAV);
        this.avList.push(hdxPrimAV);
        this.avList.push(hdxBFConvexHullAV);
        this.avList.push(hdxDegreeAV);
        
        // populate the algorithm selection select with options
        // from the avList
        let s = document.getElementById("AlgorithmSelection");
        s.innerHTML = "";
        for (var i = 0; i < this.avList.length; i++) {
            let av = this.avList[i];
            s.innerHTML += '<option value="' + av.value +
                '">' + av.name + '</option>';
        }

        // set up some references to commonly-used document elements

        // the algorithm status message bar on the algorithm
        // visualization information panel
        this.algStat = document.getElementById("algorithmStatus");

        this.algOptions = document.getElementById("algorithmOptions");
        this.startPause = document.getElementById("startPauseButton");

        // register the HDX-specific event handler for waypoint clicks
        registerMarkerClickListener(labelClickHDX);
    },

    // this will do an action, an iteration, or run to completion
    // for the AV passed in
    nextStep(thisAV) {

        // if the simulation is paused, we can do nothing, as this function
        // will be called again when we restart
        if (hdxAV.paused()) {
            return;
        }

        // run to completion option
        if (hdxAV.delay == 0) {
            while (hdxAV.nextAction != "DONE") {
                hdxAV.oneIteration(thisAV);
            }
            hdxAV.avDone();
            return;
        }

        // if delay has become -1, it means we took a single step and
        // should pause now rather than perform more work
        if (hdxAV.delay == -1) {
            hdxAV.setStatus(hdxStates.AV_PAUSED);
        }

        // we are supposed to do some work, either a single action or
        // a full iteration
        if (hdxAV.traceActions) {
            hdxAV.oneAction(thisAV);
        }
        else {
            //console.log("nextStep() calling oneIteration()");
            hdxAV.oneIteration(thisAV);
        }

        // in either case, we now set the timeout for the next one
        if (hdxAV.nextAction != "DONE") {
            //console.log("nextStep(): setting callback for " + hdxAV.delay);
            setTimeout(function() { hdxAV.nextStep(thisAV) }, hdxAV.delay);
        }
        else {
            hdxAV.avDone();
        }
    },

    // one iteration is defined as a series of actions ending with
    // one which sets hdxAV.iterationDone to true
    oneIteration(thisAV) {

        //console.log("oneIteration()");
        hdxAV.iterationDone = false;
        while (!hdxAV.iterationDone) {
            //console.log("oneIteration() calling oneAction(), nextAction=" + this.nextAction);
            hdxAV.oneAction(thisAV);
        }
    },

    // do one action of thisAV's array of actions
    oneAction(thisAV) {
        // look up the action to execute next
        let currentAction = null;
        for (var i = 0; i < thisAV.avActions.length; i++) {
            if (hdxAV.nextAction == thisAV.avActions[i].label) {
                currentAction = thisAV.avActions[i];
                break;
            }
        }
        if (currentAction == null) {
            alert("HDX Internal error: bad AV action: " + hdxAV.nextAction);
            hdxAV.setStatus(hdxStates.AV_PAUSED);
        }

        // we have an action to execute
        
        //if breakpoint is the action, pause
        //then, if useVariable = true compare the special break instance to
        //determine if you have to pause else just pause
        if(thisAV.idOfAction(currentAction) == breakpoint)
            {
                if(useVariable == true)
                    {
                        let variable = "";
                        let counter = 0;
                        let length = document.getElementsByName("quantity").length;
                        do{
                            try {
                                variable = document.getElementsByName("quantity")[counter].value;
                                counter++;
                            }
                            catch(error){
                                counter++;
                            }
                        }
                        while(variable == "" && counter <= length)

                        if(variable == "")
                        {
                            variable = -1;
                        }
                        
                        hdxAV.determineBreakOrContinue(variable,currentAction.currentVariable(thisAV));

                    }
                else{
                    hdxAV.setStatus(hdxStates.AV_PAUSED);
                    hdxAV.startPause.innerHTML = "Resume";
                }    
            }
        
        
        // undo any previous highlighting
        unhighlightPseudocode();
        //console.log("ACTION: " + hdxAV.nextAction);
        
        // execute the JS to continue the AV
        currentAction.code(thisAV);

        // update status to this line of code's logMessage, after
        // code executes so any simulation variables updated through
        // this step can be reflected in the update
        // this also creates a past log message that appears when you
        // hover over the current action, this shows the last 5 messages
        //hdxAV.algStat.innerHTML = currentAction.logMessage(thisAV);

        hdxAV.logMessageArr.push(currentAction.logMessage(thisAV));
        if(hdxAV.logMessageArr.length == 8)
        {
             hdxAV.logMessageArr.splice(0, 1);
        }
        ans = '<span custom-title="Past Logs -  ';
        for(let j = 2; j <7; j++){
         if(hdxAV.logMessageArr.length > (j))
         {
            ans += '<br>' + (j-1) + " - " + hdxAV.logMessageArr[hdxAV.logMessageArr.length-j];

         }
    
     }    
        ans += '">' + hdxAV.logMessageArr[hdxAV.logMessageArr.length-1] + '</span>';
        hdxAV.algStat.innerHTML =  ans;
        if(hdxAV.delay != 0)
        {
            customTitle();
        }
        
        //console.log("ACTION DONE: " + currentAction.logMessage(thisAV));
    },

    // housekeeping to do when an algorithm is complete
    avDone() {
        // if pseudocode is displayed, undisplay at the end to ensure
        // better visibility for results
        document.getElementById("pseudoCheckbox").checked = false;
        document.getElementById("pseudoText").style.display = "none";
            
        hdxAV.setStatus(hdxStates.AV_COMPLETE);
        customTitle();
        cleanupBreakpoints();
            
    },
    
    // compute a color code to highlight based on code execution frequency
    // light blue is infrequent, pink is frequent
    execCountColor(count) {
        let rank = 75 * count/hdxAV.maxExecCount;
        let r = 180 + rank;
        let b = 255 - rank;
        return "rgb(" + r + ",210, " + b + ")";
    },
    
    determineBreakOrContinue(selectedStop, currentPoints){
        let checker;
        let selection;
        let howToDeal = "Number";
        if(currentPoints.constructor === String){
            selection = selectedStop;
            checker = currentPoints;
            howToDeal = "String";
        }
        else if(currentPoints.constructor === Number){
            selection = selectedStop;
            checker = currentPoints;
            howToDeal = "Number";
        }
        else{
            console.log("Something went wrong with currentPoints native type!");      
        }
        
        if(howToDeal == "String"){
            
        }
        else if(howToDeal == "Number"){
            try
            {
                if(selection == checker)
                    {
                        hdxAV.setStatus(hdxStates.AV_PAUSED);
                        hdxAV.startPause.innerHTML = "Resume";
                    }
            }
            catch(error)
            {
                console.log("useVariable has encountered errors parsing breakpointText innerHTML " + variable);    
            }
        }
    }
};

